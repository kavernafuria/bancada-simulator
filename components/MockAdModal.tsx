"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tv, Sparkles, X, CheckCircle2, ExternalLink, Volume2, VolumeX, Lock } from "lucide-react";

interface MockAdModalProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const MockAdModal: React.FC<MockAdModalProps> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const shopeeUrl = "https://shopee.com.br/product/336227879/22899347329/";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
      if (video.duration && video.currentTime >= video.duration - 0.3) {
        setIsFinished(true);
      }
    };

    const handleEnded = () => {
      setIsFinished(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Try playing video with sound, fallback to muted if autoplay policy intervenes
    video.play().catch(() => {
      setIsMuted(true);
      video.muted = true;
      video.play().catch((err) => console.warn("Autoplay blocked:", err));
    });

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleAdClick = () => {
    window.open(shopeeUrl, "_blank");
  };

  const remainingSeconds = Math.max(0, Math.ceil(duration - currentTime));
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-zinc-900 border-2 border-amber-500/60 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 text-center relative overflow-hidden">
        {/* Ad Header Banner */}
        <div className="flex items-center justify-between bg-amber-950/80 border border-amber-500/40 rounded-xl px-3 py-1.5 text-left">
          <div className="flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
              ANÚNCIO RECOMPENSADO (2x CONTINGENTE)
            </span>
          </div>
          <span className="text-[9px] font-bold text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
            {isFinished ? "CONCLUÍDO" : `${remainingSeconds}s`}
          </span>
        </div>

        {/* Clickable Video Container */}
        <div
          onClick={handleAdClick}
          className="group relative bg-black rounded-2xl border-2 border-zinc-800 overflow-hidden cursor-pointer shadow-inner transition-all hover:border-amber-500/80 aspect-video flex items-center justify-center"
          title="Clique em qualquer lugar do anúncio para abrir na Shopee"
        >
          <video
            ref={videoRef}
            src="/videos/videoanuncio.mp4"
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Click Shopee Watermark Overlay */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
            <span className="bg-orange-600/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded border border-orange-400 shadow flex items-center gap-1">
              <ExternalLink className="w-2.5 h-2.5" /> Shopee • Clique para abrir produto
            </span>
          </div>

          {/* Audio Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full border border-zinc-700 z-20 transition cursor-pointer"
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Progress Bar overlay at bottom of video */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 pointer-events-none">
            <div
              className="h-full bg-amber-500 transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Shopee Click Callout Banner */}
        <button
          onClick={handleAdClick}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white p-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Clique aqui para abrir a oferta na Shopee
        </button>

        {/* Lock / Advance Status Explanation */}
        <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
          {isFinished ? (
            <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Anúncio concluído! Recompensa liberada.
            </span>
          ) : (
            <span>
              Assista ao vídeo até o final para desbloquear a <strong>Segunda Chance (2x Contingente)</strong>.
            </span>
          )}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isFinished ? (
            <button
              onClick={onComplete}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 hover:from-emerald-400 hover:to-green-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2 animate-pulse"
            >
              <Sparkles className="w-4 h-4 text-black" /> RESGATAR 2x CONTINGENTE & REFAZER DUELO
            </button>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full py-3.5 px-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-500 font-black text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-500/60" /> AGUARDE O FIM DO VÍDEO ({remainingSeconds}s)
              </button>

              <button
                onClick={onCancel}
                className="w-full py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" /> Sair sem Recompensa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
