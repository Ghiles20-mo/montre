"use server";

import { createHash, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/session";
import { db } from "@/lib/supabase";

export type LoginState = { error?: string };

const slowDown = () => new Promise((r) => setTimeout(r, 800));

export async function employeeLogin(_: LoginState, formData: FormData): Promise<LoginState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { error: "Entrez votre code d'accès" };

  const { data } = await db()
    .from("employees")
    .select("id, first_name, last_name, active")
    .eq("access_code", code)
    .maybeSingle();

  if (!data?.active) {
    await slowDown();
    return { error: "Code invalide" };
  }
  await createSession({ role: "employee", sub: data.id, name: `${data.first_name} ${data.last_name}` });
  redirect("/employe");
}

const sha = (s: string) => createHash("sha256").update(s).digest();

export async function adminLogin(_: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !timingSafeEqual(sha(password), sha(expected))) {
    await slowDown();
    return { error: "Mot de passe incorrect" };
  }
  await createSession({ role: "admin", sub: "admin", name: "Administrateur" });
  redirect("/admin");
}
