import Link from "next/link";
import { notFound } from "next/navigation";
import { toggleStock } from "@/app/admin/(panel)/actions";
import Icon from "@/components/Icon";
import PhotoZoom from "@/components/PhotoZoom";
import StockBadge from "@/components/StockBadge";
import { requireStaff } from "@/lib/auth";
import { formatPrice, Watch } from "@/lib/format";
import { db } from "@/lib/supabase";

export default async function WatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { canEdit } = await requireStaff();
  const { data } = await db().from("watches").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const w = data as Watch;

  return (
    <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2 md:gap-8">
      <PhotoZoom path={w.photo_path} alt={w.name} />

      <div className="space-y-5">
        <div className="space-y-1">
          {w.brand && <div className="text-sm font-medium uppercase tracking-wide text-stone-500">{w.brand}</div>}
          <h2 className="text-2xl font-bold leading-tight">{w.name}</h2>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-3xl font-bold">{formatPrice(w.price)}</div>
          <StockBadge inStock={w.in_stock} />
        </div>

        <dl className="divide-y divide-stone-100 rounded-2xl border border-stone-200/80 bg-white text-sm">
          <Row label="Référence" value={w.reference} mono />
          {w.serial_number && <Row label="N° de série" value={w.serial_number} mono />}
        </dl>

        {w.description && <p className="whitespace-pre-line text-stone-700">{w.description}</p>}

        {canEdit && (
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/employe/montre/${w.id}/modifier`} className="btn">
              <Icon name="pencil" className="h-4 w-4" /> Modifier
            </Link>
            <form action={toggleStock}>
              <input type="hidden" name="id" value={w.id} />
              <input type="hidden" name="in_stock" value={String(w.in_stock)} />
              <button className="btn-light h-full min-h-[44px] w-full">
                {w.in_stock ? "Mettre en rupture" : "Remettre en stock"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <dt className="text-stone-500">{label}</dt>
      <dd className={`text-right font-semibold ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
