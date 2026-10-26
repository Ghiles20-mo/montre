import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { db } from "./supabase";

export async function requireAdmin() {
  const session = await getSession();
  if (session?.role !== "admin") redirect("/admin/login");
  return session;
}

// Employé actif ou admin. Les droits sont relus en base à chaque requête :
// un employé désactivé est déconnecté et un changement de droits s'applique tout de suite.
export async function requireStaff() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "admin") return { ...session, canEdit: true };

  const { data } = await db()
    .from("employees")
    .select("active, can_edit")
    .eq("id", session.sub)
    .maybeSingle();
  if (!data?.active) redirect("/logout");
  return { ...session, canEdit: data.can_edit as boolean };
}

// Admin, ou employé ayant le droit de modification.
export async function requireEditor() {
  const staff = await requireStaff();
  if (!staff.canEdit) throw new Error("Accès en lecture seule");
  return staff;
}
