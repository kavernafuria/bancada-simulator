import { getOfficialTorcidas, getDerbyForMatch } from '../lib/bancada_engine';

const torcidas = getOfficialTorcidas();

console.log("=== CATÁLOGO COMPLETO DE DÉRBIS E CONFRONTOS DE TODAS AS TORCIDAS (BANCADA SIMULATOR) ===\n");

const byState: Record<string, any[]> = {};

torcidas.forEach((t) => {
  const derby = getDerbyForMatch(t, 1, 'ESTAVEL', 1);
  const rivalClub = derby.isHome ? derby.awayClub : derby.homeClub;
  const entry = {
    torcida: t.torcida || t.clube,
    clube: t.clube,
    estado: t.estado,
    rivalClub: rivalClub || derby.rivalTorcida,
    rivalTorcida: derby.rivalTorcida,
    derbyName: derby.derbyName,
  };
  if (!byState[t.estado]) byState[t.estado] = [];
  byState[t.estado].push(entry);
});

Object.keys(byState).sort().forEach((st) => {
  console.log(`\n### 📍 ESTADO: ${st}`);
  byState[st].forEach((item) => {
    console.log(`- **${item.torcida}** (*${item.clube}*) ⚔️ **${item.rivalTorcida}** (*${item.rivalClub}*) — ${item.derbyName}`);
  });
});
