"use client";

import React from "react";
import { Bus, ShieldAlert, Sparkles, Check, Flame, Users, MapPin } from "lucide-react";
import { Etapa10CaravanChoice } from "@/lib/bancada_engine";

interface Etapa10CaravanModalProps {
  isOpen: boolean;
  choices: Etapa10CaravanChoice[];
  onSelectChoice: (choice: Etapa10CaravanChoice) => void;
}

export function Etapa10CaravanModal({
  isOpen,
  choices,
  onSelectChoice,
}: Etapa10CaravanModalProps) {
  if (!isOpen || !choices || choices.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* TOP GLOW DECORATION */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 animate-pulse" />

        {/* HEADER */}
        <div className="p-4 sm:p-6 text-center border-b border-zinc-800 bg-zinc-950/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-2">
            <Bus className="w-3.5 h-3.5" />
            RODADA FINAL • ETAPA 10 DA TEMPORADA
          </div>
          <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight max-w-2xl mx-auto leading-snug">
            CONSELHO DA DIRETORIA: ESCOLHA ENTRE AS RODADAS FINAIS DO CAMPEONATO QUAL SERA A GRANDE INVASÃO DO ANO
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl mx-auto">
            Defina para qual confronto a agremiação vai mobilizar o comboio principal de ônibus e a maior presença de pista da temporada.
          </p>
        </div>

        {/* CHOICES GRID */}
        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {choices.map((choice) => {
            const isRed = choice.category === "DERBY";
            const isEmerald = choice.category === "IRMANDADE";
            const isAmber = choice.category === "INTERIOR";
            const isPurple = choice.category === "CAPITAL";

            const badgeBg = isRed
              ? "bg-red-950/80 text-red-400 border-red-700/50"
              : isEmerald
              ? "bg-emerald-950/80 text-emerald-400 border-emerald-700/50"
              : isAmber
              ? "bg-amber-950/80 text-amber-400 border-amber-700/50"
              : "bg-purple-950/80 text-purple-400 border-purple-700/50";

            const borderHover = isRed
              ? "hover:border-red-500 hover:shadow-red-950/40"
              : isEmerald
              ? "hover:border-emerald-500 hover:shadow-emerald-950/40"
              : isAmber
              ? "hover:border-amber-500 hover:shadow-amber-950/40"
              : "hover:border-purple-500 hover:shadow-purple-950/40";

            return (
              <div
                key={choice.id}
                className={`group relative bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 ${borderHover} hover:shadow-xl hover:-translate-y-0.5 cursor-pointer`}
                onClick={() => onSelectChoice(choice)}
              >
                <div>
                  {/* BADGE */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${badgeBg}`}>
                      {choice.badgeTitle}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {choice.estado}
                    </span>
                  </div>

                  {/* TITLE & OPPONENT */}
                  <h3 className="text-sm font-black text-white uppercase group-hover:text-amber-400 transition-colors">
                    {choice.title}
                  </h3>
                  <div className="text-xs font-bold text-amber-400/90 mt-0.5 mb-2">
                    Adversário: <span className="text-zinc-200">{choice.rivalTorcida}</span> ({choice.clube})
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {choice.description}
                  </p>
                </div>

                <div>
                  {/* IMPACTS LIST */}
                  <div className="grid grid-cols-2 gap-1.5 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800/80 mb-3 text-[11px]">
                    {choice.impacts.map((imp, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">{imp.label}</span>
                        <span className={`font-black ${imp.isPositive ? "text-emerald-400" : "text-amber-300"}`}>
                          {imp.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* SELECT BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectChoice(choice);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    CONFIRMAR ESTA CARAVANA
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER NOTICE */}
        <div className="p-3 text-center bg-zinc-950 border-t border-zinc-800 text-[10px] text-zinc-400 font-medium">
          💡 A escolha definirá o adversário oficial da Etapa 10 e os atributos da viagem.
        </div>
      </div>
    </div>
  );
}
