import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface AudioTrackInfo {
  url: string;
  filename: string;
  title: string;
  fullTitle?: string;
  isTheme: boolean;
}

const AUDIO_EXTENSIONS = [".mp3", ".webm", ".wav", ".ogg", ".m4a"];

interface TrackMetadata {
  title: string;
  fullTitle: string;
}

const KNOWN_TRACKS: Record<string, TrackMetadata> = {
  tema: {
    title: "Tema Oficial",
    fullTitle: "Tema Oficial — Bancada Simulator (Trilha Sonora Oficial) | Música de Torcida Organizada",
  },
  sambatorcida: {
    title: "Pacto Sagrado (Samba Enredo)",
    fullTitle: "Pacto Sagrado - Samba enredo de torcida (Bancada Simulator)",
  },
  reggaedavitoria: {
    title: "Chama na Pedrada (Reggae)",
    fullTitle: "Chama na Pedrada - Reggae (Bancada Simulator)",
  },
  reggae: {
    title: "Positividade e Respeito (Reggae)",
    fullTitle: "Positividade e Respeito - Reggae (Bancada Simulator)",
  },
  funkpaulista: {
    title: "Funk Paulista de Torcida",
    fullTitle: "Funk Paulista de Torcida — Bancada Simulator | Clima de Clássico e Caravana",
  },
  funktorcidas: {
    title: "O Terror Chegou (Funk)",
    fullTitle: "O Terror Chegou - Funk de Torcida Organizada (Bancada Simulator)",
  },
  eletro: {
    title: "Deixa Tremer (Eletro)",
    fullTitle: "Deixa Tremer - Eletro de Arquibancada (Bancada Simulator)",
  },
  rap: {
    title: "Rap de Torcida",
    fullTitle: "Rap de Torcida (Bancada Simulator)",
  },
  rock: {
    title: "Não ao Futebol Moderno! (Rock)",
    fullTitle: "Não ao futebol moderno! Rock de torcida (Bancada Simulator)",
  },
  musicabarra: {
    title: "Barra Brava e Arquibancada",
    fullTitle: "Barra Brava e Arquibancada (Bancada Simulator)",
  },
};

function getTrackMetadata(filename: string): TrackMetadata {
  const nameWithoutExt = path.basename(filename, path.extname(filename)).toLowerCase();

  if (KNOWN_TRACKS[nameWithoutExt]) {
    return KNOWN_TRACKS[nameWithoutExt];
  }

  // Format generic filenames e.g. "faixa_01" -> "Faixa 01"
  const formatted = nameWithoutExt
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    title: formatted,
    fullTitle: formatted,
  };
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
      const meta = getTrackMetadata(file);
      const trackInfo: AudioTrackInfo = {
        url: `/music/${file}`,
        filename: file,
        title: meta.title,
        fullTitle: meta.fullTitle,
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
