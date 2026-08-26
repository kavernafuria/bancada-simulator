"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Drum, Shield, Flame, Bus, Swords, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import {
  PunchFrontCombat,
  RojonTarget,
  MemoryMosaic,
  CaravanDodge,
  MatchTacticalResolver,
  MiniGameResult,
  MatchContext,
} from "@/components/MatchTacticalResolver";

export default function MiniGamesTestPage() {
  const [activeTab, setActiveTab] = useState<"whack" | "rojon" | "rhythm" | "dodge" | "gate">("whack");

  // Whack Config
  const [whackTier, setWhackTier] = useState<"S" | "A" | "B">("S");

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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-start p-4 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="max-w-3xl w-full flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/bancada"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500 text-zinc-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
              🎮 BANCADA SIMULATOR • LABORATÓRIO DE TESTES
            </span>
            <h1 className="text-xl font-black uppercase text-white tracking-tight">
              Testes Individuais dos Mini-Games
            </h1>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="py-2 px-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Jogo
        </button>
      </div>

      {/* SELECTOR TABS */}
      <div className="max-w-3xl w-full grid grid-cols-2 md:grid-cols-5 gap-2">
        <button
          onClick={() => {
            setActiveTab("whack");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "whack"
              ? "bg-red-950/60 border-red-500 text-white shadow-lg"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1.5 text-red-400">
              <Swords className="w-4 h-4" /> Briga na Mão
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-1">Whack-a-Mole</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("rojon");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "rojon"
              ? "bg-orange-950/60 border-orange-500 text-white shadow-lg"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1.5 text-orange-400">
              <Flame className="w-4 h-4" /> Rojões
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-1">Mira com Inércia</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("rhythm");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "rhythm"
              ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Drum className="w-4 h-4" /> Bateria/Mosaico
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-1">Rhythm Game</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("dodge");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "dodge"
              ? "bg-yellow-950/60 border-yellow-500 text-white shadow-lg"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1.5 text-yellow-400">
              <Bus className="w-4 h-4" /> Caravana/Blitz
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-1">Lane Runner</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("gate");
            setLastResult(null);
            setGameKey((k) => k + 1);
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "gate"
              ? "bg-blue-950/60 border-blue-500 text-white shadow-lg"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between font-black text-xs">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Shield className="w-4 h-4" /> Trava 80%
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 block mt-1">Portão Local</span>
        </button>
      </div>

      {/* GAME INFO BANNER & TRIGGER SCREEN NAME */}
      <div className="max-w-3xl w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2 text-xs">
        {activeTab === "whack" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-red-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 text-[10px]">
                Fase 4: Decisão Tática de Pista
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Confronto de Pista / Barra de Ferro</code> ou <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Concentração no Portão (com visitante &gt;= 80%)</code>.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-zinc-400 font-bold">Nível do Rival (Velocidade):</span>
              {(["S", "A", "B"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setWhackTier(t);
                    setGameKey((k) => k + 1);
                    setLastResult(null);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    whackTier === t ? "bg-red-500 text-black shadow" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  Tier {t}
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === "rojon" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-orange-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30 text-[10px]">
                Fase 4: Decisão Tática de Pista
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Guerra de Rojões & Morteiros</code>.
            </p>
            <p className="text-zinc-400 text-[11px]">
              <strong>Novo Motor de Radar Balístico:</strong> Clique em 1️⃣ para travar a direção horizontal (Eixo X) e depois em 2️⃣ para disparar o morteiro na elevação vertical (Eixo Y) em cima do alvo vermelho! (3 Morteiros em 10 segundos).
            </p>
          </>
        )}

        {activeTab === "rhythm" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                Fase 4: Decisão Tática de Bancada
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Mosaico 3D & Festa de Bancada</code>.
            </p>
            <p className="text-zinc-400 text-[11px]">
              Clique ou aperte espaço no momento exato em que as notas caírem na Zona de Batida para sincronizar a bateria.
            </p>
          </>
        )}

        {activeTab === "dodge" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-yellow-400 uppercase text-xs">📌 TELA QUE PUXA ESTE MINI-GAME:</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30 text-[10px]">
                Fase 4: Decisão Tática de Caravana
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Tática acionadora:</strong> <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-300">Defesa de Comboio & Escolta Rodoviária</code>.
            </p>
            <p className="text-zinc-400 text-[11px]">
              Use os botões de Esquerda / Direita para evitar os bloqueios policiais e detritos na rodovia.
            </p>
          </>
        )}

        {activeTab === "gate" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-black text-blue-400 uppercase text-xs">📌 TELA QUE PUXA ESTE TESTE DE REGRA:</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 text-[10px]">
                Fase 4: Concentração no Portão (Jogo em Casa)
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Regra dos 80%:</strong> Se o contingente visitante for menor que 80% da torcida local, o confronto de rua é evitado. Se for igual ou maior a 80%, o visitante força a passagem e dispara o confronto!
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
      <div className="max-w-3xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[380px] shadow-2xl relative">
        {activeTab === "whack" && (
          <PunchFrontCombat key={gameKey} opponentTier={whackTier} onFinish={handleFinishMiniGame} />
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
        <div className="max-w-3xl w-full bg-zinc-900 border border-emerald-500/50 rounded-2xl p-4 space-y-2 animate-in fade-in">
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
