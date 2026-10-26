"use client";

import Link from "next/link";
import { useState } from "react";
import * as XLSX from "xlsx";
import { formatPrice } from "@/lib/format";
import { importWatches, ImportRow } from "../actions";

type Field = "reference" | "name" | "price" | "brand" | "description" | "in_stock";

const ALIASES: Record<Field, string[]> = {
  reference: ["reference", "ref", "references", "code", "sku"],
  name: ["nom", "name", "modele", "model", "designation", "libelle"],
  price: ["prix", "price", "prix de vente", "pv", "tarif"],
  brand: ["marque", "brand"],
  description: ["description", "desc", "details"],
  in_stock: ["stock", "en stock", "disponible", "dispo", "in stock"],
};

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function parseStock(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v > 0;
  const s = normalize(String(v));
  if (s === "") return true;
  return !["non", "no", "0", "false", "faux", "rupture", "hors stock", "epuise", "indisponible"].includes(s);
}

function parsePrice(v: unknown): number {
  if (typeof v === "number") return v;
  return Number(String(v).replace(/[^\d,.-]/g, "").replace(",", "."));
}

type Parsed = { rows: ImportRow[]; errors: string[]; missing: Field[]; fields: Field[] };

function parseSheet(raw: Record<string, unknown>[]): Parsed {
  const headers = Object.keys(raw[0] ?? {});
  const map = {} as Partial<Record<Field, string>>;
  for (const h of headers) {
    const n = normalize(h);
    for (const [field, aliases] of Object.entries(ALIASES) as [Field, string[]][]) {
      if (!map[field] && aliases.includes(n)) map[field] = h;
    }
  }
  const missing = (["reference", "name", "price"] as Field[]).filter((f) => !map[f]);
  const fields = Object.keys(map) as Field[];
  if (missing.length) return { rows: [], errors: [], missing, fields };

  const rows = new Map<string, ImportRow>();
  const errors: string[] = [];
  raw.forEach((r, i) => {
    const line = i + 2;
    const reference = String(r[map.reference!] ?? "").trim();
    const name = String(r[map.name!] ?? "").trim();
    if (!reference && !name) return; // ligne vide
    const price = parsePrice(r[map.price!]);
    if (!reference) return errors.push(`Ligne ${line} : référence manquante`);
    if (!name) return errors.push(`Ligne ${line} : nom manquant`);
    if (!Number.isFinite(price) || price < 0) return errors.push(`Ligne ${line} : prix invalide`);

    const row: ImportRow = { reference, name, price };
    if (map.brand) row.brand = String(r[map.brand] ?? "").trim() || null;
    if (map.description) row.description = String(r[map.description] ?? "").trim() || null;
    if (map.in_stock) row.in_stock = parseStock(r[map.in_stock]);
    rows.set(reference, row);
  });
  return { rows: [...rows.values()], errors, missing, fields };
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["reference", "nom", "marque", "prix", "stock", "description"],
    ["GA-2100-1A", "G-Shock GA-2100", "Casio", 18500, "oui", "Boîtier carbone"],
    ["SRPD55K1", "Seiko 5 Sports", "Seiko", 42000, "non", ""],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Montres");
  XLSX.writeFile(wb, "modele-import-montres.xlsx");
}

const CHUNK = 500;

export default function ImportExcel() {
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setResult(null);
    setError(null);
    setFileName(file.name);
    try {
      const wb = XLSX.read(await file.arrayBuffer());
      const ws = wb.Sheets[wb.SheetNames[0]];
      setParsed(parseSheet(XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })));
    } catch {
      setError("Impossible de lire ce fichier");
      setParsed(null);
    }
  }

  async function runImport() {
    if (!parsed) return;
    setError(null);
    const total = parsed.rows.length;
    setProgress({ done: 0, total });
    let done = 0;
    for (let i = 0; i < total; i += CHUNK) {
      const res = await importWatches(parsed.rows.slice(i, i + CHUNK));
      if ("error" in res) {
        setError(`Erreur après ${done} montres : ${res.error}`);
        setProgress(null);
        return;
      }
      done += res.count;
      setProgress({ done, total });
    }
    setProgress(null);
    setParsed(null);
    setResult(`${done} montres importées / mises à jour.`);
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3">
        <label className="btn cursor-pointer">
          Choisir un fichier Excel
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </label>
        <button type="button" onClick={downloadTemplate} className="btn-light">
          Télécharger un modèle
        </button>
        {fileName && <span className="text-sm text-stone-500">{fileName}</span>}
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {result && (
        <div className="card border-emerald-200 bg-emerald-50 text-emerald-900">
          {result}{" "}
          <Link href="/admin/photos" className="font-medium underline">Ajouter les photos →</Link>
        </div>
      )}

      {parsed && parsed.missing.length > 0 && (
        <p className="text-red-600">
          Colonnes introuvables : {parsed.missing.join(", ")}. Vérifiez la première ligne du fichier.
        </p>
      )}

      {parsed && parsed.missing.length === 0 && (
        <div className="card space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <p>
              <b>{parsed.rows.length}</b> montres prêtes à importer
              {parsed.errors.length > 0 && (
                <span className="text-amber-700"> · {parsed.errors.length} lignes ignorées</span>
              )}
            </p>
            <button onClick={runImport} disabled={!!progress || parsed.rows.length === 0} className="btn">
              {progress ? `Import… ${progress.done}/${progress.total}` : "Importer"}
            </button>
          </div>

          {parsed.errors.length > 0 && (
            <details className="text-sm text-amber-800">
              <summary className="cursor-pointer">Voir les lignes ignorées</summary>
              <ul className="mt-2 list-disc pl-5">
                {parsed.errors.slice(0, 100).map((e) => <li key={e}>{e}</li>)}
              </ul>
            </details>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-stone-500">
                <tr>
                  <th className="p-2">Référence</th>
                  <th className="p-2">Nom</th>
                  {parsed.fields.includes("brand") && <th className="p-2">Marque</th>}
                  <th className="p-2 text-right">Prix</th>
                  {parsed.fields.includes("in_stock") && <th className="p-2">Stock</th>}
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 20).map((r) => (
                  <tr key={r.reference} className="border-t border-stone-100">
                    <td className="p-2 font-mono">{r.reference}</td>
                    <td className="p-2">{r.name}</td>
                    {parsed.fields.includes("brand") && <td className="p-2">{r.brand}</td>}
                    <td className="p-2 text-right">{formatPrice(r.price)}</td>
                    {parsed.fields.includes("in_stock") && <td className="p-2">{r.in_stock ? "Oui" : "Non"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.rows.length > 20 && (
              <p className="mt-2 text-sm text-stone-500">… et {parsed.rows.length - 20} autres</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
