"use client";

import React, { useState } from "react";
import { Mic, Newspaper, Radio, CheckCircle2, ChevronRight, Shield, Flame, Briefcase, Building2 } from "lucide-react";
import { PressConference, PressConferenceChoice } from "@/lib/bancada_engine";

interface PressConferenceModalProps {
  conference: PressConference;
  userBalance: number;
  onSelectChoice: (choice: PressConferenceChoice) => void;
}

export function PressConferenceModal({
  conference,
  userBalance,
  onSelectChoice,
}: PressConferenceModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<PressConferenceChoice | null>(null);

  const handleConfirm = () => {
    if (selectedChoice) {
      onSelectChoice(selectedChoice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-sky-500/40 bg-zinc-950 p-6 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-500/20 p-2.5 text-sky-400 border border-sky-500/30">
              <Mic className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase border border-sky-500/40">
                COLETIVA DE IMPRENSA OFICIAL
              </span>
              <h2 className="text-lg font-black uppercase text-zinc-100">{conference.title}</h2>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="my-5 rounded-xl border border-sky-900/40 bg-gradient-to-b from-sky-950/30 to-zinc-900 p-5 shadow-inner">
          <div className="flex items-center justify-between text-xs text-sky-300">
            <span className="font-bold flex items-center gap-1">
              <Radio className="h-3.5 w-3.5" />
              {conference.journalist} ({conference.outlet})
            </span>
            <span className="text-[10px] text-zinc-400 uppercase">{conference.triggerEvent}</span>
          </div>
          <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-200 italic">
            &quot;{conference.question}&quot;
          </p>
        </div>

        {selectedChoice ? (
          /* CONFIRMATION SCREEN */
          <div className="space-y-4 animate-in zoom-in-95 duration-150">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold uppercase text-sky-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Declaração Selecionada ({selectedChoice.type})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {selectedChoice.badgeText}
                </span>
              </div>
              <p className="text-sm font-semibold text-zinc-100 italic leading-relaxed">
                &quot;{selectedChoice.answerText}&quot;
              </p>

              {/* Formatted Deltas */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                {selectedChoice.formattedDeltas.map((d, i) => (
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

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedChoice(null)}
                className="w-1/3 rounded-xl bg-zinc-800 py-3 text-xs font-bold uppercase text-zinc-300 hover:bg-zinc-700 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirm}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-xs font-bold uppercase text-black hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
              >
                Publicar Declaração na Mídia
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* CHOICES SELECTION LIST */
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Selecione a Postura Oficial da Diretoria da Torcida (Escolha 1 de 3):
            </span>

            {conference.choices.map((choice) => (
              <div
                key={choice.id}
                onClick={() => setSelectedChoice(choice)}
                className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 hover:border-sky-500 hover:bg-sky-950/20 transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {choice.type === "INSTITUCIONAL" && (
                      <Building2 className="h-4 w-4 text-emerald-400" />
                    )}
                    {choice.type === "RADICAL" && <Flame className="h-4 w-4 text-red-400" />}
                    {choice.type === "GESTORA" && <Briefcase className="h-4 w-4 text-amber-400" />}
                    <h4 className="text-xs font-black uppercase text-zinc-100 group-hover:text-sky-300">
                      {choice.label}
                    </h4>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {choice.badgeText}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 italic leading-relaxed">
                  &quot;{choice.answerText}&quot;
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {choice.formattedDeltas.map((d, idx) => (
                    <span
                      key={idx}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        d.isPositive
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                          : "bg-red-950/60 text-red-300 border border-red-800/40"
                      }`}
                    >
                      {d.label}: {d.value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
