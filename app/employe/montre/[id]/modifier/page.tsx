import { notFound, redirect } from "next/navigation";
import WatchForm from "@/app/admin/(panel)/WatchForm";
import { requireStaff } from "@/lib/auth";
import { Watch } from "@/lib/format";
import { db } from "@/lib/supabase";

export default async function EmployeeEditWatch({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { canEdit } = await requireStaff();
  if (!canEdit) redirect(`/employe/montre/${id}`);

  const { data } = await db().from("watches").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <WatchForm watch={data as Watch} redirectTo="/employe/montre/{id}" />;
}
