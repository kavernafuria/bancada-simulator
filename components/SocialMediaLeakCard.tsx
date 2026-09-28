"use client";

import React from "react";
import { SocialMediaLeak } from "@/lib/bancada_engine";
import { CheckCircle2, Eye, Heart, Share2, Flame } from "lucide-react";

interface SocialMediaLeakCardProps {
  leak: SocialMediaLeak;
  onDismiss?: () => void;
}

export const SocialMediaLeakCard: React.FC<SocialMediaLeakCardProps> = ({ leak, onDismiss }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-zinc-950 p-4 shadow-xl text-left space-y-3 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full ${leak.avatarColor} flex items-center justify-center text-white font-black text-xs shadow`}>
            {leak.handle === "@ritmodetorcida" ? "🥁" : "🚨"}
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-black text-white">{leak.profileName}</span>
              {leak.verified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />}
            </div>
            <span className="text-[10px] font-mono text-zinc-400">{leak.handle} • {leak.postedAgo}</span>
          </div>
        </div>
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[9px] font-black text-red-400 uppercase tracking-wider animate-pulse">
          <Flame className="w-3 h-3 mr-0.5" /> VAZAMENTO VIRAL
        </span>
      </div>

      {/* Main Content Body */}
      <div>
        <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">
          {leak.headline}
        </h4>
        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
          {leak.snippetText}
        </p>
      </div>

      {/* Engagement Stats Bar */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-900/80 rounded-lg px-3 py-1.5 border border-zinc-800/60 font-mono">
        <span className="flex items-center space-x-1">
          <Eye className="w-3.5 h-3.5 text-zinc-500" />
          <span>{leak.viewsCount} views</span>
        </span>
        <span className="flex items-center space-x-1">
          <Heart className="w-3.5 h-3.5 text-red-400" />
          <span>{leak.likesCount}</span>
        </span>
        <span className="flex items-center space-x-1">
          <Share2 className="w-3.5 h-3.5 text-sky-400" />
          <span>{leak.sharesCount}</span>
        </span>
      </div>

      {/* Impact Indicators */}
      <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-bold">
        {leak.impactDeltas.poder_pista && (
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
            Poder de Pista: +{leak.impactDeltas.poder_pista}
          </span>
        )}
        {leak.impactDeltas.moral && (
          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-400">
            Moral do Bonde: +{leak.impactDeltas.moral}
          </span>
        )}
        {leak.impactDeltas.pressao_bancada && (
          <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-400">
            Bancada: +{leak.impactDeltas.pressao_bancada}
          </span>
        )}
        {leak.impactDeltas.risco_mp && (
          <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-400">
            Risco MP: +{leak.impactDeltas.risco_mp}%
          </span>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="w-full mt-2 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition border border-zinc-700"
        >
          CONTINUAR ➔
        </button>
      )}
    </div>
  );
};
