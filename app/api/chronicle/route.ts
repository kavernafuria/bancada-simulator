import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const {
      season,
      torcida,
      clube,
      rivalTorcida,
      rivalClub,
      stadium,
      cityState,
      isHome,
      isAllyGame,
      score,
      isVictoryPista,
      isVictoryBancada,
      tacticTitle,
      policeStance,
      extraCost,
      medical,
      desertion,
      moralChange,
      statusTitle,
      competition,
    } = payload;

    // Rich authentic fallback generator
    if (isAllyGame) {
      const allyText = `No confronto válido pelo ${competition || "campeonato"}, a recepção no estádio ${stadium} (${cityState}) foi uma verdadeira aula de fraternidade entre a ${torcida} e a torcida aliada ${rivalTorcida}. As duas baterias cantaram juntas os 90 minutos em clima de festa e churrasco de aliança na sede social.`;
      return NextResponse.json({ chronicle: allyText });
    }

    const matchTypeStr = isHome ? "atuando em casa no nosso caldeirão como mandante" : "em caravana visitante";
    const outcomeStr = isVictoryPista ? "com domínio total de pista e vitória da nossa torcida" : "em um confronto tenso e adverso na pista";

    const chronicle = `[Ano ${season || 1} - ${competition || "Campeonato"}] No clássico contra o ${rivalClub} (${rivalTorcida}), a ${torcida} esteve presente ${matchTypeStr} no estádio ${stadium}. ${statusTitle || "Confronto de alta tensão"}. O placar no campo foi ${score}. A postura de segurança (${policeStance}) e a escolha tática de ${tacticTitle} determinaram o rumo do dia, ${outcomeStr}. Moral da bancada: ${moralChange >= 0 ? "+" + moralChange : moralChange}. Baixas médicas: ${desertion} feridos.`;

    return NextResponse.json({ chronicle });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
