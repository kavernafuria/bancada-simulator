import React, { useState, useEffect } from 'react';
import { PRESET_TEAMS } from './data/teams';
import { TeamInfo, MatchSimulationResult } from './types';
import { calculateMatchSimulation } from './utils/simulator';
import { ArquibancadaMinigame } from './components/ArquibancadaMinigame';
import { BusReceptionMinigame } from './components/BusReceptionMinigame';
import { MatchSetup } from './components/MatchSetup';
import { MatchResultView } from './components/MatchResultView';
import { GameColorConfigModal } from './components/GameColorConfigModal';
import { loadGameIntegrationTheme, saveGameIntegrationTheme } from './config/gameIntegration';
import { downloadProjectZip } from './utils/zipExporter';
import { 
  Trophy, 
  Flame, 
  Flag, 
  Sliders, 
  BookOpen, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Palette,
  Download
} from 'lucide-react';
import { sound } from './utils/audio';

type ActiveView = 'setup' | 'arquibancada' | 'bus' | 'result';

export default function App() {
  // Inicializa com as cores do arquivo de integração ou URL
  const initialTheme = loadGameIntegrationTheme();

  const [activeView, setActiveView] = useState<ActiveView>('arquibancada');
  const [homeTeam, setHomeTeam] = useState<TeamInfo>(initialTheme.homeTeam || PRESET_TEAMS[0]);
  const [awayTeam, setAwayTeam] = useState<TeamInfo>(initialTheme.awayTeam || PRESET_TEAMS[1]);

  const [homeBaseStrength, setHomeBaseStrength] = useState<number>(homeTeam.baseStrength);
  const [awayBaseStrength, setAwayBaseStrength] = useState<number>(awayTeam.baseStrength);

  const [busScore, setBusScore] = useState<number>(80);
  const [standScore, setStandScore] = useState<number>(85);

  const [simulationResult, setSimulationResult] = useState<MatchSimulationResult | null>(null);
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [showColorModal, setShowColorModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);

  // Escuta mensagens postMessage caso esteja rodando em iframe dentro de outro jogo
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      if (event.data?.type === 'BANCADA_SET_TEAMS') {
        const { homeTeam: customHome, awayTeam: customAway } = event.data;
        if (customHome) {
          setHomeTeam((prev) => ({ ...prev, ...customHome }));
          if (customHome.baseStrength) setHomeBaseStrength(customHome.baseStrength);
        }
        if (customAway) {
          setAwayTeam((prev) => ({ ...prev, ...customAway }));
          if (customAway.baseStrength) setAwayBaseStrength(customAway.baseStrength);
        }
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  const handleDownloadZipDirectly = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadProjectZip({ homeTeam, awayTeam });
    } catch (err) {
      console.error('Erro ao baixar ZIP:', err);
      alert('Não foi possível gerar o ZIP.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const runSimulation = () => {
    const res = calculateMatchSimulation(
      homeTeam,
      awayTeam,
      homeBaseStrength,
      awayBaseStrength,
      busScore,
      standScore
    );
    setSimulationResult(res);
    setActiveView('result');

    // Notifica o jogo pai via postMessage se houver
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'BANCADA_MATCH_FINISHED', result: res }, '*');
    }
  };

  const handleArquibancadaFinish = (finalStandScore: number) => {
    setStandScore(finalStandScore);
    const res = calculateMatchSimulation(
      homeTeam,
      awayTeam,
      homeBaseStrength,
      awayBaseStrength,
      busScore,
      finalStandScore
    );
    setSimulationResult(res);
    setActiveView('result');

    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'BANCADA_MATCH_FINISHED', result: res }, '*');
    }
  };

  const handleBusFinish = (finalBusScore: number) => {
    setBusScore(finalBusScore);
    setActiveView('arquibancada');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-brand-home"
              onClick={() => setActiveView('setup')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                🏟️
              </div>
              <div>
                <h1 className="font-black text-sm sm:text-base text-white tracking-tight uppercase flex items-center gap-1.5">
                  Bancada Simulator
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    25% PESO
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Simulador de Festa na Arquibancada & Motor de Partida
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Pills */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              id="nav-tab-setup"
              onClick={() => setActiveView('setup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'setup'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Duelo</span>
            </button>

            <button
              type="button"
              id="nav-tab-bus"
              onClick={() => setActiveView('bus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'bus'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Ônibus</span>
              <span className="text-[10px] font-mono text-slate-500">({busScore})</span>
            </button>

            <button
              type="button"
              id="nav-tab-arquibancada"
              onClick={() => setActiveView('arquibancada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'arquibancada'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Arquibancada</span>
              <span className="text-[10px] font-mono">({standScore})</span>
            </button>

            <button
              type="button"
              id="nav-tab-result"
              onClick={runSimulation}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'result'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simular</span>
            </button>

            {/* Botão de Cores do Jogo */}
            <button
              type="button"
              id="btn-open-colors-modal"
              onClick={() => setShowColorModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-1.5 shadow-sm"
              title="Vincular Cores da Torcida e do Time ao seu Jogo"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Cores do Jogo</span>
            </button>

            {/* Botão Baixar ZIP */}
            <button
              type="button"
              id="btn-download-zip-header"
              onClick={handleDownloadZipDirectly}
              disabled={isDownloadingZip}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-300 hover:text-white bg-slate-900 hover:bg-emerald-950/60 border border-emerald-500/30 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="Baixar Código-Fonte Completo (.ZIP)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Baixar ZIP</span>
            </button>

            {/* Botão Plano de Execução */}
            <button
              type="button"
              id="btn-open-plan"
              onClick={() => setShowPlanModal(true)}
              className="p-1.5 rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-800 border border-slate-800 transition"
              title="Ver Regras e Funcionamento do Jogo"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Som */}
            <button
              type="button"
              id="btn-header-sound"
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition"
              title={soundEnabled ? 'Silenciar Sons' : 'Ativar Sons'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {activeView === 'setup' && (
          <MatchSetup
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            onUpdateHomeTeam={setHomeTeam}
            onUpdateAwayTeam={setAwayTeam}
            homeBaseStrength={homeBaseStrength}
            awayBaseStrength={awayBaseStrength}
            onChangeHomeBaseStrength={setHomeBaseStrength}
            onChangeAwayBaseStrength={setAwayBaseStrength}
            busScore={busScore}
            standScore={standScore}
            onChangeBusScore={setBusScore}
            onChangeStandScore={setStandScore}
            onStartArquibancadaGame={() => setActiveView('arquibancada')}
            onStartBusGame={() => setActiveView('bus')}
            onSimulateDirectly={runSimulation}
            onOpenColorModal={() => setShowColorModal(true)}
            onDownloadZip={handleDownloadZipDirectly}
          />
        )}

        {activeView === 'arquibancada' && (
          <div className="flex flex-col gap-4">
            {/* Header da Arquibancada com Destaque das Regras */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥁</span>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                    Minigame: Festa na Arquibancada & Ataque em Campo
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  As ações ficam <strong className="text-amber-400">direto na tela da torcida</strong>! Ao invés de só empurrar até o gol, mantenha a pressão <strong className="text-amber-300 font-bold">acima dos 85%</strong> no caldeirão para disparar o ataque no campinho e aumentar as chances de vitória!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Regras do Caldeirão (&gt;85%)</span>
                </button>
              </div>
            </div>

            <ArquibancadaMinigame
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              onFinish={handleArquibancadaFinish}
              initialScore={standScore}
            />
          </div>
        )}

        {activeView === 'bus' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span>🔥 Minigame 1: Recepção do Ônibus (Ruas de Fogo)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conduza a delegação com sinalizadores para elevar a primeira nota da torcida.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('arquibancada')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700 hover:bg-slate-700 transition"
              >
                Pular para Arquibancada &rarr;
              </button>
            </div>

            <BusReceptionMinigame
              homeTeam={homeTeam}
              onFinish={handleBusFinish}
              initialScore={busScore}
            />
          </div>
        )}

        {activeView === 'result' && simulationResult && (
          <MatchResultView
            result={simulationResult}
            onPlayAgain={() => setActiveView('arquibancada')}
            onEditTeams={() => setActiveView('setup')}
          />
        )}
      </main>

      {/* Modal: Plano de Execução e Como Fazer */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-amber-400 text-xs font-black uppercase tracking-wider">
                  Documentação & Arquitetura
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  📋 Plano de Execução: Festa na Arquibancada
                </h3>
              </div>
              <button
                type="button"
                id="btn-close-plan"
                onClick={() => setShowPlanModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-amber-300 text-sm mb-1">
                  1. A Nova Mecânica: Manter a Torcida Acima dos 85%
                </h4>
                <p>
                  Ao invés de apenas empurrar a bola até o gol, seu objetivo é <strong>sustentar a pressão e entusiasmo da bancada acima dos 85%</strong> (Zona de Caldeirão). Quanto mais tempo você sustentar a bancada nesse patamar extremo, mais o time bombardeia a zaga rival no campinho e maior a chance de marcar gols e vencer!
                </p>
                <div className="mt-2 text-[11px] text-amber-400 font-semibold bg-amber-950/40 p-2 rounded border border-amber-800/60">
                  ⚠️ Por que é difícil? Acima dos 85%, a pressão decai a quase 5% por segundo devido ao cansaço da galera, e o adversário faz cera para esfriar o jogo. Você precisa alternar os gritos, bumbo e bandeirões com precisão sem zerar a energia!
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-amber-300 text-sm mb-1">
                  2. Botões Integrados na Tela Visual da Torcida
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                  <li>
                    <strong>📢 Grito de Guerra (-14 energia):</strong> Puxa o canto oficial da torcida, eleva os decibéis e recupera pressão rápida.
                  </li>
                  <li>
                    <strong>🚩 Subir Bandeirão (-26 energia):</strong> Cobre a bancada e choca a defesa rival, dando um salto expressivo na pressão.
                  </li>
                  <li>
                    <strong>🎗️ Esticar Faixas Verticais (-16 energia):</strong> Faixas descendo da arquibancada garantem sustentação e visual tradicional.
                  </li>
                  <li>
                    <strong>🔥 Acender Sinalizadores (-22 energia):</strong> Fumaça colorida e calor no estádio para intimidar o rival.
                  </li>
                  <li>
                    <strong>🥁 Puxar Bateria & Bumbo (-10 energia):</strong> Ritmo que desacelera a queda natural de pressão.
                  </li>
                  <li>
                    <strong>💧 Hidratar a Bancada (+30 energia):</strong> Pausa para beber água que restaura +30 de fôlego com cooldown de 6s e perda imediata de pressão (-12%).
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-amber-300 text-sm mb-1">
                  3. O Campinho de Ataque & Motor Ponderado
                </h4>
                <p>
                  O campinho tático ao lado da bancada simula o avanço do time em tempo real. Quando a bancada passa dos 85%, o ataque se transforma em uma <strong>blitz na grande área</strong> com finalizações e bolas na trave! O resultado oficial da partida é calculado após o apito final.
                </p>
                <div className="my-2 p-2.5 bg-black/70 rounded-lg font-mono text-xs text-emerald-300 border border-slate-800">
                  Força Final Casa = (Força Base * 0.75) + (Média da Torcida * 0.25)
                </div>
                <p>
                  Sua pontuação na bancada comporá 25% da Força Final no cálculo da partida contra a Força Base do adversário.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide transition"
              >
                Entendido, Vamos Jogar!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Cores do Jogo e Download ZIP */}
      <GameColorConfigModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        onUpdateHomeTeam={setHomeTeam}
        onUpdateAwayTeam={setAwayTeam}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 px-4 py-3 text-center text-xs text-slate-500">
        Bancada Simulator • Simulação de Impacto da Torcida no Futebol • Média Ponderada 75% Time / 25% Bancada
      </footer>
    </div>
  );
}
