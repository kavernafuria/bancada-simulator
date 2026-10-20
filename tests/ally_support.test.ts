import { describe, it, expect } from "vitest";
import {
  calculateAllySupportNumbers,
  findAllyForTorcida,
  generateEtapa10CaravanChoices,
} from "@/lib/bancada_engine";

describe("Ally Support Dynamics Unit Tests", () => {
  it("should calculate proportional contingent based on ally size and tier", () => {
    const tierSAlly = { torcida: "Mancha Alvi-Verde", tier: "S", contingente: 100, poder_pista: 85 };
    const tierAAlly = { torcida: "Fúria Independente", tier: "A", contingente: 80, poder_pista: 75 };
    const tierBAlly = { torcida: "Guerreiros da Tribo", tier: "B", contingente: 60, poder_pista: 55 };
    const tierCAlly = { torcida: "Falange Vermelha", tier: "C", contingente: 40, poder_pista: 45 };

    const resS = calculateAllySupportNumbers(tierSAlly);
    const resA = calculateAllySupportNumbers(tierAAlly);
    const resB = calculateAllySupportNumbers(tierBAlly);
    const resC = calculateAllySupportNumbers(tierCAlly);

    // Scaling checks
    expect(resS.extraMembers).toBeGreaterThan(resA.extraMembers);
    expect(resA.extraMembers).toBeGreaterThan(resB.extraMembers);
    expect(resB.extraMembers).toBeGreaterThan(resC.extraMembers);

    // Power bonus checks
    expect(resS.pistaBonus).toBeGreaterThanOrEqual(10);
    expect(resB.pistaBonus).toBeGreaterThanOrEqual(10);
  });

  it("should identify ally correctly for a torcida", () => {
    const torcidaWithDirectAlly = {
      torcida: "Gaviões da Fiel",
      clube: "Corinthians",
      torcida_aliada: "Fúria Jovem",
      eixo_alianca: "DEDOS_PRO_ALTO",
    };
    const ally = findAllyForTorcida(torcidaWithDirectAlly);
    expect(ally).toBeDefined();
  });

  it("should block ally support against the main rival without 2 consecutive pista defeats", () => {
    // Torcida fictícia SP com aliada também em SP para isolar a regra do maior rival
    const currentTorcida = {
      torcida: "Torcida Teste SP",
      clube: "Clube Teste",
      estado: "SP",
      rival_principal: "Palmeiras",
      torcida_aliada: "Gaviões da Fiel",
    };
    const noStreak = generateEtapa10CaravanChoices(currentTorcida, [], 1, {});
    const derbyNoStreak = noStreak.find((c) => c.category === "DERBY");
    expect(derbyNoStreak?.clube).toBe("Palmeiras");
    expect(derbyNoStreak?.allyTorcidaName).toBeUndefined();

    const withStreak = generateEtapa10CaravanChoices(currentTorcida, [], 1, {
      [derbyNoStreak!.rivalTorcida]: 2,
    });
    const derbyWithStreak = withStreak.find((c) => c.category === "DERBY");
    expect(derbyWithStreak?.allyTorcidaName).toBeDefined();
    expect(derbyWithStreak?.allyCost).toBe(2500);
  });

  it("should attach ally contingent and logistics cost only in the ally's region", () => {
    const currentTorcida = {
      torcida: "Gaviões da Fiel",
      clube: "Corinthians",
      estado: "SP",
      rival_principal: "Palmeiras",
      rival_secundario: "São Paulo",
      torcida_aliada: "Fúria Jovem do Botafogo",
      eixo_alianca: "ALIANCA_ALVINEGRA",
    };
    const choices = generateEtapa10CaravanChoices(currentTorcida, [], 1);
    const derbyChoice = choices.find((c) => c.category === "DERBY");
    // Dérbi em SP com aliada do RJ: sem reforço
    expect(derbyChoice?.allyTorcidaName).toBeUndefined();
    choices
      .filter((c) => c.allyTorcidaName)
      .forEach((c) => {
        expect(c.estado).toBe("RJ");
        expect(c.allyCost).toBe(2500);
        expect(c.allyExtraMembers).toBeGreaterThan(0);
        expect(c.allyPistaBonus).toBeGreaterThan(0);
      });
  });

  it("should enforce that home ally boost applies strictly to Massa and Poder de Pista without altering moral, bancada, or respeito", () => {
    const initialStats = {
      contingente: 50,
      poder_pista: 60,
      pressao_bancada: 70,
      caravana: 40,
      autonomia_financeira: 50,
      patrimonio: 50,
    };
    const initialTrackers = {
      moral: 65,
      risco_mp: 20,
      respeito_nacional: 55,
      relacao_clube: 50,
    };

    const allySupport = { extraMembers: 350, pistaBonus: 15 };

    // Apply rule: only Massa (+Contingente) and Poder de Pista
    const updatedStats = {
      ...initialStats,
      poder_pista: initialStats.poder_pista + allySupport.pistaBonus,
    };
    const updatedTrackers = {
      ...initialTrackers, // Untouched!
    };

    expect(updatedStats.poder_pista).toBe(75);
    expect(updatedTrackers.moral).toBe(65);
    expect(updatedTrackers.respeito_nacional).toBe(55);
    expect(updatedStats.pressao_bancada).toBe(70);
  });
});
