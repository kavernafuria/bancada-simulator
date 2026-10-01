import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface AudioTrackInfo {
  url: string;
  filename: string;
  title: string;
  isTheme: boolean;
}

const AUDIO_EXTENSIONS = [".mp3", ".webm", ".wav", ".ogg", ".m4a"];

function formatTrackTitle(filename: string): string {
  const nameWithoutExt = path.basename(filename, path.extname(filename));

  const knownTitles: Record<string, string> = {
    tema: "Tema Oficial do Jogo",
    musicabarra: "Música de Barra & Arquibancada",
    funktorcidas: "Funk das Torcidas Organizadas",
    rap: "Rap da Torcida",
    reggae: "Reggae da Arquibancada",
    rock: "Rock de Pista & Galera",
    sambatorcida: "Samba de Torcida",
  };

  if (knownTitles[nameWithoutExt.toLowerCase()]) {
    return knownTitles[nameWithoutExt.toLowerCase()];
  }

  // Format generic filenames e.g. "faixa_01" -> "Faixa 01"
  return nameWithoutExt
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), "public", "music");

    if (!fs.existsSync(musicDir)) {
      return NextResponse.json({
        themeTrack: null,
        tracks: [],
      });
    }

    const files = fs.readdirSync(musicDir);

    const audioFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return AUDIO_EXTENSIONS.includes(ext);
    });

    let themeTrack: AudioTrackInfo | null = null;
    const tracks: AudioTrackInfo[] = [];

    audioFiles.forEach((file) => {
      const nameWithoutExt = path.basename(file, path.extname(file)).toLowerCase();
      const trackInfo: AudioTrackInfo = {
        url: `/music/${file}`,
        filename: file,
        title: formatTrackTitle(file),
        isTheme: nameWithoutExt === "tema",
      };

      if (nameWithoutExt === "tema") {
        themeTrack = trackInfo;
      } else {
        tracks.push(trackInfo);
      }
    });

    return NextResponse.json({
      themeTrack,
      tracks,
    });
  } catch (error) {
    console.error("Error loading music tracks:", error);
    return NextResponse.json(
      { themeTrack: null, tracks: [] },
      { status: 500 }
    );
  }
}
