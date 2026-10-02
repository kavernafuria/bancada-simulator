"use client";

import React from "react";
import {
  Building2,
  Ticket,
  Bus,
  ShieldAlert,
  Handshake,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";

export interface ClubRelationsTabProps {
  relacaoClube: number; // 0 - 100
  riscoMp: number; // 0 - 100
  bankBalance: number;
  soundEnabled: boolean;
  onApplyAction: (action: {
    id: string;
    title: string;
    cost: number;
    reqReputation?: number;
    logText: string;
    statEffects?: { contingente?: number; pressao_bancada?: number; caravana?: number };
    stateEffects?: { moral?: number; risco_mp?: number; relacao_clube?: number };
    deltas: { label: string; value: string; isPositive: boolean }[];
  }) => void;
}

export function ClubRelationsTab({
  relacaoClube,
  riscoMp,
  bankBalance,
  onApplyAction,
}: ClubRelationsTabProps) {
  // Compute Reputation Label
  const getReputationBadge = (val: number) => {
    if (val < 25) {
      return { label: "Inimigo Declarado", color: "text-red-400 border-red-500/40 bg-red-500/10", icon: "😡" };
    }
    if (val < 45) {
      return { label: "Relação Tensa", color: "text-orange-400 border-orange-500/40 bg-orange-500/10", icon: "⚡" };
    }
    if (val < 66) {
      return { label: "Neutro / Protocolar", color: "text-zinc-300 border-zinc-700 bg-zinc-800", icon: "😐" };
    }
    if (val < 86) {
      return { label: "Amigável", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10", icon: "🤝" };
    }
    return { label: "Aliado Estratégico", color: "text-amber-400 border-amber-500/40 bg-amber-500/10", icon: "🌟" };
  };

  const repBadge = getReputationBadge(relacaoClube);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-4 animate-fade-in relative z-10">
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase text-white tracking-wide">
              Relações Políticas com o Clube
            </h2>
            <p className="text-[10px] text-zinc-400">
              Gestão de diplomacia, cotas de ingresso, frota de caravana e notas públicas.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Indicators Bar */}
      <div className="grid grid-cols-3 gap-2">
        {/* Indicator 1: Reputação com Clube */}
        <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 space-y-1">
          <span className="text-[9px] font-black text-zinc-400 uppercase block">
            Reputação c/ Diretoria
          </span>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 ${repBadge.color}`}>
              <span>{repBadge.icon}</span>
              <span>{repBadge.label}</span>
            </span>
            <span className="text-xs font-black text-white">{relacaoClube}/100</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, relacaoClube))}%` }}
            />
          </div>
        </div>

        {/* Indicator 2: Tensão Policial / MP */}
        <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 space-y-1">
          <span className="text-[9px] font-black text-zinc-400 uppercase block">
            Tensão Policial / MP
          </span>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black ${riscoMp > 65 ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
              {riscoMp}%
            </span>
            <span className="text-[9px] font-bold text-zinc-400">
              {riscoMp > 65 ? "Perigo de Sanção" : "Sob Controle"}
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${riscoMp > 65 ? "bg-red-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, Math.max(0, riscoMp))}%` }}
            />
          </div>
        </div>

        {/* Indicator 3: Caixa da Torcida */}
        <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 space-y-1">
          <span className="text-[9px] font-black text-zinc-400 uppercase block">
            Caixa da Torcida
          </span>
          <div className="text-xs font-black text-emerald-400">
            R$ {bankBalance.toLocaleString()}
          </div>
          <span className="text-[8px] text-zinc-500 block">
            Disponível para subsídios
          </span>
        </div>
      </div>

      {/* Action Categories */}
      <div className="space-y-4">
        {/* Category A: Ingressos */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
            <Ticket className="w-3.5 h-3.5" /> Ingressos & Carga de Estádio
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Action A1: Negociar Cota Promocional */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Negociar Cota Promocional</h4>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    Req: Reputação ≥ 50
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                  Solicita ao clube 500 ingressos com 50% de desconto para associados da organizada.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    +2 Massa
                  </span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    +1 Reputação
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (relacaoClube >= 50) {
                    onApplyAction({
                      id: "COTA_PROMOCIONAL_APROVADA",
                      title: "Cota Promocional Aprovada!",
                      cost: 0,
                      logText: "Negociou cota promocional de 500 ingressos com a diretoria do clube.",
                      statEffects: { contingente: 2 },
                      stateEffects: { relacao_clube: 1 },
                      deltas: [
                        { label: "Massa (Contingente)", value: "+2", isPositive: true },
                        { label: "Reputação c/ Clube", value: "+1", isPositive: true },
                      ],
                    });
                  } else {
                    onApplyAction({
                      id: "COTA_PROMOCIONAL_RECUSADA",
                      title: "Pedido de Cota Recusado!",
                      cost: 0,
                      logText: "A diretoria do clube recusou ceder cota promocional devido à baixa reputação da torcida.",
                      stateEffects: { moral: -2 },
                      deltas: [
                        { label: "Moral da Torcida", value: "-2", isPositive: false },
                        { label: "Status", value: "Recusado (Reputação < 50)", isPositive: false },
                      ],
                    });
                  }
                }}
                className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  relacaoClube >= 50
                    ? "bg-amber-500 hover:bg-amber-400 text-black shadow-md"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                }`}
              >
                {relacaoClube >= 50 ? (
                  <>
                    <Handshake className="w-3.5 h-3.5" /> Negociar Cota (R$ 0)
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Tentar Reunião (Reputação Baixa)
                  </>
                )}
              </button>
            </div>

            {/* Action A2: Subsidiar Ingressos da Bancada */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Subsidiar Ingressos da Bancada</h4>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    -R$ 5.000
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                  A torcida tira do próprio caixa para vender ingressos a preço de custo na sede.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    +2 Massa
                  </span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    +2 Bancada
                  </span>
                </div>
              </div>

              <button
                disabled={bankBalance < 5000}
                onClick={() => {
                  onApplyAction({
                    id: "SUBSIDIAR_INGRESSOS",
                    title: "Ingressos Subsidiados com Sucesso!",
                    cost: 5000,
                    logText: "Bancou R$ 5.000 do caixa para baratear ingressos aos torcedores da arquibancada.",
                    statEffects: { contingente: 2, pressao_bancada: 2 },
                    deltas: [
                      { label: "Massa", value: "+2", isPositive: true },
                      { label: "Pressão na Bancada", value: "+2", isPositive: true },
                      { label: "Caixa", value: "-R$ 5.000", isPositive: false },
                    ],
                  });
                }}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5" /> Subsidiar (-R$ 5.000)
              </button>
            </div>
          </div>
        </div>

        {/* Category B: Caravanas */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-blue-400 uppercase tracking-wider">
            <Bus className="w-3.5 h-3.5" /> Caravanas & Deslocamento
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Action B1: Solicitar Apoio de Frota ao Clube */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Solicitar Frota ao Clube</h4>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    Req: Reputação ≥ 60
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                  Pede ao clube ônibus leito para a caravana em jogos fora de casa.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    +3 Caravana
                  </span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    -2 Reputação
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (relacaoClube >= 60) {
                    onApplyAction({
                      id: "FROTA_CLUBE_CONCEDIDA",
                      title: "Ônibus Concedidos pelo Clube!",
                      cost: 0,
                      logText: "Conseguiu apoio de ônibus do clube para a caravana, gerando pequeno desgaste político.",
                      statEffects: { caravana: 3 },
                      stateEffects: { relacao_clube: -2 },
                      deltas: [
                        { label: "Caravana", value: "+3", isPositive: true },
                        { label: "Reputação c/ Clube", value: "-2", isPositive: false },
                      ],
                    });
                  } else {
                    onApplyAction({
                      id: "FROTA_CLUBE_RECUSADA",
                      title: "Pedido de Frota Recusado!",
                      cost: 0,
                      logText: "O clube se recusou a ceder ônibus alegando falta de verba e reputação insuficiente.",
                      stateEffects: { moral: -2 },
                      deltas: [
                        { label: "Moral", value: "-2", isPositive: false },
                        { label: "Status", value: "Recusado (Reputação < 60)", isPositive: false },
                      ],
                    });
                  }
                }}
                className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  relacaoClube >= 60
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                }`}
              >
                {relacaoClube >= 60 ? (
                  <>
                    <Bus className="w-3.5 h-3.5" /> Pedir Frota (R$ 0)
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Pedir Frota (Bloqueado)
                  </>
                )}
              </button>
            </div>

            {/* Action B2: Bancar Viagem Popular */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Bancar Viagem Popular</h4>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    -R$ 8.000
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                  Financia o comboio com verba própria do caixa para garantir presença massiva fora.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    +3 Caravana
                  </span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    +2 Moral
                  </span>
                </div>
              </div>

              <button
                disabled={bankBalance < 8000}
                onClick={() => {
                  onApplyAction({
                    id: "BANCAR_VIAGEM_POPULAR",
                    title: "Comboio Popular Financiado!",
                    cost: 8000,
                    logText: "Bancou R$ 8.000 do caixa para organizar caravana sem depender da diretoria do clube.",
                    statEffects: { caravana: 3 },
                    stateEffects: { moral: 2 },
                    deltas: [
                      { label: "Caravana", value: "+3", isPositive: true },
                      { label: "Moral", value: "+2", isPositive: true },
                      { label: "Caixa", value: "-R$ 8.000", isPositive: false },
                    ],
                  });
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Bus className="w-3.5 h-3.5" /> Financiar Comboio (-R$ 8.000)
              </button>
            </div>
          </div>
        </div>

        {/* Category C: Gestão de Crise & Diplomacia */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-red-400 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> Gestão de Crise & Diplomacia
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Action C1: Lançar Nota de Repúdio */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Lançar Nota de Repúdio</h4>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    R$ 0
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                  Nota pública dura contra ingressos caros ou gestão do clube. Inflama a torcida.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    +3 Moral
                  </span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    -5 Reputação
                  </span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    +2 Risco MP
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onApplyAction({
                    id: "NOTA_REPUDIO_PUBLICADA",
                    title: "Nota de Repúdio Publicada!",
                    cost: 0,
                    logText: "Publicou nota oficial de protesto contra o clube. Inflamou os setores populares, mas azedou a relação institucional.",
                    stateEffects: { moral: 3, relacao_clube: -5, risco_mp: 2 },
                    deltas: [
                      { label: "Moral da Torcida", value: "+3", isPositive: true },
                      { label: "Reputação c/ Clube", value: "-5", isPositive: false },
                      { label: "Risco MP", value: "+2", isPositive: false },
                    ],
                  });
                }}
                className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> Publicar Repúdio (R$ 0)
              </button>
            </div>

            {/* Action C2: Agendar Reunião de Conciliação */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Reunião de Conciliação</h4>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    -R$ 3.000
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                  Reunião com diretores e PM para alinhar conduta e reduzir o cerco policial.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    -5 Risco MP
                  </span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    +2 Reputação
                  </span>
                </div>
              </div>

              <button
                disabled={bankBalance < 3000}
                onClick={() => {
                  onApplyAction({
                    id: "REUNIAO_CONCILIACAO_REALIZADA",
                    title: "Reunião de Conciliação Realizada!",
                    cost: 3000,
                    logText: "Realizou reunião diplomática na sede do clube. Reduziu a tensão com a PM e melhorou a imagem institucional.",
                    stateEffects: { risco_mp: -5, relacao_clube: 2 },
                    deltas: [
                      { label: "Risco MP / Tensão", value: "-5", isPositive: true },
                      { label: "Reputação c/ Clube", value: "+2", isPositive: true },
                      { label: "Caixa", value: "-R$ 3.000", isPositive: false },
                    ],
                  });
                }}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Handshake className="w-3.5 h-3.5" /> Conciliar (-R$ 3.000)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
