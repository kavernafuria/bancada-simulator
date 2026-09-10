import {
  getOfficialTorcidas,
  getAnnualPipelineWithMatches,
  executeCompleteMatch,
  calculateScoutIntel,
  isPrincipalRival,
  resolveTorcidaUnicaAction,
  evaluateSeasonEndObjectives,
  generateSeasonObjectives,
  getPoliceMeetingChoices,
  getTransportOptions,
  getTacticalBattleChoices,
  GAME_BALANCE,
} from '../lib/bancada_engine';
import * as fs from 'fs';
import * as path from 'path';

interface SeasonSnapshot {
  season: number;
  bankBalance: number;
  contingente: number;
  pressao_bancada: number;
  poder_pista: number;
  caravana: number;
  autonomia_financeira: number;
  moral: number;
  risco_mp: number;
  relacao_clube: number;
  respeito_nacional: number;
  matchesPlayed: number;
  derbyVictoriesPista: number;
  derbyLossesPista: number;
  isTorcidaUnica: boolean;
  objectivesCompleted: number;
  objectivesFailed: number;
  eventsLog: string[];
}

interface TorcidaCareerData {
  torcidaName: string;
  clubName: string;
  rivalTorcidaName: string;
  rivalClubName: string;
  tier: string;
  initialStats: Record<string, number>;
  initialTrackers: Record<string, number>;
  seasons: SeasonSnapshot[];
  finalBankBalance: number;
  finalStats: Record<string, number>;
  finalTrackers: Record<string, number>;
  totalObjectivesCompleted: number;
  totalObjectivesFailed: number;
  torcidaUnicaTriggered: boolean;
  torcidaUnicaTriggerSeason?: number;
  torcidaUnicaRevocationSeason?: number;
  bannedByMP: boolean;
  keyHighlights: string[];
}

async function run15SeasonCareer(clubTarget: 'Palmeiras' | 'Corinthians'): Promise<TorcidaCareerData> {
  const officialTorcidas = getOfficialTorcidas();
  const torcida = officialTorcidas.find((t) => t.clube === clubTarget) || officialTorcidas[0];

  const rivalClubName = clubTarget === 'Palmeiras' ? 'Corinthians' : 'Palmeiras';
  const rivalTorcidaName = clubTarget === 'Palmeiras' ? 'Gaviões da Fiel' : 'Mancha Verde';

  let stats = {
    contingente: torcida.contingente || (clubTarget === 'Palmeiras' ? 85 : 90),
    pressao_bancada: torcida.pressao_bancada || (clubTarget === 'Palmeiras' ? 90 : 92),
    poder_pista: torcida.poder_pista || (clubTarget === 'Palmeiras' ? 88 : 85),
    caravana: torcida.caravana || (clubTarget === 'Palmeiras' ? 82 : 85),
    autonomia_financeira: torcida.autonomia_financeira || (clubTarget === 'Palmeiras' ? 88 : 86),
  };

  let stateTrackers = {
    moral: 65,
    risco_mp: 20,
    relacao_clube: 70,
    respeito_nacional: 80,
  };

  const initialStatsCopy = { ...stats };
  const initialTrackersCopy = { ...stateTrackers };

  let bankBalance = 15000; // Tier S capital inicial
  let isBannedByMP = false;

  let torcidaUnicaState = {
    isTorcidaUnica: false,
    torcidaUnicaCounter: 3,
    permanentCostMult: 1.0,
    hasAlreadyServedTorcidaUnica: false,
  };

  let torcidaUnicaTriggered = false;
  let torcidaUnicaTriggerSeason: number | undefined;
  let torcidaUnicaRevocationSeason: number | undefined;

  let totalObjectivesCompleted = 0;
  let totalObjectivesFailed = 0;
  const seasonsHistory: SeasonSnapshot[] = [];
  const keyHighlights: string[] = [];

  for (let season = 1; season <= 15; season++) {
    if (isBannedByMP) break;

    const seasonLog: string[] = [];
    let matchesPlayed = 0;
    let derbyVictoriesPista = 0;
    let derbyLossesPista = 0;

    // Generate season objectives
    const seasonObjectives = generateSeasonObjectives(season, torcida);

    // Get annual pipeline
    const pipeline = getAnnualPipelineWithMatches(torcida, season);

    for (let i = 0; i < pipeline.length; i++) {
      const step = pipeline[i];

      if (step.type === 'key_game' && step.derby) {
        matchesPlayed++;
        const derby = step.derby;

        // Check if under Torcida Única restriction during derby
        if (torcidaUnicaState.isTorcidaUnica && !derby.isAllyGame) {
          const scenario = derby.isHome === false ? 'VISITANTE' : 'MANDANTE';
          const res = resolveTorcidaUnicaAction('BONDE_BAIRRO', scenario, bankBalance);

          if (res.statEffects) {
            stats.contingente = Math.min(100, Math.max(10, stats.contingente + (res.statEffects.contingente || 0)));
            stats.pressao_bancada = Math.min(100, Math.max(10, stats.pressao_bancada + (res.statEffects.pressao_bancada || 0)));
            stats.poder_pista = Math.min(100, Math.max(10, stats.poder_pista + (res.statEffects.poder_pista || 0)));
            stats.caravana = Math.min(100, Math.max(10, stats.caravana + (res.statEffects.caravana || 0)));
            stats.autonomia_financeira = Math.min(100, Math.max(10, stats.autonomia_financeira + (res.statEffects.autonomia_financeira || 0)));
          }
          if (res.stateEffects) {
            stateTrackers.moral = Math.min(100, Math.max(0, stateTrackers.moral + (res.stateEffects.moral || 0)));
            stateTrackers.risco_mp = Math.min(100, Math.max(0, stateTrackers.risco_mp + (res.stateEffects.risco_mp || 0)));
            stateTrackers.relacao_clube = Math.min(100, Math.max(0, stateTrackers.relacao_clube + (res.stateEffects.relacao_clube || 0)));
            stateTrackers.respeito_nacional = Math.min(100, Math.max(0, stateTrackers.respeito_nacional + (res.stateEffects.respeito_nacional || 0)));
          }
          if (res.cashChange) bankBalance = Math.max(0, bankBalance + res.cashChange);

          seasonLog.push(`Derby Paulista sob Torcida Única (${scenario}): Movimentação Clandestina Bairro executada.`);
          continue;
        }

        // Regular derby match execution
        const policeChoices = getPoliceMeetingChoices(derby);
        const police = policeChoices.find((p) => p.stance === 'CONCILIADOR') || policeChoices[0];

        const transportChoices = getTransportOptions(derby);
        const transport = transportChoices.find((t) => t.mpRisk <= 2) || transportChoices[0];

        const intel = calculateScoutIntel(stats, transport, derby, false);

        const tacticalChoices = getTacticalBattleChoices(derby, stats);
        // High-fidelity choice: Mancha Verde favors Front Charge (Avanço 3D), Gaviões favors Bar Combat (Confronto 3D Top-Down)
        const preferredTacticName = clubTarget === 'Palmeiras' ? 'front_charge' : 'punch_combat';
        const tactic = tacticalChoices.find((t) => t.id === preferredTacticName) || tacticalChoices[0];

        const matchResult = executeCompleteMatch(stats, stateTrackers, police, transport, intel, tactic, derby, torcida);

        // Apply match outcome
        bankBalance = Math.max(0, bankBalance - matchResult.extraExpenses);
        const netMp = Math.max(0, matchResult.mpAdded - 4);
        stateTrackers.risco_mp = Math.min(100, Math.max(0, stateTrackers.risco_mp + netMp));

        if (stateTrackers.risco_mp >= 100) {
          isBannedByMP = true;
          seasonLog.push(`CRÍTICO: Banimento definitivo decretado pelo MP na Temporada ${season}!`);
          keyHighlights.push(`Temporada ${season}: Banimento definitivo pelo Ministério Público.`);
          break;
        }

        stateTrackers.moral = Math.min(100, Math.max(0, stateTrackers.moral + matchResult.moralChange));
        if (matchResult.isVictoryPista) {
          derbyVictoriesPista++;
          stats.poder_pista = Math.min(100, stats.poder_pista + 4);
          stats.pressao_bancada = Math.min(100, stats.pressao_bancada + 3);
          stats.contingente = Math.min(100, stats.contingente + 2);
        } else {
          derbyLossesPista++;
          stats.poder_pista = Math.max(10, stats.poder_pista - 2);
        }

        // Check Torcida Única Trigger Condition (Activates in Season 3 due to SP police regulation)
        if (!derby.isAllyGame && !torcidaUnicaState.hasAlreadyServedTorcidaUnica && !torcidaUnicaState.isTorcidaUnica) {
          if (season === 3 || stateTrackers.risco_mp > 75) {
            torcidaUnicaState = {
              isTorcidaUnica: true,
              torcidaUnicaCounter: 3,
              permanentCostMult: 1.0,
              hasAlreadyServedTorcidaUnica: true,
            };
            torcidaUnicaTriggered = true;
            torcidaUnicaTriggerSeason = season;
            seasonLog.push(`ALERTA: Decreto de Torcida Única aplicado pelo MP em SP na Temporada ${season}!`);
            keyHighlights.push(`Temporada ${season}: Decreto de Torcida Única aplicado em São Paulo.`);
          }
        }
      }
    }

    // Annual Dues & Merch Revenues at season end
    const annualDues = Math.floor(stats.contingente * GAME_BALANCE.MEMBERSHIP_DUES_PER_MEMBER * 12);
    const merchRevenue = Math.floor(stats.autonomia_financeira * GAME_BALANCE.MERCH_REVENUE_FACTOR * 1.8);
    bankBalance += annualDues + merchRevenue;

    // Evaluate Objectives
    const evalResult = evaluateSeasonEndObjectives(seasonObjectives, stats, stateTrackers, bankBalance, isBannedByMP);
    totalObjectivesCompleted += evalResult.completedCount;
    totalObjectivesFailed += (evalResult.updatedObjectives.length - evalResult.completedCount);

    // Torcida Única Counter Decay
    if (torcidaUnicaState.isTorcidaUnica) {
      torcidaUnicaState.torcidaUnicaCounter -= 1;
      if (torcidaUnicaState.torcidaUnicaCounter <= 0) {
        torcidaUnicaState.isTorcidaUnica = false;
        torcidaUnicaState.permanentCostMult = 1.15;
        torcidaUnicaRevocationSeason = season;
        seasonLog.push(`REVOGAÇÃO: Fim do decreto de Torcida Única na Temporada ${season}! Retomada da festa nos clássicos.`);
        keyHighlights.push(`Temporada ${season}: Fim da Torcida Única e liberação das caravanas de clássico.`);
      }
    }

    // Record Season Snapshot
    seasonsHistory.push({
      season,
      bankBalance,
      contingente: stats.contingente,
      pressao_bancada: stats.pressao_bancada,
      poder_pista: stats.poder_pista,
      caravana: stats.caravana,
      autonomia_financeira: stats.autonomia_financeira,
      moral: stateTrackers.moral,
      risco_mp: stateTrackers.risco_mp,
      relacao_clube: stateTrackers.relacao_clube,
      respeito_nacional: stateTrackers.respeito_nacional,
      matchesPlayed,
      derbyVictoriesPista,
      derbyLossesPista,
      isTorcidaUnica: torcidaUnicaState.isTorcidaUnica,
      objectivesCompleted: evalResult.completedCount,
      objectivesFailed: evalResult.updatedObjectives.length - evalResult.completedCount,
      eventsLog: seasonLog,
    });
  }

  return {
    torcidaName: torcida.torcida || (clubTarget === 'Palmeiras' ? 'Mancha Verde' : 'Gaviões da Fiel'),
    clubName: torcida.clube,
    rivalTorcidaName,
    rivalClubName,
    tier: 'S',
    initialStats: initialStatsCopy,
    initialTrackers: initialTrackersCopy,
    seasons: seasonsHistory,
    finalBankBalance: bankBalance,
    finalStats: stats,
    finalTrackers: stateTrackers,
    totalObjectivesCompleted,
    totalObjectivesFailed,
    torcidaUnicaTriggered,
    torcidaUnicaTriggerSeason,
    torcidaUnicaRevocationSeason,
    bannedByMP: isBannedByMP,
    keyHighlights,
  };
}

async function main() {
  console.log('=== INICIANDO SIMULAÇÃO DETALHADA DE 15 TEMPORADAS: MANCHA VERDE vs GAVIÕES DA FIEL ===\n');

  console.log('Simulando 15 Temporadas para MANCHA VERDE (Palmeiras)...');
  const manchaData = await run15SeasonCareer('Palmeiras');

  console.log('\nSimulando 15 Temporadas para GAVIÕES DA FIEL (Corinthians)...');
  const gavioesData = await run15SeasonCareer('Corinthians');

  const fullReportData = {
    manchaVerde: manchaData,
    gavioesDaFiel: gavioesData,
  };

  const outputPath = path.join(process.cwd(), 'scratch', 'simulation_15_seasons_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(fullReportData, null, 2), 'utf-8');
  console.log(`\nDados completos salvos em ${outputPath}!`);
}

main().catch(console.error);
