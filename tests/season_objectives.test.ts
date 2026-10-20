import { describe, it, expect } from "vitest";
import { generateSeasonObjectives, evaluateSeasonEndObjectives, generateSeasonNarrativeVerdict, OfficialTorcida } from "../lib/bancada_engine";
import { TorcidaStats, StateTrackers } from "../lib/engine/types";

describe("Diversificação de Metas Anuais (Season Objectives)", () => {
  const dummyTorcida: OfficialTorcida = {
    clube: "Flamengo",
    torcida: "Raça Rubro-Negra",
    sigla: "RRN",
    tier: "S",
    estado: "RJ",
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

describe("Parecer Dinâmico de Fim de Temporada (generateSeasonNarrativeVerdict)", () => {
  const baseSnap = {
    contingente: 70,
    pressao_bancada: 60,
    poder_pista: 70,
    caravana: 65,
    bankBalance: 20000,
    moral: 65,
    risco_mp: 20,
    respeito_nacional: 60,
    rank: 15,
  };

  it("identifica cenário de Risco MP alto com crescimento de Massa (ALERTA_MP)", () => {
    const res = generateSeasonNarrativeVerdict({
      season: 2,
      startSnapshot: baseSnap,
      endSnapshot: {
        ...baseSnap,
        contingente: 85, // +15 massa
        risco_mp: 75,    // alto risco MP
      },
      completedObjectivesCount: 2,
    });

    expect(res.sentiment).toBe("ALERTA_MP");
    expect(res.text.length).toBeGreaterThan(30);
  });

  it("identifica satisfação alta com evolução em Pista e necessidade de melhorar Bancada", () => {
    const res = generateSeasonNarrativeVerdict({
      season: 4,
      startSnapshot: baseSnap,
      endSnapshot: {
        ...baseSnap,
        poder_pista: 88,     // evoluiu muito em pista
        pressao_bancada: 52, // caiu em bancada (<65)
        moral: 85,           // sócios felizes
        rank: 10,
      },
      completedObjectivesCount: 3,
    });

    expect(res.sentiment).toBe("POSITIVO");
    expect(res.text.toLowerCase()).toMatch(/bancada|arquibancada|bateria|canto/);
  });

  it("gera mensagens variadas ao longo de 15 temporadas sem repetição monótona", () => {
    const uniqueTexts = new Set<string>();
    for (let s = 1; s <= 15; s++) {
      const verdict = generateSeasonNarrativeVerdict({
        season: s,
        startSnapshot: baseSnap,
        endSnapshot: {
          ...baseSnap,
          contingente: 70 + (s % 5) * 3,
          poder_pista: 70 + ((s + 2) % 4) * 3,
          pressao_bancada: 60 + ((s + 1) % 3) * 4,
          moral: 55 + (s % 4) * 10,
        },
        completedObjectivesCount: s % 3,
      });
      uniqueTexts.add(verdict.text);
    }

    expect(uniqueTexts.size).toBeGreaterThanOrEqual(10);
  });
});
