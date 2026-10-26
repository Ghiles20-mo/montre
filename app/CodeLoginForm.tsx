"use client";

import { useActionState } from "react";
import { employeeLogin } from "./actions";

export default function CodeLoginForm() {
  const [state, action, pending] = useActionState(employeeLogin, {});
  return (
    <form action={action} className="space-y-4">
      <input
        name="code"
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        placeholder="CODE"
        className="input text-center font-mono text-2xl uppercase tracking-[0.3em]"
      />
      {state.error && <p className="text-center text-sm text-red-600">{state.error}</p>}
      <button className="btn w-full py-3" disabled={pending}>
        {pending ? "Vérification…" : "Entrer"}
      </button>
    </form>
  );
}
