# 🎵 Documentação do Sistema de Músicas de Fundo & Trilha Sonora

O **Bancada Simulator** possui um sistema inteligente de trilha sonora em segundo plano com reprodução contínua, detecção dinâmica de faixas, rotação aleatória (shuffle) e pausa automática durante os minigames.

---

## 📁 Onde Colocar os Arquivos de Música

Todos os arquivos de música devem ser salvos na pasta public do projeto:
`D:\elo-perdido\public\music\`

### 🎶 Formatos Suportados:
- `.mp3` *(Recomendado para melhor compatibilidade)*
- `.webm`
- `.wav`
- `.ogg`
- `.m4a`

---

## ⭐️ Regras de Nomenclatura das Faixas

### 1. Música Tema Oficial do Jogo (`tema`)
- **Nome obrigatório do arquivo**: `tema.mp3` *(ou `tema.webm`, `tema.ogg`, `tema.wav`)*.
- **Comportamento**: Esta é a música oficial do jogo. Ela é disparada **automaticamente** assim que o jogador confirma a tela de idade (+18) ou faz a primeira interação no site.

### 2. Outras Músicas da Playlist (Aleatório / Shuffle)
- Qualquer outro arquivo colocado dentro de `public/music/` entra automaticamente na playlist do jogo.
- **Exemplos de nomes aceitos**:
  - `musicabarra.mp3` ou `musicabarra.webm`
  - `funktorcidas.mp3` ou `funktorcidas.webm`
  - `rap.mp3` ou `rap.webm`
  - `reggae.mp3` ou `reggae.webm`
  - `rock.mp3` ou `rock.webm`
  - `sambatorcida.mp3` ou `sambatorcida.webm`
  - `faixa1.mp3`, `faixa2.mp3`, `musica_01.mp3`, etc.

- **Comportamento**: Assim que a música `tema` termina de tocar, o sistema entra em modo de **reprodução aleatória (shuffle)** sem repetir a mesma música em sequência.

---

## 🎮 Comportamento durante os Minigames

- Sempre que o jogador entra em um minigame (ex: *Caldeirão da Arquibancada*, *Rua da Torcida / Bandeirão*, *Bateria*, *3D Runner*, *Pista Brawl*, *Fuga de Emboscada*, etc.), a música de fundo é **pausada automaticamente**.
- Ao concluir ou fechar o minigame, a música de fundo **retoma a reprodução exatamente de onde parou**.

---

## 🎛️ Controles da Trilha Sonora no Cabeçalho

No topo da tela (ao lado da marca Kavers Games), há um reprodutor visual compacto com:
- **Título da Faixa Atual**: Exibe o nome formatado da música que está tocando.
- **Indicador de Disco (Equalizador)**: Gira em tempo real enquanto o som está ativo.
- **Botão Play / Pause (▶️ / ⏸️)**: Permite pausar ou retomar a música manualmente.
- **Botão Avançar (⏭️)**: Pula instantaneamente para a próxima música aleatória da playlist.
- **Controle de Volume / Mudo (🔊 / 🔇)**: Permite ajustar a porcentagem do som (0% a 100%) ou mutar. A preferência do jogador fica salva no navegador (`localStorage`).

---

## ⚡ Detecção Dinâmica via API (`/api/music`)

O jogo conta com a rota de API `/api/music` que varre automaticamente a pasta `public/music/` a cada acesso.
**Você não precisa alterar código!** Basta colar ou remover arquivos da pasta `public/music/` e a playlist será atualizada automaticamente no jogo.
