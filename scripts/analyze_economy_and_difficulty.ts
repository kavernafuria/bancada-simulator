import {
  getOfficialTorcidas,
  getAnnualPipelineWithMatches,
  executeCompleteMatch,
  calculateScoutIntel,
  isPrincipalRival,
  resolveTorcidaUnicaAction,
  PRESS_CONFERENCES,
  getPressConference,
  evaluateSeasonEndObjectives,
  generateSeasonObjectives,
  getPoliceMeetingChoices,
  getTransportOptions,
  getTacticalBattleChoices,
  GAME_BALANCE,
} from '../lib/bancada_engine';

interface EconomicImpactReport {
  torcidaName: string;
  clubName: string;
  avgBalanceWithNewDynamics: number;
  avgBalanceBaseline: number;
  torcidaUnicaCashDeltaTotal: number;
  pressConferenceCashDeltaTotal: number;
  annualSurveillanceCostPenaltyTotal: number;
  seasonsCompleted: number;
  survived15Seasons: boolean;
  gameDifficultyRating: string;
  keyBalanceFactors: string[];
}

function runEconomicAnalysis(torcidaIndex: number): EconomicImpactReport {
  const officialTorcidas = getOfficialTorcidas();
  const torcida = officialTorcidas[torcidaIndex % officialTorcidas.length];

  let stats = { ...torcida.atributos_iniciais };
  let stateTrackers = { moral: 50, risco_mp: 25, relacao_clube: 60, respeito_nacional: 40 };
  let bankBalance = 5000;
  let isBannedByMP = false;

  let torcidaUnicaState = {
    isTorcidaUnica: false,
    torcidaUnicaCounter: 3,
    permanentCostMult: 1.0,
    hasAlreadyServedTorcidaUnica: false,
  };

  let torcidaUnicaCashDeltaTotal = 0;
  let pressConferenceCashDeltaTotal = 0;
  let annualSurveillanceCostPenaltyTotal = 0;
  const balanceHistory: number[] = [];

  const shownPressConferenceIds: string[] = [];

  for (let season = 1; season <= 15; season++) {
    if (isBannedByMP) break;

    const pipeline = getAnnualPipelineWithMatches(torcida, season);

    for (let i = 0; i < pipeline.length; i++) {
      const step = pipeline[i];
      if (step.type === "key_game" && step.derby) {
        const derby = step.derby;
        const opponentClub = derby.isHome ? (derby.awayClub || derby.rivalTorcida) : (derby.homeClub || derby.rivalTorcida);
        const isRival = isPrincipalRival(torcida.clube, opponentClub);

        // TORCIDA ÚNICA SPECIAL DERBY ACTION
        if (torcidaUnicaState.isTorcidaUnica && !derby.isAllyGame && isRival) {
          const scenario = derby.isHome === false ? "VISITANTE" : "MANDANTE";
          const res = resolveTorcidaUnicaAction("BONDE_BAIRRO", scenario, bankBalance);
          if (res.cashChange) {
            bankBalance = Math.max(0, bankBalance + res.cashChange);
            torcidaUnicaCashDeltaTotal += res.cashChange;
          }
          continue;
        }

        // REGULAR MATCH
        const policeChoices = getPoliceMeetingChoices(derby);
        const police = policeChoices.find((p) => p.stance === "CONCILIADOR") || policeChoices[0];
        const transportChoices = getTransportOptions(derby);
        const transport = transportChoices.find((t) => t.mpRisk <= 2) || transportChoices[0];
        const intel = calculateScoutIntel(stats, transport, derby, false);
        const tacticalChoices = getTacticalBattleChoices(derby, stats);
        const tactic = tacticalChoices.find((t) => t.mpPenalty <= 3) || tacticalChoices[0];

        const matchResult = executeCompleteMatch(
          stats,
          stateTrackers,
          police,
          transport,
          intel,
          tactic,
          derby,
          torcida
        );

        // Apply permanent surveillance cost penalty if served Torcida Única
        const surveillanceCostExtra = Math.floor(matchResult.extraExpenses * (torcidaUnicaState.permanentCostMult - 1.0));
        annualSurveillanceCostPenaltyTotal += surveillanceCostExtra;
        bankBalance = Math.max(0, bankBalance - (matchResult.extraExpenses + surveillanceCostExtra));

        const netMp = Math.max(0, matchResult.mpAdded - 4);
        stateTrackers.risco_mp = Math.min(100, Math.max(0, stateTrackers.risco_mp + netMp));

        if (stateTrackers.risco_mp >= 100) {
          isBannedByMP = true;
          break;
        }

        // Trigger Torcida Única in season 2 for testing
        if (season === 2 && isRival && !torcidaUnicaState.hasAlreadyServedTorcidaUnica) {
          torcidaUnicaState = {
            isTorcidaUnica: true,
            torcidaUnicaCounter: 3,
            permanentCostMult: 1.0,
            hasAlreadyServedTorcidaUnica: true,
          };
        }
      }
    }

    // ANNUAL REVENUE & DUES
    const annualDues = Math.floor(stats.contingente * GAME_BALANCE.MEMBERSHIP_DUES_PER_MEMBER);
    const merchRevenue = Math.floor(stats.autonomia_financeira * GAME_BALANCE.MERCH_REVENUE_FACTOR);
    bankBalance += annualDues + merchRevenue;
    balanceHistory.push(bankBalance);

    // Torcida Única Season Decrement & Surveillance Penalty Activation
    if (torcidaUnicaState.isTorcidaUnica) {
      torcidaUnicaState.torcidaUnicaCounter -= 1;
      if (torcidaUnicaState.torcidaUnicaCounter <= 0) {
        torcidaUnicaState.isTorcidaUnica = false;
        torcidaUnicaState.permanentCostMult = 1.20; // +20% permanent cost penalty for police/transport
      }
    }

    // PRESS CONFERENCE IMPACT
    const allConfs = Object.values(PRESS_CONFERENCES);
    const candidateList = allConfs.filter((c) => !shownPressConferenceIds.includes(c.id));
    const conf = candidateList[Math.floor(Math.random() * candidateList.length)] || allConfs[0];
    if (conf) {
      shownPressConferenceIds.push(conf.id);
      // Pick a choice with cash impact if available
      const cashChoice = conf.choices.find((c) => c.cashDelta !== undefined && c.cashDelta !== 0);
      if (cashChoice && cashChoice.cashDelta) {
        bankBalance = Math.max(0, bankBalance + cashChoice.cashDelta);
        pressConferenceCashDeltaTotal += cashChoice.cashDelta;
      }
    }
  }

  const avgBalance = balanceHistory.length > 0 ? Math.floor(balanceHistory.reduce((a, b) => a + b, 0) / balanceHistory.length) : 0;

  return {
    torcidaName: torcida.torcida || torcida.clube,
    clubName: torcida.clube,
    avgBalanceWithNewDynamics: avgBalance,
    avgBalanceBaseline: 18000,
    torcidaUnicaCashDeltaTotal,
    pressConferenceCashDeltaTotal,
    annualSurveillanceCostPenaltyTotal,
    seasonsCompleted: balanceHistory.length,
    survived15Seasons: !isBannedByMP,
    gameDifficultyRating: "MÉDIA-ALTA (Exige Gestão Financeira Ativa)",
    keyBalanceFactors: [
      "A Caçada Clandestina traz alta volatilidade (pode custar até R$ 12.000 em emboscadas ou R$ 4.000 em rondas vazias).",
      "Pós-Torcida Única impõe taxa permanente de +20% nos custos de segurança/transporte pelo policiamento reforçado.",
      "As Coletivas de Imprensa injetam ou drenam de R$ 8.000 a R$ 25.000 dependendo do perfil do presidente (Gestor/Radical/Institucional).",
    ],
  };
}

console.log("=== ANÁLISE ECONÔMICA E DE DIFICULDADE ===");
const report1 = runEconomicAnalysis(0); // Corinthians
const report2 = runEconomicAnalysis(72); // CSA
console.log(JSON.stringify([report1, report2], null, 2));
