"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/Icon";
import { photoUrl, Watch } from "@/lib/format";
import { uploadPhoto } from "@/lib/upload";
import { saveWatch } from "./actions";

type Props = {
  watch?: Watch;
  // Où aller après l'enregistrement ; {id} est remplacé par l'id de la montre.
  redirectTo?: string;
};

export default function WatchForm({ watch, redirectTo = "/admin" }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(photoUrl(watch?.photo_path));
  const [inStock, setInStock] = useState(watch?.in_stock ?? true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      if (inStock) fd.set("in_stock", "on");
      if (file) fd.set("photo_path", await uploadPhoto(file));
      const res = await saveWatch(fd);
      if ("error" in res) return setError(res.error);
      router.replace(redirectTo.replace("{id}", res.id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="pb-24 md:pb-0">
      {watch && <input type="hidden" name="id" value={watch.id} />}
      <div className="grid gap-4 md:grid-cols-[300px_1fr] md:gap-6">
        {/* Photo */}
        <label className="group relative mx-auto flex aspect-square w-full max-w-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-white transition hover:border-stone-500 md:max-w-none">
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="h-full w-full object-contain" />
              <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-stone-900/80 px-3 py-1.5 text-xs font-medium text-white">
                <Icon name="photo" className="h-4 w-4" /> Changer
              </span>
            </>
          ) : (
            <span className="flex flex-col items-center gap-2 text-stone-500">
              <Icon name="photo" className="h-10 w-10" />
              <span className="text-sm font-medium">Ajouter une photo</span>
              <span className="text-xs text-stone-400">Galerie ou appareil photo</span>
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFile(f);
              setPreview(URL.createObjectURL(f));
            }}
          />
        </label>

        {/* Champs */}
        <div className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Référence *">
              <input name="reference" required defaultValue={watch?.reference} autoCapitalize="characters" className="input font-mono" />
            </Field>
            <Field label="N° de série">
              <input name="serial_number" defaultValue={watch?.serial_number ?? ""} autoCapitalize="characters" className="input font-mono" />
            </Field>
          </div>
          <Field label="Nom / modèle *">
            <input name="name" required defaultValue={watch?.name} className="input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Marque">
              <input name="brand" defaultValue={watch?.brand ?? ""} className="input" />
            </Field>
            <Field label="Prix *">
              <input name="price" required inputMode="decimal" defaultValue={watch?.price ?? ""} className="input" />
            </Field>
          </div>

          <div>
            <span className="label">Disponibilité</span>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setInStock(v)}
                  className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                    inStock === v
                      ? v
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-red-600 text-white shadow-sm"
                      : "text-stone-600"
                  }`}
                >
                  {v ? "En stock" : "Rupture"}
                </button>
              ))}
            </div>
          </div>

          <Field label="Description">
            <textarea name="description" rows={3} defaultValue={watch?.description ?? ""} className="input" />
          </Field>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="hidden gap-2 md:flex">
            <button className="btn" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
            <button type="button" className="btn-light" onClick={() => router.back()}>Annuler</button>
          </div>
        </div>
      </div>

      {/* Barre d'enregistrement fixe en bas sur mobile */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur-md md:hidden">
        <div className="p-3">
          <button className="btn w-full py-3.5 text-base" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
