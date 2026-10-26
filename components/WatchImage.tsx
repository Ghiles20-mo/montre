import { photoUrl } from "@/lib/format";

export default function WatchImage({
  path,
  alt,
  className = "",
}: {
  path: string | null;
  alt: string;
  className?: string;
}) {
  const url = photoUrl(path);
  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-stone-100 text-stone-400 ${className}`}>
        <span className="text-xs">Pas de photo</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} loading="lazy" className={`bg-white object-contain ${className}`} />;
}
