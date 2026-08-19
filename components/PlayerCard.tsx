"use client";

import React from "react";
import { Shield, Target } from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";

export interface PlayerData {
  id: string;
  name: string;
  club: string | null;
  nationality: string | null;
  photoUrl: string | null;
}

interface PlayerCardProps {
  player: PlayerData;
  type: "start" | "intermediate" | "target";
  isCompleted?: boolean;
  stepIndex?: number;
  onRemove?: () => void;
}

export function PlayerCard({
  player,
  type,
  stepIndex,
  onRemove,
}: PlayerCardProps) {
  const isStart = type === "start";
  const isTarget = type === "target";

  return (
    <div
      className={`relative w-full rounded-2xl p-4 transition-all duration-200 shadow-lg active:scale-[0.99] cursor-default border ${
        isStart
          ? "bg-gradient-to-r from-kavers-purple/25 to-paper-card dark:from-kavers-purple/20 dark:to-kavers-card border-kavers-purple shadow-kavers-purple/10"
          : isTarget
          ? "bg-gradient-to-r from-kavers-magenta/25 to-paper-card dark:from-kavers-magenta/20 dark:to-kavers-card border-kavers-magenta shadow-kavers-magenta/10"
          : "glass-panel border-kavers-light-border dark:border-kavers-border hover:border-kavers-purple/60"
      }`}
    >
      <div className="flex items-center gap-3.5">
        {/* Collectible Avatar */}
        <div className="relative">
          <PlayerAvatar
            photo={player.photoUrl}
            name={player.name}
            country={player.nationality}
            size="md"
          />

          {/* Card Badge */}
          <div className="absolute -bottom-1.5 -right-1.5 shadow-md z-10">
            {isStart && (
              <div className="bg-kavers-purple text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                CARTA 1
              </div>
            )}
            {isTarget && (
              <div className="bg-kavers-magenta text-white p-1 rounded-md">
                <Target className="w-3 h-3" />
              </div>
            )}
            {!isStart && !isTarget && stepIndex !== undefined && (
              <div className="bg-kavers-purple text-white text-[10px] font-black w-4 h-4 rounded-md flex items-center justify-center shadow">
                {stepIndex}
              </div>
            )}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-black text-zinc-900 dark:text-white text-base truncate leading-tight tracking-tight">
              {player.name}
            </h3>

            {onRemove && (
              <button
                onClick={onRemove}
                className="text-[11px] font-bold text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 px-2 py-0.5 rounded-lg bg-kavers-light/80 dark:bg-kavers-dark/60 border border-kavers-light-border dark:border-kavers-border transition-colors shrink-0"
                title="Remover carta"
              >
                Desfazer
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            {player.club && (
              <span className="flex items-center gap-1 truncate font-semibold">
                <Shield className="w-3.5 h-3.5 text-kavers-purple shrink-0" />
                <span className="truncate">{player.club}</span>
              </span>
            )}
            {player.nationality && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-kavers-light-border/60 dark:bg-kavers-dark text-zinc-600 dark:text-zinc-300 shrink-0 uppercase tracking-wider">
                {player.nationality}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
