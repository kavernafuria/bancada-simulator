"use client";

import React from "react";
import { Link2 } from "lucide-react";

interface ConnectionBadgeProps {
  matchInfo: string;
  year?: number | null;
}

export function ConnectionBadge({ matchInfo, year }: ConnectionBadgeProps) {
  return (
    <div className="flex flex-col items-center my-1 relative">
      {/* Top vertical tactical connector line */}
      <div className="w-1 h-3.5 bg-gradient-to-b from-grass to-emerald-400 dark:from-volt dark:to-emerald-500 rounded-full"></div>

      {/* Connection Info Badge */}
      <div className="bg-grass/10 dark:bg-volt/10 border-2 border-grass/50 dark:border-volt/50 rounded-full px-3.5 py-1 text-xs text-grass dark:text-volt font-black flex items-center gap-1.5 shadow-md my-0.5 animate-fade-in">
        <Link2 className="w-3.5 h-3.5 shrink-0 text-grass dark:text-volt animate-pulse stroke-[2.5]" />
        <span className="truncate max-w-[240px] uppercase tracking-wider">{matchInfo}</span>
        {year && <span className="text-[10px] opacity-80 font-mono">({year})</span>}
      </div>

      {/* Bottom vertical tactical connector line */}
      <div className="w-1 h-3.5 bg-gradient-to-b from-emerald-400 to-grass dark:from-emerald-500 dark:to-volt rounded-full"></div>
    </div>
  );
}
