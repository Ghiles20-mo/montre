export default function StockBadge({ inStock }: { inStock: boolean }) {
  return inStock ? (
    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
      En stock
    </span>
  ) : (
    <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
      Rupture
    </span>
  );
}
