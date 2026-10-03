import teamsData from "@/data/bancada_teams.json";
import { isInteriorSP } from "../season_events";
import { EndGameInvestment, UnforeseenExpense, Etapa10CaravanChoice } from "./types";

export const ENDGAME_INVESTMENTS: EndGameInvestment[] = [
  {
    id: "ONIBUS_BLINDADO",
    title: "🚌 Ônibus Blindado Oficial da Caravana",
    subtitle: "Frota de Caravana Blindada & Segurança",
    description: "Aquisição de um ônibus de dois andares com vidros blindados e chassi reforçado para viagens interestaduais.",
    cost: 180000,
    category: "FROTA",
    statEffects: { caravana: 15, poder_pista: 5 },
    stateEffects: { respeito_nacional: 10, moral: 10 },
  },
  {
    id: "SUBSEDE_CAPITAL",
    title: "🚩 Fundação da Sub-Sede Capital / Metropolitana",
    subtitle: "Ponto de Encontro na Capital",
    description: "Compra e reforma de imóvel próprio na capital para concentrar associados das zonas norte, sul, leste e oeste.",
    cost: 120000,
    category: "SUBSEDE",
    statEffects: { contingente: 10, pressao_bancada: 8 },
    stateEffects: { respeito_nacional: 10, moral: 8 },
  },
  {
    id: "SUBSEDE_LITORAL",
    title: "🚩 Fundação da Sub-Sede Litoral / Baixada",
    subtitle: "Subsede Praiana & Recepção",
    description: "Estruturação de subsede oficial no litoral para receber caravanas praianas e coordenar apoio rodoviário.",
    cost: 120000,
    category: "SUBSEDE",
    statEffects: { contingente: 10, caravana: 8 },
    stateEffects: { respeito_nacional: 10, moral: 8 },
  },
  {
    id: "DOACAO_ESTADIO_CLUBE",
    title: "🏟️ Fundo de Doação Especial para Reforma do Estádio",
    subtitle: "Apoio Institucional ao Clube",
    description: "Aporte financeiro direto para melhoria das arquibancadas e setor popular no estádio do clube.",
    cost: 250000,
    category: "DOACAO_CLUBE",
    statEffects: { pressao_bancada: 12 },
    stateEffects: { relacao_clube: 30, respeito_nacional: 15, moral: 10 },
  },
];

export const UNFORESEEN_EXPENSES: UnforeseenExpense[] = [
  {
    id: "MULTA_MP_PERIMETRO",
    title: "⚠️ Notificação do MP por Uso de Pyro em Perímetro",
    category: "SOP",
    cost: 8500,
    description: "Fiscalização judicial identificou artefatos em ruas de acesso. Advogados exigem provisão de defesa.",
    impactLabel: "-R$ 8.500 do Caixa",
  },
  {
    id: "REFORMA_EMERGENCIAL_SEDE",
    title: "🛠️ Reparo Emergencial de Portão e Fachada da Sede",
    category: "SEDE",
    cost: 6200,
    description: "Portão principal e sistema elétrico da sede social precisaram de reparo urgente antes da reunião.",
    impactLabel: "-R$ 6.200 do Caixa",
  },
  {
    id: "HONORARIOS_JURIDICOS_MANDATO",
    title: "⚖️ Honorários Advocatícios de Defesa de Associados",
    category: "ADVOGADO",
    cost: 12000,
    description: "Custas jurídicas para liberar ônibus de caravana retidos em posto rodoviário estadual.",
    impactLabel: "-R$ 12.000 do Caixa",
  },
  {
    id: "REPOSICAO_MATERIAIS_ESTRADA",
    title: "📦 Reposição Imprevista de Instrumentos de Bateria",
    category: "MATERIAL",
    cost: 9500,
    description: "Surdo de marca e caixas danificados durante o transporte exigiram compra emergencial.",
    impactLabel: "-R$ 9.500 do Caixa",
  },
];

export function triggerRandomUnforeseenExpense(bankBalance: number): UnforeseenExpense | null {
  if (bankBalance < 15000) return null;
  if (Math.random() < 0.25) {
    const eligible = UNFORESEEN_EXPENSES.filter((e) => e.cost <= bankBalance * 0.4);
    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }
  return null;
}

export function generateEtapa10CaravanChoices(
  currentTorcida: any,
  facedOpponents: string[] = [],
  playerRank: number = 1
): Etapa10CaravanChoice[] {
  if (!currentTorcida) return [];

  const availableTeams = (teamsData as any[]).filter(
    (t) => t.torcida !== currentTorcida.torcida && !facedOpponents.includes(t.torcida)
  );

  const getBestTorcidaForClub = (clubName: string): any => {
    const clubTorcidas = availableTeams.filter((t) => t.clube.toLowerCase() === clubName.toLowerCase());
    if (clubTorcidas.length === 0) return null;
    if (clubTorcidas.length === 1) return clubTorcidas[0];

    const playerTier = (currentTorcida.tier || "B").toUpperCase();
    const targetTier = playerTier.startsWith("C") ? "C" : playerTier.startsWith("B") ? "B" : playerTier.startsWith("A") ? "A" : "S";
    const exactMatch = clubTorcidas.find((t) => (t.tier || "B").toUpperCase().startsWith(targetTier));
    return exactMatch || clubTorcidas[0];
  };

  const selectedChoices: Etapa10CaravanChoice[] = [];
  const selectedTorcidaNames = new Set<string>();

  // 1. DÉRBI DE ALTA TENSÃO
  let derbyTeam: any = null;
  if (currentTorcida.rival_principal) {
    derbyTeam = getBestTorcidaForClub(currentTorcida.rival_principal);
  }
  if (!derbyTeam && currentTorcida.rival_secundario) {
    derbyTeam = getBestTorcidaForClub(currentTorcida.rival_secundario);
  }
  if (!derbyTeam) {
    const playerTier = (currentTorcida.tier || "B").toUpperCase();
    derbyTeam = availableTeams.find((t) => t.estado === currentTorcida.estado && (t.tier || "B").toUpperCase() === playerTier) ||
      availableTeams.find((t) => t.estado === currentTorcida.estado);
  }
  if (!derbyTeam && availableTeams.length > 0) {
    derbyTeam = availableTeams[0];
  }

  if (derbyTeam) {
    selectedTorcidaNames.add(derbyTeam.torcida);
    selectedChoices.push({
      id: "DERBY_TENSAO",
      category: "DERBY",
      badgeTitle: "🔥 DÉRBI DE ALTA TENSÃO",
      badgeColor: "red",
      title: `Invasão ao Estádio do ${derbyTeam.clube}`,
      clube: derbyTeam.clube,
      rivalTorcida: derbyTeam.torcida,
      estado: derbyTeam.estado,
      stadium: derbyTeam.stadium || `Estádio do ${derbyTeam.clube}`,
      cityState: `${derbyTeam.clube} - ${derbyTeam.estado}`,
      description: `Confronto de altíssima rivalidade contra a ${derbyTeam.torcida}. Exige esquema de segurança máximo e transporte blindado.`,
      impacts: [
        { label: "Moral da Torcida", value: "+++ Moral Máxima", isPositive: true },
        { label: "Respeito Nacional", value: "+15 Respeito", isPositive: true },
        { label: "Risco Policial", value: "⚠️ Risco Elevado", isPositive: false },
        { label: "Custo Rodoviário", value: "R$ 4.500", isPositive: false },
      ],
      teamData: derbyTeam,
    });
  }

  // 2. CARAVANA DA IRMANDADE
  let allyTeam: any = null;
  if (currentTorcida.torcida_aliada) {
    allyTeam = availableTeams.find(
      (t) => !selectedTorcidaNames.has(t.torcida) && (t.torcida.toLowerCase().includes(currentTorcida.torcida_aliada.toLowerCase()) || currentTorcida.torcida_aliada.toLowerCase().includes(t.torcida.toLowerCase()))
    );
  }
  if (!allyTeam && currentTorcida.eixo_alianca) {
    allyTeam = availableTeams.find(
      (t) => !selectedTorcidaNames.has(t.torcida) && t.eixo_alianca === currentTorcida.eixo_alianca
    );
  }
  if (!allyTeam) {
    allyTeam = availableTeams.find(
      (t) => !selectedTorcidaNames.has(t.torcida) && t.estado !== currentTorcida.estado && t.rival_principal !== currentTorcida.clube
    );
  }
  if (!allyTeam && availableTeams.length > 0) {
    allyTeam = availableTeams.find((t) => !selectedTorcidaNames.has(t.torcida)) || availableTeams[0];
  }

  if (allyTeam) {
    selectedTorcidaNames.add(allyTeam.torcida);
    selectedChoices.push({
      id: "CARAVANA_IRMANDADE",
      category: "IRMANDADE",
      badgeTitle: "🟢 CARAVANA DA IRMANDADE",
      badgeColor: "emerald",
      title: `Festa da União com a ${allyTeam.torcida}`,
      clube: allyTeam.clube,
      rivalTorcida: allyTeam.torcida,
      estado: allyTeam.estado,
      stadium: allyTeam.stadium || `Estádio do ${allyTeam.clube}`,
      cityState: `${allyTeam.clube} - ${allyTeam.estado}`,
      description: `Viagem festiva e recepção unificada em clima de amizade de eixo. Churrasco no entorno e zero confronto de pista.`,
      impacts: [
        { label: "Venda de Materiais", value: "+R$ 3.500 Caixa", isPositive: true },
        { label: "Novos Integrantes", value: "+10 Massa", isPositive: true },
        { label: "Risco Policial", value: "🛡️ Zero Risco", isPositive: true },
        { label: "Custo Logístico", value: "R$ 1.200", isPositive: true },
      ],
      teamData: allyTeam,
    });
  }

  // 3. PISTA QUENTE DO INTERIOR / ALÇAPÃO
  let interiorTeam: any = availableTeams.find(
    (t) => !selectedTorcidaNames.has(t.torcida) && (isInteriorSP(t) || t.tier === "B" || t.tier === "C")
  );
  if (!interiorTeam && availableTeams.length > 0) {
    interiorTeam = availableTeams.find((t) => !selectedTorcidaNames.has(t.torcida)) || availableTeams[0];
  }

  if (interiorTeam) {
    selectedTorcidaNames.add(interiorTeam.torcida);
    selectedChoices.push({
      id: "PISTA_INTERIOR",
      category: "INTERIOR",
      badgeTitle: "🟡 ALÇAPÃO REGIONAL",
      badgeColor: "amber",
      title: `Comboio para o Alçapão do ${interiorTeam.clube}`,
      clube: interiorTeam.clube,
      rivalTorcida: interiorTeam.torcida,
      estado: interiorTeam.estado,
      stadium: interiorTeam.stadium || `Estádio Municipal do ${interiorTeam.clube}`,
      cityState: `${interiorTeam.clube} - ${interiorTeam.estado}`,
      description: `Invasão rodoviária em estádio de interior. Torcida mandante de pista forte em terreno acoplado.`,
      impacts: [
        { label: "Poder de Pista", value: "+8 Poder Pista", isPositive: true },
        { label: "Presença Rodoviária", value: "+5 Caravana", isPositive: true },
        { label: "Risco Policial", value: "⚡ Risco Moderado", isPositive: false },
        { label: "Custo Rodoviário", value: "R$ 2.200", isPositive: false },
      ],
      teamData: interiorTeam,
    });
  }

  // 4. GRANDE EXCURSÃO DE CAPITAL DISTANTE
  let capitalTeam: any = availableTeams.find(
    (t) => !selectedTorcidaNames.has(t.torcida) && t.estado !== currentTorcida.estado && (t.tier === "S" || t.tier === "A")
  );
  if (!capitalTeam && availableTeams.length > 0) {
    capitalTeam = availableTeams.find((t) => !selectedTorcidaNames.has(t.torcida)) || availableTeams[0];
  }

  if (capitalTeam) {
    selectedTorcidaNames.add(capitalTeam.torcida);
    selectedChoices.push({
      id: "CAPITAL_DISTANTE",
      category: "CAPITAL",
      badgeTitle: "🟣 GRANDE INVASÃO DE CAPITAL",
      badgeColor: "purple",
      title: `Viagem Monumental ao Estádio do ${capitalTeam.clube}`,
      clube: capitalTeam.clube,
      rivalTorcida: capitalTeam.torcida,
      estado: capitalTeam.estado,
      stadium: capitalTeam.stadium || `Estádio do ${capitalTeam.clube}`,
      cityState: `${capitalTeam.clube} - ${capitalTeam.estado}`,
      description: `Excursão interestadual de longa distância para uma grande capital. Mídia nacional e grande contingente nas ruas.`,
      impacts: [
        { label: "Engajamento Social", value: "+12 Contingente", isPositive: true },
        { label: "Projeção na Mídia", value: "+10 Respeito", isPositive: true },
        { label: "Logística Completa", value: "R$ 5.000", isPositive: false },
        { label: "Desgaste da Tropa", value: "Viagem Longa", isPositive: false },
      ],
      teamData: capitalTeam,
    });
  }

  return selectedChoices;
}
