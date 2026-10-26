"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BackButton from "@/components/BackButton";
import Icon from "@/components/Icon";

function titleFor(path: string) {
  if (path === "/employe") return "Catalogue";
  if (path === "/employe/montre/nouvelle") return "Nouvelle montre";
  if (path.endsWith("/modifier")) return "Modifier la montre";
  return "Montre";
}

function fallbackFor(path: string) {
  if (path.endsWith("/modifier")) return path.replace(/\/modifier$/, "");
  return "/employe";
}

type Props = { name: string; isAdmin: boolean; canEdit: boolean; children: React.ReactNode };

export default function EmployeeShell({ name, isAdmin, canEdit, children }: Props) {
  const path = usePathname();
  const isHome = path === "/employe";

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
          {isHome ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-lg">⌚</span>
          ) : (
            <BackButton fallback={fallbackFor(path)} />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold leading-tight">{titleFor(path)}</h1>
            {isHome && <p className="truncate text-xs text-stone-500">{name}</p>}
          </div>
          {isAdmin && (
            <Link href="/admin" className="btn-light px-3">
              Admin
            </Link>
          )}
          <a
            href="/logout"
            aria-label="Déconnexion"
            className="flex h-11 w-11 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100"
          >
            <Icon name="logout" className="h-6 w-6" />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">{children}</main>

      {canEdit && isHome && (
        <Link
          href="/employe/montre/nouvelle"
          aria-label="Ajouter une montre"
          className="pb-safe fixed bottom-5 right-5 z-20 flex h-14 items-center gap-2 rounded-full bg-stone-900 px-5 font-semibold text-white shadow-xl transition active:scale-95"
        >
          <Icon name="plus" className="h-6 w-6" /> Ajouter
        </Link>
      )}
    </div>
  );
}
