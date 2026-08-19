import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";
import { FloatingDock } from "@/components/FloatingDock";

export const metadata: Metadata = {
  title: "Kavers Games ⚽ Futebol • Elo Perdido & Quem Tem Mais?",
  description: "Jogos diários e desafios de futebol do universo Kavers Games. Reúna a galera e desafie seus amigos!",
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
        {children}
        <BrandFooter />
        <FloatingDock />
      </body>
    </html>
  );
}
