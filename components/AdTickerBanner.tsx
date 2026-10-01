"use client";

import React from "react";
import { Megaphone, Mail, Sparkles } from "lucide-react";

export function AdTickerBanner() {
  const adText = (
    <div className="flex items-center gap-6 px-4 whitespace-nowrap">
      <span className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wider text-xs sm:text-sm">
        <Megaphone className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
        ESPAÇO PUBLICITÁRIO DISPONÍVEL
      </span>
      <span className="text-zinc-300 text-xs sm:text-sm">
        Anuncie sua marca, canal ou torcida no <strong className="text-white">Simulador de Torcida Organizada</strong>!
      </span>
      <a
        href="mailto:contato@kaversgames.com.br?subject=An%C3%BAncio%20no%20Simulador%20de%20Bancada"
        className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-3 py-1 rounded-full transition-colors shadow-md hover:scale-105 transform active:scale-95"
      >
        <Mail className="w-3.5 h-3.5" />
        ANUNCIE AQUI: contato@kaversgames.com.br
      </a>
      <span className="flex items-center gap-1 text-purple-400 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        Kavers Games
      </span>
      <span className="text-zinc-500">•</span>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-y border-amber-500/30 overflow-hidden py-2 shadow-inner relative z-30 select-none">
      <div className="flex w-max animate-marquee">
        {adText}
        {adText}
        {adText}
        {adText}
      </div>
    </div>
  );
}
