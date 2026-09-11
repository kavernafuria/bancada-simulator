import { TorcidaNode, NetworkConnection, AllianceBloc, ConnectionType } from '../types';
import { loadSavedTorcidas, loadSavedConnections, saveTorcidasToStorage, saveConnectionsToStorage } from './torcidasStorage';

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : '';

const TOKEN_KEY = 'mapa_torcidas_collab_token_v1';

export function getCollaboratorToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveCollaboratorToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage issues
  }
}

export function clearCollaboratorToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore
  }
}

export function isCollaboratorAuthenticated(): boolean {
  return Boolean(getCollaboratorToken());
}

export async function verifyCollaboratorPassword(password: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    if (response.ok && data.success && data.token) {
      saveCollaboratorToken(data.token);
      return { success: true, message: data.message || 'Senha correta!' };
    }
    return { success: false, message: data.message || 'Senha de colaborador incorreta.' };
  } catch (err) {
    // Offline fallback for local development if server isn't running
    if (password === 'Furia@1967') {
      saveCollaboratorToken('collab_session_furia1967_valid');
      return { success: true, message: 'Autenticado offline!' };
    }
    return { success: false, message: 'Não foi possível conectar ao servidor e a senha informada é inválida.' };
  }
}

export async function fetchMapDataOnline(): Promise<{
  torcidas: TorcidaNode[];
  connections: NetworkConnection[];
  isOnline: boolean;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/data`);
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.torcidas) && Array.isArray(data.connections)) {
        return {
          torcidas: data.torcidas,
          connections: data.connections,
          isOnline: true,
        };
      }
    }
  } catch (err) {
    console.log('Servidor backend offline ou inacessível. Usando armazenamento local.');
  }

  return {
    torcidas: loadSavedTorcidas(),
    connections: loadSavedConnections(),
    isOnline: false,
  };
}

export async function updateTorcidaBlocOnline(
  torcidaId: string,
  newBloc: AllianceBloc
): Promise<{ success: boolean; torcidas?: TorcidaNode[] }> {
  const token = getCollaboratorToken();
  if (!token) return { success: false };

  try {
    const response = await fetch(`${API_BASE_URL}/api/torcida/bloc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-collaborator-token': token,
      },
      body: JSON.stringify({ torcidaId, newBloc }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, torcidas: data.store?.torcidas };
    }
  } catch (err) {
    console.warn('Erro ao sincronizar alteração com o servidor online:', err);
  }

  return { success: false };
}

export async function addConnectionOnline(
  source: string,
  target: string,
  type: ConnectionType,
  label?: string
): Promise<{ success: boolean; connections?: NetworkConnection[] }> {
  const token = getCollaboratorToken();
  if (!token) return { success: false };

  try {
    const response = await fetch(`${API_BASE_URL}/api/connection/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-collaborator-token': token,
      },
      body: JSON.stringify({ source, target, type, label }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, connections: data.store?.connections };
    }
  } catch (err) {
    console.warn('Erro ao adicionar conexão no servidor online:', err);
  }

  return { success: false };
}
