import { describe, it, expect } from "vitest";
import { generateSeasonObjectives, evaluateSeasonEndObjectives } from "../lib/bancada_engine";
import { OfficialTorcida, TorcidaStats, StateTrackers } from "../lib/engine/types";

describe("Diversificação de Metas Anuais (Season Objectives)", () => {
  const dummyTorcida: OfficialTorcida = {
    clube: "Flamengo",
    torcida: "Raça Rubro-Negra",
    sigla: "RRN",
    tier: "S",
    contingente: 90,
    pressao_bancada: 85,
    poder_pista: 85,
    caravana: 85,
    autonomia_financeira: 80,
    perfil_predominante: "Massa & Pista",
    eixo_alianca: "PUNHO_CRUZADO",
    rival_principal: "Vasco",
    rival_secundario: "Fluminense",
    torcida_aliada: "Palmeiras (Mancha Verde)",
    primaryColor: "#c00",
    secondaryColor: "#000",
  };

  const dummyStats: TorcidaStats = {
    contingente: 80,
    pressao_bancada: 80,
    poder_pista: 80,
    caravana: 75,
    autonomia_financeira: 70,
  };

  const dummyState: StateTrackers = {
    moral: 80,
    risco_mp: 20,
    relacao_clube: 70,
    respeito_nacional: 75,
  };

  it("deve gerar 3 metas por temporada sem repetição simplista entre os anos 1 a 15", () => {
    const categoriesSeen = new Set<string>();

    for (let season = 1; season <= 15; season++) {
      const objs = generateSeasonObjectives(season, dummyTorcida, "MEIO_TABELA");
      expect(objs.length).toBe(3);

      objs.forEach((o) => {
        expect(o.title).toBeDefined();
        expect(o.description).toBeDefined();
        categoriesSeen.add(o.category);
      });
    }

    // Deve cobrir diversas categorias novas
    expect(categoriesSeen.size).toBeGreaterThanOrEqual(6);
    expect(
      Array.from(categoriesSeen).some(
        (c) =>
          c === "AGASALHO_LOJA" ||
          c === "VARZEA_COMUNIDADE" ||
          c === "CONFRONTO_ESTADO" ||
          c === "PATRIMONIO_BANDEIRAO"
      )
    ).toBe(true);
  });

  it("deve avaliar corretamente os novos tipos de metas", () => {
    const objs = generateSeasonObjectives(1, dummyTorcida, "MEIO_TABELA");
    objs[0].currentValue = objs[0].targetValue; // Força conclusão

    const evalResult = evaluateSeasonEndObjectives(objs, dummyStats, dummyState, 50000, false);
    expect(evalResult.completedCount).toBeGreaterThanOrEqual(1);
  });
});
