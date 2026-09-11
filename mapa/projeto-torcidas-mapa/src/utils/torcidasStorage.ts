import { TorcidaNode, NetworkConnection, AllianceBloc, ConnectionType } from '../types';
import { TORCIDAS_DATABASE, NETWORK_CONNECTIONS } from '../data/torcidasData';

const TORCIDAS_STORAGE_KEY = 'mapa_torcidas_data_v2';
const CONNECTIONS_STORAGE_KEY = 'mapa_torcidas_connections_v2';

export const BLOC_INFO: Record<
  AllianceBloc,
  {
    name: string;
    shortName: string;
    emoji: string;
    color: string;
    badgeClass: string;
    description: string;
    category: string;
  }
> = {
  punho_cruzado: {
    name: 'União Punho Cruzado',
    shortName: 'Punho Cruzado',
    emoji: '🙅‍♂️',
    color: '#3b82f6',
    badgeClass: 'bg-blue-950/90 text-blue-300 border-blue-500/50',
    description: 'Irmandade de estrada, churrasco unificado na sede e apoio mútuo em comboios interestaduais.',
    category: 'Eixo Nacional',
  },
  dedo_pro_alto: {
    name: 'União Dedo pro Alto',
    shortName: 'Dedo pro Alto',
    emoji: '👆',
    color: '#10b981',
    badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
    description: 'União massiva alviverde e alvinegra, mosaicos gigantes e recepção conjunta nas rodovias.',
    category: 'Eixo Nacional',
  },
  punho_colado: {
    name: 'União Punho Colado',
    shortName: 'Punho Colado',
    emoji: '👊',
    color: '#a855f7',
    badgeClass: 'bg-purple-950/90 text-purple-300 border-purple-500/50',
    description: 'Aliança tradicional tricolor e litorânea, defesa conjunta de setores e comitivas.',
    category: 'Eixo Nacional',
  },
  alianca_alvinegra: {
    name: 'Aliança Alvinegra',
    shortName: 'Aliança Alvinegra',
    emoji: '🦅',
    color: '#cbd5e1',
    badgeClass: 'bg-slate-800/90 text-slate-200 border-slate-400/50',
    description: 'União alvinegra entre a Capital Paulista e o Rio de Janeiro com bateria e recepção nas sedes.',
    category: 'Eixo Nacional',
  },
  nordeste_lado_a: {
    name: 'Nordeste Lado A',
    shortName: 'Nordeste Lado A',
    emoji: '☀️',
    color: '#f59e0b',
    badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
    description: 'Pacto de cooperação regional entre forças de Fortaleza, Natal, Maceió e Aracaju.',
    category: 'Geopolítica Nordeste & Norte',
  },
  nordeste_lado_b: {
    name: 'Nordeste Lado B',
    shortName: 'Nordeste Lado B',
    emoji: '⚡',
    color: '#ec4899',
    badgeClass: 'bg-pink-950/90 text-pink-300 border-pink-500/50',
    description: 'Eixo de resistência e aliança cruzando AL, CE, PA, MA e PB.',
    category: 'Geopolítica Nordeste & Norte',
  },
  sp_familia_interior: {
    name: 'Família Interior (Bloco 1 SP)',
    shortName: 'Família Interior',
    emoji: '🏢',
    color: '#06b6d4',
    badgeClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50',
    description: 'Leões da Fabulosa, Fúria Andreense, Dragões Alvi Azul, Sangue Rubro, Força Rubro Verde e Malucos do Tigre.',
    category: 'Interior de SP & ABC',
  },
  sp_punho_seguro: {
    name: 'União Punho Seguro (Bloco 2 SP)',
    shortName: 'Punho Seguro',
    emoji: '🛡️',
    color: '#14b8a6',
    badgeClass: 'bg-teal-950/90 text-teal-300 border-teal-500/50',
    description: 'Gladiadores, Guerreiros do Tigre, Esquadrão XV, Sangue Barbarense e Torcida Interror.',
    category: 'Interior de SP & ABC',
  },
  sp_irmandade: {
    name: 'Irmandade (Bloco 3 SP)',
    shortName: 'Irmandade SP',
    emoji: '🤝',
    color: '#8b5cf6',
    badgeClass: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/50',
    description: 'Torcida Jovem Ponte, Torcida Mancha Azul, Mancha Alvinegra Comercial RP e Torcida Afeganistão.',
    category: 'Interior de SP & ABC',
  },
  regional_historica: {
    name: 'Rede Regional & Histórica',
    shortName: 'Redes Históricas',
    emoji: '🏛️',
    color: '#64748b',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-600/50',
    description: 'Torcidas e barras bravas com laços regionais e autônomos.',
    category: 'Outras Relações',
  },
  independente: {
    name: 'Tradicional Independente',
    shortName: 'Independente',
    emoji: '⭐',
    color: '#475569',
    badgeClass: 'bg-slate-900 text-slate-400 border-slate-700/50',
    description: 'Torcidas que preservam postura autônoma de arquibancada.',
    category: 'Outras Relações',
  },
};

export function loadSavedTorcidas(): TorcidaNode[] {
  try {
    const saved = localStorage.getItem(TORCIDAS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar torcidas customizadas:', err);
  }
  return [...TORCIDAS_DATABASE];
}

export function loadSavedConnections(): NetworkConnection[] {
  try {
    const saved = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar conexões customizadas:', err);
  }
  return [...NETWORK_CONNECTIONS];
}

export function saveTorcidasToStorage(torcidas: TorcidaNode[]): void {
  try {
    localStorage.setItem(TORCIDAS_STORAGE_KEY, JSON.stringify(torcidas));
  } catch (err) {
    console.error('Falha ao salvar torcidas no localStorage:', err);
  }
}

export function saveConnectionsToStorage(connections: NetworkConnection[]): void {
  try {
    localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
  } catch (err) {
    console.error('Falha ao salvar conexões no localStorage:', err);
  }
}

export function clearCustomStorage(): void {
  try {
    localStorage.removeItem(TORCIDAS_STORAGE_KEY);
    localStorage.removeItem(CONNECTIONS_STORAGE_KEY);
  } catch (err) {
    console.error('Falha ao limpar armazenamento:', err);
  }
}

export const resetCustomTorcidasStorage = clearCustomStorage;

export function hasCustomStorage(): boolean {
  try {
    return Boolean(localStorage.getItem(TORCIDAS_STORAGE_KEY) || localStorage.getItem(CONNECTIONS_STORAGE_KEY));
  } catch {
    return false;
  }
}
