"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Download, Share2, Sparkles, Check } from "lucide-react";

export interface StoryCardData {
  torcidaName: string;
  sigla: string;
  clube: string;
  primaryColor: string;
  secondaryColor: string;
  rank: number | string;
  powerScore: number | string;
  season: number;
  cardType: "MATCH_VICTORY" | "SEASON_CLOSING" | "TORCIDA_PROFILE";
  matchTitle?: string;
  score?: string;
  rivalTorcida?: string;
  chronicle?: string;
  contingente?: number;
  pressaoBancada?: number;
  poderPista?: number;
  bankBalance?: number;
  completedObjectives?: number;
}

interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StoryCardData | null;
}

export function StoryCardModal({ isOpen, onClose, data }: StoryCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && data && canvasRef.current) {
      drawStoryCard(canvasRef.current, data);
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const drawStoryCard = (canvas: HTMLCanvasElement, d: StoryCardData) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Story 9:16 Canvas Resolution (540 x 960 px for crisp rendering)
    const W = 540;
    const H = 960;
    canvas.width = W;
    canvas.height = H;

    // 1. BACKGROUND GRADIENT (Torcida Primary & Secondary Colors)
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    const color1 = d.primaryColor || "#991B1B";
    const color2 = d.secondaryColor || "#111827";
    bgGrad.addColorStop(0, "#09090b");
    bgGrad.addColorStop(0.35, color1);
    bgGrad.addColorStop(0.8, color2);
    bgGrad.addColorStop(1, "#09090b");

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Dark Overlay with Noise / Texture effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, W, H);

    // Decorative Diagonal Stripes (Torcida Vibe)
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#ffffff";
    for (let i = -W; i < W * 2; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 20, 0);
      ctx.lineTo(i + 20 + H * 0.5, H);
      ctx.lineTo(i + H * 0.5, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Border Frame
    ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    // Inner Gold Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, W - 36, H - 36);

    // 2. HEADER BRANDING
    ctx.fillStyle = "#f59e0b";
    ctx.font = "900 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🥁 BANCADA SIMULATOR • KAVERS GAMES", W / 2, 50);

    // Title Tag Banner
    const isVictory = d.cardType === "MATCH_VICTORY";
    const isSeason = d.cardType === "SEASON_CLOSING";
    const tagText = isVictory
      ? "🔥 VITÓRIA DE ARQUIBANCADA & PISTA"
      : isSeason
      ? `👑 FECHAMENTO DA TEMPORADA ${d.season}`
      : "🛡️ PERFIL DA AGREMIAÇÃO";

    ctx.fillStyle = isVictory ? "#991b1b" : isSeason ? "#065f46" : "#1e1b4b";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 170, 68, 340, 32, 8);
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 13px sans-serif";
    ctx.fillText(tagText, W / 2, 89);

    // 3. MAIN TORCIDA NAME & CLUB
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 28px sans-serif";
    ctx.fillText(d.torcidaName.toUpperCase(), W / 2, 145);

    ctx.fillStyle = "#fcd34d";
    ctx.font = "700 14px sans-serif";
    ctx.fillText(`AGREMIAÇÃO DO ${d.clube.toUpperCase()}`, W / 2, 170);

    // Color Badges Circles
    ctx.beginPath();
    ctx.arc(W / 2 - 15, 192, 9, 0, Math.PI * 2);
    ctx.fillStyle = d.primaryColor;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(W / 2 + 15, 192, 9, 0, Math.PI * 2);
    ctx.fillStyle = d.secondaryColor;
    ctx.fill();
    ctx.stroke();

    // 4. RANKING & POWER SCORE BIG BADGE
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(40, 215, W - 80, 110, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 11px sans-serif";
    ctx.fillText("POSIÇÃO NO RANKING NACIONAL DE TORCIDAS", W / 2, 238);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 42px sans-serif";
    ctx.fillText(`#${d.rank}º LUGAR`, W / 2, 282);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "800 12px sans-serif";
    ctx.fillText(`POWER SCORE: ${d.powerScore} PTS`, W / 2, 308);

    // 5. MATCH / DERBY SECTION OR SEASON STATS
    if (isVictory && d.matchTitle) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      ctx.roundRect(40, 340, W - 80, 75, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ef4444";
      ctx.font = "900 11px sans-serif";
      ctx.fillText(`⚔️ ${d.matchTitle.toUpperCase()}`, W / 2, 362);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 24px sans-serif";
      ctx.fillText(d.score || "VITÓRIA DE PISTA", W / 2, 395);
    } else {
      // Stats Grid Box
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      ctx.roundRect(40, 340, W - 80, 75, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const statY = 368;
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "700 11px sans-serif";
      ctx.fillText(`👥 MASSA: ${d.contingente || 75}/100   •   🥁 BANCADA: ${d.pressaoBancada || 75}/100`, W / 2, statY);
      ctx.fillText(`🥊 PISTA: ${d.poderPista || 75}/100   •   💰 CAIXA: R$ ${(d.bankBalance || 15000).toLocaleString()}`, W / 2, statY + 24);
    }

    // 6. CHRONICLE / NARRATIVE BOX
    const chronicleBoxY = 430;
    const chronicleBoxH = 390;
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.beginPath();
    ctx.roundRect(40, chronicleBoxY, W - 80, chronicleBoxH, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#f59e0b";
    ctx.font = "900 12px sans-serif";
    ctx.fillText("📖 CRÔNICA OFICIAL DA AGREMIAÇÃO", W / 2, chronicleBoxY + 30);

    // Wrap chronicle text
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "500 13px sans-serif";
    ctx.textAlign = "left";

    const chronicleText = d.chronicle || "O respeito da nossa torcida foi mantido com bravura e lealdade nas arquibancadas e nas ruas de todo o Brasil!";
    const words = chronicleText.split(" ");
    let line = "";
    let lineY = chronicleBoxY + 60;
    const maxWidth = W - 110;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 55, lineY);
        line = words[n] + " ";
        lineY += 21;
        if (lineY > chronicleBoxY + chronicleBoxH - 30) break;
      } else {
        line = testLine;
      }
    }
    if (lineY <= chronicleBoxY + chronicleBoxH - 30) {
      ctx.fillText(line, 55, lineY);
    }

    // 7. FOOTER CALL-TO-ACTION
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "700 11px sans-serif";
    ctx.fillText("🎮 MONTE E COMANDE SUA TORCIDA ORGANIZADA", W / 2, 850);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "900 15px sans-serif";
    ctx.fillText("kaversgames.com.br", W / 2, 875);

    ctx.fillStyle = "#64748b";
    ctx.font = "600 10px sans-serif";
    ctx.fillText("#BancadaSimulator #KaversGames #TorcidaOrganizada", W / 2, 915);

    // Export image URL
    try {
      const url = canvas.toDataURL("image/png");
      setDownloadUrl(url);
    } catch {
      // canvas export blocked
    }
  };

  const handleDownloadImage = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `card_${data.torcidaName.toLowerCase().replace(/\s+/g, "_")}_story.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedToast("Imagem PNG baixada com sucesso!");
    setTimeout(() => setCopiedToast(null), 3000);
  };

  const handleCopyTextForInstagram = () => {
    const text = `🥁 [BANCADA SIMULATOR • KAVERS GAMES]\n${data.torcidaName} (${data.clube})\n👑 Posição no Ranking: ${data.rank}º LUGAR NACIONAL (${data.powerScore} pts)\n\n"Crônica: ${data.chronicle?.slice(0, 160)}..."\n\n🎮 Jogue grátis o Simulador de Torcidas:\n👉 https://kaversgames.com.br\n#BancadaSimulator #KaversGames`;
    navigator.clipboard.writeText(text);
    setCopiedToast("Texto formatado copiado! Cole na legenda do Story.");
    setTimeout(() => setCopiedToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[110] animate-fade-in overflow-y-auto">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-lg w-full p-4 sm:p-5 text-center shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> GERADOR DE CARD VISUAL DE STORY (9:16)
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {copiedToast && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold p-2.5 rounded-xl animate-fade-in flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" /> {copiedToast}
          </div>
        )}

        {/* Live Story Canvas Preview */}
        <div className="flex flex-col items-center justify-center my-1 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[270px] h-auto rounded-xl shadow-2xl border border-amber-500/40"
          />
          <span className="text-[9px] text-zinc-400 font-bold mt-2">
            📸 Formato 9:16 Otimizado para Instagram Stories, WhatsApp Status & TikTok
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleDownloadImage}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Baixar Imagem PNG (Story)
          </button>

          <button
            onClick={handleCopyTextForInstagram}
            className="py-3 px-4 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Copiar Legenda & Texto
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase transition-all cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
