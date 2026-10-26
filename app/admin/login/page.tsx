"use client";

import Link from "next/link";
import { useActionState } from "react";
import { adminLogin } from "@/app/actions";

export default function AdminLogin() {
  const [state, action, pending] = useActionState(adminLogin, {});
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={action} className="card w-full max-w-sm space-y-4">
        <h1 className="text-center text-xl font-semibold">Administration</h1>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" autoFocus className="input" />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button className="btn w-full" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </button>
        <p className="text-center text-sm">
          <Link href="/" className="text-stone-500 underline">Espace employé</Link>
        </p>
      </form>
    </main>
  );
}
