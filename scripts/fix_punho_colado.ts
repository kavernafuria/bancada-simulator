import * as fs from 'fs';
import * as path from 'path';

const teamsPath = path.join(__dirname, '../data/bancada_teams.json');
const teams = JSON.parse(fs.readFileSync(teamsPath, 'utf-8'));

// 1. Os Fanáticos -> INDEPENDENTE (Não faz parte da Aliança Alvinegra)
const fanaticos = teams.find((t: any) => t.clube.includes('Athletico Paranaense') || t.torcida.includes('Fanáticos'));
if (fanaticos) {
  fanaticos.eixo_alianca = 'INDEPENDENTE';
  fanaticos.torcida_aliada = 'Grêmio (Geral do Grêmio)';
  console.log('✔ Atualizado Os Fanáticos para INDEPENDENTE');
}

// 2. Raça Tricolor -> Paulista Jundiaí (PUNHO_COLADO)
const racaTricolor = teams.find((t: any) => t.torcida.includes('Raça Tricolor') || t.clube.includes('Paulista'));
if (racaTricolor) {
  racaTricolor.clube = 'Paulista Jundiaí';
  racaTricolor.torcida = 'Torcida Raça Tricolor';
  racaTricolor.estado = 'SP';
  racaTricolor.eixo_alianca = 'PUNHO_COLADO';
  console.log('✔ Atualizado Raça Tricolor (Paulista Jundiaí) para PUNHO_COLADO');
}

// 3. Falange Tricolor -> Bahia de Feira (PUNHO_COLADO)
let falangeBA = teams.find((t: any) => t.torcida.includes('Falange Tricolor'));
if (!falangeBA) {
  teams.push({
    estado: 'BA',
    clube: 'Bahia de Feira',
    torcida: 'Falange Tricolor',
    tier: 'D',
    contingente: 45,
    pressao_bancada: 60,
    poder_pista: 45,
    caravana: 40,
    autonomia_financeira: 40,
    perfil_predominante: 'Vibração Tricolor Baiana & Eixo PC',
    eixo_alianca: 'PUNHO_COLADO',
    rival_principal: 'Fluminense de Feira (Torcida Uniformizada)',
    rival_secundario: 'Vitória (Os Imbatíveis)',
    torcida_aliada: 'Fluminense (Young Flu)',
    primaryColor: '#dc2626',
    secondaryColor: '#2563eb'
  });
  console.log('✔ Adicionada Falange Tricolor (Bahia de Feira) ao PUNHO_COLADO');
} else {
  falangeBA.eixo_alianca = 'PUNHO_COLADO';
}

// 4. Pavilhão 6 -> Pelotas (PUNHO_COLADO)
let pavilhaosix = teams.find((t: any) => t.torcida.includes('Pavilhão 6') || t.torcida.includes('Pavilhao 6'));
if (!pavilhaosix) {
  teams.push({
    estado: 'RS',
    clube: 'Pelotas',
    torcida: 'Pavilhão 6',
    tier: 'D',
    contingente: 50,
    pressao_bancada: 65,
    poder_pista: 50,
    caravana: 45,
    autonomia_financeira: 45,
    perfil_predominante: 'Cultura Azul e Ouro & Eixo PC',
    eixo_alianca: 'PUNHO_COLADO',
    rival_principal: 'Brasil de Pelotas (Xavante de Pista)',
    rival_secundario: 'Grêmio (Geral do Grêmio)',
    torcida_aliada: 'Fluminense (Young Flu)',
    primaryColor: '#2563eb',
    secondaryColor: '#eab308'
  });
  console.log('✔ Adicionada Pavilhão 6 (Pelotas) ao PUNHO_COLADO');
} else {
  pavilhaosix.eixo_alianca = 'PUNHO_COLADO';
}

// 5. Guarani (Fúria Independente) -> PUNHO_COLADO
const furiaGuarani = teams.find((t: any) => t.clube === 'Guarani' && t.torcida.includes('Fúria'));
if (furiaGuarani) {
  furiaGuarani.eixo_alianca = 'PUNHO_COLADO';
  console.log('✔ Confirmado Fúria Independente (Guarani) no PUNHO_COLADO');
}

// 6. Young Flu & Bravo 52 -> PUNHO_COLADO
teams.forEach((t: any) => {
  if (t.torcida.includes('Young Flu') || t.torcida.includes('Bravo 52') || t.torcida.includes('Fúria Marcilista')) {
    t.eixo_alianca = 'PUNHO_COLADO';
  }
});

fs.writeFileSync(teamsPath, JSON.stringify(teams, null, 2), 'utf-8');
console.log('\n✔ Atualização das Torcidas do Punho Colado concluída com sucesso!');
