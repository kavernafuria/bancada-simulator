"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Drum,
  Shield,
  Flame,
  Bus,
  Swords,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Zap,
  Gamepad2,
  Sparkles,
  Trophy,
  Monitor,
  Smartphone,
} from "lucide-react";
import {
  WhackCombat,
  PunchFrontCombat,
  RojonTarget,
  MemoryMosaic,
  ColorMemoryGame,
  CaravanDodge,
  MatchTacticalResolver,
  MiniGameResult,
} from "@/components/MatchTacticalResolver";
import { Runner3DGame } from "@/components/minigames/Runner3DGame";
import { RuadaFlagWavingModal } from "@/components/flag_waving/RuadaFlagWavingModal";
import { RhythmBateriaModal } from "@/components/rhythm_bateria/RhythmBateriaModal";
import { ArquibancadaMinigame } from "@/components/minigames/caldeirao/ArquibancadaMinigame";

export default function MiniGamesTestPage() {
  const [activeTab, setActiveTab] = useState<
    "caldeirao" | "runner3d" | "whack" | "punch" | "rojon" | "rhythm" | "dodge" | "memory" | "gate" | "ruada"
  >("caldeirao");

  // Viewport Switcher Mode (Desktop vs Mobile simulation)
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");

  // Tier Config
  const [opponentTier, setOpponentTier] = useState<"S" | "A" | "B">("A");

  // Runner 3D Configs
  const [runnerContingente, setRunnerContingente] = useState<number>(75);
  const [runnerPoderPista, setRunnerPoderPista] = useState<number>(80);

  // Gate 80% Config
  const [homeContingent, setHomeContingent] = useState<number>(3000);
  const [awayContingent, setAwayContingent] = useState<number>(2000);

  // Key to force component remount on restart
  const [gameKey, setGameKey] = useState<number>(0);

  // Result Log
  const [lastResult, setLastResult] = useState<{
    text: string;
    modifier: number;
    penaltyMP?: number;
    gameType?: string;
  } | null>(null);

  const handleFinishMiniGame = (result: MiniGameResult) => {
    setLastResult({
      text: result.description,
      modifier: result.modifier,
      penaltyMP: result.penaltyMP,
      gameType: result.gameType,
    });
  };

  const handleRestart = () => {
    setLastResult(null);
    setGameKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 space-y-5">
      {/* HEADER */}
      <div className="max-w-4xl w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/bancada"
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500 text-zinc-300 hover:text-white transition-all shadow-md active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
              <Gamepad2 className="w-3.5 h-3.5" /> BANCADA SIMULATOR • LABORATÓRIO DE MINI-GAMES
            </span>
            <h1 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
              Testes Individuais de Mini-Games
            </h1>
          </div>
        </div>

        {/* CONTROLS (VIEWPORT SWITCHER & RESTART) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* VIEWPORT MODE TOGGLE BUTTONS */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl shadow-md">
            <button
              onClick={() => setViewportMode("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                viewportMode === "desktop"
                  ? "bg-amber-500 text-black shadow-md font-black scale-105"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Monitor className="w-4 h-4" /> Computador
            </button>
            <button
              onClick={() => setViewportMode("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                viewportMode === "mobile"
                  ? "bg-amber-500 text-black shadow-md font-black scale-105"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4" /> Celular
            </button>
          </div>

          <button
            onClick={handleRestart}
            className="py-2 px-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs hover:bg-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
          </button>
        </div>
      </div>

      {/* SELECTOR TABS (9 MINI-GAMES) */}
      <div className="max-w-4xl w-full grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {/* CALDEIRÃO & CAMPINHO */}
        <button
          onClick={() => {
            setActiveTab("caldeirao");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "caldeirao"
              ? "bg-amber-500 text-black border-amber-400 shadow-xl font-black scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className={`flex items-center gap-1 text-[11px] ${activeTab === "caldeirao" ? "text-black" : "text-amber-400"}`}>
              <Trophy className="w-3.5 h-3.5" /> Caldeirão
            </span>
          </div>
          <span className={`text-[9px] block mt-0.5 ${activeTab === "caldeirao" ? "text-zinc-900 font-bold" : "text-zinc-500"}`}>Bancada & Campo</span>
        </button>

        {/* RUNNER 3D */}
        <button
          onClick={() => {
            setActiveTab("runner3d");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "runner3d"
              ? "bg-amber-500 text-black border-amber-400 shadow-xl font-black scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className={`flex items-center gap-1 text-[11px] ${activeTab === "runner3d" ? "text-black" : "text-amber-400"}`}>
              <Gamepad2 className="w-3.5 h-3.5" /> Corredor 3D
            </span>
          </div>
          <span className={`text-[9px] block mt-0.5 ${activeTab === "runner3d" ? "text-zinc-900 font-bold" : "text-zinc-500"}`}>Linha de Frente</span>
        </button>

        {/* BARRAS FERRO */}
        <button
          onClick={() => {
            setActiveTab("whack");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "whack"
              ? "bg-red-950/80 border-red-500 text-white shadow-xl scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1 text-red-400 text-[11px]">
              <Swords className="w-3.5 h-3.5" /> Barras Ferro
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-0.5">Confronto 3D Top-Down</span>
        </button>

        {/* COMBATE SOCO */}
        <button
          onClick={() => {
            setActiveTab("punch");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "punch"
              ? "bg-red-950/80 border-red-500 text-white shadow-xl scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1 text-red-400 text-[11px]">
              <Zap className="w-3.5 h-3.5" /> Combate Soco
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-0.5">Soco & Bloqueio</span>
        </button>

        {/* ROJÕES */}
        <button
          onClick={() => {
            setActiveTab("rojon");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "rojon"
              ? "bg-orange-950/80 border-orange-500 text-white shadow-xl scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1 text-orange-400 text-[11px]">
              <Flame className="w-3.5 h-3.5" /> Rojões
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-0.5">Radar X / Y</span>
        </button>

        {/* BATERIA & MOSAICO */}
        <button
          onClick={() => {
            setActiveTab("rhythm");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "rhythm"
              ? "bg-emerald-950/80 border-emerald-500 text-white shadow-xl scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
              <Drum className="w-3.5 h-3.5" /> Ritmo & Bateria
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-0.5">Surdo & Batucada 20s</span>
        </button>

        {/* JOGO DA VAN */}
        <button
          onClick={() => {
            setActiveTab("dodge");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "dodge"
              ? "bg-yellow-950/80 border-yellow-500 text-white shadow-xl scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1 text-yellow-400 text-[11px]">
              <Bus className="w-3.5 h-3.5" /> Jogo da Van
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-0.5">Esquivar Obstáculos</span>
        </button>

        {/* SEQUÊNCIA CORES */}
        <button
          onClick={() => {
            setActiveTab("memory");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "memory"
              ? "bg-amber-950/80 border-amber-500 text-white shadow-xl scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1 text-amber-400 text-[11px]">
              <Zap className="w-3.5 h-3.5" /> Sequência Cores
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-0.5">Pavilhão de Cores</span>
        </button>

        {/* RUADA BANDEIRÃO */}
        <button
          onClick={() => {
            setActiveTab("ruada");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "ruada"
              ? "bg-amber-950/80 border-amber-500 text-white shadow-xl scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1 text-amber-400 text-[11px]">
              <Flame className="w-3.5 h-3.5" /> Ruada de Recepção
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-0.5">Tremular Bandeirão</span>
        </button>

        {/* TRAVA 80% */}
        <button
          onClick={() => {
            setActiveTab("gate");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "gate"
              ? "bg-blue-950/80 border-blue-500 text-white shadow-xl scale-[1.02]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1 text-blue-400 text-[11px]">
              <Shield className="w-3.5 h-3.5" /> Trava 80%
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-0.5">Portão Local</span>
        </button>
      </div>

      {/* PLAYGROUND CONTAINER (DESKTOP vs MOBILE SIMULATOR FRAME) */}
      <div
        className={`transition-all duration-300 mx-auto ${
          viewportMode === "mobile"
            ? "w-full max-w-[390px] border-4 border-zinc-700 rounded-[38px] p-2 bg-zinc-950 shadow-2xl relative ring-2 ring-zinc-700/50 my-2"
            : "max-w-4xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 min-h-[420px] shadow-2xl relative overflow-hidden"
        }`}
      >
        {/* Simulated Mobile Camera Notch */}
        {viewportMode === "mobile" && (
          <div className="w-full flex justify-center mb-2 pointer-events-none">
            <div className="w-24 h-4 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 shadow-inner">
              <div className="w-3 h-3 rounded-full bg-zinc-950 border border-zinc-800" />
            </div>
          </div>
        )}

        {activeTab === "caldeirao" && (
          <ArquibancadaMinigame
            key={gameKey}
            homeTeam={{
              name: "Mancha Verde",
              primaryColor: "#15803d",
              secondaryColor: "#ffffff",
            }}
            awayTeam={{
              name: "Gaviões da Fiel",
              primaryColor: "#dc2626",
              secondaryColor: "#18181b",
            }}
            onFinish={handleFinishMiniGame}
          />
        )}

        {activeTab === "runner3d" && (
          <Runner3DGame
            key={gameKey}
            playerTorcidaName="Mancha Verde"
            playerClubName="Palmeiras"
            rivalTorcidaName="Gaviões da Fiel"
            rivalClubName="Corinthians"
            playerPrimaryColor="#15803d"
            playerSecondaryColor="#ffffff"
            rivalPrimaryColor="#dc2626"
            contingente={runnerContingente}
            poderPista={runnerPoderPista}
            opponentTier={opponentTier}
            onFinish={handleFinishMiniGame}
          />
        )}

        {activeTab === "whack" && (
          <Runner3DGame
            key={gameKey}
            playerTorcidaName="Mancha Verde"
            playerClubName="Palmeiras"
            rivalTorcidaName="Gaviões da Fiel"
            rivalClubName="Corinthians"
            playerPrimaryColor="#15803d"
            playerSecondaryColor="#ffffff"
            rivalPrimaryColor="#dc2626"
            contingente={runnerContingente}
            poderPista={runnerPoderPista}
            opponentTier={opponentTier}
            gameMode="clash_bars"
            onFinish={handleFinishMiniGame}
          />
        )}

        {activeTab === "punch" && (
          <PunchFrontCombat key={gameKey} opponentTier={opponentTier} onFinish={handleFinishMiniGame} />
        )}

        {activeTab === "rojon" && (
          <RojonTarget key={gameKey} onFinish={handleFinishMiniGame} />
        )}

        {activeTab === "rhythm" && (
          <RhythmBateriaModal
            key={gameKey}
            onClose={() => handleRestart()}
            onFinish={(res) => {
              handleFinishMiniGame({
                gameType: "rhythm_bateria",
                modifier: res.modifier,
                rank: res.rank,
                description: res.description,
              });
            }}
          />
        )}

        {activeTab === "dodge" && (
          <CaravanDodge key={gameKey} onFinish={handleFinishMiniGame} />
        )}

        {activeTab === "memory" && (
          <ColorMemoryGame key={gameKey} opponentTier={opponentTier} onFinish={handleFinishMiniGame} />
        )}

        {activeTab === "ruada" && (
          <RuadaFlagWavingModal
            key={gameKey}
            onClose={() => handleRestart()}
            onFinish={(res) => {
              handleFinishMiniGame({
                gameType: "flag_waving",
                modifier: res.modifier,
                rank: res.rank,
                description: res.description,
              });
            }}
          />
        )}

        {activeTab === "gate" && (
          <MatchTacticalResolver
            key={gameKey}
            context={{
              isHome: true,
              tacticalChoice: "gate_concentration",
              homeContingent,
              awayContingent,
              opponentTier: awayContingent > 2500 ? "S" : "A",
            }}
            onMatchComplete={(msg, mod, pen) => {
              handleFinishMiniGame({
                gameType: "whack",
                modifier: mod,
                rank: mod >= 0.2 ? "S" : mod >= 0.1 ? "B" : mod === 0 ? "C" : "F",
                penaltyMP: pen,
                description: msg,
              });
            }}
          />
        )}
      </div>

      {/* LIVE RESULT MONITOR */}
      {lastResult && (
        <div className="max-w-4xl w-full bg-zinc-900 border border-emerald-500/50 rounded-2xl p-4 space-y-2 animate-in fade-in shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> RESULTADO GERADO PELO MINI-GAME
            </span>
            <span className="text-xs font-black text-amber-400 font-mono">
              Modificador PEC: {(lastResult.modifier * 100).toFixed(0)}%
            </span>
          </div>

          <p className="text-xs text-white font-bold">{lastResult.text}</p>

          {lastResult.penaltyMP ? (
            <div className="text-[11px] text-red-400 font-semibold flex items-center gap-1 pt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Risco de Ministério Público adicional: +{lastResult.penaltyMP}%
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
