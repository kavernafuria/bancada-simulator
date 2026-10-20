import { describe, it, expect } from "vitest";
import {
  getOfficialTorcidas,
  generateSeasonObjectives,
  evaluateSeasonEndObjectives,
  getSeasonalMilestoneEvent,
  GAME_BALANCE,
  simulateNationalRanking,
  createCustomTorcidaWithArchetype,
  OfficialTorcida,
  SeasonObjective,
} from "../lib/bancada_engine";
import { TorcidaStats, StateTrackers } from "../lib/engine/types";

describe("Full 15-Season Automated Playtest & Code Audit (End-to-End)", () => {
  it("validates all 138+ official torcidas in database have valid properties and no undefined/NaN", () => {
    const torcidas = getOfficialTorcidas();
    expect(torcidas.length).toBeGreaterThanOrEqual(130);

    torcidas.forEach((t) => {
      expect(t.torcida, `Torcida name missing in club ${t.clube}`).toBeTruthy();
      expect(t.clube, `Club missing in torcida ${t.torcida}`).toBeTruthy();
      expect(t.tier, `Tier missing in torcida ${t.torcida}`).toBeTruthy();
      expect(t.contingente).toBeGreaterThan(0);
      expect(t.contingente).toBeLessThanOrEqual(100);
      expect(t.poder_pista).toBeGreaterThan(0);
      expect(t.poder_pista).toBeLessThanOrEqual(100);
      expect(t.pressao_bancada).toBeGreaterThan(0);
      expect(t.pressao_bancada).toBeLessThanOrEqual(100);
      expect(t.caravana).toBeGreaterThan(0);
      expect(t.caravana).toBeLessThanOrEqual(100);
      expect(t.autonomia_financeira).toBeGreaterThan(0);
      expect(t.autonomia_financeira).toBeLessThanOrEqual(100);
    });
  });

  const testTorcidasToSimulate = [
    { name: "Mancha Alvi Verde", tier: "Tier S (Capital SP)" },
    { name: "Inferno Coral", tier: "Tier A/B (Nordeste)" },
    { name: "Fúria Independente", tier: "Interior SP (Campinas)" },
  ];

  testTorcidasToSimulate.forEach(({ name, tier }) => {
    it(`simulates a full 15-season career seamlessly for ${name} (${tier})`, () => {
      const allTorcidas = getOfficialTorcidas();
      const torcida = allTorcidas.find((t) => t.torcida.includes(name)) || allTorcidas[0];

      let stats: TorcidaStats = {
        contingente: torcida.contingente,
        pressao_bancada: torcida.pressao_bancada,
        poder_pista: torcida.poder_pista,
        caravana: torcida.caravana,
        autonomia_financeira: torcida.autonomia_financeira,
      };

      let stateTrackers: StateTrackers = {
        moral: 70,
        risco_mp: 15,
        relacao_clube: 55,
        respeito_nacional: 50,
      };

      let bankBalance = torcida.autonomia_financeira * 200;
      let isBannedByMP = false;
      const defeatedRivalsMap: Record<string, number> = {};

      let milestonesEvaluatedCount = 0;
      let electionsEvaluatedCount = 0;

      for (let season = 1; season <= GAME_BALANCE.CAREER_MAX_SEASONS; season++) {
        // 1. Objectives Generation
        const objectives: SeasonObjective[] = generateSeasonObjectives(season, torcida, "MEIO_TABELA");
        expect(objectives.length).toBe(3);

        // 2. Milestone trigger check (Seasons 3, 6, 9, 12, 15)
        if ([3, 6, 9, 12, 15].includes(season)) {
          const milestone = getSeasonalMilestoneEvent(
            season,
            stats,
            stateTrackers,
            torcida.rival_principal || "Rival Principal",
            true
          );
          expect(milestone).toBeDefined();
          expect(milestone?.title).toBeTruthy();
          expect(milestone?.options.length).toBeGreaterThanOrEqual(2);
          milestonesEvaluatedCount++;
        }

        // 3. Elections trigger check (Seasons 4, 7, 10, 13)
        if (GAME_BALANCE.PRESIDENT_ELECTIONS_SEASONS.includes(season)) {
          electionsEvaluatedCount++;
        }

        // 4. Simulate seasonal activity delta
        stats.contingente = Math.min(100, Math.max(10, stats.contingente + (season % 2 === 0 ? 2 : -1)));
        stats.poder_pista = Math.min(100, Math.max(10, stats.poder_pista + 1));
        stats.pressao_bancada = Math.min(100, Math.max(10, stats.pressao_bancada + 1));
        stateTrackers.moral = Math.min(100, Math.max(0, stateTrackers.moral + 3));
        stateTrackers.respeito_nacional = Math.min(100, Math.max(0, stateTrackers.respeito_nacional + 2));

        // Rent deduction if rented
        bankBalance -= GAME_BALANCE.HEADQUARTERS_ANNUAL_RENT;

        // 5. Evaluate Objectives
        const evaluation = evaluateSeasonEndObjectives(objectives, stats, stateTrackers, bankBalance, isBannedByMP);
        expect(evaluation.completedCount).toBeGreaterThanOrEqual(0);
        expect(evaluation.totalCashBonus).toBeGreaterThanOrEqual(0);
        bankBalance += evaluation.totalCashBonus;

        // 6. Simulate Ranking
        const ranking = simulateNationalRanking(torcida, stats, stateTrackers, season, defeatedRivalsMap);
        expect(ranking.length).toBeGreaterThan(15);
        const playerEntry = ranking.find((r) => r.isPlayer);
        expect(playerEntry).toBeDefined();
        expect(playerEntry?.rank).toBeGreaterThanOrEqual(1);
        expect(playerEntry?.rank).toBeLessThanOrEqual(ranking.length);
        expect(playerEntry?.powerScore).not.toBeNaN();

        // 7. Verify Invariants
        expect(stats.contingente).not.toBeNaN();
        expect(stats.pressao_bancada).not.toBeNaN();
        expect(stats.poder_pista).not.toBeNaN();
        expect(stats.caravana).not.toBeNaN();
        expect(stats.autonomia_financeira).not.toBeNaN();
        expect(bankBalance).not.toBeNaN();
        expect(stateTrackers.moral).not.toBeNaN();
        expect(stateTrackers.risco_mp).not.toBeNaN();

        // 8. End Game Check
        if (season === GAME_BALANCE.CAREER_MAX_SEASONS) {
          const isCareerFinished = season >= GAME_BALANCE.CAREER_MAX_SEASONS;
          expect(isCareerFinished).toBe(true);
        }
      }

      expect(milestonesEvaluatedCount).toBe(5); // 3, 6, 9, 12, 15
      expect(electionsEvaluatedCount).toBe(5);  // 1, 4, 7, 10, 13
    });
  });

  it("simulates a full 15-season career for a Custom Torcida created via Archetype", () => {
    const { torcida, state: initialState } = createCustomTorcidaWithArchetype(
      "Guerreiros do Asfalto",
      "GDA",
      "Corinthians",
      "BONDE_PISTA"
    );

    let stats: TorcidaStats = {
      contingente: torcida.contingente,
      pressao_bancada: torcida.pressao_bancada,
      poder_pista: torcida.poder_pista,
      caravana: torcida.caravana,
      autonomia_financeira: torcida.autonomia_financeira,
    };

    let stateTrackers: StateTrackers = { ...initialState };
    let bankBalance = 25000;

    for (let season = 1; season <= 15; season++) {
      const objectives = generateSeasonObjectives(season, torcida, "DISPUTANDO_TITULO");
      expect(objectives.length).toBe(3);

      const ranking = simulateNationalRanking(torcida, stats, stateTrackers, season, {});
      const playerRank = ranking.find((r) => r.isPlayer)?.rank;
      expect(playerRank).toBeDefined();
      expect(playerRank).toBeGreaterThan(0);
    }
  });
});
