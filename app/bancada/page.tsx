"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Drum,
  Shield,
  Users,
  Wallet,
  Scale,
  Trophy,
  Flame,
  Bus,
  Sparkles,
  RefreshCw,
  RotateCcw,
  Share2,
  Check,
  ChevronRight,
  Swords,
  Layers,
  FileText,
  AlertTriangle,
  Building2,
  X,
  TrendingDown,
  Activity,
  HeartHandshake,
  AlertOctagon,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Compass,
  MapPin,
  Car,
  Eye,
  Flag,
  Radio,
  Palette,
  Target,
  Award,
  Crown,
  Download,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MatchTacticalResolver, MatchContext } from "@/components/MatchTacticalResolver";
import {
  GAME_BALANCE,
  getOfficialTorcidas,
  getAlliancesData,
  createCustomTorcidaWithArchetype,
  getAnnualPipelineWithMatches,
  getActionStepEvents,
  getTransportOptions,
  getPoliceMeetingChoices,
  calculateScoutIntel,
  getTacticalBattleChoices,
  executeCompleteMatch,
  generateSeasonObjectives,
  evaluateSeasonEndObjectives,
  applyDiminishingReturns,
  generateGeminiChronicle,
  getDefaultTorcidaColors,
  TORCIDA_COLOR_PALETTE,
  getPresidentOptions,
  getMPStatusSummary,
  getRandomNewsReelEvent,
  getSeasonalMilestoneEvent,
  SeasonalMilestoneDefinition,
  SeasonalOptionDefinition,
  PresidentProfile,
  NewsReelEvent,
  ARCHETYPES,
  ArchetypeId,
  OfficialTorcida,
  TorcidaStats,
  StateTrackers,
  ClubStatus,
  ActionChoice,
  DerbyMatchInfo,
  TransportChoice,
  PoliceMeetingChoice,
  MatchScoutReport,
  TacticalBattleChoice,
  MatchExecutionResult,
  FormattedDelta,
  SeasonObjective,
  RivalryRecord,
  simulateNationalRanking,
  RankingEntry,
  generateLeagueTable,
  LeagueTableEntry,
} from "@/lib/bancada_engine";
import { isInteriorSP } from "@/lib/season_events";

function playStadiumSound(type: "drum" | "whistle" | "victory" | "alert" | "cash") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (type === "drum") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === "whistle") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      osc.frequency.setValueAtTime(2200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "victory") {
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } else if (type === "alert") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(240, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else if (type === "cash") {
      [587, 880, 1174].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    }
  } catch {
    // AudioContext blocked
  }
}

export default function App() {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [startMode, setStartMode] = useState<"HISTORICA" | "CRIAR">("HISTORICA");
  const [selectedOfficialTorcidaName, setSelectedOfficialTorcidaName] = useState<string>("Gaviões da Fiel");
  const [torcidaName, setTorcidaName] = useState<string>("Fúria Alvinegra");
  const [sigla, setSigla] = useState<string>("FAN");
  const [selectedClub, setSelectedClub] = useState<string>("Corinthians");
  const [customClub, setCustomClub] = useState<string>("");
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId>("PADRAO");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Custom Torcida Colors
  const [primaryColor, setPrimaryColor] = useState<string>("#FFFFFF");
  const [secondaryColor, setSecondaryColor] = useState<string>("#111827");

  const [currentTorcida, setCurrentTorcida] = useState<OfficialTorcida | null>(null);
  const [season, setSeason] = useState<number>(1);
  const [bankBalance, setBankBalance] = useState<number>(30000);
  const [clubStatus, setClubStatus] = useState<ClubStatus>("LUTANDO_ACESSO");

  // Season Objectives
  const [seasonObjectives, setSeasonObjectives] = useState<SeasonObjective[]>([]);
  const [seasonEndReport, setSeasonEndReport] = useState<{
    completedCount: number;
    totalCashBonus: number;
    totalMoralBonus: number;
    totalRespeitoBonus: number;
    logs: string[];
  } | null>(null);

  const [stats, setStats] = useState<TorcidaStats>({
    contingente: 75,
    pressao_bancada: 75,
    poder_pista: 75,
    caravana: 75,
    autonomia_financeira: 75,
  });

  const [stateTrackers, setStateTrackers] = useState<StateTrackers>({
    moral: 70,
    risco_mp: 10,
    relacao_clube: 15,
    respeito_nacional: 50,
  });

  const [isBannedByMP, setIsBannedByMP] = useState<boolean>(false);
  const [debtYears, setDebtYears] = useState<number>(0);
  const [pipelineIndex, setPipelineIndex] = useState<number>(0);

  // MATCH WORKFLOW STATE
  // Phase: "CLOSED" | "POLICE_MEETING" | "TRANSPORT" | "SCOUT_INTEL" | "TACTICAL" | "MINIGAME" | "RESULT"
  const [matchModalPhase, setMatchModalPhase] = useState<
    "CLOSED" | "POLICE_MEETING" | "TRANSPORT" | "SCOUT_INTEL" | "TACTICAL" | "MINIGAME" | "RESULT"
  >("CLOSED");
  const [activeMatchMiniGameContext, setActiveMatchMiniGameContext] = useState<MatchContext | null>(null);
  const [activeSelectedTactic, setActiveSelectedTactic] = useState<TacticalBattleChoice | null>(null);
  const [activeMatchDerby, setActiveMatchDerby] = useState<DerbyMatchInfo | null>(null);
  const [selectedPoliceChoice, setSelectedPoliceChoice] = useState<PoliceMeetingChoice | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<TransportChoice | null>(null);
  const [activeScoutIntel, setActiveScoutIntel] = useState<MatchScoutReport | null>(null);
  const [activeMatchResult, setActiveMatchResult] = useState<MatchExecutionResult | null>(null);
  const [isGeneratingChronicle, setIsGeneratingChronicle] = useState<boolean>(false);

  // ACTION FEEDBACK STATE
  const [actionFeedback, setActionFeedback] = useState<{
    title: string;
    logText: string;
    deltas: FormattedDelta[];
  } | null>(null);

  // BATTLE ANIMATION & HISTORY TRACKING
  const [isBattleAnimating, setIsBattleAnimating] = useState<boolean>(false);
  const [battleProgress, setBattleProgress] = useState<number>(0);
  const [seasonHistory, setSeasonHistory] = useState<{
    season: number;
    powerScore: number;
    rankPosition: number;
    totalTeams: number;
    contingente: number;
    pressaoBancada: number;
    poderPista: number;
    caravana: number;
    bankBalance: number;
    moral: number;
    riscoMP: number;
  }[]>([]);

  const [historyLog, setHistoryLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"pipeline" | "objectives" | "ranking" | "standings" | "profile" | "alliances" | "history">("pipeline");
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleCopyForInstagram = (text: string) => {
    navigator.clipboard.writeText(text);
    setShareToast("Texto copiado! Abra o Instagram e cole nos seus Stories / Direct.");
    setTimeout(() => setShareToast(null), 3500);
  };

  const renderSocialShareSection = (title: string, text: string) => {
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

    return (
      <div className="bg-zinc-950/90 border border-amber-500/40 rounded-2xl p-3 space-y-2 text-center my-2.5 shadow-inner">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
          <span>📢 COMPARTILHAR ({title})</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black">
            KAVERS GAMES
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-1 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 shadow"
          >
            <span>💬 WhatsApp</span>
          </a>

          {/* Instagram */}
          <button
            type="button"
            onClick={() => handleCopyForInstagram(text)}
            className="py-2 px-1 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 shadow cursor-pointer"
          >
            <span>📸 Instagram</span>
          </button>

          {/* X / Twitter */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 shadow"
          >
            <span>𝕏 Twitter / X</span>
          </a>
        </div>
      </div>
    );
  };

  // RIVALRY & DIPLOMACY STATE
  const [rivalryRecords, setRivalryRecords] = useState<Record<string, RivalryRecord>>({});
  const [selectedTorcidaForDiplomacy, setSelectedTorcidaForDiplomacy] = useState<OfficialTorcida | null>(null);
  const [diplomacyFeedback, setDiplomacyFeedback] = useState<string | null>(null);
  const [alliedInvasionInvite, setAlliedInvasionInvite] = useState<{
    allyTorcida: string;
    allyClub: string;
    targetRivalTorcida: string;
    targetRivalClub: string;
    city: string;
    stadium: string;
  } | null>(null);
  const [allianceProposalInvite, setAllianceProposalInvite] = useState<{
    proposingTorcida: string;
    proposingClub: string;
    proposingState: string;
    narrative: string;
  } | null>(null);
  const [allyBonusMembers, setAllyBonusMembers] = useState<number>(0);
  const [challengedRivalTorcida, setChallengedRivalTorcida] = useState<string | null>(null);

  // 15-SEASON SYSTEMS STATE
  const [presidentProfile, setPresidentProfile] = useState<PresidentProfile | null>(null);
  const [showPresidentElectionModal, setShowPresidentElectionModal] = useState<boolean>(false);
  const [hasOwnHeadquarters, setHasOwnHeadquarters] = useState<boolean>(false);
  const [bateriaDurability, setBateriaDurability] = useState<number>(100);
  const [pyroStockCount, setPyroStockCount] = useState<number>(0);
  const [activeNewsReel, setActiveNewsReel] = useState<NewsReelEvent | null>(null);
  const [activeMilestoneDecision, setActiveMilestoneDecision] = useState<SeasonalMilestoneDefinition | null>(null);
  const [rivalPistaBonusMap, setRivalPistaBonusMap] = useState<Record<string, number>>({});

  const handleDownloadProjectZip = async () => {
    try {
      setIsDownloadingZip(true);
      const res = await fetch("/api/download-zip");
      if (!res.ok) throw new Error("Falha ao baixar arquivo ZIP");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bancada_projeto_atualizado.zip";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        setIsDownloadingZip(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsDownloadingZip(false);
    }
  };

  const officialList = getOfficialTorcidas();
  const alliances = getAlliancesData();

  const mappedClubsList = Array.from(new Set(officialList.map((t) => t.clube))).sort();

  // Load Saved Game
  useEffect(() => {
    const saved = localStorage.getItem("bancada_ultra_v2_save");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isStarted && parsed.currentTorcida) {
          setIsStarted(true);
          setCurrentTorcida(parsed.currentTorcida);
          setSeason(parsed.season || 1);
          setBankBalance(parsed.bankBalance ?? 30000);
          setClubStatus(parsed.clubStatus || "LUTANDO_ACESSO");
          setStats(parsed.stats || { contingente: 70, pressao_bancada: 70, poder_pista: 70, caravana: 70, autonomia_financeira: 70 });
          setStateTrackers(parsed.stateTrackers || { moral: 70, risco_mp: 10, relacao_clube: 15, respeito_nacional: 50 });
          setIsBannedByMP(parsed.isBannedByMP || false);
          setDebtYears(parsed.debtYears || 0);
          setPipelineIndex(parsed.pipelineIndex || 0);
          setHistoryLog(parsed.historyLog || []);
          if (parsed.presidentProfile) setPresidentProfile(parsed.presidentProfile);
          if (parsed.hasOwnHeadquarters !== undefined) setHasOwnHeadquarters(parsed.hasOwnHeadquarters);
          if (parsed.bateriaDurability !== undefined) setBateriaDurability(parsed.bateriaDurability);
          if (parsed.pyroStockCount !== undefined) setPyroStockCount(parsed.pyroStockCount);
          if (parsed.rivalryRecords) {
            setRivalryRecords(parsed.rivalryRecords);
          }
          if (parsed.challengedRivalTorcida) {
            setChallengedRivalTorcida(parsed.challengedRivalTorcida);
          }
          if (parsed.seasonObjectives && parsed.seasonObjectives.length > 0) {
            setSeasonObjectives(parsed.seasonObjectives);
          } else {
            setSeasonObjectives(generateSeasonObjectives(parsed.season || 1, parsed.currentTorcida, parsed.clubStatus || "LUTANDO_ACESSO"));
          }
          if (parsed.season >= 15 && parsed.pipelineIndex >= 12) {
            setIsGameOver(true);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar save:", e);
      }
    }
  }, []);

  // Update default colors when selecting club or torcida
  useEffect(() => {
    if (startMode === "HISTORICA") {
      const selected = officialList.find((t) => t.torcida === selectedOfficialTorcidaName);
      if (selected) {
        setPrimaryColor(selected.primaryColor || "#FFFFFF");
        setSecondaryColor(selected.secondaryColor || "#111827");
      }
    } else {
      const club = selectedClub === "OUTRO" ? customClub : selectedClub;
      const def = getDefaultTorcidaColors(club);
      setPrimaryColor(def.primary);
      setSecondaryColor(def.secondary);
    }
  }, [selectedOfficialTorcidaName, selectedClub, startMode]);

  // Auto-save
  useEffect(() => {
    if (isStarted && currentTorcida) {
      localStorage.setItem(
        "bancada_ultra_v2_save",
        JSON.stringify({
          isStarted,
          currentTorcida,
          season,
          bankBalance,
          clubStatus,
          stats,
          stateTrackers,
          isBannedByMP,
          debtYears,
          pipelineIndex,
          historyLog,
          seasonObjectives,
          rivalryRecords,
          challengedRivalTorcida,
          presidentProfile,
          hasOwnHeadquarters,
          bateriaDurability,
          pyroStockCount,
        })
      );
    }
  }, [
    isStarted,
    currentTorcida,
    season,
    bankBalance,
    clubStatus,
    stats,
    stateTrackers,
    isBannedByMP,
    debtYears,
    pipelineIndex,
    historyLog,
    seasonObjectives,
    rivalryRecords,
    challengedRivalTorcida,
    presidentProfile,
    hasOwnHeadquarters,
    bateriaDurability,
    pyroStockCount,
  ]);

  const pipeline = currentTorcida
    ? getAnnualPipelineWithMatches(currentTorcida, clubStatus, season, challengedRivalTorcida)
    : [];

  const actionEvents = getActionStepEvents(clubStatus, season, currentTorcida);

  const handleStartCareer = () => {
    if (soundEnabled) playStadiumSound("drum");

    if (startMode === "HISTORICA") {
      const selected = officialList.find((t) => t.torcida === selectedOfficialTorcidaName) || officialList[0];
      const torcidaWithColors: OfficialTorcida = {
        ...selected,
        primaryColor,
        secondaryColor,
      };
      setCurrentTorcida(torcidaWithColors);
      setStats({
        contingente: selected.contingente,
        pressao_bancada: selected.pressao_bancada,
        poder_pista: selected.poder_pista,
        caravana: selected.caravana,
        autonomia_financeira: selected.autonomia_financeira,
      });
      setStateTrackers({
        moral: 75,
        risco_mp: 10,
        relacao_clube: 15,
        respeito_nacional: 80,
      });
      setBankBalance(selected.autonomia_financeira * 700);
      setIsBannedByMP(false);
      setDebtYears(0);
      setSeason(1);
      setPipelineIndex(0);
      const objectives = generateSeasonObjectives(1, torcidaWithColors, "LUTANDO_ACESSO");
      setSeasonObjectives(objectives);
      setHistoryLog([
        `[Ano 1 - Liderança Histórica] Você assumiu a diretoria da consagrada ${selected.torcida} nas cores oficiais apoiando o ${selected.clube}.`,
      ]);
      setHasOwnHeadquarters(selected.tier === "S" || selected.tier === "S-");
      setBateriaDurability(100);
      setPyroStockCount(0);
      setShowPresidentElectionModal(true);
      setIsGameOver(false);
      setIsStarted(true);
      return;
    }

    // CRIAR NOVA TORCIDA / DISSIDÊNCIA
    const club = selectedClub === "OUTRO" ? customClub : selectedClub;
    if (!club.trim()) return;

    const { torcida, state } = createCustomTorcidaWithArchetype(
      torcidaName,
      sigla,
      club,
      selectedArchetype,
      primaryColor,
      secondaryColor
    );
    setCurrentTorcida(torcida);
    setStats({
      contingente: torcida.contingente,
      pressao_bancada: torcida.pressao_bancada,
      poder_pista: torcida.poder_pista,
      caravana: torcida.caravana,
      autonomia_financeira: torcida.autonomia_financeira,
    });
    setStateTrackers(state);

    setBankBalance(torcida.autonomia_financeira * 350);
    setIsBannedByMP(false);
    setDebtYears(0);
    setSeason(1);
    setPipelineIndex(0);
    const objectives = generateSeasonObjectives(1, torcida, "LUTANDO_ACESSO");
    setSeasonObjectives(objectives);
    setHistoryLog([
      `[Ano 1 - Fundação] Fundada a nova torcida ${torcida.torcida} com pavilhão nas cores ${primaryColor} e ${secondaryColor} no perfil "${ARCHETYPES[selectedArchetype].name}" apoiando o ${torcida.clube}.`,
    ]);
    setHasOwnHeadquarters(false);
    setBateriaDurability(100);
    setPyroStockCount(0);
    setShowPresidentElectionModal(true);
    setIsGameOver(false);
    setIsStarted(true);
  };

  // ACTION CHOICE RESOLUTION
  const handleMakeActionChoice = (choice: ActionChoice) => {
    if (soundEnabled) playStadiumSound("drum");

    setBankBalance((prev) => prev - choice.cost);

    if (choice.statEffects) {
      setStats((prev) => {
        const updated = { ...prev };
        Object.entries(choice.statEffects).forEach(([key, val]) => {
          const k = key as keyof TorcidaStats;
          if (val) updated[k] = applyDiminishingReturns(updated[k], val);
        });
        return updated;
      });
    }

    if (choice.stateEffects) {
      setStateTrackers((prev) => {
        const updated = { ...prev };
        Object.entries(choice.stateEffects).forEach(([key, val]) => {
          const k = key as keyof StateTrackers;
          if (val !== undefined) updated[k] = Math.min(100, Math.max(0, updated[k] + val));
        });
        if (updated.risco_mp >= 100) {
          setIsBannedByMP(true);
          if (soundEnabled) playStadiumSound("alert");
        }
        return updated;
      });
    }

    if (choice.log) {
      setHistoryLog((prev) => [`[Ano ${season} - Etapa ${pipelineIndex + 1}] ${choice.log}`, ...prev]);
    }

    setActionFeedback({
      title: "DESFECHO DA DECISÃO",
      logText: choice.log,
      deltas: choice.formattedDeltas,
    });
  };

  const handleConfirmFeedback = () => {
    setActionFeedback(null);
    advancePipeline();
  };

  // MULTI-STAGE MATCH WORKFLOW
  // 1. Start -> Police Meeting
  const handleStartMatchWorkflow = (step: any) => {
    if (soundEnabled) playStadiumSound("whistle");
    setActiveMatchDerby(step.derby);
    setSelectedPoliceChoice(null);
    setSelectedTransport(null);
    setActiveScoutIntel(null);
    setMatchModalPhase("POLICE_MEETING");
  };

  // 2. Police Choice -> Transport Selection
  const handleSelectPoliceChoice = (policeChoice: PoliceMeetingChoice) => {
    if (soundEnabled) playStadiumSound("drum");
    setSelectedPoliceChoice(policeChoice);
    setMatchModalPhase("TRANSPORT");
  };

  // 3. Transport Selection -> Scout Intel
  const handleSelectTransport = (transport: TransportChoice) => {
    if (soundEnabled) playStadiumSound("drum");
    setSelectedTransport(transport);
    if (activeMatchDerby) {
      const isInterior = isInteriorSP(currentTorcida);
      const intel = calculateScoutIntel(stats, transport, activeMatchDerby, isInterior);
      setActiveScoutIntel(intel);
      setMatchModalPhase("SCOUT_INTEL");
    }
  };

  // 4. Scout Intel -> Tactical Decision
  const handleProceedToTacticalChoices = () => {
    if (soundEnabled) playStadiumSound("drum");
    setMatchModalPhase("TACTICAL");
  };

  // 5. Execute Tactical Choice & Trigger Mini-Game
  const handleExecuteTacticalChoice = (tactic: TacticalBattleChoice) => {
    if (!selectedTransport || !activeScoutIntel || !activeMatchDerby || !currentTorcida) return;

    let mappedChoice: MatchContext['tacticalChoice'] = 'front_charge';
    const tid = (tactic.id || "").toUpperCase();

    if (tactic.isMosaicTactic || tid.includes("MOSAICO") || tid.includes("FESTA") || tid.includes("SAMBA") || tid.includes("ALAMBRADO")) {
      mappedChoice = 'rhythm_mosaic';
    } else if (tid.includes("ROJOES") || tid.includes("MORTEIROS")) {
      mappedChoice = 'rojon_barrage';
    } else if (tid.includes("EMBOSCADA") || tid.includes("COMBOIO") || tid.includes("ESCOLTA") || tid.includes("FLANCO") || tid.includes("SURPRESA") || tid.includes("RODOVIA")) {
      mappedChoice = 'caravan_escape';
    } else if (tid.includes("MAO_LIMPA") || tid.includes("LINHA_FRENTE") || tid.includes("SOCO") || tid.includes("DISPOSICAO")) {
      mappedChoice = 'punch_combat';
    } else if (tid.includes("BARRA") || tid.includes("PERIMETRO")) {
      mappedChoice = 'front_charge';
    } else if (activeMatchDerby.isHome && (tid.includes("PORTAO") || tid.includes("PERIMETRO_LOCAL"))) {
      mappedChoice = 'gate_concentration';
    } else {
      mappedChoice = 'front_charge';
    }

    const opponentTier: MatchContext['opponentTier'] = activeScoutIntel.rivalMembersWaiting > 3000 ? 'S' : activeScoutIntel.rivalMembersWaiting > 1500 ? 'A' : 'B';

    setActiveSelectedTactic(tactic);
    setActiveMatchMiniGameContext({
      isHome: activeMatchDerby.isHome,
      isAllyGame: activeMatchDerby.isAllyGame,
      tacticalChoice: mappedChoice,
      homeContingent: activeMatchDerby.isHome ? activeScoutIntel.playerMembersPresent : activeScoutIntel.rivalMembersWaiting,
      awayContingent: activeMatchDerby.isHome ? activeScoutIntel.rivalMembersWaiting : activeScoutIntel.playerMembersPresent,
      opponentTier,
    });
    setMatchModalPhase("MINIGAME");
  };

  // 6. Complete Mini-Game & Resolve Complete Match Mechanics
  const handleMatchMiniGameComplete = (resultText: string, finalPECModifier: number, penaltyMP?: number) => {
    const tactic = activeSelectedTactic;
    if (!tactic || !selectedTransport || !activeScoutIntel || !activeMatchDerby || !currentTorcida) return;

    if (penaltyMP && penaltyMP > 0) {
      setStateTrackers((st) => ({
        ...st,
        risco_mp: Math.min(100, st.risco_mp + penaltyMP),
      }));
    }

    setMatchModalPhase("CLOSED");
    setIsBattleAnimating(true);
    setBattleProgress(0);

    if (soundEnabled) playStadiumSound("alert");

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setBattleProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 450);

    setTimeout(async () => {
      setIsBattleAnimating(false);

      const modifiedTactic = {
        ...tactic,
        pistaMod: tactic.pistaMod + Math.round(finalPECModifier * 100),
      };

      const result = executeCompleteMatch(
        stats,
        stateTrackers,
        selectedPoliceChoice,
        selectedTransport,
        activeScoutIntel,
        modifiedTactic,
        activeMatchDerby,
        currentTorcida,
        presidentProfile,
        bateriaDurability
      );

      setSeasonObjectives((prev) =>
        prev.map((obj) => {
          if (tactic.isMosaicTactic && (obj.category === "MOSAICO" || obj.category === "BANCADA")) {
            const newVal = obj.currentValue + 1;
            return {
              ...obj,
              currentValue: newVal,
              isCompleted: newVal >= obj.targetValue,
            };
          }
          if (result.isVictoryPista && (obj.category === "PISTA" || obj.category === "CARAVANA")) {
            const newVal = obj.currentValue + 1;
            return {
              ...obj,
              currentValue: newVal,
              isCompleted: newVal >= obj.targetValue,
            };
          }
          return obj;
        })
      );

      setIsGeneratingChronicle(true);
      const chronicle = await generateGeminiChronicle({
        season: season,
        clube: currentTorcida.clube,
        torcida: currentTorcida.torcida,
        sigla: currentTorcida.sigla,
        stadium: activeMatchDerby.stadium,
        cityState: activeMatchDerby.cityState,
        rivalTorcida: activeMatchDerby.rivalTorcida,
        rivalSigla: "",
        rivalClub: activeMatchDerby.homeClub === currentTorcida.clube ? activeMatchDerby.awayClub : activeMatchDerby.homeClub,
        isHome: activeMatchDerby.isHome,
        isAllyGame: activeMatchDerby.isAllyGame,
        competition: activeMatchDerby.competition,
        isVictory: result.isVictoryPista,
        isVictoryPista: result.isVictoryPista,
        isVictoryBancada: result.isVictoryBancada,
        score: `${result.scorePlayerClub} x ${result.scoreRivalClub}`,
        playerAttendance: activeScoutIntel.playerMembersPresent,
        rivalAttendance: activeScoutIntel.rivalMembersWaiting,
        tacticTitle: tactic.title,
        tacticLog: `${tactic.tacticalLog} (${resultText})`,
        policeStance: selectedPoliceChoice?.stance || "PADRÃO",
        policeTitle: selectedPoliceChoice?.title || "Reunião de Segurança",
        transportName: selectedTransport?.name || "Transporte",
        twistTitle: activeScoutIntel.twistTitle,
        twistDescription: activeScoutIntel.twistDescription,
        extraCost: result.extraExpenses,
        medical: result.medicalCost,
        desertion: result.membersLost,
        moralChange: result.moralChange,
        mpAdded: result.mpAdded,
        statusTitle: result.statusTitle,
      });
      result.chronicleText = chronicle;
      setIsGeneratingChronicle(false);

      setActiveMatchResult(result);

      // Apply financial & attribute consequences
      setBankBalance((prev) => prev - result.extraExpenses);
      setStateTrackers((prev) => {
        const newMP = Math.min(100, Math.max(0, prev.risco_mp + result.mpAdded));
        if (newMP >= 100) setIsBannedByMP(true);
        return {
          ...prev,
          moral: Math.min(100, Math.max(0, prev.moral + result.moralChange)),
          risco_mp: newMP,
        };
      });

      setStats((prev) => ({
        ...prev,
        contingente: Math.max(10, prev.contingente - Math.floor(result.membersLost / 10)),
        poder_pista: result.isVictoryPista
          ? applyDiminishingReturns(prev.poder_pista, 3 + tactic.pistaMod)
          : Math.max(10, prev.poder_pista - 4),
        pressao_bancada: tactic.isMosaicTactic
          ? applyDiminishingReturns(prev.pressao_bancada, 8)
          : prev.pressao_bancada,
      }));

      setHistoryLog((prev) => [
        `[Ano ${season} - ${activeMatchDerby.competition || "Jogo"}] ${result.statusTitle}. Placar: ${result.scorePlayerClub}x${result.scoreRivalClub}. Tática: ${tactic.tacticalLog} (${resultText})`,
        ...prev,
      ]);

      // Update Rivalry & Banner History Record
      if (activeMatchDerby && !activeMatchDerby.isAllyGame) {
        const rKey = activeMatchDerby.rivalTorcida;
        const bannerCaptured = result.bannerCaptured ?? false;
        const bannerLost = result.statusTitle.includes("BANDEIRÃO") || result.statusTitle.includes("PATRIMÔNIO PERDIDO");

        setRivalryRecords((prev) => {
          const existing = prev[rKey] || {
            rivalTorcida: rKey,
            rivalClub: (activeMatchDerby.isHome ? activeMatchDerby.awayClub : activeMatchDerby.homeClub) || rKey,
            totalConfrontos: 0,
            vitoriasPista: 0,
            derrotasPista: 0,
            jogosDaPaz: 0,
            faixasTomadas: 0,
            faixasPerdidas: 0,
            isPeacePactActive: false,
            isTretaChallenged: false,
          };

          return {
            ...prev,
            [rKey]: {
              ...existing,
              totalConfrontos: existing.totalConfrontos + 1,
              vitoriasPista: existing.vitoriasPista + (result.isVictoryPista ? 1 : 0),
              derrotasPista: existing.derrotasPista + (result.isVictoryPista ? 0 : 1),
              faixasTomadas: existing.faixasTomadas + (bannerCaptured ? 1 : 0),
              faixasPerdidas: existing.faixasPerdidas + (bannerLost ? 1 : 0),
              isPeacePactActive: false,
              isTretaChallenged: false,
            },
          };
        });
      }

      advancePipeline();
    }, 2200);
  };

  const advancePipeline = () => {
    if (pipelineIndex + 1 < 13) {
      setPipelineIndex((prev) => prev + 1);
    } else {
      // Record Season History Evolution
      if (currentTorcida) {
        const ranking = simulateNationalRanking(currentTorcida, stats, stateTrackers, season);
        const playerRankEntry = ranking.find((r) => r.isPlayer);
        setSeasonHistory((prev) => [
          ...prev,
          {
            season,
            powerScore: playerRankEntry?.powerScore || 500,
            rankPosition: playerRankEntry?.rank || 10,
            totalTeams: ranking.length,
            contingente: stats.contingente,
            pressaoBancada: stats.pressao_bancada,
            poderPista: stats.poder_pista,
            caravana: stats.caravana,
            bankBalance,
            moral: stateTrackers.moral,
            riscoMP: stateTrackers.risco_mp,
          },
        ]);
      }

      // Annual Season Closing & Objective Evaluation (with Gestor President +25% Bonus)
      const gestorMult = presidentProfile === "GESTOR" ? GAME_BALANCE.PRESIDENT_MODIFIERS.GESTOR.cashBonusPct + 1.0 : 1.0;
      const annualDues = Math.floor(stats.contingente * GAME_BALANCE.MEMBERSHIP_DUES_PER_MEMBER * gestorMult);
      const merchRevenue = Math.floor(stats.autonomia_financeira * GAME_BALANCE.MERCH_REVENUE_FACTOR * gestorMult);
      const baseRevenue = annualDues + merchRevenue;

      // Passive Linha de Frente MP Risk Penalty (+10%)
      if (presidentProfile === "LINHA_FRENTE") {
        setStateTrackers((st) => ({
          ...st,
          risco_mp: Math.min(100, st.risco_mp + GAME_BALANCE.PRESIDENT_MODIFIERS.LINHA_FRENTE.passiveRiscoMpAdded),
        }));
      }

      // Evaluate Season Objectives
      const evaluation = evaluateSeasonEndObjectives(
        seasonObjectives,
        stats,
        stateTrackers,
        bankBalance + baseRevenue,
        isBannedByMP
      );

      const totalRevenue = baseRevenue + evaluation.totalCashBonus;

      setBankBalance((prev) => {
        const newBal = prev + totalRevenue;
        if (newBal < 0) {
          setDebtYears((d) => d + 1);
          setStateTrackers((st) => ({ ...st, moral: Math.max(0, st.moral - 12) }));
        } else {
          setDebtYears(0);
        }
        return newBal;
      });

      setStateTrackers((prev) => ({
        ...prev,
        moral: Math.min(100, Math.max(0, prev.moral + evaluation.totalMoralBonus)),
        respeito_nacional: Math.min(100, Math.max(0, prev.respeito_nacional + evaluation.totalRespeitoBonus)),
      }));

      if (isBannedByMP) {
        setIsBannedByMP(false);
        setStateTrackers((st) => ({ ...st, risco_mp: 35 }));
      }

      setSeasonEndReport({
        completedCount: evaluation.completedCount,
        totalCashBonus: evaluation.totalCashBonus,
        totalMoralBonus: evaluation.totalMoralBonus,
        totalRespeitoBonus: evaluation.totalRespeitoBonus,
        logs: evaluation.summaryLogs,
      });

      if (evaluation.completedCount > 0 && soundEnabled) {
        playStadiumSound("cash");
      }

      const statuses: ClubStatus[] = ["DISPUTANDO_TITULO", "MEIO_TABELA", "CRISE_REBAIXAMENTO", "LUTANDO_ACESSO"];
      const nextStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setClubStatus(nextStatus);

      if (season >= GAME_BALANCE.CAREER_MAX_SEASONS) {
        setIsGameOver(true);
        confetti({ particleCount: 150, spread: 85, origin: { y: 0.5 } });
      } else {
        const nextSeason = season + 1;
        setSeason(nextSeason);
        setPipelineIndex(0);
        setChallengedRivalTorcida(null);

        // Bateria wear & tear per season (50% reduction for Mestre de Bateria)
        const wearAmount = presidentProfile === "MESTRE_BATERIA" ? 8 : 15;
        setBateriaDurability((prev) => Math.max(10, prev - wearAmount));

        // Rent deduction for non-owned headquarters (R$ 3.500/year)
        if (!hasOwnHeadquarters) {
          setBankBalance((prev) => prev - GAME_BALANCE.HEADQUARTERS_ANNUAL_RENT);
        }

        // Presidential Election trigger at Seasons 4, 7, 10, 13
        if (GAME_BALANCE.PRESIDENT_ELECTIONS_SEASONS.includes(nextSeason)) {
          setShowPresidentElectionModal(true);
        }

        // Seasonal Milestone Decision trigger at Seasons 3, 6, 9, 12, 15
        if ([3, 6, 9, 12, 15].includes(nextSeason)) {
          const mainRivalName = activeMatchDerby?.rivalTorcida || "Rival Principal";
          const rKey = (mainRivalName || "").trim().toUpperCase();
          const rec = rivalryRecords[rKey] || { faixasTomadas: 0, faixasPerdidas: 0 };
          const isPositive = rec.faixasTomadas > rec.faixasPerdidas;
          const milestone = getSeasonalMilestoneEvent(nextSeason, stats, stateTrackers, mainRivalName, isPositive);
          if (milestone) {
            setActiveMilestoneDecision(milestone);
          }
        }

        if (currentTorcida) {
          const nextObjectives = generateSeasonObjectives(nextSeason, currentTorcida, nextStatus);
          setSeasonObjectives(nextObjectives);
        }

        // Trigger Allied Convocation Event or Friendship Proposal Event (~35% chance)
        if (currentTorcida) {
          const isIndependentTorcida = currentTorcida.eixo_alianca === "INDEPENDENTE" || !currentTorcida.eixo_alianca;

          if (isIndependentTorcida) {
            // Torcidas without pre-existing alliances MUST FIRST receive a diplomatic proposal meeting!
            if (Math.random() < 0.35) {
              const nonStateCandidates = officialList.filter(
                (t) => t.clube.toLowerCase() !== currentTorcida.clube.toLowerCase()
              );
              if (nonStateCandidates.length > 0) {
                const proposalObj = nonStateCandidates[Math.floor(Math.random() * nonStateCandidates.length)];
                setAllianceProposalInvite({
                  proposingTorcida: proposalObj.torcida,
                  proposingClub: proposalObj.clube,
                  proposingState: proposalObj.estado,
                  narrative: `A diretoria da ${proposalObj.torcida} (${proposalObj.clube}/${proposalObj.estado}) solicitou formalmente uma reunião diplomática na nossa sede. Eles propõem um pacto de amizade e união para apoio mútuo nas viagens e proteção nas rodovias.`,
                });
              }
            }
          } else {
            // Torcidas WITH established alliances trigger support convocations ONLY with their genuine allies!
            const alliesList = officialList.filter(
              (t) =>
                t.eixo_alianca !== "INDEPENDENTE" &&
                t.eixo_alianca === currentTorcida.eixo_alianca &&
                t.clube.toLowerCase() !== currentTorcida.clube.toLowerCase()
            );
            const sameStateRivalsList = officialList.filter(
              (t) => t.estado === currentTorcida.estado && t.clube.toLowerCase() !== currentTorcida.clube.toLowerCase()
            );

            if (alliesList.length > 0 && sameStateRivalsList.length > 0 && Math.random() < 0.35) {
              const allyObj = alliesList[Math.floor(Math.random() * alliesList.length)];
              const rivalObj = sameStateRivalsList[Math.floor(Math.random() * sameStateRivalsList.length)];

              setAlliedInvasionInvite({
                allyTorcida: allyObj.torcida,
                allyClub: allyObj.clube,
                targetRivalTorcida: rivalObj.torcida,
                targetRivalClub: rivalObj.clube,
                city: currentTorcida.estado === "SP" ? "São Paulo" : "Região Metropolitana",
                stadium: `Estádio do ${rivalObj.clube}`,
              });
            }
          }
        }
      }
    }
  };

  const handleAcceptAllianceProposal = () => {
    if (!allianceProposalInvite) return;
    const cost = 3000;
    if (bankBalance < cost) {
      alert("Saldo insuficiente no caixa para custear a reunião diplomática (Custo: R$ 3.000).");
      return;
    }
    setBankBalance((prev) => prev - cost);
    setStateTrackers((prev) => ({
      ...prev,
      moral: Math.min(100, prev.moral + 10),
      respeito_nacional: Math.min(100, prev.respeito_nacional + 12),
    }));
    setRivalryRecords((prev) => ({
      ...prev,
      [allianceProposalInvite.proposingTorcida]: {
        rivalTorcida: allianceProposalInvite.proposingTorcida,
        rivalClub: allianceProposalInvite.proposingClub,
        totalConfrontos: 0,
        vitoriasPista: 0,
        derrotasPista: 0,
        jogosDaPaz: 1,
        faixasTomadas: 0,
        faixasPerdidas: 0,
        isPeacePactActive: true,
        isTretaChallenged: false,
      },
    }));
    setHistoryLog((prev) => [
      `[Ano ${season} - Reunião Diplomática] Selado novo pacto de amizade oficial na sede com a torcida ${allianceProposalInvite.proposingTorcida} do ${allianceProposalInvite.proposingClub}!`,
      ...prev,
    ]);
    setAllianceProposalInvite(null);
  };

  const handleDeclineAllianceProposal = () => {
    if (!allianceProposalInvite) return;
    setHistoryLog((prev) => [
      `[Ano ${season} - Reunião Diplomática] Recusada a proposta de aliança com a ${allianceProposalInvite.proposingTorcida}. A torcida mantém sua independência autônoma.`,
      ...prev,
    ]);
    setAllianceProposalInvite(null);
  };

  // DIPLOMACY ACTIONS RESOLUTION
  const handleDiplomacyAction = (
    actionType:
      | "MARCAR_TRETA"
      | "JOGO_PAZ"
      | "RESGATAR_FAIXA"
      | "DEVOLVER_FAIXA"
      | "CHURRASCO_NEUTRA"
      | "REUNIAO_ALIANCA"
      | "SOLICITAR_APOIO_ALIADA"
      | "ACAO_SOCIAL_CONJUNTA",
    targetTorcida: OfficialTorcida
  ) => {
    const key = targetTorcida.torcida;
    const existingRec = rivalryRecords[key] || {
      rivalTorcida: targetTorcida.torcida,
      rivalClub: targetTorcida.clube,
      totalConfrontos: 0,
      vitoriasPista: 0,
      derrotasPista: 0,
      jogosDaPaz: 0,
      faixasTomadas: 0,
      faixasPerdidas: 0,
    };

    switch (actionType) {
      case "MARCAR_TRETA":
        setChallengedRivalTorcida(targetTorcida.torcida);
        setRivalryRecords((prev) => ({
          ...prev,
          [key]: { ...existingRec, isTretaChallenged: true },
        }));
        setStateTrackers((st) => ({
          ...st,
          moral: Math.min(100, st.moral + 5),
          risco_mp: Math.min(100, st.risco_mp + 15),
        }));
        setStats((s) => ({ ...s, poder_pista: applyDiminishingReturns(s.poder_pista, 4) }));
        setHistoryLog((prev) => [
          `[Ano ${season} - Diplomacia] Marcou treta formal com a ${targetTorcida.torcida}. O grande confronto no final da temporada foi agendado contra eles!`,
          ...prev,
        ]);
        setDiplomacyFeedback(`⚔️ Treta marcada com a ${targetTorcida.torcida}! O grande clássico decisivo no final da temporada será contra eles! (+5 Moral, +4 Pista, +15% Risco MP)`);
        break;

      case "JOGO_PAZ":
        if (bankBalance < 3000) {
          setDiplomacyFeedback("❌ Caixa insuficiente! É necessário R$ 3.000 para negociação do Pacto da Paz.");
          return;
        }
        setBankBalance((b) => b - 3000);
        setRivalryRecords((prev) => ({
          ...prev,
          [key]: { ...existingRec, isPeacePactActive: true, jogosDaPaz: existingRec.jogosDaPaz + 1 },
        }));
        setStateTrackers((st) => ({ ...st, risco_mp: Math.max(0, st.risco_mp - 15) }));
        setHistoryLog((prev) => [
          `[Ano ${season} - Diplomacia] Firmado Pacto de Paz com a diretoria da ${targetTorcida.torcida}. Jogo sem armas nem emboscadas.`,
          ...prev,
        ]);
        setDiplomacyFeedback(`🕊️ Pacto de Paz firmado com a ${targetTorcida.torcida}! (-15% Risco MP, -R$ 3.000)`);
        break;

      case "RESGATAR_FAIXA":
        if (existingRec.faixasPerdidas <= 0) return;
        if (bankBalance < 15000) {
          setDiplomacyFeedback("❌ Caixa insuficiente! É necessário R$ 15.000 para resgatar o patrimônio.");
          return;
        }
        setBankBalance((b) => b - 15000);
        setRivalryRecords((prev) => ({
          ...prev,
          [key]: { ...existingRec, faixasPerdidas: Math.max(0, existingRec.faixasPerdidas - 1) },
        }));
        setStateTrackers((st) => ({ ...st, moral: Math.min(100, st.moral + 10) }));
        setHistoryLog((prev) => [
          `[Ano ${season} - Diplomacia] Resgatou faixa oficial perdida para a ${targetTorcida.torcida} mediante pagamento de R$ 15.000. Moral restaurada!`,
          ...prev,
        ]);
        setDiplomacyFeedback(`🚩 Faixa oficial resgatada com sucesso! (+10 Moral, -R$ 15.000)`);
        break;

      case "DEVOLVER_FAIXA":
        if (existingRec.faixasTomadas <= 0) return;
        setBankBalance((b) => b + 20000);
        setRivalryRecords((prev) => ({
          ...prev,
          [key]: { ...existingRec, faixasTomadas: Math.max(0, existingRec.faixasTomadas - 1) },
        }));
        setStateTrackers((st) => ({ ...st, risco_mp: Math.max(0, st.risco_mp - 10) }));
        setHistoryLog((prev) => [
          `[Ano ${season} - Diplomacia] Devolveu faixa tomada da ${targetTorcida.torcida} em acordo diplomático de alívio com o MP por R$ 20.000.`,
          ...prev,
        ]);
        setDiplomacyFeedback(`🤝 Faixa negociada e devolvida sob termos diplomáticos! (+R$ 20.000, -10% Risco MP)`);
        break;

      case "CHURRASCO_NEUTRA":
        if (bankBalance < 2000) {
          setDiplomacyFeedback("❌ Caixa insuficiente! R$ 2.000 necessários para compra de suprimentos.");
          return;
        }
        setBankBalance((b) => b + 6000);
        setStats((s) => ({ ...s, contingente: applyDiminishingReturns(s.contingente, 5) }));
        setStateTrackers((st) => ({ ...st, respeito_nacional: Math.min(100, st.respeito_nacional + 5) }));
        setHistoryLog((prev) => [
          `[Ano ${season} - Diplomacia] Churrasco de recepção na sede com a ${targetTorcida.torcida}. Lucro com cerveja e novos associados!`,
          ...prev,
        ]);
        setDiplomacyFeedback(`🥩 Churrasco realizado com sucesso! (+R$ 6.000 lucro líquido, +5 Massa, +5 Respeito)`);
        break;

      case "REUNIAO_ALIANCA":
        if (bankBalance < 5000) {
          setDiplomacyFeedback("❌ Caixa insuficiente! R$ 5.000 necessários para banquete diplomático.");
          return;
        }
        setBankBalance((b) => b - 5000);
        setStateTrackers((st) => ({
          ...st,
          moral: Math.min(100, st.moral + 8),
          respeito_nacional: Math.min(100, st.respeito_nacional + 10),
        }));
        setHistoryLog((prev) => [
          `[Ano ${season} - Diplomacia] Reunião solene formalizou aliança e pacto de paz com a ${targetTorcida.torcida}. Novo aliado no eixo!`,
          ...prev,
        ]);
        setDiplomacyFeedback(`🤝 Aliança formalizada com a ${targetTorcida.torcida}! (+8 Moral, +10 Respeito Nacional, -R$ 5.000)`);
        break;

      case "SOLICITAR_APOIO_ALIADA":
        if (bankBalance < 4000) {
          setDiplomacyFeedback("❌ Caixa insuficiente! R$ 4.000 necessários para custear transporte dos irmãos.");
          return;
        }
        setBankBalance((b) => b - 4000);
        setAllyBonusMembers(800);
        setHistoryLog((prev) => [
          `[Ano ${season} - Diplomacia] Convocou reforço de +800 integrantes da torcida aliada ${targetTorcida.torcida} para o próximo clássico!`,
          ...prev,
        ]);
        setDiplomacyFeedback(`🚌 Bonde irmão da ${targetTorcida.torcida} convocado com sucesso! (+800 membros no próximo jogo, -R$ 4.000)`);
        break;

      case "ACAO_SOCIAL_CONJUNTA":
        if (bankBalance < 3000) {
          setDiplomacyFeedback("❌ Caixa insuficiente! R$ 3.000 necessários para cestas/insumos.");
          return;
        }
        setBankBalance((b) => b - 3000);
        setStateTrackers((st) => ({
          ...st,
          risco_mp: Math.max(0, st.risco_mp - 15),
          moral: Math.min(100, st.moral + 8),
        }));
        setHistoryLog((prev) => [
          `[Ano ${season} - Diplomacia] Ação social conjunta realizada entre as sedes da ${currentTorcida?.torcida} e ${targetTorcida.torcida}. O MP reduziu a fiscalização!`,
          ...prev,
        ]);
        setDiplomacyFeedback(`💚 Ação social conjunta realizada com sucesso! (-15% Risco MP, +8 Moral, -R$ 3.000)`);
        break;
    }
  };

  const handleAcceptAlliedInvasionInvite = () => {
    if (!alliedInvasionInvite) return;
    if (bankBalance < 4000) {
      alert("Caixa insuficiente (R$ 4.000 necessários para a logística de somar no bonde visitante).");
      return;
    }
    setBankBalance((b) => b - 4000);
    setAllyBonusMembers(800);
    setStateTrackers((st) => ({
      ...st,
      moral: Math.min(100, st.moral + 10),
      respeito_nacional: Math.min(100, st.respeito_nacional + 8),
    }));
    setHistoryLog((prev) => [
      `[Ano ${season} - Convite Aliado] A torcida aceitou o convite e somou no bonde da ${alliedInvasionInvite.allyTorcida} contra o rival ${alliedInvasionInvite.targetRivalClub}! (+10 Moral, +8 Respeito)`,
      ...prev,
    ]);
    setAlliedInvasionInvite(null);
  };

  const handleRejectAlliedInvasionInvite = () => {
    if (!alliedInvasionInvite) return;
    setStateTrackers((st) => ({
      ...st,
      moral: Math.max(0, st.moral - 3),
    }));
    setHistoryLog((prev) => [
      `[Ano ${season} - Convite Aliado] A torcida declinou o convite da ${alliedInvasionInvite.allyTorcida} para focar nas atividades da sede. (-3 Moral)`,
      ...prev,
    ]);
    setAlliedInvasionInvite(null);
  };

  const getHonoraryTitle = () => {
    if (stats.contingente >= 90 && stats.pressao_bancada >= 90) return "SUPERPOTÊNCIA NACIONAL DE ARQUIBANCADA 👑";
    if (stats.poder_pista >= 90) return "A LENDA DAS RODOVIAS & PISTAS 🥊";
    if (stats.caravana >= 90) return "OS INVASORES DE COMBOIO 🚌";
    if (stats.autonomia_financeira >= 90) return "O IMPÉRIO COMERCIAL DA SEDE 💰";
    return "A RESISTÊNCIA DA BANCADA 🥁";
  };

  const handleRestartGame = () => {
    localStorage.removeItem("bancada_ultra_v2_save");
    setIsStarted(false);
    setIsGameOver(false);
    setSeason(1);
    setPipelineIndex(0);
    setDebtYears(0);
    setIsBannedByMP(false);
    setActiveMatchResult(null);
    setActionFeedback(null);
    setSeasonEndReport(null);
    setMatchModalPhase("CLOSED");
    setShowResetConfirm(false);
    setHistoryLog([]);
  };

  const handleSelectMilestoneOption = (option: SeasonalOptionDefinition) => {
    if (!activeMilestoneDecision) return;

    if (option.contingenteDelta) {
      setStats((s) => ({ ...s, contingente: Math.max(10, applyDiminishingReturns(s.contingente, option.contingenteDelta!)) }));
    }
    if (option.pistaDelta) {
      setStats((s) => ({ ...s, poder_pista: Math.min(100, Math.max(0, s.poder_pista + option.pistaDelta!)) }));
    }
    if (option.bancadaDelta) {
      setStats((s) => ({ ...s, pressao_bancada: Math.min(100, Math.max(0, s.pressao_bancada + option.bancadaDelta!)) }));
    }
    if (option.riscoMpDelta) {
      setStateTrackers((st) => ({ ...st, risco_mp: Math.min(100, Math.max(0, st.risco_mp + option.riscoMpDelta!)) }));
    }
    if (option.respeitoDelta) {
      setStateTrackers((st) => ({ ...st, respeito_nacional: Math.min(100, Math.max(0, st.respeito_nacional + option.respeitoDelta!)) }));
    }
    if (option.cashDelta) {
      setBankBalance((b) => b + option.cashDelta!);
    }

    if (option.rivalPistaBonus && activeMatchDerby) {
      const rKey = (activeMatchDerby.rivalTorcida || "").trim().toUpperCase();
      setRivalPistaBonusMap((prev) => ({
        ...prev,
        [rKey]: (prev[rKey] || 0) + option.rivalPistaBonus!,
      }));
    }

    setHistoryLog((prev) => [
      `[Ano ${season} - Decisão de Temporada] Opção aprovada: ${option.title} (${option.consequencesSummary}).`,
      ...prev,
    ]);

    setActiveMilestoneDecision(null);
  };

  const handleShareHistory = () => {
    const text = `🥁 Minha torcida "${currentTorcida?.torcida}" concluiu os 30 Anos no Bancada: Simulador de Torcida!\n\nTítulo Honorário: ${getHonoraryTitle()}\nContingente: ${stats.contingente}/100 | Pista: ${stats.poder_pista}/100 | Bancada: ${stats.pressao_bancada}/100\nCaixa: R$ ${bankBalance.toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStep = pipeline[pipelineIndex] || pipeline[0];
  const activeActionEvent = actionEvents[pipelineIndex];

  // Dynamic Theme Colors
  const themePrimary = currentTorcida?.primaryColor || primaryColor || "#f59e0b";
  const themeSecondary = currentTorcida?.secondaryColor || secondaryColor || "#18181b";

  // 1. ONBOARDING & SETUP SCREEN
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Full-Screen Watermark Background Image */}
        <div
          className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat z-0 opacity-30 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: "url('/bancada_bg.jpg')",
          }}
        />
        <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-zinc-950/85 via-zinc-950/60 to-zinc-950/95 z-0" />

        {/* Subtle Ambient Background Gradient */}
        <div
          className="fixed inset-0 pointer-events-none opacity-20 blur-3xl z-0"
          style={{
            background: `radial-gradient(circle at 50% 20%, ${primaryColor} 0%, transparent 60%)`,
          }}
        />

        <div className="max-w-md w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-6 shadow-2xl space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg border border-white/10"
              style={{
                backgroundColor: primaryColor,
                color: secondaryColor === "#FFFFFF" ? "#000000" : secondaryColor,
              }}
            >
              <Drum className="w-6 h-6" />
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-center py-2 border-b border-zinc-800/80">
            <img
              src="/bancada_logo.png"
              alt="Bancada Simulator"
              className="w-64 sm:w-80 h-auto mx-auto object-contain filter drop-shadow-[0_10px_20px_rgba(220,38,38,0.45)]"
            />
          </div>

          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
              SIMULADOR DE ARQUIBANCADA • 15 TEMPORADAS
            </span>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Defina as cores do seu pavilhão, cumpra objetivos sazonais (mosaicos, pistas e caravanas) e comande 15 temporadas de história de torcida.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setStartMode("HISTORICA")}
              className={`py-2 px-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                startMode === "HISTORICA"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Assumir Histórica
            </button>
            <button
              type="button"
              onClick={() => setStartMode("CRIAR")}
              className={`py-2 px-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                startMode === "CRIAR"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Fundar Nova
            </button>
          </div>

          {/* COLOR CUSTOMIZATION BAR */}
          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Cores Oficiais do Pavilhão
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full border border-zinc-700 shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                  title="Cor Principal"
                />
                <div
                  className="w-4 h-4 rounded-full border border-zinc-700 shadow-sm"
                  style={{ backgroundColor: secondaryColor }}
                  title="Cor Secundária"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">
                  Cor Principal
                </label>
                <div className="flex items-center gap-2 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[10px] text-zinc-300 font-bold uppercase">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">
                  Cor Secundária
                </label>
                <div className="flex items-center gap-2 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[10px] text-zinc-300 font-bold uppercase">{secondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Quick Palette Swatches */}
            <div className="pt-1">
              <span className="text-[8px] font-bold text-zinc-500 uppercase block mb-1">
                Paletas Clássicas de Arquibancada:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TORCIDA_COLOR_PALETTE.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (primaryColor === p.hex) {
                        setSecondaryColor(p.hex);
                      } else {
                        setPrimaryColor(p.hex);
                      }
                    }}
                    className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[9px] font-bold transition-all cursor-pointer"
                    title={`Clique para aplicar ${p.name}`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: p.hex }} />
                    <span className="text-zinc-400">{p.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {startMode === "HISTORICA" ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                  Selecione a Torcida Oficial
                </label>
                <select
                  value={selectedOfficialTorcidaName}
                  onChange={(e) => setSelectedOfficialTorcidaName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  {officialList.map((t, idx) => (
                    <option key={idx} value={t.torcida}>
                      {t.torcida} ({t.sigla}) • {t.clube} [{t.estado}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Torcida Card Preview */}
              {(() => {
                const current = officialList.find((t) => t.torcida === selectedOfficialTorcidaName) || officialList[0];
                return (
                  <div
                    className="bg-zinc-950 border rounded-2xl p-3.5 space-y-2 relative overflow-hidden"
                    style={{ borderColor: primaryColor + "40" }}
                  >
                    {/* Top Ribbon in Torcida Colors */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                      }}
                    />

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="text-xs font-black text-white">{current.torcida}</h4>
                        <span className="text-[10px] text-zinc-400 block font-medium">{current.clube} • {current.estado} (Tier {current.tier})</span>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        EIXO {current.eixo_alianca}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                      <div className="bg-zinc-900/90 rounded-lg p-1.5 border border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500 uppercase block font-black">Massa</span>
                        <span className="text-xs font-black text-amber-400">{current.contingente}/100</span>
                      </div>
                      <div className="bg-zinc-900/90 rounded-lg p-1.5 border border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500 uppercase block font-black">Pista</span>
                        <span className="text-xs font-black text-amber-400">{current.poder_pista}/100</span>
                      </div>
                      <div className="bg-zinc-900/90 rounded-lg p-1.5 border border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500 uppercase block font-black">Bancada</span>
                        <span className="text-xs font-black text-amber-400">{current.pressao_bancada}/100</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 italic pt-1 border-t border-zinc-900">
                      {current.perfil_predominante}
                    </p>
                  </div>
                );
              })()}

              <button
                onClick={handleStartCareer}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                Assumir Diretoria e Iniciar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                  Nome da Nova Torcida / Dissidência
                </label>
                <input
                  type="text"
                  value={torcidaName}
                  onChange={(e) => setTorcidaName(e.target.value)}
                  placeholder="Ex: Fúria Alvinegra, Coletivo 1910"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                    Sigla Oficial
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={sigla}
                    onChange={(e) => setSigla(e.target.value)}
                    placeholder="Ex: FAN, TTI"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                    Clube de Apoio
                  </label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                  >
                    {mappedClubsList.map((club, idx) => (
                      <option key={idx} value={club}>
                        {club}
                      </option>
                    ))}
                    <option value="OUTRO">Outro Clube Personalizado</option>
                  </select>
                </div>
              </div>

              {selectedClub === "OUTRO" && (
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                    Nome do Clube Personalizado
                  </label>
                  <input
                    type="text"
                    value={customClub}
                    onChange={(e) => setCustomClub(e.target.value)}
                    placeholder="Ex: Operário Ferroviário, Moto Club, Vila Nova"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Realistic Balancing Notice */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-[10px] text-amber-300 leading-snug">
                <span className="font-black uppercase block mb-0.5">⚖️ Balanço Realista de Fundação:</span>
                Como o clube já possui potências hegemônicas, sua nova torcida começa como um coletivo emergente (~400 membros). Cumpra os objetivos sazonais para ganhar espaço e respeito!
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Arquétipo de Fundação
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {Object.values(ARCHETYPES).map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => setSelectedArchetype(arch.id)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                        selectedArchetype === arch.id
                          ? "bg-amber-500 text-black border-amber-500 font-bold shadow-md scale-[1.01]"
                          : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between font-black">
                        <span>{arch.name}</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-80">{arch.subtitle}</span>
                      </div>
                      <p className="text-[10px] opacity-85 mt-0.5 leading-snug">{arch.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartCareer}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                Fundar Torcida e Iniciar Carreira <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. HALL OF FAME & LEGADO DE 15 TEMPORADAS
  if (isGameOver) {
    const totalFaixasTomadas = Object.values(rivalryRecords).reduce((acc, r) => acc + r.faixasTomadas, 0);
    const totalFaixasPerdidas = Object.values(rivalryRecords).reduce((acc, r) => acc + r.faixasPerdidas, 0);

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Full-Screen Watermark Background Image */}
        <div
          className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat z-0 opacity-30 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: "url('/bancada_bg.jpg')",
          }}
        />
        <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-zinc-950/85 via-zinc-950/60 to-zinc-950/95 z-0" />

        <div className="max-w-md w-full bg-zinc-900/90 backdrop-blur-md border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4 max-h-[90vh] overflow-y-auto relative z-10">
          <img
            src="/bancada_logo.png"
            alt="Bancada Simulator Logo"
            className="w-48 sm:w-56 h-auto mx-auto object-contain filter drop-shadow-lg"
          />

          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-xl animate-bounce">
            <Trophy className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block">
              🏆 CARREIRA CONCLUÍDA — 15 TEMPORADAS DE MANDATO
            </span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Hall da Fama & Legado Ultras
            </h2>
            <div className="mt-2 inline-block bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black uppercase">
              {getHonoraryTitle()}
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-left text-xs space-y-2">
            <span className="text-[9px] font-black text-amber-400 uppercase block tracking-wider">
              📊 RESUMO DO LEGADO DA TORCIDA (15 ANOS)
            </span>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 text-[9px] block">Torcida / Clube:</span>
                <span className="font-bold text-white truncate block">{currentTorcida?.torcida}</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 text-[9px] block">Temporadas:</span>
                <span className="font-bold text-amber-400">15 / 15 Concluídas</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 text-[9px] block">Massa / Contingente:</span>
                <span className="font-bold text-amber-400">{stats.contingente}/100</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 text-[9px] block">Pressão de Bancada:</span>
                <span className="font-bold text-orange-400">{stats.pressao_bancada}/100</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 text-[9px] block">Poder de Pista (PEC):</span>
                <span className="font-bold text-red-400">{stats.poder_pista}/100</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 text-[9px] block">Capacidade Caravana:</span>
                <span className="font-bold text-blue-400">{stats.caravana}/100</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 col-span-2">
                <span className="text-zinc-400 text-[9px] block">Patrimônio & Sede:</span>
                <span className="font-bold text-emerald-400 block">
                  Caixa: R$ {bankBalance.toLocaleString()} • {hasOwnHeadquarters ? "🏡 Sede Própria Comprada" : "🏠 Imóvel Alugado"}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 col-span-2">
                <span className="text-zinc-400 text-[9px] block">Desempenho contra Rivais:</span>
                <span className="font-bold text-zinc-200 block">
                  🏴‍☠️ {totalFaixasTomadas} Faixas Tomadas • ⚠️ {totalFaixasPerdidas} Faixas Perdidas
                </span>
              </div>
            </div>
          </div>

          {/* Kavers Games Social Sharing Section */}
          {renderSocialShareSection(
            "LEGADO DE 15 ANOS",
            `👑 [BANCADA SIMULATOR • KAVERS GAMES]\n15 TEMPORADAS DE LEGADO ULTRAS CONCLUÍDAS!\nTorcida: ${currentTorcida?.torcida} (${currentTorcida?.clube})\nTítulo Honorário: ${getHonoraryTitle()}\n\n📊 Resumo do Mandato:\n👥 Massa: ${stats.contingente}/100 | 🥁 Bancada: ${stats.pressao_bancada}/100 | 🥊 Pista: ${stats.poder_pista}/100\n💰 Caixa Final: R$ ${bankBalance.toLocaleString()}\n🏴‍☠️ Troféus de Pista: ${totalFaixasTomadas} Faixas Tomadas!\n\n🎮 Viva essa jornada no Simulador de Torcidas da Kavers Games:\n👉 https://kaversgames.com.br\n#KaversGames #BancadaSimulator #LegadoUltras`
          )}

          <div className="space-y-2 pt-1">
            <button
              onClick={handleRestartGame}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              🔄 Iniciar Nova Carreira de 15 Anos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN GAMEPLAY DASHBOARD
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4 flex flex-col max-w-lg mx-auto relative overflow-x-hidden">
      {/* Floating Instagram Share Toast Notification */}
      {shareToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-pink-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-2xl border border-pink-300 flex items-center gap-2 animate-in fade-in zoom-in-95 max-w-xs text-center">
          <span>📸</span>
          <span>{shareToast}</span>
        </div>
      )}

      {/* Full-Screen Watermark Background Image */}
      <div
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat z-0 opacity-25 mix-blend-luminosity scale-105"
        style={{
          backgroundImage: "url('/bancada_bg.jpg')",
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-950/95 z-0" />

      {/* Subtle Atmospheric Top Glow with Torcida Colors */}
      <div
        className="fixed top-0 left-0 right-0 h-32 pointer-events-none opacity-20 blur-3xl z-0"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${themePrimary} 0%, ${themeSecondary} 50%, transparent 100%)`,
        }}
      />

      {/* Header Bar */}
      <div
        className="bg-zinc-900/95 backdrop-blur border rounded-3xl p-3.5 mb-2.5 shadow-xl relative z-10 overflow-hidden"
        style={{ borderColor: themePrimary + "35" }}
      >
        {/* Subtle dual-color top ribbon */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(to right, ${themePrimary}, ${themeSecondary})`,
          }}
        />

        {/* Top Brand Logo Banner */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800/80">
          <img
            src="/bancada_logo.png"
            alt="Bancada Simulator Logo"
            className="h-7 sm:h-9 w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(220,38,38,0.4)]"
          />
          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700 uppercase">
            {season <= 3 ? "Fase 1: Construção" : season <= 6 ? "Fase 2: Expansão" : season <= 9 ? "Fase 3: Consolidação" : season <= 12 ? "Fase 4: Influência" : "Fase 5: Legado"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            {/* Torcida Flag Icon with Colors */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: themePrimary }} />
              <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: themeSecondary }} />
            </div>

            <div>
              <span className="text-[10px] font-black tracking-wider text-amber-400 uppercase block">
                {currentTorcida?.torcida} • {currentTorcida?.clube}
              </span>
              <h2 className="text-xs font-black text-white uppercase flex items-center gap-1.5 flex-wrap">
                <span>TEMPORADA {season} DE 15 • ETAPA {pipelineIndex + 1}/13</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold block">
                Caixa
              </span>
              <span className={`text-xs font-black ${bankBalance >= 0 ? "text-emerald-400" : "text-red-400 animate-pulse"}`}>
                R$ {bankBalance.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              title="Alternar Som"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <Link
              href="/bancada/minigames"
              className="p-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
              title="Testar Mini-Games Individuais"
            >
              🎮 <span className="hidden sm:inline">Mini-Games</span>
            </Link>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
              title="Voltar ao início / Reiniciar carreira (Ano 1)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          </div>
        </div>
      </div>

      {/* MP Ban Alert Banner */}
      {isBannedByMP && (
        <div className="mb-2.5 p-2.5 rounded-2xl bg-red-600 text-white text-xs font-black text-center shadow-lg animate-pulse flex items-center justify-center gap-2 relative z-10">
          <AlertOctagon className="w-4 h-4" /> BANIDO PELO MP • 1 TEMPORADA SEM FAIXAS & BATERIA
        </div>
      )}

      {/* 5 Vital Attributes */}
      <div className="grid grid-cols-5 gap-1 mb-2 relative z-10">
        <div className="bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 text-center shadow">
          <span className="text-[8px] font-black text-zinc-400 block uppercase truncate">👥 Massa</span>
          <span className="text-xs font-black text-amber-400">{stats.contingente}</span>
        </div>
        <div className="bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 text-center shadow">
          <span className="text-[8px] font-black text-zinc-400 block uppercase truncate">🥁 Bancada</span>
          <span className="text-xs font-black text-orange-400">{stats.pressao_bancada}</span>
        </div>
        <div className="bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 text-center shadow">
          <span className="text-[8px] font-black text-zinc-400 block uppercase truncate">🥊 Pista</span>
          <span className="text-xs font-black text-red-400">{stats.poder_pista}</span>
        </div>
        <div className="bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 text-center shadow">
          <span className="text-[8px] font-black text-zinc-400 block uppercase truncate">🚌 Caravana</span>
          <span className="text-xs font-black text-blue-400">{stats.caravana}</span>
        </div>
        <div className="bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 text-center shadow">
          <span className="text-[8px] font-black text-zinc-400 block uppercase truncate">💰 Finanças</span>
          <span className="text-xs font-black text-emerald-400">{stats.autonomia_financeira}</span>
        </div>
      </div>

      {/* State Trackers */}
      <div className="grid grid-cols-4 gap-1 mb-2.5 relative z-10">
        <div className="bg-zinc-900/70 p-1 rounded-xl border border-zinc-800/80 text-center">
          <span className="text-[7px] font-black text-zinc-400 block uppercase">🔥 Moral</span>
          <span className="text-[11px] font-black text-amber-400">{stateTrackers.moral}%</span>
        </div>
        <div className="bg-zinc-900/70 p-1 rounded-xl border border-zinc-800/80 text-center">
          <span className="text-[7px] font-black text-zinc-400 block uppercase">⚖️ Risco MP</span>
          <span className={`text-[11px] font-black ${stateTrackers.risco_mp > 65 ? "text-red-400 animate-pulse" : "text-zinc-200"}`}>
            {stateTrackers.risco_mp}%
          </span>
        </div>
        <div className="bg-zinc-900/70 p-1 rounded-xl border border-zinc-800/80 text-center">
          <span className="text-[7px] font-black text-zinc-400 block uppercase">🏟️ Clube</span>
          <span className="text-[11px] font-black text-indigo-400">{stateTrackers.relacao_clube}</span>
        </div>
        <div className="bg-zinc-900/70 p-1 rounded-xl border border-zinc-800/80 text-center">
          <span className="text-[7px] font-black text-zinc-400 block uppercase">⭐ Respeito</span>
          <span className="text-[11px] font-black text-purple-400">{stateTrackers.respeito_nacional}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 mb-2.5 relative z-10">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === "pipeline"
              ? "bg-amber-500 text-black shadow-md font-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          <Sparkles className="w-3 h-3" /> Ciclo
        </button>

        <button
          onClick={() => setActiveTab("ranking")}
          className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === "ranking"
              ? "bg-amber-500 text-black shadow-md font-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          <Crown className="w-3 h-3" /> Ranking
        </button>

        <button
          onClick={() => setActiveTab("standings")}
          className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === "standings"
              ? "bg-amber-500 text-black shadow-md font-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          <Trophy className="w-3 h-3" /> Tabela
        </button>

        <button
          onClick={() => setActiveTab("objectives")}
          className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer relative ${
            activeTab === "objectives"
              ? "bg-amber-500 text-black shadow-md font-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          <Target className="w-3 h-3" /> Metas
          {seasonObjectives.some((o) => o.isCompleted) && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-amber-500 text-black shadow-md font-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          <Shield className="w-3 h-3" /> Perfil
        </button>

        <button
          onClick={() => setActiveTab("alliances")}
          className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === "alliances"
              ? "bg-amber-500 text-black shadow-md font-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          <Compass className="w-3 h-3" /> Alianças
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-amber-500 text-black shadow-md font-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          <FileText className="w-3 h-3" /> Crônicas
        </button>
      </div>

      {/* TAB 1: PIPELINE */}
      {activeTab === "pipeline" && currentStep && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl flex-1 flex flex-col justify-between relative z-10">
          <div>
            {/* Mini Season Objectives Progress Bar */}
            {seasonObjectives.length > 0 && (
              <div
                onClick={() => setActiveTab("objectives")}
                className="mb-3 p-2 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-amber-500/50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[9px] font-black text-zinc-300 uppercase">
                    Metas do Ano {season}:
                  </span>
                  <span className="text-[9px] font-bold text-amber-400">
                    {seasonObjectives.filter((o) => o.isCompleted).length}/{seasonObjectives.length} concluídas
                  </span>
                </div>
                <div className="flex gap-1">
                  {seasonObjectives.map((obj, i) => (
                    <span
                      key={i}
                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                        obj.isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                      }`}
                    >
                      {obj.icon}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                ANO {season} • ETAPA {pipelineIndex + 1} DE 13
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase">
                {currentStep.type === "action" ? (currentStep.category || "Ação de Diretoria") : "🔥 Grande Confronto"}
              </span>
            </div>

            <h3 className="text-sm font-black text-white uppercase mb-1">
              {currentStep.title}
            </h3>

            <p className="text-xs text-zinc-300 font-medium leading-relaxed mb-3">
              {currentStep.description}
            </p>
          </div>

          {/* ACTION STEP WITH 4 CHOICES (EACH WITH CLEAR TRADE-OFFS) */}
          {currentStep.type === "action" && activeActionEvent && (
            <div className="space-y-2 mt-auto">
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-1">
                Escolha a Postura da Diretoria (Com Prós e Contras):
              </div>
              {activeActionEvent.choices.map((choice, idx) => (
                <button
                  key={choice.id}
                  onClick={() => handleMakeActionChoice(choice)}
                  className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 text-zinc-100 transition-all active:scale-[0.98] shadow group flex items-start gap-2.5 cursor-pointer"
                >
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-black">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs font-bold leading-tight">{choice.text}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {choice.cost > 0 && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          -R$ {choice.cost.toLocaleString()}
                        </span>
                      )}
                      {choice.formattedDeltas.slice(0, 3).map((d, i) => (
                        <span
                          key={i}
                          className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                            d.isPositive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {d.label}: {d.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* KEY GAME TRIGGER */}
          {currentStep.type === "key_game" && (
            <div className="space-y-3 mt-auto bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-black">
                    <MapPin className="w-4 h-4" />
                    <span>{currentStep.derby?.stadium} ({currentStep.derby?.cityState})</span>
                  </div>
                  {currentStep.derby?.competition && (
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                      {currentStep.derby.competition}
                    </span>
                  )}
                </div>
                <div className="text-zinc-300 font-semibold text-[11px]">
                  {currentStep.derby?.isAllyGame ? (
                    <>
                      🤝 Torcida Aliada / Amizade: <span className="text-emerald-400 font-bold">{currentStep.derby?.rivalTorcida}</span>
                    </>
                  ) : (
                    <>
                      Rival de Pista: <span className="text-red-400 font-bold">{currentStep.derby?.rivalTorcida}</span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  {currentStep.derby?.importanceDescription}
                </p>
              </div>

              <button
                onClick={() => handleStartMatchWorkflow(currentStep)}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                <Swords className="w-4 h-4" /> Iniciar Planejamento Completo do Jogo (Segurança, Condução & Tática)
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OBJECTIVES FOR SEASON */}
      {activeTab === "objectives" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl flex-1 flex flex-col space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-amber-400 uppercase block">PLANEJAMENTO ESTRATÉGICO</span>
              <h3 className="text-sm font-black text-white uppercase">
                Objetivos da Temporada {season}
              </h3>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-zinc-950 text-amber-400 border border-zinc-800">
              {seasonObjectives.filter((o) => o.isCompleted).length}/{seasonObjectives.length} Concluídos
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Metas fixadas pela velha guarda e conselho deliberativo. Conclua os objetivos antes da 13ª etapa para receber bônus de caixa, moral e respeito nacional!
          </p>

          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {seasonObjectives.map((obj) => (
              <div
                key={obj.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  obj.isCompleted
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-md"
                    : "bg-zinc-950 border-zinc-800 text-zinc-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{obj.icon}</span>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase">{obj.title}</h4>
                      <span className="text-[9px] font-bold text-amber-400/90 uppercase">{obj.category}</span>
                    </div>
                  </div>
                  {obj.isCompleted ? (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> CUMPRIDO
                    </span>
                  ) : (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
                      EM PROGRESSO
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">
                  {obj.description}
                </p>

                {/* Progress Tracking */}
                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-bold">
                    Progresso: <strong className="text-white">{obj.currentValue}</strong> / {obj.targetValue} {obj.targetUnit}
                  </span>
                  <span className="font-bold text-amber-400">
                    Recompensa: {obj.rewardText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: RANKING NACIONAL DE TORCIDAS */}
      {activeTab === "ranking" && currentTorcida && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                PODER NACIONAL DE ARQUIBANCADA (58 TORCIDAS)
              </span>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" /> Ranking Nacional de Torcidas
              </h3>
            </div>
            {(() => {
              const ranking = simulateNationalRanking(currentTorcida, stats, stateTrackers, season);
              const playerEntry = ranking.find((r) => r.isPlayer);
              return (
                <div className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-2xl text-center">
                  <span className="text-[8px] font-bold uppercase block text-zinc-400">Sua Posição</span>
                  <span className="text-sm font-black">#{playerEntry?.rank || "-"}º Lugar</span>
                </div>
              );
            })()}
          </div>

          {/* DIPLOMACY CENTRAL GUIDANCE BANNER */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span className="text-amber-300 font-medium text-[11px] leading-snug">
                <strong>Central Diplomática:</strong> Clique em qualquer uma das <strong>58 torcidas</strong> abaixo para ver seu perfil completo, retrospecto histórico e abrir negociações diplomáticas (Pacto de Paz, Treta, Resgate de Faixa, etc.).
              </span>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
            {simulateNationalRanking(currentTorcida, stats, stateTrackers, season).map((entry) => (
              <button
                key={entry.rank}
                type="button"
                onClick={() => {
                  if (!entry.isPlayer) {
                    setSelectedTorcidaForDiplomacy(entry.officialRef);
                    setDiplomacyFeedback(null);
                  }
                }}
                className={`w-full p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  entry.isPlayer
                    ? "bg-amber-500/15 border-amber-500 text-white font-black shadow-md scale-[1.01]"
                    : "bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:border-amber-500/60 hover:bg-zinc-900 cursor-pointer group"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${
                      entry.rank === 1
                        ? "bg-amber-500 text-black shadow-sm"
                        : entry.rank === 2
                        ? "bg-zinc-300 text-black"
                        : entry.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <div className="text-left">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{entry.torcida}</span>
                      {entry.isPlayer ? (
                        <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded text-[8px] font-black uppercase">
                          VOCÊ
                        </span>
                      ) : (
                        <span className="bg-zinc-900 group-hover:bg-amber-500/20 text-zinc-400 group-hover:text-amber-400 border border-zinc-800 group-hover:border-amber-500/40 px-1.5 py-0.2 rounded text-[8px] font-bold uppercase transition-all">
                          🤝 Diplomacia
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-500 block">
                      {entry.clube} • UF: {entry.estado} [{entry.tier}]
                    </span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2.5">
                  <div>
                    <span className="text-xs font-black text-amber-400 block">{entry.powerScore} pts</span>
                    {entry.rankChange !== 0 && (
                      <span className={`text-[8px] font-bold ${entry.rankChange > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {entry.rankChange > 0 ? `▲ +${entry.rankChange}` : `▼ ${entry.rankChange}`}
                      </span>
                    )}
                  </div>
                  {!entry.isPlayer && (
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-all shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB: TABELA DO CAMPEONATO (STANDINGS) */}
      {activeTab === "standings" && currentTorcida && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">
                SITUAÇÃO DO TIME NO CAMPEONATO
              </span>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-indigo-400" /> Tabela de Classificação do {currentTorcida.clube}
              </h3>
            </div>
            <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-1 rounded-2xl text-[10px] font-black uppercase">
              Ano {season}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
            <div className="grid grid-cols-12 text-[8px] font-black text-zinc-500 uppercase px-2 py-1 border-b border-zinc-800">
              <span className="col-span-1">Pos</span>
              <span className="col-span-5">Clube</span>
              <span className="col-span-2 text-center">Pts</span>
              <span className="col-span-1 text-center">J</span>
              <span className="col-span-1 text-center">V</span>
              <span className="col-span-2 text-center">SG</span>
            </div>

            {generateLeagueTable(currentTorcida.clube, season, Math.min(38, pipelineIndex * 3 + 12)).map((entry) => (
              <div
                key={entry.position}
                className={`grid grid-cols-12 items-center p-2 rounded-xl text-xs transition-all ${
                  entry.isPlayerClub
                    ? "bg-indigo-500/20 border border-indigo-500/60 text-white font-black shadow-md scale-[1.01]"
                    : "bg-zinc-950/70 border border-zinc-800/60 text-zinc-300"
                }`}
              >
                <span
                  className={`col-span-1 text-[10px] font-black ${
                    entry.zone === "LIBERTADORES"
                      ? "text-emerald-400"
                      : entry.zone === "SULAMERICANA"
                      ? "text-blue-400"
                      : entry.zone === "REBAIXAMENTO"
                      ? "text-red-400"
                      : "text-zinc-500"
                  }`}
                >
                  {entry.position}º
                </span>

                <span className="col-span-5 font-bold truncate flex items-center gap-1">
                  {entry.club}
                  {entry.isPlayerClub && (
                    <span className="bg-indigo-500 text-white px-1 rounded text-[7px] font-black uppercase">
                      MEU TIME
                    </span>
                  )}
                </span>

                <span className="col-span-2 text-center font-black text-amber-400">{entry.points}</span>
                <span className="col-span-1 text-center text-zinc-400 text-[10px]">{entry.played}</span>
                <span className="col-span-1 text-center text-emerald-400 text-[10px]">{entry.won}</span>
                <span className="col-span-2 text-center text-[10px] font-mono">{entry.gd > 0 ? `+${entry.gd}` : entry.gd}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[8px] text-zinc-400 pt-1 border-t border-zinc-800">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 block" /> G-6 Libertadores</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 block" /> Sul-Americana</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 block" /> Z-4 Rebaixamento</span>
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE */}
      {activeTab === "profile" && currentTorcida && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3 relative z-10">
          <div>
            <span className="text-[9px] font-black text-amber-400 uppercase block">CADASTRO DA TORCIDA</span>
            <h3 className="text-base font-black text-white uppercase">
              {currentTorcida.torcida}
            </h3>
            <span className="text-xs text-zinc-400 font-semibold">
              Clube: {currentTorcida.clube} • Estado: {currentTorcida.estado} • Tier: {currentTorcida.tier}
            </span>
          </div>

          {/* Color Badges */}
          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300">Cores do Pavilhão:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: themePrimary }} />
                <span className="font-mono text-[10px] text-zinc-400">{themePrimary}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: themeSecondary }} />
                <span className="font-mono text-[10px] text-zinc-400">{themeSecondary}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
            <span className="font-bold text-amber-400 block uppercase text-[10px]">Identidade & Perfil:</span>
            <p className="text-zinc-300">{currentTorcida.perfil_predominante}</p>
          </div>

          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
            <span className="font-bold text-amber-400 block uppercase text-[10px]">Eixo Geopolítico:</span>
            <span className="font-black text-white">{currentTorcida.eixo_alianca}</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
            <span className="font-bold text-amber-400 block uppercase text-[10px]">Os 4 Grandes Jogos da Temporada:</span>
            <ul className="space-y-1.5 text-zinc-300 text-[11px]">
              {pipeline
                .filter((p) => p.type === "key_game")
                .map((kg, idx) => (
                  <li key={idx} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="font-bold text-amber-400 block">{kg.title}</span>
                    <span className="text-zinc-400 text-[10px]">{kg.derby?.stadium}</span>
                  </li>
                ))}
            </ul>
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block text-xs flex items-center gap-1.5 text-amber-400">
                <Download className="w-3.5 h-3.5" /> Baixar Código para o Localhost
              </span>
              <span className="text-[10px] text-zinc-400">Download do projeto completo atualizado em arquivo .ZIP</span>
            </div>
            <button
              onClick={handleDownloadProjectZip}
              disabled={isDownloadingZip}
              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
            >
              {isDownloadingZip ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isDownloadingZip ? "Baixando..." : "Baixar ZIP"}
            </button>
          </div>

          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block text-xs">Reiniciar Carreira</span>
              <span className="text-[10px] text-zinc-400">Voltar para o Ano 1 e escolher uma nova torcida</span>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Voltar ao Início
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: ALLIANCES & RIVALRY TROPHIES */}
      {activeTab === "alliances" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3 relative z-10">
          <div>
            <span className="text-[9px] font-black text-amber-400 uppercase block">GEOPOLÍTICA DE ARQUIBANCADA</span>
            <h3 className="text-sm font-black text-white uppercase">Eixos Nacionais e Alianças de Pista</h3>
          </div>

          <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
            {Object.entries((alliances as any).eixos_nacionais).map(([key, axis]: [string, any]) => (
              <div key={key} className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between font-black text-amber-400">
                  <span>{axis.symbol} {axis.name}</span>
                  <span className="text-[9px] text-zinc-500 uppercase">{key}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {axis.members.map((m: string, idx: number) => {
                    const matchingTorcida = officialList.find(
                      (t) => t.torcida.toLowerCase() === m.toLowerCase() || t.clube.toLowerCase() === m.toLowerCase()
                    );
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (matchingTorcida && matchingTorcida.clube !== currentTorcida?.clube) {
                            setSelectedTorcidaForDiplomacy(matchingTorcida);
                            setDiplomacyFeedback(null);
                          }
                        }}
                        className="bg-zinc-900 hover:border-amber-500/50 border border-zinc-800 px-2 py-0.5 rounded-lg text-[9px] text-zinc-300 font-semibold cursor-pointer"
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* TROFÉUS DE PISTA & HISTÓRICO DE RIVALIDADES */}
          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                🏆 ARMÁRIO DE TROFÉUS & HISTÓRICO DE RIVALIDADES
              </span>
              <span className="text-[9px] text-zinc-500 font-bold">
                {Object.keys(rivalryRecords).length} Rivais Enfrentados
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[8px] font-black text-emerald-400 block uppercase">Faixas Tomadas</span>
                <span className="text-base font-black text-emerald-400">
                  🏴‍☠️ {Object.values(rivalryRecords).reduce((acc, r) => acc + r.faixasTomadas, 0)}
                </span>
                <span className="text-[8px] text-emerald-400/80 block font-bold">+2 Moral Permanente</span>
              </div>

              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30">
                <span className="text-[8px] font-black text-red-400 block uppercase">Faixas Perdidas</span>
                <span className="text-base font-black text-red-400">
                  ⚠️ {Object.values(rivalryRecords).reduce((acc, r) => acc + r.faixasPerdidas, 0)}
                </span>
                <span className="text-[8px] text-red-400/80 block font-bold">-2 Moral Permanente</span>
              </div>

              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <span className="text-[8px] font-black text-blue-400 block uppercase">Jogos da Paz</span>
                <span className="text-base font-black text-blue-400">
                  🕊️ {Object.values(rivalryRecords).reduce((acc, r) => acc + r.jogosDaPaz, 0)}
                </span>
                <span className="text-[8px] text-blue-400/80 block font-bold">Sem Incidentes</span>
              </div>
            </div>

            {Object.keys(rivalryRecords).length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 pt-1">
                {Object.values(rivalryRecords).map((rec, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{rec.rivalTorcida}</span>
                      <span className="text-[9px] text-zinc-400">
                        {rec.totalConfrontos} jogos • {rec.vitoriasPista} vitórias • {rec.derrotasPista} derrotas • {rec.jogosDaPaz} paz
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black">
                      {rec.faixasTomadas > 0 && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                          +{rec.faixasTomadas} Faixas
                        </span>
                      )}
                      {rec.faixasPerdidas > 0 && (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded">
                          -{rec.faixasPerdidas} Perdid.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CHRONICLES & SCORE HISTORY */}
      {activeTab === "history" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl flex-1 flex flex-col space-y-3 relative z-10">
          <div className="text-xs text-zinc-400 font-black uppercase tracking-wider flex items-center justify-between">
            <span>Histórico de Evolução & Crônicas</span>
            <span className="text-[10px] text-amber-400">{historyLog.length} eventos</span>
          </div>

          {/* SEASON EVOLUTION SCORE HISTORY TABLE */}
          {seasonHistory.length > 0 && (
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-amber-400 uppercase">
                  📈 EVOLUÇÃO DA TORCIDA (ANO A ANO)
                </span>
                <span className="text-[9px] font-bold text-zinc-400">
                  {seasonHistory.length} Anos Registrados
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {seasonHistory.map((rec) => (
                  <div
                    key={rec.season}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-amber-400 flex items-center gap-1.5">
                        <span>Ano {rec.season}</span>
                        <span className="text-[9px] text-zinc-400 font-normal">
                          (R$ {rec.bankBalance.toLocaleString()})
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-400 block mt-0.5">
                        Massa: {rec.contingente} • Bancada: {rec.pressaoBancada} • Pista: {rec.poderPista} • Moral: {rec.moral}%
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 block">{rec.powerScore} pts</span>
                      <span className="text-[9px] font-bold text-amber-300 block">
                        #{rec.rankPosition}º Lugar Nacional
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto space-y-2 text-xs font-semibold text-left pr-1">
            {historyLog.length > 0 ? (
              historyLog.map((log, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/90 text-zinc-300 leading-relaxed text-[11px]"
                >
                  {log}
                </div>
              ))
            ) : (
              <div className="text-zinc-500 text-center py-8">
                Nenhum registro histórico registrado ainda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODALS */}
      {/* ---------------------------------------------------- */}

      {/* ANIMATED BATTLE CONFRONTATION MODAL (HEALTH / POWER BARS) */}
      {isBattleAnimating && activeMatchDerby && activeScoutIntel && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 animate-pulse" />

            <div className="space-y-1">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                ⚡ CONFRONTO TÁTICO DE PISTA EM TEMPO REAL
              </span>
              <h3 className="text-base font-black text-white uppercase">
                {activeMatchDerby.matchTitle}
              </h3>
              <span className="text-xs text-zinc-400 font-bold block">
                {activeMatchDerby.stadium} ({activeMatchDerby.cityState})
              </span>
            </div>

            {/* DUAL HEALTH / POWER BARS */}
            <div className="space-y-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              {/* Player Torcida Power Bar */}
              <div>
                <div className="flex justify-between text-xs font-black mb-1">
                  <span className="text-emerald-400">{currentTorcida?.torcida} (Sua Torcida)</span>
                  <span className="text-white">{stats.poder_pista + (selectedTransport?.pistaBonus || 0)} pts</span>
                </div>
                <div className="w-full bg-zinc-800 h-4 rounded-full overflow-hidden p-0.5 border border-zinc-700">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${Math.min(100, (battleProgress / 100) * ((stats.poder_pista + (selectedTransport?.pistaBonus || 0)) / 1.2))}%` }}
                  />
                </div>
              </div>

              <div className="text-xs font-black text-amber-400 animate-bounce py-1">
                ⚔️ VS ⚔️
              </div>

              {/* Rival Torcida Power Bar */}
              <div>
                <div className="flex justify-between text-xs font-black mb-1">
                  <span className="text-red-400">{activeMatchDerby.rivalTorcida} (Rival)</span>
                  <span className="text-white">{Math.floor(activeScoutIntel.rivalMembersWaiting / 20)} pts</span>
                </div>
                <div className="w-full bg-zinc-800 h-4 rounded-full overflow-hidden p-0.5 border border-zinc-700">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${Math.min(100, (battleProgress / 100) * ((Math.floor(activeScoutIntel.rivalMembersWaiting / 20)) / 1.2))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <div className="text-xs font-bold text-amber-300 animate-pulse">
              {battleProgress < 30
                ? "🥁 Baterias em deslocamento... Comboios aproximando-se do estádio!"
                : battleProgress < 70
                ? "🔥 Pista em ebulição! Linhas de frente em choque direto!"
                : "⚡ Pressão de bancada ao máximo! Calculando o vencedor da batalha!"}
            </div>
          </div>
        </div>
      )}

      {/* 1. ACTION FEEDBACK MODAL */}
      {actionFeedback && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <span className="text-[9px] font-black text-amber-400 uppercase block">DESFECHO DA DECISÃO</span>
            <h3 className="text-sm font-black text-white uppercase">
              {actionFeedback.title}
            </h3>

            <p className="text-xs text-zinc-300 font-medium leading-relaxed bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
              {actionFeedback.logText}
            </p>

            <div className="space-y-1.5 text-left bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800">
              <span className="text-[9px] font-black text-amber-400 uppercase block">Impacto nos Indicadores:</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-black">
                {actionFeedback.deltas.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-400 font-medium text-[9px] truncate mr-1">{d.label}</span>
                    <span className={`text-[10px] ${d.isPositive ? "text-emerald-400" : "text-red-400"}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmFeedback}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Avançar Etapa
            </button>
          </div>
        </div>
      )}

      {/* 2. KEY GAME STAGE 1: REUNIÃO COM A POLÍCIA & SEGURANÇA */}
      {matchModalPhase === "POLICE_MEETING" && activeMatchDerby && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-blue-500/50 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> FASE 1: REUNIÃO DE SEGURANÇA & POLÍCIA
              </span>
              <button
                onClick={() => setMatchModalPhase("CLOSED")}
                className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-black text-white uppercase">
                {activeMatchDerby.matchTitle}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Alinhamento pré-jogo com o Batalhão de Choque / PM Regional para entrada de faixas, bateria e escolta.
              </p>
            </div>

            <div className="text-xs text-zinc-300 font-bold">
              Qual será a postura da diretoria na reunião de segurança?
            </div>

            <div className="space-y-2">
              {getPoliceMeetingChoices(activeMatchDerby, isInteriorSP(currentTorcida)).map((pChoice) => (
                <button
                  key={pChoice.id}
                  onClick={() => handleSelectPoliceChoice(pChoice)}
                  className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-blue-500 transition-all active:scale-[0.98] shadow cursor-pointer group"
                >
                  <div className="flex items-center justify-between font-black text-xs text-white group-hover:text-blue-400">
                    <span>{pChoice.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 uppercase">
                      {pChoice.stance}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
                    {pChoice.description}
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-1 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 text-[9px] font-black">
                    {pChoice.formattedDeltas.map((d, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-zinc-400">{d.label}:</span>
                        <span className={d.isPositive ? "text-emerald-400" : "text-red-400"}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. KEY GAME STAGE 2: ESCOLHA DE TRANSPORTE & CONDUÇÃO */}
      {matchModalPhase === "TRANSPORT" && activeMatchDerby && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <Bus className="w-3.5 h-3.5" /> FASE 2: {activeMatchDerby.isHome ? "CONCENTRAÇÃO & POSICIONAMENTO LOCAL" : "CONDUÇÃO & TRANSPORTE"}
              </span>
              <button
                onClick={() => setMatchModalPhase("CLOSED")}
                className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-black text-white uppercase">
                {activeMatchDerby.matchTitle}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Estádio: {activeMatchDerby.stadium} • {activeMatchDerby.isAllyGame ? "Torcida Aliada:" : "Rival:"} {activeMatchDerby.rivalTorcida}
              </p>
            </div>

            <div className="text-xs text-zinc-300 font-bold">
              {activeMatchDerby.isHome
                ? "Selecione a Estratégia de Concentração da Torcida no Nosso Estádio:"
                : "Selecione o Meio de Transporte e Condução da Massa:"}
            </div>

            <div className="space-y-2">
              {getTransportOptions(activeMatchDerby.isLongDistance, isInteriorSP(currentTorcida), activeMatchDerby.isHome).map((tOption) => (
                <button
                  key={tOption.id}
                  onClick={() => handleSelectTransport(tOption)}
                  className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 transition-all active:scale-[0.98] shadow cursor-pointer group"
                >
                  <div className="flex items-center justify-between font-black text-xs text-white group-hover:text-amber-400">
                    <span>{tOption.name}</span>
                    <span className="text-[9px] text-zinc-400">{tOption.speed}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
                    {tOption.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[9px] font-bold">
                    <span className="text-emerald-400">
                      Capacidade: x{tOption.capacityMultiplier} membros
                    </span>
                    <span className={tOption.fixedCost > 0 ? "text-red-400 font-black" : "text-emerald-400"}>
                      {tOption.fixedCost > 0 ? `Custo: R$ ${tOption.fixedCost.toLocaleString()}` : "Custo Gratuito (R$ 0)"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. KEY GAME STAGE 3: SCOUT INTEL & REVELATION OF TWIST */}
      {matchModalPhase === "SCOUT_INTEL" && activeMatchDerby && activeScoutIntel && selectedTransport && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
              <Radio className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                RELATÓRIO DOS ANTENAS EM TEMPO REAL
              </span>
              <h3 className="text-sm font-black text-white uppercase">
                Estimativa de Forças & Inteligência de Pista
              </h3>
            </div>

            {/* Attendance & Numbers Grid */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-left">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[8px] font-black text-zinc-400 block uppercase">Nossa Tropa</span>
                <span className="text-xs font-black text-amber-400">
                  ~{activeScoutIntel.playerMembersPresent.toLocaleString()}
                </span>
                <span className="text-[8px] text-zinc-500 block">membros presentes</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[8px] font-black text-zinc-400 block uppercase">
                  {activeMatchDerby.isAllyGame ? "Irmãos da Aliada" : "Rival Esperando"}
                </span>
                <span className={`text-xs font-black ${activeMatchDerby.isAllyGame ? "text-emerald-400" : "text-red-400"}`}>
                  ~{activeScoutIntel.rivalMembersWaiting.toLocaleString()}
                </span>
                <span className="text-[8px] text-zinc-400 font-bold block">{activeMatchDerby.rivalTorcida}</span>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[8px] font-black text-zinc-400 block uppercase">Btl. Choque</span>
                <span className={`text-[10px] font-black ${activeScoutIntel.policePresence === "PACIFICA" ? "text-emerald-400" : "text-blue-400"}`}>
                  {activeScoutIntel.policePresence}
                </span>
                <span className="text-[8px] text-zinc-500 block">fiscalização</span>
              </div>
            </div>

            {/* Twist Box */}
            <div className={`${activeMatchDerby.isAllyGame ? "bg-emerald-950/40 border-emerald-500/50" : "bg-red-950/40 border-red-500/50"} border p-3.5 rounded-2xl text-left space-y-1`}>
              <div className={`flex items-center gap-1.5 text-xs font-black ${activeMatchDerby.isAllyGame ? "text-emerald-400" : "text-red-400"} uppercase`}>
                {activeMatchDerby.isAllyGame ? <Drum className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{activeScoutIntel.twistTitle}</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                {activeScoutIntel.twistDescription}
              </p>
            </div>

            <button
              onClick={handleProceedToTacticalChoices}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              {activeMatchDerby.isAllyGame ? "Definir Postura na Confraternização (5 Opções)" : "Definir Tática de Confronto (5 Opções)"} <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>
        </div>
      )}

      {/* 5. KEY GAME STAGE 4: 5 TACTICAL CHOICES (INCLUDING MOSAIC) */}
      {matchModalPhase === "TACTICAL" && activeMatchDerby && activeScoutIntel && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                {activeMatchDerby.isAllyGame ? "FESTA & CONFRATERNIZAÇÃO DE IRMANDADE" : "DECISÃO TÁTICA DE PISTA & BANCADA"}
              </span>
              <span className="text-[9px] text-zinc-400">
                {activeScoutIntel.playerMembersPresent} vs {activeScoutIntel.rivalMembersWaiting}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-black text-white uppercase">
                {activeMatchDerby.isAllyGame
                  ? "Qual será a ação da torcida durante a recepção e o jogo com a aliada?"
                  : "Qual será a tática adotada nos arredores e dentro do estádio?"}
              </h3>
            </div>

            <div className="space-y-2">
              {getTacticalBattleChoices(activeScoutIntel, activeMatchDerby).map((tactic) => (
                <button
                  key={tactic.id}
                  onClick={() => handleExecuteTacticalChoice(tactic)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all active:scale-[0.98] shadow cursor-pointer group ${
                    tactic.isMosaicTactic
                      ? "bg-amber-950/40 border-amber-500/60 hover:border-amber-400"
                      : "bg-zinc-950 border-zinc-800 hover:border-amber-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white group-hover:text-amber-400">
                      {tactic.title}
                    </span>
                    {tactic.isMosaicTactic && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-black">
                        🎨 META MOSAICO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
                    {tactic.description}
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-1 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 text-[9px] font-black">
                    {tactic.formattedDeltas.map((d, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-zinc-400">{d.label}:</span>
                        <span className={d.isPositive ? "text-emerald-400" : "text-red-400"}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5.B. MINI-GAME RESOLUTION MODAL */}
      {matchModalPhase === "MINIGAME" && activeMatchMiniGameContext && activeMatchDerby && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 text-center">
            <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block text-left">
                  🎮 MINI-GAME TÁTICO DE CONFRONTO DE BANCADA
                </span>
                <h3 className="text-xs font-black text-white uppercase text-left mt-0.5">
                  {activeMatchDerby.matchTitle}
                </h3>
              </div>
              <button
                onClick={() => setMatchModalPhase("CLOSED")}
                className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <MatchTacticalResolver
              context={activeMatchMiniGameContext}
              onMatchComplete={handleMatchMiniGameComplete}
            />
          </div>
        </div>
      )}

      {/* 6. MATCH RESULT & GEMINI CHRONICLE MODAL */}
      {activeMatchResult && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-5 text-center shadow-2xl space-y-3 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveMatchResult(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[9px] font-black text-amber-400 uppercase block">RELATÓRIO PÓS-JOGO</span>
            <h3 className="text-sm font-black text-white uppercase">
              {activeMatchResult.statusTitle}
            </h3>

            {/* Deltas & Outcome */}
            <div className="grid grid-cols-2 gap-1.5 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 text-left text-xs font-bold">
              {activeMatchResult.formattedDeltas.map((d, idx) => (
                <div key={idx}>
                  <span className="text-[8px] text-zinc-400 block font-black uppercase">{d.label}</span>
                  <span className={`text-[11px] ${d.isPositive ? "text-emerald-400" : "text-red-400"}`}>{d.value}</span>
                </div>
              ))}
            </div>

            {/* Narrative AI Chronicle */}
            <div className="text-left bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-xs text-zinc-300 font-medium leading-relaxed max-h-44 overflow-y-auto">
              <span className="text-[9px] font-black text-amber-400 block mb-1 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Crônica de Arquibancada:
              </span>
              {isGeneratingChronicle ? (
                <div className="text-amber-400/80 animate-pulse text-xs py-2">
                  Redigindo crônica visceral dos acontecimentos...
                </div>
              ) : (
                activeMatchResult.chronicleText
              )}
            </div>

            {/* Kavers Games Social Sharing Block */}
            {renderSocialShareSection(
              "RESULTADO DO JOGO",
              `🥁 [BANCADA SIMULATOR • KAVERS GAMES]\n${activeMatchResult.statusTitle} - ${currentTorcida?.torcida} vs ${activeMatchDerby?.rivalTorcida || "Rival"}!\nEstádio: ${activeMatchDerby?.stadium || "Estádio"}\n\n"Crônica de Arquibancada: ${activeMatchResult.chronicleText.slice(0, 160)}..."\n\n🎮 Jogue grátis o Simulador de Torcidas da Kavers Games:\n👉 https://kaversgames.com.br\n#BancadaSimulator #KaversGames #TorcidasOrganizadas`
            )}

            <button
              onClick={() => setActiveMatchResult(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Continuar Carreira
            </button>
          </div>
        </div>
      )}

      {/* 7. SEASON END OBJECTIVES CELEBRATION MODAL */}
      {seasonEndReport && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-emerald-500/50 rounded-3xl max-w-md w-full p-5 text-center shadow-2xl space-y-3.5 relative max-h-[90vh] overflow-y-auto">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">
                FECHAMENTO DA TEMPORADA {season - 1}
              </span>
              <h3 className="text-base font-black text-white uppercase">
                Balanço de Metas e Recompensas
              </h3>
            </div>

            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-zinc-400">Metas Cumpridas:</span>
                <span className="text-emerald-400">{seasonEndReport.completedCount} concluídas</span>
              </div>
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-zinc-400">Bônus Financeiro:</span>
                <span className="text-emerald-400">+R$ {seasonEndReport.totalCashBonus.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-zinc-400">Moral da Bancada:</span>
                <span className="text-amber-400">+{seasonEndReport.totalMoralBonus} pts</span>
              </div>
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-zinc-400">Respeito Nacional:</span>
                <span className="text-purple-400">+{seasonEndReport.totalRespeitoBonus} pts</span>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-left text-[11px] space-y-1.5 max-h-36 overflow-y-auto">
              {seasonEndReport.logs.map((log, idx) => (
                <div key={idx} className="text-zinc-300 font-medium">
                  {log}
                </div>
              ))}
            </div>

            {/* Kavers Games Social Sharing Block */}
            {renderSocialShareSection(
              `TEMPORADA ${season - 1}`,
              `🏆 [BANCADA SIMULATOR • KAVERS GAMES]\nFechamento da Temporada ${season - 1} com a ${currentTorcida?.torcida} (${currentTorcida?.clube})!\n\nMetas Cumpridas: ${seasonEndReport.completedCount}\nMassa: ${stats.contingente}/100 | Bancada: ${stats.pressao_bancada}/100 | Pista: ${stats.poder_pista}/100\nCaixa Acumulado: R$ ${bankBalance.toLocaleString()}\n\n🎮 Monte sua torcida no Simulador Oficial Kavers Games:\n👉 https://kaversgames.com.br\n#BancadaSimulator #KaversGames #Futebol`
            )}

            <button
              onClick={() => setSeasonEndReport(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Iniciar Temporada {season}
            </button>
          </div>
        </div>
      )}

      {/* 7.B. SEASONAL MILESTONE DECISION MODAL (SEASONS 3, 6, 9, 12, 15) */}
      {activeMilestoneDecision && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 text-center max-h-[90vh] overflow-y-auto relative">
            <div className="border-b border-zinc-800 pb-3 text-left">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                {activeMilestoneDecision.title}
              </span>
              <h3 className="text-sm font-black text-white uppercase mt-0.5">
                {activeMilestoneDecision.subtitle}
              </h3>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-2xl text-left space-y-1.5">
              <span className="text-xs font-black text-amber-300 block">
                {activeMilestoneDecision.newsHeadline}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                {activeMilestoneDecision.narrativeText}
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block text-left">
                Selecione a Rota Estratégica da Torcida (Escolha 1 de 3):
              </span>

              {activeMilestoneDecision.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectMilestoneOption(opt)}
                  className="w-full text-left p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 transition-all active:scale-[0.98] shadow-lg group cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white group-hover:text-amber-400">
                      {opt.title}
                    </span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-snug">
                    {opt.description}
                  </p>
                  <div className="text-[9px] font-black text-emerald-400 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                    Impacto: {opt.consequencesSummary}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Voltar ao Começo?
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Seu progresso atual no <strong className="text-amber-400">Ano {season}</strong> será resetado e você voltará para a tela inicial para escolher ou fundar uma torcida no <strong className="text-emerald-400">Ano 1</strong>.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleRestartGame}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Sim, Voltar ao Ano 1
              </button>

              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. ALLIED INVASION INVITE MODAL */}
      {alliedInvasionInvite && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse border border-amber-500/30">
              <Compass className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                📢 CONVOCAÇÃO DA TORCIDA ALIADA DO EIXO
              </span>
              <h3 className="text-sm font-black text-white uppercase mt-0.5">
                Invasão Conjunta no Território Rival!
              </h3>
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 text-left space-y-2 text-xs">
              <p className="text-zinc-300 leading-relaxed">
                A torcida aliada <strong className="text-amber-400">{alliedInvasionInvite.allyTorcida}</strong> ({alliedInvasionInvite.allyClub}) está descendo em caravana pesada para a região de {alliedInvasionInvite.city} para enfrentar o rival <strong className="text-red-400">{alliedInvasionInvite.targetRivalClub}</strong> ({alliedInvasionInvite.targetRivalTorcida}) no {alliedInvasionInvite.stadium}.
              </p>
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 italic text-[11px] text-zinc-400">
                "Irmãos, estamos descendo com comitiva de vários ônibus. Convocamos a linha de frente de vocês para somar no nosso setor visitante!"
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-black pt-1">
              <button
                onClick={handleAcceptAlliedInvasionInvite}
                className="py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow cursor-pointer uppercase flex items-center justify-center gap-1 text-[11px]"
              >
                🚌 Somar no Bonde (R$ 4k)
              </button>

              <button
                onClick={handleRejectAlliedInvasionInvite}
                className="py-3 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer uppercase flex items-center justify-center gap-1 text-[11px]"
              >
                🏠 Ficar na Sede (-3 Moral)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9.B. ALLIANCE DIPLOMATIC PROPOSAL MODAL */}
      {allianceProposalInvite && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-blue-500/50 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">
                🤝 REUNIÃO DIPLOMÁTICA & PEDIDO DE AMIZADE
              </span>
              <h3 className="text-sm font-black text-white uppercase mt-0.5">
                Proposta de União com a {allianceProposalInvite.proposingTorcida}
              </h3>
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 text-left space-y-2 text-xs">
              <p className="text-zinc-300 leading-relaxed">
                {allianceProposalInvite.narrative}
              </p>
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 italic text-[11px] text-zinc-400">
                "Como vocês atuam de forma independente, gostaríamos de agendar um churrasco na sede de vocês para discutir um pacto de amizade, união e apoio mútuo em caravanas."
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-black pt-1">
              <button
                onClick={handleAcceptAllianceProposal}
                className="py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow cursor-pointer uppercase flex items-center justify-center gap-1 text-[11px]"
              >
                🤝 Aceitar & Selar Amizade (R$ 3k)
              </button>

              <button
                onClick={handleDeclineAllianceProposal}
                className="py-3 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer uppercase flex items-center justify-center gap-1 text-[11px]"
              >
                🚫 Manter Independência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. INTERACTIVE TORCIDA PROFILE & DIPLOMACY MODAL */}
      {selectedTorcidaForDiplomacy && currentTorcida && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                  DIPLOMACIA DE ARQUIBANCADA
                </span>
                <h3 className="text-base font-black text-white uppercase">
                  {selectedTorcidaForDiplomacy.torcida}
                </h3>
                <span className="text-[10px] text-zinc-400">
                  {selectedTorcidaForDiplomacy.clube} • {selectedTorcidaForDiplomacy.estado} (Tier {selectedTorcidaForDiplomacy.tier})
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedTorcidaForDiplomacy(null);
                  setDiplomacyFeedback(null);
                }}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-black cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Relationship Badge */}
            {(() => {
              const isAlly = selectedTorcidaForDiplomacy.eixo_alianca === currentTorcida.eixo_alianca;
              const isSameState = selectedTorcidaForDiplomacy.estado === currentTorcida.estado;
              const rec = rivalryRecords[selectedTorcidaForDiplomacy.torcida];

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400">Status Geopolítico:</span>
                    {isAlly ? (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-xs font-black uppercase flex items-center gap-1">
                        🤝 Torcida Aliada (Eixo {selectedTorcidaForDiplomacy.eixo_alianca})
                      </span>
                    ) : isSameState ? (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-1 rounded-xl text-xs font-black uppercase flex items-center gap-1">
                        ⚔️ Rival de Pista ({selectedTorcidaForDiplomacy.estado})
                      </span>
                    ) : (
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2.5 py-1 rounded-xl text-xs font-black uppercase flex items-center gap-1">
                        🏳️ Torcida Neutra
                      </span>
                    )}
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[8px] font-black text-zinc-400 block uppercase">Contingente</span>
                      <span className="text-xs font-black text-amber-400">{selectedTorcidaForDiplomacy.contingente}/100</span>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[8px] font-black text-zinc-400 block uppercase">Pista</span>
                      <span className="text-xs font-black text-amber-400">{selectedTorcidaForDiplomacy.poder_pista}/100</span>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[8px] font-black text-zinc-400 block uppercase">Bancada</span>
                      <span className="text-xs font-black text-amber-400">{selectedTorcidaForDiplomacy.pressao_bancada}/100</span>
                    </div>
                  </div>

                  {/* Historical Record if Rival */}
                  {rec && (
                    <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-1 text-xs text-left">
                      <span className="text-[9px] font-black text-amber-400 block uppercase">RETROSPECTO DIRETO</span>
                      <p className="text-zinc-300 text-[11px]">
                        {rec.totalConfrontos} jogos disputados • {rec.vitoriasPista} vitórias de pista • {rec.derrotasPista} derrotas • {rec.jogosDaPaz} jogos da paz
                      </p>
                      <div className="flex gap-2 pt-1 text-[10px] font-bold">
                        <span className="text-emerald-400">Faixas Tomadas: {rec.faixasTomadas}</span>
                        <span className="text-red-400">Faixas Perdidas: {rec.faixasPerdidas}</span>
                      </div>
                    </div>
                  )}

                  {/* Feedback message */}
                  {diplomacyFeedback && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold text-center">
                      {diplomacyFeedback}
                    </div>
                  )}

                  {/* DIPLOMACY ACTIONS */}
                  <div className="space-y-2 pt-1 text-left">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">
                      PAINEL DE AÇÕES DIPLOMÁTICAS
                    </span>

                    {/* RIVAL ACTIONS */}
                    {isSameState && !isAlly && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleDiplomacyAction("MARCAR_TRETA", selectedTorcidaForDiplomacy)}
                          className="w-full text-left p-3 rounded-2xl bg-red-950/60 border border-red-800/80 hover:border-red-500 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-black text-xs text-red-400 group-hover:text-red-300">
                            <span>⚔️ Marcar Treta / Desafio de Pista</span>
                            <span className="text-[9px] text-red-400/80">+5 Moral • +15% MP</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                            Intensifica a rivalidade de rua. Aumenta a força de pista e a moral da tropa para o próximo clássico.
                          </p>
                        </button>

                        <button
                          onClick={() => handleDiplomacyAction("JOGO_PAZ", selectedTorcidaForDiplomacy)}
                          className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-blue-500 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-black text-xs text-blue-400 group-hover:text-blue-300">
                            <span>🕊️ Combinar Jogo da Paz (-R$ 3.000)</span>
                            <span className="text-[9px] text-emerald-400">-15% Risco MP</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                            Pacto diplomático com as lideranças rivais proibindo armas e garantindo paz no entorno do estádio.
                          </p>
                        </button>

                        {rec && rec.faixasPerdidas > 0 && (
                          <button
                            onClick={() => handleDiplomacyAction("RESGATAR_FAIXA", selectedTorcidaForDiplomacy)}
                            className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-amber-500/50 hover:border-amber-400 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between font-black text-xs text-amber-400">
                              <span>🏴‍☠️ Resgatar Faixa Perdida (-R$ 15.000)</span>
                              <span className="text-[9px] text-emerald-400">+10 Moral</span>
                            </div>
                            <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                              Negociação diplomática para pagar resgate e recuperar 1 faixa oficial perdida (Possui {rec.faixasPerdidas} perdidas).
                            </p>
                          </button>
                        )}

                        {rec && rec.faixasTomadas > 0 && (
                          <button
                            onClick={() => handleDiplomacyAction("DEVOLVER_FAIXA", selectedTorcidaForDiplomacy)}
                            className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-emerald-500/50 hover:border-emerald-400 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between font-black text-xs text-emerald-400">
                              <span>🤝 Negociar & Devolver Faixa Tomada (+R$ 20.000)</span>
                              <span className="text-[9px] text-emerald-400">-10% MP</span>
                            </div>
                            <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                              Devolver 1 faixa capturada em acordo diplomático com intermédio da polícia e MP (Possui {rec.faixasTomadas} tomadas).
                            </p>
                          </button>
                        )}
                      </div>
                    )}

                    {/* NEUTRAL ACTIONS */}
                    {!isSameState && !isAlly && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleDiplomacyAction("CHURRASCO_NEUTRA", selectedTorcidaForDiplomacy)}
                          className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-black text-xs text-amber-400">
                            <span>🥩 Churrasco de Recepção (-R$ 2.000)</span>
                            <span className="text-[9px] text-emerald-400">+R$ 6k Lucro</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                            Recepcionar a torcida neutra com churrasco na sede (+5 Massa, +5 Respeito e lucro com bebidas).
                          </p>
                        </button>

                        <button
                          onClick={() => handleDiplomacyAction("REUNIAO_ALIANCA", selectedTorcidaForDiplomacy)}
                          className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-black text-xs text-emerald-400">
                            <span>🤝 Marcar Reunião para Alinhar Amizade (-R$ 5.000)</span>
                            <span className="text-[9px] text-emerald-400">+10 Respeito</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                            Iniciar tratativas formais de paz e união para incluir a torcida neutra no mesmo eixo nacional (+8 Moral).
                          </p>
                        </button>
                      </div>
                    )}

                    {/* ALLIED ACTIONS */}
                    {isAlly && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleDiplomacyAction("SOLICITAR_APOIO_ALIADA", selectedTorcidaForDiplomacy)}
                          className="w-full text-left p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 hover:border-emerald-500 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-black text-xs text-emerald-400">
                            <span>🚌 Solicitar Apoio de Bonde (-R$ 4.000)</span>
                            <span className="text-[9px] text-emerald-400">+800 Membros</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                            Convocar contingente reforçado da torcida irmã para somar no nosso setor no próximo clássico decisivo.
                          </p>
                        </button>

                        <button
                          onClick={() => handleDiplomacyAction("ACAO_SOCIAL_CONJUNTA", selectedTorcidaForDiplomacy)}
                          className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-black text-xs text-emerald-400">
                            <span>💚 Ação Social Conjunta (-R$ 3.000)</span>
                            <span className="text-[9px] text-emerald-400">-15% MP</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                            Evento de doação de alimentos entre as duas sedes, reduzindo fortemente a fiscalização do MP para ambas.
                          </p>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* PRESIDENTIAL ELECTION MODAL */}
      {showPresidentElectionModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-2xl">
                🗳️
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight uppercase">
                  Eleições da Diretoria — Temporada {season}
                </h3>
                <p className="text-xs text-amber-400 font-semibold">
                  Assembleia Geral dos Associados • Escolha o Perfil de Liderança (Mandato de 3 Anos)
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              A cada 3 temporadas, a massa e os conselheiros se reúnem na quadra social para eleger o Presidente da Torcida. A escolha determina os bônus e penalidades operacionais da diretoria:
            </p>

            <div className="space-y-3">
              {getPresidentOptions().map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setPresidentProfile(option.id);
                    setShowPresidentElectionModal(false);
                    setHistoryLog((prev) => [
                      `[Ano ${season} - Eleição de Diretoria] Mandato iniciado sob comando do perfil "${option.title}".`,
                      ...prev,
                    ]);
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 hover:bg-amber-950/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between font-black text-sm text-white">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{option.icon}</span> {option.title}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Eleger Presidente
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{option.description}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-zinc-900 text-[11px]">
                    <div className="text-emerald-400 font-medium">✓ {option.bonus}</div>
                    <div className="text-rose-400 font-medium">✗ {option.penalty}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ULTRAS NEWS REEL MODAL */}
      {activeNewsReel && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-rose-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500 flex items-center justify-center text-xl animate-pulse">
                📢
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase">
                  {activeNewsReel.category}
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  {activeNewsReel.title}
                </h3>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <h4 className="text-xs font-bold text-amber-300 leading-snug">
                "{activeNewsReel.headline}"
              </h4>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                {activeNewsReel.narrative}
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Impacto Imediato:</span>
              <div className="grid grid-cols-2 gap-2">
                {activeNewsReel.deltas.map((d, i) => (
                  <div key={i} className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between ${d.isPositive ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50' : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'}`}>
                    <span>{d.label}</span>
                    <span>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (activeNewsReel.cashEffect) setBankBalance((prev) => prev + activeNewsReel.cashEffect!);
                if (activeNewsReel.moralEffect) setStateTrackers((prev) => ({ ...prev, moral: Math.min(100, Math.max(0, prev.moral + activeNewsReel.moralEffect!)) }));
                if (activeNewsReel.riscoMpEffect) setStateTrackers((prev) => ({ ...prev, risco_mp: Math.min(100, Math.max(0, prev.risco_mp + activeNewsReel.riscoMpEffect!)) }));
                if (activeNewsReel.contingenteEffect) setStats((prev) => ({ ...prev, contingente: Math.min(100, Math.max(10, prev.contingente + activeNewsReel.contingenteEffect!)) }));
                setActiveNewsReel(null);
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              ENTENDIDO! CONTINUAR JORNADA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
