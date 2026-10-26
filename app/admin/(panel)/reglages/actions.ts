"use server";

import { setAdminPassword, verifyAdminPassword } from "@/lib/adminPassword";
import { requireAdmin } from "@/lib/auth";

export type PasswordState = { error?: string; ok?: boolean };

export async function changeAdminPassword(_: PasswordState, formData: FormData): Promise<PasswordState> {
  await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!(await verifyAdminPassword(current))) return { error: "Mot de passe actuel incorrect" };
  if (next.length < 8) return { error: "Le nouveau mot de passe doit faire au moins 8 caractères" };
  if (next !== confirm) return { error: "Les deux mots de passe ne correspondent pas" };

  await setAdminPassword(next);
  return { ok: true };
}
