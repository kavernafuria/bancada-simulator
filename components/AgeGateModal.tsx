"use client";

import React, { useState } from "react";
import { ShieldAlert, Drum, LogOut, CheckCircle } from "lucide-react";

interface AgeGateModalProps {
  onConfirmAge: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ onConfirmAge }) => {
  const [exited, setExited] = useState(false);

  const handleExit = () => {
    setExited(true);
  };

  if (exited) {
    return (
      <div className="fixed inset-0 z-[999] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mb-2">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black uppercase text-white tracking-tight">
          Acesso Não Permitido
        </h2>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
          Você optou por não confirmar a idade mínima de 18 anos. O acesso ao <strong>Bancada Simulator</strong> está restrito.
        </p>
        <button
          onClick={() => setExited(false)}
          className="py-2.5 px-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500 text-amber-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer mt-4"
        >
          Voltar à Tela de Confirmação
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Brand Icon Header */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
          <Drum className="w-7 h-7" />
        </div>

        {/* Header Titles */}
        <div className="space-y-1">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
            BANCADA SIMULATOR
          </span>
          <h1 className="text-lg font-black uppercase text-white tracking-tight">
            CONTEÚDO PARA MAIORES DE 18 ANOS
          </h1>
        </div>

        {/* Informational Warning Box */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-left space-y-2">
          <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Aviso de Restrição de Idade</span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            Este jogo é destinado a <strong>maiores de 18 anos</strong> e pode apresentar temas, linguagem e elementos destinados ao público adulto.
          </p>

          <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold border-t border-zinc-900 pt-2">
            Ao entrar, você confirma que possui <strong>18 anos ou mais</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onConfirmAge}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> TENHO 18 ANOS — ENTRAR
          </button>

          <button
            onClick={handleExit}
            className="w-full py-2.5 px-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> SAIR
          </button>
        </div>
      </div>
    </div>
  );
};
