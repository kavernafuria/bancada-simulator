"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Trophy, Share2, Check, Sparkles, RefreshCw, Dices } from "lucide-react";
import { PlayerData } from "./PlayerCard";

interface WinModalProps {
  isOpen: boolean;
  degreesCount: number;
  minDegrees: number;
  startPlayer: PlayerData;
  targetPlayer: PlayerData;
  dateStr: string;
  onPlayAgain: () => void;
}

export function WinModal({
  isOpen,
  degreesCount,
  minDegrees,
  startPlayer,
  targetPlayer,
  dateStr,
  onPlayAgain,
}: WinModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const interval: ReturnType<typeof setInterval> = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.5 } });
        confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.5 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = () => {
    const greenBlocks = "🟪".repeat(degreesCount);
    const text = `Elo Perdido ⚽ | Kavers Games (${dateStr})\n${startPlayer.name} ➔ ${targetPlayer.name}\nConectado em ${degreesCount} cartas (Mínimo ideal: ${minDegrees})\n${greenBlocks}\n\nDesafie os amigos na mesa: eloperdido.com\n#KaversGames`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-6 text-center shadow-2xl relative border border-kavers-purple/50">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-kavers-purple to-kavers-magenta flex items-center justify-center text-white shadow-xl shadow-kavers-purple/30 mb-4 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-black tracking-widest text-kavers-purple uppercase block mb-0.5">
          DESAFIO DE MESA CONCLUÍDO
        </span>

        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5 uppercase">
          MANDOU BEM! <Sparkles className="w-5 h-5 text-amber-400" />
        </h2>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 font-semibold">
          Você conectou os craques na resenha com o menor número de cartas!
        </p>

        <div className="my-5 bg-kavers-light/90 dark:bg-kavers-dark/90 rounded-2xl p-4 border border-kavers-light-border dark:border-kavers-border grid grid-cols-2 gap-3">
          <div className="border-r border-kavers-light-border dark:border-kavers-border">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-black">Suas Cartas</span>
            <div className="text-2xl font-black text-kavers-purple dark:text-purple-300 mt-0.5">{degreesCount}</div>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-black">Mínimo Ideal</span>
            <div className="text-2xl font-black text-kavers-magenta mt-0.5">{minDegrees}</div>
          </div>
        </div>

        <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-kavers-light/60 dark:bg-kavers-dark/60 rounded-xl p-3 mb-5 border border-kavers-light-border dark:border-kavers-border font-bold">
          <span>{startPlayer.name}</span>
          <span className="mx-2 text-kavers-purple font-black">➔</span>
          <span>{targetPlayer.name}</span>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-kavers-purple to-kavers-magenta text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Resultado Copiado!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.5]" /> Desafiar Galera (#KaversGames)
              </>
            )}
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-4 rounded-xl bg-kavers-light-border/60 dark:bg-kavers-card text-zinc-800 dark:text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-kavers-light-border dark:border-kavers-border"
          >
            <RefreshCw className="w-3.5 h-3.5 text-kavers-purple" /> Jogar Novamente
          </button>
        </div>
      </div>
    </div>
  );
}
