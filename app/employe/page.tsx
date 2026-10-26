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
  const total = count ?? 0;

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-10 -mx-4 bg-stone-50/95 px-4 py-2 backdrop-blur-md">
        <SearchBox placeholder="Référence, nom, n° de série…" large />
        <p className="mt-2 text-xs text-stone-500">
          {total} résultat{total > 1 ? "s" : ""}
          {total > LIMIT && ` · ${LIMIT} premiers affichés, affinez la recherche`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {watches.map((w) => (
          <Link
            key={w.id}
            href={`/employe/montre/${w.id}`}
            className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition active:scale-[0.98] hover:shadow-md"
          >
            <WatchImage path={w.photo_path} alt={w.name} className="aspect-square w-full" />
            <div className="space-y-1 p-3">
              <div className="truncate font-mono text-[11px] text-stone-500">{w.reference}</div>
              <div className="line-clamp-2 text-sm font-semibold leading-tight">{w.name}</div>
              {w.brand && <div className="truncate text-xs text-stone-500">{w.brand}</div>}
              <div className="pt-1 text-base font-bold">{formatPrice(w.price)}</div>
              <StockBadge inStock={w.in_stock} />
            </div>
          </Link>
        ))}
      </div>

      {watches.length === 0 && (
        <div className="py-16 text-center text-stone-500">
          <div className="text-4xl">🔍</div>
          <p className="mt-2">Aucune montre trouvée</p>
        </div>
      )}
    </div>
  );
}
