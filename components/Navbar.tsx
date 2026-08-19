"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link2, TrendingUp, Trophy } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const isEloPerdido = pathname === "/";
  const isHigherLower = pathname?.startsWith("/higher-lower");

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-pitch-400/30 px-3 py-2 shadow-xl">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pitch-accent to-emerald-700 flex items-center justify-center text-white shadow-md shadow-pitch-accent/20">
            <span className="text-base">⚽</span>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white hidden sm:inline">
            ARENA FUTEBOL
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-pitch-950/80 p-1 rounded-xl border border-pitch-700/60">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isEloPerdido
                ? "bg-pitch-accent text-black shadow-md shadow-pitch-accent/20"
                : "text-zinc-400 hover:text-white hover:bg-pitch-800/60"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Elo Perdido</span>
          </Link>

          <Link
            href="/higher-lower"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isHigherLower
                ? "bg-pitch-gold text-black shadow-md shadow-pitch-gold/20"
                : "text-zinc-400 hover:text-white hover:bg-pitch-800/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Quem Tem Mais?</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
