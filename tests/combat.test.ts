import { describe, it, expect } from "vitest";
import { executeMatchWorkflow, calculateScoutIntel } from "@/lib/engine/combat_engine";
import {
  DerbyMatchInfo,
  TransportChoice,
  PoliceMeetingChoice,
  TacticalBattleChoice,
  TorcidaStats,
  StateTrackers,
} from "@/lib/engine/types";

describe("Combat Engine Unit Tests", () => {
  const mockDerbyAway: DerbyMatchInfo = {
    matchTitle: "DÉRBI FORA DE CASA",
    homeClub: "Corinthians",
    awayClub: "Palmeiras",
    rivalTorcida: "Gaviões da Fiel",
    rivalSigla: "GVI",
    stadium: "Neo Química Arena",
    cityState: "São Paulo - SP",
    derbyName: "Dérbi Paulista",
    isHome: false,
    isLongDistance: false,
    isAllyGame: false,
    importanceDescription: "Jogo decisivo de visitante",
  };

  const mockTransport: TransportChoice = {
    id: "FROTA_ONIBUS",
    name: "Frota de Ônibus",
    description: "Transporte oficial de comitiva",
    costPerMember: 50,
    fixedCost: 2000,
    capacityMultiplier: 1.0,
    pistaBonus: 5,
    mpRisk: 10,
    speed: "MEDIO",
  };

  const mockPolice: PoliceMeetingChoice = {
    id: "ESCOLTA",
    title: "Escolta Oficial",
    stance: "ESCOLTA_TOTAL",
    description: "Alinhamento com a PM",
    cost: 1000,
    mpRiskMod: -5,
    bancadaBonus: 5,
    pistaMod: 0,
    moralMod: 5,
    formattedDeltas: [],
    meetingLog: "Escolta ok",
  };

  const mockTactic: TacticalBattleChoice = {
    id: "SHOW_BANCADA",
    title: "Show de Bancada",
    description: "Mosaico e Bateria",
    pistaMod: 10,
    moralMod: 10,
    mpPenalty: 0,
    costRisk: 1000,
    injuryRisk: 0,
    tacticalLog: "Festa total",
    formattedDeltas: [],
  };

  const stats: TorcidaStats = {
    contingente: 85,
    pressao_bancada: 85,
    poder_pista: 85,
    caravana: 80,
    autonomia_financeira: 80,
  };

  const state: StateTrackers = {
    moral: 75,
    risco_mp: 10,
    relacao_clube: 50,
    respeito_nacional: 70,
  };

  it("should calculate scout intel estimating player and rival forces", () => {
    const intel = calculateScoutIntel(stats, mockTransport, mockDerbyAway, false);
    expect(intel.playerMembersPresent).toBeGreaterThan(1000);
    expect(intel.rivalMembersWaiting).toBeGreaterThan(500);
    expect(intel.twistTitle).toBeDefined();
  });

  it("should format match score correctly as Home x Away for away matches", () => {
    const intel = calculateScoutIntel(stats, mockTransport, mockDerbyAway, false);
    const result = executeMatchWorkflow(
      mockDerbyAway,
      mockPolice,
      mockTransport,
      intel,
      mockTactic,
      stats,
      state
    );

    expect(result.formattedDeltas).toBeDefined();
    const scoreDelta = result.formattedDeltas.find((d) => d.label === "Placar do Jogo");
    expect(scoreDelta).toBeDefined();

    // Verify format is ScoreRival x ScorePlayer for Away game
    const expectedScoreStr = `${result.scoreRivalClub} x ${result.scorePlayerClub}`;
    expect(scoreDelta?.value).toBe(expectedScoreStr);
  });
});
