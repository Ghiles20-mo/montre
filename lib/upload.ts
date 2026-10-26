// Upload côté navigateur : l'image est réduite puis envoyée directement à Supabase
// via une URL signée générée par le serveur (évite la limite de taille des fonctions).
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createPhotoUpload } from "@/app/admin/(panel)/actions";
import { BUCKET } from "./format";

let client: SupabaseClient | null = null;
function storage() {
  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  return client.storage.from(BUCKET);
}

async function compressImage(file: File, max = 1400, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Compression impossible"))), "image/jpeg", quality),
  );
}

export async function uploadPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} n'est pas une image`);

  let body: Blob = file;
  let ext = file.name.split(".").pop() || "jpg";
  try {
    body = await compressImage(file);
    ext = "jpg";
  } catch {
    // format non décodable par le navigateur : on envoie l'original
  }

  const res = await createPhotoUpload(ext);
  if ("error" in res) throw new Error(res.error);
  const { error } = await storage().uploadToSignedUrl(res.path, res.token, body, {
    contentType: body.type || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  return res.path;
}
