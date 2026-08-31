"use client";

import React, { useState, useEffect } from "react";
import { Tv, Sparkles, X, CheckCircle2, ShieldAlert } from "lucide-react";

interface MockAdModalProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const MockAdModal: React.FC<MockAdModalProps> = ({ onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(4);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleClaimReward = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-zinc-900 border-2 border-amber-500/60 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center relative overflow-hidden">
        {/* DEV MODE BANNER */}
        <div className="bg-amber-500 text-black py-1 px-3 rounded-full text-[9px] font-black tracking-widest uppercase inline-block shadow">
          🛠️ AMBIENTE DE DESENVOLVIMENTO • MOCK AD PROVIDER
        </div>

        {/* Ad Video Simulator Box */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[180px] space-y-3 relative">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center animate-pulse">
            <Tv className="w-6 h-6" />
          </div>

          <span className="text-xs font-black text-white uppercase tracking-wider">
            Simulação de Anúncio Recompensado
          </span>

          {!isFinished ? (
            <div className="space-y-1">
              <span className="text-2xl font-black font-mono text-amber-400">
                00:0{timeLeft}
              </span>
              <p className="text-[10px] text-zinc-400">
                Aguarde o encerramento para receber o bônus...
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="w-8 h-8 mx-auto" />
              <span className="text-xs font-black uppercase tracking-wider block">
                Anúncio Concluído com Sucesso!
              </span>
            </div>
          )}
        </div>

        {/* Explanation */}
        <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
          {isFinished
            ? "Você assistiu ao anúncio completo! Sua recompensa de 2x Contingente para a segunda tentativa foi liberada."
            : "Se você fechar o anúncio antes de zerar o cronômetro, a recompensa de 2x contingente NÃO será concedida."}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isFinished ? (
            <button
              onClick={handleClaimReward}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> RESGATAR 2x CONTINGENTE & REFAZER
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Fechar sem Recompensa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
