"use client";

import React from "react";
import { TeamPitchInfo } from "./TacticalPitch";

interface ArquibancadaVisualizerProps {
  homeTeam: TeamPitchInfo;
  isBannerUp: boolean;
  hasVerticalStripes: boolean;
  hasFlares: boolean;
  isChanting: boolean;
  isDrumming: boolean;
  hasMosaic: boolean;
  activeChantText: string | null;
  decibels: number;
  isAbove85: boolean;
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
  decibels,
  isAbove85,
}) => {
  const primaryCol = homeTeam.primaryColor || "#0284c7";
  const secondaryCol = homeTeam.secondaryColor || "#f59e0b";

  return (
    <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-zinc-800 bg-[#070c18] shadow-2xl flex flex-col justify-between p-4 select-none">
      {/* Header Bar inside Visualizer */}
      <div className="relative z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-white tracking-wider">
            BANCADA: {homeTeam.name}
          </span>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300 border border-zinc-700/80">
            Estádio Monumental
          </span>
        </div>

        <div className="px-3 py-1 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-xs font-mono font-bold text-cyan-400 shadow">
          {decibels} dB
        </div>
      </div>

      {/* Stadium Rim Light & Atmosphere */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-sky-950/20 via-transparent to-zinc-950" />

      {/* Sinalizadores & Fumaça de Fogo */}
      {hasFlares && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-80 animate-pulse z-15"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${secondaryCol}, rgba(239, 68, 68, 0.7) 45%, transparent 85%)`,
          }}
        />
      )}

      {/* Faixas Verticais descendo pelo setor (Estilo Exato do AI Studio) */}
      {(hasVerticalStripes || isAbove85) && (
        <div className="absolute inset-0 flex justify-around pointer-events-none opacity-90 z-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`stripe-${i}`}
              className="w-4 sm:w-5 h-full shadow-lg border-x border-amber-400/60 bg-gradient-to-b from-amber-400 via-sky-500 to-amber-400 opacity-80"
              style={{
                backgroundColor: i % 2 === 0 ? secondaryCol : primaryCol,
              }}
            />
          ))}
        </div>
      )}

      {/* Subida do Bandeirão Gigante de Pavilhão */}
      {isBannerUp && (
        <div
          className="absolute inset-x-6 bottom-4 top-14 rounded-xl border-2 border-white/80 shadow-2xl z-25 overflow-hidden flex flex-col items-center justify-center animate-in zoom-in-95 duration-300"
          style={{ backgroundColor: primaryCol }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center border-4 border-amber-400/50 bg-black/40">
            <span className="text-2xl sm:text-3xl font-black uppercase text-white tracking-widest drop-shadow-md">
              {homeTeam.name}
            </span>
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mt-1">
              PAVILHÃO PRINCIPAL • APOIO ININTERRUPTO
            </span>
          </div>
        </div>
      )}

      {/* Mosaico Superior */}
      {hasMosaic && (
        <div className="absolute inset-x-0 top-0 h-14 pointer-events-none grid grid-cols-12 gap-0.5 opacity-90 z-10">
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

      {/* Cântico Ecoando na Bancada */}
      {activeChantText && (
        <div className="relative z-30 self-center max-w-md w-full px-4 py-2 bg-black/90 backdrop-blur-md rounded-2xl border border-amber-400 text-center shadow-xl animate-in fade-in duration-200">
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
            📢 CANTO OFICIAL DA TORCIDA
          </div>
          <p className="text-xs sm:text-sm font-black text-white italic tracking-wide mt-0.5">
            &quot;{activeChantText}&quot;
          </p>
        </div>
      )}

      {/* Torcida de Arquibancada (3 Tiers com Estilo AI Studio) */}
      <div className="relative z-10 w-full h-40 mt-auto flex flex-col justify-end gap-1.5 pb-2 pointer-events-none">
        {/* Tier 3 (Fundo / Mais Alto) */}
        <div className="flex justify-around items-end opacity-75">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`row3-${i}`} className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
              <div
                className="w-3.5 h-5 rounded-t-sm"
                style={{ backgroundColor: i % 2 === 0 ? primaryCol : secondaryCol }}
              />
            </div>
          ))}
        </div>

        {/* Tier 2 (Meio) */}
        <div className="flex justify-around items-end opacity-90">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`row2-${i}`}
              className={`flex flex-col items-center transition-transform duration-200 ${
                isDrumming ? "animate-bounce" : ""
              }`}
            >
              <div
                className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
                style={{ backgroundColor: i % 3 === 0 ? "#ffffff" : secondaryCol }}
              />
              <div
                className="w-4 h-6 rounded-t-sm"
                style={{ backgroundColor: i % 2 === 0 ? primaryCol : "#ffffff" }}
              />
            </div>
          ))}
        </div>

        {/* Tier 1 (Frente / Principal) */}
        <div className="flex justify-around items-end">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`row1-${i}`}
              className={`flex flex-col items-center transition-transform duration-300 ${
                isChanting ? "animate-bounce" : ""
              }`}
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/60 shadow"
                style={{ backgroundColor: i % 2 === 0 ? secondaryCol : "#ffffff" }}
              />
              <div
                className="w-4.5 h-7 rounded-t-sm shadow-md"
                style={{ backgroundColor: i % 2 === 0 ? primaryCol : secondaryCol }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
