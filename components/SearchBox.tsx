"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder ?? "Rechercher…"}
      autoFocus={autoFocus}
      className={`input ${large ? "py-3 text-lg" : ""}`}
    />
  );
}

export default function SearchBox(props: Props) {
  return (
    <Suspense fallback={<input className="input" disabled />}>
      <Inner {...props} />
    </Suspense>
  );
}
