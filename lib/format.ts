export const BUCKET = "watch-photos";

export type Watch = {
  id: string;
  reference: string;
  name: string;
  brand: string | null;
  serial_number: string | null;
  description: string | null;
  price: number;
  in_stock: boolean;
  photo_path: string | null;
  created_by: string | null;
  created_at: string;
};

export function photoUrl(path?: string | null) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

const currency = process.env.NEXT_PUBLIC_CURRENCY || "DA";
const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export function formatPrice(value: number | string) {
  return `${nf.format(Number(value))} ${currency}`;
}

// Recherche multi-mots : chaque mot doit apparaître dans la référence, le nom, la marque ou le n° de série.
export function searchFilters(q: string): string[] {
  return q
    .replace(/[,()%*\\"]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map(
      (w) =>
        `reference.ilike.%${w}%,name.ilike.%${w}%,brand.ilike.%${w}%,serial_number.ilike.%${w}%`,
    );
}
