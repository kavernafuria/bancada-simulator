"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Scale,
  ShieldAlert,
  Skull,
  CheckCircle2,
  ChevronRight,
  Gavel,
  FileText,
  Volume2,
  Camera,
  Radio,
  UserX,
  Sparkles,
  ArrowRight,
  Landmark,
  Building,
} from "lucide-react";
import {
  INQUIRY_QUESTIONS,
  InquiryQuestion,
  InquiryQuestionOption,
  InquiryVerdict,
  resolveInquiryVerdict,
} from "@/lib/bancada_engine";

export interface InquiryResultPayload {
  verdict: InquiryVerdict;
  totalLawyerFees: number;
  totalFine: number;
  accumulatedMoralDelta: number;
  accumulatedRiscoMPDelta: number;
  accumulatedPistaDelta: number;
  accumulatedRespectDelta: number;
  accumulatedContingenteDelta: number;
}

interface InquiryModalProps {
  triggerReason?: string;
  initialConvictionBase?: number;
  onFinishInquiry: (result: InquiryResultPayload) => void;
}

export function InquiryModal({
  triggerReason = "Confronto clandestino de rua em dia de Torcida Única",
  initialConvictionBase = 20,
  onFinishInquiry,
}: InquiryModalProps) {
  const [step, setStep] = useState<"SUMMONS" | "QUESTIONING" | "VERDICT">("SUMMONS");
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [convictionScore, setConvictionScore] = useState<number>(initialConvictionBase);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Accumulated deltas during options selection
  const [accumulatedMoral, setAccumulatedMoral] = useState<number>(0);
  const [accumulatedRiscoMP, setAccumulatedRiscoMP] = useState<number>(0);
  const [accumulatedPista, setAccumulatedPista] = useState<number>(0);
  const [accumulatedRespect, setAccumulatedRespect] = useState<number>(0);
  const [accumulatedContingente, setAccumulatedContingente] = useState<number>(0);
  const [questionLawyerFees, setQuestionLawyerFees] = useState<number>(0);

  const currentQuestion: InquiryQuestion = INQUIRY_QUESTIONS[currentPhaseIndex] || INQUIRY_QUESTIONS[0];

  // Helper to handle option click in questioning step
  const handleSelectOption = (option: InquiryQuestionOption) => {
    setSelectedOptionId(option.id);
  };

  // Confirm option and advance to next phase or verdict
  const handleConfirmOption = () => {
    if (!selectedOptionId) return;

    const chosenOption = currentQuestion.options.find((o) => o.id === selectedOptionId);
    if (!chosenOption) return;

    // Apply deltas
    const newConviction = Math.max(0, Math.min(100, convictionScore + chosenOption.convictionDelta));
    setConvictionScore(newConviction);

    setAccumulatedMoral((prev) => prev + (chosenOption.moralDelta || 0));
    setAccumulatedRiscoMP((prev) => prev + (chosenOption.riscoMPDelta || 0));
    setAccumulatedPista((prev) => prev + (chosenOption.pistaDelta || 0));
    setAccumulatedRespect((prev) => prev + (chosenOption.respectDelta || 0));
    setAccumulatedContingente((prev) => prev + (chosenOption.contingenteDelta || 0));
    setQuestionLawyerFees((prev) => prev + (chosenOption.lawyerFee || 0));

    // Reset selection for next step
    setSelectedOptionId(null);

    if (currentPhaseIndex + 1 < INQUIRY_QUESTIONS.length) {
      setCurrentPhaseIndex((prev) => prev + 1);
    } else {
      setStep("VERDICT");
    }
  };

  const finalVerdict = resolveInquiryVerdict(convictionScore);

  // Combined result application callback
  const handleFinalize = () => {
    const totalLawyer = finalVerdict.lawyerCost; // Final lawyer fee from verdict
    const totalFine = finalVerdict.fineCost;

    onFinishInquiry({
      verdict: finalVerdict,
      totalLawyerFees: totalLawyer,
      totalFine: totalFine,
      accumulatedMoralDelta: accumulatedMoral + finalVerdict.moralDelta,
      accumulatedRiscoMPDelta: accumulatedRiscoMP + finalVerdict.riscoMPDelta,
      accumulatedPistaDelta: accumulatedPista + finalVerdict.pistaPenalty,
      accumulatedRespectDelta: accumulatedRespect + finalVerdict.respectDelta,
      accumulatedContingenteDelta: accumulatedContingente,
    });
  };

  // Render Meter / Conviction Gauge
  const renderConvictionGauge = () => {
    const isGreen = convictionScore <= 35;
    const isYellow = convictionScore > 35 && convictionScore <= 70;
    const isRed = convictionScore > 70;

    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-inner space-y-2">
        <div className="flex items-center justify-between text-xs font-black uppercase">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Scale className="h-4 w-4 text-amber-400" />
            Nível de Convicção do Promotor (MP / DRADE):
          </span>
          <span
            className={`text-sm ${
              isGreen ? "text-emerald-400" : isYellow ? "text-amber-400" : "text-red-500 animate-pulse"
            }`}
          >
            {convictionScore} / 100 Pts
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGreen
                ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                : isYellow
                ? "bg-gradient-to-r from-amber-600 to-amber-400"
                : "bg-gradient-to-r from-red-600 to-red-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(5, convictionScore))}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-tighter pt-0.5">
          <span className="text-emerald-500">0-35 Pts: Arquivado</span>
          <span className="text-amber-400">36-70 Pts: Multa Alta</span>
          <span className="text-red-500">71-100 Pts: Membros Presos</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-500/40 bg-zinc-950 p-5 sm:p-6 shadow-2xl my-auto">
        
        {/* Banner Image Header */}
        <div className="relative mb-5 -mx-6 -mt-6 h-44 overflow-hidden border-b border-amber-600/40">
          <img
            src="/images/julgamento.jpeg"
            alt="Depoimento Inquérito MP"
            className="h-full w-full object-cover object-top opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <span className="rounded bg-amber-600/90 backdrop-blur px-2.5 py-1 text-[10px] font-black text-black uppercase tracking-wider shadow">
              ⚖️ MINISTÉRIO PÚBLICO & DRADE
            </span>
          </div>

          <div className="absolute bottom-3 left-6 right-6 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-black uppercase text-amber-400 tracking-tight sm:text-xl drop-shadow">
                🏛️ INQUÉRITO EMERGENCIAIS DE DEPOIMENTO
              </h2>
              <p className="text-xs text-zinc-300 font-medium drop-shadow">
                Gabinete do Promotor de Justiça • Crimes de Intolerância Esportiva
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-amber-400/80 bg-zinc-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                PROCESSO Nº MP-2026/894
              </span>
            </div>
          </div>
        </div>

        {/* ================= STEP 1: SUMMONS / INTIMAÇÃO ================= */}
        {step === "SUMMONS" && (
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 border-b border-amber-900/40 pb-3 text-amber-400">
              <Gavel className="h-5 w-5 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-widest">
                MANDADO DE INTIMAÇÃO EMERGENCIAL PARA O PRESIDENTE
              </span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-red-950/60 p-2.5 border border-red-800/40">
                  <ShieldAlert className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-red-400">
                    Ocorrência sob Investigação de Pista
                  </h3>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed mt-1">
                    {triggerReason}
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3 text-xs text-zinc-400 leading-relaxed space-y-2">
                <p>
                  Como as ações de rua ocorrem <strong className="text-zinc-200">à paisana e com agasalhos neutros</strong> (sem uniforme oficial), a investigação ciber-digital da DRADE reuniu interceptações telefônicas, prints de redes sociais e imagens do sistema de trânsito.
                </p>
                <p>
                  O Presidente da Torcida foi convocado pessoalmente ao gabinete do Promotor para responder a <strong className="text-amber-400">3 perguntas decisivas</strong>. Cada resposta afetará a convicção do Ministério Público sobre o envolvimento da diretoria.
                </p>
              </div>
            </div>

            {/* Legal Warning Box */}
            <div className="rounded-lg bg-amber-950/40 p-3 border border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Assessoria Jurídica de Prontidão (Advogados Obrigatórios)</span>
              </div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                Qualquer desfecho inclui honorários
              </span>
            </div>

            <button
              onClick={() => setStep("QUESTIONING")}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              🚪 ENTRAR NO GABINETE E INICIAR DEPOIMENTO <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ================= STEP 2: QUESTIONING (PHASES 1-3) ================= */}
        {step === "QUESTIONING" && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            {/* Header Phase indicator */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500 px-2 py-0.5 text-[11px] font-black text-black uppercase">
                  {currentQuestion.phaseTitle}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-400">
                FASE {currentQuestion.phase} DE {INQUIRY_QUESTIONS.length}
              </span>
            </div>

            {/* Promotor Conviction Gauge */}
            {renderConvictionGauge()}

            {/* Evidence Display Panel */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-2 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                {currentQuestion.evidenceType === "AUDIO" && <Volume2 className="h-4 w-4 text-amber-400 animate-pulse" />}
                {currentQuestion.evidenceType === "SOCIAL_MEDIA" && <Camera className="h-4 w-4 text-amber-400 animate-pulse" />}
                {currentQuestion.evidenceType === "CCTV" && <Radio className="h-4 w-4 text-amber-400 animate-pulse" />}
                <span>{currentQuestion.evidenceBadge}</span>
              </div>
              
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 italic font-medium flex items-start gap-2">
                <FileText className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>&quot;{currentQuestion.evidenceDescription}&quot;</span>
              </div>

              {/* Question Text */}
              <div className="pt-2">
                <p className="text-xs sm:text-sm font-bold text-zinc-100 leading-relaxed">
                  👨‍⚖️ Promotor: &quot;{currentQuestion.questionText}&quot;
                </p>
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                SELECIONE A RESPOSTA DO PRESIDENTE:
              </span>

              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isDefesa = option.type === "DEFESA";
                const isNeutral = option.type === "NEUTRAL";
                const isHostil = option.type === "HOSTIL";

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? isDefesa
                          ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500"
                          : isNeutral
                          ? "bg-amber-950/60 border-amber-500 text-white shadow-lg ring-1 ring-amber-500"
                          : "bg-red-950/60 border-red-500 text-white shadow-lg ring-1 ring-red-500"
                        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wide">
                        {option.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          option.convictionDelta < 0
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                            : option.convictionDelta === 0
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-red-950 text-red-400 border border-red-800/40"
                        }`}
                      >
                        Convicção: {option.convictionDelta > 0 ? `+${option.convictionDelta}` : `${option.convictionDelta}`} pts
                      </span>
                    </div>

                    <p className="text-xs italic text-zinc-300 leading-relaxed font-medium">
                      &quot;{option.text}&quot;
                    </p>

                    {/* Preview Impact badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/60 text-[10px] font-bold">
                      {option.moralDelta !== 0 && (
                        <span className={option.moralDelta > 0 ? "text-emerald-400" : "text-red-400"}>
                          Moral: {option.moralDelta > 0 ? `+${option.moralDelta}` : option.moralDelta}
                        </span>
                      )}
                      {option.riscoMPDelta !== 0 && (
                        <span className={option.riscoMPDelta < 0 ? "text-emerald-400" : "text-red-400"}>
                          Risco MP: {option.riscoMPDelta > 0 ? `+${option.riscoMPDelta}%` : `${option.riscoMPDelta}%`}
                        </span>
                      )}
                      {option.pistaDelta && option.pistaDelta !== 0 && (
                        <span className="text-emerald-400">Pista: +{option.pistaDelta}</span>
                      )}
                      {option.contingenteDelta && (
                        <span className="text-red-400">Contingente: {option.contingenteDelta}</span>
                      )}
                      {option.respectDelta && option.respectDelta !== 0 && (
                        <span className="text-emerald-400">Respeito: +{option.respectDelta}</span>
                      )}
                      <span className="text-amber-400/90 ml-auto font-mono">
                        Advogado: R$ {option.lawyerFee.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm Choice button */}
            <button
              disabled={!selectedOptionId}
              onClick={handleConfirmOption}
              className={`w-full mt-3 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                selectedOptionId
                  ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg cursor-pointer"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              CONFIRMAR DEPOIMENTO DA FASE {currentQuestion.phase} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ================= STEP 3: VERDICT & SENTENCE ================= */}
        {step === "VERDICT" && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            {/* Header Status */}
            <div className="flex items-center gap-2 border-b border-amber-900/40 pb-3 text-amber-400">
              <Gavel className="h-6 w-6 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest">
                VEREDITO FINAL & LEITURA DA SENTENÇA
              </span>
            </div>

            {/* Final Conviction Score gauge display */}
            {renderConvictionGauge()}

            {/* Newspaper / Official Legal Decree Layout */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-inner space-y-3">
              <div className="border-b border-zinc-800 pb-2 text-center text-xs font-serif text-zinc-400 flex items-center justify-between">
                <span>EDITAL EXTRAORDINÁRIO DO MINISTÉRIO PÚBLICO</span>
                <span>DRADE / DELEGAÇÃO ESPECIAL</span>
              </div>

              <h2
                className={`text-lg sm:text-xl font-black uppercase tracking-tight ${
                  finalVerdict.type === "ARQUIVADO"
                    ? "text-emerald-400"
                    : finalVerdict.type === "MULTA_ALTA"
                    ? "text-amber-400"
                    : "text-red-500"
                }`}
              >
                {finalVerdict.headline}
              </h2>

              <p className="text-xs text-zinc-300 leading-relaxed italic font-medium">
                &quot;{finalVerdict.description}&quot;
              </p>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-semibold space-y-1">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Decisão Judicial:</div>
                <p>{finalVerdict.verdictText}</p>
              </div>

              {/* Financial & Stat Impacts Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                {/* Lawyer Fee (Present in all outcomes) */}
                <div className="flex items-center justify-between rounded-lg p-2.5 text-xs font-bold bg-amber-950/40 border border-amber-800/40 text-amber-300">
                  <span>⚖️ Honorários de Advogado:</span>
                  <span className="font-mono">R$ {finalVerdict.lawyerCost.toLocaleString("pt-BR")}</span>
                </div>

                {/* Fine (If any) */}
                {finalVerdict.fineCost > 0 ? (
                  <div className="flex items-center justify-between rounded-lg p-2.5 text-xs font-bold bg-red-950/40 border border-red-800/40 text-red-400">
                    <span>💸 Multa do MP:</span>
                    <span className="font-mono">R$ {finalVerdict.fineCost.toLocaleString("pt-BR")}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg p-2.5 text-xs font-bold bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
                    <span>🛡️ Isenção de Multa:</span>
                    <span>R$ 0</span>
                  </div>
                )}

                {/* Arrests (If any) */}
                {finalVerdict.membersArrestedCount && finalVerdict.membersArrestedCount > 0 ? (
                  <div className="col-span-2 flex items-center justify-between rounded-lg p-2.5 text-xs font-bold bg-red-950/50 border border-red-600/50 text-red-400 animate-pulse">
                    <span className="flex items-center gap-1.5">
                      <UserX className="h-4 w-4 text-red-500" /> Prisão Preventiva:
                    </span>
                    <span>{finalVerdict.membersArrestedCount} Membros da Linha de Frente Detidos</span>
                  </div>
                ) : null}

                {/* Risco MP Delta */}
                <div
                  className={`flex items-center justify-between rounded-lg p-2 text-xs font-bold ${
                    finalVerdict.riscoMPDelta < 0
                      ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-400"
                      : finalVerdict.riscoMPDelta > 0
                      ? "bg-red-950/40 border border-red-800/40 text-red-400"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  <span>Impacto Risco MP:</span>
                  <span>{finalVerdict.riscoMPDelta > 0 ? `+${finalVerdict.riscoMPDelta}%` : `${finalVerdict.riscoMPDelta}%`}</span>
                </div>

                {/* Moral / Pista / Respect */}
                {finalVerdict.pistaPenalty !== 0 && (
                  <div className="flex items-center justify-between rounded-lg p-2 text-xs font-bold bg-red-950/40 border border-red-800/40 text-red-400">
                    <span>Poder de Pista:</span>
                    <span>{finalVerdict.pistaPenalty}</span>
                  </div>
                )}

                {finalVerdict.respectDelta > 0 && (
                  <div className="flex items-center justify-between rounded-lg p-2 text-xs font-bold bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
                    <span>Respeito Nacional:</span>
                    <span>+{finalVerdict.respectDelta}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleFinalize}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5" /> CONCLUIR E REGISTRAR SENTENÇA DO INQUÉRITO
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
