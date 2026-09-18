"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tv, Sparkles, X, CheckCircle2, ExternalLink, Volume2, VolumeX, Lock, Play } from "lucide-react";

interface MockAdModalProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const MockAdModal: React.FC<MockAdModalProps> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [duration, setDuration] = useState(20);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const shopeeUrl = "https://shopee.com.br/product/336227879/22899347329/";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicitly load video for mobile compatibility
    try {
      video.load();
    } catch {}

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
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

    // Muted autoplay attempt for mobile Safari/Chrome
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPaused(false);
        })
        .catch(() => {
          setIsPaused(true);
        });
    }

    // Fallback timer interval (ticks every 1s)
    const timer = setInterval(() => {
      if (video.currentTime) {
        setCurrentTime(video.currentTime);
        if (video.duration && !isNaN(video.duration)) setDuration(video.duration);
        if (video.currentTime >= (video.duration || 20) - 0.5) {
          setIsFinished(true);
        }
      } else {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= 20) setIsFinished(true);
          return next;
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleStartPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play().then(() => setIsPaused(false)).catch(() => {});
    }
  };

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

  const totalSeconds = duration > 0 ? duration : 20;
  const remainingSeconds = Math.max(0, Math.ceil(totalSeconds - currentTime));
  const progressPct = totalSeconds > 0 ? Math.min(100, (currentTime / totalSeconds) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[1000] bg-black select-none animate-fade-in flex items-center justify-center p-0 sm:p-4">
      {/* TikTok Portrait Container: Fullscreen on mobile, centered Smartphone mockup on desktop */}
      <div className="relative w-full h-full sm:h-[680px] sm:max-w-[380px] sm:rounded-3xl bg-black border-0 sm:border-2 sm:border-amber-500/80 shadow-2xl overflow-hidden flex flex-col justify-between">
        
        {/* TikTok Full Background Video Container */}
        <div
          onClick={handleAdClick}
          className="absolute inset-0 w-full h-full bg-black cursor-pointer overflow-hidden flex items-center justify-center z-0"
          title="Clique em qualquer lugar do anúncio para abrir o produto na Shopee"
        >
          <video
            ref={videoRef}
            src="/videos/videoanuncio.mp4"
            autoPlay
            playsInline
            muted={isMuted}
            preload="auto"
            className="w-full h-full object-cover bg-black"
          >
            <source src="/videos/videoanuncio.mp4" type="video/mp4" />
          </video>

          {/* Autoplay Fallback Trigger Overlay */}
          {isPaused && (
            <button
              onClick={handleStartPlay}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 text-white font-black z-40 cursor-pointer p-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl animate-pulse">
                <Play className="w-8 h-8 ml-1 fill-black" />
              </div>
              <span className="text-xs uppercase tracking-wider bg-amber-500 text-black px-4 py-2 rounded-full font-black shadow-lg">
                ▶ TOQUE PARA ASSISTIR COM SOM
              </span>
            </button>
          )}
        </div>

        {/* Top TikTok Overlay Header */}
        <div className="relative z-30 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
          <div className="flex items-center gap-2 bg-amber-950/90 border border-amber-500/60 rounded-xl px-3 py-1.5 shadow-lg pointer-events-auto">
            <Tv className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider">
              ANÚNCIO RECOMPENSADO (2x CONTINGENTE)
            </span>
          </div>
          <span className="text-[11px] font-black text-amber-400 bg-zinc-900/90 px-3 py-1 rounded-xl border border-amber-500/40 shadow-lg pointer-events-auto">
            {isFinished ? "CONCLUÍDO" : `${remainingSeconds}s`}
          </span>
        </div>

        {/* Middle Right Audio Toggle Button */}
        <div className="relative z-30 px-3 sm:px-4 flex justify-end pointer-events-none">
          <button
            type="button"
            onClick={toggleMute}
            className="pointer-events-auto bg-black/75 hover:bg-black text-white p-3 rounded-full border border-amber-500/60 shadow-2xl transition cursor-pointer active:scale-95"
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>

        {/* Bottom TikTok Overlay Footer */}
        <div className="relative z-30 p-3 sm:p-4 space-y-2.5 bg-gradient-to-t from-black via-black/85 to-transparent">
          {/* Shopee Callout Button */}
          <button
            onClick={handleAdClick}
            className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white p-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-orange-400/50"
          >
            <ExternalLink className="w-4 h-4" /> Abrir Produto na Shopee
          </button>

          {/* Status message */}
          <p className="text-[11px] text-zinc-200 leading-tight font-semibold text-center drop-shadow">
            {isFinished ? (
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Anúncio concluído! Recompensa liberada.
              </span>
            ) : (
              <span>
                Assista até o fim para liberar a <strong>Segunda Chance (2x Contingente)</strong>.
              </span>
            )}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700/50">
            <div
              className="h-full bg-amber-500 transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Action Buttons */}
          <div>
            {isFinished ? (
              <button
                onClick={onComplete}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 hover:from-emerald-400 hover:to-green-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-2xl active:scale-95 cursor-pointer flex items-center justify-center gap-2 animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-black" /> RESGATAR 2x CONTINGENTE & REFAZER DUELO
              </button>
            ) : (
              <div className="space-y-1.5">
                <button
                  disabled
                  className="w-full py-3 px-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-500 font-black text-[11px] uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-amber-500/60" /> AGUARDE O FIM DO VÍDEO ({remainingSeconds}s)
                </button>

                <button
                  onClick={onCancel}
                  className="w-full py-1.5 px-3 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-400 hover:text-zinc-200 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Sair sem Recompensa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
