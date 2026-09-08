import React, { useState, useEffect, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { RunnerTeam, Upgrades, CameraMode } from '../../lib/runner_types';
import { soundManager } from '../../lib/runner_audio';
import { MiniGameResult } from '../MatchTacticalResolver';
import { Swords, Flame, Volume2, VolumeX, Camera, Play, Award, RotateCcw, Shield, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface Runner3DGameProps {
  playerTorcidaName: string;
  playerClubName: string;
  rivalTorcidaName: string;
  rivalClubName: string;
  playerPrimaryColor?: string;
  playerSecondaryColor?: string;
  rivalPrimaryColor?: string;
  contingente: number; // Atributo Contingente do jogador (10 a 100)
  poderPista: number;  // Atributo Poder de Pista do jogador (10 a 100)
  opponentTier?: 'S' | 'A' | 'B';
  onFinish: (result: MiniGameResult) => void;
}

export const Runner3DGame: React.FC<Runner3DGameProps> = ({
  playerTorcidaName,
  playerClubName,
  rivalTorcidaName,
  rivalClubName,
  playerPrimaryColor = '#09090b',
  playerSecondaryColor = '#f59e0b',
  rivalPrimaryColor = '#dc2626',
  contingente = 50,
  poderPista = 50,
  opponentTier = 'A',
  onFinish,
}) => {
  // Configuração dos times para o motor 3D
  const playerTeam: RunnerTeam = {
    id: 'player_team',
    name: playerTorcidaName,
    shortName: playerTorcidaName.split(' ')[0] || playerTorcidaName,
    club: playerClubName,
    primaryColor: playerPrimaryColor,
    secondaryColor: playerSecondaryColor,
    accentColor: '#f59e0b',
    mascot: '🦁',
    slogan: 'Linha de Frente em Avanço',
    contingent: contingente,
    pistaOverall: poderPista,
    pistaDefense: Math.round(poderPista * 0.8),
  };

  const rivalTeam: RunnerTeam = {
    id: 'rival_team',
    name: rivalTorcidaName,
    shortName: rivalTorcidaName.split(' ')[0] || rivalTorcidaName,
    club: rivalClubName,
    primaryColor: rivalPrimaryColor,
    secondaryColor: '#18181b',
    accentColor: '#ef4444',
    mascot: '🦅',
    slogan: 'Contenção Rival',
    contingent: opponentTier === 'S' ? 70 : opponentTier === 'A' ? 50 : 35,
    pistaOverall: opponentTier === 'S' ? 80 : opponentTier === 'A' ? 60 : 40,
    pistaDefense: opponentTier === 'S' ? 70 : opponentTier === 'A' ? 50 : 30,
  };

  // Upgrades derivados dos atributos do jogador no simulador
  const upgrades: Upgrades = {
    startingMembers: Math.min(10, Math.floor(contingente / 10)),
    ironBarPower: Math.min(10, Math.floor(poderPista / 10)),
    fireworkBlast: Math.min(10, Math.floor(poderPista / 10)),
    crowdMorale: Math.min(10, Math.floor((contingente + poderPista) / 20)),
  };

  // Estados do jogo
  const [stage, setStage] = useState<'menu' | 'playing' | 'clash' | 'victory' | 'defeat'>('menu');
  const [crowdCount, setCrowdCount] = useState<number>(Math.max(12, Math.floor(contingente * 0.4)));
  const [ironBars, setIronBars] = useState<number>(0);
  const [fireworks, setFireworks] = useState<number>(3);
  const [flaresActive, setFlaresActive] = useState<number>(0);
  const [distanceProgress, setDistanceProgress] = useState<number>(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('classic_3d');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [fireworkTriggerSignal, setFireworkTriggerSignal] = useState<number>(0);

  // Dados do confronto final
  const [clashData, setClashData] = useState<{
    crowdCount: number;
    ironBars: number;
    fireworks: number;
    flaresActive: number;
    playerPower: number;
    rivalCount: number;
    rivalPower: number;
  } | null>(null);

  const [finalOutcome, setFinalOutcome] = useState<{
    won: boolean;
    modifier: number;
    rank: 'S' | 'B' | 'C' | 'F';
    description: string;
  } | null>(null);

  // Teclado para movimentação e rojões
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== 'playing') return;
      if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleTriggerFirework();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, fireworks]);

  const handleStartGame = () => {
    const initialFans = Math.max(12, Math.floor(contingente * 0.4) + upgrades.startingMembers * 3);
    setCrowdCount(initialFans);
    setIronBars(0);
    setFireworks(3);
    setFlaresActive(0);
    setDistanceProgress(0);
    setClashData(null);
    setFinalOutcome(null);
    setStage('playing');

    soundManager.playGateSound(true);
    soundManager.startStadiumDrums();
  };

  const handleTriggerFirework = () => {
    if (fireworks > 0) {
      setFireworks((f) => f - 1);
      setFireworkTriggerSignal((s) => s + 1);
      soundManager.playFireworkLaunch();
    }
  };

  const handleToggleSound = () => {
    const enabled = soundManager.toggleSound();
    setSoundEnabled(enabled);
  };

  const handleToggleCamera = () => {
    setCameraMode((prev) => (prev === 'classic_3d' ? 'top_down' : 'classic_3d'));
  };

  const handleUpdateStats = (stats: {
    crowdCount: number;
    ironBars: number;
    fireworks: number;
    flaresActive: number;
    distanceProgress: number;
  }) => {
    setCrowdCount(stats.crowdCount);
    setIronBars(stats.ironBars);
    setFireworks(stats.fireworks);
    setFlaresActive(stats.flaresActive);
    setDistanceProgress(stats.distanceProgress);
  };

  const handleReachClash = (finalStats: {
    crowdCount: number;
    ironBars: number;
    fireworks: number;
    flaresActive: number;
    playerPower: number;
    rivalCount: number;
    rivalPower: number;
  }) => {
    // Adiciona bônus do atributos de pista do jogador
    const totalPlayerPower = finalStats.playerPower + Math.round(poderPista * 4.5);
    setClashData({
      ...finalStats,
      playerPower: totalPlayerPower,
    });
    setStage('clash');
    soundManager.stopStadiumDrums();
  };

  const handleClashResolved = (result: {
    won: boolean;
    survivors: number;
    coinsEarned: number;
    playerPower: number;
    rivalPower: number;
  }) => {
    soundManager.stopStadiumDrums();

    const powerRatio = result.playerPower / Math.max(1, result.rivalPower);
    let rank: 'S' | 'B' | 'C' | 'F' = 'C';
    let modifier = 0.0;
    let description = '';

    if (result.won) {
      soundManager.playVictoryFanfare();
      if (powerRatio >= 1.3 && result.survivors >= 15) {
        rank = 'S';
        modifier = 0.20; // +20% max PEC
        description = `Vitória de Pista no Avanço 3D! O bonde da ${playerTorcidaName} rompeu o cerco rival com autoridade.`;
      } else {
        rank = 'B';
        modifier = 0.10; // +10% PEC
        description = `Avanço da Linha de Frente no Confronto 3D! A tropa da ${playerTorcidaName} empurrou o cerco rival.`;
      }
    } else {
      if (powerRatio >= 0.8) {
        rank = 'C';
        modifier = 0.0;
        description = `Confronto equilibrado na pista. A linha de frente manteve a posição.`;
      } else {
        rank = 'F';
        modifier = -0.20; // -20% PEC
        description = `Emboscada pesada na pista! A linha de frente sofreu alta pressão da contenção rival e recuou sob cerco.`;
      }
    }

    // Transição direta para o Relatório Pós-Jogo e Crônica Principal do Simulador
    setTimeout(() => {
      onFinish({
        gameType: 'runner_3d',
        modifier,
        rank,
        description,
      });
    }, 1200);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-zinc-950 border border-amber-500/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center select-none">
      {/* HEADER BAR */}
      <div className="w-full bg-zinc-900/90 border-b border-zinc-800 p-3 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🏃</span>
          <div>
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wide">
              RUNNER 3D DA LINHA DE FRENTE
            </h3>
            <p className="text-[10px] text-zinc-400">
              {playerTorcidaName} vs {rivalTorcidaName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleCamera}
            className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            title="Alternar Câmera"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] uppercase font-black">{cameraMode === 'classic_3d' ? '3D' : 'TOP'}</span>
          </button>

          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Áudio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
          </button>
        </div>
      </div>

      {/* CANVAS CONTAINER */}
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
        <GameCanvas
          playerTeam={playerTeam}
          rivalTeam={rivalTeam}
          upgrades={upgrades}
          stage={stage}
          crowdCount={crowdCount}
          ironBars={ironBars}
          fireworks={fireworks}
          flaresActive={flaresActive}
          level={1}
          onUpdateStats={handleUpdateStats}
          onReachClash={handleReachClash}
          onClashResolved={handleClashResolved}
          triggerFireworkSignal={fireworkTriggerSignal}
          cameraMode={cameraMode}
        />

        {/* MENU INICIAL OVERLAY */}
        {stage === 'menu' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 z-30">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black uppercase">
              <Sparkles className="w-4 h-4" />
              <span>MINIGAME RUNNER 3D DA LINHA DE FRENTE</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
              {playerTorcidaName} na Pista
            </h2>

            <p className="text-xs text-zinc-300 max-w-md leading-relaxed">
              Guie a linha de frente da torcida pela avenida! Passe pelos portões de reforço, recolha <strong className="text-amber-400">Barras de Ferro 🪵</strong> e <strong className="text-red-400">Rojões 🎆</strong>, desvie de bombas da PM e enfrente a emboscada rival.
            </p>

            <div className="grid grid-cols-2 gap-3 bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl text-left text-xs w-full max-w-sm">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">Contingente Base:</span>
                <span className="font-black text-amber-400">{contingente} Membros</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">Poder de Pista:</span>
                <span className="font-black text-red-400">{poderPista} PTS</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full max-w-xs py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>INICIAR MARCHA NA PISTA (3D)</span>
            </button>
          </div>
        )}
      </div>

      {/* HUD DE JOGO & CONTROLES */}
      {stage === 'playing' && (
        <div className="w-full bg-zinc-900/95 border-t border-zinc-800 p-3 space-y-2 z-20">
          {/* BARRA DE ESTATÍSTICAS */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-black">
            <div className="bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg">
              <span className="text-[9px] text-zinc-400 block uppercase">TORCIDA</span>
              <span className="text-amber-400 flex items-center justify-center space-x-1">
                <span>👥</span>
                <span>{crowdCount}</span>
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg">
              <span className="text-[9px] text-zinc-400 block uppercase">BARRAS</span>
              <span className="text-zinc-200 flex items-center justify-center space-x-1">
                <span>🪵</span>
                <span>{ironBars}</span>
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg">
              <span className="text-[9px] text-zinc-400 block uppercase">ROJÕES</span>
              <span className="text-red-400 flex items-center justify-center space-x-1">
                <span>🎆</span>
                <span>{fireworks}</span>
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg">
              <span className="text-[9px] text-zinc-400 block uppercase">PERCURSO</span>
              <span className="text-emerald-400">{Math.round(distanceProgress * 100)}%</span>
            </div>
          </div>

          {/* BARRA DE PROGRESSO */}
          <div className="w-full bg-zinc-950 h-2 rounded-full border border-zinc-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-red-500 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, distanceProgress * 100)}%` }}
            />
          </div>

          {/* BOTÃO DISPARAR ROJÃO */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={handleTriggerFirework}
              disabled={fireworks <= 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
            >
              <Flame className="w-4 h-4" />
              <span>DISPARAR ROJÃO / FUMAÇA ({fireworks})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
