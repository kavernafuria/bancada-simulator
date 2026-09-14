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

interface StepLog {
  stepIndex: number;
  type: "action" | "key_game";
  title: string;
  choiceMadeText: string;
  costOrReward: number;
  contingenteChange?: number;
  poderPistaChange?: number;
  bancadaChange?: number;
  caravanaChange?: number;
  autonomiaChange?: number;
  moralChange?: number;
}

interface FullSeasonLog {
  season: number;
  startBalance: number;
  duesIncome: number;
  merchIncome: number;
  pressIncome: number;
  objectiveRewards: number;
  actionCosts: number;
  matchExpenses: number;
  endBalance: number;
  contingenteStart: number;
  contingenteEnd: number;
  poderPistaStart: number;
  poderPistaEnd: number;
  bancadaEnd: number;
  caravanaEnd: number;
  autonomiaEnd: number;
  moralEnd: number;
  mpRiskEnd: number;
  matchesPlayed: number;
  victoriesPista: number;
  defeatsPista: number;
  membersLostTotal: number;
  membersRecruitedTotal: number;
  pressConferenceTriggered?: string;
  objectivesCompleted: number;
  objectivesFailed: number;
  stepLogs: StepLog[];
}

export interface FullTorcidaSimReport {
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
  totalExpensesActions: number;
  totalRevenueDues: number;
  totalRevenueMerch: number;
  totalRevenuePress: number;
  totalRevenueObjectives: number;
  totalVictoriesPista: number;
  totalDefeatsPista: number;
  totalMembersLost: number;
  totalMembersRecruited: number;
  seasonLogs: FullSeasonLog[];
  bannedByMP: boolean;
}

function runFullTierSimulation(targetName: string, tierLabel: string): FullTorcidaSimReport {
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
  let totalExpensesActions = 0;
  let totalRevenueDues = 0;
  let totalRevenueMerch = 0;
  let totalRevenuePress = 0;
  let totalRevenueObjectives = 0;
  let totalVictoriesPista = 0;
  let totalDefeatsPista = 0;
  let totalMembersLost = 0;
  let totalMembersRecruited = 0;

  const seasonLogs: FullSeasonLog[] = [];
  const totalSeasons = 15;

  for (let season = 1; season <= totalSeasons; season++) {
    if (isBannedByMP) break;

    const seasonStartBalance = bankBalance;
    const contingenteStart = stats.contingente;
    const poderPistaStart = stats.poder_pista;

    const seasonObjectives = generateSeasonObjectives(season, torcida);
    const pipeline = getAnnualPipelineWithMatches(torcida, season);

    let sMatchExpenses = 0;
    let sActionCosts = 0;
    let sMatchesPlayed = 0;
    let sVicPista = 0;
    let sDefPista = 0;
    let sMembersLost = 0;
    let sMembersRecruited = 0;

    const stepLogs: StepLog[] = [];

    for (let pIdx = 0; pIdx < pipeline.length; pIdx++) {
      const step = pipeline[pIdx];

      if (step.type === "action" && step.actionEvent) {
        const event = step.actionEvent;
        let selectedChoice = event.choices[0];

        // Player Strategy:
        // If contingente < 85, prioritize choices with positive contingente gain (Popular Recruiting)
        // If bank balance is healthy (>5000), choose investments that boost stats and moral.
        if (stats.contingente < 85) {
          const recruitingChoice = event.choices.find((c) => (c.statEffects?.contingente || 0) > 0);
          if (recruitingChoice && bankBalance >= (recruitingChoice.cost || 0)) {
            selectedChoice = recruitingChoice;
          }
        } else {
          const affordableChoices = event.choices.filter((c) => (c.cost || 0) <= Math.min(bankBalance, 5000));
          if (affordableChoices.length > 0) {
            selectedChoice = affordableChoices[0];
          }
        }

        const choiceCost = selectedChoice.cost || 0;
        bankBalance = Math.max(0, bankBalance - choiceCost);
        sActionCosts += choiceCost;

        if (selectedChoice.statEffects) {
          const cAdd = selectedChoice.statEffects.contingente || 0;
          const pAdd = selectedChoice.statEffects.poder_pista || 0;
          const bAdd = selectedChoice.statEffects.pressao_bancada || 0;
          const carAdd = selectedChoice.statEffects.caravana || 0;
          const aAdd = selectedChoice.statEffects.autonomia_financeira || 0;

          if (cAdd > 0) sMembersRecruited += cAdd;
          stats.contingente = Math.min(100, Math.max(10, stats.contingente + cAdd));
          stats.poder_pista = Math.min(100, Math.max(10, stats.poder_pista + pAdd));
          stats.pressao_bancada = Math.min(100, Math.max(10, stats.pressao_bancada + bAdd));
          stats.caravana = Math.min(100, Math.max(10, stats.caravana + carAdd));
          stats.autonomia_financeira = Math.min(100, Math.max(10, stats.autonomia_financeira + aAdd));
        }

        if (selectedChoice.stateEffects) {
          if (selectedChoice.stateEffects.moral) {
            stateTrackers.moral = Math.min(100, Math.max(0, stateTrackers.moral + selectedChoice.stateEffects.moral));
          }
          if (selectedChoice.stateEffects.risco_mp) {
            stateTrackers.risco_mp = Math.min(100, Math.max(0, stateTrackers.risco_mp + selectedChoice.stateEffects.risco_mp));
          }
        }

        stepLogs.push({
          stepIndex: pIdx + 1,
          type: "action",
          title: event.title,
          choiceMadeText: selectedChoice.text,
          costOrReward: -choiceCost,
          contingenteChange: selectedChoice.statEffects?.contingente,
          poderPistaChange: selectedChoice.statEffects?.poder_pista,
          bancadaChange: selectedChoice.statEffects?.pressao_bancada,
          caravanaChange: selectedChoice.statEffects?.caravana,
          autonomiaChange: selectedChoice.statEffects?.autonomia_financeira,
          moralChange: selectedChoice.stateEffects?.moral,
        });

      } else if (step.type === "key_game" && step.derby) {
        sMatchesPlayed++;
        const derby = step.derby;
        const opponentClub = derby.isHome ? (derby.awayClub || derby.rivalTorcida) : (derby.homeClub || derby.rivalTorcida);
        const isMatchAgainstPrincipalRival = isPrincipalRival(torcida.clube, opponentClub);

        // TORCIDA ÚNICA CRISIS
        if (torcidaUnicaState.isTorcidaUnica && !derby.isAllyGame && isMatchAgainstPrincipalRival) {
          const scenario = derby.isHome === false ? "VISITANTE" : "MANDANTE";
          const res = resolveTorcidaUnicaAction("BONDE_BAIRRO", scenario, bankBalance);

          if (res.statEffects) {
            stats.contingente = Math.min(100, Math.max(10, stats.contingente + (res.statEffects.contingente || 0)));
            stats.poder_pista = Math.min(100, Math.max(10, stats.poder_pista + (res.statEffects.poder_pista || 0)));
          }
          let mExp = 0;
          if (res.cashChange) {
            bankBalance = Math.max(0, bankBalance + res.cashChange);
            if (res.cashChange < 0) {
              mExp = Math.abs(res.cashChange);
              sMatchExpenses += mExp;
            }
          }

          stepLogs.push({
            stepIndex: pIdx + 1,
            type: "key_game",
            title: `Jogo ${sMatchesPlayed}: Ação Clandestina Bonde de Bairro (${scenario})`,
            choiceMadeText: `Resolução Clandestina Bonde de Bairro`,
            costOrReward: -mExp,
          });
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

        // Check if Torcida Única gets triggered by MP decree
        if (!derby.isAllyGame && !torcidaUnicaState.hasAlreadyServedTorcidaUnica && !torcidaUnicaState.isTorcidaUnica) {
          if ((stateTrackers.risco_mp > 65 || season === 3) && isMatchAgainstPrincipalRival) {
            torcidaUnicaState = {
              isTorcidaUnica: true,
              torcidaUnicaCounter: 3,
              permanentCostMult: 1.20,
              hasAlreadyServedTorcidaUnica: true,
            };
          }
        }

        stepLogs.push({
          stepIndex: pIdx + 1,
          type: "key_game",
          title: `Jogo ${sMatchesPlayed}: ${derby.matchTitle}`,
          choiceMadeText: `Polícia: ${police.title} | Transp: ${transport.title} | Tática: ${tactic.title}`,
          costOrReward: -matchResult.extraExpenses,
          poderPistaChange: matchResult.isVictoryPista ? 2 : -3,
          moralChange: matchResult.moralChange,
          contingenteChange: -lost,
        });
      }
    }

    // Torcida Única Season Decrement
    if (torcidaUnicaState.isTorcidaUnica) {
      torcidaUnicaState.torcidaUnicaCounter -= 1;
      if (torcidaUnicaState.torcidaUnicaCounter <= 0) {
        torcidaUnicaState.isTorcidaUnica = false;
      }
    }

    // ANNUAL REVENUE
    const duesIncome = Math.floor(stats.contingente * GAME_BALANCE.MEMBERSHIP_DUES_PER_MEMBER);
    const merchIncome = Math.floor(stats.autonomia_financeira * GAME_BALANCE.MERCH_REVENUE_FACTOR);
    bankBalance += duesIncome + merchIncome;

    totalRevenueDues += duesIncome;
    totalRevenueMerch += merchIncome;
    totalExpensesMatch += sMatchExpenses;
    totalExpensesActions += sActionCosts;
    totalVictoriesPista += sVicPista;
    totalDefeatsPista += sDefPista;
    totalMembersLost += sMembersLost;
    totalMembersRecruited += sMembersRecruited;

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
    }

    seasonLogs.push({
      season,
      startBalance: seasonStartBalance,
      duesIncome,
      merchIncome,
      pressIncome: sPressIncome,
      objectiveRewards: sObjReward,
      actionCosts: sActionCosts,
      matchExpenses: sMatchExpenses,
      endBalance: bankBalance,
      contingenteStart,
      contingenteEnd: stats.contingente,
      poderPistaStart,
      poderPistaEnd: stats.poder_pista,
      bancadaEnd: stats.pressao_bancada,
      caravanaEnd: stats.caravana,
      autonomiaEnd: stats.autonomia_financeira,
      moralEnd: stateTrackers.moral,
      mpRiskEnd: stateTrackers.risco_mp,
      matchesPlayed: sMatchesPlayed,
      victoriesPista: sVicPista,
      defeatsPista: sDefPista,
      membersLostTotal: sMembersLost,
      membersRecruitedTotal: sMembersRecruited,
      pressConferenceTriggered: selectedConf ? selectedConf.title : undefined,
      objectivesCompleted: evaluation.completedCount,
      objectivesFailed: evaluation.updatedObjectives.length - evaluation.completedCount,
      stepLogs,
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
    totalExpensesActions,
    totalRevenueDues,
    totalRevenueMerch,
    totalRevenuePress,
    totalRevenueObjectives,
    totalVictoriesPista,
    totalDefeatsPista,
    totalMembersLost,
    totalMembersRecruited,
    seasonLogs,
    bannedByMP: isBannedByMP,
  };
}

async function main() {
  console.log("=== INICIANDO SIMULAÇÃO COMPLETA DE 195 ETAPAS (15 TEMPORADAS x 13 ETAPAS) PARA 3 TORCIDAS ===");

  const reportS = runFullTierSimulation("Gaviões", "Tier S");
  const reportA = runFullTierSimulation("Ponte", "Tier A");
  const reportB = runFullTierSimulation("Leões", "Tier B");

  const fullReport = [reportS, reportA, reportB];
  const outputPath = path.join(__dirname, '../simulation_full_game_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(fullReport, null, 2), 'utf-8');
  console.log("FULL_GAME_SIMULATION_COMPLETE");
}

main().catch(console.error);
