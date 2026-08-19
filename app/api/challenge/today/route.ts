import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // Find the 3 daily challenge rounds for today
    let challengeRecords = await prisma.dailyChallenge.findMany({
      where: { date: todayStr },
      orderBy: { roundNumber: "asc" },
    });

    // Fallback to any latest date if today isn't generated yet
    if (challengeRecords.length === 0) {
      const latest = await prisma.dailyChallenge.findFirst({
        orderBy: { date: "desc" },
      });
      if (latest) {
        challengeRecords = await prisma.dailyChallenge.findMany({
          where: { date: latest.date },
          orderBy: { roundNumber: "asc" },
        });
      }
    }

    if (challengeRecords.length === 0) {
      return NextResponse.json(
        { error: "Nenhum desafio encontrado para hoje." },
        { status: 404 }
      );
    }

    // Collect all player IDs needed
    const playerIds = new Set<number>();
    challengeRecords.forEach((rec) => {
      playerIds.add(rec.startPlayerId);
      playerIds.add(rec.targetPlayerId);
    });

    const players = await prisma.player.findMany({
      where: { id: { in: Array.from(playerIds) } },
    });

    const playerMap = new Map<number, (typeof players)[0]>();
    players.forEach((p) => playerMap.set(p.id, p));

    const rounds = challengeRecords.map((rec) => {
      const startP = playerMap.get(rec.startPlayerId);
      const targetP = playerMap.get(rec.targetPlayerId);

      return {
        round: rec.roundNumber,
        minDegrees: rec.minDegrees,
        startPlayer: {
          id: String(startP?.id || rec.startPlayerId),
          name: startP?.name || "Jogador Inicial",
          club: startP?.currentTeam || "Clube Profissional",
          nationality: startP?.country || "Internacional",
          photoUrl:
            startP?.photo && startP.photo.startsWith("http")
              ? startP.photo
              : null,
        },
        targetPlayer: {
          id: String(targetP?.id || rec.targetPlayerId),
          name: targetP?.name || "Jogador Alvo",
          club: targetP?.currentTeam || "Clube Profissional",
          nationality: targetP?.country || "Internacional",
          photoUrl:
            targetP?.photo && targetP.photo.startsWith("http")
              ? targetP.photo
              : null,
        },
      };
    });

    return NextResponse.json({
      date: challengeRecords[0].date,
      rounds,
    });
  } catch (error) {
    console.error("Erro em /api/challenge/today:", error);
    return NextResponse.json(
      { error: "Erro ao carregar o desafio diário." },
      { status: 500 }
    );
  }
}
