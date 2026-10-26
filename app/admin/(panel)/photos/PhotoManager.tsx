"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { uploadPhoto } from "@/lib/upload";
import { setWatchPhoto } from "../actions";

export type PhotoWatch = { id: string; reference: string; name: string; photo_path: string | null };

// "GA-2100/1A" et "ga 2100 1a.jpg" donnent la même clé
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const stem = (fileName: string) => fileName.replace(/\.[^.]+$/, "");

type Match = { file: File; watch: PhotoWatch | null };

export default function PhotoManager({ watches }: { watches: PhotoWatch[] }) {
  const router = useRouter();
  const byKey = useMemo(() => new Map(watches.map((w) => [key(w.reference), w])), [watches]);
  const missing = watches.filter((w) => !w.photo_path);

  const [matches, setMatches] = useState<Match[]>([]);
  const [replace, setReplace] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const toSend = matches.filter((m) => m.watch && (replace || !m.watch.photo_path));
  const unmatched = matches.filter((m) => !m.watch);

  async function upload(watch: PhotoWatch, file: File) {
    const path = await uploadPhoto(file);
    const res = await setWatchPhoto(watch.id, path);
    if ("error" in res) throw new Error(res.error);
  }

  async function sendBulk() {
    const errors: string[] = [];
    for (let i = 0; i < toSend.length; i++) {
      const { file, watch } = toSend[i];
      setBusy(`Envoi ${i + 1}/${toSend.length}…`);
      try {
        await upload(watch!, file);
      } catch (e) {
        errors.push(`${file.name} : ${e instanceof Error ? e.message : "erreur"}`);
      }
    }
    setBusy(null);
    setMatches([]);
    setLog([`${toSend.length - errors.length} photos envoyées.`, ...errors]);
    router.refresh();
  }

  async function sendOne(watch: PhotoWatch, file: File) {
    setBusy(watch.reference);
    try {
      await upload(watch, file);
      router.refresh();
    } catch (e) {
      setLog([`${watch.reference} : ${e instanceof Error ? e.message : "erreur"}`]);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold">Envoi groupé</h2>
          <p className="text-sm text-stone-600">
            Nommez chaque photo avec la <b>référence</b> de la montre (ex. <code>GA-2100-1A.jpg</code>), puis
            sélectionnez-les toutes d&apos;un coup. Les photos sont associées automatiquement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="btn w-full cursor-pointer sm:w-auto">
            Sélectionner les photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setMatches(files.map((file) => ({ file, watch: byKey.get(key(stem(file.name))) ?? null })));
                setLog([]);
                e.target.value = "";
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
            Remplacer les photos existantes
          </label>
        </div>

        {matches.length > 0 && (
          <div className="space-y-3 text-sm">
            <p>
              <b>{toSend.length}</b> photo(s) à envoyer
              {matches.length - toSend.length - unmatched.length > 0 &&
                ` · ${matches.length - toSend.length - unmatched.length} ignorée(s) (montre ayant déjà une photo)`}
              {unmatched.length > 0 && (
                <span className="text-amber-700"> · {unmatched.length} sans référence correspondante</span>
              )}
            </p>
            {unmatched.length > 0 && (
              <p className="text-amber-700">Non reconnues : {unmatched.map((m) => m.file.name).join(", ")}</p>
            )}
            <button className="btn" onClick={sendBulk} disabled={!!busy || toSend.length === 0}>
              {busy ?? "Envoyer"}
            </button>
          </div>
        )}
        {log.length > 0 && (
          <ul className="text-sm">
            {log.map((l) => <li key={l}>{l}</li>)}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Montres sans photo ({missing.length})</h2>
        {missing.length === 0 && <p className="text-stone-500">Toutes les montres ont une photo 🎉</p>}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {missing.map((w) => (
            <div key={w.id} className="card flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="truncate font-mono text-sm">{w.reference}</div>
                <div className="truncate text-sm text-stone-500">{w.name}</div>
              </div>
              <label className={`btn-light shrink-0 cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
                {busy === w.reference ? "Envoi…" : "Photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) sendOne(w, f);
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
