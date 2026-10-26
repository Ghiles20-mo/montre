import Link from "next/link";
import ConfirmButton from "@/components/ConfirmButton";
import Icon from "@/components/Icon";
import SearchBox from "@/components/SearchBox";
import StockBadge from "@/components/StockBadge";
import WatchImage from "@/components/WatchImage";
import { formatPrice, searchFilters, Watch } from "@/lib/format";
import { db } from "@/lib/supabase";
import { deleteWatch, toggleStock } from "./actions";

const PER_PAGE = 40;

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
    <div className="space-y-4">
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
        <Stat label="Montres" value={s.total} />
        <Stat label="En stock" value={s.inStock} tone="text-emerald-700" />
        <Stat label="En rupture" value={s.out} tone="text-red-700" />
        <Stat label="Sans photo" value={s.noPhoto} tone="text-amber-700" href="/admin/photos" />
      </div>

      <div className="sticky top-14 z-10 -mx-4 space-y-2 bg-stone-50/95 px-4 py-2 backdrop-blur-md sm:static sm:mx-0 sm:flex sm:items-center sm:gap-3 sm:space-y-0 sm:bg-transparent sm:p-0">
        <div className="flex-1">
          <SearchBox placeholder="Référence, nom, marque, n° de série…" />
        </div>
        <div className="flex gap-1 rounded-xl bg-stone-200/70 p-1">
          {[
            ["", "Tous"],
            ["in", "En stock"],
            ["out", "Rupture"],
          ].map(([v, label]) => (
            <Link
              key={v}
              href={href({ stock: v, page: 1 })}
              className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
                stock === v ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600">{error.message}</p>}

      <p className="text-sm text-stone-500">{count ?? 0} montre{(count ?? 0) > 1 ? "s" : ""}</p>

      <ul className="grid gap-3 md:grid-cols-2">
        {watches.map((w) => (
          <li key={w.id} className="card flex gap-3 p-3">
            <Link href={`/admin/montres/${w.id}`} className="shrink-0">
              <WatchImage path={w.photo_path} alt={w.name} className="h-24 w-24 rounded-xl" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link href={`/admin/montres/${w.id}`} className="min-w-0">
                <div className="truncate font-mono text-xs text-stone-500">{w.reference}</div>
                <div className="truncate font-semibold leading-tight">{w.name}</div>
                <div className="truncate text-xs text-stone-500">
                  {[w.brand, w.serial_number && `S/N ${w.serial_number}`].filter(Boolean).join(" · ")}
                </div>
              </Link>
              <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                <div>
                  <div className="font-semibold">{formatPrice(w.price)}</div>
                  {w.created_by && <div className="text-[11px] text-stone-400">Ajoutée par {w.created_by}</div>}
                </div>
                <div className="flex items-center gap-1">
                  <form action={toggleStock}>
                    <input type="hidden" name="id" value={w.id} />
                    <input type="hidden" name="in_stock" value={String(w.in_stock)} />
                    <button title="Changer le stock" className="p-1">
                      <StockBadge inStock={w.in_stock} />
                    </button>
                  </form>
                  <form action={deleteWatch}>
                    <input type="hidden" name="id" value={w.id} />
                    <ConfirmButton
                      message={`Supprimer ${w.reference} ?`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Icon name="trash" />
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {watches.length === 0 && (
        <div className="card py-12 text-center text-stone-500">
          Aucune montre trouvée.
          <div className="mt-3">
            <Link href="/admin/montres/nouvelle" className="btn">Ajouter une montre</Link>
          </div>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={href({ page: page - 1 })} className="btn-light">← Précédent</Link>}
          <span className="text-stone-500">{page} / {pages}</span>
          {page < pages && <Link href={href({ page: page + 1 })} className="btn-light">Suivant →</Link>}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, href, tone = "" }: { label: string; value: number; href?: string; tone?: string }) {
  const content = (
    <div className="card min-w-[130px] snap-start p-3.5 sm:min-w-0">
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-xs font-medium text-stone-500">{label}</div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
