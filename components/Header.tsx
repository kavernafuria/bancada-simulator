"use client";

import React from "react";
import { Trophy, HelpCircle, RefreshCw } from "lucide-react";

interface HeaderProps {
  dateStr?: string;
  onOpenRules: () => void;
  onReset: () => void;
  isWon?: boolean;
}

export function Header({ dateStr, onOpenRules, onReset, isWon }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-stadium-border/40 px-4 py-3 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Title & Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-volt to-emerald-600 dark:from-volt dark:to-emerald-500 flex items-center justify-center text-black shadow-md shadow-volt/20">
            <span className="text-xl">⚽</span>
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5 leading-none uppercase">
              ELO PERDIDO
            </h1>
            <span className="text-[10px] font-extrabold tracking-wider text-grass dark:text-volt uppercase">
              Desafio Diário {dateStr ? `• ${dateStr}` : ""}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isWon && (
            <span className="bg-amber-500/20 text-amber-600 dark:text-pitch-gold text-xs px-2.5 py-1 rounded-full border border-amber-500/40 flex items-center gap-1 font-extrabold animate-pulse">
              <Trophy className="w-3.5 h-3.5" /> Vitória!
            </span>
          )}

          <button
            onClick={onReset}
            title="Reiniciar partida"
            className="p-2 rounded-full text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-paper-border/50 dark:hover:bg-stadium-card transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRules}
            title="Como jogar"
            className="p-2 rounded-full text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-paper-border/50 dark:hover:bg-stadium-card transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
