import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import {
  loadStore,
  updateTorcidaBlocInStore,
  addConnectionToStore,
  removeConnectionFromStore,
  resetStore,
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const COLLABORATOR_PASSWORD = process.env.COLLABORATOR_PASSWORD || 'Furia@1967';
const AUTH_TOKEN = 'collab_session_furia1967_valid';

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-collaborator-token, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-collaborator-token'] || req.query.token;
  if (token === AUTH_TOKEN) {
    next();
    return;
  }
  res.status(401).json({ error: 'Acesso não autorizado. Insira a senha de colaborador.' });
}

// Public Endpoint: Read map data
app.get('/api/data', (_req: Request, res: Response) => {
  try {
    const store = loadStore();
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar dados do servidor' });
  }
});

// Auth Endpoint: Verify Collaborator Password
app.post('/api/auth/verify', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === COLLABORATOR_PASSWORD) {
    res.json({
      success: true,
      token: AUTH_TOKEN,
      message: 'Autenticado com sucesso como colaborador!',
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Senha de colaborador incorreta.',
    });
  }
});

// Protected Endpoint: Update Torcida Bloc
app.post('/api/torcida/bloc', requireAuth, (req: Request, res: Response) => {
  const { torcidaId, newBloc } = req.body;
  if (!torcidaId || !newBloc) {
    res.status(400).json({ error: 'Parâmetros torcidaId e newBloc são obrigatórios.' });
    return;
  }

  try {
    const updatedStore = updateTorcidaBlocInStore(torcidaId, newBloc);
    res.json({ success: true, store: updatedStore });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar bloco no servidor.' });
  }
});

// Protected Endpoint: Add Connection
app.post('/api/connection/add', requireAuth, (req: Request, res: Response) => {
  const { source, target, type, label } = req.body;
  if (!source || !target || !type) {
    res.status(400).json({ error: 'Parâmetros source, target e type são obrigatórios.' });
    return;
  }

  try {
    const updatedStore = addConnectionToStore(source, target, type, label);
    res.json({ success: true, store: updatedStore });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar conexão no servidor.' });
  }
});

// Protected Endpoint: Remove Connection
app.post('/api/connection/remove', requireAuth, (req: Request, res: Response) => {
  const { connectionId } = req.body;
  if (!connectionId) {
    res.status(400).json({ error: 'Parâmetro connectionId é obrigatório.' });
    return;
  }

  try {
    const updatedStore = removeConnectionFromStore(connectionId);
    res.json({ success: true, store: updatedStore });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover conexão no servidor.' });
  }
});

// Protected Endpoint: Reset Store
app.post('/api/reset', requireAuth, (_req: Request, res: Response) => {
  try {
    const resetData = resetStore();
    res.json({ success: true, store: resetData });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao resetar dados no servidor.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Colaborativo do Mapa de Torcidas rodando em http://localhost:${PORT}`);
});
