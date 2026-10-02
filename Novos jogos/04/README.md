# 🏟️ Bancada Simulator - Fuga do Labirinto & Motor de Partidas

Jogo e simulador tático onde o desempenho da torcida organizada nos bastidores e no estádio influencia diretamente o resultado da partida de futebol.

## ⚙️ Regras do Motor Matemático
- **Média Ponderada da Partida**:
  - **Força Base do Time Mandante**: Peso de **75%**
  - **Desempenho da Torcida (Minigames)**: Peso de **25%**
  - **Força Final Mandante** = `(Força Casa * 0.75) + (Média Torcida * 0.25)`
  - **Força Final Visitante** = `Força Adversário`
- **Probabilidade & Margem de Empate**: Quem tiver maior força final possui vantagem proporcional (com margem de 3 pontos para disputa acirrada e empates).
- **Narrativa em 3 Parágrafos**: Retrata fielmente a dinâmica do cálculo (pressão da torcida, jogos de superação e abafa ou goleadas).

---

## 🎮 Minigame: Fuga do Labirinto (Emboscada)
- **Pelotão da Torcida**: Conduza os torcedores, a bateria com bumbos, o bandeirão e os sinalizadores.
- **Objetivo Principal**: Escapar pelos corredores do estádio até o Portão da Bancada.
- **Objetivo Secundário (Confronto)**: Encontrar o **Bonde Menor Rival (3 pessoas)**, ir pra cima e derrotá-los para ganhar bônus de nota e moral.
- **3 Bondes Maiores Rivais (6 pessoas cada)**: Patrulham as imediações e partem para cima se você se aproximar. Ao derrotar o grupo menor, os 3 maiores entram em **FÚRIA (Rage Mode)**, ficando mais rápidos!
- **2 Viaturas da Polícia**: Patrulham avenidas com faróis e giroflex; se alcançarem seu bonde, ocorre a prisão.

---

## 🚀 Como Executar

### Opção 1: Antigravity / Node.js
1. Descompacte o arquivo ZIP ou importe o repositório no Antigravity / AI Studio.
2. Instale as dependências:
```bash
npm install
```
3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
4. Acesse em `http://localhost:3000`.

### Opção 2: Jogo Direto no Navegador (Standalone)
Você também pode simplesmente abrir o arquivo `public/fuga-do-labirinto.html` diretamente em qualquer navegador para jogar a versão offline completa com sons e canvas!
