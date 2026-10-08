import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { BrandHeader } from "@/components/BrandHeader";
import { AdTickerBanner } from "@/components/AdTickerBanner";
import { BrandFooter } from "@/components/BrandFooter";
import { FloatingDock } from "@/components/FloatingDock";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kaversgames.com.br"),
  title: "Simulador de Torcida Organizada ⚽ Arquibancada & Pista",
  description: "Gerencie sua torcida organizada, conquiste a pista, negocie com o MP e lidere a arquibancada rumo ao topo do futebol!",
  icons: { icon: "/bancada_logo.png", apple: "/bancada_logo.png" },
  openGraph: {
    title: "Bancada Simulator — Simulador de Torcida Organizada",
    description: "Comande sua torcida por 15 temporadas: pista, bateria, caravanas e ranking nacional. Jogo +18 de ficção e paródia.",
    images: [{ url: "/bancada_logo.png" }],
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bancada Simulator — Simulador de Torcida Organizada",
    description: "Comande sua torcida por 15 temporadas. Jogo +18 de ficção e paródia.",
    images: ["/bancada_logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased selection:bg-kavers-purple selection:text-white min-h-screen flex flex-col relative">
        <BrandHeader />
        <AdTickerBanner />
        {children}
        <BrandFooter />
        <FloatingDock />
      </body>
    </html>
  );
}
