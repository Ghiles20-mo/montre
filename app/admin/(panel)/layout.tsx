import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Montres" },
  { href: "/admin/montres/nouvelle", label: "+ Ajouter" },
  { href: "/admin/import", label: "Import Excel" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/employes", label: "Employés" },
  { href: "/employe", label: "Vue employé" },
  { href: "/admin/reglages", label: "Réglages" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-1 gap-y-2 px-4 py-3">
          <span className="mr-4 font-semibold">⌚ Admin</span>
          <nav className="flex flex-1 flex-wrap gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-md px-3 py-1.5 text-sm hover:bg-stone-100">
                {l.label}
              </Link>
            ))}
          </nav>
          <a href="/logout" className="text-sm text-stone-500 hover:text-stone-900">Déconnexion</a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
