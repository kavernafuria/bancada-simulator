"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function BrandFooter() {
  return (
    <footer className="w-full py-8 px-4 text-center mt-auto mb-24 relative z-20">
      <div className="max-w-xl mx-auto rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/90 border border-zinc-700/80 dark:border-zinc-700/80 shadow-2xl backdrop-blur-md p-5 space-y-3">
        <p className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100 flex items-center justify-center gap-2 flex-wrap">
          <span>Um jogo original do universo</span>
          <span className="bg-gradient-to-r from-amber-400 via-purple-400 to-pink-500 bg-clip-text text-transparent font-black tracking-wide">
            Kavers Games
          </span>
          <span
            className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black shadow-sm inline-flex items-center"
            title="Soco de Bancada"
          >
            👊
          </span>
        </p>

        <p className="text-xs text-zinc-300 dark:text-zinc-300 font-medium">
          Feito para reunir a galera e desafiar amigos no bar, na resenha ou online.
        </p>

        <div className="pt-2 border-t border-zinc-700/60 dark:border-zinc-700/60 space-y-2">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-400 font-mono tracking-wider">
            © {new Date().getFullYear()} Kavers Games • Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-zinc-300 dark:text-zinc-300 leading-relaxed max-w-md mx-auto font-normal">
            Jogo de ficção e paródia, +18. Sem vínculo oficial com clubes ou torcidas citados.
            Não incentiva violência.
          </p>
          <p className="text-xs font-bold pt-1 flex items-center justify-center gap-3">
            <Link
              href="/termos"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/60 hover:decoration-amber-300 transition-colors"
            >
              Termos de Uso
            </Link>
            <span className="text-zinc-500">•</span>
            <Link
              href="/privacidade"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/60 hover:decoration-amber-300 transition-colors"
            >
              Privacidade
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
