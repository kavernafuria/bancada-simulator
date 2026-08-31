
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

export const SEASON_CLIMATES: Record<number, SeasonClimate> = {
  1: { season: 1, name: "Ano de Reestruturação da Sede", subtitle: "Estruturação de Quadra & Bairro", description: "Custos equilibrados e clima de reestruturação dos associados.", costMult: 1.0, cashBonus: 0, mpRiskMod: 0, massaBonus: 0, bancadaBonus: 0, pistaBonus: 0 },
  2: { season: 2, name: "Crise de Inflação nos Ingressos", subtitle: "Ingressos Caros & Teste de Caixa", description: "Custos operacionais 25% mais altos. Ingressos de futebol sobem no país.", costMult: 1.25, cashBonus: -2000, mpRiskMod: -5, massaBonus: -2, bancadaBonus: 0, pistaBonus: 0 },
  3: { season: 3, name: "Operação Pista Limpa do MP", subtitle: "Pressão Judicial & Reação Rival", description: "O Ministério Público aumenta o cerco. Risco de punição judicial elevado.", costMult: 1.0, cashBonus: 0, mpRiskMod: 15, massaBonus: 0, bancadaBonus: 0, pistaBonus: 3 },
  4: { season: 4, name: "Boom de Matrículas e Venda de Roupas", subtitle: "Arrecadação Alta & Crescimento", description: "Ano de alta arrecadação e expansão do quadro social.", costMult: 0.9, cashBonus: 8000, mpRiskMod: -5, massaBonus: 3, bancadaBonus: 2, pistaBonus: 0 },
  5: { season: 5, name: "Ano de Tensão de Dérbis Regionais", subtitle: "Confrontos Interestaduais Quentes", description: "Clássicos fervendo nas rodovias e percursos interestaduais.", costMult: 1.2, cashBonus: 0, mpRiskMod: 10, massaBonus: 0, bancadaBonus: 0, pistaBonus: 4 },
  6: { season: 6, name: "Racha Político de Arquibancada", subtitle: "Divergências na Diretoria", description: "Discussões sobre os rumos da agremiação exigem prudência financeira.", costMult: 1.1, cashBonus: -3000, mpRiskMod: 5, massaBonus: -1, bancadaBonus: -2, pistaBonus: 0 },
  7: { season: 7, name: "Ano da Caravana da Amizade", subtitle: "Alianças Nacionais Fortalecidas", description: "Viagens com recepção festiva de torcidas aliadas por todo o país.", costMult: 0.85, cashBonus: 4000, mpRiskMod: -10, massaBonus: 2, bancadaBonus: 3, pistaBonus: 0 },
  8: { season: 8, name: "Cercamento Policial & Arenização", subtitle: "Estádios Modernizados & Biometria", description: "Catracas com biometria facial e ingressos 40% mais caros.", costMult: 1.4, cashBonus: 0, mpRiskMod: 20, massaBonus: -2, bancadaBonus: -1, pistaBonus: 0 },
  9: { season: 9, name: "Ano do Centenário do Clube", subtitle: "Festa Monumental & Recordes", description: "Grandes celebrações de massa, mosaicos 3D e arrecadação de loja em alta.", costMult: 1.1, cashBonus: 15000, mpRiskMod: -5, massaBonus: 4, bancadaBonus: 4, pistaBonus: 0 },
  10: { season: 10, name: "Crise Financeira do Clube de Apoio", subtitle: "Retração de Apoio Institucional", description: "O clube reduz ingressos de cota. A torcida precisa da sua autonomia.", costMult: 1.2, cashBonus: -5000, mpRiskMod: 0, massaBonus: 0, bancadaBonus: 0, pistaBonus: 0 },
  11: { season: 11, name: "Renovação dos Bondes de Bairro", subtitle: "Nova Geração nas Sub-Sedes", description: "Surgimento de novos bondes de rua fortalecendo a segurança.", costMult: 1.0, cashBonus: 0, mpRiskMod: 5, massaBonus: 2, bancadaBonus: 0, pistaBonus: 3 },
  12: { season: 12, name: "Implantação da Biometria Facial Geral", subtitle: "Fiscalização Rigorosa do MP", description: "Fiscalização máxima dos órgãos públicos. Exige táticas de preservação.", costMult: 1.35, cashBonus: 0, mpRiskMod: 25, massaBonus: -1, bancadaBonus: 0, pistaBonus: 0 },
  13: { season: 13, name: "Ano de Ouro de Caravanas Interestaduais", subtitle: "Invasões Rodoviárias Históricas", description: "Comboios de dezenas de ônibus cruzando o Brasil.", costMult: 0.95, cashBonus: 6000, mpRiskMod: 0, massaBonus: 3, bancadaBonus: 2, pistaBonus: 2 },
  14: { season: 14, name: "Guerra Fria Fiel x Rival Histórico", subtitle: "Rivalidade sem Concessões", description: "Materiais de festa mais caros e clima de alta tensão em clássicos.", costMult: 1.3, cashBonus: 0, mpRiskMod: 15, massaBonus: 0, bancadaBonus: 0, pistaBonus: 4 },
  15: { season: 15, name: "Temporada de Consagração do Legado", subtitle: "Apogeu dos 15 Anos de Mandato", description: "Mandato histórico de 15 anos no auge da reputação nacional.", costMult: 1.0, cashBonus: 25000, mpRiskMod: -10, massaBonus: 5, bancadaBonus: 5, pistaBonus: 5 },
};

export function getSeasonClimate(season: number): SeasonClimate {
  return SEASON_CLIMATES[season] || SEASON_CLIMATES[1];
}

import teamsData from "@/data/bancada_teams.json";
import alliancesData from "@/data/bancada_alliances.json";
import { getSeasonalActionEvent, isInteriorSP } from "./season_events";

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

// ==========================================
// CENTRALIZED GAME BALANCE LAYER
// ==========================================
export const GAME_BALANCE = {
  CAREER_MAX_SEASONS: 15,
  PRESIDENT_ELECTIONS_SEASONS: [1, 4, 7, 10, 13],
  MILESTONE_SEASONS: [3, 6, 9, 12, 15],
  ANNUAL_STEPS_COUNT: 13,

  // Economics
  MEMBERSHIP_DUES_PER_MEMBER: 450, // R$ 450 por membro em mensalidades anuais
  MERCH_REVENUE_FACTOR: 350,
  HEADQUARTERS_PURCHASE_COST: 45000, // R$ 45.000 para compra da sede própria
  HEADQUARTERS_ANNUAL_RENT: 3500, // R$ 3.500/ano economizados de aluguel
  ALLIANCE_MEETING_COST: 3000, // R$ 3.000 para reunião diplomática
  BANNER_RESCUE_COST: 15000, // R$ 15.000 para resgate de faixa tomada

  // President Modifiers
  PRESIDENT_MODIFIERS: {
    LINHA_FRENTE: { pistaBonusPct: 0.15, passiveRiscoMpAdded: 10 },
    GESTOR: { cashBonusPct: 0.25, moralPenaltyInBattle: 10 },
    MESTRE_BATERIA: { bancadaBonusPct: 0.20, bateriaWearReductionPct: 0.50, caravanLimitPenaltyPct: 0.10 },
  },

  // MP Risk Bands
  MP_RISK_BANDS: {
    GREEN_MAX: 49,
    YELLOW_MIN: 50,
    ORANGE_MIN: 75,
    DARK_RED_MIN: 86, // >85% no Jogo 4 ativa Choque Total e Visual Ban
    PURPLE_BAN: 100, // 100% causa suspensão de 1 ano
  },

  // 80% Contingent Gate Threshold
  GATE_VISITOR_CONTINGENT_RATIO: 0.80,

  // 15-Season Progression Eras
  ERAS: [
    { phase: 1, name: "Construção", seasons: [1, 2, 3], subtitle: "Afirmação de Pista e Organização Social" },
    { phase: 2, name: "Expansão", seasons: [4, 5, 6], subtitle: "Subsedes Regionais e Comboios de Frota" },
    { phase: 3, name: "Consolidação", seasons: [7, 8, 9], subtitle: "Respeito Nacional e Alianças Interestaduais" },
    { phase: 4, name: "Influência", seasons: [10, 11, 12], subtitle: "Arena de Espetáculos e Hegemonia de Bancada" },
    { phase: 5, name: "Legado", seasons: [13, 14, 15], subtitle: "Apogeu Ultras e Consagração Histórica" },
  ],
};

export type ArchetypeId = "PADRAO" | "BARRA_BRAVA" | "BONDE_PISTA" | "COLETIVO_POPULAR";

export interface ArchetypeDefinition {
  id: ArchetypeId;
  name: string;
  subtitle: string;
  description: string;
  statModifiers: Partial<TorcidaStats>;
  stateModifiers: Partial<StateTrackers>;
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
  estado: string;
  eixo_alianca: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface TorcidaColorPreset {
  name: string;
  hex: string;
  textColor: string;
}

export const TORCIDA_COLOR_PALETTE: TorcidaColorPreset[] = [
  { name: "Preto Ébano", hex: "#09090b", textColor: "#ffffff" },
  { name: "Branco Neve", hex: "#f4f4f5", textColor: "#000000" },
  { name: "Verde Alviverde", hex: "#15803d", textColor: "#ffffff" },
  { name: "Verde Esmeralda", hex: "#047857", textColor: "#ffffff" },
  { name: "Vermelho Rubro", hex: "#dc2626", textColor: "#ffffff" },
  { name: "Vermelho Sangue", hex: "#991b1b", textColor: "#ffffff" },
  { name: "Azul Royal", hex: "#2563eb", textColor: "#ffffff" },
  { name: "Azul Celeste", hex: "#0284c7", textColor: "#ffffff" },
  { name: "Azul Marinho", hex: "#1e3a8a", textColor: "#ffffff" },
  { name: "Amarelo Canário", hex: "#eab308", textColor: "#000000" },
  { name: "Grená / Vinho", hex: "#881337", textColor: "#ffffff" },
  { name: "Laranja", hex: "#ea580c", textColor: "#ffffff" },
  { name: "Roxo", hex: "#7e22ce", textColor: "#ffffff" },
];

export function getDefaultTorcidaColors(clube: string): { primary: string; secondary: string } {
  const c = (clube || "").trim().toLowerCase();
  if (c.includes("palmeiras") || c.includes("guarani") || c.includes("coritiba") || c.includes("goiás") || c.includes("chapecoense")) {
    return { primary: "#15803d", secondary: "#f4f4f5" };
  }
  if (c.includes("flamengo") || c.includes("internacional") || c.includes("sport") || c.includes("vitória") || c.includes("athletico")) {
    return { primary: "#dc2626", secondary: "#09090b" };
  }
  if (c.includes("são paulo") || c.includes("botafogo-sp") || c.includes("noroeste") || c.includes("náutico") || c.includes("santa cruz")) {
    return { primary: "#dc2626", secondary: "#f4f4f5" };
  }
  if (c.includes("comercial") || c.includes("corinthians") || c.includes("santos") || c.includes("vasco") || c.includes("botafogo") || c.includes("ceará") || c.includes("operário")) {
    return { primary: "#09090b", secondary: "#f4f4f5" };
  }
  if (c.includes("são caetano")) {
    return { primary: "#0284c7", secondary: "#f4f4f5" };
  }
  if (c.includes("são bernardo") || c.includes("criciúma") || c.includes("novorizontino")) {
    return { primary: "#eab308", secondary: "#09090b" };
  }
  if (c.includes("cruzeiro") || c.includes("grêmio") || c.includes("bahia") || c.includes("csa") || c.includes("avaí") || c.includes("são bento") || c.includes("marília") || c.includes("santo andré") || c.includes("são josé")) {
    return { primary: "#2563eb", secondary: "#f4f4f5" };
  }
  if (c.includes("fluminense") || c.includes("ferroviária") || c.includes("juventus")) {
    return { primary: "#881337", secondary: "#15803d" };
  }
  return { primary: "#09090b", secondary: "#f4f4f5" };
}

// Check if a match requires a highway road trip (pegar estrada / rodovias SP ou BR)
export function isHighwayTrip(clubA: string, clubB: string): boolean {
  const a = (clubA || "").toLowerCase().trim();
  const b = (clubB || "").toLowerCase().trim();
  if (a === b) return false;

  // ABC inter-city matches (Santo André, São Caetano, São Bernardo) are local
  const isAbcA = a === "santo andré" || a === "são caetano" || a === "são bernardo";
  const isAbcB = b === "santo andré" || b === "são caetano" || b === "são bernardo";
  if (isAbcA && isAbcB) return false;

  // São José dos Campos (São José EC) is located in the Vale do Paraíba along the Rodovia Presidente Dutra (BR-116) / Ayrton Senna
  // Any travel to/from São José EC from ABC, Capital, Campinas, Sorocaba, Santos, etc. requires taking the highway
  if (a === "são josé ec" || b === "são josé ec") return true;

  // Capital SP vs ABC is local/metropolitano (train / expressway)
  const isCapitalA = a === "corinthians" || a === "palmeiras" || a === "são paulo" || a === "portuguesa" || a === "juventus";
  const isCapitalB = b === "corinthians" || b === "palmeiras" || b === "são paulo" || b === "portuguesa" || b === "juventus";
  if ((isAbcA && isCapitalB) || (isCapitalA && isAbcB)) return false;
  if (isCapitalA && isCapitalB) return false;

  // Santos requires Anchieta/Imigrantes road trip
  if (a === "santos" || b === "santos") return true;

  // All interior clubs require road trips
  const interiorClubs = [
    "botafogo-sp", "comercial-rp", "ferroviária", "noroeste", "marília",
    "xv de piracicaba", "inter de limeira", "rio branco", "união barbarense",
    "paulista jundiaí", "são bento", "ponte preta", "guarani", "são josé ec"
  ];
  if (interiorClubs.includes(a) || interiorClubs.includes(b)) return true;

  return true;
}

// SEASON OBJECTIVES
export type ObjectiveCategory = "PISTA" | "BANCADA" | "FINANCAS" | "MASSA" | "DISCIPLINA_MP" | "CARAVANA" | "MOSAICO";

export interface SeasonObjective {
  id: string;
  category: ObjectiveCategory;
  icon: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  targetUnit: string;
  isCompleted: boolean;
  isFailed: boolean;
  rewardText: string;
  rewardCash: number;
  rewardMoral: number;
  rewardRespeito: number;
}

export type ClubStatus = "DISPUTANDO_TITULO" | "MEIO_TABELA" | "CRISE_REBAIXAMENTO" | "LUTANDO_ACESSO";

export interface FormattedDelta {
  label: string;
  value: string;
  isPositive: boolean;
}

export interface ActionChoice {
  id: string;
  text: string;
  cost: number;
  statEffects: Partial<TorcidaStats>;
  stateEffects: Partial<StateTrackers>;
  log: string;
  formattedDeltas: FormattedDelta[];
}

export interface ActionStepEvent {
  stepIndex: number;
  title: string;
  category: string;
  contextNarrative: string;
  choices: ActionChoice[];
}

// Key Game Data Models
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
  policePresence: "BAIXA" | "MODERADA" | "INTENSA" | "CHOQUE_TOTAL" | "PACIFICA";
  scoutIntelLog: string;
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
  statusTitle: string;
  membersLost: number;
  medicalCost: number;
  extraExpenses: number;
  mpAdded: number;
  moralChange: number;
  chronicleText: string;
  formattedDeltas: FormattedDelta[];
  bannerCaptured?: boolean;
}

export interface RivalryRecord {
  rivalTorcida: string;
  rivalClub: string;
  totalConfrontos: number;
  vitoriasPista: number;
  derrotasPista: number;
  jogosDaPaz: number;
  faixasTomadas: number;
  faixasPerdidas: number;
  isPeacePactActive?: boolean;
  isTretaChallenged?: boolean;
}

// Archetypes
export const ARCHETYPES: Record<ArchetypeId, ArchetypeDefinition> = {
  PADRAO: {
    id: "PADRAO",
    name: "Torcida Organizada Tradicional",
    subtitle: "Perfil Equilibrado & Bateria de Samba",
    description: "Foco em confecção própria, quadra social, bateria pesada de samba e comboios regulares de ônibus.",
    statModifiers: { contingente: 5, caravana: 5, autonomia_financeira: 5 },
    stateModifiers: { moral: 5, risco_mp: 0 },
  },
  BARRA_BRAVA: {
    id: "BARRA_BRAVA",
    name: "Barra Brava / Movimento Popular",
    subtitle: "Perfil Musical, Murgas & Tirantes",
    description: "Canto contínuo os 90 minutos, instrumentos de sopro, tirantes verticais. Pouco foco em loja física.",
    statModifiers: { pressao_bancada: 15, contingente: 5, poder_pista: -10, autonomia_financeira: -15 },
    stateModifiers: { moral: 10, risco_mp: -5 },
  },
  BONDE_PISTA: {
    id: "BONDE_PISTA",
    name: "Linha de Frente & Bonde de Pista",
    subtitle: "Perfil Combate, Escolta & Rodovia",
    description: "Domínio de território, proteção de faixas e respeito de rua. Alta vigilância policial e do MP.",
    statModifiers: { poder_pista: 25, pressao_bancada: -15, autonomia_financeira: -10 },
    stateModifiers: { risco_mp: 15, respeito_nacional: 10 },
  },
  COLETIVO_POPULAR: {
    id: "COLETIVO_POPULAR",
    name: "Coletivo Popular Autônomo",
    subtitle: "Perfil Comunitário & Ingressos Acessíveis",
    description: "Foco em direitos do torcedor, ação social nas favelas e resistência política. Sem viés bélico.",
    statModifiers: { contingente: 10, poder_pista: -15, autonomia_financeira: 5 },
    stateModifiers: { moral: 10, risco_mp: -10, relacao_clube: 15 },
  },
};

export function getOfficialTorcidas(): OfficialTorcida[] {
  return (teamsData as OfficialTorcida[]).map((t) => {
    const defaults = getDefaultTorcidaColors(t.clube);
    return {
      ...t,
      primaryColor: t.primaryColor || defaults.primary,
      secondaryColor: t.secondaryColor || defaults.secondary,
    };
  });
}

export function getAlliancesData() {
  return alliancesData;
}

// Diminishing Returns Curve Math - strictly progressive
export function applyDiminishingReturns(currentVal: number, delta: number): number {
  if (delta <= 0) return Math.max(0, currentVal + delta);
  if (currentVal < 45) return Math.min(100, currentVal + delta);
  if (currentVal < 65) return Math.min(100, Math.round(currentVal + delta * 0.6));
  if (currentVal < 80) return Math.min(100, Math.round(currentVal + delta * 0.32));
  if (currentVal < 90) return Math.min(100, Math.round(currentVal + delta * 0.16));
  return Math.min(100, Math.round(currentVal + delta * 0.06));
}

// Create Custom Torcida with Archetype & Colors
export function createCustomTorcidaWithArchetype(
  torcidaName: string,
  sigla: string,
  clubName: string,
  archetypeId: ArchetypeId,
  primaryColor?: string,
  secondaryColor?: string
): { torcida: OfficialTorcida; state: StateTrackers } {
  const normName = torcidaName.trim() || "Torcida Organizada";
  const normSigla = sigla.trim().toUpperCase() || "TOC";
  const arch = ARCHETYPES[archetypeId] || ARCHETYPES.PADRAO;

  const mapped = (teamsData as OfficialTorcida[]).find(
    (t) => t.clube.toLowerCase() === clubName.trim().toLowerCase()
  );

  const tier = mapped ? mapped.tier : "B";
  const isTierA = tier === "A";

  const defaultColors = getDefaultTorcidaColors(mapped ? mapped.clube : clubName);

  // If created in a Tier A giant club, the new torcida starts as an emerging dissident faction
  // because the historic hegemonic torcida already controls the stadium.
  const baseStats: TorcidaStats = isTierA
    ? {
        contingente: 28,
        pressao_bancada: 38,
        poder_pista: 32,
        caravana: 24,
        autonomia_financeira: 28,
      }
    : tier === "B"
    ? {
        contingente: 38,
        pressao_bancada: 45,
        poder_pista: 38,
        caravana: 34,
        autonomia_financeira: 36,
      }
    : {
        contingente: 45,
        pressao_bancada: 52,
        poder_pista: 42,
        caravana: 40,
        autonomia_financeira: 42,
      };

  Object.entries(arch.statModifiers).forEach(([key, mod]) => {
    const k = key as keyof TorcidaStats;
    baseStats[k] = Math.min(100, Math.max(10, baseStats[k] + (mod || 0)));
  });

  const stateTrackers: StateTrackers = {
    moral: isTierA ? 60 + (arch.stateModifiers.moral || 0) : 65 + (arch.stateModifiers.moral || 0),
    risco_mp: Math.max(0, 5 + (arch.stateModifiers.risco_mp || 0)),
    relacao_clube: 10 + (arch.stateModifiers.relacao_clube || 0),
    respeito_nacional: isTierA ? 20 + (arch.stateModifiers.respeito_nacional || 0) : 30 + (arch.stateModifiers.respeito_nacional || 0),
  };

  const torcida: OfficialTorcida = {
    clube: mapped ? mapped.clube : clubName || "Clube Independente",
    torcida: normName,
    sigla: normSigla,
    tier: tier,
    contingente: baseStats.contingente,
    pressao_bancada: baseStats.pressao_bancada,
    poder_pista: baseStats.poder_pista,
    caravana: baseStats.caravana,
    autonomia_financeira: baseStats.autonomia_financeira,
    perfil_predominante: `${arch.subtitle} • ${isTierA ? "Nova Força Dissidente" : "Movimento Independente"}`,
    estado: mapped ? mapped.estado : "SP",
    eixo_alianca: mapped ? mapped.eixo_alianca : "PC",
    primaryColor: primaryColor || (mapped ? mapped.primaryColor : undefined) || defaultColors.primary,
    secondaryColor: secondaryColor || (mapped ? mapped.secondaryColor : undefined) || defaultColors.secondary,
  };

  return { torcida, state: stateTrackers };
}

// REAL BRAZILIAN DERBIES & CLASSICOS MAPPING
export function getDerbyForMatch(
  currentTorcida: OfficialTorcida,
  gameIndex: number, // 1, 2, 3, 4
  clubStatus: ClubStatus,
  season: number = 1,
  challengedRivalTorcida?: string | null
): DerbyMatchInfo {
  const all = teamsData as OfficialTorcida[];
  const userClub = currentTorcida.clube.trim().toLowerCase();

  // STRICTLY FILTER OUT ANY TORCIDA FROM THE PLAYER'S OWN CLUB
  const rivalsOnly = all.filter((t) => t.clube.trim().toLowerCase() !== userClub);

  // Same State Rivals (Derbies)
  const sameStateRivals = rivalsOnly.filter((t) => t.estado === currentTorcida.estado);
  // Other State Rivals (Interstate Classics)
  const otherStateRivals = rivalsOnly.filter(
    (t) => t.estado !== currentTorcida.estado && t.eixo_alianca !== currentTorcida.eixo_alianca
  );
  // Allies (different club, same alliance axis)
  const allies = rivalsOnly.filter((t) => t.eixo_alianca === currentTorcida.eixo_alianca);

  // Specific Historical Derby Pairings
  let mainRival: OfficialTorcida | undefined;
  let secondRival: OfficialTorcida | undefined;
  let allyTorcida: OfficialTorcida | undefined;

  switch (userClub) {
    case "corinthians":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santos");
      if (currentTorcida.torcida.toLowerCase().includes("gaviões") || currentTorcida.torcida.toLowerCase().includes("gavioes")) {
        allyTorcida = rivalsOnly.find((t) => t.torcida.toLowerCase().includes("fúria jovem do botafogo") || t.torcida.toLowerCase().includes("furia jovem do botafogo") || t.clube.toLowerCase() === "botafogo");
      } else {
        allyTorcida = undefined;
      }
      break;
    case "palmeiras":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "corinthians");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santos");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama") || rivalsOnly.find((t) => t.clube.toLowerCase() === "atlético-mg");
      break;
    case "são paulo":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "corinthians");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santos");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "cruzeiro") || rivalsOnly.find((t) => t.clube.toLowerCase() === "internacional");
      break;
    case "santos":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "corinthians");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "atlético-mg") || rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama");
      break;
    case "flamengo":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "fluminense") || rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "grêmio");
      break;
    case "vasco da gama":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "flamengo");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "fluminense") || rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras") || rivalsOnly.find((t) => t.clube.toLowerCase() === "atlético-mg");
      break;
    case "fluminense":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "flamengo");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras") || rivalsOnly.find((t) => t.clube.toLowerCase() === "internacional");
      break;
    case "botafogo":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "flamengo");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "fluminense") || rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "atlético-mg") || rivalsOnly.find((t) => t.clube.toLowerCase() === "ceará");
      break;
    case "atlético-mg":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "cruzeiro");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "flamengo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama") || rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras");
      break;
    case "cruzeiro":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "atlético-mg");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "flamengo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "internacional");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "internacional");
      break;
    case "grêmio":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "internacional");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras") || rivalsOnly.find((t) => t.clube.toLowerCase() === "flamengo");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama") || rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras");
      break;
    case "internacional":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "grêmio");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "corinthians") || rivalsOnly.find((t) => t.clube.toLowerCase() === "cruzeiro");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "cruzeiro") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo");
      break;
    case "bahia":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "vitória");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "sport") || rivalsOnly.find((t) => t.clube.toLowerCase() === "ceará");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras") || rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama");
      break;
    case "vitória":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "bahia");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "sport") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santa cruz");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "cruzeiro") || rivalsOnly.find((t) => t.clube.toLowerCase() === "atlético-mg");
      break;
    case "sport":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "santa cruz") || rivalsOnly.find((t) => t.clube.toLowerCase() === "bahia");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "ceará") || rivalsOnly.find((t) => t.clube.toLowerCase() === "fortaleza");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "flamengo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo");
      break;
    case "santa cruz":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "sport");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "bahia") || rivalsOnly.find((t) => t.clube.toLowerCase() === "fortaleza");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "corinthians") || rivalsOnly.find((t) => t.clube.toLowerCase() === "fortaleza");
      break;
    case "fortaleza":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "ceará");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "sport") || rivalsOnly.find((t) => t.clube.toLowerCase() === "bahia");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "santa cruz") || rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo");
      break;
    case "ceará":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "fortaleza");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "sport") || rivalsOnly.find((t) => t.clube.toLowerCase() === "bahia");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "sport") || rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo");
      break;
    case "coritiba":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "athletico-pr");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "grêmio") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras") || rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama");
      break;
    case "athletico-pr":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "coritiba");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "flamengo");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santos");
      break;
    case "ponte preta":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "guarani");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "corinthians") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santos");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras") || rivalsOnly.find((t) => t.clube.toLowerCase() === "vasco da gama");
      break;
    case "guarani":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "ponte preta");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "cruzeiro");
      break;
    case "botafogo-sp":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "comercial-rp") || rivalsOnly.find((t) => t.clube.toLowerCase() === "ferroviária");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "santos") || rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "ponte preta") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são josé ec");
      break;
    case "comercial-rp":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo-sp");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "ferroviária") || rivalsOnly.find((t) => t.clube.toLowerCase() === "noroeste");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "marília") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são bento");
      break;
    case "são josé ec":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "santo andré") || rivalsOnly.find((t) => t.clube.toLowerCase() === "paulista jundiaí");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo-sp") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo-sp") || rivalsOnly.find((t) => t.clube.toLowerCase() === "rio branco");
      break;
    case "santo andré":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são caetano") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são bernardo");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são josé ec") || rivalsOnly.find((t) => t.clube.toLowerCase() === "palmeiras");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "portuguesa") || rivalsOnly.find((t) => t.clube.toLowerCase() === "rio branco") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são bento");
      break;
    case "são caetano":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "santo andré") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são bernardo");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são josé ec") || rivalsOnly.find((t) => t.clube.toLowerCase() === "ponte preta");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "comercial-rp") || rivalsOnly.find((t) => t.clube.toLowerCase() === "ferroviária");
      break;
    case "são bernardo":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "santo andré") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são caetano");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são josé ec") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santos");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "xv de piracicaba") || rivalsOnly.find((t) => t.clube.toLowerCase() === "união barbarense");
      break;
    case "rio branco":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "união barbarense");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "inter de limeira") || rivalsOnly.find((t) => t.clube.toLowerCase() === "xv de piracicaba");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "santo andré") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são bento");
      break;
    case "união barbarense":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "rio branco");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "xv de piracicaba") || rivalsOnly.find((t) => t.clube.toLowerCase() === "inter de limeira");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "xv de piracicaba") || rivalsOnly.find((t) => t.clube.toLowerCase() === "inter de limeira");
      break;
    case "paulista jundiaí":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "ponte preta") || rivalsOnly.find((t) => t.clube.toLowerCase() === "guarani");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são paulo") || rivalsOnly.find((t) => t.clube.toLowerCase() === "corinthians");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "guarani") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são josé ec");
      break;
    case "ferroviária":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo-sp") || rivalsOnly.find((t) => t.clube.toLowerCase() === "comercial-rp");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "noroeste") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santos");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "comercial-rp") || rivalsOnly.find((t) => t.clube.toLowerCase() === "são bento");
      break;
    case "xv de piracicaba":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "inter de limeira") || rivalsOnly.find((t) => t.clube.toLowerCase() === "união barbarense");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "noroeste") || rivalsOnly.find((t) => t.clube.toLowerCase() === "ponte preta");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "união barbarense") || rivalsOnly.find((t) => t.clube.toLowerCase() === "inter de limeira");
      break;
    case "são bento":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "paulista jundiaí") || rivalsOnly.find((t) => t.clube.toLowerCase() === "xv de piracicaba");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "guarani") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santos");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "marília") || rivalsOnly.find((t) => t.clube.toLowerCase() === "santo andré");
      break;
    case "noroeste":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "marília");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "ferroviária") || rivalsOnly.find((t) => t.clube.toLowerCase() === "xv de piracicaba");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "botafogo-sp") || rivalsOnly.find((t) => t.clube.toLowerCase() === "ferroviária");
      break;
    case "marília":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "noroeste");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "são bento") || rivalsOnly.find((t) => t.clube.toLowerCase() === "xv de piracicaba");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "são bento") || rivalsOnly.find((t) => t.clube.toLowerCase() === "comercial-rp");
      break;
    case "inter de limeira":
      mainRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "xv de piracicaba") || rivalsOnly.find((t) => t.clube.toLowerCase() === "rio branco");
      secondRival = rivalsOnly.find((t) => t.clube.toLowerCase() === "guarani") || rivalsOnly.find((t) => t.clube.toLowerCase() === "corinthians");
      allyTorcida = rivalsOnly.find((t) => t.clube.toLowerCase() === "união barbarense") || rivalsOnly.find((t) => t.clube.toLowerCase() === "xv de piracicaba");
      break;
    default:
      break;
  }

  // Fallbacks ensuring rival is strictly different club
  if (!mainRival) mainRival = sameStateRivals[0] || otherStateRivals[0] || rivalsOnly[0];
  if (!secondRival) secondRival = sameStateRivals.find((r) => r.clube !== mainRival!.clube) || otherStateRivals[0] || rivalsOnly[1] || rivalsOnly[0];
  if (!allyTorcida && currentTorcida.eixo_alianca !== "INDEPENDENTE") {
    allyTorcida = allies.find((a) => a.clube !== mainRival!.clube && a.clube !== secondRival!.clube) || rivalsOnly.find((r) => r.clube !== mainRival!.clube) || rivalsOnly[0];
  }

  // Helper for stadiums
  const getStadium = (club: string): { stadium: string; cityState: string } => {
    switch (club.toLowerCase()) {
      case "corinthians": return { stadium: "Neo Química Arena", cityState: "São Paulo - SP" };
      case "palmeiras": return { stadium: "Allianz Parque", cityState: "São Paulo - SP" };
      case "são paulo": return { stadium: "MorumBIS", cityState: "São Paulo - SP" };
      case "santos": return { stadium: "Vila Belmiro", cityState: "Santos - SP" };
      case "portuguesa": return { stadium: "Canindé", cityState: "São Paulo - SP" };
      case "flamengo": return { stadium: "Maracanã", cityState: "Rio de Janeiro - RJ" };
      case "vasco da gama": return { stadium: "São Januário", cityState: "Rio de Janeiro - RJ" };
      case "fluminense": return { stadium: "Maracanã", cityState: "Rio de Janeiro - RJ" };
      case "botafogo": return { stadium: "Nilton Santos (Engenhão)", cityState: "Rio de Janeiro - RJ" };
      case "atlético-mg": return { stadium: "Arena MRV", cityState: "Belo Horizonte - MG" };
      case "cruzeiro": return { stadium: "Mineirão", cityState: "Belo Horizonte - MG" };
      case "grêmio": return { stadium: "Arena do Grêmio", cityState: "Porto Alegre - RS" };
      case "internacional": return { stadium: "Beira-Rio", cityState: "Porto Alegre - RS" };
      case "bahia": return { stadium: "Arena Fonte Nova", cityState: "Salvador - BA" };
      case "vitória": return { stadium: "Barradão", cityState: "Salvador - BA" };
      case "sport": return { stadium: "Ilha do Retiro", cityState: "Recife - PE" };
      case "santa cruz": return { stadium: "Arruda", cityState: "Recife - PE" };
      case "fortaleza": return { stadium: "Arena Castelão", cityState: "Fortaleza - CE" };
      case "ceará": return { stadium: "Arena Castelão", cityState: "Fortaleza - CE" };
      case "coritiba": return { stadium: "Couto Pereira", cityState: "Curitiba - PR" };
      case "athletico-pr": return { stadium: "Ligga Arena", cityState: "Curitiba - PR" };
      case "ponte preta": return { stadium: "Moisés Lucarelli (Majestoso)", cityState: "Campinas - SP" };
      case "guarani": return { stadium: "Brinco de Ouro da Princesa", cityState: "Campinas - SP" };
      case "botafogo-sp": return { stadium: "Santa Cruz (Arena Nicnet)", cityState: "Ribeirão Preto - SP" };
      case "comercial-rp": return { stadium: "Palma Travassos", cityState: "Ribeirão Preto - SP" };
      case "são josé ec": return { stadium: "Martins Pereira", cityState: "São José dos Campos - SP" };
      case "santo andré": return { stadium: "Bruno José Daniel", cityState: "Santo André - SP" };
      case "são caetano": return { stadium: "Anacleto Campanella", cityState: "São Caetano do Sul - SP" };
      case "são bernardo": return { stadium: "Primeiro de Maio", cityState: "São Bernardo do Campo - SP" };
      case "rio branco": return { stadium: "Décio Vitta", cityState: "Americana - SP" };
      case "união barbarense": return { stadium: "Antonio Guimarães", cityState: "Santa Bárbara d'Oeste - SP" };
      case "paulista jundiaí": return { stadium: "Jayme Cintra", cityState: "Jundiaí - SP" };
      case "ferroviária": return { stadium: "Fonte Luminosa", cityState: "Araraquara - SP" };
      case "xv de piracicaba": return { stadium: "Barão de Serra Negra", cityState: "Piracicaba - SP" };
      case "são bento": return { stadium: "Walter Ribeiro (CIC)", cityState: "Sorocaba - SP" };
      case "noroeste": return { stadium: "Alfredo de Castilho", cityState: "Bauru - SP" };
      case "marília": return { stadium: "Bento de Abreu (Abreuzão)", cityState: "Marília - SP" };
      case "inter de limeira": return { stadium: "Major Levy Sobrinho (Limeirão)", cityState: "Limeira - SP" };
      default: return { stadium: `Estádio Municipal de ${club}`, cityState: "Interior de SP" };
    }
  };

  const homeStadiumInfo = getStadium(currentTorcida.clube);

  if (gameIndex === 1) {
    // Game 1: Regional Classic (Paulistão / Campeonato Estadual)
    const rivalStadiumInfo = getStadium(mainRival.clube);
    const isHighway = isHighwayTrip(currentTorcida.clube, mainRival.clube);
    const isHomeGame = season % 2 === 1;

    let derbyLabel = `Clássico Estadual: ${currentTorcida.clube} x ${mainRival.clube}`;
    const c1 = currentTorcida.clube.toLowerCase();
    const c2 = mainRival.clube.toLowerCase();
    if ((c1 === "santo andré" && c2 === "são caetano") || (c1 === "são caetano" && c2 === "santo andré")) {
      derbyLabel = `Clássico do ABC: ${currentTorcida.clube} x ${mainRival.clube}`;
    } else if ((c1 === "ponte preta" && c2 === "guarani") || (c1 === "guarani" && c2 === "ponte preta")) {
      derbyLabel = `Derby Campineiro: ${currentTorcida.clube} x ${mainRival.clube}`;
    } else if ((c1.includes("botafogo") && c2.includes("comercial")) || (c1.includes("comercial") && c2.includes("botafogo"))) {
      derbyLabel = `Come-Fogo: ${currentTorcida.clube} x ${mainRival.clube}`;
    }

    return {
      matchTitle: isHomeGame ? `${currentTorcida.clube} x ${mainRival.clube}` : `${mainRival.clube} x ${currentTorcida.clube}`,
      homeClub: isHomeGame ? currentTorcida.clube : mainRival.clube,
      awayClub: isHomeGame ? mainRival.clube : currentTorcida.clube,
      rivalTorcida: mainRival.torcida,
      rivalSigla: "",
      stadium: isHomeGame ? homeStadiumInfo.stadium : rivalStadiumInfo.stadium,
      cityState: isHomeGame ? homeStadiumInfo.cityState : rivalStadiumInfo.cityState,
      derbyName: derbyLabel,
      isHome: isHomeGame,
      isLongDistance: !isHomeGame && isHighway,
      isAllyGame: false,
      competition: "🏆 Paulistão / Campeonato Estadual",
      importanceDescription: isHomeGame
        ? `Recepção de alta pressão no nosso estádio (${homeStadiumInfo.stadium}) para defender o nosso caldeirão de arquibancada contra a torcida rival do ${mainRival.clube}.`
        : `Deslocamento e invasão ao setor visitante do estádio ${rivalStadiumInfo.stadium} em ${rivalStadiumInfo.cityState} para apoiar o ${currentTorcida.clube}.`,
    };
  } else if (gameIndex === 2) {
    // Game 2: Home match & Alliance reception (Churrasco & Festa de Aliança)
    const ally = allyTorcida;
    if (ally) {
      return {
        matchTitle: `${currentTorcida.clube} x ${ally.clube}`,
        homeClub: currentTorcida.clube,
        awayClub: ally.clube,
        rivalTorcida: ally.torcida,
        rivalSigla: "",
        stadium: homeStadiumInfo.stadium,
        cityState: homeStadiumInfo.cityState,
        derbyName: `Festa de Aliança & Confraternização (${currentTorcida.eixo_alianca})`,
        isHome: true,
        isLongDistance: false,
        isAllyGame: true,
        competition: "🤝 Amistoso Festivo de Aliança",
        importanceDescription: `Recepção de gala no ${homeStadiumInfo.stadium} para a torcida irmã ${ally.torcida} do ${ally.clube} com churrasco farto de costela de chão na sede, chopp gelado, cortejo conjunto e festa de arquibancada com as duas baterias!`,
      };
    } else {
      const homeMatchOpponent = secondRival || mainRival;
      return {
        matchTitle: `${currentTorcida.clube} x ${homeMatchOpponent.clube}`,
        homeClub: currentTorcida.clube,
        awayClub: homeMatchOpponent.clube,
        rivalTorcida: homeMatchOpponent.torcida,
        rivalSigla: "",
        stadium: homeStadiumInfo.stadium,
        cityState: homeStadiumInfo.cityState,
        derbyName: `Rodada de Caldeirão em Casa: ${currentTorcida.clube} x ${homeMatchOpponent.clube}`,
        isHome: true,
        isLongDistance: false,
        isAllyGame: false,
        competition: "🇧🇷 Brasileirão - Rodada de Casa",
        importanceDescription: `Jogo de alta pressão no estádio ${homeStadiumInfo.stadium} contra o ${homeMatchOpponent.clube}. Como a torcida atua de forma autônoma sem aliança fixa, o foco é 100% no apoio incondicional ao time!`,
      };
    }
  } else if (gameIndex === 3) {
    // Game 3: Long distance away invasion (Brasileirão)
    const rivalStadiumInfo = getStadium(secondRival.clube);
    const isHighway = isHighwayTrip(currentTorcida.clube, secondRival.clube);
    const isDiffState = currentTorcida.estado !== secondRival.estado;
    const derbyLabel = isDiffState
      ? `Confronto Interestadual: ${currentTorcida.clube} x ${secondRival.clube}`
      : `Desafio Estadual: ${currentTorcida.clube} x ${secondRival.clube}`;

    return {
      matchTitle: `${secondRival.clube} x ${currentTorcida.clube}`,
      homeClub: secondRival.clube,
      awayClub: currentTorcida.clube,
      rivalTorcida: secondRival.torcida,
      rivalSigla: "",
      stadium: rivalStadiumInfo.stadium,
      cityState: rivalStadiumInfo.cityState,
      derbyName: derbyLabel,
      isHome: false,
      isLongDistance: isHighway,
      isAllyGame: false,
      competition: "🇧🇷 Brasileirão - Rodada de Fogo",
      importanceDescription: isHighway
        ? `Caravana de estrada pelas rodovias com alto custo logístico e deslocamento em comboio protegido para invadir o setor visitante do ${secondRival.clube} no estádio ${rivalStadiumInfo.stadium}.`
        : `Deslocamento regional estratégico para buscar pontos fora de casa no estádio ${rivalStadiumInfo.stadium} contra o ${secondRival.clube}.`,
    };
  } else {
    // Game 4: Copa do Brasil - Fase Decisiva / Season Finale
    let opponent = clubStatus === "LUTANDO_ACESSO" ? secondRival : mainRival;

    if (challengedRivalTorcida) {
      const allTorcidas = teamsData as OfficialTorcida[];
      const challengedObj = allTorcidas.find(
        (t) => t.torcida.toLowerCase().trim() === challengedRivalTorcida.toLowerCase().trim() && t.clube.toLowerCase().trim() !== userClub
      );
      if (challengedObj) {
        opponent = challengedObj;
      }
    }

    const isTretaMatch = challengedRivalTorcida && opponent.torcida.toLowerCase().trim() === challengedRivalTorcida.toLowerCase().trim();

    let derbyTitle = isTretaMatch
      ? `⚔️ CONFRONTO DA TRETA MARCADA: ${currentTorcida.clube} x ${opponent.clube}`
      : `Final de Temporada: ${currentTorcida.clube} x ${opponent.clube}`;

    let importance = isTretaMatch
      ? `Jogo de vida ou morte no caldeirão do ${homeStadiumInfo.stadium}! Confronto decisivo de fim de temporada contra a torcida desafiada na treta formal (${opponent.torcida}). O clima é de guerra total!`
      : `Jogo decisivo no caldeirão do ${homeStadiumInfo.stadium} contra o ${opponent.clube} valendo a classificação e a taça!`;

    if (clubStatus === "CRISE_REBAIXAMENTO" && !isTretaMatch) {
      derbyTitle = `Batalha pela Sobrevivência: ${currentTorcida.clube} x ${opponent.clube}`;
      importance = `O clube luta para não cair no estádio ${homeStadiumInfo.stadium}! A arquibancada precisa empurrar o time do início ao fim.`;
    } else if (clubStatus === "LUTANDO_ACESSO" && !isTretaMatch) {
      derbyTitle = `Jogo do Acesso: ${currentTorcida.clube} x ${opponent.clube}`;
      importance = `Casa cheia no caldeirão do ${homeStadiumInfo.stadium} contra o ${opponent.clube} para garantir a vaga de acesso.`;
    }

    return {
      matchTitle: `${currentTorcida.clube} x ${opponent.clube}`,
      homeClub: currentTorcida.clube,
      awayClub: opponent.clube,
      rivalTorcida: opponent.torcida,
      rivalSigla: "",
      stadium: homeStadiumInfo.stadium,
      cityState: homeStadiumInfo.cityState,
      derbyName: derbyTitle,
      isHome: true,
      isLongDistance: false,
      isAllyGame: false,
      competition: isTretaMatch ? "⚔️ CLÁSSICO DE REVANCHE - TRETA FORMAL MARCADA" : "⚔️ Copa do Brasil - Mata-Mata Decisivo",
      importanceDescription: importance,
    };
  }
}

// 4 TRANSPORT / CONCENTRATION OPTIONS WITH NUMERIC RETURN AND CAPACITY
export function getTransportOptions(
  isLongDistance: boolean,
  isInterior: boolean = false,
  isHome: boolean = false
): TransportChoice[] {
  if (isHome) {
    return [
      {
        id: "CONCENTRACAO_SEDE_BAR",
        name: "Concentração Massiva na Sede & Bar da Torcida",
        description: "Sede social em ebulição desde cedo. Churrasco de costela no fogo de chão, chopp gelado, bateria aquecendo e cortejo a pé até o nosso caldeirão.",
        costPerMember: 0,
        fixedCost: 0,
        capacityMultiplier: 1.3,
        pistaBonus: 10,
        mpRisk: 2,
        speed: "MEDIO",
      },
      {
        id: "EMBOSCADA_PORTAO_VISITANTE",
        name: "Aguardar Escondido nos Arredores do Portão Visitante (Emboscada)",
        description: "Lideranças e bonde de pista posicionados nas ruas escuras de acesso visitante aguardando a chegada dos comboios rivais.",
        costPerMember: 10,
        fixedCost: 1000,
        capacityMultiplier: 1.1,
        pistaBonus: 22,
        mpRisk: 18,
        speed: "RAPIDO",
      },
      {
        id: "CORDAO_PORTAO_PRINCIPAL",
        name: "Ficar na Porta Principal & Cordão de Segurança Local",
        description: "Garantir a integridade dos portões locais e proteger associados, famílias e a recepção do ônibus do nosso time.",
        costPerMember: 5,
        fixedCost: 300,
        capacityMultiplier: 1.2,
        pistaBonus: 12,
        mpRisk: 3,
        speed: "MEDIO",
      },
      {
        id: "CORTEJO_ONIBUS_TIME",
        name: "Recepção do Ônibus do Time com Pirotecnia & Bateria (Ruada)",
        description: "Ruada histórica com corredores de fumaça viva e bateria para empurrar o elenco do clube antes de entrar no caldeirão.",
        costPerMember: 15,
        fixedCost: 800,
        capacityMultiplier: 1.35,
        pistaBonus: 15,
        mpRisk: 5,
        speed: "LENTO",
      },
    ];
  }
  if (isInterior) {
    if (isLongDistance) {
      return [
        {
          id: "VANS_INTERIOR_FRETADAS",
          name: "Bonde de Vans & Micro-ônibus Fretados na Cidade",
          description: "O transporte clássico das torcidas do interior paulista. Deslocamento rápido pelas rodovias SP-330 / SP-310 com custo acessível.",
          costPerMember: 35,
          fixedCost: 800,
          capacityMultiplier: 1.1,
          pistaBonus: 10,
          mpRisk: 4,
          speed: "RAPIDO",
        },
        {
          id: "KOMBI_CARROS_VICINAIS",
          name: "Kombis e Carros dos Sócios pelas Vicinais",
          description: "Deslocamento independente rateado entre amigos. Corta por cidades vizinhas evitando postos fiscais e bloqueios da polícia.",
          costPerMember: 18,
          fixedCost: 250,
          capacityMultiplier: 0.85,
          pistaBonus: 12,
          mpRisk: 3,
          speed: "RAPIDO",
        },
        {
          id: "ONIBUS_CIRCULAR_INTERMUNICIPAL",
          name: "Bate-Volta Regional em Ônibus Convencional",
          description: "Ônibus fretado com apoio da diretoria para colocar um bom número de integrantes na cidade rival.",
          costPerMember: 25,
          fixedCost: 1500,
          capacityMultiplier: 1.3,
          pistaBonus: 8,
          mpRisk: 8,
          speed: "MEDIO",
        },
        {
          id: "COMBOIO_RODOVIA_CAPITAL",
          name: "Comboio de Ônibus para Invasão da Capital",
          description: "Frota reunida de 3 a 5 ônibus para desafiar os gigantes nos grandes estádios da capital com escolta na chegada.",
          costPerMember: 60,
          fixedCost: 3500,
          capacityMultiplier: 1.45,
          pistaBonus: 16,
          mpRisk: 14,
          speed: "RAPIDO",
        },
      ];
    }

    // Short Distance / Local interior
    return [
      {
        id: "CAMINHADA_PRACA_ESTADIO",
        name: "Arrancada a Pé da Praça Central ao Estádio Municipal",
        description: "Concentração na praça da matriz e caminhada com bateria, sinalizadores e faixas até o portão principal.",
        costPerMember: 0,
        fixedCost: 0,
        capacityMultiplier: 1.4,
        pistaBonus: 18,
        mpRisk: 8,
        speed: "LENTO",
      },
      {
        id: "CARREATAS_MOTOS_BUZINAÇO",
        name: "Carreata com Motos e Bandeiras pelas Avenidas",
        description: "Bonde ruidoso de motos e carros particulares sacudindo as avenidas da cidade até as imediações do estádio.",
        costPerMember: 10,
        fixedCost: 200,
        capacityMultiplier: 1.25,
        pistaBonus: 14,
        mpRisk: 6,
        speed: "RAPIDO",
      },
      {
        id: "VANS_BAIRROS_REGIAO",
        name: "Micro-ônibus Integrando os Bondes dos Bairros e Região",
        description: "Transporte conjunto trazendo sócios das vilas periféricas e cidades vizinhas com segurança.",
        costPerMember: 15,
        fixedCost: 600,
        capacityMultiplier: 1.15,
        pistaBonus: 8,
        mpRisk: 4,
        speed: "RAPIDO",
      },
      {
        id: "CONCENTRACAO_PORTAO_GERAL",
        name: "Concentração Direta nos Bares em Frente ao Portão da Geral",
        description: "Sócios se reúnem nos botecos do entorno do estádio tomando cerveja e organizando a bateria com antecedência.",
        costPerMember: 0,
        fixedCost: 0,
        capacityMultiplier: 0.9,
        pistaBonus: 5,
        mpRisk: -5,
        speed: "RAPIDO",
      },
    ];
  }

  if (isLongDistance) {
    return [
      {
        id: "ONIBUS_LEITO_EXECUTIVO",
        name: "Frota de Ônibus Leito Executivo com Ar",
        description: "Fretamento VIP com banheiros, ar-condicionado e comboio fechado. Mais caro, porém atrai famílias e veteranos com conforto.",
        costPerMember: 140,
        fixedCost: 12000,
        capacityMultiplier: 1.25,
        pistaBonus: 5,
        mpRisk: 0,
        speed: "RAPIDO",
      },
      {
        id: "CONVENCIONAL_FRETADO",
        name: "Comboio de Fretados Convencionais",
        description: "Equilíbrio tradicional entre custo e volume. Frota uniforme com adesivagem e escolta negociada na rodovia.",
        costPerMember: 80,
        fixedCost: 6000,
        capacityMultiplier: 1.0,
        pistaBonus: 8,
        mpRisk: 5,
        speed: "MEDIO",
      },
      {
        id: "VANS_CARROS_RATEIO",
        name: "Bonde de Vans e Carros Particulares (Rateio)",
        description: "Deslocamento fragmentado em dezenas de vans. Muito ágil para despistar barreiras, mas vulnerável se um grupo desgarrar.",
        costPerMember: 50,
        fixedCost: 2000,
        capacityMultiplier: 0.85,
        pistaBonus: 12,
        mpRisk: 10,
        speed: "RAPIDO",
      },
      {
        id: "ONIBUS_POPULAR_LOTAÇÃO",
        name: "Caravana Popular no Limite da Capacidade (Sem Ar)",
        description: "Passagem barateada ao extremo para colocar a massa no estádio. Ônibus lotados, bandeiras pelas janelas e muita pressão.",
        costPerMember: 30,
        fixedCost: 0,
        capacityMultiplier: 1.45,
        pistaBonus: 15,
        mpRisk: 20,
        speed: "LENTO",
      },
    ];
  }

  // Short Distance / Local
  return [
    {
      id: "TREM_METRO_BONDE",
      name: "Bonde Unificado no Metrô / Trem Suburbano",
      description: "A massa se concentra na estação central e ocupa os vagões cantando. Alta pressão psicológica, mas enorme fiscalização da PM.",
      costPerMember: 10,
      fixedCost: 0,
      capacityMultiplier: 1.3,
      pistaBonus: 14,
      mpRisk: 20,
      speed: "RAPIDO",
    },
    {
      id: "ARRANCADA_CAMINHADA",
      name: "Arrancada a Pé da Sede ao Estádio (Comboio de Rua)",
      description: "Caminhada em bloco compacto ocupando as avenidas com bateria, sinalizadores e faixas. Demonstração de força pura na cidade.",
      costPerMember: 0,
      fixedCost: 0,
      capacityMultiplier: 1.4,
      pistaBonus: 18,
      mpRisk: 15,
      speed: "LENTO",
    },
    {
      id: "FROTA_MICROONIBUS",
      name: "Comboio de Micro-ônibus e Vans com Batedores",
      description: "Deslocamento protegido com motos de batedores abrindo cruzamentos e monitorando emboscadas de rivais.",
      costPerMember: 35,
      fixedCost: 3000,
      capacityMultiplier: 1.0,
      pistaBonus: 10,
      mpRisk: 5,
      speed: "RAPIDO",
    },
    {
      id: "ENTRADA_ISOLADA",
      name: "Deslocamento Descentralizado e Concentração nos Portões",
      description: "Cada membro e subsede chega por conta própria com roupas neutras e se junta 40 minutos antes das catracas abrirem.",
      costPerMember: 0,
      fixedCost: 0,
      capacityMultiplier: 0.75,
      pistaBonus: 2,
      mpRisk: -5,
      speed: "RAPIDO",
    },
  ];
}

// CALCULATE SCOUT INTEL BASED ON TRANSPORT & STATS
export function calculateScoutIntel(
  stats: TorcidaStats,
  transport: TransportChoice,
  derby: DerbyMatchInfo,
  isInterior: boolean = false
): MatchScoutReport {
  // Base player attendance
  const multiplier = isInterior ? 8 : 18;
  const caravanaMult = isInterior ? 6 : 12;
  const minAttendance = isInterior ? 60 : 150;
  const baseCount = Math.round((stats.contingente * multiplier + stats.caravana * caravanaMult) * transport.capacityMultiplier);
  const playerMembers = Math.max(minAttendance, baseCount + Math.floor((Math.random() - 0.5) * (isInterior ? 50 : 100)));

  // Rival attendance waiting
  const rivalBase = Math.round(derby.isHome ? playerMembers * 0.45 : playerMembers * 1.25);
  const rivalMembers = Math.max(isInterior ? 50 : 120, rivalBase + Math.floor((Math.random() - 0.5) * (isInterior ? 60 : 120)));

  let police: MatchScoutReport["policePresence"] = "MODERADA";
  if (derby.derbyName.includes("Clássico") || derby.isLongDistance) {
    police = Math.random() > 0.4 ? "INTENSA" : "CHOQUE_TOTAL";
  }
  if (derby.isAllyGame) {
    police = "PACIFICA";
  }

  if (derby.isAllyGame) {
    const allyTwists = [
      {
        title: "Churrasco Farto de Costela de Chão na Sede Social",
        desc: `As diretorias organizaram churrasco com costela de chão e chopp gelado para receber os ${rivalMembers.toLocaleString()} irmãos da ${derby.rivalTorcida}.`,
      },
      {
        title: "Cortejo Unificado e Recepção de Gala no Trevo",
        desc: `Nossos antenas foram ao encontro das vans e ônibus da ${derby.rivalTorcida} na entrada da cidade para escoltá-los em festa com fumaça e bandeirões.`,
      },
      {
        title: "Baterias Unificadas e Ensaio Conjunto de Sambas",
        desc: "Mais de 100 ritmistas das duas torcidas organizaram roda de samba e batucada histórica na praça do estádio antes do jogo.",
      },
      {
        title: "Mosaico Duplo de Irmandade nas Arquibancadas",
        desc: "Os associados prepararam festa visual combinando as cores dos dois clubes nas bancadas com bobinas e faixas intercaladas.",
      },
    ];
    const chosenAllyTwist = allyTwists[Math.floor(Math.random() * allyTwists.length)];
    return {
      playerMembersPresent: playerMembers,
      rivalMembersWaiting: rivalMembers,
      policePresence: police,
      scoutIntelLog: `Relatório dos Antenas: Recepção de gala da torcida aliada (${derby.rivalTorcida}). Clima de pura festa, confraternização e respeito no entorno do ${derby.stadium} com churrasco farto e união das massas.`,
      twistTitle: chosenAllyTwist.title,
      twistDescription: chosenAllyTwist.desc,
    };
  }

  const twists = isInterior
    ? [
        {
          title: "Emboscada Armada no Trevo da Rodovia",
          desc: `Antenas avistaram cerca de ${Math.round(rivalMembers * 0.5)} membros da ${derby.rivalTorcida} entocados com rojões e barras perto da rotatória de acesso ao estádio.`,
        },
        {
          title: "Blitz da Polícia Rodoviária no Pedágio",
          desc: "A Polícia Rodoviária montou barreira exigindo lista de passageiros e vistoriando os instrumentos da bateria.",
        },
        {
          title: "Clima Hostil e Catracas Travadas no Estádio",
          desc: "A torcida mandante bloqueou as vias no entorno e a bilheteria visitante diminuiu a liberação de catracas para gerar tumulto.",
        },
        {
          title: "Oportunidade de Flanqueamento pelas Ruas do Bairro",
          desc: "O bonde rival está focado no portão principal, deixando a travessa lateral livre para um avanço rápido da nossa linha de frente.",
        },
      ]
    : [
        {
          title: "Emboscada Armada na Alça de Acesso",
          desc: `Nossos antenas avistaram cerca de ${Math.round(rivalMembers * 0.6)} membros da ${derby.rivalTorcida} entocados com barras e pedras logo após o pedágio.`,
        },
        {
          title: "Bloqueio do Choque & Revista Pente-Fino",
          desc: "O Batalhão de Choque montou triagem surpresa na rodovia, ameaçando barrar os mastros, bandeirões e reter os ônibus sem nota fiscal.",
        },
        {
          title: "Clima Hostil e Catracas Travadas no Estádio",
          desc: "A torcida mandante bloqueou as vias no entorno e a bilheteria visitante diminuiu a liberação de catracas para gerar tumulto.",
        },
        {
          title: "Oportunidade de Flanqueamento de Pista",
          desc: "O bonde rival está focado no portão B, deixando a via lateral livre para um avanço rápido da nossa linha de frente.",
        },
      ];

  const chosenTwist = twists[Math.floor(Math.random() * twists.length)];

  return {
    playerMembersPresent: playerMembers,
    rivalMembersWaiting: rivalMembers,
    policePresence: police,
    scoutIntelLog: `Relatório dos Antenas: Nosso bonde conta com aproximadamente ${playerMembers.toLocaleString()} integrantes na pista. A torcida rival (${derby.rivalTorcida}) tem cerca de ${rivalMembers.toLocaleString()} pessoas nas imediações. Nível do Choque: ${police}.`,
    twistTitle: chosenTwist.title,
    twistDescription: chosenTwist.desc,
  };
}

// POLICE & SECURITY ALIGNMENT CHOICES
export function getPoliceMeetingChoices(
  derby: DerbyMatchInfo,
  isInterior: boolean = false
): PoliceMeetingChoice[] {
  if (derby.isAllyGame) {
    return [
      {
        id: "CHURRASCO_COSTELA_SEDE",
        title: "1. Recepção de Gala com Churrasco de Costela & Chopp na Sede",
        stance: "DIPLOMATICA",
        description: "Organizar banquete com costela de chão e chopp gelado na sede social, integrando as lideranças, bateria e associados das duas torcidas.",
        cost: 1500,
        mpRiskMod: -20,
        bancadaBonus: 15,
        pistaMod: 10,
        moralMod: 15,
        formattedDeltas: [
          { label: "União & Confraternização", value: "+15 Moral", isPositive: true },
          { label: "Risco MP", value: "-20% (Paz)", isPositive: true },
          { label: "Bateria Conjunta", value: "+15 Bancada", isPositive: true },
          { label: "Custo do Churrasco", value: "-R$ 1.500", isPositive: false },
        ],
        meetingLog: "Festa monumental na sede com costela de chão na brasa, chopp e confraternização histórica com a torcida aliada.",
      },
      {
        id: "CORTEJO_CONJUNTO_TREVO",
        title: "2. Cortejo Conjunto & Recepção do Comboio Irmão no Trevo",
        stance: "COMBATIVA",
        description: "Batedores recepcionam as vans e ônibus da torcida aliada na entrada da rodovia, guiando cortejo unificado até o estádio com fumaça e sinalizadores.",
        cost: 800,
        mpRiskMod: -12,
        bancadaBonus: 12,
        pistaMod: 14,
        moralMod: 12,
        formattedDeltas: [
          { label: "Cortejo de Ruas", value: "+14 União", isPositive: true },
          { label: "Moral da Massa", value: "+12", isPositive: true },
          { label: "Risco MP", value: "-12%", isPositive: true },
          { label: "Fogos & Recepção", value: "-R$ 800", isPositive: false },
        ],
        meetingLog: "Comboio irmão recepcionado com festa de fumaça na rodovia e cortejo unificado pelas ruas da cidade.",
      },
      {
        id: "ACORDO_ACESSO_MISTO_PM",
        title: "3. Acordo de Acesso Unificado com a PM sem Divisórias",
        stance: "DIPLOMATICA",
        description: "Reunião formal com a PM garantindo setor misto e entrada pacífica das duas torcidas lado a lado com bandeiras e instrumentos liberados.",
        cost: 0,
        mpRiskMod: -25,
        bancadaBonus: 10,
        pistaMod: 6,
        moralMod: 10,
        formattedDeltas: [
          { label: "Risco MP", value: "-25% (Pacto)", isPositive: true },
          { label: "Baterias Liberadas", value: "100%", isPositive: true },
          { label: "Entrada Mista", value: "Paz nas Catracas", isPositive: true },
          { label: "Custo Operacional", value: "R$ 0", isPositive: true },
        ],
        meetingLog: "Assinado protocolo de convivência e setor misto com a Polícia Militar para as duas torcidas irmãs.",
      },
      {
        id: "MEGA_PIROTECNIA_DUPLA",
        title: "4. Mega Pirotecnia Dupla & Mosaico de Irmandade",
        stance: "CLANDESTINA",
        description: "Show visual colossal combinando as cores dos dois clubes nas arquibancadas com centenas de sinalizadores e fumaça viva.",
        cost: 2000,
        mpRiskMod: 5,
        bancadaBonus: 20,
        pistaMod: 12,
        moralMod: 16,
        formattedDeltas: [
          { label: "Festa Visual Monumental", value: "+20 Bancada", isPositive: true },
          { label: "Moral Histórica", value: "+16", isPositive: true },
          { label: "Respeito Nacional", value: "+15", isPositive: true },
          { label: "Pirotecnia Conjunta", value: "-R$ 2.000", isPositive: false },
        ],
        meetingLog: "Show de fumaça e sinalizadores unindo as cores das duas torcidas em espetáculo inesquecível.",
      },
    ];
  }

  if (isInterior) {
    return [
      {
        id: "PACTO_CONCILIACAO_PM",
        title: "1. Termo de Ajuste com a PM do Batalhão Regional",
        stance: "DIPLOMATICA",
        description: "Assinar termo de conduta garantindo entrada pacífica da bateria e faixas na praça do estádio em troca de revista sem tumulto.",
        cost: 0,
        mpRiskMod: -15,
        bancadaBonus: 6,
        pistaMod: -4,
        moralMod: 4,
        formattedDeltas: [
          { label: "Risco MP", value: "-15%", isPositive: true },
          { label: "Bateria Liberada", value: "100%", isPositive: true },
          { label: "Pressão de Bancada", value: "+6", isPositive: true },
          { label: "Postura de Pista", value: "-4", isPositive: false },
        ],
        meetingLog: "Assinou termo pacífico com o comando regional, garantindo a entrada de todos os instrumentos sem revistas abusivas.",
      },
      {
        id: "EXIGENCIA_FESTA_LOCAL",
        title: "2. Exigência Irredutível de Sinalizadores & Fumaça",
        stance: "COMBATIVA",
        description: "Pressionar as autoridades municipais e o delegado para liberar o show pirotécnico na rotatória e no alambrado do estádio.",
        cost: 1000,
        mpRiskMod: 12,
        bancadaBonus: 14,
        pistaMod: 6,
        moralMod: 8,
        formattedDeltas: [
          { label: "Festa Visual & Fumaça", value: "+14", isPositive: true },
          { label: "Moral da Massa", value: "+8", isPositive: true },
          { label: "Risco MP", value: "+12%", isPositive: false },
          { label: "Taxa Municipal", value: "-R$ 1.000", isPositive: false },
        ],
        meetingLog: "Bateu o pé na reunião de segurança e garantiu a festa de fumaça nas arquibancadas sob forte vigilância.",
      },
      {
        id: "INFILTRACAO_SUBSEDES",
        title: "3. Infiltração Clandestina de Artefatos pelas Ruas do Bairro",
        stance: "CLANDESTINA",
        description: "Recusar a vistoria oficial e guardar as bandeiras maiores e sinalizadores nas casas de associados vizinhas ao estádio.",
        cost: 500,
        mpRiskMod: 18,
        bancadaBonus: 10,
        pistaMod: 12,
        moralMod: 10,
        formattedDeltas: [
          { label: "Poder de Pista", value: "+12", isPositive: true },
          { label: "Moral", value: "+10", isPositive: true },
          { label: "Risco MP", value: "+18%", isPositive: false },
          { label: "Custos Operacionais", value: "-R$ 500", isPositive: false },
        ],
        meetingLog: "Infiltrou os mastros e fumaças pelas casas dos moradores do entorno, driblando o cerco policial.",
      },
      {
        id: "ALINHAMENTO_POLICIA_RODOVIARIA",
        title: "4. Escolta Rodoviária Negociada desde o Pedágio",
        stance: "ESCOLTA_TOTAL",
        description: "Coordenar passagem com a Polícia Rodoviária nas praças de pedágio da rodovia para comboio direto e seguro.",
        cost: 1200,
        mpRiskMod: -10,
        bancadaBonus: 4,
        pistaMod: 0,
        moralMod: 2,
        formattedDeltas: [
          { label: "Segurança de Rodovia", value: "100% Protegido", isPositive: true },
          { label: "Risco MP", value: "-10%", isPositive: true },
          { label: "Taxa de Apoio", value: "-R$ 1.200", isPositive: false },
        ],
        meetingLog: "Deslocamento de vans totalmente blindado pela Polícia Rodoviária sem registros de emboscada.",
      },
    ];
  }

  // Capital / Interstate Matches
  return [
    {
      id: "PACTO_MP_TERMO_CONDUTA",
      title: "1. Termo de Ajustamento de Conduta (TAC) & Cadastro",
      stance: "DIPLOMATICA",
      description: "Acordo formal com a Promotoria e Choque. Liberação de faixas e bateria cadastrada com vistoria prévia e sem pirotecnia.",
      cost: 0,
      mpRiskMod: -18,
      bancadaBonus: 6,
      pistaMod: -6,
      moralMod: 3,
      formattedDeltas: [
        { label: "Risco MP", value: "-18%", isPositive: true },
        { label: "Bateria Liberada", value: "100%", isPositive: true },
        { label: "Organização", value: "+6", isPositive: true },
        { label: "Poder de Pista", value: "-6", isPositive: false },
      ],
      meetingLog: "Formalizou TAC com as autoridades, garantindo a liberação da bateria sob rígido cadastro.",
    },
    {
      id: "EXIGENCIA_MOSAICO_FESTA",
      title: "2. Exigência Irredutível de Mosaico 3D & Faixas Históricas",
      stance: "COMBATIVA",
      description: "Reivindicar acesso antecipado ao estádio na madrugada para montar o mosaico 3D, bandeirões e bobinas de papel.",
      cost: 2500,
      mpRiskMod: 10,
      bancadaBonus: 16,
      pistaMod: 5,
      moralMod: 10,
      formattedDeltas: [
        { label: "Espetáculo de Mosaico", value: "+16 Bancada", isPositive: true },
        { label: "Moral da Massa", value: "+10", isPositive: true },
        { label: "Risco MP", value: "+10%", isPositive: false },
        { label: "Montagem da Madrugada", value: "-R$ 2.500", isPositive: false },
      ],
      meetingLog: "Conquistou autorização da PM para entrar na madrugada e armar o mosaico 3D monumental na arquibancada.",
    },
    {
      id: "POSTURA_COMBATIVA_CLANDESTINA",
      title: "3. Recusa de Submissão & Entrada Infiltrada de Pirotecnia",
      stance: "CLANDESTINA",
      description: "Boicotar as exigências da PM e infiltrar centenas de sinalizadores marítimos e fumaças por veículos descaracterizados.",
      cost: 1500,
      mpRiskMod: 22,
      bancadaBonus: 12,
      pistaMod: 15,
      moralMod: 12,
      formattedDeltas: [
        { label: "Moral de Rua & Pista", value: "+15", isPositive: true },
        { label: "Pressão de Bancada", value: "+12", isPositive: true },
        { label: "Risco MP", value: "+22%", isPositive: false },
        { label: "Custo Operacional", value: "-R$ 1.500", isPositive: false },
      ],
      meetingLog: "Infiltrou arsenal pirotécnico em caminhões de fornecedores, transformando o setor em brasa viva.",
    },
    {
      id: "ESCOLTA_INTEGRAL_CHOQUE",
      title: "4. Escolta Blindada Fechada pelo Batalhão de Choque",
      stance: "ESCOLTA_TOTAL",
      description: "Fechar comboio restrito com a Tropa de Choque guiando os ônibus da concentração direto para a rampa do estádio visitante.",
      cost: 3000,
      mpRiskMod: -12,
      bancadaBonus: 4,
      pistaMod: -2,
      moralMod: 2,
      formattedDeltas: [
        { label: "Segurança de Frota", value: "Zero Emboscada", isPositive: true },
        { label: "Risco MP", value: "-12%", isPositive: true },
        { label: "Taxa de Escolta", value: "-R$ 3.000", isPositive: false },
      ],
      meetingLog: "Comboio com escolta pesada de viaturas e motos do Choque, impedindo qualquer investida rival no caminho.",
    },
  ];
}

// 5 SIGNIFICANT TACTICAL CHOICES FOR THE BATTLE OR ALLIANCE CELEBRATION
export function getTacticalBattleChoices(
  intel: MatchScoutReport,
  derby: DerbyMatchInfo
): TacticalBattleChoice[] {
  if (derby.isAllyGame) {
    return [
      {
        id: "CHURRASCO_FARTO_CANTOS_INTERCALADOS",
        title: "1. Churrasco Farto no Entorno & Cantos Intercalados de Irmandade",
        description: "Confraternização nas imediações do estádio com churrasco farto, costela no fogo de chão, chopp gelado e cantos em uníssono exaltando a união do eixo.",
        pistaMod: 6,
        moralMod: 8,
        mpPenalty: -15,
        costRisk: 1000,
        injuryRisk: 0,
        tacticalLog: "Churrasco farto na sede e no entorno com cerveja gelada, cantos intercalados e amizade profunda entre as massas.",
        formattedDeltas: [
          { label: "Moral da Torcida", value: "+8", isPositive: true },
          { label: "Respeito Nacional", value: "+7", isPositive: true },
          { label: "Risco MP", value: "-15% (Paz)", isPositive: true },
          { label: "Custo do Banquete", value: "-R$ 1.000", isPositive: false },
        ],
      },
      {
        id: "MOSAICO_DUPLO_FESTA_ARQUIBANCADA",
        title: "2. Espetáculo de Mosaico Duplo & Show de Fumaça das Duas Torcidas",
        description: "Subida triunfal com mosaico gigante e show pirotécnico coordenado unindo as cores dos dois clubes nas bancadas.",
        pistaMod: 4,
        moralMod: 8,
        mpPenalty: 0,
        costRisk: 1800,
        injuryRisk: 0,
        isMosaicTactic: true,
        tacticalLog: "Apresentou mosaico conjunto e espetáculo de fumaça monumental, marcando a história das duas agremiações.",
        formattedDeltas: [
          { label: "Pressão de Bancada", value: "+8", isPositive: true },
          { label: "Moral Histórica", value: "+8", isPositive: true },
          { label: "Mosaico Realizado", value: "Meta Cumprida", isPositive: true },
          { label: "Materiais & Fumaça", value: "-R$ 1.800", isPositive: false },
        ],
      },
      {
        id: "TROCA_FAIXAS_ALAMBRADO_HOMENAGEM",
        title: "3. Troca de Faixas no Alambrado & Homenagem às Lideranças da Aliada",
        description: "Estender a faixa da torcida irmã no setor principal e realizar troca oficial de camisas e placas comemorativas entre as diretorias.",
        pistaMod: 3,
        moralMod: 6,
        mpPenalty: -10,
        costRisk: 500,
        injuryRisk: 0,
        tacticalLog: "Subiu as faixas das duas torcidas lado a lado no alambrado com homenagem e troca solene de camisas de jogo.",
        formattedDeltas: [
          { label: "Respeito Nacional", value: "+8", isPositive: true },
          { label: "União do Eixo", value: "+6 Moral", isPositive: true },
          { label: "Risco MP", value: "-10%", isPositive: true },
          { label: "Placas & Brindes", value: "-R$ 500", isPositive: false },
        ],
      },
      {
        id: "BATERIAS_UNIDAS_SAMBA_HINOS",
        title: "4. Desfile das Duas Baterias Tocando Sambas e Hinos em Conjunto",
        description: "Mais de 100 ritmistas das duas torcidas tocam juntos os surdos, repiques e caixas, contagiando todo o estádio.",
        pistaMod: 4,
        moralMod: 7,
        mpPenalty: -8,
        costRisk: 600,
        injuryRisk: 0,
        tacticalLog: "Baterias unificadas deram um show rítmico inesquecível, cantando os hinos de ambos os clubes do início ao fim.",
        formattedDeltas: [
          { label: "Show de Bateria", value: "+7 Bancada", isPositive: true },
          { label: "Moral da Massa", value: "+7", isPositive: true },
          { label: "Contingente", value: "+5 Sócios", isPositive: true },
          { label: "Apoio Rítmico", value: "-R$ 600", isPositive: false },
        ],
      },
      {
        id: "CORTEJO_ESCOLTA_FRATERNA_RODOVIA",
        title: "5. Cortejo e Escolta Fraterna no Retorno dos Ônibus até a Rodovia",
        description: "Após o apito final, comboio de motos e carros da nossa torcida acompanha a torcida irmã até o acesso da rodovia com aplausos e queima de fogos.",
        pistaMod: 4,
        moralMod: 6,
        mpPenalty: -12,
        costRisk: 400,
        injuryRisk: 0,
        tacticalLog: "Despedida com honras e cortejo fraterno até a rodovia com fogos e agradecimentos pela grande confraternização.",
        formattedDeltas: [
          { label: "Respeito & Honra", value: "+8", isPositive: true },
          { label: "Segurança de Frota", value: "100% Protegido", isPositive: true },
          { label: "Risco MP", value: "-12%", isPositive: true },
          { label: "Fogos de Despedida", value: "-R$ 400", isPositive: false },
        ],
      },
    ];
  }

  // DERBY MATCHES (Casa vs Fora) WITH BRANCHING DECISION TREE: RAMO A (FESTA), RAMO B (COMBATE), RAMO C (EVASÃO)
  const isHome = derby.isHome;

  return [
    // RAMO A: FOCO NA ARQUIBANCADA & FESTA (MATERIAIS)
    {
      id: isHome ? "FESTA_BANDEIRAO_3D_CASA" : "FESTA_FAIXAS_TIRANTES_FORA",
      title: isHome ? "🚩 [RAMO A - FESTA] Bandeirão 3D de Pavilhão no Setor Principal" : "🚩 [RAMO A - FESTA] Faixas de Mão & Tirantes de Setor Visitante",
      description: isHome
        ? "Desfraldar bandeirão 3D gigante cobrindo todo o setor e subir tirantes verticais na entrada do time."
        : "Estender faixas de comitivas e tirantes verticais no setor visitante, contagiando os membros que viajaram.",
      pistaMod: -4,
      moralMod: 7,
      mpPenalty: 0,
      costRisk: isHome ? 3500 : 1500,
      injuryRisk: 0,
      isMosaicTactic: true,
      tacticalLog: isHome
        ? "Subiu o bandeirão 3D de pavilhão cobrindo o setor principal em um espetáculo visual inesquecível de arquibancada."
        : "Apoio ininterrupto no setor visitante com faixas de mão e tirantes representando a agremiação fora de casa.",
      formattedDeltas: [
        { label: "Pressão de Bancada", value: "+7", isPositive: true },
        { label: "Novos Sócios (Massa)", value: "+5", isPositive: true },
        { label: "Foco Pista", value: "-4", isPositive: false },
        { label: "Confecção & Materiais", value: isHome ? "-R$ 3.500" : "-R$ 1.500", isPositive: false },
      ],
    },
    {
      id: isHome ? "FESTA_RUAZAO_FUMACA_CASA" : "FESTA_BATERIA_RITMO_FORA",
      title: isHome ? "🔥 [RAMO A - FESTA] Ruazão de Fogo & Corredor de Sinalizadores" : "🥁 [RAMO A - FESTA] Bateria de Samba & Canto Ininterrupto Visitante",
      description: isHome
        ? "Recepção apoteótica do ônibus do clube nos portões do estádio com dezenas de fumaças e sinalizadores."
        : "Manter mais de 30 ritmistas tocando surdos e repiques os 90 minutos para abafar o som da torcida local.",
      pistaMod: -3,
      moralMod: 8,
      mpPenalty: isHome ? 5 : -5,
      costRisk: isHome ? 2800 : 2000,
      injuryRisk: 0,
      tacticalLog: isHome
        ? "Recepção apoteótica na chegada do ônibus com corredor em brasa viva e show de fumaças nos portões do estádio."
        : "Bateria de samba manteve o canto ininterrupto no setor visitante, abafando os refletores do estádio adverso.",
      formattedDeltas: [
        { label: "Pressão de Bancada", value: "+6", isPositive: true },
        { label: "Contingente (Massa)", value: "+4", isPositive: true },
        { label: "Risco MP", value: isHome ? "+5%" : "-5%", isPositive: !isHome },
        { label: "Arsenal Pirotécnico", value: isHome ? "-R$ 2.800" : "-R$ 2.000", isPositive: false },
      ],
    },

    // RAMO B: FOCO EM COMBATE & PISTA (COMBATE MANTIDO!)
    {
      id: "COMBATE_LINHA_FRENTE_PORTAO",
      title: "⚔️ [RAMO B - COMBATE] Avanço Compacto da Linha de Frente de Pista",
      description: "Marcha compacta dos veteranos e do bonde de combate na rua para impor respeito e controlar o perímetro.",
      pistaMod: 7,
      moralMod: 6,
      mpPenalty: 10,
      costRisk: 1500,
      injuryRisk: 12,
      tacticalLog: "Avançou em linha compacta com o bonde de pista, quebrando a linha rival e impondo respeito no perímetro.",
      formattedDeltas: [
        { label: "Poder de Pista", value: "+7", isPositive: true },
        { label: "Moral do Bonde", value: "+6", isPositive: true },
        { label: "Risco MP", value: "+10%", isPositive: false },
        { label: "Custos Médicos", value: "-R$ 1.500", isPositive: false },
      ],
    },
    {
      id: "COMBATE_GUERRA_ROJOES_MORTEIROS",
      title: "⚔️ [RAMO B - COMBATE] Guerra de Rojões & Bateria de Morteiros de Vara",
      description: "Rajadas pesadas de morteiros e rojões para dispersar a linha adversária antes da aproximação corporal.",
      pistaMod: 8,
      moralMod: 7,
      mpPenalty: 14,
      costRisk: 1800,
      injuryRisk: 10,
      tacticalLog: "Disparou bateria pesada de morteiros de vara e rojões, iluminando a avenida e dispersando o grupo rival.",
      formattedDeltas: [
        { label: "Poder de Fogo de Pista", value: "+8", isPositive: true },
        { label: "Moral de Guerra", value: "+7", isPositive: true },
        { label: "Risco MP", value: "+14%", isPositive: false },
        { label: "Foguetório Pista", value: "-R$ 1.800", isPositive: false },
      ],
    },

    // RAMO C: FOCO EM EVASÃO & PRESERVAÇÃO (FUGA DA PISTA / ZERO FERIDOS)
    {
      id: isHome ? "EVASAO_ENTRADA_ANTECIPADA_CASA" : "EVASAO_CORTEJO_BLINDADO_FORA",
      title: isHome ? "🛡️ [RAMO C - EVASÃO] Entrada Antecipada 2h Antes pelo Portão Principal" : "🛡️ [RAMO C - EVASÃO] Cortejo de Ônibus Blindado com Escolta de Rodovia",
      description: isHome
        ? "Entrar no estádio 2 horas antes do apito inicial com escolta de segurança. Evita 100% o perímetro de confronto."
        : "Comboio de ônibus vai direto da praça de pedágio até a caixa de contenção visitante. Evita emboscadas na estrada.",
      pistaMod: -5,
      moralMod: 4,
      mpPenalty: -12,
      costRisk: 0,
      injuryRisk: 0,
      tacticalLog: isHome
        ? "Evasão de pista bem-sucedida! Entrada antecipada 2h antes com 100% do bonde seguro e zero perdas de membros."
        : "Cortejo blindado de rodovia conduziu a caravana direto ao setor visitante sem nenhum ponto de emboscada.",
      formattedDeltas: [
        { label: "Membros Preservados", value: "100% Seguros (0 Feridos)", isPositive: true },
        { label: "Risco MP", value: "-12%", isPositive: true },
        { label: "Massa / Engajamento", value: "+4 Sócios", isPositive: true },
        { label: "Combate de Rua", value: "Evitado (Fuga)", isPositive: true },
      ],
    },
  ];
}

export function getTierMultiplier(tier?: string): number {
  const t = (tier || "B").toUpperCase().trim();
  if (t === "S" || t === "S-") return 3.0;
  if (t === "A+" || t === "A" || t === "A-") return 2.0;
  if (t === "B+" || t === "B" || t === "B-") return 1.2;
  return 0.6; // Tier C+, C, Locais
}

// RESOLVE COMPLETE MATCH MECHANICS & CALCULATION
export function executeCompleteMatch(
  stats: TorcidaStats,
  state: StateTrackers,
  police: PoliceMeetingChoice | null | undefined,
  transport: TransportChoice,
  intel: MatchScoutReport,
  tactic: TacticalBattleChoice,
  derby: DerbyMatchInfo,
  currentTorcida?: OfficialTorcida,
  presidentProfile?: PresidentProfile | null,
  bateriaDurability: number = 100
): MatchExecutionResult {
  const playerMembers = intel.playerMembersPresent;
  const rivalMembers = intel.rivalMembersWaiting;

  // ALLIED MATCH LOGIC (Churrasco, Irmandade, Confraternização, Zero Confronto Violento)
  if (derby.isAllyGame) {
    const policeCost = police ? police.cost : 0;
    const extraExpenses = transport.fixedCost + tactic.costRisk + policeCost;
    const moralChange = Math.min(22, Math.max(10, 14 + tactic.moralMod + (police ? police.moralMod : 0)));
    const mpAdded = Math.max(0, transport.mpRisk + tactic.mpPenalty + (police ? police.mpRiskMod : 0));

    const scorePlayerClub = Math.max(1, Math.floor(Math.random() * 2 + 1));
    const scoreRivalClub = Math.floor(Math.random() * 2);

    const statusTitle = `FESTA HISTÓRICA DE UNIÃO & CONFRATERNIZAÇÃO EM ${derby.stadium.toUpperCase()}`;

    const deltas: FormattedDelta[] = [
      { label: "Clima no Entorno", value: "Churrasco & Irmandade", isPositive: true },
      { label: "Paz nas Arquibancadas", value: "100% União e Festa", isPositive: true },
      { label: "Efetivo Integrado", value: `${(playerMembers + rivalMembers).toLocaleString()} torcedores`, isPositive: true },
      { label: "Placar do Jogo", value: `${scorePlayerClub} x ${scoreRivalClub}`, isPositive: true },
      { label: "Moral da Torcida", value: `+${moralChange}`, isPositive: true },
      { label: "Custos da Festa", value: `R$ ${extraExpenses.toLocaleString()}`, isPositive: extraExpenses <= 1500 },
      { label: "Baixas Médicas", value: "0 feridos (Festa e Paz)", isPositive: true },
      { label: "Alinhamento PM", value: police ? police.stance : "Padrão", isPositive: true },
    ];

    const chronicleText = `O ${derby.stadium} e a sede social foram palco de uma confraternização memorável com mais de ${playerMembers.toLocaleString()} integrantes da nossa torcida e ${rivalMembers.toLocaleString()} irmãos da ${derby.rivalTorcida}. Com churrasco farto de costela no fogo de chão, chopp gelado e o som das duas baterias unificadas, foi celebrada a amizade histórica do eixo.`;

    return {
      scorePlayerClub,
      scoreRivalClub,
      effectiveForcePlayer: 100,
      effectiveForceRival: 100,
      isVictoryPista: true,
      isVictoryBancada: true,
      statusTitle,
      membersLost: 0,
      medicalCost: 0,
      extraExpenses,
      mpAdded,
      moralChange,
      chronicleText,
      formattedDeltas: deltas,
    };
  }

  // SPECIAL LORE: SANTO ANDRÉ vs GLADIADORES (São Caetano)
  const playerClub = (derby.isHome ? derby.homeClub : derby.awayClub).toLowerCase();
  const isSantoAndrePlayer = playerClub.includes("santo andré");
  const isGladiadoresPlayer = playerClub.includes("são caetano");
  const isSantoAndreRival = derby.rivalTorcida.toLowerCase().includes("andreense") || derby.rivalTorcida.toLowerCase().includes("santo andré");
  const isGladiadoresRival = derby.rivalTorcida.toLowerCase().includes("gladiadores") || derby.rivalTorcida.toLowerCase().includes("são caetano");

  // CASE 1: Player is Santo André vs Gladiadores (São Caetano)
  if (isSantoAndrePlayer && isGladiadoresRival) {
    if (tactic.id === "BRIGA_NA_MAO_LIMPA" || tactic.id === "ATAQUE_FRONTAL_LINHA_FRENTE" || tactic.id === "GUERRA_ROJOES_MORTEIROS") {
      const policeCost = police ? police.cost : 0;
      const medicalCost = 350;
      const extraExpenses = transport.fixedCost + medicalCost + policeCost;
      const membersLost = Math.floor(Math.random() * 2);
      const moralChange = 25;
      const mpAdded = Math.max(4, transport.mpRisk + 6);
      const scorePlayerClub = 2;
      const scoreRivalClub = 0;

      const statusTitle = "MASSACRE ANDREENSE HISTÓRICO: O BONDE DO SANTO ANDRÉ PEGOU O RIVAL NA MÃO LIMPA!";
      const chronicleText = `O confronto no clássico do ABC entrou para os anais da cultura de arquibancada. A torcida do São Caetano tentou armar sua habitual linha com barras de ferro e canos de contenção, mas o bonde da linha de frente do Santo André não recuou um milímetro. Partindo para a trocação franca na mão limpa e na mais pura disposição de rua, os andreenses quebraram a formação rival, tomaram as barras de ferro e aplicaram uma surra histórica que botou a torcida rival para correr em debandada geral. O domínio andreense foi absoluto na pista e nas bancadas do ${derby.stadium}!`;

      const deltas: FormattedDelta[] = [
        { label: "Resultado de Pista", value: "Massacre Andreense Histórico", isPositive: true },
        { label: "Disposição na Mão Limpa", value: "Barras Rivais Desarmadas", isPositive: true },
        { label: "Efetivo na Rua", value: `${playerMembers.toLocaleString()} guerreiros`, isPositive: true },
        { label: "Placar do Jogo", value: `${scorePlayerClub} x ${scoreRivalClub}`, isPositive: true },
        { label: "Moral da Torcida", value: "+25 (Histórico)", isPositive: true },
        { label: "Respeito Nacional", value: "+30", isPositive: true },
        { label: "Baixas Andreenses", value: `${membersLost} ferido leve`, isPositive: true },
        { label: "Custos Operacionais", value: `R$ ${extraExpenses.toLocaleString()}`, isPositive: false },
      ];

      return {
        scorePlayerClub,
        scoreRivalClub,
        effectiveForcePlayer: 95,
        effectiveForceRival: 35,
        isVictoryPista: true,
        isVictoryBancada: true,
        statusTitle,
        membersLost,
        medicalCost,
        extraExpenses,
        mpAdded,
        moralChange,
        chronicleText,
        formattedDeltas: deltas,
      };
    }
  }

  // CASE 2: Player is Gladiadores (São Caetano) vs Santo André
  if (isGladiadoresPlayer && isSantoAndreRival) {
    const policeCost = police ? police.cost : 0;
    const membersLost = Math.max(14, Math.floor(playerMembers * 0.14));
    const medicalCost = Math.max(2600, membersLost * 140);
    const extraExpenses = transport.fixedCost + medicalCost + policeCost;
    const moralChange = -18;
    const mpAdded = Math.max(15, transport.mpRisk + 12);
    const scorePlayerClub = 0;
    const scoreRivalClub = 2;

    const statusTitle = "PREJUÍZO HISTÓRICO NO ABC: O BONDE DO SANTO ANDRÉ VEIO NA DISPOSIÇÃO E ATROPELOU!";
    const chronicleText = `Mesmo com a nossa linha armada tradicionalmente com barras de ferro e madeiramento pesado, o confronto contra a torcida do Santo André resultou em um revés duríssimo para a nossa torcida. A linha de frente andreense veio na pura disposição e na mão limpa, quebrou a nossa contenção no peito aberto e desarticulou completamente o nosso bloco. O prejuízo foi alto em baixas médicas, atendimento hospitalar e abalo moral no ABC.`;

    const deltas: FormattedDelta[] = [
      { label: "Resultado de Pista", value: "Revés e Debandada", isPositive: false },
      { label: "Linha de Ferro", value: "Superada na Mão Limpa", isPositive: false },
      { label: "Placar do Jogo", value: `${scorePlayerClub} x ${scoreRivalClub}`, isPositive: false },
      { label: "Moral da Torcida", value: "-18", isPositive: false },
      { label: "Baixas Hospitalares", value: `-${membersLost} membros feridos`, isPositive: false },
      { label: "Custos Médicos & Reparos", value: `R$ ${extraExpenses.toLocaleString()}`, isPositive: false },
      { label: "Risco Ministério Público", value: `+${mpAdded}%`, isPositive: false },
    ];

    return {
      scorePlayerClub,
      scoreRivalClub,
      effectiveForcePlayer: 40,
      effectiveForceRival: 92,
      isVictoryPista: false,
      isVictoryBancada: false,
      statusTitle,
      membersLost,
      medicalCost,
      extraExpenses,
      mpAdded,
      moralChange,
      chronicleText,
      formattedDeltas: deltas,
    };
  }

  // CASE 3: Home Game without Combat Focus (1.C - Intimidation vs Unguarded Home Incident)
  const isNonCombatHomeGame = derby.isHome && (tactic.isMosaicTactic || tactic.id === "FESTA_MOSAICO_CALDEIRAO" || tactic.id === "CHURRASCO_FARTO_CANTOS_INTERCALADOS");
  if (isNonCombatHomeGame && !derby.isAllyGame) {
    const localRatio = playerMembers / Math.max(1, rivalMembers);
    
    // Intimidation by Mass: Confrontation avoided automatically
    if (localRatio >= 1.25) {
      const scorePlayerClub = Math.floor(Math.random() * 2 + 1);
      const scoreRivalClub = Math.floor(Math.random() * 2);
      const statusTitle = `CASA INTIMIDADORA: RIVAL RECUOU DIANTE DA NOSSA MASSA NO CALDEIRÃO!`;
      const chronicleText = `Foco 100% nas arquibancadas e na festa visual. Diante do contingente massivo da nossa torcida ocupando todas as vias no entorno do ${derby.stadium}, a comitiva visitante do ${derby.rivalTorcida} preferiu não arriscar investidas e manteve-se recolhida sob escolta. A massa impôs respeito por intimidação de número!`;
      
      const deltas: FormattedDelta[] = [
        { label: "Resultado de Pista", value: "Paz por Intimidação de Massa", isPositive: true },
        { label: "Efetivo em Casa", value: `${playerMembers.toLocaleString()} vs ${rivalMembers.toLocaleString()} visitantes (+${Math.round((localRatio - 1) * 100)}%)`, isPositive: true },
        { label: "Placar do Jogo", value: `${scorePlayerClub} x ${scoreRivalClub}`, isPositive: scorePlayerClub >= scoreRivalClub },
        { label: "Moral da Tropa", value: "+10", isPositive: true },
        { label: "Baixas Médicas", value: "0 feridos", isPositive: true },
        { label: "Risco MP", value: "-5%", isPositive: true },
      ];

      return {
        scorePlayerClub,
        scoreRivalClub,
        effectiveForcePlayer: 80,
        effectiveForceRival: 35,
        isVictoryPista: true,
        isVictoryBancada: true,
        statusTitle,
        membersLost: 0,
        medicalCost: 0,
        extraExpenses: transport.fixedCost,
        mpAdded: Math.max(-5, transport.mpRisk - 5),
        moralChange: 10,
        chronicleText,
        formattedDeltas: deltas,
        bannerCaptured: false,
      };
    }
    
    // Unguarded Home Incident
    if (localRatio < 0.9) {
      const membersLost = Math.floor(Math.random() * 15 + 10);
      const medicalCost = membersLost * 120;
      const scorePlayerClub = 0;
      const scoreRivalClub = Math.floor(Math.random() * 2 + 1);
      const statusTitle = `INCIDENTE NO ENTORNO: BONDE VISITANTE APROVEITOU CASA DESGUARNECIDA!`;
      const chronicleText = `Com a nossa diretoria concentrada apenas na montagem do mosaico interno, o bonde visitante do ${derby.rivalTorcida} chegou com contingente pesado nas imediações do estádio e causou um incidente grave com associados desprevenidos no entorno. Houve abalo moral e perdas materiais.`;
      
      const deltas: FormattedDelta[] = [
        { label: "Resultado de Pista", value: "Incidente por Casa Desguarnecida", isPositive: false },
        { label: "Baixas Médicas", value: `-${membersLost} feridos`, isPositive: false },
        { label: "Moral da Tropa", value: "-12", isPositive: false },
        { label: "Placar do Jogo", value: `${scorePlayerClub} x ${scoreRivalClub}`, isPositive: false },
        { label: "Risco MP", value: "+15%", isPositive: false },
      ];

      return {
        scorePlayerClub,
        scoreRivalClub,
        effectiveForcePlayer: 35,
        effectiveForceRival: 75,
        isVictoryPista: false,
        isVictoryBancada: false,
        statusTitle,
        membersLost,
        medicalCost,
        extraExpenses: transport.fixedCost + medicalCost,
        mpAdded: 15,
        moralChange: -12,
        chronicleText,
        formattedDeltas: deltas,
        bannerCaptured: false,
      };
    }
  }

  // ------------------------------------------------------------------------
  // 1. TIER LOOKUP & EXPONENTIAL MULTIPLIER COEFICIENTS
  // ------------------------------------------------------------------------
  const allTorcidas = teamsData as OfficialTorcida[];
  const rivalTorcidaObj = allTorcidas.find(
    (t) => t.torcida.toLowerCase().trim() === derby.rivalTorcida.toLowerCase().trim()
  );

  const playerTier = currentTorcida?.tier || "B";
  const rivalTier = rivalTorcidaObj ? rivalTorcidaObj.tier : "B";
  const rivalPoderPista = rivalTorcidaObj ? rivalTorcidaObj.poder_pista : (derby.isHome ? 45 : 75);

  const coefTierPlayer = getTierMultiplier(playerTier);
  const coefTierRival = getTierMultiplier(rivalTier);

  // ------------------------------------------------------------------------
  // 3. COMPORTAMENTO ESPECÍFICO DE TORCIDAS DE PERFIL FAMÍLIA / BARRA (PISTA < 40)
  // ------------------------------------------------------------------------
  const isFamilyProfilePlayer = stats.poder_pista < 40 || playerTier === "C" || playerTier === "C+";
  const isHeavyUltrasRival = rivalPoderPista >= 70 || rivalTier === "S" || rivalTier === "S-" || rivalTier === "A+";

  if (isFamilyProfilePlayer && isHeavyUltrasRival && !derby.isAllyGame) {
    const isPoliceIntervention = Math.random() < 0.5;
    const scorePlayerClub = Math.floor(Math.random() * 2);
    const scoreRivalClub = scorePlayerClub + 1;
    const membersLost = isPoliceIntervention ? 1 : Math.floor(Math.random() * 8 + 6);
    const medicalCost = isPoliceIntervention ? 300 : membersLost * 140;
    const extraExpenses = transport.fixedCost + medicalCost + (police ? police.cost : 0);
    const mpAdded = isPoliceIntervention ? 4 : 12;
    const moralChange = isPoliceIntervention ? -4 : -10;

    const statusTitle = isPoliceIntervention
      ? `PROTEÇÃO DA MASSA & INTERVENÇÃO DA PM EM ${derby.stadium.toUpperCase()}`
      : `RECUO ESTRATÉGICO PARA OS VEÍCULOS EM ${derby.stadium.toUpperCase()}`;

    const chronicleText = isPoliceIntervention
      ? `Diante da aproximação do bonde pesado da ${derby.rivalTorcida}, a diretoria priorizou a segurança das famílias e associados. O Batalhão de Choque interveio rapidamente com bombas de efeito moral, dispersando o cerco e evitando um confronto direto contra a linha de frente rival.`
      : `Ao avistar o avanço da linha de frente adversária da ${derby.rivalTorcida}, o bonde local iniciou corrida de proteção em direção à frota de veículos. O recuo imediato evitou baixas graves contra uma superpotência de pista, registrando apenas pequenas escoriações e despesas médicas de R$ ${medicalCost.toLocaleString()}.`;

    const deltas: FormattedDelta[] = [
      { label: "Resultado de Pista", value: isPoliceIntervention ? "Intervenção da PM (Confronto Evitado)" : "Recuo e Proteção dos Veículos", isPositive: false },
      { label: "Diretriz de Perfil", value: "Prioridade: Família & Massa (Pista < 40)", isPositive: true },
      { label: "Efetivo Presente", value: `${playerMembers.toLocaleString()} vs ${rivalMembers.toLocaleString()}`, isPositive: false },
      { label: "Placar do Jogo", value: `${scorePlayerClub} x ${scoreRivalClub}`, isPositive: false },
      { label: "Moral da Torcida", value: `${moralChange}`, isPositive: false },
      { label: "Custos Médicos & Frota", value: `R$ ${extraExpenses.toLocaleString()}`, isPositive: false },
    ];

    return {
      scorePlayerClub,
      scoreRivalClub,
      effectiveForcePlayer: 20,
      effectiveForceRival: 85,
      isVictoryPista: false,
      isVictoryBancada: false,
      statusTitle,
      membersLost,
      medicalCost,
      extraExpenses,
      mpAdded,
      moralChange,
      chronicleText,
      formattedDeltas: deltas,
      bannerCaptured: false,
    };
  }

  // ------------------------------------------------------------------------
  // 1.B. FÓRMULA DE PODER EFETIVO DE COMBATE (PEC)
  // ------------------------------------------------------------------------
  const ratio = playerMembers / Math.max(1, rivalMembers);
  const presidentCombatMult = presidentProfile === "LINHA_FRENTE" ? 1.15 : 1.0;

  // Força Base = (Poder Pista * Coeficiente Tier) * (Bonde Presente / 100)
  const fuerzaBasePlayer = (stats.poder_pista * coefTierPlayer) * (playerMembers / 100) * presidentCombatMult;
  const fuerzaBaseRival = (rivalPoderPista * coefTierRival) * (rivalMembers / 100);

  // Modificadores = (Moral * 0.1) + (Bônus Armamento/Batedores * 0.15) - (Penalidade Emboscada Sofrida * 0.25)
  const moralModPlayer = (state.moral / 100) * 0.10;

  let weaponsModPlayer = 0;
  if (tactic.id === "CONFRONTO_BARRA_FERRO" || tactic.id === "GUERRA_ROJOES_MORTEIROS" || tactic.id === "ATAQUE_FRONTAL_LINHA_FRENTE") {
    weaponsModPlayer += 0.15;
  }
  if (transport.pistaBonus >= 14) weaponsModPlayer += 0.05;

  let ambushModPlayer = 0;
  let ambushModRival = 0;
  if (tactic.id === "ATAQUE_SURPRESA_EMBOSCADA") {
    ambushModPlayer += 0.15;
    ambushModRival -= 0.25;
  }
  if (intel.twistTitle.includes("Emboscada") || intel.twistTitle.includes("Bloqueio")) {
    ambushModPlayer -= 0.25;
  }

  const modTotalPlayer = moralModPlayer + weaponsModPlayer + ambushModPlayer;
  const modTotalRival = 0.08 + ambushModRival;

  // RNG Limitado (-5 a +5)
  const rngPlayer = Math.random() * 10 - 5;
  const rngRival = Math.random() * 10 - 5;

  const playerForce = Math.max(5, Math.round(fuerzaBasePlayer * (1 + modTotalPlayer) + rngPlayer));
  const rivalForce = Math.max(5, Math.round(fuerzaBaseRival * (1 + modTotalRival) + rngRival));

  // ⚠️ REGRA DE OURO (TRAVA DE TIER E DESVANTAGEM NUMÉRICA 2 PARA 1):
  let isVictoryPista = playerForce >= rivalForce;
  const tierDiff = coefTierRival / coefTierPlayer; // ex: Tier S (3.0) / Tier C (0.6) = 5.0
  const is2to1Disadvantage = rivalMembers >= playerMembers * 2.0;

  // Se PEC Adversário > PEC Jogador * 1.5 OU desvantagem de mais de 2 Tiers / desvantagem 2:1, derrota é 100% GARANTIDA
  if (rivalForce > playerForce * 1.5 || (tierDiff >= 2.5 && rivalForce > playerForce) || (is2to1Disadvantage && rivalForce > playerForce)) {
    isVictoryPista = false;
  }

  // ------------------------------------------------------------------------
  // 2. REGRAS RESTRITIVAS PARA CAPTURA E PERDA DE FAIXAS
  // ------------------------------------------------------------------------
  // 1) Vitória Esmagadora (PEC Jogador >= PEC Rival * 1.8)
  // 2) Emboscada com batedores OU Desvantagem Numérica Crítica do Rival (playerMembers >= rivalMembers * 1.8)
  // 3) Torcidas Tier C ou Pista < 50 NUNCA podem tomar faixa de Tier S/A
  // 4) Chance base máxima: 5% a 8% (Math.random() < 0.08)
  const isOverwhelmingVictory = playerForce >= rivalForce * 1.8;
  const isRivalDisadvantaged = tactic.id === "ATAQUE_SURPRESA_EMBOSCADA" || playerMembers >= rivalMembers * 1.8;
  const isTierEligible = !( (playerTier === "C" || playerTier === "C+" || stats.poder_pista < 50) && (rivalTier === "S" || rivalTier === "S-" || rivalTier === "A+" || rivalTier === "A") );

  const bannerCaptured = isVictoryPista && isOverwhelmingVictory && isRivalDisadvantaged && isTierEligible && Math.random() < 0.08;

  // Condição para PERDER FAIXA:
  const isSeverePistaLoss = !isVictoryPista && (rivalForce >= playerForce * 1.8) && !derby.isHome && (coefTierRival > coefTierPlayer);
  const bannerLost = isSeverePistaLoss && Math.random() < 0.12;

  // Football match result calculation based on Ultras Pressão de Bancada + Moral + Police alignment + Tactic
  const scorePower =
    stats.pressao_bancada * 0.45 +
    state.moral * 0.35 +
    (police ? police.bancadaBonus * 0.5 : 0) +
    (tactic.isMosaicTactic ? 14 : 0) +
    (isVictoryPista ? 15 : -10) +
    (Math.random() - 0.5) * 25;

  let scorePlayerClub = scorePower > 50 ? Math.floor(Math.random() * 2 + 1) : Math.floor(Math.random() * 2);
  let scoreRivalClub = isVictoryPista ? Math.max(0, scorePlayerClub - Math.floor(Math.random() * 2 + 1)) : scorePlayerClub + 1;

  const isVictoryBancada = isVictoryPista || (tactic.isMosaicTactic ?? false);
  const membersLost = isVictoryPista
    ? Math.floor(Math.random() * 4 + 1)
    : Math.floor(Math.random() * 22 + 8);

  const medicalCost = isVictoryPista
    ? tactic.costRisk
    : tactic.costRisk + Math.floor(Math.random() * 1200 + 600);

  const policeCost = police ? police.cost : 0;
  const extraExpenses = transport.fixedCost + medicalCost + policeCost;
  const mpAdded = Math.max(0, transport.mpRisk + tactic.mpPenalty + (police ? police.mpRiskMod : 0));
  let moralChange = isVictoryPista
    ? Math.min(15, Math.max(3, 7 + tactic.moralMod + (police ? police.moralMod : 0)))
    : Math.min(-2, -8 + tactic.moralMod + (police ? police.moralMod : 0));

  if (bannerCaptured) {
    moralChange += 10;
  }

  let statusTitle = isVictoryPista
    ? `VITÓRIA & CONTROLE EM ${derby.stadium.toUpperCase()}`
    : `CONFRONTO ADVERSO & CONTENÇÃO EM ${derby.stadium.toUpperCase()}`;

  if (bannerCaptured) {
    statusTitle = `🏴‍☠️ VITÓRIA COM FAIXA RIVAL CAPTURADA EM ${derby.stadium.toUpperCase()}!`;
  } else if (bannerLost) {
    moralChange = -20;
    statusTitle = "PERDA DRAMÁTICA DE BANDEIRÃO & COBRANÇA VIOLENTA NA SEDE";
  }

  const deltas: FormattedDelta[] = [
    { label: "Resultado de Pista", value: isVictoryPista ? (bannerCaptured ? "Vitória & Faixa Capturada" : "Vitória e Domínio") : "Contenção / Recuo", isPositive: isVictoryPista },
    { label: "Efetivo na Rua", value: `${playerMembers.toLocaleString()} vs ${rivalMembers.toLocaleString()} (${ratio >= 1 ? `+${Math.round((ratio - 1) * 100)}%` : `-${Math.round((1 - ratio) * 100)}%`})`, isPositive: ratio >= 1 },
    { label: "Força de Pista", value: `${playerForce} pts vs ${rivalForce} pts`, isPositive: isVictoryPista },
    { label: "Placar do Jogo", value: `${scorePlayerClub} x ${scoreRivalClub}`, isPositive: scorePlayerClub >= scoreRivalClub },
    { label: "Moral da Tropa", value: moralChange >= 0 ? `+${moralChange}` : `${moralChange}`, isPositive: moralChange >= 0 },
    { label: "Custos do Jogo", value: `R$ ${extraExpenses.toLocaleString()}`, isPositive: extraExpenses === 0 },
    { label: "Baixas Médicas", value: membersLost === 0 ? "0 feridos" : `-${membersLost} feridos`, isPositive: membersLost <= 4 },
  ];

  if (bannerCaptured) {
    deltas.unshift({
      label: "🏴‍☠️ TROFÉU DE PISTA",
      value: `FAIXA DO ${derby.rivalTorcida.toUpperCase()} TOMADA (+10 MORAL)`,
      isPositive: true,
    });
  } else if (bannerLost) {
    deltas.unshift({
      label: "⚠️ PATRIMÔNIO PERDIDO",
      value: "BANDEIRÃO TOMADO DA LINHA (-20 MORAL)",
      isPositive: false,
    });
  }

  const chronicleText = bannerCaptured
    ? `Jornada gloriosa registrada no patrimônio da torcida. Além da vitória na pista, a nossa linha de frente arrancou a faixa oficial do ${derby.rivalTorcida}, trazendo um troféu inestimável para o salão da sede (+10 Moral)!`
    : bannerLost
    ? `Um dia fatídico gravado com dor na memória da torcida. A perda do bandeirão oficial na emboscada abalou a alma do pavilhão (-20 Moral), gerando cobrança pesada e reunião de emergência com a velha guarda na sede social.`
    : `O comboio ocupou as vias do ${derby.stadium} com aproximadamente ${intel.playerMembersPresent.toLocaleString()} integrantes. A postura de segurança (${police?.title || "alinhamento padrão"}) e a tática de ${tactic.title.toLowerCase()} definiram os acontecimentos. Nas arquibancadas, os cantos ecoaram sem parar até o apito final.`;

  return {
    scorePlayerClub,
    scoreRivalClub,
    effectiveForcePlayer: playerForce,
    effectiveForceRival: rivalForce,
    isVictoryPista,
    isVictoryBancada,
    statusTitle,
    membersLost,
    medicalCost,
    extraExpenses,
    mpAdded,
    moralChange,
    chronicleText,
    formattedDeltas: deltas,
    bannerCaptured,
  };
}

// SEASON OBJECTIVES GENERATION & EVALUATION
export function generateSeasonObjectives(
  season: number,
  torcida: OfficialTorcida,
  status: ClubStatus
): SeasonObjective[] {
  const isInterior = isInteriorSP(torcida);
  const objectives: SeasonObjective[] = [];

  // Objective 1: Bancada & Mosaico / Espetáculo
  if (season % 2 === 1) {
    objectives.push({
      id: `obj_mosaico_s${season}`,
      category: "MOSAICO",
      icon: "🎨",
      title: "Espetáculo de Mosaico & Pirotecnia",
      description: "Realizar pelo menos 1 grande festa de Mosaico 3D ou show pirotécnico em um dos confrontos clássicos.",
      targetValue: 1,
      currentValue: 0,
      targetUnit: "festa",
      isCompleted: false,
      isFailed: false,
      rewardText: "+15 Moral da Bancada e +12 Respeito Nacional",
      rewardCash: 0,
      rewardMoral: 15,
      rewardRespeito: 12,
    });
  } else {
    objectives.push({
      id: `obj_bancada_s${season}`,
      category: "BANCADA",
      icon: "🥁",
      title: "Caldeirão Absoluto na Bancada",
      description: "Alcançar ou manter o atributo de Pressão de Bancada em 82 pontos ou mais.",
      targetValue: 82,
      currentValue: torcida.pressao_bancada,
      targetUnit: "pts",
      isCompleted: torcida.pressao_bancada >= 82,
      isFailed: false,
      rewardText: "+R$ 8.000 no Caixa da Loja e +10 Moral",
      rewardCash: 8000,
      rewardMoral: 10,
      rewardRespeito: 8,
    });
  }

  // Objective 2: Pista & Caravana
  if (isInterior) {
    objectives.push({
      id: `obj_pista_s${season}`,
      category: "PISTA",
      icon: "🥊",
      title: "Respeito nas Rodovias Regionais",
      description: "Vencer pelo menos 2 confrontos ou deslocamentos no ano sem perder faixas.",
      targetValue: 2,
      currentValue: 0,
      targetUnit: "vitórias",
      isCompleted: false,
      isFailed: false,
      rewardText: "+14 Poder de Pista e +10 Respeito Nacional",
      rewardCash: 0,
      rewardMoral: 12,
      rewardRespeito: 10,
    });
  } else {
    objectives.push({
      id: `obj_pista_s${season}`,
      category: "PISTA",
      icon: "🥊",
      title: "Hegemonia de Pista & Estradas",
      description: "Conquistar pelo menos 2 vitórias de pista e comboio nos clássicos da temporada.",
      targetValue: 2,
      currentValue: 0,
      targetUnit: "vitórias",
      isCompleted: false,
      isFailed: false,
      rewardText: "+15 Respeito Nacional e +10 Moral de Rua",
      rewardCash: 0,
      rewardMoral: 10,
      rewardRespeito: 15,
    });
  }

  // Objective 3: Finanças, Massa ou Ministério Público
  const randType = (season + torcida.contingente) % 3;
  if (randType === 0) {
    objectives.push({
      id: `obj_mp_s${season}`,
      category: "DISCIPLINA_MP",
      icon: "⚖️",
      title: "Ficha Limpa com o Ministério Público",
      description: "Fechar a temporada com o Risco MP abaixo de 45% sem sofrer suspensão de faixas ou bateria.",
      targetValue: 45,
      currentValue: 10,
      targetUnit: "% max",
      isCompleted: false,
      isFailed: false,
      rewardText: "+R$ 10.000 em patrocínios da sede e tranquilidade institucional",
      rewardCash: 10000,
      rewardMoral: 8,
      rewardRespeito: 8,
    });
  } else if (randType === 1) {
    const targetCash = isInterior ? 20000 : 35000;
    objectives.push({
      id: `obj_fin_s${season}`,
      category: "FINANCAS",
      icon: "💰",
      title: "Superávit e Caixa Forte na Sede",
      description: `Acumular saldo em caixa superior a R$ ${targetCash.toLocaleString()} ao final do 13º ciclo.`,
      targetValue: targetCash,
      currentValue: torcida.autonomia_financeira * 500,
      targetUnit: "R$",
      isCompleted: false,
      isFailed: false,
      rewardText: "+10 Autonomia Financeira e +12 Moral",
      rewardCash: 5000,
      rewardMoral: 12,
      rewardRespeito: 8,
    });
  } else {
    objectives.push({
      id: `obj_massa_s${season}`,
      category: "MASSA",
      icon: "👥",
      title: "Campanha de Expansão do Contingente",
      description: `Elevar a Massa / Contingente para atingir pelo menos ${Math.min(95, torcida.contingente + 6)} pontos.`,
      targetValue: Math.min(95, torcida.contingente + 6),
      currentValue: torcida.contingente,
      targetUnit: "pts",
      isCompleted: false,
      isFailed: false,
      rewardText: "+R$ 6.000 em mensalidades de sócios e +10 Moral",
      rewardCash: 6000,
      rewardMoral: 10,
      rewardRespeito: 6,
    });
  }

  return objectives;
}

export function evaluateSeasonEndObjectives(
  objectives: SeasonObjective[],
  stats: TorcidaStats,
  state: StateTrackers,
  bankBalance: number,
  isBannedByMP: boolean
): {
  updatedObjectives: SeasonObjective[];
  completedCount: number;
  totalCashBonus: number;
  totalMoralBonus: number;
  totalRespeitoBonus: number;
  summaryLogs: string[];
} {
  let completedCount = 0;
  let totalCashBonus = 0;
  let totalMoralBonus = 0;
  let totalRespeitoBonus = 0;
  const summaryLogs: string[] = [];

  const updatedObjectives = objectives.map((obj) => {
    let completed = obj.isCompleted;

    if (obj.category === "BANCADA") {
      completed = stats.pressao_bancada >= obj.targetValue;
      obj.currentValue = stats.pressao_bancada;
    } else if (obj.category === "MASSA") {
      completed = stats.contingente >= obj.targetValue;
      obj.currentValue = stats.contingente;
    } else if (obj.category === "FINANCAS") {
      completed = bankBalance >= obj.targetValue;
      obj.currentValue = bankBalance;
    } else if (obj.category === "DISCIPLINA_MP") {
      completed = !isBannedByMP && state.risco_mp <= obj.targetValue;
      obj.currentValue = state.risco_mp;
    } else if (obj.category === "PISTA" || obj.category === "MOSAICO" || obj.category === "CARAVANA") {
      completed = obj.currentValue >= obj.targetValue;
    }

    if (completed) {
      completedCount++;
      totalCashBonus += obj.rewardCash;
      totalMoralBonus += obj.rewardMoral;
      totalRespeitoBonus += obj.rewardRespeito;
      summaryLogs.push(`✅ [Objetivo Cumprido] ${obj.title}: Recompensa recebida (${obj.rewardText})!`);
      return { ...obj, isCompleted: true, isFailed: false };
    } else {
      summaryLogs.push(`❌ [Objetivo Não Atingido] ${obj.title}: Meta não alcançada nesta temporada.`);
      return { ...obj, isCompleted: false, isFailed: true };
    }
  });

  return {
    updatedObjectives,
    completedCount,
    totalCashBonus,
    totalMoralBonus,
    totalRespeitoBonus,
    summaryLogs,
  };
}

// 9 TAILORED ACTION EVENTS EXACTLY MATCHING THE 9 NON-GAME PIPELINE STEPS
export function getActionStepEvents(status: ClubStatus, season: number = 1, currentTorcida?: OfficialTorcida | null): Record<number, ActionStepEvent> {
  const isInterior = isInteriorSP(currentTorcida);
  return {
    0: getSeasonalActionEvent(1, season, 0, isInterior),
    1: getSeasonalActionEvent(1, season, 1, isInterior),
    3: getSeasonalActionEvent(2, season, 3, isInterior),
    4: getSeasonalActionEvent(2, season, 4, isInterior),
    6: getSeasonalActionEvent(3, season, 6, isInterior),
    7: getSeasonalActionEvent(3, season, 7, isInterior),
    9: getSeasonalActionEvent(4, season, 9, isInterior),
    10: getSeasonalActionEvent(4, season, 10, isInterior),
    12: getSeasonalActionEvent(5, season, 12, isInterior),
  };
}

// 13 PIPELINE STEPS (4 GAMES, 9 ACTIONS) WITH SEASONAL VARIETY
export function getAnnualPipelineWithMatches(
  currentTorcida: OfficialTorcida,
  clubStatus: ClubStatus,
  season: number = 1,
  challengedRivalTorcida?: string | null
) {
  const isInterior = isInteriorSP(currentTorcida);
  const derby1 = getDerbyForMatch(currentTorcida, 1, clubStatus, season, challengedRivalTorcida);
  const derby2 = getDerbyForMatch(currentTorcida, 2, clubStatus, season, challengedRivalTorcida);
  const derby3 = getDerbyForMatch(currentTorcida, 3, clubStatus, season, challengedRivalTorcida);
  const derby4 = getDerbyForMatch(currentTorcida, 4, clubStatus, season, challengedRivalTorcida);

  const act0 = getSeasonalActionEvent(1, season, 0, isInterior);
  const act1 = getSeasonalActionEvent(1, season, 1, isInterior);
  const act3 = getSeasonalActionEvent(2, season, 3, isInterior);
  const act4 = getSeasonalActionEvent(2, season, 4, isInterior);
  const act6 = getSeasonalActionEvent(3, season, 6, isInterior);
  const act7 = getSeasonalActionEvent(3, season, 7, isInterior);
  const act9 = getSeasonalActionEvent(4, season, 9, isInterior);
  const act10 = getSeasonalActionEvent(4, season, 10, isInterior);
  const act12 = getSeasonalActionEvent(5, season, 12, isInterior);

  return [
    {
      stepIndex: 0,
      type: "action" as const,
      title: act0.title,
      category: act0.category,
      description: act0.contextNarrative,
      actionEvent: act0,
    },
    {
      stepIndex: 1,
      type: "action" as const,
      title: act1.title,
      category: act1.category,
      description: act1.contextNarrative,
      actionEvent: act1,
    },
    {
      stepIndex: 2,
      type: "key_game" as const,
      title: `🔥 JOGO 1: ${derby1.matchTitle} - ${derby1.derbyName}`,
      description: `${derby1.importanceDescription} Estádio: ${derby1.stadium} (${derby1.cityState}).`,
      gameNumber: 1,
      derby: derby1,
    },
    {
      stepIndex: 3,
      type: "action" as const,
      title: act3.title,
      category: act3.category,
      description: act3.contextNarrative,
      actionEvent: act3,
    },
    {
      stepIndex: 4,
      type: "action" as const,
      title: act4.title,
      category: act4.category,
      description: act4.contextNarrative,
      actionEvent: act4,
    },
    {
      stepIndex: 5,
      type: "key_game" as const,
      title: `🤝 JOGO 2: ${derby2.matchTitle} - ${derby2.derbyName}`,
      description: `${derby2.importanceDescription} Estádio: ${derby2.stadium} (${derby2.cityState}).`,
      gameNumber: 2,
      derby: derby2,
    },
    {
      stepIndex: 6,
      type: "action" as const,
      title: act6.title,
      category: act6.category,
      description: act6.contextNarrative,
      actionEvent: act6,
    },
    {
      stepIndex: 7,
      type: "action" as const,
      title: act7.title,
      category: act7.category,
      description: act7.contextNarrative,
      actionEvent: act7,
    },
    {
      stepIndex: 8,
      type: "key_game" as const,
      title: `🔥 JOGO 3: ${derby3.matchTitle} - ${derby3.derbyName}`,
      description: `${derby3.importanceDescription} Estádio: ${derby3.stadium} (${derby3.cityState}).`,
      gameNumber: 3,
      derby: derby3,
    },
    {
      stepIndex: 9,
      type: "action" as const,
      title: act9.title,
      category: act9.category,
      description: act9.contextNarrative,
      actionEvent: act9,
    },
    {
      stepIndex: 10,
      type: "action" as const,
      title: act10.title,
      category: act10.category,
      description: act10.contextNarrative,
      actionEvent: act10,
    },
    {
      stepIndex: 11,
      type: "key_game" as const,
      title: `🏆 JOGO 4: ${derby4.matchTitle} - ${derby4.derbyName}`,
      description: `${derby4.importanceDescription} Estádio: ${derby4.stadium} (${derby4.cityState}).`,
      gameNumber: 4,
      derby: derby4,
    },
    {
      stepIndex: 12,
      type: "action" as const,
      title: act12.title,
      category: act12.category,
      description: act12.contextNarrative,
      actionEvent: act12,
    },
  ];
}

// Server-Side Gemini AI Chronicle Generator with Rich Authentic Torcida Slang Fallback
export async function generateGeminiChronicle(payload: any): Promise<string> {
  try {
    const response = await fetch("/api/chronicle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.chronicle && typeof data.chronicle === "string" && data.chronicle.trim().length > 20) {
        return data.chronicle.trim();
      }
    }
  } catch {
    // Network or API failure fallback
  }

  // 1. ALLIED GAME FALLBACK
  if (payload.isAllyGame) {
    const allyStories = [
      `A recepção no ${payload.stadium || "estádio"} e na sede foi uma verdadeira aula de confraternização e respeito mútuo. O churrasco farto de costela no fogo de chão e o chopp trincando selaram a união histórica entre a ${payload.torcida || "nossa torcida"} e os irmãos da ${payload.rivalTorcida || "aliada"}.\n\nNo cortejo conjunto, as duas massas caminharam lado a lado pelas avenidas com fumaça e sinalizadores. Dentro do estádio, as baterias unificadas ditaram um ritmo arrepiante que levantou todo o setor, mostrando para o Brasil a força da amizade e a lealdade inabalável do nosso eixo.`,
      `O dia foi marcado pela celebração pacífica e vibrante da nossa irmandade com a ${payload.rivalTorcida || "aliada"}. Desde as primeiras horas da manhã, as churrasqueiras da sede social trabalharam sem parar, reunindo os veteranos e a nova geração em um banquete de respeito.\n\nNa subida para as arquibancadas, os mosaicos e trapos das duas agremiações se entrelaçaram no alambrado. Ao som dos surdos de marcação e repiques em perfeita sintonia, as duas torcidas cantaram os 90 minutos em clima de festa pura, reafirmando que o respeito no nosso pavilhão é eterno.`,
      `Um espetáculo de união que ficará gravado na memória da bancada. A diretoria e os antenas organizaram a escolta de gala para recepcionar a caravana da ${payload.rivalTorcida || "aliada"} no trevo da rodovia com festa de fumaça.\n\nO encontro na praça foi embalado por uma roda de samba monumental, muita cerveja gelada e abraços fraternos entre as lideranças. Dentro do ${payload.stadium || "estádio"}, as duas torcidas fizeram um show à parte, cantando em uníssono e demonstrando a grandeza das nossas cores.`,
    ];
    return allyStories[Math.floor(Math.random() * allyStories.length)];
  }

  // 2. SPECIAL SANTO ANDRÉ vs GLADIADORES FALLBACK
  const isSantoAndre = (payload.clube || "").toLowerCase().includes("santo andré") || (payload.torcida || "").toLowerCase().includes("andreense");
  const isGladiadoresRival = (payload.rivalTorcida || "").toLowerCase().includes("gladiadores") || (payload.rivalClub || "").toLowerCase().includes("são caetano");
  if (isSantoAndre && isGladiadoresRival) {
    return `O clássico do ABC contra a Gladiadores entrou para a história como um dos dias mais marcantes da pista andreense. A torcida rival tentou impor respeito armada com suas tradicionais barras de ferro e canos de contenção, mas o bonde de choque do Santo André não deu um passo atrás.\n\nNa pura disposição e na trocação franca de mão limpa, a linha de frente andreense peitou a contenção, tomou as barras no peito aberto e aplicou uma surra histórica que botou o adversário para correr em debandada geral pelas vielas. No ${payload.stadium || "estádio"}, o eco da vitória andreense consagrou a hegemonia da nossa torcida no ABC!`;
  }

  // 3. COMBAT / DERBY NARRATIVE BASED ON TACTIC & VICTORY
  const tacticStr = (payload.tacticTitle || payload.tactic || "").toLowerCase();
  
  if (payload.isVictory || payload.isVictoryPista) {
    if (tacticStr.includes("rojões") || tacticStr.includes("morteiro")) {
      return `A operação de pista no entorno do ${payload.stadium || "estádio"} foi um verdadeiro espetáculo de poder bélico. Quando o comboio rival tentou esboçar aproximação, a nossa linha de frente acionou a bateria pesada de morteiros de vara e guerra de rojões, iluminando o céu e criando uma barreira de fumaça intransponível.\n\nCom o adversário desorientado e recuando em desordem, o bonde da ${payload.torcida || "nossa torcida"} avançou com autoridade e tomou a pista principal. Nas arquibancadas, os mais de ${(payload.playerAttendance || 1200).toLocaleString()} guerreiros cantaram os 90 minutos, comemorando a vitória das nossas cores com orgulho e moral nas alturas.`;
    } else if (tacticStr.includes("surpresa") || tacticStr.includes("emboscada") || tacticStr.includes("flanqueamento")) {
      return `A inteligência do relatório dos antenas foi cirúrgica no deslocamento para o ${payload.stadium || "estádio"}. Enquanto a contenção rival esperava o comboio pela via expressa principal, nossas vans e motos cortaram pelas travessas e alças de acesso, executando um ataque surpresa perfeito pela retaguarda adversária.\n\nA manobra pegou o grupo rival de surpresa, quebrando as linhas deles sem dar chance de reação. O bonde da ${payload.torcida || "nossa torcida"} entrou no estádio de peito estufado, desfraldando os trapos e comandando a festa na bancada do primeiro ao último minuto.`;
    } else if (tacticStr.includes("mão limpa") || tacticStr.includes("disposição")) {
      return `Na pura raça e no brio de arquibancada, o confronto no ${payload.stadium || "estádio"} consagrou a disposição da ${payload.torcida || "nossa torcida"}. Sem recorrer a covardias, o bonde de pista encarou a linha adversária homem a homem, na mão limpa e na honra do pavilhão.\n\nA superioridade física e o coração da nossa linha de frente prevaleceram na trocação franca, garantindo o controle total das vias de acesso. Dentro do estádio, a bateria ditou o ritmo de um triunfo inesquecível que reforça o respeito nacional ao nosso pavilhão.`;
    } else if (tacticStr.includes("mosaico") || tacticStr.includes("festa")) {
      return `Um dia memorável para a história visual da nossa agremiação no ${payload.stadium || "estádio"}. Na subida dos jogadores, o setor visitante explodiu com um mosaico 3D de precisão cirúrgica, acompanhado por uma cortina de fumaça viva que pintou as arquibancadas com as cores do ${payload.clube || "clube"}.\n\nA festa calou o estádio rival e empurrou o time do início ao fim com cantos ininterruptos. A dedicação de cada associado e o empenho da diretoria foram coroados com um espetáculo inigualável de bancada e arquibancada raiz.`;
    } else {
      return `Com marcha firme e batedores abrindo caminho, o bonde da ${payload.torcida || "nossa torcida"} desembarcou no ${payload.stadium || "estádio"} com mais de ${(payload.playerAttendance || 1000).toLocaleString()} integrantes dispostos a defender o pavilhão até o fim.\n\nO avanço compacto da nossa linha de frente rompeu a contenção adversária e estabeleceu o domínio territorial na rampa de acesso. Durante o jogo, a cadência dos surdos e caixas fez o estádio tremer, carimbando mais uma jornada de glória e respeito absoluto na história da nossa torcida.`;
    }
  } else {
    // Adverse match fallback
    return `O deslocamento para o ${payload.stadium || "estádio"} exigiu sangue frio e superação da nossa diretoria e da linha de frente. Com forte cerco do Choque e pressão hostil no entorno, o bonde precisou fechar formação defensiva cerrada para salvaguardar a frota de ônibus e os materiais históricos da torcida.\n\nMesmo sob atrito intenso e com custos médicos de R$ ${(payload.medical || 1500).toLocaleString()}, a lealdade dos nossos associados falou mais alto: os trapos foram defendidos com bravura e a voz da arquibancada não se calou até o apito final.`;
  }
}

// -------------------------------------------------------------
// 10. NATIONAL TORCIDAS POWER RANKING (MUTABLE & LOGARITHMIC)
// -------------------------------------------------------------
export interface RankingEntry {
  rank: number;
  torcida: string;
  sigla: string;
  clube: string;
  estado: string;
  tier: string;
  powerScore: number;
  isPlayer: boolean;
  rankChange: number;
  officialRef: OfficialTorcida;
}

export function simulateNationalRanking(
  playerTorcida: OfficialTorcida,
  playerStats: TorcidaStats,
  stateTrackers: StateTrackers,
  season: number
): RankingEntry[] {
  const allTorcidas = teamsData as OfficialTorcida[];
  const list: { torcida: OfficialTorcida; rawScore: number; isPlayer: boolean }[] = [];

  let playerIncluded = false;

  allTorcidas.forEach((t) => {
    const isPlayer = t.torcida.toLowerCase().trim() === playerTorcida.torcida.toLowerCase().trim();

    let score = 0;
    if (isPlayer) {
      playerIncluded = true;
      score =
        playerStats.contingente * 1.35 +
        playerStats.pressao_bancada * 1.25 +
        playerStats.poder_pista * 1.25 +
        playerStats.caravana * 1.15 +
        playerStats.autonomia_financeira * 1.0 +
        stateTrackers.respeito_nacional * 1.1;

      // Logarithmic resistance at top ranks (> 550 points)
      if (score > 550) {
        const excess = score - 550;
        score = 550 + Math.round(excess * 0.45);
      }

      list.push({ torcida: playerTorcida, rawScore: score, isPlayer: true });
    } else {
      const base =
        t.contingente * 1.35 +
        t.pressao_bancada * 1.25 +
        t.poder_pista * 1.25 +
        t.caravana * 1.15 +
        t.autonomia_financeira * 1.0 +
        60;

      let seed = (season * 17 + (t.torcida.charCodeAt(0) || 65) * 31 + (t.torcida.charCodeAt(1) || 66) * 13) % 100;
      let fluctuation = (seed - 50) * 0.4;

      if (t.tier === "S") fluctuation += 40;
      else if (t.tier === "A") fluctuation += 20;
      else if (t.tier === "B") fluctuation += 5;

      score = Math.max(80, Math.round(base + fluctuation));
      list.push({ torcida: t, rawScore: score, isPlayer: false });
    }
  });

  if (!playerIncluded) {
    let score =
      playerStats.contingente * 1.35 +
      playerStats.pressao_bancada * 1.25 +
      playerStats.poder_pista * 1.25 +
      playerStats.caravana * 1.15 +
      playerStats.autonomia_financeira * 1.0 +
      stateTrackers.respeito_nacional * 1.1;

    if (score > 550) {
      const excess = score - 550;
      score = 550 + Math.round(excess * 0.45);
    }
    list.push({ torcida: playerTorcida, rawScore: score, isPlayer: true });
  }

  list.sort((a, b) => b.rawScore - a.rawScore);

  return list.map((item, index) => {
    const rank = index + 1;
    const rankChange = item.isPlayer ? 0 : Math.floor(Math.sin(season * 3 + index) * 3);
    return {
      rank,
      torcida: item.torcida.torcida,
      sigla: item.torcida.sigla || "",
      clube: item.torcida.clube,
      estado: item.torcida.estado,
      tier: item.torcida.tier,
      powerScore: item.rawScore,
      isPlayer: item.isPlayer,
      rankChange,
      officialRef: item.torcida,
    };
  });
}

// -------------------------------------------------------------
// 11. CLUB CHAMPIONSHIP LEAGUE TABLE (STANDINGS)
// -------------------------------------------------------------
export interface LeagueTableEntry {
  position: number;
  club: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  isPlayerClub: boolean;
  zone: "LIBERTADORES" | "SULAMERICANA" | "MEIO_TABELA" | "REBAIXAMENTO";
}

export function generateLeagueTable(
  playerClub: string,
  season: number,
  playedGamesCount: number = 28
): LeagueTableEntry[] {
  const allTorcidas = teamsData as OfficialTorcida[];
  const clubsSet = new Set<string>();
  clubsSet.add(playerClub);

  allTorcidas.forEach((t) => {
    if (clubsSet.size < 20) clubsSet.add(t.clube);
  });

  const fillerClubs = [
    "Bahia",
    "Cruzeiro",
    "Atlético-MG",
    "Fluminense",
    "Vasco",
    "Botafogo",
    "Ceará",
    "Fortaleza",
    "Cuiabá",
    "Athletico-PR",
    "Juventude",
    "Red Bull Bragantino",
  ];
  fillerClubs.forEach((c) => {
    if (clubsSet.size < 20) clubsSet.add(c);
  });

  const clubsList = Array.from(clubsSet);
  const played = Math.min(38, Math.max(10, playedGamesCount));

  const tableData = clubsList.map((club, idx) => {
    const isPlayer = club.toLowerCase() === playerClub.toLowerCase();
    const seed = (season * 19 + idx * 23 + (isPlayer ? 50 : 0)) % 100;
    const winsRatio = isPlayer ? 0.55 + (seed % 20) * 0.01 : 0.25 + (seed % 45) * 0.01;

    const won = Math.round(played * winsRatio);
    const drawn = Math.round((played - won) * 0.45);
    const lost = Math.max(0, played - won - drawn);
    const points = won * 3 + drawn;

    const gf = won * 2 + drawn;
    const ga = lost * 2 + drawn;
    const gd = gf - ga;

    return {
      position: 0,
      club,
      points,
      played,
      won,
      drawn,
      lost,
      gf,
      ga,
      gd,
      isPlayerClub: isPlayer,
      zone: "MEIO_TABELA" as const,
    };
  });

  tableData.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

  return tableData.map((entry, idx) => {
    const pos = idx + 1;
    let zone: "LIBERTADORES" | "SULAMERICANA" | "MEIO_TABELA" | "REBAIXAMENTO" = "MEIO_TABELA";
    if (pos <= 6) zone = "LIBERTADORES";
    else if (pos <= 12) zone = "SULAMERICANA";
    else if (pos >= 17) zone = "REBAIXAMENTO";

    return {
      ...entry,
      position: pos,
      zone,
    };
  });
}

// -------------------------------------------------------------
// 1. TRAÇOS DE PRESIDENTE (ELEIÇÕES A CADA 3 TEMPORADAS)
// -------------------------------------------------------------
export type PresidentProfile = "LINHA_FRENTE" | "GESTOR" | "MESTRE_BATERIA";

export interface PresidentOption {
  id: PresidentProfile;
  title: string;
  bonus: string;
  penalty: string;
  icon: string;
  description: string;
}

export function getPresidentOptions(): PresidentOption[] {
  return [
    {
      id: "LINHA_FRENTE",
      title: "1. Perfil Linha de Frente / Pista",
      bonus: "+15% no PEC de Combate e maior respeito em confrontos de rua.",
      penalty: "+10% de Risco MP passivo e maior rigor da PM nas revistas.",
      icon: "🥊",
      description: "Liderança marcial e cascuda vinda das pistas e caravanas. Impõe respeito em qualquer território, mas atrai os holofotes do Ministério Público."
    },
    {
      id: "GESTOR",
      title: "2. Perfil Gestor / Comercial",
      bonus: "+20% de Faturamento na Loja Oficial, eventos da quadra e anuidade.",
      penalty: "-5 de Moral se a torcida recuar de confrontos ou adotar postura pacífica.",
      icon: "💼",
      description: "Administração executiva focada em superávit, licenciamento e expansão da sede social. Alavanca o caixa, mas sofre cobrança por postura militar."
    },
    {
      id: "MESTRE_BATERIA",
      title: "3. Perfil Mestre de Bateria / Barra Brava",
      bonus: "+15 de Pressão de Bancada e taxa acelerada de atração de sócios locais.",
      penalty: "Menor investimento na escolta de pista; vulnerabilidade em caravanas sem apoio.",
      icon: "🥁",
      description: "Liderança vinda das arquibancadas e da percussão. Transforma o estádio em um inferno sonoro, mas prioriza a festa em detrimento da escolta armada."
    }
  ];
}

// -------------------------------------------------------------
// 2. PUNIÇÕES ESCALONADAS DO MINISTÉRIO PÚBLICO (MP)
// -------------------------------------------------------------
export interface MPStatusSummary {
  faixaLevel: 0 | 1 | 2 | 3;
  faixaName: string;
  badgeColor: string;
  restrictionsText: string;
  pressaoPenalty: number;
  bateriaBanned: boolean;
  visualBanned: boolean;
  isInstitutionalBan: boolean;
}

export function getMPStatusSummary(riscoMp: number): MPStatusSummary {
  if (riscoMp >= 100) {
    return {
      faixaLevel: 3,
      faixaName: "Faixa 3 — Banimento Institucional (100%)",
      badgeColor: "bg-red-950 text-red-400 border-red-600",
      restrictionsText: "Torcida 100% banida nos estádios. Proibido fardamento, bateria e faixas. Perda de 50% das receitas e deserção de 25% da massa.",
      pressaoPenalty: 25,
      bateriaBanned: true,
      visualBanned: true,
      isInstitutionalBan: true,
    };
  } else if (riscoMp >= 75) {
    return {
      faixaLevel: 2,
      faixaName: "Faixa 2 — Alerta Laranja (>= 75%)",
      badgeColor: "bg-orange-950 text-orange-400 border-orange-600",
      restrictionsText: "Proibição total de faixas, mastros, bandeirões e camisas oficiais nos jogos. Mosaico 3D/Fogo bloqueado no Jogo 4. Presença de Choque Total.",
      pressaoPenalty: 15,
      bateriaBanned: true,
      visualBanned: true,
      isInstitutionalBan: false,
    };
  } else if (riscoMp >= 50) {
    return {
      faixaLevel: 1,
      faixaName: "Faixa 1 — Alerta Amarelo (>= 50%)",
      badgeColor: "bg-yellow-950 text-yellow-400 border-yellow-600",
      restrictionsText: "Proibição de surdos e bumbos pesados nos estádios. Penalidade de -10 de Pressão de Bancada.",
      pressaoPenalty: 10,
      bateriaBanned: true,
      visualBanned: false,
      isInstitutionalBan: false,
    };
  } else {
    return {
      faixaLevel: 0,
      faixaName: "Situação Regular (< 50%)",
      badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-600",
      restrictionsText: "Sem restrições ativas. Mastros, baterias e bandeirões liberados pelo Choque.",
      pressaoPenalty: 0,
      bateriaBanned: false,
      visualBanned: false,
      isInstitutionalBan: false,
    };
  }
}

// -------------------------------------------------------------
// 5. NOTICIÁRIO DE BANCADA (EVENTOS ALEATÓRIOS URGENTES)
// -------------------------------------------------------------
export interface NewsReelEvent {
  id: string;
  title: string;
  category: string;
  headline: string;
  narrative: string;
  deltas: FormattedDelta[];
  cashEffect?: number;
  moralEffect?: number;
  riscoMpEffect?: number;
  contingenteEffect?: number;
}

export function getRandomNewsReelEvent(): NewsReelEvent {
  const pool: NewsReelEvent[] = [
    {
      id: "SALARIOS_ATRASADOS",
      title: "⚠️ SALÁRIOS ATRASADOS NO CLUBE",
      category: "CRISE INSTITUCIONAL",
      headline: "Elenco ameaça greve por falta de pagamentos e direitos de imagem!",
      narrative: "Notícia vazada pela imprensa revela 3 meses de salários atrasados no elenco. A diretoria da torcida precisa intervir na Ação 7 para exigir entrega ou cobrar a cartolagem.",
      deltas: [
        { label: "Relação Clube", value: "-15 pts", isPositive: false },
        { label: "Pressão de Cobrança", value: "+10 pts", isPositive: true },
      ],
      moralEffect: -5,
    },
    {
      id: "BLITZ_RODOVIARIA",
      title: "🚔 BLITZ SURPRESA DA POLÍCIA RODOVIÁRIA",
      category: "SEGURANÇA PÚBLICA",
      headline: "Operação especial de fiscalização retém comboios de ônibus estaduais!",
      narrative: "Batalhão Rodoviário e Polícia Federal apertaram a fiscalização nas rodovias na véspera do jogo. Exige despesas imediatas para liberação da frota.",
      deltas: [
        { label: "Risco MP", value: "+8%", isPositive: false },
        { label: "Custo Operacional", value: "-R$ 1.500", isPositive: false },
      ],
      riscoMpEffect: 8,
      cashEffect: -1500,
    },
    {
      id: "CANTO_VIRAL",
      title: "🎵 VIRAL NAS REDES: NOVO CANTO EXPLODE NA INTERNET",
      category: "CULTURA ULTRAS",
      headline: "Ritmo da bateria gravado na quadra alcança 5 milhões de visualizações!",
      narrative: "Um novo canto de apoio composto pela ala musical viralizou nas redes sociais. Milhares de torcedores jovens procuram a quadra para comprar camisas e se associar.",
      deltas: [
        { label: "Novos Sócios", value: "+5 Contingente", isPositive: true },
        { label: "Vendas na Loja", value: "+R$ 4.000", isPositive: true },
        { label: "Moral da Torcida", value: "+8", isPositive: true },
      ],
      contingenteEffect: 5,
      cashEffect: 4000,
      moralEffect: 8,
    },
    {
      id: "RIXA_BAIRRO",
      title: "🚨 RIXA LOCAL EM ESTAÇÃO DE TREM",
      category: "OCORRÊNCIA URBANA",
      headline: "Embate isolado entre subsedes regionais é noticiado na TV!",
      narrative: "Conflito pontual entre grupos rivais na estação de metrô mobilizou o Choque e virou pauta de jornais sensacionalistas, atraindo atenção do Ministério Público.",
      deltas: [
        { label: "Risco MP", value: "+8%", isPositive: false },
        { label: "Moral da Tropa", value: "+3", isPositive: true },
      ],
      riscoMpEffect: 8,
      moralEffect: 3,
    },
  ];

  return pool[Math.floor(Math.random() * pool.length)];
}

// -------------------------------------------------------------
// 6. MOTOR DE DECISÃO ESTRATÉGICA DE TEMPORADA (A CADA 3 ANOS)
// -------------------------------------------------------------
export interface SeasonalOptionDefinition {
  id: string;
  title: string;
  badge: string;
  description: string;
  consequencesSummary: string;
  contingenteDelta?: number;
  pistaDelta?: number;
  bancadaDelta?: number;
  riscoMpDelta?: number;
  respeitoDelta?: number;
  cashDelta?: number;
  rivalPistaBonus?: number;
}

export interface SeasonalMilestoneDefinition {
  season: number;
  title: string;
  subtitle: string;
  newsHeadline: string;
  narrativeText: string;
  hasPositiveRivalTrigger?: boolean;
  options: SeasonalOptionDefinition[];
}

export function getSeasonalMilestoneEvent(
  season: number,
  stats: TorcidaStats,
  trackers: StateTrackers,
  mainRivalName: string,
  isPositiveVsRival: boolean
): SeasonalMilestoneDefinition | null {
  if (season === 3) {
    return {
      season: 3,
      title: "🏛️ 3ª TEMPORADA: ELEVAÇÃO DE NÍVEL RIVAL & DECISÃO DE PISTA",
      subtitle: "REORGANIZAÇÃO DA RIVALIDADE E NÍVEL DA TORCIDA ADVERSÁRIA",
      hasPositiveRivalTrigger: isPositiveVsRival,
      newsHeadline: isPositiveVsRival
        ? `🔥 REAÇÃO DE PISTA (75%+ VITÓRIAS): A ${mainRivalName} ELEVOU SEU NÍVEL E REESTRUTUROU O BONDE DE COMBATE!`
        : `🏢 CONSOLIDAÇÃO DE ESTRUTURA E EXPANSÃO DAS SUB-SEDES REGIONAIS DA TORCIDA!`,
      narrativeText: isPositiveVsRival
        ? `Devido ao seu histórico avassalador com 75%+ de vitórias nos confrontos de pista, a torcida rival ${mainRivalName} entrou em crise de diretoria e elevou seu nível de combate! Eles reestruturaram a linha de frente, subiram de patamar (+35% PEC de Pista permanente) e trarão contingentes muito mais pesados nos próximos clássicos!`
        : `Com 3 anos de liderança consolidada, os bondes de bairro exigem voz ativa na diretoria para definir os rumos da arquibancada, finanças e segurança de pista.`,
      options: [
        {
          id: "REFORCO_PISTA",
          title: "👊 Resposta de Pista: Fortalecer Bonde da Periferia",
          badge: "EXPANSÃO DE RUAS",
          description: "Reorganiza sub-sedes num bonde móvel para combater o nível elevado do rival.",
          consequencesSummary: "+20 Contingente, +15 Poder Pista, +10% Risco MP",
          contingenteDelta: 20,
          pistaDelta: 15,
          riscoMpDelta: 10,
          rivalPistaBonus: isPositiveVsRival ? 35 : 0,
        },
        {
          id: "REFORMA_INTERNA",
          title: "🏛️ Profissionalização & Regularização com MP",
          badge: "REESTRUTURAÇÃO MORAL",
          description: "Contém excessos de rua e foca no controle institucional e jurídico.",
          consequencesSummary: "-15% Risco MP, +10 Respeito Nacional, -5 Contingente",
          riscoMpDelta: -15,
          respeitoDelta: 10,
          contingenteDelta: -5,
          rivalPistaBonus: isPositiveVsRival ? 35 : 0,
        },
        {
          id: "PACTO_LOCAL",
          title: "🕊️ Acordo Diplomático de Bastidores com Rival Elevado",
          badge: "PACTO ISOLADO",
          description: "Firma pacto de não-agressão de ferro para atenuar o novo nível do rival.",
          consequencesSummary: "-R$ 5.000 do Caixa, Atenua a agressividade do rival (+15% PEC)",
          cashDelta: -5000,
          rivalPistaBonus: isPositiveVsRival ? 15 : 0,
        },
      ],
    };
  }

  if (season === 6) {
    return {
      season: 6,
      title: "🏛️ 6ª TEMPORADA: DIVISOR DE ÁGUAS DA TORCIDA",
      subtitle: "RACHA INTERNO VS EXPANSÃO NACIONAL",
      newsHeadline: "🚨 INTERVENÇÃO DO MP E TENSÃO ENTRE BONDES ANTAGÔNICOS!",
      narrativeText: "Seis anos de liderança colocam a torcida sob holofotes nacionais. Divergências entre a velha guarda e os bondes jovens exigem posicionamento definitivo.",
      options: [
        {
          id: "UNIFICACAO_BONDES",
          title: "🔥 Unificação dos Bondes de Bairro (Pista Total)",
          badge: "UNIFICAÇÃO DE RUA",
          description: "Funde todas as sub-sedes num mega-bonde principal.",
          consequencesSummary: "+30 Poder Pista em jogos fora, +15% Risco MP",
          pistaDelta: 30,
          riscoMpDelta: 15,
        },
        {
          id: "RACHA_DISSIDENCIA",
          title: "⚡ Rompimento de Dissidência da Bancada (Racha)",
          badge: "INDEPENDÊNCIA MORAL",
          description: "Grupo tradicional rompe com a diretoria devido a divergências.",
          consequencesSummary: "-15 Contingente, +25 Respeito Nacional por independência",
          contingenteDelta: -15,
          respeitoDelta: 25,
        },
        {
          id: "CONSELHO_COMERCIAL",
          title: "💼 Profissionalização do Conselho Comercial",
          badge: "GESTÃO FINANCEIRA",
          description: "Estrutura as vendas de produtos e a arrecadação da quadra.",
          consequencesSummary: "+R$ 15.000 no Caixa imediato, -10 Poder Pista",
          cashDelta: 15000,
          pistaDelta: -10,
        },
      ],
    };
  }

  if (season === 9) {
    return {
      season: 9,
      title: "🏛️ 9ª TEMPORADA: CONSOLIDACÃO DAS ALIANÇAS E OPERAÇÃO",
      subtitle: "DIPLOMACIA NACIONAIS E CRISE COM O MP",
      newsHeadline: "🤝 REARRANJO DOS EIXOS INTERESTADUAIS DE UNIDOS E DEDO PRO ALTO!",
      narrativeText: "A nona temporada exige definir as prioridades logísticas: estreitar laços com torcidas aliadas do país, reestruturar a defesa jurídica ou adquirir frota.",
      options: [
        {
          id: "PACTO_ALIADAS",
          title: "🤝 Pacto Exclusivo de União com Aliadas Nacionais",
          badge: "SUPORTE LOGÍSTICO",
          description: "Garante acolhimento e reforço total em viagens interestaduais.",
          consequencesSummary: "+50% Suporte em Caravanas Fora, +15 Respeito Nacional",
          respeitoDelta: 15,
          contingenteDelta: 10,
        },
        {
          id: "RESTRUCT_ANTICRISE",
          title: "⚖️ Reestruturação Anticrise do Ministério Público",
          badge: "PACTO INSTITUCIONAL",
          description: "Reformula o conselho de ética para zerar pendências judiciais.",
          consequencesSummary: "-25% Risco MP imediato, +10 Relação Clube",
          riscoMpDelta: -25,
        },
        {
          id: "FROTA_CARAVANA",
          title: "🚐 Aquisição de Frota Própria de Caravana",
          badge: "AUTONOMIA DE VIAGEM",
          description: "Compra veículos próprios para transporte de membros.",
          consequencesSummary: "-R$ 10.000 Caixa, Custo de caravana reduzido em 50%",
          cashDelta: -10000,
          contingenteDelta: 15,
        },
      ],
    };
  }

  if (season === 12) {
    return {
      season: 12,
      title: "🏛️ 12ª TEMPORADA: ERA DAS ARENAS & GUERRA FRIA",
      subtitle: "RESISTÊNCIA CULTURAL VS SUPREMACIA DE PISTA",
      newsHeadline: "🏟️ ARENIZAÇÃO DOS ESTÁDIOS E ENTRADA DA BIOMETRIA FACIAL!",
      narrativeText: "Com 12 anos de estrada, a modernização dos estádios cobra caro. A torcida precisa decidir entre a supremacia de rua, a resistência pacífica ou grandes parcerias.",
      options: [
        {
          id: "HEGEMONIA_ESTADUAL",
          title: "👑 Hegemonia Total de Pista Estadual",
          badge: "SUPREMACIA DE RUA",
          description: "Domínio completo nos arredores dos jogos locais.",
          consequencesSummary: "+30 Poder Pista em clássicos estaduais",
          pistaDelta: 30,
        },
        {
          id: "BOICOTE_RESISTENCIA",
          title: "✊ Boicote Cultural e Resistência de Catraca",
          badge: "PAX DE BANCADA",
          description: "Protesto organizado contra o encarecimento dos ingressos.",
          consequencesSummary: "Reseta o Risco MP para 0%, +20 Respeito Nacional",
          riscoMpDelta: -100,
          respeitoDelta: 20,
        },
        {
          id: "MEGAPARCERIA_FESTA",
          title: "🎨 Megaparceria de Festas & Mosaicos 3D",
          badge: "ARENA FESTIVAL",
          description: "Parceria comercial para grandes espetáculos de bancada.",
          consequencesSummary: "+R$ 30.000 no Caixa, Lucros de Mosaico dobrados",
          cashDelta: 30000,
          bancadaDelta: 20,
        },
      ],
    };
  }

  if (season === 15) {
    return {
      season: 15,
      title: "👑 15ª TEMPORADA: A DECISÃO DO SÉCULO & LEGADO FINAL",
      subtitle: "CONSAGRAÇÃO MÁXIMA DA CARREIRA ULTRAS",
      newsHeadline: "🏆 APOGEU DE 15 ANOS DE MANDATO E LIDERANÇA DE ARQUIBANCADA!",
      narrativeText: "Na décima quinta e última temporada, sua torcida disputa o topo absoluto do país. Escolha como selar o legado histórico da sua liderança.",
      options: [
        {
          id: "SUPREMACIA_NACIONAL",
          title: "🏆 Supremacia Absoluta de Pista & Bancada",
          badge: "COROA DE MAIOR DO PAÍS",
          description: "Combate final pela liderança incontestada das arquibancadas.",
          consequencesSummary: "+50% PEC e Moral no confronto final da temporada",
          pistaDelta: 25,
          bancadaDelta: 25,
        },
        {
          id: "INSTITUCIONALIZACAO",
          title: "🕊️ Institucionalização & Referência Cultural",
          badge: "PATRIMÔNIO CULTURAL",
          description: "Consolida a torcida como instituição cultural pacífica e de show.",
          consequencesSummary: "Risco MP Zerado, +50 Respeito Nacional",
          riscoMpDelta: -100,
          respeitoDelta: 50,
        },
        {
          id: "MEGAFUSAO_LEGAIS",
          title: "🤝 Megafusão com Aliadas em Holding de Bancada",
          badge: "UNIFICAÇÃO NACIONAL",
          description: "Une formalmente os bonde e subsedes num império de torcidas.",
          consequencesSummary: "+50 Contingente, +R$ 50.000 no Caixa",
          contingenteDelta: 50,
          cashDelta: 50000,
        },
      ],
    };
  }

  return null;
}

