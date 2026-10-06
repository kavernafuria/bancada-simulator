import { describe, it, expect } from "vitest";
import { simulateNationalRanking, getRivalDerbyModifiers } from "../lib/bancada_engine";
import { getPoliceMeetingChoices } from "../lib/engine/combat_engine";
import { OfficialTorcida, TorcidaStats, StateTrackers } from "../lib/engine/types";

describe("Reequilíbrio do Ranking e Jogos de Aliados", () => {
  const dummyTorcida: OfficialTorcida = {
    clube: "Palmeiras",
    torcida: "Mancha Verde",
    sigla: "MV",
    tier: "S",
    contingente: 95,
    pressao_bancada: 90,
    poder_pista: 90,
    caravana: 90,
    autonomia_financeira: 85,
    perfil_predominante: "Linha de Frente",
    eixo_alianca: "PUNHO_COLADO",
    rival_principal: "Corinthians",
    rival_secundario: "São Paulo",
    torcida_aliada: "Vasco da Gama (Força Jovem do Vasco)",
    primaryColor: "#006437",
    secondaryColor: "#ffffff",
  };

  const dummyStats: TorcidaStats = {
    contingente: 70,
    pressao_bancada: 70,
    poder_pista: 70,
    caravana: 65,
    autonomia_financeira: 60,
  };

  const dummyState: StateTrackers = {
    moral: 70,
    risco_mp: 20,
    relacao_clube: 60,
    respeito_nacional: 50,
  };

  it("deve gerar variância e estabilidade dinâmica entre rivais de acordo com dérbis da temporada", () => {
    const modsS1 = getRivalDerbyModifiers(1);
    const modsS2 = getRivalDerbyModifiers(2);

    expect(modsS1).toBeDefined();
    expect(modsS2).toBeDefined();

    expect(modsS1["gaviões da fiel"]).not.toBeUndefined();
    expect(modsS1["mancha verde"]).not.toBeUndefined();
  });

  it("deve penalizar no ranking uma torcida rival que foi derrotada pelo jogador", () => {
    const rankingNormal = simulateNationalRanking(dummyTorcida, dummyStats, dummyState, 3);
    const rankingComDerrota = simulateNationalRanking(dummyTorcida, dummyStats, dummyState, 3, {
      "gaviões da fiel": 45,
    });

    const gavioesNormal = rankingNormal.find((r) => r.torcida.toLowerCase().includes("gaviões"));
    const gavioesDerrotada = rankingComDerrota.find((r) => r.torcida.toLowerCase().includes("gaviões"));

    if (gavioesNormal && gavioesDerrotada) {
      expect(gavioesDerrotada.powerScore).toBeLessThan(gavioesNormal.powerScore);
    }
  });

  it("deve conceder bônus calibrados (moderados) em jogos de aliados", () => {
    const policeChoices = getPoliceMeetingChoices(true, true);
    expect(policeChoices.length).toBe(1);
    expect(policeChoices[0].bancadaBonus).toBeLessThanOrEqual(5);
    expect(policeChoices[0].moralMod).toBeLessThanOrEqual(5);
  });
});
