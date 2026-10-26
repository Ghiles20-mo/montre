import Link from "next/link";
import { notFound } from "next/navigation";
import { toggleStock } from "@/app/admin/(panel)/actions";
import StockBadge from "@/components/StockBadge";
import WatchImage from "@/components/WatchImage";
import { requireStaff } from "@/lib/auth";
import { formatPrice, Watch } from "@/lib/format";
import { db } from "@/lib/supabase";
import BackButton from "./BackButton";

export default async function WatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { canEdit } = await requireStaff();
  const { data } = await db().from("watches").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const w = data as Watch;

  return (
    <div className="space-y-4">
      <BackButton />
      <div className="grid gap-6 rounded-xl border border-stone-200 bg-white p-4 md:grid-cols-2 md:p-6">
        <WatchImage path={w.photo_path} alt={w.name} className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <div>
            <div className="font-mono text-sm text-stone-500">Réf. {w.reference}</div>
            <h1 className="text-2xl font-semibold">{w.name}</h1>
            {w.brand && <div className="text-stone-600">{w.brand}</div>}
          </div>
          <div className="text-3xl font-bold">{formatPrice(w.price)}</div>
          <StockBadge inStock={w.in_stock} />
          {w.description && <p className="whitespace-pre-line text-stone-700">{w.description}</p>}

          {canEdit && (
            <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-4">
              <Link href={`/employe/montre/${w.id}/modifier`} className="btn">Modifier</Link>
              <form action={toggleStock}>
                <input type="hidden" name="id" value={w.id} />
                <input type="hidden" name="in_stock" value={String(w.in_stock)} />
                <button className="btn-light h-full">
                  {w.in_stock ? "Marquer en rupture" : "Marquer en stock"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
