"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BackButton from "@/components/BackButton";
import Icon, { IconName } from "@/components/Icon";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Montres", icon: "list" },
  { href: "/admin/import", label: "Import", icon: "upload" },
  { href: "/admin/montres/nouvelle", label: "Ajouter", icon: "plus" },
  { href: "/admin/photos", label: "Photos", icon: "photo" },
  { href: "/admin/employes", label: "Employés", icon: "users" },
];

function titleFor(path: string) {
  if (path === "/admin") return "Montres";
  if (path === "/admin/montres/nouvelle") return "Nouvelle montre";
  if (path.startsWith("/admin/montres/")) return "Modifier la montre";
  if (path.startsWith("/admin/import")) return "Import Excel";
  if (path.startsWith("/admin/photos")) return "Photos";
  if (path.startsWith("/admin/employes")) return "Employés";
  if (path.startsWith("/admin/reglages")) return "Réglages";
  return "Admin";
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isHome = path === "/admin";
  // Sur les formulaires de montre, la barre « Enregistrer » prend la place des onglets.
  const showTabs = !path.startsWith("/admin/montres/");

  return (
    <div className="min-h-dvh pb-24 md:pb-8">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
          {isHome ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-lg">⌚</span>
          ) : (
            <BackButton fallback="/admin" />
          )}
          <h1 className="flex-1 truncate text-lg font-semibold">{titleFor(path)}</h1>

          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  path === t.href ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <details key={path} className="relative">
            <summary
              aria-label="Menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-stone-100 [&::-webkit-details-marker]:hidden"
            >
              <Icon name="dots" className="h-6 w-6" />
            </summary>
            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-stone-200 bg-white py-1 shadow-lg">
              <MenuLink href="/admin/reglages" icon="settings">Réglages</MenuLink>
              <MenuLink href="/employe" icon="eye">Vue employé</MenuLink>
              <a href="/logout" className="flex items-center gap-3 px-4 py-3 text-sm text-red-700 hover:bg-red-50">
                <Icon name="logout" /> Déconnexion
              </a>
            </div>
          </details>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">{children}</main>

      <nav
        className={`pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 backdrop-blur-md md:hidden ${
          showTabs ? "" : "hidden"
        }`}
      >
        <div className="grid grid-cols-5">
          {TABS.map((t) => {
            const active = path === t.href;
            const isAdd = t.icon === "plus";
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? "text-stone-900" : "text-stone-500"
                }`}
              >
                {isAdd ? (
                  <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg ring-4 ring-white">
                    <Icon name="plus" className="h-6 w-6" />
                  </span>
                ) : (
                  <Icon name={t.icon} className="h-6 w-6" />
                )}
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: IconName; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50">
      <Icon name={icon} /> {children}
    </Link>
  );
}
