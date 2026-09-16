"use client";

import React from "react";
import { Flag, Flame, Music, Coffee, Zap } from "lucide-react";
import { TeamPitchInfo } from "./TacticalPitch";

export interface ActionDef {
  id: string;
  name: string;
  shortLabel: string;
  cost: number;
  icon: string | React.ReactNode;
  costBadge: string;
  description: string;
}

interface ArquibancadaVisualizerProps {
  homeTeam: TeamPitchInfo;
  isBannerUp: boolean;
  hasVerticalStripes: boolean;
  hasFlares: boolean;
  isChanting: boolean;
  isDrumming: boolean;
  hasMosaic: boolean;
  activeChantText: string | null;
  crowdEnergy: number; // 0 to 100
  pressure: number; // 0 to 100
  decibels: number;
  isAbove85: boolean;
  isGameOver: boolean;
  onAction: (actionId: string) => void;
  cooldowns?: Record<string, number>;
}

export const ArquibancadaVisualizer: React.FC<ArquibancadaVisualizerProps> = ({
  homeTeam,
  isBannerUp,
  hasVerticalStripes,
  hasFlares,
  isChanting,
  isDrumming,
  hasMosaic,
  activeChantText,
  crowdEnergy,
  pressure,
  decibels,
  isAbove85,
  isGameOver,
  onAction,
  cooldowns = {},
}) => {
  const actions: ActionDef[] = [
    {
      id: "grito",
      name: "Grito de Guerra",
      shortLabel: "Grito",
      cost: 14,
      icon: "📢",
      costBadge: "-14 EN",
      description: "Canta o hino e eleva decibéis",
    },
    {
      id: "bandeirao",
      name: "Subir Bandeirão",
      shortLabel: "Bandeirão",
      cost: 28,
      icon: <Flag className="w-4 h-4 text-rose-400" />,
      costBadge: "-28 EN",
      description: "Impede a visão rival e intimida",
    },
    {
      id: "faixas",
      name: "Esticar Faixas",
      shortLabel: "Faixas",
      cost: 16,
      icon: "🎗️",
      costBadge: "-16 EN",
      description: "Faixas verticais tradicionais",
    },
    {
      id: "sinalizadores",
      name: "Sinalizadores",
      shortLabel: "Sinalizador",
      cost: 24,
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      costBadge: "-24 EN",
      description: "Fumaça e fogo no caldeirão",
    },
    {
      id: "bateria",
      name: "Puxar Bateria",
      shortLabel: "Bateria",
      cost: 10,
      icon: <Music className="w-4 h-4 text-purple-400" />,
      costBadge: "-10 EN",
      description: "Ritmo rápido para frear a queda de pressão",
    },
    {
      id: "descanso",
      name: "Hidratar Bancada",
      shortLabel: "Hidratar",
      cost: 0,
      icon: <Coffee className="w-4 h-4 text-sky-400" />,
      costBadge: "+30 EN",
      description: "Restaura fôlego com perda de 12% de pressão",
    },
  ];

  const primaryCol = homeTeam.primaryColor || "#000000";
  const secondaryCol = homeTeam.secondaryColor || "#f59e0b";

  return (
    <div className="w-full flex flex-col gap-3">
      {/* O Caldeirão Visual Container */}
      <div
        className={`relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border transition-all duration-300 shadow-2xl flex flex-col justify-between p-4 ${
          isAbove85
            ? "border-amber-400/90 ring-2 ring-amber-500/60 shadow-amber-500/30"
            : "border-zinc-800 bg-zinc-950"
        }`}
        style={{
          background: `linear-gradient(180deg, #09090b 0%, #18181b 50%, ${primaryCol}44 100%)`,
        }}
      >
        {/* Camadas da Arquibancada */}
        {/* Fumaça vermelha/amarela de Sinalizadores */}
        {hasFlares && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-80 animate-pulse z-10"
            style={{
              background: `radial-gradient(circle at 50% 100%, ${secondaryCol}, rgba(239, 68, 68, 0.5) 40%, transparent 80%)`,
            }}
          />
        )}

        {/* Faixas Verticais descendo da bancada */}
        {hasVerticalStripes && (
          <div className="absolute inset-0 flex justify-around pointer-events-none opacity-90 z-15">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={`stripe-${i}`}
                className="w-4 sm:w-6 h-full shadow-lg border-x border-white/20 animate-in slide-in-from-top duration-500"
                style={{
                  backgroundColor: i % 2 === 0 ? primaryCol : secondaryCol,
                }}
              />
            ))}
          </div>
        )}

        {/* Bandeirão cobrindo a galera */}
        {isBannerUp && (
          <div className="absolute inset-x-6 bottom-4 top-12 rounded-xl border-2 border-white/80 shadow-2xl z-20 overflow-hidden flex flex-col items-center justify-center animate-in zoom-in-95 duration-300"
               style={{ backgroundColor: primaryCol }}>
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center border-4 border-amber-400/50">
              <span className="text-2xl sm:text-4xl font-black uppercase text-white tracking-widest drop-shadow-md">
                {homeTeam.name}
              </span>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest mt-1">
                ORGANIZADA OFICIAL • PAVILHÃO PRINCIPAL
              </span>
            </div>
          </div>
        )}

        {/* Mosaico 3D nas cadeiras superiores */}
        {hasMosaic && (
          <div className="absolute inset-x-0 top-0 h-16 pointer-events-none grid grid-cols-12 gap-0.5 opacity-90 z-5">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={`mosaic-${i}`}
                className="h-full border border-black/30"
                style={{
                  backgroundColor: (i + Math.floor(i / 12)) % 2 === 0 ? primaryCol : secondaryCol,
                }}
              />
            ))}
          </div>
        )}

        {/* Cântico Ativo / Grito no Alto */}
        {activeChantText && (
          <div className="relative z-30 self-center max-w-md w-full px-4 py-2 bg-black/85 backdrop-blur-md rounded-2xl border border-amber-400 text-center shadow-xl animate-in fade-in duration-200">
            <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
              📢 GRITO DE GUERRA ECOANDO NO ESTÁDIO
            </div>
            <p className="text-xs sm:text-sm font-black text-white italic tracking-wide mt-0.5">
              &quot;{activeChantText}&quot;
            </p>
          </div>
        )}

        {/* Multidão de Torcedores (Silhuetas & Balanço) */}
        <div className="relative z-10 w-full h-24 mt-auto flex items-end justify-between px-2 overflow-hidden pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={`fan-${i}`}
              className={`flex flex-col items-center transition-transform duration-300 ${
                isChanting ? "animate-bounce" : ""
              }`}
              style={{
                transform: `scale(${0.8 + (i % 3) * 0.15}) translateY(${isDrumming ? -6 : 0}px)`,
              }}
            >
              <div
                className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                style={{ backgroundColor: i % 2 === 0 ? primaryCol : secondaryCol }}
              />
              <div
                className="w-5 h-8 rounded-t-sm shadow-inner"
                style={{ backgroundColor: i % 3 === 0 ? primaryCol : secondaryCol }}
              />
            </div>
          ))}
        </div>

        {/* Top Info Overlay */}
        <div className="relative z-30 flex items-center justify-between text-xs font-black uppercase text-white">
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-zinc-800">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Decibéis da Bancada:</span>
            <span className="text-amber-400 font-mono text-sm">{decibels} dB</span>
          </div>

          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-zinc-800">
            <span>Fôlego/Energia:</span>
            <span className={crowdEnergy < 25 ? "text-red-500 animate-pulse font-mono text-sm" : "text-emerald-400 font-mono text-sm"}>
              {crowdEnergy}%
            </span>
          </div>
        </div>
      </div>

      {/* PAINEL DE BOTÕES DE AÇÃO INTEGRADO NA BANCA */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {actions.map((act) => {
          const cd = cooldowns[act.id] || 0;
          const isCd = cd > 0;
          const notEnoughEn = act.cost > 0 && crowdEnergy < act.cost;
          const disabled = isGameOver || isCd || notEnoughEn;

          return (
            <button
              key={act.id}
              type="button"
              disabled={disabled}
              onClick={() => onAction(act.id)}
              className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none min-h-[82px] ${
                disabled
                  ? "bg-zinc-950/80 border-zinc-850 text-zinc-600 opacity-60 cursor-not-allowed"
                  : act.id === "descanso"
                  ? "bg-sky-950/40 border-sky-500/60 hover:bg-sky-900/60 text-sky-200 active:scale-95 shadow-md"
                  : "bg-zinc-900/90 border-zinc-800 hover:border-amber-500 hover:bg-zinc-850 text-white active:scale-95 shadow-md"
              }`}
            >
              <div className="text-lg mb-0.5">{act.icon}</div>
              <span className="text-[11px] font-black uppercase tracking-tight line-clamp-1">
                {act.shortLabel}
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mt-1 ${
                  act.cost === 0
                    ? "bg-sky-900/80 text-sky-300"
                    : "bg-zinc-950 text-amber-400 border border-zinc-800"
                }`}
              >
                {isCd ? `${cd}s` : act.costBadge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
