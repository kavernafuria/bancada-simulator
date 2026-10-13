"use client";

import React from "react";
import { Users, Swords, Coins, Check, X, AlertTriangle } from "lucide-react";

interface HomeAllySupportModalProps {
  isOpen: boolean;
  allyTorcida: string;
  allyClub: string;
  rivalTorcida: string;
  extraMembers: number;
  pistaBonus: number;
  cost: number;
  currentBalance: number;
  onAccept: () => void;
  onDecline: () => void;
}

export function HomeAllySupportModal({
  isOpen,
  allyTorcida,
  allyClub,
  rivalTorcida,
  extraMembers,
  pistaBonus,
  cost,
  currentBalance,
  onAccept,
  onDecline,
}: HomeAllySupportModalProps) {
  if (!isOpen) return null;

  const canAfford = currentBalance >= cost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* TOP GLOW DECORATION */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />

        {/* HEADER */}
        <div className="p-4 sm:p-6 text-center border-b border-zinc-800 bg-zinc-950/80">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-2">
            <Users className="w-3.5 h-3.5" />
            REFORÇO DE TORCIDA ALIADA EM CASA
          </div>
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-snug">
            OS IRMÃOS DA {allyTorcida.toUpperCase()} ESTÃO A CAMINHO!
          </h2>
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-md bg-red-950/60 border border-red-800 text-red-400 text-[10px] font-black uppercase">
            <AlertTriangle className="w-3 h-3" />
            Mobilização após derrotas seguidas para a {rivalTorcida}
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed text-center">
            Após amargarmos reveses consecutivos contra a rival <span className="text-red-400 font-bold">{rivalTorcida}</span>, 
            a diretoria da nossa aliada <span className="text-emerald-400 font-bold">{allyTorcida}</span> ({allyClub}) 
            avisou que enviará uma caravana pesada para fechar conosco na sede e garantir o domínio do território no entorno do estádio.
          </p>

          {/* IMPACT CARDS */}
          <div className="grid grid-cols-2 gap-2.5 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
            <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-emerald-950 flex flex-col">
              <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" /> Massa Adicional
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-400 mt-1">
                +{extraMembers.toLocaleString()} integrantes
              </span>
              <span className="text-[9px] text-zinc-500 mt-0.5">Soma direta no contingente de pista</span>
            </div>

            <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-blue-950 flex flex-col">
              <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                <Swords className="w-3 h-3 text-blue-400" /> Poder de Pista
              </span>
              <span className="text-sm sm:text-base font-black text-blue-400 mt-1">
                +{pistaBonus} Força de Pista
              </span>
              <span className="text-[9px] text-zinc-500 mt-0.5">Vantagem tática no enfrentamento</span>
            </div>

            <div className="col-span-2 bg-zinc-900/90 p-2.5 rounded-xl border border-amber-950 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" /> Custo de Hospedagem & Sede
                </span>
                <span className="text-[9px] text-zinc-500">Alimentação, recepção e insumos para os aliados</span>
              </div>
              <span className={`text-sm font-black ${canAfford ? "text-amber-400" : "text-red-400"}`}>
                R$ {cost.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>

          {/* BALANCE NOTICE */}
          {!canAfford && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-center text-xs text-red-300 font-bold">
              ❌ Caixa insuficiente (Saldo atual: R$ {currentBalance.toLocaleString("pt-BR")}). É necessário R$ {cost.toLocaleString("pt-BR")} para cobrir a logística de recepção.
            </div>
          )}

          {/* RULES DISCLAIMER */}
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[10px] text-zinc-400 text-center leading-tight">
            🛡️ <strong className="text-zinc-300">Regra de Bancada:</strong> O apoio aliado garante estritamente <strong className="text-emerald-400">Massa (+Contingente)</strong> e <strong className="text-blue-400">Poder de Pista</strong> para o confronto. Pressão de Bancada, Moral e Respeito Nacional não são alterados.
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <button
              onClick={onAccept}
              disabled={!canAfford}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                canAfford
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950 active:scale-95"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
              }`}
            >
              <Check className="w-4 h-4" />
              Receber Aliados na Sede
            </button>

            <button
              onClick={onDecline}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer active:scale-95 border border-zinc-700"
            >
              <X className="w-4 h-4" />
              Dispensar Apoio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
