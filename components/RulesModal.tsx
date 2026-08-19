"use client";

import React from "react";
import { X, HelpCircle } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 relative border border-stadium-border/60 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-full bg-paper-light/60 dark:bg-stadium-dark/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-grass dark:text-volt">
          <HelpCircle className="w-6 h-6 stroke-[2.5]" />
          <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase">Como Jogar?</h2>
        </div>

        <div className="space-y-4 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
          <div className="flex items-start gap-3 bg-paper-light/60 dark:bg-stadium-dark/60 p-3 rounded-2xl border border-paper-border dark:border-stadium-border">
            <span className="w-6 h-6 rounded-full bg-grass dark:bg-volt text-white dark:text-black font-black flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <p>
              Você recebe um <strong className="text-grass dark:text-volt font-bold">Jogador Inicial</strong> e um <strong className="text-terracotta dark:text-flame font-bold">Jogador Alvo</strong>.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-paper-light/60 dark:bg-stadium-dark/60 p-3 rounded-2xl border border-paper-border dark:border-stadium-border">
            <span className="w-6 h-6 rounded-full bg-grass dark:bg-volt text-white dark:text-black font-black flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <p>
              Adicione jogadores intermediários. Para que o elo seja válido, os dois jogadores consecutivos devem ter jogado juntos em uma <strong>partida oficial</strong>.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-paper-light/60 dark:bg-stadium-dark/60 p-3 rounded-2xl border border-paper-border dark:border-stadium-border">
            <span className="w-6 h-6 rounded-full bg-grass dark:bg-volt text-white dark:text-black font-black flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <p>
              O objetivo é chegar ao Jogador Alvo com o <strong>menor número de graus de separação</strong> possível!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3.5 rounded-2xl bg-grass dark:bg-volt text-white dark:text-black font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Entendi, Vamos Jogar!
        </button>
      </div>
    </div>
  );
}
