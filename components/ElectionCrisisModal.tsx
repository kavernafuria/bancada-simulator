"use client";

import React from "react";
import { Newspaper, Users, Drum, Swords, AlertTriangle, ChevronRight, TrendingDown, Radio } from "lucide-react";
import { ElectionCrisisInfo, OfficialTorcida } from "@/lib/bancada_engine";

interface ElectionCrisisModalProps {
  torcida: OfficialTorcida;
  crisis: ElectionCrisisInfo;
  onDismiss: () => void;
}

export function ElectionCrisisModal({ torcida, crisis, onDismiss }: ElectionCrisisModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-red-500/50 bg-zinc-950 p-6 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/20 p-2.5 text-red-400 border border-red-500/40">
              <Newspaper className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300 uppercase border border-red-500/40">
                IMPRENSA ESPORTIVA • ÚLTIMA HORA
              </span>
              <h2 className="text-lg font-black uppercase text-zinc-100 flex items-center gap-2">
                Racha Eleitoral na Posse ({torcida.tier})
              </h2>
            </div>
          </div>
        </div>

        {/* News Flash Container */}
        <div className="my-5 rounded-xl border border-red-900/40 bg-gradient-to-b from-red-950/40 via-zinc-900 to-zinc-950 p-5 shadow-inner">
          <div className="flex items-center justify-between text-xs text-red-400">
            <span className="font-bold flex items-center gap-1.5 uppercase">
              <Radio className="h-3.5 w-3.5 animate-pulse text-red-500" />
              Diário da Arquibancada • São Paulo
            </span>
            <span className="text-[10px] text-zinc-400 uppercase">Temporada 1</span>
          </div>

          <h3 className="mt-3 text-base font-black uppercase text-red-200 tracking-tight leading-snug">
            {crisis.headline}
          </h3>

          <p className="mt-2 text-xs font-medium text-zinc-300 leading-relaxed italic">
            &quot;{crisis.subheadline}&quot;
          </p>
        </div>

        {/* Stat Impact Grid */}
        <div className="space-y-2 mb-6">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            Impactos Imediatos da Dissidência Política:
          </span>

          <div className="grid grid-cols-5 gap-1.5">
            {/* Contingente */}
            <div className="rounded-xl border border-red-900/40 bg-zinc-900/80 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                <Users className="h-3 w-3 text-amber-400" />
                <span>Massa</span>
              </div>
              <div className="mt-1 text-sm font-black text-red-400 flex flex-col items-center">
                <span>-{crisis.lostContingente}</span>
                <span className="text-[9px] text-zinc-500 font-normal">
                  ({crisis.originalContingente}➔{torcida.contingente})
                </span>
              </div>
            </div>

            {/* Pista */}
            <div className="rounded-xl border border-red-900/40 bg-zinc-900/80 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                <Swords className="h-3 w-3 text-red-400" />
                <span>Pista</span>
              </div>
              <div className="mt-1 text-sm font-black text-red-400 flex flex-col items-center">
                <span>-{crisis.lostPista}</span>
                <span className="text-[9px] text-zinc-500 font-normal">
                  ({crisis.originalPista}➔{torcida.poder_pista})
                </span>
              </div>
            </div>

            {/* Bancada */}
            <div className="rounded-xl border border-red-900/40 bg-zinc-900/80 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                <Drum className="h-3 w-3 text-emerald-400" />
                <span>Bancada</span>
              </div>
              <div className="mt-1 text-sm font-black text-red-400 flex flex-col items-center">
                <span>-{crisis.lostBancada}</span>
                <span className="text-[9px] text-zinc-500 font-normal">
                  ({crisis.originalBancada}➔{torcida.pressao_bancada})
                </span>
              </div>
            </div>

            {/* Caravana */}
            <div className="rounded-xl border border-red-900/40 bg-zinc-900/80 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                <span>🚌 Caravana</span>
              </div>
              <div className="mt-1 text-sm font-black text-red-400 flex flex-col items-center">
                <span>-{crisis.lostCaravana}</span>
                <span className="text-[9px] text-zinc-500 font-normal">
                  ({crisis.originalCaravana}➔{torcida.caravana})
                </span>
              </div>
            </div>

            {/* Autonomia */}
            <div className="rounded-xl border border-red-900/40 bg-zinc-900/80 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                <span>💰 Autonomia</span>
              </div>
              <div className="mt-1 text-sm font-black text-red-400 flex flex-col items-center">
                <span>-{crisis.lostAutonomia}</span>
                <span className="text-[9px] text-zinc-500 font-normal">
                  ({crisis.originalAutonomia}➔{torcida.autonomia_financeira})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onDismiss}
          className="w-full rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-emerald-600 py-3.5 text-xs font-black uppercase text-zinc-950 tracking-wider hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <span>Assumir o Desafio e Pacificar a Torcida</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
