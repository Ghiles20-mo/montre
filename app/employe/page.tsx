import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import StockBadge from "@/components/StockBadge";
import WatchImage from "@/components/WatchImage";
import { formatPrice, searchFilters, Watch } from "@/lib/format";
import { db } from "@/lib/supabase";

const LIMIT = 60;

export default async function EmployeeSearch({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;

  let query = db().from("watches").select("*", { count: "exact" });
  for (const f of searchFilters(q)) query = query.or(f);
  const { data, count } = await query.order("name").limit(LIMIT);
  const watches = (data ?? []) as Watch[];

  return (
    <div className="space-y-5">
      <SearchBox placeholder="Rechercher par référence ou nom…" autoFocus large />

      <p className="text-sm text-stone-500">
        {count ?? 0} résultat{(count ?? 0) > 1 ? "s" : ""}
        {(count ?? 0) > LIMIT && ` — affinez la recherche (${LIMIT} premiers affichés)`}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {watches.map((w) => (
          <Link
            key={w.id}
            href={`/employe/montre/${w.id}`}
            className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <WatchImage path={w.photo_path} alt={w.name} className="aspect-square w-full" />
            <div className="space-y-1 p-3">
              <div className="font-mono text-xs text-stone-500">{w.reference}</div>
              <div className="line-clamp-2 font-medium leading-tight">{w.name}</div>
              {w.brand && <div className="text-xs text-stone-500">{w.brand}</div>}
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold">{formatPrice(w.price)}</span>
                <StockBadge inStock={w.in_stock} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {watches.length === 0 && <p className="py-12 text-center text-stone-500">Aucune montre trouvée</p>}
    </div>
  );
}
