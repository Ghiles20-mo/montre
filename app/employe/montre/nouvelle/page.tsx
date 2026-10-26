import { redirect } from "next/navigation";
import WatchForm from "@/app/admin/(panel)/WatchForm";
import { requireStaff } from "@/lib/auth";

export default async function EmployeeNewWatch() {
  const { canEdit } = await requireStaff();
  if (!canEdit) redirect("/employe");
  return <WatchForm redirectTo="/employe/montre/{id}" />;
}
