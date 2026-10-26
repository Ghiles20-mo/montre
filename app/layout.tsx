import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestion Montres",
  description: "Catalogue et stock du magasin de montres",
  appleWebApp: { capable: true, title: "Montres", statusBarStyle: "default" },
};

// Pas de zoom automatique quand on touche un champ sur mobile, rendu plein écran façon app.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#fafaf9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  );
}
