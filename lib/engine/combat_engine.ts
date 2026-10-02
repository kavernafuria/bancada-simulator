import {
  TorcidaStats,
  StateTrackers,
  DerbyMatchInfo,
  PoliceMeetingChoice,
  TransportChoice,
  MatchScoutReport,
  TacticalBattleChoice,
  MatchExecutionResult,
  FormattedDelta,
} from "./types";

export function calculateScoutIntel(
  stats: TorcidaStats,
  transport: TransportChoice,
  derby: DerbyMatchInfo,
  isInterior: boolean
): MatchScoutReport {
  const basePlayerMembers = Math.round(stats.contingente * 45 * transport.capacityMultiplier);
  const playerMembersPresent = derby.isAllyGame
    ? Math.round(basePlayerMembers * 1.3)
    : Math.round(basePlayerMembers * (isInterior ? 0.9 : 1.1));

  const baseRivalMembers = derby.isAllyGame
    ? Math.round(stats.contingente * 40)
    : Math.round(stats.poder_pista * 40 * (derby.isHome ? 0.8 : 1.2));
  const rivalMembersWaiting = Math.max(800, Math.round(baseRivalMembers));

  let policePresence: "SEVERA" | "PACIFICA" | "REFORCADA" | "OPERACAO_PADRAO" = "OPERACAO_PADRAO";
  if (derby.isAllyGame) {
    policePresence = "PACIFICA";
  } else if (transport.mpRisk > 15 || isInterior) {
    policePresence = "SEVERA";
  } else if (stats.poder_pista > 75) {
    policePresence = "REFORCADA";
  }

  let twistTitle = "CLIMA TENSOS NAS IMEDIAÇÕES";
  let twistDescription = "Monitoramento intensivo da Polícia Militar nas vias de acesso ao estádio.";

  if (derby.isAllyGame) {
    twistTitle = "RECEPÇÃO FESTIVA DE IRMANDADE";
    twistDescription = "Churrasco unificado no entorno com presença das duas baterias e recepção pacífica dos comboios.";
  } else if (policePresence === "SEVERA") {
    twistTitle = "BLOQUEIO DE SEGURANÇA E REVISTA SEVERA";
    twistDescription = "Catracas com biometria facial e fiscalização pesada do Choque nos portões de visitantes.";
  } else if (playerMembersPresent > rivalMembersWaiting * 1.3) {
    twistTitle = "SUPERIORIDADE DE CONTINGENTE NAS RUAS";
    twistDescription = "A comitiva da nossa torcida chegou em peso ocupando as principais vias do entorno.";
  }

  return {
    playerMembersPresent,
    rivalMembersWaiting,
    policePresence,
    twistTitle,
    twistDescription,
  };
}

export function getPoliceMeetingChoices(isHome: boolean, isAllyGame: boolean): PoliceMeetingChoice[] {
  if (isAllyGame) {
    return [
      {
        id: "ALINHAMENTO_PAZ",
        title: "🤝 Reunião de Paz & Entrada Integrada",
        stance: "DIPLOMATICA",
        description: "Acordo com o Comando da Polícia para escolta festiva e entrada conjunta com a torcida aliada.",
        cost: 500,
        mpRiskMod: -15,
        bancadaBonus: 10,
        pistaMod: 0,
        moralMod: 8,
        meetingLog: "Alinhamento com o Comando Militar garantindo festa pacífica e comboio livre.",
        formattedDeltas: [
          { label: "Clima no Entorno", value: "Festa & União", isPositive: true },
          { label: "Risco MP", value: "-15% Risco", isPositive: true },
        ],
      },
    ];
  }

  return [
    {
      id: "ESCOLTA_OFICIAL",
      title: "🛡️ Escolta Oficial Padronizada",
      stance: "ESCOLTA_TOTAL",
      description: "Deslocamento alinhado ao Batalhão de Choque com trajeto fiscalizado.",
      cost: 1500,
      mpRiskMod: -10,
      bancadaBonus: 5,
      pistaMod: -5,
      moralMod: 2,
      meetingLog: "Escolta militar assegurada, reduzindo atritos mas diminuindo a liberdade de ação.",
      formattedDeltas: [
        { label: "Segurança de Percurso", value: "Escolta Completa", isPositive: true },
        { label: "Risco MP", value: "-10% Risco", isPositive: true },
      ],
    },
    {
      id: "POSTURA_COMBATIVA",
      title: "🔥 Recusa de Imposições Policiais",
      stance: "COMBATIVA",
      description: "Manter o bonde firme nas imediações sem aceitar alterações no trajeto tradicional.",
      cost: 0,
      mpRiskMod: 15,
      bancadaBonus: 8,
      pistaMod: 12,
      moralMod: 10,
      meetingLog: "Diretoria rejeitou restrições da PM, aumentando a moral da linha de frente.",
      formattedDeltas: [
        { label: "Moral de Pista", value: "+12 Poder Pista", isPositive: true },
        { label: "Risco MP", value: "+15% Risco", isPositive: false },
      ],
    },
  ];
}

export function getTacticalBattleChoices(
  isHome: boolean,
  isAllyGame: boolean,
  stats: TorcidaStats
): TacticalBattleChoice[] {
  if (isAllyGame) {
    return [
      {
        id: "FESTA_UNIFICADA",
        title: "🎉 Cortejo Unificado & Mosaico Conjunto",
        description: "Recepção com churrasco, sinalizadores e cantos unificados com a torcida aliada.",
        pistaMod: 0,
        moralMod: 12,
        mpPenalty: 0,
        costRisk: 500,
        injuryRisk: 0,
        tacticalLog: "Grande espetáculo de confraternização registrado pelas duas agremiações.",
        formattedDeltas: [
          { label: "Festa de Irmandade", value: "100% União", isPositive: true },
          { label: "Moral", value: "+12 Moral", isPositive: true },
        ],
      },
    ];
  }

  return [
    {
      id: "SHOW_ARQUIBANCADA",
      title: "🥁 Show Total de Bancada & Mosaico 3D",
      description: "Concentrar toda a energia no espetáculo visual, bateria acelerada e bandeirões.",
      pistaMod: 5,
      moralMod: 15,
      mpPenalty: 0,
      costRisk: 1500,
      injuryRisk: 0,
      tacticalLog: "Bateria e mosaico 3D dominaram o espetáculo do estádio.",
      formattedDeltas: [
        { label: "Pressão de Bancada", value: "+++ Show de Arquibancada", isPositive: true },
        { label: "Moral da Tropa", value: "+15 Moral", isPositive: true },
      ],
      isMosaicTactic: true,
    },
    {
      id: "LINHA_FRENTE_PISTA",
      title: "🥊 Linha de Frente Firme na Pista",
      description: "Posicionar os veteranos e o bonde de pista na contenção perimetral.",
      pistaMod: 20,
      moralMod: 10,
      mpPenalty: 10,
      costRisk: 2500,
      injuryRisk: 5,
      tacticalLog: "Linha de frente garantiu a ocupação das vias e protegeu a comitiva.",
      formattedDeltas: [
        { label: "Poder de Pista", value: "+++ Domínio do Percurso", isPositive: true },
        { label: "Risco MP", value: "+10% Risco", isPositive: false },
      ],
    },
  ];
}

export function executeMatchWorkflow(
  derby: DerbyMatchInfo,
  police: PoliceMeetingChoice | null,
  transport: TransportChoice,
  intel: MatchScoutReport,
  tactic: TacticalBattleChoice,
  stats: TorcidaStats,
  state: StateTrackers,
  isRetryWithAd: boolean = false
): MatchExecutionResult {
  const playerMembers = intel.playerMembersPresent;
  const rivalMembers = intel.rivalMembersWaiting;

  const playerForce = Math.round(
    stats.poder_pista * 1.5 + (police ? police.pistaMod : 0) + tactic.pistaMod + playerMembers / 100
  );
  const rivalForce = Math.round(stats.poder_pista * 1.3 + rivalMembers / 100);

  const isVictoryPista = playerForce >= rivalForce * 0.9;
  const scorePlayerClub = isVictoryPista ? Math.max(1, Math.floor(Math.random() * 2 + 1)) : Math.floor(Math.random() * 2);
  const scoreRivalClub = isVictoryPista ? Math.floor(Math.random() * scorePlayerClub) : scorePlayerClub + 1;

  const extraExpenses = transport.fixedCost + (police ? police.cost : 0) + tactic.costRisk;
  const mpAdded = Math.max(0, transport.mpRisk + (police ? police.mpRiskMod : 0) + tactic.mpPenalty);
  const moralChange = isVictoryPista ? 12 : -8;

  const statusTitle = derby.isAllyGame
    ? `FESTA HISTÓRICA DE UNIÃO EM ${derby.stadium.toUpperCase()}`
    : isVictoryPista
    ? `VITÓRIA & FESTA NA ARQUIBANCADA EM ${derby.stadium.toUpperCase()}`
    : `DESEMPENHO IRREGULAR EM ${derby.stadium.toUpperCase()}`;

  const formattedScore = derby.isHome
    ? `${scorePlayerClub} x ${scoreRivalClub}`
    : `${scoreRivalClub} x ${scorePlayerClub}`;

  const deltas: FormattedDelta[] = [
    { label: "Resultado de Pista", value: isVictoryPista ? "Vitória e Domínio" : "Recuo Estratégico", isPositive: isVictoryPista },
    { label: "Placar do Jogo", value: formattedScore, isPositive: scorePlayerClub >= scoreRivalClub },
    { label: "Moral da Tropa", value: moralChange >= 0 ? `+${moralChange}` : `${moralChange}`, isPositive: moralChange >= 0 },
    { label: "Custos do Jogo", value: `R$ ${extraExpenses.toLocaleString()}`, isPositive: false },
  ];

  const chronicleText = `O comboio ocupou o entorno do estádio ${derby.stadium} com aproximadamente ${playerMembers.toLocaleString()} integrantes. A postura policial (${police?.title || "padrão"}) e a tática de ${tactic.title} definiram o transcorrer do jogo. Nas arquibancadas, a torcida fez a sua parte do início ao fim.`;

  return {
    scorePlayerClub,
    scoreRivalClub,
    effectiveForcePlayer: playerForce,
    effectiveForceRival: rivalForce,
    isVictoryPista,
    isVictoryBancada: isVictoryPista,
    isPistaFight: !derby.isAllyGame,
    statusTitle,
    membersLost: isVictoryPista ? 0 : 5,
    medicalCost: isVictoryPista ? 0 : 1200,
    extraExpenses,
    mpAdded,
    moralChange,
    chronicleText,
    formattedDeltas: deltas,
    bannerCaptured: isVictoryPista && Math.random() < 0.05,
    bannerLost: !isVictoryPista && Math.random() < 0.05,
  };
}
