"use client";

import { useEffect, useRef, useState } from "react";
import { photoUrl } from "@/lib/format";
import Icon from "./Icon";

// Photo cliquable : s'ouvre en plein écran ; un tap zoome à l'endroit touché, on se déplace en glissant.
export default function PhotoZoom({ path, alt }: { path: string | null; alt: string }) {
  const url = photoUrl(path);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!url) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-400">
        Pas de photo
      </div>
    );
  }

  function toggleZoom(e: React.MouseEvent<HTMLImageElement>) {
    const el = scroller.current;
    if (!el) return;
    if (zoomed) return setZoomed(false);
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    setZoomed(true);
    // Centrer la vue sur le point touché une fois l'image agrandie
    requestAnimationFrame(() => {
      el.scrollLeft = rx * el.scrollWidth - el.clientWidth / 2;
      el.scrollTop = ry * el.scrollHeight - el.clientHeight / 2;
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-2xl bg-white"
        aria-label="Agrandir la photo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="aspect-square w-full object-contain" />
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-stone-900/75 px-3 py-1.5 text-xs font-medium text-white">
          <Icon name="zoom" className="h-4 w-4" /> Agrandir
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black">
          <div ref={scroller} className="h-full w-full overflow-auto overscroll-contain">
            <div
              className={`flex items-center justify-center ${zoomed ? "h-[250%] w-[250%]" : "h-full w-full"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={alt}
                onClick={toggleZoom}
                className={`max-h-full max-w-full select-none object-contain ${zoomed ? "h-full w-full cursor-zoom-out" : "cursor-zoom-in"}`}
                draggable={false}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setZoomed(false);
            }}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          >
            <Icon name="close" className="h-6 w-6" />
          </button>
          <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs text-white/70">
            {zoomed ? "Glissez pour vous déplacer · touchez pour dézoomer" : "Touchez la photo pour zoomer"}
          </p>
        </div>
      )}
    </>
  );
}
