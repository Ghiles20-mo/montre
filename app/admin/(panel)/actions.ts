"use server";

import { randomInt, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireEditor } from "@/lib/auth";
import { BUCKET } from "@/lib/format";
import { db } from "@/lib/supabase";

type Result = { ok: true } | { error: string };

function parsePrice(v: unknown): number | null {
  const n = Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

function refreshAll() {
  revalidatePath("/", "layout");
}

async function removePhoto(path: string | null | undefined) {
  if (path) await db().storage.from(BUCKET).remove([path]);
}

/* ---------- Montres ---------- */
// Création, suppression et import : admin uniquement.
// Modification d'une montre existante (infos, prix, stock, photo) : admin ou employé autorisé.

export async function saveWatch(formData: FormData): Promise<Result> {
  const id = String(formData.get("id") ?? "") || null;
  if (id) await requireEditor();
  else await requireAdmin();
  const reference = String(formData.get("reference") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = parsePrice(formData.get("price"));
  if (!reference || !name) return { error: "La référence et le nom sont obligatoires" };
  if (price === null) return { error: "Prix invalide" };

  const row: Record<string, unknown> = {
    reference,
    name,
    brand: String(formData.get("brand") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    price,
    in_stock: formData.get("in_stock") === "on",
  };
  const newPhoto = String(formData.get("photo_path") ?? "") || null;
  if (newPhoto) row.photo_path = newPhoto;

  const supabase = db();
  let oldPhoto: string | null = null;
  if (id && newPhoto) {
    const { data } = await supabase.from("watches").select("photo_path").eq("id", id).single();
    oldPhoto = data?.photo_path ?? null;
  }

  const { error } = id
    ? await supabase.from("watches").update(row).eq("id", id)
    : await supabase.from("watches").insert(row);
  if (error) return { error: error.code === "23505" ? "Cette référence existe déjà" : error.message };

  if (oldPhoto && oldPhoto !== newPhoto) await removePhoto(oldPhoto);
  refreshAll();
  return { ok: true };
}

export async function toggleStock(formData: FormData) {
  await requireEditor();
  await db()
    .from("watches")
    .update({ in_stock: formData.get("in_stock") !== "true" })
    .eq("id", String(formData.get("id")));
  refreshAll();
}

export async function deleteWatch(formData: FormData) {
  await requireAdmin();
  const supabase = db();
  const { data } = await supabase
    .from("watches")
    .delete()
    .eq("id", String(formData.get("id")))
    .select("photo_path")
    .maybeSingle();
  await removePhoto(data?.photo_path);
  refreshAll();
}

/* ---------- Photos ---------- */

export async function createPhotoUpload(
  ext: string,
): Promise<{ path: string; token: string } | { error: string }> {
  await requireEditor();
  const safeExt = /^(jpe?g|png|webp|gif|avif)$/i.test(ext) ? ext.toLowerCase() : "jpg";
  const { data, error } = await db()
    .storage.from(BUCKET)
    .createSignedUploadUrl(`${randomUUID()}.${safeExt}`);
  if (error || !data) return { error: error?.message ?? "Impossible de préparer l'envoi" };
  return { path: data.path, token: data.token };
}

export async function setWatchPhoto(id: string, path: string): Promise<Result> {
  await requireEditor();
  const supabase = db();
  const { data: old } = await supabase.from("watches").select("photo_path").eq("id", id).single();
  const { error } = await supabase.from("watches").update({ photo_path: path }).eq("id", id);
  if (error) return { error: error.message };
  if (old?.photo_path && old.photo_path !== path) await removePhoto(old.photo_path);
  refreshAll();
  return { ok: true };
}

/* ---------- Import Excel ---------- */

export type ImportRow = {
  reference: string;
  name: string;
  price: number;
  brand?: string | null;
  description?: string | null;
  in_stock?: boolean;
};

export async function importWatches(rows: ImportRow[]): Promise<{ count: number } | { error: string }> {
  await requireAdmin();
  if (rows.length === 0) return { count: 0 };
  if (rows.length > 1000) return { error: "1000 lignes maximum par envoi" };

  // Toutes les lignes doivent avoir les mêmes colonnes, sinon PostgREST mettrait NULL.
  const keys = Object.keys(rows[0]) as (keyof ImportRow)[];
  const clean = new Map<string, Record<string, unknown>>();
  for (const r of rows) {
    const reference = String(r.reference ?? "").trim();
    const name = String(r.name ?? "").trim();
    const price = parsePrice(r.price);
    if (!reference || !name || price === null) continue;
    const row: Record<string, unknown> = {};
    for (const k of keys) row[k] = r[k] ?? null;
    Object.assign(row, { reference, name, price });
    if ("in_stock" in row) row.in_stock = row.in_stock !== false;
    clean.set(reference, row); // dernière occurrence gagne
  }

  const { error } = await db().from("watches").upsert([...clean.values()], { onConflict: "reference" });
  if (error) return { error: error.message };
  refreshAll();
  return { count: clean.size };
}

/* ---------- Employés ---------- */

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O, 1/I

function generateCode() {
  return Array.from({ length: 8 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");
}

export async function createEmployee(formData: FormData) {
  await requireAdmin();
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  if (!first_name || !last_name) return;
  for (let i = 0; i < 5; i++) {
    const { error } = await db()
      .from("employees")
      .insert({ first_name, last_name, access_code: generateCode() });
    if (!error || error.code !== "23505") break;
  }
  refreshAll();
}

export async function regenerateCode(formData: FormData) {
  await requireAdmin();
  await db()
    .from("employees")
    .update({ access_code: generateCode() })
    .eq("id", String(formData.get("id")));
  refreshAll();
}

export async function toggleEmployee(formData: FormData) {
  await requireAdmin();
  await db()
    .from("employees")
    .update({ active: formData.get("active") !== "true" })
    .eq("id", String(formData.get("id")));
  refreshAll();
}

export async function toggleEmployeeEdit(formData: FormData) {
  await requireAdmin();
  await db()
    .from("employees")
    .update({ can_edit: formData.get("can_edit") !== "true" })
    .eq("id", String(formData.get("id")));
  refreshAll();
}

export async function deleteEmployee(formData: FormData) {
  await requireAdmin();
  await db().from("employees").delete().eq("id", String(formData.get("id")));
  refreshAll();
}
