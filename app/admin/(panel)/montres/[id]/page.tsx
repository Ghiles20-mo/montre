import { notFound } from "next/navigation";
import { Watch } from "@/lib/format";
import { db } from "@/lib/supabase";
import WatchForm from "../../WatchForm";

export default async function EditWatch({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await db().from("watches").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const w = data as Watch;
  return (
    <div className="space-y-3">
      {w.created_by && (
        <p className="text-sm text-stone-500">
          Ajoutée par <b>{w.created_by}</b> le {new Date(w.created_at).toLocaleDateString("fr-FR")}
        </p>
      )}
      <WatchForm watch={w} />
    </div>
  );
}
