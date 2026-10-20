"use client";

import React, { useState } from "react";
import {
  X,
  Drum,
  Lightbulb,
  Bug,
  Send,
  CheckCircle2,
  Sparkles,
  Copy,
  Mail,
} from "lucide-react";

export type FeedbackTabType = "TORCIDA" | "SUGESTAO" | "BUG";

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTorcidaName?: string;
  currentClubName?: string;
  currentSeason?: number;
  currentStepIndex?: number;
}

const BRAZIL_STATES = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
  "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR",
  "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

export function BetaFeedbackModal({
  isOpen,
  onClose,
  currentTorcidaName,
  currentClubName,
  currentSeason,
  currentStepIndex,
}: BetaFeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<FeedbackTabType>("TORCIDA");

  // Torcida Request Fields
  const [torcidaNome, setTorcidaNome] = useState("");
  const [torcidaSigla, setTorcidaSigla] = useState("");
  const [torcidaClube, setTorcidaClube] = useState("");
  const [torcidaEstado, setTorcidaEstado] = useState("SP");
  const [torcidaDetalhes, setTorcidaDetalhes] = useState("");

  // Suggestion / Bug Fields
  const [messageText, setMessageText] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [copiedFallback, setCopiedFallback] = useState(false);

  if (!isOpen) return null;

  const buildFormattedSummary = (): { subject: string; body: string } => {
    const contextHeader = currentTorcidaName
      ? `Jogando com: ${currentTorcidaName} (${currentClubName || ""}) | Temporada ${currentSeason || 1} - Etapa ${currentStepIndex || 1}`
      : "Enviado pelo Painel Beta";

    if (activeTab === "TORCIDA") {
      return {
        subject: `[Bancada Beta] Pedido de Inclusão de Torcida: ${torcidaNome} (${torcidaClube}/${torcidaEstado})`,
        body: [
          `📌 TIPO: Pedido de Inclusão de Torcida`,
          `🥁 Nome da Torcida: ${torcidaNome.trim()}`,
          `🏷️ Sigla: ${torcidaSigla.trim() || "Não informada"}`,
          `⚽ Clube: ${torcidaClube.trim()}`,
          `📍 Estado (UF): ${torcidaEstado}`,
          `🤝 Aliança / Rivais / Detalhes: ${torcidaDetalhes.trim() || "Não informado"}`,
          `👤 Contato do Jogador: ${contactInfo.trim() || "Anônimo"}`,
          `📊 Contexto: ${contextHeader}`,
        ].join("\n"),
      };
    }

    if (activeTab === "SUGESTAO") {
      return {
        subject: `[Bancada Beta] Sugestão de Melhoria / Ideia`,
        body: [
          `📌 TIPO: Sugestão de Mudança / Nova Ideia`,
          `💡 Sugestão:\n${messageText.trim()}`,
          `👤 Contato do Jogador: ${contactInfo.trim() || "Anônimo"}`,
          `📊 Contexto: ${contextHeader}`,
        ].join("\n"),
      };
    }

    return {
      subject: `[Bancada Beta] Relato de Bug (Ano ${currentSeason || 1})`,
      body: [
        `📌 TIPO: Relato de Bug / Erro`,
        `🐛 O que aconteceu:\n${messageText.trim()}`,
        `👤 Contato do Jogador: ${contactInfo.trim() || "Anônimo"}`,
        `📊 Contexto Técnico: ${contextHeader}`,
      ].join("\n"),
    };
  };

  const isFormValid = () => {
    if (activeTab === "TORCIDA") {
      return torcidaNome.trim().length >= 2 && torcidaClube.trim().length >= 2;
    }
    return messageText.trim().length >= 5;
  };

  const handleResetAndClose = () => {
    setSubmittedSuccess(false);
    setCopiedFallback(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    const { subject, body } = buildFormattedSummary();

    try {
      // Save locally in history so player knows it was registered
      const existingLogs = JSON.parse(localStorage.getItem("bancada_beta_feedback_log") || "[]");
      existingLogs.push({
        date: new Date().toISOString(),
        type: activeTab,
        subject,
        body,
      });
      localStorage.setItem("bancada_beta_feedback_log", JSON.stringify(existingLogs.slice(-20)));

      // Send silently via FormSubmit AJAX to Kavers Games official contact
      await fetch("https://formsubmit.co/ajax/contato@kaversgames.com.br", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: subject,
          tipo: activeTab,
          mensagem: body,
          contato_jogador: contactInfo.trim() || "Anônimo",
          _template: "table",
        }),
      });
    } catch {
      // Even if offline or blocked by adblocker, allow fallback copy/email on the confirmation screen
    } finally {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }
  };

  const handleCopyMessage = async () => {
    const { body } = buildFormattedSummary();
    try {
      await navigator.clipboard.writeText(body);
      setCopiedFallback(true);
      setTimeout(() => setCopiedFallback(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleOpenMailClient = () => {
    const { subject, body } = buildFormattedSummary();
    const mailtoUrl = `mailto:contato@kaversgames.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[120] animate-fade-in">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto relative">
        {/* Top Accent Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  🧪 VERSÃO BETA • ATUALIZAÇÕES CONSTANTES
                </span>
              </div>
              <h3 className="text-sm font-black text-white uppercase mt-1">
                Central da Bancada & Feedback
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-5 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-white uppercase">
                Relato Registrado com Sucesso!
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto">
                Valeu pela força! Estamos lançando <strong className="text-amber-400">atualizações constantes</strong> e analisamos todos os pedidos de torcidas, melhorias e correções enviados pela comunidade.
              </p>
            </div>

            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-2 text-left">
              <span className="text-[10px] font-bold text-zinc-400 block text-center">
                Quer garantir envio direto ou mandar no nosso canal?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copiedFallback ? "Copiado!" : "Copiar Texto"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenMailClient}
                  className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Abrir E-mail</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmittedSuccess(false);
                setTorcidaNome("");
                setTorcidaSigla("");
                setTorcidaClube("");
                setTorcidaDetalhes("");
                setMessageText("");
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer"
            >
              Voltar ao Jogo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Category Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab("TORCIDA")}
                className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === "TORCIDA"
                    ? "bg-amber-500 text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Drum className="w-3.5 h-3.5" />
                <span>Pedir Torcida</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("SUGESTAO")}
                className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === "SUGESTAO"
                    ? "bg-amber-500 text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Sugerir Ideia</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("BUG")}
                className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === "BUG"
                    ? "bg-amber-500 text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Informar Bug</span>
              </button>
            </div>

            {activeTab === "TORCIDA" && (
              <div className="space-y-2.5 text-left">
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Sentiu falta de alguma torcida organizada do seu clube ou região? Mande os dados abaixo para incluirmos nas próximas atualizações:
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-amber-400 uppercase block mb-1">
                      Nome da Torcida *
                    </label>
                    <input
                      type="text"
                      required
                      value={torcidaNome}
                      onChange={(e) => setTorcidaNome(e.target.value)}
                      placeholder="Ex: Força Independente"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">
                      Sigla
                    </label>
                    <input
                      type="text"
                      value={torcidaSigla}
                      onChange={(e) => setTorcidaSigla(e.target.value)}
                      placeholder="Ex: TFI"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white uppercase focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-amber-400 uppercase block mb-1">
                      Clube *
                    </label>
                    <input
                      type="text"
                      required
                      value={torcidaClube}
                      onChange={(e) => setTorcidaClube(e.target.value)}
                      placeholder="Ex: Paraná Clube"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-amber-400 uppercase block mb-1">
                      Estado (UF)
                    </label>
                    <select
                      value={torcidaEstado}
                      onChange={(e) => setTorcidaEstado(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {BRAZIL_STATES.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1">
                    Aliança, Rivais ou Detalhes (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={torcidaDetalhes}
                    onChange={(e) => setTorcidaDetalhes(e.target.value)}
                    placeholder="Ex: Faz parte do Punho Colado, rival principal é..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "SUGESTAO" && (
              <div className="space-y-2.5 text-left">
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Tem alguma ideia de evento, mecânica de arquibancada, ajuste de dificuldade ou sugestão para deixar o simulador ainda melhor?
                </p>
                <div>
                  <label className="text-[10px] font-black text-amber-400 uppercase block mb-1">
                    Sua Sugestão ou Ideia *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Descreva sua ideia de mudança, novo evento ou melhoria..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "BUG" && (
              <div className="space-y-2.5 text-left">
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Encontrou algum erro visual, texto cortado ou travamento? Conte para nós para corrigirmos rapidamente:
                </p>
                <div>
                  <label className="text-[10px] font-black text-amber-400 uppercase block mb-1">
                    O que aconteceu? *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Descreva em qual tela ou momento o problema ocorreu..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>
                {currentTorcidaName && (
                  <div className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
                    <span>Contexto anexado automaticamente:</span>
                    <span className="text-amber-400 font-bold">
                      Ano {currentSeason || 1} • Etapa {currentStepIndex || 1}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase block mb-1 text-left">
                Seu @Instagram ou E-mail (Opcional)
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Caso queira receber retorno da nossa equipe"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                isFormValid() && !isSubmitting
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black active:scale-95 cursor-pointer"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Enviando..." : "Enviar para a Equipe Kavers"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
