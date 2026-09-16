# Bancada Simulator - Projeto Completo

Este é o código completo do **Bancada Simulator**, pronto para ser executado localmente ou integrado com o seu jogo!

## 🚀 Como Executar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra no navegador em: `http://localhost:3000`

---

## 🎨 Como Vincular as Cores da Torcida e do Time ao Seu Jogo

O simulador foi desenhado para adotar as cores do seu jogo de três maneiras:

### Opção 1: Arquivo de Configuração (`src/config/gameIntegration.ts`)
Abra `src/config/gameIntegration.ts` e personalize:
- `homeTeam.primaryColor`: Cor principal das camisas, bandeiras e fumaça
- `homeTeam.secondaryColor`: Cor das faixas verticais e listras
- `homeTeam.accentColor`: Cor do mosaico e detalhes
- `homeTeam.chants`: Cânticos oficiais da sua torcida

### Opção 2: Parâmetros de URL (iframe ou link direto)
Passe as cores diretamente na URL do seu jogo:
```text
http://seu-dominio/?homeName=MeuTime&homePrimary=%230055ff&homeSecondary=%23ffffff&homeAccent=%23ffcc00&awayName=Rival&awayPrimary=%23ff0033
```

### Opção 3: Comunicação por postMessage (quando rodando em iframe)
Do seu jogo pai:
```javascript
iframe.contentWindow.postMessage({
  type: 'BANCADA_SET_TEAMS',
  homeTeam: {
    name: 'Seu Clube',
    primaryColor: '#0055ff',
    secondaryColor: '#ffffff',
    accentColor: '#ffcc00',
    baseStrength: 82
  },
  awayTeam: {
    name: 'Adversário',
    primaryColor: '#ff0033',
    baseStrength: 76
  }
}, '*');
```

E para receber o resultado do jogo:
```javascript
window.addEventListener('message', (event) => {
  if (event.data?.type === 'BANCADA_MATCH_FINISHED') {
    console.log('Resultado e estatísticas:', event.data.result);
  }
});
```

---
Desenvolvido com React 19, TypeScript, Vite, Tailwind CSS e Web Audio API.
