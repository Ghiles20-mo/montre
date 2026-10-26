import { db } from "@/lib/supabase";
import PhotoManager, { PhotoWatch } from "./PhotoManager";

async function allWatches(): Promise<PhotoWatch[]> {
  const out: PhotoWatch[] = [];
  const supabase = db();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("watches")
      .select("id, reference, name, photo_path")
      .order("reference")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

export default async function PhotosPage() {
  const watches = await allWatches();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Photos des montres</h1>
      <PhotoManager watches={watches} />
    </div>
  );
}
