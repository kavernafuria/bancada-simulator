import {
  getOfficialTorcidas,
  getAnnualPipelineWithMatches,
  executeCompleteMatch,
  calculateScoutIntel,
  isPrincipalRival,
  resolveTorcidaUnicaAction,
  PRESS_CONFERENCES,
  evaluateSeasonEndObjectives,
  generateSeasonObjectives,
  getPoliceMeetingChoices,
  getTransportOptions,
  getTacticalBattleChoices,
  GAME_BALANCE,
} from '../lib/bancada_engine';
import * as fs from 'fs';
import * as path from 'path';

interface SeasonLog {
  season: number;
  startBalance: number;
  duesIncome: number;
  merchIncome: number;
  pressIncome: number;
  matchExpenses: number;
  objectiveRewards: number;
  endBalance: number;
  matchesPlayed: number;
  victoriesPista: number;
  defeatsPista: number;
  membersLostTotal: number;
  mpRiskStart: number;
  mpRiskEnd: number;
  pressConferenceTriggered?: string;
  choicesMade: string[];
  objectivesCompleted: number;
  objectivesFailed: number;
}

export interface TorcidaSimReport {
  tier: string;
  torcidaName: string;
  clubName: string;
  rivalName: string;
  initialBalance: number;
  initialStats: any;
  finalStats: any;
  finalStateTrackers: any;
  finalBalance: number;
  totalExpensesMatch: number;
  totalRevenueDues: number;
  totalRevenueMerch: number;
  totalRevenuePress: number;
  totalRevenueObjectives: number;
  totalVictoriesPista: number;
  totalDefeatsPista: number;
  totalMembersLost: number;
  seasonLogs: SeasonLog[];
  bannedByMP: boolean;
}

function runTierSimulation(targetName: string, tierLabel: string): TorcidaSimReport {
  const officialTorcidas = getOfficialTorcidas();
  const torcida = officialTorcidas.find(
    (t) =>
      t.torcida.toLowerCase().includes(targetName.toLowerCase()) ||
      t.clube.toLowerCase().includes(targetName.toLowerCase())
  ) || officialTorcidas[0];

  let stats = {
    contingente: torcida.contingente || 70,
    pressao_bancada: torcida.pressao_bancada || 70,
    poder_pista: torcida.poder_pista || 70,
    caravana: torcida.caravana || 70,
    autonomia_financeira: torcida.autonomia_financeira || 70,
  };
  let stateTrackers = {
    moral: 50,
    risco_mp: 20,
    relacao_clube: 60,
    respeito_nacional: 40,
  };

  let bankBalance = 15000 + (stats.autonomia_financeira * 200);
  const initialBalance = bankBalance;
  const initialStats = { ...stats };

  let isBannedByMP = false;
  let shownPressConferenceIds: string[] = [];

  let torcidaUnicaState = {
    isTorcidaUnica: false,
    torcidaUnicaCounter: 3,
    permanentCostMult: 1.0,
    hasAlreadyServedTorcidaUnica: false,
  };

  let rivalClub = torcida.rival_principal || "Rival Principal";
  if (torcida.clube === "Corinthians") rivalClub = "Palmeiras";
  else if (torcida.clube === "Ponte Preta") rivalClub = "Guarani";
  else if (torcida.clube === "Portuguesa") rivalClub = "Juventus";

  let totalExpensesMatch = 0;
  let totalRevenueDues = 0;
  let totalRevenueMerch = 0;
  let totalRevenuePress = 0;
  let totalRevenueObjectives = 0;
  let totalVictoriesPista = 0;
  let totalDefeatsPista = 0;
  let totalMembersLost = 0;

  const seasonLogs: SeasonLog[] = [];
  const totalSeasons = 15;

  for (let season = 1; season <= totalSeasons; season++) {
    if (isBannedByMP) break;

    const seasonStartBalance = bankBalance;
    const mpRiskStart = stateTrackers.risco_mp;
    const seasonObjectives = generateSeasonObjectives(season, torcida);
    const pipeline = getAnnualPipelineWithMatches(torcida, season);

    let sMatchExpenses = 0;
    let sMatchesPlayed = 0;
    let sVicPista = 0;
    let sDefPista = 0;
    let sMembersLost = 0;
    const choicesMade: string[] = [];

    for (let pIdx = 0; pIdx < pipeline.length; pIdx++) {
      const step = pipeline[pIdx];

      if (step.type === "key_game" && step.derby) {
        sMatchesPlayed++;
        const derby = step.derby;
        const opponentClub = derby.isHome ? (derby.awayClub || derby.rivalTorcida) : (derby.homeClub || derby.rivalTorcida);
        const isMatchAgainstPrincipalRival = isPrincipalRival(torcida.clube, opponentClub);

        // TORCIDA ÚNICA CRISIS
        if (torcidaUnicaState.isTorcidaUnica && !derby.isAllyGame && isMatchAgainstPrincipalRival) {
          const scenario = derby.isHome === false ? "VISITANTE" : "MANDANTE";
          const res = resolveTorcidaUnicaAction("BONDE_BAIRRO", scenario, bankBalance);
          choicesMade.push(`Jogo ${sMatchesPlayed} vs ${opponentClub}: Bonde de Bairro (${scenario})`);

          if (res.statEffects) {
            stats.contingente = Math.min(100, Math.max(10, stats.contingente + (res.statEffects.contingente || 0)));
            stats.poder_pista = Math.min(100, Math.max(10, stats.poder_pista + (res.statEffects.poder_pista || 0)));
          }
          if (res.cashChange) {
            bankBalance = Math.max(0, bankBalance + res.cashChange);
            if (res.cashChange < 0) sMatchExpenses += Math.abs(res.cashChange);
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

        choicesMade.push(
          `Jogo ${sMatchesPlayed} vs ${opponentClub}: Polícia="${police.title}", Transporte="${transport.title}", Tática="${tactic.title}"`
        );

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

        sMatchExpenses += matchResult.extraExpenses;
        bankBalance = Math.max(0, bankBalance - matchResult.extraExpenses);

        const netMp = Math.max(0, matchResult.mpAdded - 4);
        stateTrackers.risco_mp = Math.min(100, Math.max(0, stateTrackers.risco_mp + netMp));

        if (stateTrackers.risco_mp >= 100) {
          isBannedByMP = true;
          break;
        }

        stateTrackers.moral = Math.min(100, Math.max(0, stateTrackers.moral + matchResult.moralChange));
        const lost = Math.floor(matchResult.membersLost / 10);
        sMembersLost += lost;
        stats.contingente = Math.max(10, stats.contingente - lost);

        if (matchResult.isVictoryPista) {
          sVicPista++;
          stats.poder_pista = Math.min(100, stats.poder_pista + 2);
        } else {
          sDefPista++;
          stats.poder_pista = Math.max(10, stats.poder_pista - 3);
        }
      }
    }

    // ANNUAL REVENUE
    const duesIncome = Math.floor(stats.contingente * GAME_BALANCE.MEMBERSHIP_DUES_PER_MEMBER);
    const merchIncome = Math.floor(stats.autonomia_financeira * GAME_BALANCE.MERCH_REVENUE_FACTOR);
    bankBalance += duesIncome + merchIncome;

    totalRevenueDues += duesIncome;
    totalRevenueMerch += merchIncome;
    totalExpensesMatch += sMatchExpenses;
    totalVictoriesPista += sVicPista;
    totalDefeatsPista += sDefPista;
    totalMembersLost += sMembersLost;

    // OBJECTIVES EVALUATION
    const evaluation = evaluateSeasonEndObjectives(seasonObjectives, stats, stateTrackers, bankBalance, isBannedByMP);
    let sObjReward = 0;
    evaluation.updatedObjectives.forEach((obj) => {
      if (obj.completed && obj.rewardCash) {
        sObjReward += obj.rewardCash;
      }
    });
    bankBalance += sObjReward;
    totalRevenueObjectives += sObjReward;

    // PRESS CONFERENCE
    const allConfs = Object.values(PRESS_CONFERENCES);
    const availableCandidates = allConfs.filter((c) => !shownPressConferenceIds.includes(c.id));
    const candidateList = availableCandidates.length > 0 ? availableCandidates : allConfs;
    const selectedConf = candidateList[Math.floor(Math.random() * candidateList.length)];
    let sPressIncome = 0;

    if (selectedConf) {
      shownPressConferenceIds.push(selectedConf.id);
      const choice = selectedConf.choices[0];
      if (choice && choice.cashDelta) {
        sPressIncome = choice.cashDelta;
        bankBalance += sPressIncome;
        totalRevenuePress += sPressIncome;
      }
      choicesMade.push(`Coletiva: "${selectedConf.title}" (+R$ ${sPressIncome})`);
    }

    seasonLogs.push({
      season,
      startBalance: seasonStartBalance,
      duesIncome,
      merchIncome,
      pressIncome: sPressIncome,
      matchExpenses: sMatchExpenses,
      objectiveRewards: sObjReward,
      endBalance: bankBalance,
      matchesPlayed: sMatchesPlayed,
      victoriesPista: sVicPista,
      defeatsPista: sDefPista,
      membersLostTotal: sMembersLost,
      mpRiskStart,
      mpRiskEnd: stateTrackers.risco_mp,
      pressConferenceTriggered: selectedConf ? selectedConf.title : undefined,
      choicesMade,
      objectivesCompleted: evaluation.completedCount,
      objectivesFailed: evaluation.updatedObjectives.length - evaluation.completedCount,
    });
  }

  return {
    tier: tierLabel,
    torcidaName: torcida.torcida || torcida.clube,
    clubName: torcida.clube,
    rivalName: rivalClub,
    initialBalance,
    initialStats,
    finalStats: stats,
    finalStateTrackers: stateTrackers,
    finalBalance: bankBalance,
    totalExpensesMatch,
    totalRevenueDues,
    totalRevenueMerch,
    totalRevenuePress,
    totalRevenueObjectives,
    totalVictoriesPista,
    totalDefeatsPista,
    totalMembersLost,
    seasonLogs,
    bannedByMP: isBannedByMP,
  };
}

async function main() {
  const reportS = runTierSimulation("Gaviões", "Tier S");
  const reportA = runTierSimulation("Ponte", "Tier A");
  const reportB = runTierSimulation("Leões", "Tier B");

  const fullReport = [reportS, reportA, reportB];
  const outputPath = path.join(__dirname, '../simulation_results_utf8.json');
  fs.writeFileSync(outputPath, JSON.stringify(fullReport, null, 2), 'utf-8');
  console.log("SIMULATION_COMPLETE");
}

main().catch(console.error);
