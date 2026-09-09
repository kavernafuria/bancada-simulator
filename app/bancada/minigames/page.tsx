"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Drum, Shield, Flame, Bus, Swords, CheckCircle2, RotateCcw, AlertTriangle, Zap, Gamepad2, Sparkles, Trophy } from "lucide-react";
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

export default function MiniGamesTestPage() {
  const [activeTab, setActiveTab] = useState<
    "runner3d" | "whack" | "punch" | "rojon" | "rhythm" | "dodge" | "memory" | "gate"
  >("runner3d");

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
      <div className="max-w-4xl w-full flex items-center justify-between border-b border-zinc-800 pb-4">
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

        <button
          onClick={handleRestart}
          className="py-2 px-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs hover:bg-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Jogo
        </button>
      </div>

      {/* SELECTOR TABS (8 MINI-GAMES) */}
      <div className="max-w-4xl w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
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
          <span className="text-[9px] text-zinc-500 block mt-0.5">Clicar no Alvo</span>
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

        {/* MOSAICO CORES */}
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
              <Drum className="w-3.5 h-3.5" /> Mosaico Cores
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-0.5">Memória 3 Fases</span>
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

      {/* GAME INFO BANNER & CONFIG CONTROLS */}
      <div className="max-w-4xl w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2 text-xs">
        {activeTab === "runner3d" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-black text-amber-400 uppercase text-xs flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> CORREDOR 3D DE LINHA DE FRENTE:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px]">
                Visão 3D • Portões Multiplicadores +7/+10/x2 • Câmera Perto & Top-Down
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Ataque Frontal / Linha de Frente 3D</code>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Contingente da Torcida (10 a 100):</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={runnerContingente}
                  onChange={(e) => setRunnerContingente(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Poder de Pista PEC (10 a 100):</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={runnerPoderPista}
                  onChange={(e) => setRunnerPoderPista(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-red-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Dificuldade Rival (Tier):</label>
                <div className="flex gap-1.5 pt-0.5">
                  {(["S", "A", "B"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setOpponentTier(t);
                        setGameKey((k) => k + 1);
                        setLastResult(null);
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        opponentTier === t ? "bg-amber-500 text-black shadow font-black" : "bg-zinc-950 text-zinc-400 border border-zinc-800"
                      }`}
                    >
                      Tier {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "whack" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-red-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 text-[10px]">
                Decisão Tática (`CONFRONTO_BARRA_FERRO`)
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Confronto de Pista / Barra de Ferro</code>.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-zinc-400 font-bold">Nível do Rival (Velocidade):</span>
              {(["S", "A", "B"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setOpponentTier(t);
                    setGameKey((k) => k + 1);
                    setLastResult(null);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    opponentTier === t ? "bg-red-500 text-black shadow font-black" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  Tier {t}
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === "punch" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-red-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 text-[10px]">
                Combate de Linha de Frente (Mão Limpa)
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Combate de Punhos / Linha de Frente</code>.
            </p>
          </>
        )}

        {activeTab === "rojon" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-orange-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30 text-[10px]">
                Decisão Tática de Pista (Rojões & Morteiros)
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Guerra de Rojões & Morteiros</code>.
            </p>
            <p className="text-zinc-400 text-[11px]">
              <strong>Motor de Radar Balístico X/Y:</strong> Clique em 1️⃣ para travar a direção horizontal (Eixo X) e depois em 2️⃣ para disparar o morteiro na elevação (Eixo Y)!
            </p>
          </>
        )}

        {activeTab === "rhythm" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                Mosaico 3D & Festa de Bancada
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Mosaico 3D & Festa de Bancada</code>.
            </p>
            <p className="text-zinc-400 text-[11px]">
              <strong>3 Fases de Repetição:</strong> Complete as 3 fases de sequências coloridas (3, 4 e 5 cores) para garantir o ápice visual na arquibancada!
            </p>
          </>
        )}

        {activeTab === "dodge" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-yellow-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30 text-[10px]">
                Caravana & Ataque pelos Flancos
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Defesa de Comboio / Ataque pelos Flancos</code>.
            </p>
            <p className="text-zinc-400 text-[11px]">
              Use as setas ou botões virtuais de Esquerda / Direita para evitar bloqueios policiais e emboscadas nas vias.
            </p>
          </>
        )}

        {activeTab === "memory" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px]">
                Festa de Arquibancada (`rhythm_mosaic`)
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Bandeirão 3D, Mosaico de Papelão, Ruazão de Fogo & Bateria</code>.
            </p>
            <p className="text-zinc-400 text-[11px]">
              Observe a sequência piscar nas cores do pavilhão e repita a ordem exata! Acertar 5+ rodadas concede <strong>Rank S (+25% em Pressão de Bancada)</strong>!
            </p>
          </>
        )}

        {activeTab === "gate" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-blue-400 uppercase text-xs">📌 TELA QUE PUXA ESTE TESTE DE REGRA:</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 text-[10px]">
                Concentração no Portão (Jogo em Casa)
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Regra dos 80%:</strong> Se o contingente visitante for menor que 80% da torcida local, o confronto de rua é evitado. Se for igual ou maior a 80%, o visitante força a passagem!
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Contingente Local (Sua Torcida):</label>
                <input
                  type="number"
                  value={homeContingent}
                  onChange={(e) => setHomeContingent(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Contingente Visitante (Rival):</label>
                <input
                  type="number"
                  value={awayContingent}
                  onChange={(e) => setAwayContingent(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-red-400 font-bold"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* PLAYGROUND CONTAINER */}
      <div className="max-w-4xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px] shadow-2xl relative overflow-hidden">
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
          <WhackCombat key={gameKey} opponentTier={opponentTier} onFinish={handleFinishMiniGame} />
        )}

        {activeTab === "punch" && (
          <PunchFrontCombat key={gameKey} opponentTier={opponentTier} onFinish={handleFinishMiniGame} />
        )}

        {activeTab === "rojon" && (
          <RojonTarget key={gameKey} onFinish={handleFinishMiniGame} />
        )}

        {activeTab === "rhythm" && (
          <MemoryMosaic key={gameKey} onFinish={handleFinishMiniGame} />
        )}

        {activeTab === "dodge" && (
          <CaravanDodge key={gameKey} onFinish={handleFinishMiniGame} />
        )}

        {activeTab === "memory" && (
          <ColorMemoryGame key={gameKey} opponentTier={opponentTier} onFinish={handleFinishMiniGame} />
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
