import { describe, it, expect } from "vitest";
import { generateEtapa10CaravanChoices } from "@/lib/bancada_engine";

describe("Etapa 10 Caravan Engine Unit Tests", () => {
  const currentTorcida = {
    torcida: "Gaviões da Fiel",
    clube: "Corinthians",
    estado: "SP",
    rival_principal: "Palmeiras",
    rival_secundario: "São Paulo",
    torcida_aliada: "Fúria Jovem do Botafogo",
    eixo_alianca: "ALIANCA_ALVINEGRA",
  };

  it("should generate 4 distinct caravan options for Etapa 10", () => {
    const choices = generateEtapa10CaravanChoices(currentTorcida, [], 1);
    expect(choices.length).toBe(4);

    const categories = choices.map((c) => c.category);
    expect(categories).toContain("DERBY");
    expect(categories).toContain("IRMANDADE");
    expect(categories).toContain("INTERIOR");
    expect(categories).toContain("CAPITAL");
  });

  it("should exclude torcidas faced during the current season from the 4 options", () => {
    const facedOpponents = ["Mancha Alvi-Verde", "Torcida Tricolor Indep."];
    const choices = generateEtapa10CaravanChoices(currentTorcida, facedOpponents, 1);

    const selectedTorcidaNames = choices.map((c) => c.rivalTorcida);
    expect(selectedTorcidaNames).not.toContain("Mancha Alvi-Verde");
    expect(selectedTorcidaNames).not.toContain("Torcida Tricolor Indep.");
  });

  it("should NOT attach ally reinforcement to a derby outside the ally's region (Palmeiras/SP vs aliada do RJ)", () => {
    const choices = generateEtapa10CaravanChoices(currentTorcida, [], 1);
    const derbyChoice = choices.find((c) => c.category === "DERBY");
    expect(derbyChoice).toBeDefined();
    if (derbyChoice) {
      expect(derbyChoice.allyTorcidaName).toBeUndefined();
      expect(derbyChoice.allyCost).toBeUndefined();
      const allyImpact = derbyChoice.impacts.find((imp) => imp.label.includes("Reforço Aliado"));
      expect(allyImpact).toBeUndefined();
    }
  });

  it("should only attach ally reinforcement (with cost) to caravans played in the ally's own state", () => {
    const choices = generateEtapa10CaravanChoices(currentTorcida, [], 1);
    choices
      .filter((c) => c.allyTorcidaName)
      .forEach((c) => {
        expect(c.estado).toBe("RJ");
        expect(c.allyExtraMembers).toBeGreaterThan(0);
        expect(c.allyPistaBonus).toBeGreaterThan(0);
        expect(c.allyCost).toBe(2500);
        expect(c.impacts.some((imp) => imp.label.includes("Reforço Aliado"))).toBe(true);
      });
  });
});
