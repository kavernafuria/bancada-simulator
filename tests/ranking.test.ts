import { describe, it, expect } from "vitest";
import {
  calculatePowerScore,
  simulateNationalRanking,
  createCustomTorcidaWithArchetype,
  ARCHETYPES,
} from "@/lib/engine/ranking_engine";
import { TorcidaStats, StateTrackers } from "@/lib/engine/types";

describe("Ranking Engine Unit Tests", () => {
  it("should calculate correct power score based on stats and state trackers", () => {
    const stats: TorcidaStats = {
      contingente: 80,
      pressao_bancada: 75,
      poder_pista: 70,
      caravana: 65,
      autonomia_financeira: 60,
    };
    const state: StateTrackers = {
      moral: 70,
      risco_mp: 10,
      relacao_clube: 50,
      respeito_nacional: 80,
    };

    const power = calculatePowerScore(stats, state);
    expect(power).toBeGreaterThan(500);
    expect(power).toBeTypeOf("number");
  });

  it("should create a custom torcida with archetype and set base relacao_clube to 50", () => {
    const { torcida, stateTrackers } = createCustomTorcidaWithArchetype(
      "Guerreiros da Bancada",
      "GDB",
      "Palmeiras",
      "MASSA_COMBATIVA"
    );

    expect(torcida.torcida).toBe("Guerreiros da Bancada");
    expect(torcida.sigla).toBe("GDB");
    expect(stateTrackers.relacao_clube).toBeGreaterThanOrEqual(50);
  });

  it("should simulate national ranking and include player in sorted list", () => {
    const { torcida, stateTrackers } = createCustomTorcidaWithArchetype(
      "Gaviões de Teste",
      "GVT",
      "Corinthians",
      "TRADICIONAL_BANCADA"
    );
    const stats: TorcidaStats = {
      contingente: 90,
      pressao_bancada: 90,
      poder_pista: 85,
      caravana: 85,
      autonomia_financeira: 85,
    };

    const ranking = simulateNationalRanking(torcida, stats, stateTrackers, 1);
    expect(ranking.length).toBeGreaterThan(10);
    expect(ranking[0].rank).toBe(1);

    const playerEntry = ranking.find((r) => r.isPlayer);
    expect(playerEntry).toBeDefined();
    expect(playerEntry?.torcida).toBe("Gaviões de Teste");
  });
});
