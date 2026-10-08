export interface SeasonClimate {
  season: number;
  name: string;
  subtitle: string;
  description: string;
  costMult: number;
  cashBonus: number;
  mpRiskMod: number;
  massaBonus: number;
  bancadaBonus: number;
  pistaBonus: number;
}

export interface TorcidaStats {
  contingente: number;
  pressao_bancada: number;
  poder_pista: number;
  caravana: number;
  autonomia_financeira: number;
}

export interface StateTrackers {
  moral: number;
  risco_mp: number;
  relacao_clube: number;
  respeito_nacional: number;
}

export interface FormattedDelta {
  label: string;
  value: string;
  isPositive: boolean;
}

export interface EndGameInvestment {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cost: number;
  category: "FROTA" | "SUBSEDE" | "DOACAO_CLUBE";
  statEffects: Partial<TorcidaStats>;
  stateEffects: Partial<StateTrackers>;
}

export interface UnforeseenExpense {
  id: string;
  title: string;
  category: "SOP" | "SEDE" | "ADVOGADO" | "MATERIAL";
  cost: number;
  description: string;
  impactLabel: string;
}

export interface DerbyMatchInfo {
  matchTitle: string;
  homeClub: string;
  awayClub: string;
  rivalTorcida: string;
  rivalSigla: string;
  stadium: string;
  cityState: string;
  derbyName: string;
  isHome: boolean;
  isLongDistance: boolean;
  isAllyGame: boolean;
  importanceDescription: string;
  competition?: string;
  teamData?: any;
}

export interface PoliceMeetingChoice {
  id: string;
  title: string;
  stance: "DIPLOMATICA" | "COMBATIVA" | "CLANDESTINA" | "ESCOLTA_TOTAL";
  description: string;
  cost: number;
  mpRiskMod: number;
  bancadaBonus: number;
  pistaMod: number;
  moralMod: number;
  formattedDeltas: FormattedDelta[];
  meetingLog: string;
}

export interface TransportChoice {
  id: string;
  name: string;
  description: string;
  costPerMember: number;
  fixedCost: number;
  capacityMultiplier: number;
  pistaBonus: number;
  mpRisk: number;
  speed: "RAPIDO" | "MEDIO" | "LENTO";
}

export interface MatchScoutReport {
  playerMembersPresent: number;
  rivalMembersWaiting: number;
  policePresence: "SEVERA" | "PACIFICA" | "REFORCADA" | "OPERACAO_PADRAO";
  twistTitle: string;
  twistDescription: string;
}

export interface TacticalBattleChoice {
  id: string;
  title: string;
  description: string;
  pistaMod: number;
  moralMod: number;
  mpPenalty: number;
  costRisk: number;
  injuryRisk: number;
  tacticalLog: string;
  formattedDeltas: FormattedDelta[];
  isMosaicTactic?: boolean;
}

export interface MatchExecutionResult {
  scorePlayerClub: number;
  scoreRivalClub: number;
  effectiveForcePlayer: number;
  effectiveForceRival: number;
  isVictoryPista: boolean;
  isVictoryBancada: boolean;
  isPistaFight?: boolean;
  statusTitle: string;
  membersLost: number;
  medicalCost: number;
  extraExpenses: number;
  mpAdded: number;
  moralChange: number;
  chronicleText: string;
  formattedDeltas: FormattedDelta[];
  bannerCaptured?: boolean;
  bannerLost?: boolean;
  isRetryWithAd?: boolean;
  isSecondChanceVictory?: boolean;
}

export interface RivalryRecord {
  rivalTorcida: string;
  wins: number;
  losses: number;
  bannersCaptured: number;
  bannersLost: number;
  totalEncounters: number;
}

export interface ElectionCrisisInfo {
  id: string;
  title: string;
  description: string;
  headline: string;
  consequences: {
    statChanges?: Partial<TorcidaStats>;
    stateChanges?: Partial<StateTrackers>;
    bankLossPct?: number;
  };
  resolutionOptions: {
    id: string;
    title: string;
    cost: number;
    logText: string;
    formattedDeltas: FormattedDelta[];
    stateEffects?: Partial<StateTrackers>;
    cashDelta?: number;
    triggerRivalAmbushAlert?: boolean;
  }[];
}

export interface Etapa10CaravanChoice {
  id: string;
  category: "DERBY" | "IRMANDADE" | "INTERIOR" | "CAPITAL";
  badgeTitle: string;
  badgeColor: string;
  title: string;
  clube: string;
  rivalTorcida: string;
  estado: string;
  stadium: string;
  cityState: string;
  description: string;
  impacts: { label: string; value: string; isPositive: boolean }[];
  teamData: any;
}

export interface OfficialTorcida {
  clube: string;
  torcida: string;
  sigla: string;
  tier: string;
  contingente: number;
  pressao_bancada: number;
  poder_pista: number;
  caravana: number;
  autonomia_financeira: number;
  perfil_predominante: string;
  estado?: string;
  eixo_alianca: string;
  rival_principal: string;
  rival_secundario: string;
  torcida_aliada: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface ArchetypeDefinition {
  id: string;
  name: string;
  badge: string;
  description: string;
  statModifiers: Partial<TorcidaStats>;
  stateModifiers: Partial<StateTrackers>;
  startingCash: number;
  perfilPredominante: string;
}

export interface NationalRankEntry {
  rank: number;
  torcida: string;
  clube: string;
  estado: string;
  tier: string;
  powerScore: number;
  isPlayer: boolean;
  stats: TorcidaStats;
}
