"use client";

import React from "react";
import { Dices, ExternalLink } from "lucide-react";

export function BrandHeader() {
  return (
    <header className="w-full bg-paper-card/90 dark:bg-kavers-dark/95 border-b border-paper-border dark:border-kavers-border text-xs py-2.5 px-4 backdrop-blur-md z-40 relative shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Kavers Games Logo & Subdomain Title */}
        <div className="flex items-center gap-2 font-black tracking-tight">
          <span className="bg-gradient-to-r from-amber-500 via-purple-600 to-kavers-magenta text-white px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-widest shadow-md">
            KAVERS GAMES
          </span>
          <span className="text-zinc-400 dark:text-zinc-600 font-bold">|</span>
          <span className="text-zinc-800 dark:text-zinc-100 font-extrabold flex items-center gap-1">
            Futebol ⚽
          </span>
        </div>

        {/* Link to main site kaversgames.com.br */}
        <a
          href="https://kaversgames.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/40 font-bold text-[11px] transition-all active:scale-95 group shadow-sm"
        >
          <Dices className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform text-amber-500" />
          <span>Conhecer Jogos de Cartas</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>
    </header>
  );
}
