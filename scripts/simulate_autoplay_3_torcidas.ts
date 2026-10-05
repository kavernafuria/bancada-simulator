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
} from "../lib/bancada_engine";
import { getSeasonalActionEvent, isInteriorSP } from "../lib/season_events";
import { AvaliarMelhorOpcao, BotPlayerState, OptionEffect } from "../lib/autoplay_bot";
import * as fs from "fs";
import * as path from "path";

interface SeasonBotLog {
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
  eventsEvaluated: number;
  decisionsSummary: string[];
  objectivesCompleted: number;
  objectivesFailed: number;
}

export interface TorcidaAutoplayReport {
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
  seasonLogs: SeasonBotLog[];
  bannedByMP: boolean;
}

function runAutoplaySimulation(targetName: string, tierLabel: string): TorcidaAutoplayReport {
  const officialTorcidas = getOfficialTorcidas();
  const torcida =
    officialTorcidas.find(
      (t) =>
        t.torcida.toLowerCase().includes(targetName.toLowerCase()) ||
        t.clube.toLowerCase().includes(targetName.toLowerCase())
    ) || officialTorcidas[0];

  const isInterior = isInteriorSP(torcida);

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

  let bankBalance = 15000 + stats.autonomia_financeira * 200;
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

  let totalExpensesMatch = 0;
  let totalRevenueDues = 0;
  let totalRevenueMerch = 0;
  let totalRevenuePress = 0;
  let totalRevenueObjectives = 0;
  let totalVictoriesPista = 0;
  let totalDefeatsPista = 0;
  let totalMembersLost = 0;

  const seasonLogs: SeasonBotLog[] = [];
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
    let eventsEvaluatedCount = 0;
    const decisionsSummary: string[] = [];

    for (let pIdx = 0; pIdx < pipeline.length; pIdx++) {
      const step = pipeline[pIdx];

      // Build current BotPlayerState for evaluation
      const currentState: BotPlayerState = {
        dinheiro: bankBalance,
        moral: stateTrackers.moral,
        massa: stats.contingente,
        respeito: stateTrackers.respeito_nacional,
        pista: stats.poder_pista,
        bancada: stats.pressao_bancada,
        caravana: stats.caravana,
        autonomia: stats.autonomia_financeira,
        relacao_clube: stateTrackers.relacao_clube,
        risco_mp: stateTrackers.risco_mp,
      };

      // 1. EVENT STEP
      if (step.type === "action") {
        eventsEvaluatedCount++;
        const eventData = getSeasonalActionEvent(Math.min(5, Math.floor(pIdx / 2) + 1) as 1|2|3|4|5, season, pIdx, isInterior);
        const options: OptionEffect[] = eventData.choices.map((c) => ({
          id: c.id,
          text: c.text,
          cost: c.cost,
          cashDelta: c.cost ? -c.cost : 0,
          statEffects: c.statEffects,
          stateEffects: c.stateEffects,
        }));

        // BOT DECISION
        const chosenIdx = AvaliarMelhorOpcao(currentState, options);
        const chosenOption = eventData.choices[chosenIdx - 1] || eventData.choices[0];

        // Apply choice effects
        if (chosenOption.cost) {
          bankBalance = Math.max(0, bankBalance - chosenOption.cost);
        }
        if (chosenOption.statEffects) {
          if (chosenOption.statEffects.contingente) stats.contingente = Math.min(100, Math.max(10, stats.contingente + chosenOption.statEffects.contingente));
          if (chosenOption.statEffects.pressao_bancada) stats.pressao_bancada = Math.min(100, Math.max(10, stats.pressao_bancada + chosenOption.statEffects.pressao_bancada));
          if (chosenOption.statEffects.poder_pista) stats.poder_pista = Math.min(100, Math.max(10, stats.poder_pista + chosenOption.statEffects.poder_pista));
          if (chosenOption.statEffects.caravana) stats.caravana = Math.min(100, Math.max(10, stats.caravana + chosenOption.statEffects.caravana));
          if (chosenOption.statEffects.autonomia_financeira) stats.autonomia_financeira = Math.min(100, Math.max(10, stats.autonomia_financeira + chosenOption.statEffects.autonomia_financeira));
        }
        if (chosenOption.stateEffects) {
          if (chosenOption.stateEffects.moral) stateTrackers.moral = Math.min(100, Math.max(0, stateTrackers.moral + chosenOption.stateEffects.moral));
          if (chosenOption.stateEffects.risco_mp) stateTrackers.risco_mp = Math.min(100, Math.max(0, stateTrackers.risco_mp + chosenOption.stateEffects.risco_mp));
          if (chosenOption.stateEffects.relacao_clube) stateTrackers.relacao_clube = Math.min(100, Math.max(0, stateTrackers.relacao_clube + chosenOption.stateEffects.relacao_clube));
          if (chosenOption.stateEffects.respeito_nacional) stateTrackers.respeito_nacional = Math.min(100, Math.max(0, stateTrackers.respeito_nacional + chosenOption.stateEffects.respeito_nacional));
        }

        decisionsSummary.push(`Evento "${eventData.title}": Bot escolheu Opção ${chosenIdx} ("${chosenOption.text}")`);

        if (stateTrackers.risco_mp >= 100) {
          isBannedByMP = true;
          break;
        }
      }

      // 2. MATCH STEP
      else if (step.type === "key_game" && step.derby) {
        sMatchesPlayed++;
        const derby = step.derby;
        const opponentClub = derby.isHome ? (derby.awayClub || derby.rivalTorcida) : (derby.homeClub || derby.rivalTorcida);
        const isMatchAgainstPrincipalRival = isPrincipalRival(torcida.clube, opponentClub);

        // TORCIDA ÚNICA CRISIS
        if (torcidaUnicaState.isTorcidaUnica && !derby.isAllyGame && isMatchAgainstPrincipalRival) {
          const scenario = derby.isHome === false ? "VISITANTE" : "MANDANTE";
          const res = resolveTorcidaUnicaAction("BONDE_BAIRRO", scenario, bankBalance);
          decisionsSummary.push(`Jogo ${sMatchesPlayed} vs ${opponentClub}: Bonde de Bairro (${scenario})`);

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

        // REGULAR MATCH PREPARATION (POLICE, TRANSPORT, TACTICS) WITH BOT UTILITY EVALUATION
        const policeChoices = getPoliceMeetingChoices(derby);
        const policeOptions: OptionEffect[] = policeChoices.map((p) => ({
          text: p.title,
          cost: p.cost,
          stateEffects: { risco_mp: p.mpRiskBonus, relacao_clube: p.policeReputation },
        }));
        const policeIdx = AvaliarMelhorOpcao(currentState, policeOptions);
        const police = policeChoices[policeIdx - 1] || policeChoices[0];

        const transportChoices = getTransportOptions(derby);
        const transportOptions: OptionEffect[] = transportChoices.map((t) => ({
          text: t.title,
          cost: t.costPerBus,
          statEffects: { caravana: t.capacityMult > 1 ? 5 : 0 },
          stateEffects: { risco_mp: t.mpRisk },
        }));
        const transportIdx = AvaliarMelhorOpcao(currentState, transportOptions);
        const transport = transportChoices[transportIdx - 1] || transportChoices[0];

        const intel = calculateScoutIntel(stats, transport, derby, false);

        const tacticalChoices = getTacticalBattleChoices(derby, stats);
        const tacticalOptions: OptionEffect[] = tacticalChoices.map((t) => ({
          text: t.title,
          statEffects: { poder_pista: t.victoryOdds > 50 ? 4 : -2 },
          stateEffects: { risco_mp: t.mpPenalty, moral: t.moraleBonus },
        }));
        const tacticalIdx = AvaliarMelhorOpcao(currentState, tacticalOptions);
        const tactic = tacticalChoices[tacticalIdx - 1] || tacticalChoices[0];

        decisionsSummary.push(
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
    let completedCount = 0;
    let failedCount = 0;

    evaluation.updatedObjectives.forEach((obj) => {
      if (obj.completed) {
        completedCount++;
        if (obj.rewardCash) sObjReward += obj.rewardCash;
      } else {
        failedCount++;
      }
    });
    bankBalance += sObjReward;
    totalRevenueObjectives += sObjReward;

    // PRESS CONFERENCE EVALUATION
    const allConfs = Object.values(PRESS_CONFERENCES);
    const availableCandidates = allConfs.filter((c) => !shownPressConferenceIds.includes(c.id));
    const candidateList = availableCandidates.length > 0 ? availableCandidates : allConfs;
    const selectedConf = candidateList[Math.floor(Math.random() * candidateList.length)];
    let sPressIncome = 0;

    if (selectedConf) {
      shownPressConferenceIds.push(selectedConf.id);
      
      const confState: BotPlayerState = {
        dinheiro: bankBalance,
        moral: stateTrackers.moral,
        massa: stats.contingente,
        respeito: stateTrackers.respeito_nacional,
        pista: stats.poder_pista,
        bancada: stats.pressao_bancada,
        caravana: stats.caravana,
        autonomia: stats.autonomia_financeira,
        relacao_clube: stateTrackers.relacao_clube,
        risco_mp: stateTrackers.risco_mp,
      };

      const confOptions: OptionEffect[] = selectedConf.choices.map((c) => ({
        text: c.answerText,
        cashDelta: c.cashDelta,
        statEffects: c.statEffects,
        stateEffects: c.stateEffects,
      }));

      const chosenConfIdx = AvaliarMelhorOpcao(confState, confOptions);
      const chosenChoice = selectedConf.choices[chosenConfIdx - 1] || selectedConf.choices[0];

      if (chosenChoice.cashDelta) {
        sPressIncome = chosenChoice.cashDelta;
        bankBalance = Math.max(0, bankBalance + sPressIncome);
        totalRevenuePress += sPressIncome;
      }
      if (chosenChoice.statEffects) {
        if (chosenChoice.statEffects.contingente) stats.contingente = Math.min(100, Math.max(10, stats.contingente + chosenChoice.statEffects.contingente));
        if (chosenChoice.statEffects.poder_pista) stats.poder_pista = Math.min(100, Math.max(10, stats.poder_pista + chosenChoice.statEffects.poder_pista));
        if (chosenChoice.statEffects.pressao_bancada) stats.pressao_bancada = Math.min(100, Math.max(10, stats.pressao_bancada + chosenChoice.statEffects.pressao_bancada));
      }
      if (chosenChoice.stateEffects) {
        if (chosenChoice.stateEffects.moral) stateTrackers.moral = Math.min(100, Math.max(0, stateTrackers.moral + chosenChoice.stateEffects.moral));
        if (chosenChoice.stateEffects.risco_mp) stateTrackers.risco_mp = Math.min(100, Math.max(0, stateTrackers.risco_mp + chosenChoice.stateEffects.risco_mp));
      }

      decisionsSummary.push(`Coletiva "${selectedConf.title}": Bot escolheu Opção ${chosenConfIdx} (+R$ ${sPressIncome})`);
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
      eventsEvaluated: eventsEvaluatedCount,
      decisionsSummary,
      objectivesCompleted: completedCount,
      objectivesFailed: failedCount,
    });
  }

  return {
    tier: tierLabel,
    torcidaName: torcida.torcida,
    clubName: torcida.clube,
    rivalName: torcida.rival_principal || "Rival Principal",
    initialBalance,
    initialStats,
    finalStats: { ...stats },
    finalStateTrackers: { ...stateTrackers },
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

export function runAllAutoplaySimulations() {
  console.log("=== INICIANDO PLAYTEST AUTOMATIZADO COM AUTOPLAY BOT (AGENTE DE UTILIDADE) ===");
  
  const report1 = runAutoplaySimulation("Força Jovem do Vasco", "Tier S - Grande Torcida Nacional");
  const report2 = runAutoplaySimulation("Inferno Coral", "Tier A/B+ - Torcida Tradicional / Média");
  const report3 = runAutoplaySimulation("Esquadrão Alvinegro", "Tier C - Torcida Regional / Interior");

  const fullResults = {
    generatedAt: new Date().toISOString(),
    reports: [report1, report2, report3],
  };

  const outputPath = path.join(process.cwd(), "scratch", "autoplay_playtest_15_seasons_results.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(fullResults, null, 2), "utf-8");

  console.log(`\nPlaytest concluído com sucesso! Resultados salvos em: ${outputPath}`);
  return fullResults;
}

if (require.main === module) {
  runAllAutoplaySimulations();
}
