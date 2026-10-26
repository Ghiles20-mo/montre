"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { photoUrl, Watch } from "@/lib/format";
import { uploadPhoto } from "@/lib/upload";
import { saveWatch } from "./actions";

export default function WatchForm({ watch, redirectTo = "/admin" }: { watch?: Watch; redirectTo?: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(photoUrl(watch?.photo_path));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      if (file) fd.set("photo_path", await uploadPhoto(file));
      const res = await saveWatch(fd);
      if ("error" in res) return setError(res.error);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-6 md:grid-cols-[1fr_260px]">
      {watch && <input type="hidden" name="id" value={watch.id} />}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Référence *</label>
            <input name="reference" required defaultValue={watch?.reference} className="input font-mono" />
          </div>
          <div>
            <label className="label">Marque</label>
            <input name="brand" defaultValue={watch?.brand ?? ""} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Nom / modèle *</label>
          <input name="name" required defaultValue={watch?.name} className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Prix *</label>
            <input
              name="price"
              required
              inputMode="decimal"
              defaultValue={watch?.price ?? ""}
              className="input"
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-2">
            <input
              type="checkbox"
              name="in_stock"
              defaultChecked={watch?.in_stock ?? true}
              className="h-5 w-5 accent-stone-900"
            />
            <span className="text-sm font-medium">En stock</span>
          </label>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" rows={3} defaultValue={watch?.description ?? ""} className="input" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button className="btn" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button type="button" className="btn-light" onClick={() => router.back()}>
            Annuler
          </button>
        </div>
      </div>

      <div>
        <label className="label">Photo</label>
        <label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 hover:border-stone-500">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-sm text-stone-500">Choisir une photo</span>
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
      </div>
    </form>
  );
}
