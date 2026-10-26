import Link from "next/link";
import ConfirmButton from "@/components/ConfirmButton";
import SearchBox from "@/components/SearchBox";
import StockBadge from "@/components/StockBadge";
import WatchImage from "@/components/WatchImage";
import { formatPrice, searchFilters, Watch } from "@/lib/format";
import { db } from "@/lib/supabase";
import { deleteWatch, toggleStock } from "./actions";

const PER_PAGE = 50;

type SP = Promise<{ q?: string; stock?: string; page?: string }>;

async function stats() {
  const supabase = db();
  const head = () => supabase.from("watches").select("id", { count: "exact", head: true });
  const [all, inStock, noPhoto] = await Promise.all([
    head(),
    head().eq("in_stock", true),
    head().is("photo_path", null),
  ]);
  const total = all.count ?? 0;
  return { total, inStock: inStock.count ?? 0, out: total - (inStock.count ?? 0), noPhoto: noPhoto.count ?? 0 };
}

export default async function AdminWatches({ searchParams }: { searchParams: SP }) {
  const { q = "", stock = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let query = db().from("watches").select("*", { count: "exact" });
  for (const f of searchFilters(q)) query = query.or(f);
  if (stock === "in") query = query.eq("in_stock", true);
  if (stock === "out") query = query.eq("in_stock", false);
  const [{ data, count, error }, s] = await Promise.all([
    query.order("created_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1),
    stats(),
  ]);
  const watches = (data ?? []) as Watch[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE));

  const href = (p: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q, stock, page, ...p };
    for (const [k, v] of Object.entries(merged)) if (v && !(k === "page" && v === 1)) params.set(k, String(v));
    return `/admin${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Montres" value={s.total} />
        <Stat label="En stock" value={s.inStock} />
        <Stat label="En rupture" value={s.out} />
        <Stat label="Sans photo" value={s.noPhoto} href="/admin/photos" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBox placeholder="Référence, nom ou marque…" />
        </div>
        <div className="flex gap-1">
          {[
            ["", "Tous"],
            ["in", "En stock"],
            ["out", "Rupture"],
          ].map(([v, label]) => (
            <Link
              key={v}
              href={href({ stock: v, page: 1 })}
              className={`rounded-md px-3 py-2 text-sm ${stock === v ? "bg-stone-900 text-white" : "bg-white hover:bg-stone-100"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="p-3">Photo</th>
              <th className="p-3">Référence</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Marque</th>
              <th className="p-3 text-right">Prix</th>
              <th className="p-3">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {watches.map((w) => (
              <tr key={w.id} className="border-b border-stone-100 last:border-0">
                <td className="p-2">
                  <WatchImage path={w.photo_path} alt={w.name} className="h-14 w-14 rounded-md" />
                </td>
                <td className="p-3 font-mono">{w.reference}</td>
                <td className="p-3 font-medium">{w.name}</td>
                <td className="p-3 text-stone-600">{w.brand}</td>
                <td className="whitespace-nowrap p-3 text-right">{formatPrice(w.price)}</td>
                <td className="p-3">
                  <form action={toggleStock}>
                    <input type="hidden" name="id" value={w.id} />
                    <input type="hidden" name="in_stock" value={String(w.in_stock)} />
                    <button title="Cliquer pour changer">
                      <StockBadge inStock={w.in_stock} />
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/montres/${w.id}`} className="btn-light">Modifier</Link>
                    <form action={deleteWatch}>
                      <input type="hidden" name="id" value={w.id} />
                      <ConfirmButton message={`Supprimer ${w.reference} ?`} className="btn-danger">
                        Suppr.
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {watches.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-500">Aucune montre trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={href({ page: page - 1 })} className="btn-light">← Précédent</Link>}
          <span>Page {page} / {pages}</span>
          {page < pages && <Link href={href({ page: page + 1 })} className="btn-light">Suivant →</Link>}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="card p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-stone-500">{label}</div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
