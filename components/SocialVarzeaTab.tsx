"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Users,
  Store,
  Zap,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Sparkles,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export interface SocialVarzeaTabProps {
  organizacaoPoints: number; // 0 - 100
  localSponsorsCount: number;
  bankBalance: number;
  riscoMp: number;
  soundEnabled: boolean;
  onApplySocialAction: (action: {
    id: string;
    title: string;
    cost: number;
    orgCost: number;
    logText: string;
    addSponsor?: boolean;
    statEffects?: { contingente?: number; pressao_bancada?: number; poder_pista?: number };
    stateEffects?: { moral?: number; respeito_nacional?: number; relacao_clube?: number };
    deltas: { label: string; value: string; isPositive: boolean }[];
    isVarzeaConvocada?: boolean;
  }) => void;
}

export function SocialVarzeaTab({
  organizacaoPoints,
  localSponsorsCount,
  bankBalance,
  riscoMp,
  onApplySocialAction,
}: SocialVarzeaTabProps) {
  const recurringRevenue = localSponsorsCount * 1500;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-4 animate-fade-in relative z-10">
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase text-white tracking-wide">
              Engajamento Comunitário & Ações Sociais
            </h2>
            <p className="text-[10px] text-zinc-400">
              Ações nos bairros, patrocínios do comércio local e mobilização das quebradas.
            </p>
          </div>
        </div>
      </div>

      {/* MP Risk Sponsor Cancellation Warning */}
      {riscoMp > 75 && (
        <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-2xl flex items-center gap-2 text-red-400 text-[11px] font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            <strong>Aviso de Risco ao Patrocínio:</strong> O Risco MP está acima de 75%! Comércios locais podem cancelar o contrato por medo de violência.
          </span>
        </div>
      )}

      {/* 3 Top Indicators */}
      <div className="grid grid-cols-3 gap-2">
        {/* Indicator 1: Pontos de Organização */}
        <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 space-y-1">
          <span className="text-[9px] font-black text-zinc-400 uppercase flex items-center justify-between">
            <span>Pontos de Organização</span>
            <span className="text-amber-400 font-bold text-[8px]">+20 / Etapa</span>
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" /> {organizacaoPoints}/100
            </span>
            <span className="text-[9px] font-bold text-zinc-500">Energia</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, organizacaoPoints))}%` }}
            />
          </div>
        </div>

        {/* Indicator 2: Patrocinadores Locais */}
        <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 space-y-1">
          <span className="text-[9px] font-black text-zinc-400 uppercase block">
            Patrocinadores Locais
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> {localSponsorsCount} Ativos
            </span>
            <span className="text-[9px] font-bold text-emerald-400">
              +{recurringRevenue > 0 ? `R$ ${recurringRevenue.toLocaleString()}` : "R$ 0"}/etapa
            </span>
          </div>
          <span className="text-[8px] text-zinc-500 block truncate">
            Comércio do bairro & subsedes
          </span>
        </div>

        {/* Indicator 3: Caixa da Torcida */}
        <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 space-y-1">
          <span className="text-[9px] font-black text-zinc-400 uppercase block">
            Caixa Atual
          </span>
          <div className="text-xs font-black text-emerald-400">
            R$ {bankBalance.toLocaleString()}
          </div>
          <span className="text-[8px] text-zinc-500 block truncate">
            Saldo financeiro
          </span>
        </div>
      </div>

      {/* Main Actions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Action 1: Ação Social (Doações & Eventos no Bairro) */}
        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-amber-400" /> Ação Social no Bairro
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                -30 Org.
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 leading-snug">
              Entrega de cestas básicas, campeonatos de futebol infantil e eventos na comunidade.
            </p>

            <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80 space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase block">Impacto da Ação:</span>
              <div className="flex flex-wrap gap-1">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +1 Patrocinador (+R$ 1.500/etapa)
                </span>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  +2 Moral
                </span>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  +2 Respeito
                </span>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  -R$ 4.000 Caixa
                </span>
              </div>
            </div>
          </div>

          <button
            disabled={bankBalance < 4000 || organizacaoPoints < 30}
            onClick={() => {
              onApplySocialAction({
                id: "ACAO_SOCIAL_BAIRRO",
                title: "Ação Social Concluída com Sucesso!",
                cost: 4000,
                orgCost: 30,
                addSponsor: true,
                logText: "Realizou ação social no bairro. Conquistou simpatia da comunidade e atraiu +1 patrocinador local (+R$ 1.500/etapa).",
                stateEffects: { moral: 2, respeito_nacional: 2 },
                deltas: [
                  { label: "Patrocinador Local", value: "+1 (+R$ 1.500/etapa)", isPositive: true },
                  { label: "Moral", value: "+2", isPositive: true },
                  { label: "Respeito Nacional", value: "+2", isPositive: true },
                  { label: "Caixa", value: "-R$ 4.000", isPositive: false },
                  { label: "Pontos Organização", value: "-30", isPositive: false },
                ],
              });
            }}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Executar Ação Social (-R$ 4.000)
          </button>
        </div>

        {/* Action 2: Convocar Torcida de Várzea */}
        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-orange-400 uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-400" /> Convocar Várzea & Quebradas
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                -40 Org.
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 leading-snug">
              Mobiliza os times da várzea e bairros com transporte e ingressos para encher o estádio.
            </p>

            <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80 space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase block">Impacto da Convocação:</span>
              <div className="flex flex-wrap gap-1">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  +3 Massa (Contingente)
                </span>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  +2 Pressão Bancada
                </span>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  -R$ 6.000 Caixa
                </span>
              </div>

              <div className="text-[9px] text-red-400 font-bold border-t border-zinc-800 pt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                <span>Risco: 25% de chance de briga interna entre quebradas.</span>
              </div>
            </div>
          </div>

          <button
            disabled={bankBalance < 6000 || organizacaoPoints < 40}
            onClick={() => {
              onApplySocialAction({
                id: "CONVOCAR_VARZEA",
                title: "Várzea Convocada!",
                cost: 6000,
                orgCost: 40,
                isVarzeaConvocada: true,
                logText: "Mobilizou a Várzea e os bairros populares para tomar a bancada no próximo jogo.",
                statEffects: { contingente: 3, pressao_bancada: 2 },
                deltas: [
                  { label: "Massa (Contingente)", value: "+3", isPositive: true },
                  { label: "Pressão na Bancada", value: "+2", isPositive: true },
                  { label: "Caixa", value: "-R$ 6.000", isPositive: false },
                  { label: "Pontos Organização", value: "-40", isPositive: false },
                ],
              });
            }}
            className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" /> Convocar Várzea (-R$ 6.000)
          </button>
        </div>
      </div>
    </div>
  );
}
