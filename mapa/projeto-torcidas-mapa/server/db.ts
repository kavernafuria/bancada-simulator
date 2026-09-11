import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TORCIDAS_DATABASE, NETWORK_CONNECTIONS } from '../src/data/torcidasData.js';
import { TorcidaNode, NetworkConnection, AllianceBloc, ConnectionType } from '../src/types.js';
import { BLOC_INFO } from '../src/utils/torcidasStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'collaborative_store.json');

export interface CollaborativeStore {
  version: number;
  lastUpdated: string;
  torcidas: TorcidaNode[];
  connections: NetworkConnection[];
}

function ensureDataDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadStore(): CollaborativeStore {
  ensureDataDirectoryExists();
  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.torcidas) && Array.isArray(data.connections)) {
        return data;
      }
    } catch (err) {
      console.warn('Erro ao carregar collaborative_store.json, recriando base inicial:', err);
    }
  }

  // Initial default store
  const defaultStore: CollaborativeStore = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    torcidas: [...TORCIDAS_DATABASE],
    connections: [...NETWORK_CONNECTIONS],
  };

  saveStore(defaultStore);
  return defaultStore;
}

export function saveStore(store: CollaborativeStore): void {
  ensureDataDirectoryExists();
  store.lastUpdated = new Date().toISOString();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export function updateTorcidaBlocInStore(torcidaId: string, newBloc: AllianceBloc): CollaborativeStore {
  const store = loadStore();
  store.torcidas = store.torcidas.map((t) => {
    if (t.id === torcidaId) {
      return {
        ...t,
        bloc: newBloc,
        blocName: BLOC_INFO[newBloc]?.name || t.blocName,
      };
    }
    return t;
  });
  saveStore(store);
  return store;
}

export function addConnectionToStore(
  source: string,
  target: string,
  type: ConnectionType,
  label?: string
): CollaborativeStore {
  const store = loadStore();
  const exists = store.connections.some(
    (c) =>
      ((c.source === source && c.target === target) ||
        (c.source === target && c.target === source)) &&
      c.type === type
  );

  if (!exists) {
    const newConn: NetworkConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      source,
      target,
      type,
      label: label || (type === 'amizade' ? 'União / Irmandade' : 'Rivalidade / Clássico'),
    };
    store.connections.push(newConn);
    saveStore(store);
  }

  return store;
}

export function removeConnectionFromStore(connectionId: string): CollaborativeStore {
  const store = loadStore();
  store.connections = store.connections.filter((c) => c.id !== connectionId);
  saveStore(store);
  return store;
}

export function resetStore(): CollaborativeStore {
  const defaultStore: CollaborativeStore = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    torcidas: [...TORCIDAS_DATABASE],
    connections: [...NETWORK_CONNECTIONS],
  };
  saveStore(defaultStore);
  return defaultStore;
}
