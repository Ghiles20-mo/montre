import { requireStaff } from "@/lib/auth";
import EmployeeShell from "./EmployeeShell";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  return (
    <EmployeeShell name={session.name} isAdmin={session.role === "admin"} canEdit={session.canEdit}>
      {children}
    </EmployeeShell>
  );
}
