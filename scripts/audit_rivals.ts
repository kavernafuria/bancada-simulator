import { getOfficialTorcidas, getDerbyForMatch, isPrincipalRival } from '../lib/bancada_engine';

const torcidas = getOfficialTorcidas();
const clubsSeen = new Set<string>();

console.log('=== AUDITORIA DE RIVAIS PRINCIPAIS EM TODOS OS TIMES ===\n');

torcidas.forEach((t) => {
  const club = t.clube;
  if (!club || clubsSeen.has(club)) return;
  clubsSeen.add(club);

  const derby = getDerbyForMatch(t, 1, 'ESTAVEL', 1);
  const rivalClub = derby.isHome ? derby.awayClub : derby.homeClub;
  const targetRival = rivalClub || derby.rivalTorcida;
  const isRivalCheck = isPrincipalRival(club, targetRival);

  console.log(`${club.padEnd(20)} | Torcida: ${(t.torcida || '').padEnd(25)} | Main Rival: ${targetRival.padEnd(22)} | Validated: ${isRivalCheck ? '✅ OK' : '❌ FAIL'}`);
});
