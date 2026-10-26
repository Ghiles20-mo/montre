"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Icon from "./Icon";

type Props = { placeholder?: string; autoFocus?: boolean; large?: boolean };

function Inner({ placeholder, autoFocus, large }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      next.delete("page");
      if (next.toString() !== params.toString()) {
        router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "Rechercher…"}
        autoFocus={autoFocus}
        className={`input pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden ${large ? "py-3.5 text-lg" : ""}`}
      />
      {value && (
        <button
          type="button"
          aria-label="Effacer"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function SearchBox(props: Props) {
  return (
    <Suspense fallback={<input className="input" disabled />}>
      <Inner {...props} />
    </Suspense>
  );
}
