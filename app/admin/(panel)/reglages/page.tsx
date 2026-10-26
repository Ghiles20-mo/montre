"use client";

import { useActionState } from "react";
import { changeAdminPassword } from "./actions";

export default function SettingsPage() {
  const [state, action, pending] = useActionState(changeAdminPassword, {});
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Réglages</h1>
      <form action={action} key={state.ok ? "done" : "form"} className="card max-w-md space-y-4">
        <h2 className="font-semibold">Changer le mot de passe admin</h2>
        <div>
          <label className="label" htmlFor="current">Mot de passe actuel</label>
          <input id="current" name="current" type="password" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="next">Nouveau mot de passe</label>
          <input id="next" name="next" type="password" required minLength={8} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirmer le nouveau mot de passe</label>
          <input id="confirm" name="confirm" type="password" required minLength={8} className="input" />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.ok && <p className="text-sm text-emerald-700">Mot de passe modifié.</p>}
        <button className="btn" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
      </form>
    </div>
  );
}
