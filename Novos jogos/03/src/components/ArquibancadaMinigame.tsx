import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
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
  Activity
} from 'lucide-react';
import { TeamInfo } from '../types';
import { sound } from '../utils/audio';
import { ArquibancadaVisualizer } from './ArquibancadaVisualizer';
import { TacticalPitch } from './TacticalPitch';

interface ArquibancadaMinigameProps {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  onFinish: (score: number) => void;
  initialScore?: number;
}

export const ArquibancadaMinigame: React.FC<ArquibancadaMinigameProps> = ({
  homeTeam,
  awayTeam,
  onFinish,
  initialScore = 50,
}) => {
  // Estados de jogo
  const [energy, setEnergy] = useState<number>(100); // 0 a 100% de fôlego/energia
  const [pressure, setPressure] = useState<number>(45); // 0 a 100% de pressão/entusiasmo da torcida
  const [decibels, setDecibels] = useState<number>(70);
  const [matchMinute, setMatchMinute] = useState<number>(1);
  const [standScore, setStandScore] = useState<number>(initialScore || 50);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Métrica central: Segundos mantidos na Zona de Caldeirão (>85%)
  const [timeInZone85, setTimeInZone85] = useState<number>(0);
  const [chancesCreated, setChancesCreated] = useState<number>(0);

  // Cooldowns das ações (em segundos)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // Efeitos visuais da arquibancada
  const [isBannerUp, setIsBannerUp] = useState<boolean>(false);
  const [hasVerticalStripes, setHasVerticalStripes] = useState<boolean>(false);
  const [hasFlares, setHasFlares] = useState<boolean>(false);
  const [isChanting, setIsChanting] = useState<boolean>(false);
  const [isDrumming, setIsDrumming] = useState<boolean>(false);
  const [hasMosaic, setHasMosaic] = useState<boolean>(false);
  const [activeChantText, setActiveChantText] = useState<string | null>(null);

  // Feedback do último lance
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'danger' | 'info' | 'warning' }>({
    message: 'Mantenha a pressão da torcida ACIMA DE 85% para sufocar o adversário e elevar sua nota para a simulação!',
    type: 'info'
  });
  const [recentAttackEvent, setRecentAttackEvent] = useState<string | null>(null);

  // Ref para controle de eventos sem atraso
  const pressureRef = useRef(pressure);
  pressureRef.current = pressure;
  const isAbove85 = pressure >= 85;

  // Toggle de som
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  // Contagem regressiva de cooldowns (1 segundo por tick)
  useEffect(() => {
    if (isGameOver) return;
    const cdTimer = setInterval(() => {
      setCooldowns((prev) => {
        const nextCd: Record<string, number> = {};
        let changed = false;
        for (const key of Object.keys(prev)) {
          const val = prev[key];
          if (typeof val === 'number' && val > 1) {
            nextCd[key] = val - 1;
            changed = true;
          } else if (val === 1) {
            changed = true; // zera
          }
        }
        return changed ? nextCd : prev;
      });
    }, 1000);

    return () => clearInterval(cdTimer);
  }, [isGameOver]);

  // ========================================================
  // LOOP PRINCIPAL DO JOGO (DIFICULDADE ALTA)
  // - Queda acelerada de pressão acima de 85% (-5% a -7%/s)
  // - Fôlego passivo lento
  // - Sustentar >85% gera chances de perigo e acumula nota da torcida
  // ========================================================
  useEffect(() => {
    if (isGameOver) return;

    const gameInterval = setInterval(() => {
      // 1. Minutos da partida (90 minutos)
      setMatchMinute((prev) => {
        if (prev >= 90) {
          setIsGameOver(true);
          return 90;
        }
        return prev + 1;
      });

      // 2. Queda Severa da Pressão (Dificuldade aumentada conforme solicitado)
      setPressure((curr) => {
        let decayRate = 1.6;
        if (curr >= 85) {
          // Zona extrema: o fôlego da torcida queima brutalmente!
          decayRate = 5.2 + Math.random() * 1.8;
        } else if (curr >= 70) {
          decayRate = 3.2 + Math.random() * 0.9;
        } else if (curr >= 50) {
          decayRate = 2.0;
        } else {
          decayRate = 1.2;
        }

        // Se a bateria estiver pulsando, atenua parte do decaimento
        if (isDrumming) {
          decayRate *= 0.55;
        }

        const next = Math.max(10, Math.min(100, curr - decayRate));
        return Math.round(next * 10) / 10;
      });

      // 3. Decaimento natural de decibéis
      setDecibels((prev) => Math.max(55, prev - 1.4));

      // 4. Recuperação passiva muito lenta de energia (+0.2%/tick)
      setEnergy((prev) => Math.min(100, prev + 0.25));

      // 5. Acúmulo de bônus na Zona de Caldeirão (>85%)
      if (pressureRef.current >= 85) {
        setTimeInZone85((prev) => prev + 1);

        // Aumenta a nota da bancada continuamente para o motor da partida
        setStandScore((prev) => Math.min(100, Math.round((prev + 0.6) * 10) / 10));

        // Cria lances de perigo constante no campinho
        if (Math.random() < 0.45) {
          setChancesCreated((prev) => prev + 1);
          const attackPhrases = [
            'Bomba de fora da área espalmada pelo goleiro!',
            'Cabeceio violento carimbando o travessão!',
            'Blitz na pequena área! Zaga rival espanando!',
            'Chute cruzado raspando a trave rival!',
            'Abafa total! O adversário não consegue sair!'
          ];
          const phrase = attackPhrases[Math.floor(Math.random() * attackPhrases.length)];
          setRecentAttackEvent(phrase);
          setTimeout(() => setRecentAttackEvent(null), 1800);
        }
      }
    }, 700);

    return () => clearInterval(gameInterval);
  }, [isGameOver, isDrumming]);

  // ========================================================
  // EVENTOS DE RESISTÊNCIA DO ADVERSÁRIO (Dificulta manter em alta)
  // O adversário tenta quebrar o ritmo frequentemente
  // ========================================================
  useEffect(() => {
    if (isGameOver) return;

    const obstacleInterval = setInterval(() => {
      // 40% de chance a cada 7 segundos do adversário esfriar
      if (Math.random() < 0.42) {
        const events = [
          {
            text: `O adversário faz cera e esfria o ritmo da torcida!`,
            penalty: 10,
          },
          {
            text: `Falta tática no meio-campo para interromper o abafa!`,
            penalty: 8,
          },
          {
            text: `O rival gasta o relógio e desacelera o jogo!`,
            penalty: 11,
          },
          {
            text: `Atendimento médico demorado do adversário em campo!`,
            penalty: 9,
          },
        ];
        const chosen = events[Math.floor(Math.random() * events.length)];

        setPressure((curr) => Math.max(15, curr - chosen.penalty));
        setActionFeedback({
          message: `⚠️ ${chosen.text} Pressione a arquibancada para reaquecer o caldeirão!`,
          type: 'warning',
        });
        sound.playWhistle();
      }
    }, 7500);

    return () => clearInterval(obstacleInterval);
  }, [isGameOver]);

  // ========================================================
  // MANIPULADOR DE AÇÕES DA TORCIDA (Botões na tela visual)
  // ========================================================
  const handleAction = (actionId: string) => {
    if (isGameOver) return;

    // Checa se está em cooldown
    if (cooldowns[actionId] && cooldowns[actionId] > 0) {
      return;
    }

    // ========================================================
    // AÇÃO DE HIDRATAR (Mais difícil conforme solicitado)
    // - Cooldown de 6 segundos
    // - Queda imediata de 12% na pressão (a torcida cala para beber)
    // - Restaura apenas +22 energia
    // - Só pode usar se energia < 80%
    // ========================================================
    if (actionId === 'descanso') {
      if (energy >= 80) {
        setActionFeedback({
          message: 'A torcida ainda tem bastante fôlego! Guarde a água para quando a energia estiver baixa.',
          type: 'warning',
        });
        return;
      }

      // Restaura energia moderada (+30 conforme solicitado)
      setEnergy((prev) => Math.min(100, prev + 30));

      // Penalidade de pressão: a torcida silencia para beber água!
      setPressure((prev) => Math.max(15, Math.round(prev - 12)));

      // Aplica cooldown de 6 segundos
      setCooldowns((prev) => ({ ...prev, descanso: 6 }));

      setActionFeedback({
        message: '💧 A torcida parou para beber água! Fôlego recuperado (+30 EN), mas a pressão caiu (-12%)!',
        type: 'info',
      });
      return;
    }

    // Configuração das ações de torcida
    const actionConfigs: Record<
      string,
      { cost: number; boostPressure: number; boostDb: number; scoreGain: number; cd: number }
    > = {
      grito: { cost: 14, boostPressure: 12, boostDb: 15, scoreGain: 2, cd: 1 },
      bandeirao: { cost: 28, boostPressure: 20, boostDb: 22, scoreGain: 5, cd: 5 },
      faixas: { cost: 16, boostPressure: 14, boostDb: 14, scoreGain: 3, cd: 4 },
      sinalizadores: { cost: 24, boostPressure: 18, boostDb: 20, scoreGain: 4, cd: 5 },
      bateria: { cost: 10, boostPressure: 9, boostDb: 12, scoreGain: 2, cd: 1 },
    };

    const config = actionConfigs[actionId];
    if (!config) return;

    if (energy < config.cost) {
      setActionFeedback({
        message: 'Torcida sem fôlego! Hidrate a bancada para recuperar energia (cuidado com a perda de pressão).',
        type: 'danger',
      });
      return;
    }

    // Deduz energia
    setEnergy((prev) => Math.max(0, Math.round(prev - config.cost)));

    // Aplica cooldown
    if (config.cd > 0) {
      setCooldowns((prev) => ({ ...prev, [actionId]: config.cd }));
    }

    // Aumenta decibéis
    setDecibels((prev) => Math.min(125, Math.round(prev + config.boostDb)));

    // Aumenta a nota da bancada
    setStandScore((prev) => Math.min(100, Math.round(prev + config.scoreGain)));

    // Eleva a Pressão
    setPressure((prev) => {
      const next = Math.min(100, prev + config.boostPressure);
      if (next >= 85 && prev < 85) {
        setActionFeedback({
          message: '🔥 ZONA DE CALDEIRÃO ATINGIDA (>85%)! O time adversário está encurralado na defesa!',
          type: 'success',
        });
      }
      return next;
    });

    // Efeitos visuais e sonoros
    if (actionId === 'grito') {
      sound.playClap();
      setIsChanting(true);
      const chant = homeTeam.chants[Math.floor(Math.random() * homeTeam.chants.length)];
      setActiveChantText(chant);
      setActionFeedback({
        message: `📢 Coro entoado: "${chant}"! Pressão sobe.`,
        type: 'info',
      });
      setTimeout(() => {
        setIsChanting(false);
        setActiveChantText(null);
      }, 2800);
    } else if (actionId === 'bandeirao') {
      sound.playFlare();
      setIsBannerUp(true);
      setActionFeedback({
        message: '🏴 Bandeirão gigante esticado! O setor central vira um mar de cores!',
        type: 'success',
      });
      setTimeout(() => setIsBannerUp(false), 4500);
    } else if (actionId === 'faixas') {
      sound.playWhistle();
      setHasVerticalStripes(true);
      setActionFeedback({
        message: '🎗️ Faixas verticais descendo! Arquibancada em festa constante.',
        type: 'info',
      });
      setTimeout(() => setHasVerticalStripes(false), 4000);
    } else if (actionId === 'sinalizadores') {
      sound.playFlare();
      setHasFlares(true);
      setActionFeedback({
        message: '🔥 Sinalizadores acesos! O caldeirão queima em fumaça colorida!',
        type: 'success',
      });
      setTimeout(() => setHasFlares(false), 4500);
    } else if (actionId === 'bateria') {
      sound.playDrum();
      setIsDrumming(true);
      setActionFeedback({
        message: '🥁 Tum, tum, tum! A bateria dita o ritmo e freia o decaimento da pressão.',
        type: 'info',
      });
      setTimeout(() => setIsDrumming(false), 3000);
    }
  };

  // Concluir Minigame e enviar a Nota ao Motor
  const handleFinishGame = () => {
    onFinish(standScore);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Barra de Informações do Jogo */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg">
        {/* Confronto e Estádio */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20" style={{ backgroundColor: homeTeam.primaryColor }} />
            <span className="font-black text-sm sm:text-base text-white">{homeTeam.name}</span>
          </div>
          <span className="text-xs font-mono text-slate-500 font-bold">VS</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm sm:text-base text-slate-300">{awayTeam.name}</span>
            <div className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20" style={{ backgroundColor: awayTeam.primaryColor }} />
          </div>
          <span className="hidden md:inline-block text-[11px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {homeTeam.stadium}
          </span>
        </div>

        {/* Cronômetro e Nota */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 rounded-xl border border-slate-700 font-mono text-xs sm:text-sm font-bold text-slate-200">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>{matchMinute}' {matchMinute >= 90 ? '(FIM)' : 'TEMPO'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Nota:</span>
            <span className="text-emerald-400 font-black">{Math.round(standScore)} pts</span>
          </div>

          <button
            type="button"
            id="btn-toggle-sound"
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition active:scale-95"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Sons do Estádio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* ========================================================
          TERMÔMETRO DA PRESSÃO DA BANCADA (COM MARCADOR 85%)
         ======================================================== */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border transition-all duration-300 shadow-xl ${
          isAbove85
            ? 'bg-gradient-to-r from-slate-900 via-amber-950/40 to-red-950/40 border-amber-400/90 ring-1 ring-amber-400/50'
            : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${isAbove85 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>PRESSÃO & ENTUSIASMO DA BANCADA</span>
                {isAbove85 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                    CALDEIRÃO EM ERUPÇÃO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Sustente a barra acima dos <strong>85%</strong>. Acima dos 85% a pressão decai rapidamente (-5%/s) e o adversário tenta esfriar!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span
                className={`text-lg sm:text-xl font-mono font-black ${
                  isAbove85
                    ? 'text-amber-400 drop-shadow-[0_0_8px_#f59e0b]'
                    : pressure >= 60
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {Math.round(pressure)}%
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Pressão com Linha de 85% */}
        <div className="relative w-full h-5 rounded-xl bg-slate-950 p-0.5 border border-slate-700/90 overflow-hidden flex items-center">
          <motion.div
            className={`h-full rounded-lg transition-all ${
              isAbove85
                ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 shadow-[0_0_15px_#f59e0b]'
                : pressure >= 50
                ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500'
                : 'bg-gradient-to-r from-slate-600 to-emerald-600'
            }`}
            animate={{ width: `${Math.min(100, Math.max(2, pressure))}%` }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.2 }}
          />

          {/* Linha marcadora dos 85% */}
          <div className="absolute inset-y-0 left-[85%] w-1 bg-amber-300 shadow-[0_0_8px_#fde047] z-10 flex flex-col items-center justify-center">
            <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 border border-black shadow -mt-6" />
          </div>

          <div className="absolute right-2 text-[9px] font-mono font-black uppercase text-amber-300 pointer-events-none drop-shadow z-10">
            ZONA CALDEIRÃO (&gt;85%)
          </div>
        </div>

        {/* Informações de Desgaste e Tempo */}
        <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Desgaste atual:{' '}
              <strong className={isAbove85 ? 'text-rose-400 font-mono' : 'text-slate-300 font-mono'}>
                {isAbove85 ? '🚨 -5.5%/s (Exaustão rápida)' : '-2.0%/s'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Tempo mantido &gt;85%:</span>
            <strong className="text-amber-400 font-mono">{timeInZone85} segundos</strong>
          </div>
        </div>
      </div>

      {/* ========================================================
          VISUALIZADOR DA ARQUIBANCADA + CAMPINHO DE ATAQUE
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Coluna Esquerda: Arquibancada com Botões Integrados na Tela Visual */}
        <div className="lg:col-span-7 flex flex-col">
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
        </div>

        {/* Coluna Direita: O Campinho Simulando o Ataque do Time */}
        <div className="lg:col-span-5 flex flex-col">
          <TacticalPitch
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            pressure={pressure}
            isAbove85={isAbove85}
            timeInZone85={timeInZone85}
            recentAttackEvent={recentAttackEvent}
            chancesCreated={chancesCreated}
          />

          {/* Banner de Feedback em Tempo Real */}
          <div className="mt-3">
            {actionFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 shadow-sm ${
                  actionFeedback.type === 'danger'
                    ? 'bg-rose-950/50 border-rose-800 text-rose-200'
                    : actionFeedback.type === 'warning'
                    ? 'bg-amber-950/50 border-amber-600 text-amber-200'
                    : actionFeedback.type === 'success'
                    ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300'
                }`}
              >
                {actionFeedback.type === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                {actionFeedback.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                {actionFeedback.type === 'success' && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                {actionFeedback.type === 'info' && <span className="text-sm shrink-0">📢</span>}
                <span className="leading-relaxed">{actionFeedback.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé de Conclusão / Envio de Nota ao Motor Ponderado */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <span>Nota Conquistada na Bancada:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-black border border-emerald-500/30">
              {Math.round(standScore)} / 100 pts
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isGameOver
              ? '✓ Apito final aos 90 minutos! Envie sua pontuação para a simulação da partida.'
              : 'O resultado final e os gols serão calculados na simulação pelo motor de média ponderada (75% Time + 25% Torcida).'}
          </p>
        </div>

        <button
          type="button"
          id="btn-concluir-bancada"
          onClick={handleFinishGame}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>Salvar Nota e Ir para Simulação ({Math.round(standScore)} pts)</span>
        </button>
      </div>
    </div>
  );
};
