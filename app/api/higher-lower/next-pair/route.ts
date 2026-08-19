import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatEuros(val: number): string {
  if (val >= 1_000_000) {
    const millions = val / 1_000_000;
    return `€ ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  } else if (val >= 1_000) {
    const thousands = val / 1_000;
    return `€ ${thousands.toFixed(0)} mil`;
  }
  return `€ ${val}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const excludeParam = searchParams.get("exclude") || "";
    const excludeIds = excludeParam
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    // Filter players with market value > 0 and valid non-placeholder photo URL
    let players = await prisma.player.findMany({
      where: {
        highestMarketValue: { gt: 0 },
        photo: {
          contains: "http",
          not: {
            contains: "header/0",
          },
        },
        ...(excludeIds.length > 0
          ? {
              id: {
                notIn: excludeIds,
              },
            }
          : {}),
      },
      take: 100,
    });

    if (players.length < 2) {
      // Fallback without exclude filter
      players = await prisma.player.findMany({
        where: {
          highestMarketValue: { gt: 0 },
          photo: {
            contains: "http",
          },
        },
        take: 100,
      });
    }

    if (players.length < 2) {
      return NextResponse.json(
        { error: "Insuficientes jogadores para o desafio." },
        { status: 404 }
      );
    }

    // Shuffle and pick 2 distinct players
    const shuffled = players.sort(() => 0.5 - Math.random());
    const left = shuffled[0];
    let right = shuffled[1];

    if (right.highestMarketValue === left.highestMarketValue && shuffled.length > 2) {
      const distinctValPlayer = shuffled.find(
        (p) => p.id !== left.id && p.highestMarketValue !== left.highestMarketValue
      );
      if (distinctValPlayer) {
        right = distinctValPlayer;
      }
    }

    return NextResponse.json({
      metric: "highest_market_value",
      metric_label: "Maior Valor de Mercado",
      player_left: {
        id: left.id,
        name: left.name,
        photo: left.photo && left.photo.startsWith("http") ? left.photo : null,
        country: left.country || "Internacional",
        current_team: left.currentTeam || "Clube Profissional",
        value: left.highestMarketValue,
        formatted_value: formatEuros(left.highestMarketValue),
      },
      player_right: {
        id: right.id,
        name: right.name,
        photo: right.photo && right.photo.startsWith("http") ? right.photo : null,
        country: right.country || "Internacional",
        current_team: right.currentTeam || "Clube Profissional",
        value: right.highestMarketValue,
        formatted_value: formatEuros(right.highestMarketValue),
      },
    });
  } catch (error) {
    console.error("Erro em /api/higher-lower/next-pair:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
