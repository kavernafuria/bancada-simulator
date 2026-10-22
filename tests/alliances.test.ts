import { describe, it, expect } from "vitest";
import {
  getOfficialTorcidas,
  getAllianceBlockForTorcida,
  findAllyForTorcida,
  areTorcidasRivals,
  isValidFriendFor,
  generateEtapa10CaravanChoices,
  resolveTorcidaRivalries,
} from "@/lib/bancada_engine";

const all = getOfficialTorcidas();
const byName = (n: string) => all.find((t) => t.torcida === n)!;

describe("Amizades x Rivalidades (Esquadrão Alvinegro / ABC)", () => {
  const esquadrao = byName("Esquadrão Alvinegro");
  const comandoAzul = byName("Comando Azul");
  const guerreiros = byName("Guerreiros do Tigre");

  it("reconhece rivalidade no formato 'Clube (Torcida)' em qualquer direção", () => {
    expect(areTorcidasRivals(esquadrao, comandoAzul)).toBe(true);
    expect(areTorcidasRivals(esquadrao, guerreiros)).toBe(true);
    expect(areTorcidasRivals(guerreiros, esquadrao)).toBe(true);
    expect(isValidFriendFor(esquadrao, comandoAzul)).toBe(false);
  });

  it("independente não lista outras independentes (nem rivais) como irmãs", () => {
    const block = getAllianceBlockForTorcida(esquadrao)!;
    expect(block.isIndependent).toBe(true);
    expect(block.members).toEqual([]);
    expect(block.directAlly).toBeNull();
    expect(block.declaredRivals).toContain("Guerreiros do Tigre");
    expect(block.declaredRivals).toContain("Comando Azul");
  });

  it("torcida com pista hostil nunca vira amiga, mesmo sendo do mesmo eixo", () => {
    const gladiadores = byName("Gladiadores"); // PUNHO_SEGURO, mesmo bloco dos Guerreiros do Tigre
    const blockOk = getAllianceBlockForTorcida(guerreiros)!;
    expect(blockOk.members).toContain("Gladiadores");
    const blockHostile = getAllianceBlockForTorcida(guerreiros, [gladiadores.torcida])!;
    expect(blockHostile.members).not.toContain("Gladiadores");
  });

  it("independente sem aliada e sem pacto não recebe aliada fantasma", () => {
    expect(findAllyForTorcida(esquadrao)).toBeNull();
    const pacted = findAllyForTorcida(esquadrao, [], ["Fúria Jovem do Botafogo"]);
    expect(pacted?.torcida).toBe("Fúria Jovem do Botafogo");
    expect(findAllyForTorcida(esquadrao, [], ["Comando Azul"])).toBeNull();
  });

  it("Caravana da Irmandade da Etapa 10 nunca é rival nem torcida com pista", () => {
    const choices = generateEtapa10CaravanChoices(esquadrao, [], 50, {}, ["Torcida Jovem do Fla"]);
    const irmandade = choices.find((c) => c.category === "IRMANDADE")!;
    expect(irmandade).toBeDefined();
    expect(areTorcidasRivals(esquadrao, irmandade.teamData)).toBe(false);
    expect(irmandade.clube).not.toBe(esquadrao.clube);
    expect(irmandade.rivalTorcida).not.toBe("Torcida Jovem do Fla");
  });

  it("dérbi da Etapa 10 usa o rival principal real (formato 'Clube (Torcida)')", () => {
    const choices = generateEtapa10CaravanChoices(esquadrao, [], 50);
    const derby = choices.find((c) => c.category === "DERBY")!;
    expect(derby.rivalTorcida).toBe("Guerreiros do Tigre");
  });

  it("resolveTorcidaRivalries não trata independentes como aliadas entre si", () => {
    const res = resolveTorcidaRivalries(esquadrao);
    expect(res.allies).toEqual([]);
    if (res.allyTorcida) expect(areTorcidasRivals(esquadrao, res.allyTorcida)).toBe(false);
  });
});
