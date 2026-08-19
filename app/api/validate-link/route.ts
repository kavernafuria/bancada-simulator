import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromPlayerId, toPlayerId } = body;

    if (!fromPlayerId || !toPlayerId) {
      return NextResponse.json(
        { valid: false, message: "Parâmetros 'fromPlayerId' e 'toPlayerId' são obrigatórios." },
        { status: 400 }
      );
    }

    const id1 = parseInt(String(fromPlayerId), 10);
    const id2 = parseInt(String(toPlayerId), 10);

    if (isNaN(id1) || isNaN(id2)) {
      return NextResponse.json(
        { valid: false, message: "IDs de jogador inválidos." },
        { status: 400 }
      );
    }

    const minId = Math.min(id1, id2);
    const maxId = Math.max(id1, id2);

    // Fast indexed query by MIN/MAX ID (< 5ms)
    const result: Array<{ team_name: string; last_year: number; shared_games: number }> =
      await prisma.$queryRaw`
        SELECT team_name, last_year, shared_games 
        FROM connections 
        WHERE player_a_id = ${minId} AND player_b_id = ${maxId}
        LIMIT 1
      `;

    if (!result || result.length === 0) {
      const fromPlayer = await prisma.player.findUnique({ where: { id: id1 } });
      const toPlayer = await prisma.player.findUnique({ where: { id: id2 } });

      const fromName = fromPlayer?.name || "Jogador A";
      const toName = toPlayer?.name || "Jogador B";

      return NextResponse.json({
        valid: false,
        message: `${fromName} e ${toName} não jogaram juntos em nenhuma partida oficial registrada!`,
      });
    }

    const conn = result[0];
    const team = conn.team_name || "Clube Profissional";
    const gamesCount = conn.shared_games || 1;
    const matchInfo = `${team} (${gamesCount} ${gamesCount === 1 ? "jogo" : "jogos"})`;

    return NextResponse.json({
      valid: true,
      connection: {
        id: `${minId}_${maxId}`,
        matchInfo,
        year: conn.last_year,
      },
      message: `Conexão confirmada! Jugaram juntos em: ${matchInfo}`,
    });
  } catch (error) {
    console.error("Erro em /api/validate-link:", error);
    return NextResponse.json(
      { valid: false, message: "Erro ao validar conexão no servidor." },
      { status: 500 }
    );
  }
}
