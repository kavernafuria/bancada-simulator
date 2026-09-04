"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, Skull, CheckCircle2, ChevronRight, Sparkles, Building2, Flame, Plane, Bus, Users, Trophy } from "lucide-react";
import { resolveTorcidaUnicaAction, TorcidaUnicaActionResult } from "@/lib/bancada_engine";

interface TorcidaUnicaModalProps {
  mode: "ACTIVATION_NEWS" | "REVOCATION_NEWS" | "MATCHDAY_CRISIS";
  scenario?: "VISITANTE" | "MANDANTE";
  rivalTorcidaName?: string;
  stadiumName?: string;
  userBalance: number;
  onDismissNews: () => void;
  onSelectAction: (result: TorcidaUnicaActionResult) => void;
}

export function TorcidaUnicaModal({
  mode,
  scenario = "MANDANTE",
  rivalTorcidaName = "Rival Principal",
  stadiumName = "Estádio",
  userBalance,
  onDismissNews,
  onSelectAction,
}: TorcidaUnicaModalProps) {
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<TorcidaUnicaActionResult | null>(null);
  
  // ROLETA DA CAÇADA CLANDESTINA STATE
  const [showRouletteModal, setShowRouletteModal] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [pendingActionResult, setPendingActionResult] = useState<TorcidaUnicaActionResult | null>(null);

  // MANCHETES DE JORNAL
  if (mode === "ACTIVATION_NEWS") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-red-500/40 bg-zinc-950 p-6 shadow-2xl">
          {/* Top Bar */}
          <div className="flex items-center gap-2 border-b border-red-900/40 pb-3 text-red-500">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">DECRETO EMERGENCIAL DO MINISTÉRIO PÚBLICO</span>
          </div>

          {/* Newspaper Layout */}
          <div className="my-6 rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-inner">
            <div className="border-b border-zinc-800 pb-2 text-center text-xs font-serif text-zinc-400">
              JORNAL DOS ESTÁDIOS & EDITAL EXTRAORDINÁRIO DO MP
            </div>
            <h2 className="my-3 text-xl font-black uppercase text-red-500 sm:text-2xl">
              📰 TRAGÉDIA NO CLÁSSICO. MP DECRETA TORCIDA ÚNICA POR TEMPO INDETERMINADO!
            </h2>
            <p className="text-sm leading-relaxed text-zinc-300 italic">
              &quot;O Ministério Público perdeu a paciência. Após cenas de selvageria com mais de 10 feridos e o Risco MP ultrapassando 90%, a presença de torcedores visitantes no Clássico está banida em definitivo. O comando da PM declarou que não há previsão de volta.&quot;
            </p>
          </div>

          <div className="rounded-lg bg-red-950/40 p-3 text-xs text-red-300 border border-red-900/30">
            <strong>Efeito do Decreto:</strong> Pelas próximas 3 temporadas, a sua torcida estará banida dos clássicos fora de casa e os clássicos em casa não terão visitantes. O menu de Matchday mudou para a Gestão de Crise de Torcida Única.
          </div>

          <button
            onClick={onDismissNews}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold uppercase text-white hover:bg-red-500 transition-all shadow-lg shadow-red-900/30"
          >
            Ciente do Banimento
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === "REVOCATION_NEWS") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-500/40 bg-zinc-950 p-6 shadow-2xl">
          {/* Top Bar */}
          <div className="flex items-center gap-2 border-b border-emerald-900/40 pb-3 text-emerald-400">
            <Sparkles className="h-6 w-6 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">DECRETO REVOGADO • RETORNO DOS VISITANTES</span>
          </div>

          {/* Newspaper Layout */}
          <div className="my-6 rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-inner">
            <div className="border-b border-zinc-800 pb-2 text-center text-xs font-serif text-zinc-400">
              JORNAL DOS ESTÁDIOS & EDITAL EXTRAORDINÁRIO
            </div>
            <h2 className="my-3 text-xl font-black uppercase text-emerald-400 sm:text-2xl">
              🗞️ A VIOLÊNCIA SÓ MUDOU DE ENDEREÇO. ESTADO LIBERA VISITANTES!
            </h2>
            <p className="text-sm leading-relaxed text-zinc-300 italic">
              &quot;O Ministério Público revogou a exigência de torcida única nos clássicos após 3 temporadas. Os setores visitantes foram liberados novamente com escolta reforçada da PM, porém os ingressos e a logística terão um acréscimo permanente de +20% no valor.&quot;
            </p>
          </div>

          <div className="rounded-lg bg-emerald-950/40 p-3 text-xs text-emerald-300 border border-emerald-900/30">
            <strong>Fim da Punição:</strong> A sua torcida pode voltar a viajar para os clássicos fora de casa. Modificador permanente de +20% no custo de ingressos e caravanas ativado pelo batalhão de choque.
          </div>

          <button
            onClick={onDismissNews}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold uppercase text-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30"
          >
            Retomar Caravanas
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // MODAL DE CRISE DE MATCHDAY (TORCIDA ÚNICA MENU)
  const handleConfirmAction = () => {
    if (!selectedActionId) return;
    const result = resolveTorcidaUnicaAction(selectedActionId, scenario, userBalance);
    if (selectedActionId === "CACADA_CLANDESTINA") {
      setPendingActionResult(result);
      setShowRouletteModal(true);
      setHasSpun(false);
      setWheelRotation(0);
    } else {
      setActionResult(result);
    }
  };

  const handleSpinRoulette = () => {
    if (!pendingActionResult || isSpinning) return;
    setIsSpinning(true);

    const targetIndex = pendingActionResult.rouletteOutcomeIndex ?? 0;
    let sliceCenterAngle = 72; // 40% Bote Certo (0-144 deg)
    if (targetIndex === 1) sliceCenterAngle = 207; // 35% Giro em Vão (144-270 deg)
    if (targetIndex === 2) sliceCenterAngle = 315; // 25% Arapuca (270-360 deg)

    const finalDegrees = 1800 + (360 - sliceCenterAngle);
    setWheelRotation(finalDegrees);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
    }, 3600);
  };

  const handleProceedFromRoulette = () => {
    if (pendingActionResult) {
      setActionResult(pendingActionResult);
      setShowRouletteModal(false);
    }
  };

  const handleFinish = () => {
    if (actionResult) {
      onSelectAction(actionResult);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-red-500/50 bg-zinc-950 p-6 shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-red-900/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/20 p-2 text-red-500 border border-red-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-800 uppercase">
                VIGÊNCIA DE TORCIDA ÚNICA (MP)
              </span>
              <h2 className="text-lg font-black uppercase text-zinc-100">
                {scenario === "VISITANTE"
                  ? `🚫 CLÁSSICO FORA DE CASA (VISITANTE BANIDO)`
                  : `🏟️ CLÁSSICO EM CASA (ESTÁDIO 100% SEU)`}
              </h2>
            </div>
          </div>
        </div>

        {/* MODAL DE ROLETA DA CAÇADA CLANDESTINA */}
        {showRouletteModal && pendingActionResult ? (
          <div className="my-6 space-y-5 text-center animate-in zoom-in-95 duration-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                🎰 ROLETA DA SORTE DA LINHA DE FRENTE
              </span>
              <h3 className="text-base font-black uppercase text-white">
                SORTEIO DE CHANCES REAIS DA CAÇADA CLANDESTINA
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Gire a roleta para descobrir o desfecho do bonde descaracterizado nas ruas da cidade!
              </p>
            </div>

            {/* VISUAL ROULETTE WHEEL CONTAINER */}
            <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
              {/* TOP NEEDLE / POINTER */}
              <div className="absolute -top-3 z-30 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-[0_4px_8px_rgba(234,179,8,0.8)]" />
              </div>

              {/* ROTATING SVG WHEEL */}
              <div
                className="w-full h-full rounded-full border-4 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] overflow-hidden relative"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? "transform 3.5s cubic-bezier(0.15, 0.85, 0.25, 1)" : "none",
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Slice 1: Bote Certo (40% -> 0 to 144 deg) */}
                  <path d="M 50 50 L 50 0 A 50 50 0 0 1 79.39 90.45 Z" fill="#10b981" />
                  {/* Slice 2: Giro em Vão (35% -> 144 to 270 deg) */}
                  <path d="M 50 50 L 79.39 90.45 A 50 50 0 0 1 0 50 Z" fill="#f59e0b" />
                  {/* Slice 3: Arapuca (25% -> 270 to 360 deg) */}
                  <path d="M 50 50 L 0 50 A 50 50 0 0 1 50 0 Z" fill="#ef4444" />
                </svg>

                {/* SLICE LABELS */}
                <div className="absolute inset-0 pointer-events-none font-black text-[9px] text-zinc-950 uppercase tracking-tighter">
                  {/* Label Bote Certo */}
                  <span className="absolute top-10 right-10 rotate-45 bg-zinc-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    BOTE CERTO 40%
                  </span>
                  {/* Label Giro em Vão */}
                  <span className="absolute bottom-10 left-12 -rotate-45 bg-zinc-950/80 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/40">
                    GIRO EM VÃO 35%
                  </span>
                  {/* Label Arapuca */}
                  <span className="absolute top-10 left-6 -rotate-12 bg-zinc-950/80 text-red-400 px-1.5 py-0.5 rounded border border-red-500/40">
                    ARAPUCA 25%
                  </span>
                </div>
              </div>

              {/* CENTER HUB */}
              <div className="absolute w-12 h-12 rounded-full bg-zinc-950 border-2 border-amber-400 flex items-center justify-center shadow-xl z-20">
                <Skull className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* ACTION & RESULT BAR */}
            <div className="space-y-3">
              {!hasSpun && !isSpinning && (
                <button
                  onClick={handleSpinRoulette}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer animate-pulse"
                >
                  🎰 GIRAR ROLETA DA CAÇADA
                </button>
              )}

              {isSpinning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black text-xs uppercase animate-pulse">
                  🎰 GIRANDO ROLETA DA CAÇADA CLANDESTINA...
                </div>
              )}

              {hasSpun && (
                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                  <div
                    className={`p-3.5 rounded-xl border text-xs font-black uppercase text-center ${
                      pendingActionResult.rngOutcome === "SUCCESS"
                        ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                        : pendingActionResult.rngOutcome === "FAIL_LIGHT"
                        ? "bg-amber-950/50 border-amber-500/50 text-amber-300"
                        : "bg-red-950/50 border-red-500/50 text-red-300"
                    }`}
                  >
                    {pendingActionResult.rngOutcome === "SUCCESS" && "🟢 ROLETA: BOTE CERTO (40%)! VITÓRIA DE PISTA!"}
                    {pendingActionResult.rngOutcome === "FAIL_LIGHT" && "🟡 ROLETA: GIRO EM VÃO (35%)! PM DISPERSOU AS VANS!"}
                    {pendingActionResult.rngOutcome === "FAIL_CRITICAL" && "🔴 ROLETA: ARAPUCA RIVAL (25%)! EMBOSCADA NA RODOVIA!"}
                  </div>

                  <button
                    onClick={handleProceedFromRoulette}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
                  >
                    VER CRÔNICA COMPLETA & CONSEQÜÊNCIAS <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : actionResult ? (
          /* RESULT DISPLAY */
          <div className="my-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>{actionResult.title}</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                {actionResult.narrative}
              </p>

              {/* Formatted Deltas */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                {actionResult.formattedDeltas.map((d, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg p-2 text-xs font-bold ${
                      d.isPositive
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                        : "bg-red-950/40 text-red-400 border border-red-900/40"
                    }`}
                  >
                    <span>{d.label}</span>
                    <span>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold uppercase text-black hover:bg-amber-400 transition-all shadow-lg"
            >
              Prosseguir ao Apito Inicial
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* ACTION SELECTION MENU */
          <div className="my-5 space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              {scenario === "VISITANTE"
                ? "Sob decreto do MP, a sua torcida não tem direito a cota de ingressos no estádio rival. Escolha uma tática alternativa de ação para este clássico:"
                : "Com a ausência da torcida visitante, o estádio estará 100% tomado pela sua massa. Defina a estratégia de bancada e segurança para o clássico:"}
            </p>

            {scenario === "VISITANTE" ? (
              /* VISITANTE OPTIONS */
              <div className="space-y-3">
                {/* Opção 1 */}
                <div
                  onClick={() => setSelectedActionId("CHURRASCO_SEDE")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    selectedActionId === "CHURRASCO_SEDE"
                      ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-100">
                          1. Churrasco de Concentração na Sede
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          + Massa (+5) • + Arrecadação Bar (+R$ 15.000) • - Pista (-5) • - Respeito (-5)
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      LUCRO ALTO
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 leading-snug">
                    Reúna milhares de torcedores na quadra/sede para assistir o clássico em telões. Arrecadação alta de bar e vendas, mas ausência no estádio indigna a pista.
                  </p>
                </div>

                {/* Opção 2 */}
                <div
                  onClick={() => setSelectedActionId("CACADA_CLANDESTINA")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    selectedActionId === "CACADA_CLANDESTINA"
                      ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-red-500/20 p-2 text-red-400">
                        <Skull className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-100">
                          2. Caçada Clandestina (Bonde de Bairro)
                        </h4>
                        <span className="text-[10px] text-amber-400 font-bold">
                          ROLETA: 40% Bote Certo (+Pista) • 35% Giro em Vão (-Caixa) • 25% Arapuca (--Pista)
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300 border border-red-500/30">
                      ALTO RISCO (ROLETA)
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 leading-snug">
                    Formar bonde e procurar em bairros rivais o bonde deles... Envie a Linha de Frente descaracterizada em vans pelas rotas de acesso da cidade. Risco de arapuca rival ou vitória fulminante na pista.
                  </p>
                </div>

                {/* Opção 3 */}
                <div
                  onClick={() => {
                    if (userBalance >= 5000) setSelectedActionId("INFILTRACAO_MOTORIZADA");
                  }}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    userBalance < 5000 ? "opacity-50 pointer-events-none" : ""
                  } ${
                    selectedActionId === "INFILTRACAO_MOTORIZADA"
                      ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-sky-500/20 p-2 text-sky-400">
                        <Bus className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-100">
                          3. Infiltração Motorizada Tática
                        </h4>
                        <span className="text-[10px] text-sky-400 font-bold">
                          Custo: R$ 5.000 • RNG (50/50): Sucesso (+Moral, +Pista) vs Falha (++Risco MP +20%)
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/30">
                      CUSTO R$ 5.000
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 leading-snug">
                    Alugue um comboio de 100 motos para cortar o perímetro do estádio soltando rojões e estendendo faixas.
                  </p>
                </div>
              </div>
            ) : (
              /* MANDANTE OPTIONS */
              <div className="space-y-3">
                {/* Opção 1 */}
                <div
                  onClick={() => setSelectedActionId("MAIOR_FESTA_ANO")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    selectedActionId === "MAIOR_FESTA_ANO"
                      ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
                        <Flame className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-100">
                          1. A Maior Festa do Ano
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          Base: ++ Bancada (+12) • ++ Caixa (+R$ 10.000) • RNG (30% Emboscada Rival)
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      FESTA MONUMENTAL
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 leading-snug">
                    Prepare fumaça, mosaico e recepção de ônibus. Arrecadação total, mas 30% de risco de emboscada rival na subsede nos arredores.
                  </p>
                </div>

                {/* Opção 2 */}
                <div
                  onClick={() => {
                    if (userBalance >= 5000) setSelectedActionId("ESCOLTA_DESCENTRALIZADA");
                  }}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    userBalance < 5000 ? "opacity-50 pointer-events-none" : ""
                  } ${
                    selectedActionId === "ESCOLTA_DESCENTRALIZADA"
                      ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-sky-500/20 p-2 text-sky-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-100">
                          2. Escolta Descentralizada de Território
                        </h4>
                        <span className="text-[10px] text-sky-400 font-bold">
                          Custo: R$ 5.000 • Efeito: + Pista (+6) • 0% Emboscadas • Bancada neutra
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/30">
                      SEGURANÇA 100%
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 leading-snug">
                    Aloque a liderança para patrulhar estações de trem e vias. Garante 0% de emboscadas, mas a festa no estádio fica mais modesta.
                  </p>
                </div>

                {/* Opção 3 */}
                <div
                  onClick={() => {
                    if (userBalance >= 25000) setSelectedActionId("HUMILHACAO_PUBLICA");
                  }}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    userBalance < 25000 ? "opacity-50 pointer-events-none" : ""
                  } ${
                    selectedActionId === "HUMILHACAO_PUBLICA"
                      ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-100">
                          3. Humilhação Pública (Aeronave / Faixa no Ar)
                        </h4>
                        <span className="text-[10px] text-purple-400 font-bold">
                          Custo: R$ 25.000 • Se Vitória: ++ Respeito (+12), ++ Moral (+10) • Se Derrota: -- Moral (-12)
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                      CUSTO R$ 25.000
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 leading-snug">
                    Contrate avião para sobrevoar o estádio com faixa provocativa contra o rival. Se o time vencer no campo, a humilhação será histórica.
                  </p>
                </div>
              </div>
            )}

            <button
              disabled={!selectedActionId}
              onClick={handleConfirmAction}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold uppercase transition-all shadow-lg ${
                selectedActionId
                  ? "bg-red-600 text-white hover:bg-red-500 shadow-red-900/30"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              Executar Estratégia de Torcida Única
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
