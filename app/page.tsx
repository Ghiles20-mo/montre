import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import CodeLoginForm from "./CodeLoginForm";

export default async function Home() {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/employe");

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-4xl">⌚</div>
          <h1 className="mt-2 text-xl font-semibold">Espace employé</h1>
          <p className="text-sm text-stone-500">Entrez votre code d&apos;accès</p>
        </div>
        <CodeLoginForm />
        <p className="mt-6 text-center text-sm">
          <Link href="/admin/login" className="text-stone-500 underline hover:text-stone-900">
            Accès administrateur
          </Link>
        </p>
      </div>
    </main>
  );
}
