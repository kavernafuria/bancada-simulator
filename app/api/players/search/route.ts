import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json([]);
    }

    const players = await prisma.player.findMany({
      where: {
        searchName: {
          contains: query,
        },
      },
      take: 8,
      select: {
        id: true,
        name: true,
        currentTeam: true,
        country: true,
        photo: true,
      },
    });

    const formatted = players.map((p) => ({
      id: String(p.id),
      name: p.name,
      club: p.currentTeam || "Clube Profissional",
      nationality: p.country,
      photoUrl: p.photo && p.photo.startsWith("http") ? p.photo : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erro em /api/players/search:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
