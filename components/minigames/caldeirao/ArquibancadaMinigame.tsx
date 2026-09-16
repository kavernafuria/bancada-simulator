"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Flame,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Clock,
  Activity,
  Info,
} from "lucide-react";
import { caldeiraoSound } from "./caldeiraoAudio";
import { ArquibancadaVisualizer } from "./ArquibancadaVisualizer";
import { TacticalPitch, TeamPitchInfo } from "./TacticalPitch";
import { MiniGameResult } from "@/components/MatchTacticalResolver";

interface ArquibancadaMinigameProps {
  homeTeam: TeamPitchInfo;
  awayTeam: TeamPitchInfo;
  initialScore?: number;
  onFinish: (result: MiniGameResult) => void;
}

export const ArquibancadaMinigame: React.FC<ArquibancadaMinigameProps> = ({
  homeTeam,
  awayTeam,
  initialScore = 50,
  onFinish,
}) => {
  // Game states
  const [energy, setEnergy] = useState<number>(100); // 0 to 100%
  const [pressure, setPressure] = useState<number>(45); // 0 to 100%
  const [decibels, setDecibels] = useState<number>(70);
  const [matchMinute, setMatchMinute] = useState<number>(1);
  const [standScore, setStandScore] = useState<number>(initialScore);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Central metric: Seconds maintained in Zone >85%
  const [timeInZone85, setTimeInZone85] = useState<number>(0);
  const [chancesCreated, setChancesCreated] = useState<number>(0);

  // Cooldowns
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // Visual state flags
  const [isBannerUp, setIsBannerUp] = useState<boolean>(false);
  const [hasVerticalStripes, setHasVerticalStripes] = useState<boolean>(false);
  const [hasFlares, setHasFlares] = useState<boolean>(false);
  const [isChanting, setIsChanting] = useState<boolean>(false);
  const [isDrumming, setIsDrumming] = useState<boolean>(false);
  const [hasMosaic, setHasMosaic] = useState<boolean>(false);
  const [activeChantText, setActiveChantText] = useState<string | null>(null);

  const [actionFeedback, setActionFeedback] = useState<{
    message: string;
    type: "success" | "danger" | "info" | "warning";
  }>({
    message: "Mantenha a pressão da torcida ACIMA DE 85% para sufocar o adversário no campinho tático!",
    type: "info",
  });
  const [recentAttackEvent, setRecentAttackEvent] = useState<string | null>(null);

  const pressureRef = useRef(pressure);
  pressureRef.current = pressure;
  const isAbove85 = pressure >= 85;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    caldeiraoSound.enabled = next;
  };

  // Cooldown countdown timer
  useEffect(() => {
    if (isGameOver) return;
    const cdTimer = setInterval(() => {
      setCooldowns((prev) => {
        const nextCd: Record<string, number> = {};
        let changed = false;
        for (const key of Object.keys(prev)) {
          const val = prev[key];
          if (typeof val === "number" && val > 1) {
            nextCd[key] = val - 1;
            changed = true;
          } else if (val === 1) {
            changed = true;
          }
        }
        return changed ? nextCd : prev;
      });
    }, 1000);

    return () => clearInterval(cdTimer);
  }, [isGameOver]);

  // Main match timer (90 match minutes in ~45 real seconds)
  useEffect(() => {
    if (isGameOver) return;

    const gameTimer = setInterval(() => {
      setMatchMinute((prev) => {
        const nextMin = prev + 2;
        if (nextMin >= 90) {
          setIsGameOver(true);
          return 90;
        }
        return nextMin;
      });

      // Natural energy recovery
      setEnergy((prev) => Math.min(100, Math.round(prev + 2.5)));

      // Pressure decay (faster if > 85%)
      const currPress = pressureRef.current;
      const decay = currPress >= 85 ? 4.5 : currPress >= 60 ? 2.5 : 1.2;

      setPressure((prev) => {
        const nextPress = Math.max(10, Math.round(prev - decay));
        const avg = (nextPress + currPress) / 2;
        setStandScore(Math.round(avg));
        return nextPress;
      });

      // Zone 85% tracker
      if (currPress >= 85) {
        setTimeInZone85((t) => t + 1);

        if (Math.random() < 0.45) {
          setChancesCreated((c) => c + 1);
          const attackLogs = [
            "💥 CHUTE NA TRAVE! O goleiro se esticou todo!",
            "🔥 BOLA PASSOU RASPANDO A TRAVE DIREITA!",
            "⚡ BLITZ TOTAL! Cabeceio forte no travessão!",
            "🚀 BOMBA DA INTERMEDIÁRIA! Escanteio cedido pela zaga!",
            "🧤 MILAGRE DO GOLEIRO RIVAL! Espalmada no susto!",
          ];
          const randomEv = attackLogs[Math.floor(Math.random() * attackLogs.length)];
          setRecentAttackEvent(randomEv);
          setTimeout(() => setRecentAttackEvent(null), 1800);
        }
      }
    }, 950);

    return () => clearInterval(gameTimer);
  }, [isGameOver]);

  // Handle player actions
  const handleAction = (actionId: string) => {
    if (isGameOver) return;

    if (actionId === "grito") {
      if (energy < 14) return;
      caldeiraoSound.playClap();
      setEnergy((prev) => Math.max(0, prev - 14));
      setPressure((prev) => Math.min(100, prev + 12));
      setDecibels((prev) => Math.min(125, prev + 8));
      setIsChanting(true);
      setTimeout(() => setIsChanting(false), 2500);

      const hinoText = `${homeTeam.name.toUpperCase()} ATÉ O FIM! CANTA A TORCIDA!`;
      setActiveChantText(hinoText);
      setTimeout(() => setActiveChantText(null), 3000);

      setActionFeedback({
        message: "📢 Grito de Guerra puxado! A massa canta o hino e recupera +12% de pressão!",
        type: "success",
      });
      setCooldowns((cd) => ({ ...cd, grito: 3 }));
    } else if (actionId === "bandeirao") {
      if (energy < 28) return;
      caldeiraoSound.playWhistle();
      setEnergy((prev) => Math.max(0, prev - 28));
      setPressure((prev) => Math.min(100, prev + 22));
      setDecibels((prev) => Math.min(125, prev + 12));
      setIsBannerUp(true);
      setTimeout(() => setIsBannerUp(false), 4500);

      setActionFeedback({
        message: "🚩 Pavilhão gigante desfraldado no setor principal! (+22% de pressão)",
        type: "success",
      });
      setCooldowns((cd) => ({ ...cd, bandeirao: 6 }));
    } else if (actionId === "faixas") {
      if (energy < 16) return;
      caldeiraoSound.playClap();
      setEnergy((prev) => Math.max(0, prev - 16));
      setPressure((prev) => Math.min(100, prev + 14));
      setHasVerticalStripes(true);
      setTimeout(() => setHasVerticalStripes(false), 4000);

      setActionFeedback({
        message: "🎗️ Faixas esticadas descendo do topo do setor! (+14% de sustentação)",
        type: "info",
      });
      setCooldowns((cd) => ({ ...cd, faixas: 4 }));
    } else if (actionId === "sinalizadores") {
      if (energy < 24) return;
      caldeiraoSound.playFlare();
      setEnergy((prev) => Math.max(0, prev - 24));
      setPressure((prev) => Math.min(100, prev + 20));
      setDecibels((prev) => Math.min(125, prev + 15));
      setHasFlares(true);
      setTimeout(() => setHasFlares(false), 3800);

      setActionFeedback({
        message: "🔥 Sinalizadores vermelhos acesos! Fumaça no setor incendeia a arquibancada (+20%)",
        type: "warning",
      });
      setCooldowns((cd) => ({ ...cd, sinalizadores: 5 }));
    } else if (actionId === "bateria") {
      if (energy < 10) return;
      caldeiraoSound.playDrum();
      setEnergy((prev) => Math.max(0, prev - 10));
      setPressure((prev) => Math.min(100, prev + 9));
      setIsDrumming(true);
      setTimeout(() => setIsDrumming(false), 2000);

      setActionFeedback({
        message: "🥁 Surdos de terceira e repiques no ritmo rápido! Freia a queda de pressão.",
        type: "info",
      });
      setCooldowns((cd) => ({ ...cd, bateria: 2 }));
    } else if (actionId === "descanso") {
      caldeiraoSound.playClap();
      setEnergy((prev) => Math.min(100, prev + 30));
      setPressure((prev) => Math.max(10, prev - 12));

      setActionFeedback({
        message: "💧 Hidratação da bancada! Recuperou +30 de fôlego com perda temporária de 12% de pressão.",
        type: "warning",
      });
      setCooldowns((cd) => ({ ...cd, descanso: 6 }));
    }
  };

  const handleFinishMinigame = () => {
    // Map final performance to standard MiniGameResult
    let rank: "S" | "B" | "C" | "F" = "F";
    let modifier = -0.15;
    let desc = "A torcida não conseguiu incendiar a arquibancada (-15% PEC).";

    if (timeInZone85 >= 18 || standScore >= 80) {
      rank = "S";
      modifier = 0.25;
      desc = `Caldeirão fervendo! Torcida sustentou ${timeInZone85}s acima dos 85% e incendiou o time no campo (+25% PEC)!`;
    } else if (timeInZone85 >= 8 || standScore >= 65) {
      rank = "B";
      modifier = 0.15;
      desc = `Boa pressão de arquibancada! ${timeInZone85}s de caldeirão garantiram bom apoio ao time (+15% PEC).`;
    } else if (standScore >= 45) {
      rank = "C";
      modifier = 0.05;
      desc = "Apoio regular de bancada sem grande pressão no adversário (+5% PEC).";
    }

    onFinish({
      gameType: "caldeirao_pitch",
      modifier,
      rank,
      description: desc,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
      {/* Match Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-xl shadow-md">
            🏟️
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
              {homeTeam.name} <span className="text-amber-400">vs</span> {awayTeam.name}
            </h2>
            <p className="text-xs text-zinc-400">
              Minigame de Arquibancada & Pressão no Campinho Tático
            </p>
          </div>
        </div>

        {/* Dynamic Match Time & Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800 font-mono text-xs font-bold text-amber-400">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{matchMinute}&apos; MIN</span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800 font-mono text-xs font-bold text-emerald-400">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Nota: {standScore} Pts</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
            title={soundEnabled ? "Mutar Sons" : "Ativar Sons"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
          </button>
        </div>
      </div>

      {/* Grid Duplo: Arquibancada (Esquerda) + Campinho Tático (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lado Esquerdo: Visualizador da Arquibancada & Controles */}
        <ArquibancadaVisualizer
          homeTeam={homeTeam}
          isBannerUp={isBannerUp}
          hasVerticalStripes={hasVerticalStripes}
          hasFlares={hasFlares}
          isChanting={isChanting}
          isDrumming={isDrumming}
          hasMosaic={hasMosaic}
          activeChantText={activeChantText}
          crowdEnergy={energy}
          pressure={pressure}
          decibels={decibels}
          isAbove85={isAbove85}
          isGameOver={isGameOver}
          onAction={handleAction}
          cooldowns={cooldowns}
        />

        {/* Lado Direito: O Campinho Tático em Tempo Real */}
        <TacticalPitch
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          pressure={pressure}
          isAbove85={isAbove85}
          timeInZone85={timeInZone85}
          recentAttackEvent={recentAttackEvent}
          chancesCreated={chancesCreated}
        />
      </div>

      {/* Action Feedback Banner */}
      <div
        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
          actionFeedback.type === "success"
            ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300"
            : actionFeedback.type === "warning"
            ? "bg-amber-950/60 border-amber-500/60 text-amber-300"
            : "bg-zinc-900 border-zinc-800 text-zinc-300"
        }`}
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{actionFeedback.message}</span>
        </span>

        {isGameOver && (
          <button
            onClick={handleFinishMinigame}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg animate-pulse"
          >
            FIM DO JOGO • VER RESULTADO DA BANCA →
          </button>
        )}
      </div>
    </div>
  );
};
