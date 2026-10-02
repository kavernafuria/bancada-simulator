import teamsData from "@/data/bancada_teams.json";
import {
  SeasonClimate,
  TorcidaStats,
  StateTrackers,
  OfficialTorcida,
  ArchetypeDefinition,
  NationalRankEntry,
  ElectionCrisisInfo,
} from "./types";

export const SEASON_CLIMATES: Record<number, SeasonClimate> = {
  1: { season: 1, name: "Ano de Reestruturação da Sede", subtitle: "Estruturação de Quadra & Bairro", description: "Custos equilibrados e clima de reestruturação dos associados.", costMult: 1.0, cashBonus: 0, mpRiskMod: 0, massaBonus: 0, bancadaBonus: 0, pistaBonus: 0 },
  2: { season: 2, name: "Crise de Inflação nos Ingressos", subtitle: "Ingressos Caros & Teste de Caixa", description: "Custos operacionais 25% mais altos. Ingressos de futebol sobem no país.", costMult: 1.25, cashBonus: -1500, mpRiskMod: -5, massaBonus: -2, bancadaBonus: 0, pistaBonus: 0 },
  3: { season: 3, name: "Operação Pista Limpa do MP", subtitle: "Pressão Judicial & Reação Rival", description: "O Ministério Público aumenta o cerco. Risco de punição judicial elevado.", costMult: 1.0, cashBonus: 0, mpRiskMod: 15, massaBonus: 0, bancadaBonus: 0, pistaBonus: 3 },
  4: { season: 4, name: "Boom de Matrículas e Venda de Roupas", subtitle: "Arrecadação Alta & Crescimento", description: "Ano de alta arrecadação e expansão do quadro social.", costMult: 0.9, cashBonus: 3000, mpRiskMod: -5, massaBonus: 3, bancadaBonus: 2, pistaBonus: 0 },
  5: { season: 5, name: "Ano de Tensão de Dérbis Regionais", subtitle: "Confrontos Interestaduais Quentes", description: "Clássicos fervendo nas rodovias e percursos interestaduais.", costMult: 1.2, cashBonus: 0, mpRiskMod: 10, massaBonus: 0, bancadaBonus: 0, pistaBonus: 4 },
  6: { season: 6, name: "Racha Político de Arquibancada", subtitle: "Divergências na Diretoria", description: "Discussões sobre os rumos da agremiação exigem prudência financeira.", costMult: 1.1, cashBonus: -1500, mpRiskMod: 5, massaBonus: -1, bancadaBonus: -2, pistaBonus: 0 },
  7: { season: 7, name: "Ano da Caravana da Amizade", subtitle: "Alianças Nacionais Fortalecidas", description: "Viagens com recepção festiva de torcidas aliadas por todo o país.", costMult: 0.85, cashBonus: 1800, mpRiskMod: -10, massaBonus: 2, bancadaBonus: 3, pistaBonus: 0 },
  8: { season: 8, name: "Cercamento Policial & Arenização", subtitle: "Estádios Modernizados & Biometria", description: "Catracas com biometria facial e ingressos 40% mais caros.", costMult: 1.4, cashBonus: 0, mpRiskMod: 20, massaBonus: -2, bancadaBonus: -1, pistaBonus: 0 },
  9: { season: 9, name: "Ano do Centenário do Clube", subtitle: "Festa Monumental & Recordes", description: "Grandes celebrações de massa, mosaicos 3D e arrecadação de loja em alta.", costMult: 1.1, cashBonus: 4500, mpRiskMod: -5, massaBonus: 4, bancadaBonus: 4, pistaBonus: 0 },
  10: { season: 10, name: "Crise Financeira do Clube de Apoio", subtitle: "Retração de Apoio Institucional", description: "O clube reduz ingressos de cota. A torcida precisa da sua autonomia.", costMult: 1.2, cashBonus: -2000, mpRiskMod: 0, massaBonus: 0, bancadaBonus: 0, pistaBonus: 0 },
};

export function getSeasonClimate(season: number): SeasonClimate {
  return SEASON_CLIMATES[season] || SEASON_CLIMATES[1];
}

export const ARCHETYPES: Record<string, ArchetypeDefinition> = {
  MASSA_COMBATIVA: {
    id: "MASSA_COMBATIVA",
    name: "💥 Torcida de Massa & Pista Forte",
    badge: "Linha de Frente & Mobilização",
    description: "Contingente massivo nas ruas, poder de resposta em comboios e grande respeito de pista.",
    statModifiers: { contingente: 15, poder_pista: 15, pressao_bancada: 5, caravana: 10, autonomia_financeira: -10 },
    stateModifiers: { moral: 10, risco_mp: 10, relacao_clube: 0 },
    startingCash: 25000,
    perfilPredominante: "Potência de Massa & Linha de Frente Rodoviária",
  },
  TRADICIONAL_BANCADA: {
    id: "TRADICIONAL_BANCADA",
    name: "🥁 Tradicional de Arquibancada & Samba",
    badge: "Bateria & Mosaico Monumental",
    description: "Foco absoluto no show das arquibancadas, festa de ritmo, faixas gigantes e apoio incondicional.",
    statModifiers: { pressao_bancada: 20, contingente: 10, caravana: 5, poder_pista: -5, autonomia_financeira: 10 },
    stateModifiers: { moral: 15, risco_mp: -10, relacao_clube: 15 },
    startingCash: 35000,
    perfilPredominante: "Tradição de Bateria & Mosaicos em Arenas",
  },
  ESTRADA_CARAVANA: {
    id: "ESTRADA_CARAVANA",
    name: "🚌 Guerreiros da Estrada & Caravana",
    badge: "Comboios Interestaduais & Invasão",
    description: "Especializados em invasões rodoviárias pesadas, presença constante em jogos fora e subsedes ativas.",
    statModifiers: { caravana: 25, poder_pista: 10, contingente: 5, autonomia_financeira: 5, pressao_bancada: 5 },
    stateModifiers: { moral: 5, risco_mp: 5, relacao_clube: 5 },
    startingCash: 30000,
    perfilPredominante: "Invasões Rodoviárias & Sub-sedes do Interior",
  },
  INDEPENDENTE_AUTONOMA: {
    id: "INDEPENDENTE_AUTONOMA",
    name: "💰 Autônoma & Gestão Financeira",
    badge: "Loja Oficial & Independência",
    description: "Forte estrutura de arrecadação própria, venda massiva de materiais e total independência institucional.",
    statModifiers: { autonomia_financeira: 25, contingente: 5, pressao_bancada: 10, poder_pista: -5, caravana: 5 },
    stateModifiers: { moral: 5, risco_mp: -15, relacao_clube: 10 },
    startingCash: 50000,
    perfilPredominante: "Autonomia Financeira & Gestão de Loja",
  },
};

export function getArchetypesList(): ArchetypeDefinition[] {
  return Object.values(ARCHETYPES);
}

export function createCustomTorcidaWithArchetype(
  torcidaName: string,
  sigla: string,
  clubName: string,
  archetypeId: string,
  primaryColor?: string,
  secondaryColor?: string
): { torcida: OfficialTorcida; stateTrackers: StateTrackers } {
  const normName = torcidaName.trim() || "Torcida Org.";
  const normSigla = sigla.trim().toUpperCase() || "T.O";
  const arch = ARCHETYPES[archetypeId] || ARCHETYPES.MASSA_COMBATIVA;

  const mapped = (teamsData as any[]).find(
    (t) => t.clube.toLowerCase() === clubName.trim().toLowerCase()
  );

  const tier = mapped ? mapped.tier : "B";
  const isTierA = tier === "S" || tier === "A";

  const baseStats: TorcidaStats = {
    contingente: mapped ? mapped.contingente : isTierA ? 75 : 55,
    pressao_bancada: mapped ? mapped.pressao_bancada : isTierA ? 75 : 55,
    poder_pista: mapped ? mapped.poder_pista : isTierA ? 70 : 50,
    caravana: mapped ? mapped.caravana : isTierA ? 70 : 50,
    autonomia_financeira: mapped ? mapped.autonomia_financeira : isTierA ? 70 : 55,
  };

  Object.entries(arch.statModifiers).forEach(([key, mod]) => {
    const k = key as keyof TorcidaStats;
    baseStats[k] = Math.min(100, Math.max(10, baseStats[k] + (mod || 0)));
  });

  const stateTrackers: StateTrackers = {
    moral: isTierA ? 60 + (arch.stateModifiers.moral || 0) : 65 + (arch.stateModifiers.moral || 0),
    risco_mp: Math.max(0, 5 + (arch.stateModifiers.risco_mp || 0)),
    relacao_clube: 50 + (arch.stateModifiers.relacao_clube || 0),
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
    perfil_predominante: arch.perfilPredominante,
    eixo_alianca: mapped ? mapped.eixo_alianca : "NEUTRO",
    rival_principal: mapped ? mapped.rival_principal : "Rival Local",
    rival_secundario: mapped ? mapped.rival_secundario : "Rival Regional",
    torcida_aliada: mapped ? mapped.torcida_aliada : "Aliada de Eixo",
    primaryColor: primaryColor || mapped?.primaryColor || "#991b1b",
    secondaryColor: secondaryColor || mapped?.secondaryColor || "#111827",
  };

  return { torcida, stateTrackers };
}

export function calculatePowerScore(stats: TorcidaStats, state: StateTrackers): number {
  const statSum =
    stats.contingente * 2.5 +
    stats.pressao_bancada * 2.0 +
    stats.poder_pista * 1.8 +
    stats.caravana * 1.5 +
    stats.autonomia_financeira * 1.2;

  const stateSum = state.moral * 1.5 + state.respeito_nacional * 2.0 - state.risco_mp * 0.8;
  return Math.round(statSum + stateSum);
}

export function simulateNationalRanking(
  currentTorcida: OfficialTorcida,
  stats: TorcidaStats,
  state: StateTrackers,
  season: number
): NationalRankEntry[] {
  const playerPower = calculatePowerScore(stats, state);
  let playerIncluded = false;

  const entries: NationalRankEntry[] = (teamsData as any[]).map((t) => {
    const isPlayer = t.torcida.toLowerCase() === currentTorcida.torcida.toLowerCase();
    if (isPlayer) {
      playerIncluded = true;
      return {
        rank: 0,
        torcida: currentTorcida.torcida,
        clube: currentTorcida.clube,
        estado: t.estado || "SP",
        tier: currentTorcida.tier,
        powerScore: playerPower,
        isPlayer: true,
        stats: stats,
      };
    }

    const tierMult = t.tier === "S" ? 1.3 : t.tier === "A" ? 1.1 : t.tier === "B" ? 0.9 : 0.7;
    const basePower = Math.round(
      (t.contingente * 2.5 + t.pressao_bancada * 2.0 + t.poder_pista * 1.8 + t.caravana * 1.5 + t.autonomia_financeira * 1.2) * tierMult
    );

    const noise = Math.sin((season + t.contingente) * 3) * 25;
    const simulatedPower = Math.max(100, Math.round(basePower + noise));

    return {
      rank: 0,
      torcida: t.torcida,
      clube: t.clube,
      estado: t.estado || "BR",
      tier: t.tier || "B",
      powerScore: simulatedPower,
      isPlayer: false,
      stats: {
        contingente: t.contingente,
        pressao_bancada: t.pressao_bancada,
        poder_pista: t.poder_pista,
        caravana: t.caravana,
        autonomia_financeira: t.autonomia_financeira,
      },
    };
  });

  if (!playerIncluded) {
    entries.push({
      rank: 0,
      torcida: currentTorcida.torcida,
      clube: currentTorcida.clube,
      estado: "SP",
      tier: currentTorcida.tier || "B",
      powerScore: playerPower,
      isPlayer: true,
      stats: stats,
    });
  }

  entries.sort((a, b) => b.powerScore - a.powerScore);
  entries.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  return entries;
}

export function applyTierElectionCrisis(torcida: OfficialTorcida): OfficialTorcida {
  return torcida;
}
