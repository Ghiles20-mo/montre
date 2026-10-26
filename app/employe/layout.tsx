import Link from "next/link";
import { requireStaff } from "@/lib/auth";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/employe" className="font-semibold">⌚ Catalogue</Link>
          <span className="flex-1 truncate text-sm text-stone-500">{session.name}</span>
          {session.role === "admin" && (
            <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-900">Admin</Link>
          )}
          <a href="/logout" className="text-sm text-stone-500 hover:text-stone-900">Déconnexion</a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
