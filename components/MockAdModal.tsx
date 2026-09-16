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

    // Modern browsers allow muted autoplay reliably
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

        {/* Clickable Video Container (TikTok / Reels Vertical Portrait 9:16) */}
        <div
          onClick={handleAdClick}
          className="group relative bg-black rounded-2xl border-2 border-amber-500/50 overflow-hidden cursor-pointer shadow-2xl transition-all hover:border-amber-400 aspect-[9/16] w-full max-w-[250px] mx-auto max-h-[48vh] flex items-center justify-center"
          title="Clique em qualquer lugar do anúncio para abrir na Shopee"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/videos/videoanuncio.mp4" type="video/mp4" />
          </video>

          {/* Pause / Autoplay Play Trigger Button Overlay */}
          {isPaused && (
            <button
              onClick={handleStartPlay}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white font-black z-30 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transform transition group-hover:scale-110">
                <Play className="w-6 h-6 ml-1 fill-black" />
              </div>
              <span className="text-xs uppercase tracking-wider bg-amber-500 text-black px-2.5 py-0.5 rounded-full">
                ▶ TOQUE PARA ASSISTIR COM SOM
              </span>
            </button>
          )}

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
