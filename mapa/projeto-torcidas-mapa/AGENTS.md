# Instruções do Projeto para Agentes Antigravity / AI Studio

## Visão Geral da Aplicação
Este projeto é um painel interativo em React 18, TypeScript, Tailwind CSS e Vite que mapeia as maiores torcidas organizadas do futebol brasileiro em um mapa vetorial de alta precisão.

## Arquitetura e Regras de Dados
1. **Base de Torcidas**:
   - `src/data/torcidasData.ts` contém 95 torcidas organizadas cadastradas com atributos: `id`, `name`, `club`, `city`, `uf`, `foundedYear`, `bloc`, `badgeColor`, `badgeBorder`, `mapX`, `mapY`.
   - Todas as conexões (`connections`) referenciam `source` e `target` que correspondem obrigatoriamente a IDs válidos da lista de torcidas.

2. **Geolocalização e Silhueta**:
   - `src/data/brazilMapSilhouette.ts` define a silhueta vetorial do Brasil (`BRAZIL_OUTLINE_PATH`) e os traçados segmentados (`BRAZIL_ICON_STROKE_SEGMENTS`).
   - O objeto `CITY_COORDINATES` calibra a posição SVG das 44 cidades com base territorial precisa, garantindo que todas as torcidas permaneçam estritamente contidas dentro do território nacional em qualquer nível de zoom (1x a 20x).
   - O componente `BrazilMapVector.tsx` mantém uma camada estática de fundo com a silhueta e um canvas SVG interativo com translações e escala dinâmicas.

3. **Estado e Persistência**:
   - Alterações feitas pelo usuário (troca de bloco, adição de novas alianças ou rivalidades) são salvas em `localStorage` através de `src/utils/torcidasStorage.ts`.
   - Sempre preservar a capacidade de redefinir os dados para o padrão inicial (`onResetCustomStorage`).

4. **Padrões de Interface**:
   - Manter a paleta sóbria e moderna em tema dark (`#070b12`, `bg-slate-900`, acentos em ciano, carmesim e dourado).
   - Ícones devem ser exclusivamente importados de `lucide-react`.
   - Evitar quebras de linha em badges ou pills.
