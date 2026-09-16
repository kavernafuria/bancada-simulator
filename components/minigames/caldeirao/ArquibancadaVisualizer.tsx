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
    <div className="relative w-full h-80 sm:h-84 rounded-2xl overflow-hidden border border-zinc-800 bg-[#070c18] shadow-2xl flex flex-col justify-between px-4 pt-4 pb-0 select-none">
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

        <div className="px-3 py-1 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-xs font-mono font-bold text-cyan-400 shadow flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{decibels} dB</span>
        </div>
      </div>

      {/* Stadium Rim Light & Atmosphere */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-sky-950/20 via-transparent to-zinc-950" />

      {/* Sinalizadores & Fumaça de Fogo */}
      {hasFlares && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-85 animate-pulse z-15"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${secondaryCol}, rgba(239, 68, 68, 0.8) 45%, transparent 85%)`,
          }}
        />
      )}

      {/* FAIXAS VERTICAIS: Aparecem APENAS ao acionar o comando FAIXAS (hasVerticalStripes) */}
      {hasVerticalStripes && (
        <div className="absolute inset-0 flex justify-around pointer-events-none opacity-95 z-20 animate-in fade-in duration-300">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`stripe-${i}`}
              className="w-4 sm:w-5 h-full shadow-2xl border-x-2 border-amber-400/80 bg-gradient-to-b from-amber-400 via-sky-500 to-amber-400 opacity-90 animate-pulse"
              style={{
                backgroundColor: i % 2 === 0 ? secondaryCol : primaryCol,
              }}
            />
          ))}
        </div>
      )}

      {/* SUBIDA DO BANDEIRÃO GIGANTE DE PAVILHÃO (Cobrir todas as Pessoas) */}
      <div
        className={`absolute inset-x-2 top-10 bottom-0 z-40 rounded-t-2xl shadow-2xl border-t-4 border-amber-400 overflow-hidden flex flex-col items-center justify-center transition-all duration-700 ease-out transform ${
          isBannerUp ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{
          background: `linear-gradient(135deg, ${primaryCol} 0%, ${secondaryCol} 50%, ${primaryCol} 100%)`,
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-xs border-2 border-amber-400/40 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/70 pointer-events-none" />

          <span className="text-3xl sm:text-4xl font-black uppercase text-white tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] z-10 animate-pulse">
            {homeTeam.name}
          </span>
          <div className="h-1 w-36 bg-amber-400 my-2.5 rounded-full shadow-lg z-10" />
          <span className="text-xs font-black text-amber-300 uppercase tracking-widest z-10 drop-shadow">
            ★ PAVILHÃO PRINCIPAL • APOIO ININTERRUPTO ★
          </span>
        </div>
      </div>

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
        <div className="relative z-30 self-center max-w-md w-full px-4 py-2 bg-black/90 backdrop-blur-md rounded-2xl border border-amber-400 text-center shadow-xl">
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
            📢 CANTO OFICIAL DA TORCIDA
          </div>
          <p className="text-xs sm:text-sm font-black text-white italic tracking-wide mt-0.5">
            &quot;{activeChantText}&quot;
          </p>
        </div>
      )}

      {/* TORCIDA DE ARQUIBANCADA (3 Tiers com Movimento Contínuo e Vibrante) */}
      <div className="relative z-10 w-full h-48 mt-auto flex flex-col justify-end gap-2 pb-1 pointer-events-none">
        {/* Tier 3 (Fundo / Degrau Superior - Movimento Continuo) */}
        <div className="flex justify-around items-end opacity-80">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`row3-${i}`}
              className={`flex flex-col items-center transition-transform duration-300 ${
                i % 2 === 0 ? "animate-pulse" : ""
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
                style={{ backgroundColor: i % 2 === 0 ? secondaryCol : "#ffffff" }}
              />
              <div
                className="w-3.5 h-5 rounded-t-sm"
                style={{ backgroundColor: i % 2 === 0 ? primaryCol : secondaryCol }}
              />
            </div>
          ))}
        </div>

        {/* Tier 2 (Meio / Degrau Intermediário - Alternado Pulando/Balançando) */}
        <div className="flex justify-around items-end opacity-90">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`row2-${i}`}
              className={`flex flex-col items-center transition-transform duration-300 ${
                isDrumming || i % 2 === 0 ? "animate-bounce" : "animate-pulse"
              }`}
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm"
                style={{ backgroundColor: i % 3 === 0 ? "#ffffff" : secondaryCol }}
              />
              <div
                className="w-4 h-6.5 rounded-t-sm shadow"
                style={{ backgroundColor: i % 2 === 0 ? primaryCol : "#ffffff" }}
              />
            </div>
          ))}
        </div>

        {/* Tier 1 (Frente / Degrau Principal - Torcida Ativa Vibrando sem Parar) */}
        <div className="flex justify-around items-end">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`row1-${i}`}
              className={`flex flex-col items-center transition-all duration-300 ${
                isChanting || i % 3 === 0
                  ? "-translate-y-3.5 animate-bounce"
                  : i % 2 === 0
                  ? "-translate-y-1 animate-pulse"
                  : ""
              }`}
            >
              {/* Cabeça do Torcedor */}
              <div
                className="w-4 h-4 rounded-full border-2 border-white/70 shadow-md relative z-10"
                style={{ backgroundColor: i % 2 === 0 ? secondaryCol : "#ffffff" }}
              />
              {/* Corpo / Tronco do Torcedor */}
              <div
                className="w-5.5 h-9 rounded-t-md shadow-xl border-t border-white/40 relative flex items-center justify-center"
                style={{ backgroundColor: i % 2 === 0 ? primaryCol : secondaryCol }}
              >
                {/* Detalhe da Camisa da Torcida */}
                <div className="w-1.5 h-full bg-white/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
