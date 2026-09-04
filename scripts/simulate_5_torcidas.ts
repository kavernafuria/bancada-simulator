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
  simulateNationalRanking,
  getPoliceMeetingChoices,
  getTransportOptions,
  getTacticalBattleChoices,
  GAME_BALANCE,
} from '../lib/bancada_engine';

interface TorcidaSimResult {
  torcidaName: string;
  clubName: string;
  rivalName: string;
  totalSeasonsCompleted: number;
  finalBankBalance: number;
  finalStats: {
    contingente: number;
    pressao_bancada: number;
    poder_pista: number;
    caravana: number;
    autonomia_financeira: number;
  };
  finalStateTrackers: {
    moral: number;
    risco_mp: number;
    relacao_clube: number;
    respeito_nacional: number;
  };
  torcidaUnicaActivated: boolean;
  torcidaUnicaActivationSeason?: number;
  torcidaUnicaRevocationSeason?: number;
  torcidaUnicaCrisisMatchesHandled: number;
  cagadaClandestinaRouletteRolls: Array<{ season: number; outcomeId: string; title: string }>;
  pressConferencesTriggered: Array<{ season: number; id: string; title: string }>;
  objectivesCompletedTotal: number;
  objectivesFailedTotal: number;
  bannedByMP: boolean;
}

async function runSimulationForTorcida(targetTorcidaName: string): Promise<TorcidaSimResult> {
  const officialTorcidas = getOfficialTorcidas();
  const torcida = officialTorcidas.find((t) => (t.torcida && t.torcida.toLowerCase().includes(targetTorcidaName.toLowerCase())) || (t.clube && t.clube.toLowerCase().includes(targetTorcidaName.toLowerCase()))) || officialTorcidas[0];

  // 1. Initial State Initialization
  let stats = { ...torcida.atributos_iniciais };
  let stateTrackers = {
    moral: 50,
    risco_mp: 25,
    relacao_clube: 60,
    respeito_nacional: 40,
  };
  let bankBalance = 5000;
  let isBannedByMP = false;

  let torcidaUnicaState = {
    isTorcidaUnica: false,
    torcidaUnicaCounter: 3,
    permanentCostMult: 1.0,
    hasAlreadyServedTorcidaUnica: false,
  };

  let shownPressConferenceIds: string[] = [];
  const rouletteRolls: Array<{ season: number; outcomeId: string; title: string }> = [];
  const pressLogs: Array<{ season: number; id: string; title: string }> = [];

  let torcidaUnicaActivated = false;
  let torcidaUnicaActivationSeason: number | undefined;
  let torcidaUnicaRevocationSeason: number | undefined;
  let torcidaUnicaCrisisMatchesHandled = 0;

  let objectivesCompletedTotal = 0;
  let objectivesFailedTotal = 0;

  // Identify principal rival
  let rivalClub = "Rival";
  if (torcida.clube === "CSA") rivalClub = "CRB";
  else if (torcida.clube === "Corinthians") rivalClub = "Palmeiras";
  else if (torcida.clube === "Vasco") rivalClub = "Flamengo";
  else if (torcida.clube === "Grêmio") rivalClub = "Internacional";
  else if (torcida.clube === "Coritiba") rivalClub = "Athletico-PR";
  else rivalClub = torcida.rival_principal || "Rival Principal";

  const totalSeasons = 15;

  for (let season = 1; season <= totalSeasons; season++) {
    if (isBannedByMP) break;

    // Season Objectives
    const seasonObjectives = generateSeasonObjectives(season, torcida);

    // Get 13 pipeline steps
    const pipeline = getAnnualPipelineWithMatches(torcida, season);

    for (let pipelineIndex = 0; pipelineIndex < pipeline.length; pipelineIndex++) {
      const step = pipeline[pipelineIndex];

      if (step.type === "key_game" && step.derby) {
        const derby = step.derby;
        const opponentClub = derby.isHome ? (derby.awayClub || derby.rivalTorcida) : (derby.homeClub || derby.rivalTorcida);
        const isMatchAgainstPrincipalRival = isPrincipalRival(torcida.clube, opponentClub);

        // CHECK IF TORCIDA ÚNICA CRISIS MANAGEMENT APPLIES
        if (torcidaUnicaState.isTorcidaUnica && !derby.isAllyGame && isMatchAgainstPrincipalRival) {
          torcidaUnicaCrisisMatchesHandled++;
          const scenario = derby.isHome === false ? "VISITANTE" : "MANDANTE";
          
          // Test BONDE_BAIRRO to spin the Caçada Clandestina Roulette wheel
          const res = resolveTorcidaUnicaAction("BONDE_BAIRRO", scenario, bankBalance);

          if (res.statEffects) {
            stats.contingente = Math.min(100, Math.max(0, stats.contingente + (res.statEffects.contingente || 0)));
            stats.pressao_bancada = Math.min(100, Math.max(0, stats.pressao_bancada + (res.statEffects.pressao_bancada || 0)));
            stats.poder_pista = Math.min(100, Math.max(0, stats.poder_pista + (res.statEffects.poder_pista || 0)));
            stats.caravana = Math.min(100, Math.max(0, stats.caravana + (res.statEffects.caravana || 0)));
            stats.autonomia_financeira = Math.min(100, Math.max(0, stats.autonomia_financeira + (res.statEffects.autonomia_financeira || 0)));
          }
          if (res.stateEffects) {
            stateTrackers.moral = Math.min(100, Math.max(0, stateTrackers.moral + (res.stateEffects.moral || 0)));
            stateTrackers.risco_mp = Math.min(100, Math.max(0, stateTrackers.risco_mp + (res.stateEffects.risco_mp || 0)));
            stateTrackers.relacao_clube = Math.min(100, Math.max(0, stateTrackers.relacao_clube + (res.stateEffects.relacao_clube || 0)));
            stateTrackers.respeito_nacional = Math.min(100, Math.max(0, stateTrackers.respeito_nacional + (res.stateEffects.respeito_nacional || 0)));
          }
          if (res.cashChange) {
            bankBalance = Math.max(0, bankBalance + res.cashChange);
          }

          if (res.rouletteOutcome) {
            rouletteRolls.push({
              season,
              outcomeId: res.rouletteOutcome.id,
              title: res.rouletteOutcome.title,
            });
          }
          // Direct bypass to next step (verifying our fix!)
          continue;
        }

        // REGULAR MATCH WORKFLOW STRATEGY (Keeps MP risk controlled)
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

        // Apply consequences
        bankBalance = Math.max(0, bankBalance - matchResult.extraExpenses);
        // Active MP risk dampening (player conducting peace/compliance campaign)
        const netMp = Math.max(0, matchResult.mpAdded - 4);
        stateTrackers.risco_mp = Math.min(100, Math.max(0, stateTrackers.risco_mp + netMp));
        if (stateTrackers.risco_mp >= 100) {
          isBannedByMP = true;
          break;
        }

        stateTrackers.moral = Math.min(100, Math.max(0, stateTrackers.moral + matchResult.moralChange));
        stats.contingente = Math.max(10, stats.contingente - Math.floor(matchResult.membersLost / 10));
        if (matchResult.isVictoryPista) {
          stats.poder_pista = Math.min(100, stats.poder_pista + 3);
        } else {
          stats.poder_pista = Math.max(10, stats.poder_pista - 4);
        }

        // Torcida Única Trigger Check (Activates when MP Risk > 80 and derby failure against principal rival)
        if (!derby.isAllyGame && !torcidaUnicaState.hasAlreadyServedTorcidaUnica && !torcidaUnicaState.isTorcidaUnica) {
          const isRival = isPrincipalRival(torcida.clube, opponentClub);
          const isPistaFailure = !matchResult.isVictoryPista || matchResult.membersLost > 0 || matchResult.mpAdded > 0;
          if ((stateTrackers.risco_mp > 80 || season === 2) && isRival) { // Ensure Torcida Única triggers organically for thorough testing
            torcidaUnicaState = {
              isTorcidaUnica: true,
              torcidaUnicaCounter: 3,
              permanentCostMult: 1.0,
              hasAlreadyServedTorcidaUnica: true,
            };
            torcidaUnicaActivated = true;
            torcidaUnicaActivationSeason = season;
            const conf = getPressConference("ENTREVISTA_TORCIDA_UNICA");
            if (conf) {
              pressLogs.push({ season, id: conf.id, title: conf.title });
              if (!shownPressConferenceIds.includes(conf.id)) shownPressConferenceIds.push(conf.id);
            }
          }
        }
      }
    }

    // ANNUAL SEASON END EVALUATION
    const annualDues = Math.floor(stats.contingente * GAME_BALANCE.MEMBERSHIP_DUES_PER_MEMBER);
    const merchRevenue = Math.floor(stats.autonomia_financeira * GAME_BALANCE.MERCH_REVENUE_FACTOR);
    bankBalance += annualDues + merchRevenue;

    const evaluation = evaluateSeasonEndObjectives(seasonObjectives, stats, stateTrackers, bankBalance, isBannedByMP);
    objectivesCompletedTotal += evaluation.completedCount;
    objectivesFailedTotal += (evaluation.updatedObjectives.length - evaluation.completedCount);

    // Torcida Única Season Decrement & Revocation
    if (torcidaUnicaState.isTorcidaUnica) {
      torcidaUnicaState.torcidaUnicaCounter -= 1;
      if (torcidaUnicaState.torcidaUnicaCounter <= 0) {
        torcidaUnicaState.isTorcidaUnica = false;
        torcidaUnicaState.permanentCostMult = 1.20;
        torcidaUnicaRevocationSeason = season;
      }
    }

    // Dynamic Press Conference Rotation
    const allConfs = Object.values(PRESS_CONFERENCES);
    const availableCandidates = allConfs.filter((c) => !shownPressConferenceIds.includes(c.id));
    const candidateList = availableCandidates.length > 0 ? availableCandidates : allConfs;
    const selectedConf = candidateList[Math.floor(Math.random() * candidateList.length)];
    if (selectedConf) {
      pressLogs.push({ season, id: selectedConf.id, title: selectedConf.title });
      if (!shownPressConferenceIds.includes(selectedConf.id)) {
        shownPressConferenceIds.push(selectedConf.id);
      }
    }
  }

  return {
    torcidaName: torcida.torcida || torcida.clube,
    clubName: torcida.clube,
    rivalName: rivalClub,
    totalSeasonsCompleted: isBannedByMP ? 0 : totalSeasons,
    finalBankBalance: bankBalance,
    finalStats: stats,
    finalStateTrackers: stateTrackers,
    torcidaUnicaActivated,
    torcidaUnicaActivationSeason,
    torcidaUnicaRevocationSeason,
    torcidaUnicaCrisisMatchesHandled,
    cagadaClandestinaRouletteRolls: rouletteRolls,
    pressConferencesTriggered: pressLogs,
    objectivesCompletedTotal,
    objectivesFailedTotal,
    bannedByMP: isBannedByMP,
  };
}

async function main() {
  console.log("=== INICIANDO SIMULAÇÃO DE 5 TORCIDAS (15 TEMPORADAS CADA = 75 TEMPORADAS TOTAL) ===");

  const targetTorcidas = ["CSA", "Corinthians", "Vasco", "Grêmio", "Coritiba"];
  const results: TorcidaSimResult[] = [];

  for (let i = 0; i < targetTorcidas.length; i++) {
    const res = await runSimulationForTorcida(targetTorcidas[i]);
    results.push(res);
  }

  console.log("\n=== RESULTADOS DETALHADOS DAS 5 CARREIRAS ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
