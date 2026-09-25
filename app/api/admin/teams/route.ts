import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function isLocalhostRequest(req: Request): boolean {
  const host = req.headers.get("host") || "";
  return (
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("::1") ||
    process.env.NODE_ENV === "development"
  );
}

export async function GET(req: Request) {
  if (!isLocalhostRequest(req)) {
    return NextResponse.json(
      { error: "Acesso Negado. Painel restrito ao ambiente localhost." },
      { status: 403 }
    );
  }

  try {
    const jsonPath = path.join(process.cwd(), "data", "bancada_teams.json");
    const fileData = await fs.readFile(jsonPath, "utf-8");
    const teams = JSON.parse(fileData);

    return NextResponse.json({ teams });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro ao ler dados" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isLocalhostRequest(req)) {
    return NextResponse.json(
      { error: "Acesso Negado. Painel restrito ao ambiente localhost." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { teams } = body;

    if (!Array.isArray(teams)) {
      return NextResponse.json({ error: "Formato de dados inválido" }, { status: 400 });
    }

    const jsonPath = path.join(process.cwd(), "data", "bancada_teams.json");
    await fs.writeFile(jsonPath, JSON.stringify(teams, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: `Salvo com sucesso! ${teams.length} torcidas atualizadas em data/bancada_teams.json.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro ao salvar dados" }, { status: 500 });
  }
}
