import * as fs from 'fs';
import * as path from 'path';

const teamsPath = path.join(__dirname, '../data/bancada_teams.json');
const teams = JSON.parse(fs.readFileSync(teamsPath, 'utf-8'));

// 1. Bravo 52 -> INDEPENDENTE (Neutra)
const bravo52 = teams.find((t: any) => t.torcida.includes('Bravo 52'));
if (bravo52) {
  bravo52.eixo_alianca = 'INDEPENDENTE';
  bravo52.torcida_aliada = 'Paraná Clube (Fúria Independente Paraná)';
  console.log('✔ Atualizada Bravo 52 para INDEPENDENTE (Neutra)');
}

// 2. Os Fanáticos -> INDEPENDENTE (Geral do Grêmio é DPA com Império Alviverde, rival do Athletico-PR)
const fanaticos = teams.find((t: any) => t.clube.includes('Athletico Paranaense') || t.torcida.includes('Fanáticos'));
if (fanaticos) {
  fanaticos.eixo_alianca = 'INDEPENDENTE';
  fanaticos.torcida_aliada = 'Vitória (Os Imbatíveis)';
  console.log('✔ Atualizado Os Fanáticos para INDEPENDENTE (Aliada: Os Imbatíveis)');
}

fs.writeFileSync(teamsPath, JSON.stringify(teams, null, 2), 'utf-8');
console.log('✔ Atualização de Bravo 52 e Os Fanáticos concluída!');
