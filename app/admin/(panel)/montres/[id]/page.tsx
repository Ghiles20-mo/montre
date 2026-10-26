import { notFound } from "next/navigation";
import { Watch } from "@/lib/format";
import { db } from "@/lib/supabase";
import WatchForm from "../../WatchForm";

export default async function EditWatch({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await db().from("watches").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Modifier {data.reference}</h1>
      <WatchForm watch={data as Watch} />
    </div>
  );
}
