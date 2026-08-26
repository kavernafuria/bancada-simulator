# 📖 DOCUMENTAÇÃO TÉCNICA E GDD - BANCADA SIMULATOR (VERSÃO 1.0 - 26/08/2026)

## 📌 INFORMAÇÕES DO RELEASE
- **Versão:** `v1.0.0` / `v1.0-2026-08-26`
- **Data de Lançamento:** 26 de Agosto de 2026
- **Repositório GitHub:** `https://github.com/kavernafuria/bancada-simulator`
- **Tag no GitHub:** `v1.0.0` & `v1.0-2026-08-26`
- **Branch de Release:** `release/v1.0-2026-08-26`
- **Caminho do Backup Local:** `C:\Users\renan.carlos\.gemini\antigravity\scratch\bancada-simulator-backup-v1.0-2026-08-26`

---

## ⚙️ 1. RESUMO DOS SISTEMAS IMPLEMENTADOS NA VERSÃO 1.0

### 🎮 A. 5 Mini-Games Táticos Pró-Jogo (10s com Cronômetro Inteligente & Botão "INICIAR DESAFIO")
1. **🪵 Confronto de Barras de Ferro (`WhackCombat`):**
   - Clicar nos alvos rivais (`👊`) e evitar clicar nos escudos bônus da torcida aliada (`🛡️`).
2. **🥊 Combate de Punhos & Bloqueio (`PunchFrontCombat`):**
   - Pistas de combate com ritmo lento e confortável: Acertar o soco no setor aberto (`💥 SOCO ESQ/CENTRO/DIR`) e acionar o bloqueio (`🛡️ BLOQUEAR`) quando o rival telegrafar ataque pesado.
3. **🚀 Radar Balístico de Morteiros (`RojonTarget`):**
   - Sistema de mira com inércia em 2 etapas: Travar direção horizontal (Eixo X) + Disparar morteiro na elevação (Eixo Y).
4. **🧩 Mosaico de Pares Coloridos da Memória (`MemoryMosaic`):**
   - 10 Placas (5 Pares de cores: 🔴 Vermelho, 🔵 Azul, 🟡 Amarelo, 🟢 Verde, 🟣 Roxo).
   - Prévia de 3 segundos com placas abertas para memorizar e fase de virar e formar os 5 pares.
5. **🚐 Jogo da Van & Flancos (`CaravanDodge`):**
   - Lane runner em 3 pistas conduzindo o comboio da torcida e se desviando de retenções policiais (🚧🚔🛞).

---

### 🏛️ B. Tríade de Decisões Estratégicas a Cada 3 Anos (Anos 3, 6, 9, 12, 15)
- **Marco da 3ª Temporada (Gatilho de Rivalidader Positiva):**
  - Se a sua torcida possuir mais vitórias/faixas tomadas do que derrotas/faixas perdidas no histórico contra o rival principal, a torcida rival elege um **Presidente Linha de Frente violento (+35% PEC permanente para o rival)**.
  - A torcida escolhe entre:
    1. *Reforço de Linha de Frente (Criar Novo Bonde da Periferia).*
    2. *Reforma Interna & Transparência da Diretoria.*
    3. *Acordo Diplomático com o Rival.*

---

### 🤝 C. Regras de Jogos de Amizade (`isAllyGame`)
- Em partidas com torcida aliada, o mini-game de Mosaico (`MemoryMosaic`) é ativado na tática festiva.
- Qualquer outra opção de confraternização passa automaticamente sem mini-game (`modifier = 0.0`), garantindo festa e integração sem violência.

---

### 🏛️ D. Eleições Presidenciais (Triênios 1, 4, 7, 10, 13)
- Seleção dos perfis `Linha de Frente` (+15% PEC, +10% Risco MP), `Gestor Comercial` (+25% Caixa, -10% Moral) e `Mestre de Bateria` (+20% Bancada, -50% Desgaste).

---

### ⚖️ E. Sanções do Ministério Público & Visual Ban
- Trava de Choque Policial e Proibição de Materiais / Visual Ban em clássicos quando o Risco MP ultrapassa 85% no Jogo 4.

---

### 🎲 F. 200+ Eventos Procedurais & Geográficos
- 7 Ações anuais renovadas sem repetição por cálculo PRNG base de temporada.
- Pools exclusivos para torcidas do Interior vs Capital.
