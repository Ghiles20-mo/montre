"use client";

import { useRouter } from "next/navigation";
import Icon from "./Icon";

// Revient à la page précédente ; si on est arrivé directement (lien, rafraîchissement), va à `fallback`.
export default function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Retour"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
      className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-800 transition hover:bg-stone-100 active:bg-stone-200"
    >
      <Icon name="back" className="h-6 w-6" />
    </button>
  );
}
