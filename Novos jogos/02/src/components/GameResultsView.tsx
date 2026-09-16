import React, { useState, useEffect } from 'react';
import { RoundResult, MatchSimulationParams, MatchSimulationResult } from '../types';
import { calculateMatchSimulation } from '../utils/bancadaSimulation';
import { downloadProjectZip } from '../utils/exportZip';
import confetti from 'canvas-confetti';
import {
  Flame,
  RotateCcw,
  CheckCircle,
  Copy,
  ChevronRight,
  Calculator,
  Shield,
  Flag,
  Share2,
  Sparkles,
  Download,
  Loader2,
  Check,
  FolderArchive,
} from 'lucide-react';

interface GameResultsViewProps {
  roundResults: RoundResult[];
  pontuacaoBandeira: number; // The integer variable 0 to 100 requested
  onRestart: () => void;
}

export const GameResultsView: React.FC<GameResultsViewProps> = ({
  roundResults,
  pontuacaoBandeira,
  onRestart,
}) => {
  // Fire confetti on results page mount
  useEffect(() => {
    if (pontuacaoBandeira >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#f59e0b', '#10b981', '#ffffff'],
        });
      } catch {
        // Fallback
      }
    }
  }, [pontuacaoBandeira]);

  // Bancada Simulator Match Parameters
  const [matchParams, setMatchParams] = useState<MatchSimulationParams>({
    homeForce: 68,
    awayForce: 74,
    busReceptionScore: 85,
    stadiumPartyScore: pontuacaoBandeira, // Automatically mapped from pontuacaoBandeira!
  });

  const [copiedCode, setCopiedCode] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadProjectZip();
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Falha ao baixar zip:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Sync if pontuacaoBandeira changes
  useEffect(() => {
    setMatchParams((prev) => ({
      ...prev,
      stadiumPartyScore: pontuacaoBandeira,
    }));
  }, [pontuacaoBandeira]);

  const simulation: MatchSimulationResult = calculateMatchSimulation(matchParams);

  // Copy code snippet to clipboard
  const handleCopyVariable = () => {
    const code = `// Saída do Minigame 'Trace the Path' - Bancada Simulator
const pontuacaoBandeira: number = ${pontuacaoBandeira};

// Cálculo do Motor de Partida (Bancada Simulator)
const mediaTorcida = (${matchParams.busReceptionScore} + ${pontuacaoBandeira}) / 2; // ${simulation.crowdAverage}
const forcaFinalMandante = (${matchParams.homeForce} * 0.75) + (mediaTorcida * 0.25); // ${simulation.finalHomeForce}
const forcaFinalVisitante = ${matchParams.awayForce};`;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Average accuracy and total misses across 3 rounds
  const avgAccuracy = Math.round(
    roundResults.reduce((acc, r) => acc + r.accuracy, 0) / Math.max(1, roundResults.length)
  );
  const avgCoverage = Math.round(
    roundResults.reduce((acc, r) => acc + r.coverage, 0) / Math.max(1, roundResults.length)
  );
  const totalMisses = roundResults.reduce((acc, r) => acc + r.missCount, 0);

  return (
    <div id="game-results-root" className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Main Score Header Card */}
      <div
        id="results-header-card"
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl"
      >
        {/* Background glow banner */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-gradient-to-br from-amber-500/20 to-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Minigame Concluído • 3 de 3 Traçados</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Desempenho do Bandeirão
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg">
              Precisão calculada frame a frame na tremulada dos três padrões consecutivos da torcida.
            </p>
          </div>

          {/* Variable Highlight Box */}
          <div
            id="pontuacao-bandeira-display"
            className="flex flex-col items-center justify-center p-6 bg-neutral-950/80 border-2 border-amber-500/50 rounded-2xl shadow-xl min-w-[220px]"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-1">
              pontuacaoBandeira
            </span>
            <div className="text-6xl font-black font-mono text-white tracking-tight">
              {pontuacaoBandeira}
              <span className="text-xl text-neutral-500 font-normal">/100</span>
            </div>
            <span className="text-xs text-neutral-400 mt-2 font-medium">
              {pontuacaoBandeira >= 85
                ? 'Espetáculo Nível Clássico!'
                : pontuacaoBandeira >= 70
                ? 'Tremulada Muito Firme!'
                : pontuacaoBandeira >= 50
                ? 'Bandeirão Levantou com Raça'
                : 'Torcida Perdeu a Sincronia'}
            </span>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-800 text-center">
          <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/60">
            <span className="text-xs text-neutral-400 block">Cobertura Média</span>
            <span className="text-xl font-bold font-mono text-white">{avgCoverage}%</span>
          </div>
          <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/60">
            <span className="text-xs text-neutral-400 block">Precisão Dentro da Margem</span>
            <span className="text-xl font-bold font-mono text-white">{avgAccuracy}%</span>
          </div>
          <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/60">
            <span className="text-xs text-neutral-400 block">Total de Misses</span>
            <span
              className={`text-xl font-bold font-mono ${
                totalMisses === 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {totalMisses}
            </span>
          </div>
          <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/60">
            <span className="text-xs text-neutral-400 block">Status da Bancada</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              {pontuacaoBandeira >= 70 ? 'EM CHAMAS' : 'MORNO'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Round by Round Breakdown */}
      <div
        id="rounds-breakdown-card"
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-white shadow-xl"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
          <Flag className="w-5 h-5 text-amber-400" />
          <span>Histórico dos 3 Traçados Consecutivos</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roundResults.map((r) => (
            <div
              key={`round-result-${r.round}`}
              className="p-4 bg-neutral-950/70 rounded-xl border border-neutral-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                  <span>Rodada {r.round} de 3</span>
                  {r.isPerfect && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      PERFECT
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-neutral-100">{r.patternName}</h4>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold font-mono text-amber-400">{r.score}</span>
                  <span className="text-xs text-neutral-500">pts</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 text-xs text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Cobertura:</span>
                  <b className="text-neutral-200 font-mono">{r.coverage}%</b>
                </div>
                <div className="flex justify-between">
                  <span>Precisão:</span>
                  <b className="text-neutral-200 font-mono">{r.accuracy}%</b>
                </div>
                <div className="flex justify-between">
                  <span>Misses:</span>
                  <b className={r.missCount === 0 ? 'text-emerald-400 font-mono' : 'text-red-400 font-mono'}>
                    {r.missCount}
                  </b>
                </div>
                <div className="flex justify-between">
                  <span>Tempo:</span>
                  <b className="text-neutral-200 font-mono">{r.timeTaken.toFixed(1)}s</b>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="copy-script-variable-btn"
              onClick={handleCopyVariable}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 flex items-center space-x-2 transition cursor-pointer border border-neutral-700"
            >
              {copiedCode ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Variável pontuacaoBandeira Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copiar Variável & Código</span>
                </>
              )}
            </button>

            {/* Download ZIP button for Antigravity */}
            <a
              id="download-project-zip-btn"
              href="/bancada-simulator-bandeirao.zip"
              download="bancada-simulator-bandeirao.zip"
              onClick={() => {
                if (!isDownloadingZip) handleDownloadZip();
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center space-x-2 transition cursor-pointer decoration-transparent"
            >
              {isDownloadingZip ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Baixando bancada-simulator-bandeirao.zip...</span>
                </>
              ) : zipSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>ZIP baixado com sucesso!</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-4 h-4 text-amber-400" />
                  <span>Baixar Projeto (.ZIP) para Antigravity</span>
                </>
              )}
            </a>
          </div>

          <button
            id="play-again-btn"
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-neutral-950 font-bold text-xs flex items-center space-x-2 transition shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar os 3 Traçados Novamente</span>
          </button>
        </div>

        {/* Antigravity Upload Quick Guide */}
        <div className="mt-4 p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-start space-x-3 text-xs text-neutral-400">
          <FolderArchive className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-neutral-200">Como subir no Antigravity:</span>
            <p>
              Clique em <b className="text-amber-300">"Baixar Projeto (.ZIP)"</b> para fazer o download completo do código fonte pronto para execução (<code className="text-neutral-300">npm install</code> && <code className="text-neutral-300">npm run dev</code>). Você também pode usar o menu superior do AI Studio em <b>Export &gt; Download ZIP</b>.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bancada Simulator Integration Card */}
      <div
        id="bancada-simulator-section"
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 text-white shadow-xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wide">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador de Partida • Bancada Simulator</span>
            </div>
            <h3 className="text-xl font-bold mt-1">Impacto Matemático da Torcida no Jogo</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cálculo ponderado: 75% da Força Base do Time + 25% da Média da Torcida (Recepção + Festa do Bandeirão).
            </p>
          </div>

          {/* Quick Result Scoreboard Badge */}
          <div className="flex items-center space-x-3 bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800">
            <div className="text-right">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">Placar Final</div>
              <div className="text-xl font-black font-mono text-amber-400">
                Mandante {simulation.homeScore} × {simulation.awayScore} Visitante
              </div>
            </div>
          </div>
        </div>

        {/* Input Parameters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-neutral-300 font-medium">Força Time da Casa</span>
              <span className="font-mono font-bold text-amber-400">{matchParams.homeForce}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={matchParams.homeForce}
              onChange={(e) =>
                setMatchParams((prev) => ({ ...prev, homeForce: Number(e.target.value) }))
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-neutral-500 block mt-1">Peso no cálculo: 75%</span>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-neutral-300 font-medium">Força do Adversário</span>
              <span className="font-mono font-bold text-neutral-200">{matchParams.awayForce}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={matchParams.awayForce}
              onChange={(e) =>
                setMatchParams((prev) => ({ ...prev, awayForce: Number(e.target.value) }))
              }
              className="w-full accent-neutral-400 cursor-pointer"
            />
            <span className="text-[10px] text-neutral-500 block mt-1">Joga sem buff de torcida</span>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-neutral-300 font-medium">Recepção do Ônibus</span>
              <span className="font-mono font-bold text-emerald-400">
                {matchParams.busReceptionScore}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={matchParams.busReceptionScore}
              onChange={(e) =>
                setMatchParams((prev) => ({
                  ...prev,
                  busReceptionScore: Number(e.target.value),
                }))
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[10px] text-neutral-500 block mt-1">Minigame 1 da Torcida</span>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border-2 border-amber-500/40 relative">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-amber-300 font-bold flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Bandeirão (Obtido)</span>
              </span>
              <span className="font-mono font-black text-amber-400">
                {matchParams.stadiumPartyScore}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={matchParams.stadiumPartyScore}
              onChange={(e) =>
                setMatchParams((prev) => ({
                  ...prev,
                  stadiumPartyScore: Number(e.target.value),
                }))
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-amber-400/80 block mt-1 font-mono">
              pontuacaoBandeira: {pontuacaoBandeira}
            </span>
          </div>
        </div>

        {/* Fast Math Formula Output */}
        <div
          id="calculation-math-box"
          className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 font-mono text-xs sm:text-sm space-y-1.5"
        >
          <div className="text-neutral-400 text-xs font-sans uppercase font-bold flex items-center space-x-1">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Fórmula Matemática Aplicada:</span>
          </div>
          <div className="text-amber-300 font-bold overflow-x-auto py-1">
            {simulation.calculationSummary}
          </div>
          <div className="text-neutral-400 text-xs">
            Margem de empate: ±3 pontos. Diferença atual:{' '}
            <b
              className={
                simulation.difference > 3
                  ? 'text-emerald-400'
                  : simulation.difference < -3
                  ? 'text-red-400'
                  : 'text-amber-400'
              }
            >
              {simulation.difference > 0 ? `+${simulation.difference}` : simulation.difference} pts
            </b>{' '}
            ({simulation.outcome === 'home_win' ? 'Vitória do Mandante' : simulation.outcome === 'away_win' ? 'Vitória do Adversário' : 'Empate'})
          </div>
        </div>

        {/* 3-Paragraph Narrative Output */}
        <div id="narrative-output-box" className="space-y-3 pt-2">
          <div className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center space-x-2">
            <Flame className="w-4 h-4 text-red-500" />
            <span>Narrativa Oficial do Jogo (Impacto da Bancada):</span>
          </div>

          <div className="space-y-3 text-sm text-neutral-200 leading-relaxed bg-neutral-950/50 p-5 rounded-xl border border-neutral-800/80">
            {simulation.narrative.map((par, i) => (
              <p key={`narrative-p-${i}`} className="first-letter:text-lg first-letter:font-bold">
                {par}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
