"use client";

import React from "react";
import { Heart } from "lucide-react";

export function BrandFooter() {
  return (
    <footer className="w-full py-6 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-paper-border/60 dark:border-kavers-border/40 mt-auto mb-16">
      <div className="max-w-md mx-auto space-y-1.5">
        <p className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5">
          Um jogo original do universo <span className="text-kavers-purple font-black">Kavers Games</span>{" "}
          <button
            type="button"
            className="px-1.5 py-0.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black hover:scale-110 active:scale-95 transition-all shadow cursor-pointer inline-flex items-center gap-1"
            title="Soco de Bancada"
          >
            👊
          </button>
        </p>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 font-medium">
          Feito para reunir a galera e desafiar amigos no bar, na resenha ou online.
        </p>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 tracking-wider font-mono pt-1">
          © {new Date().getFullYear()} Kavers Games • Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
