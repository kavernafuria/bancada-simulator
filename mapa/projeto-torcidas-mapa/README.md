# Mapa Interativo de Torcidas Organizadas do Brasil

Aplicação interativa de visualização e exploração geográfica das maiores torcidas organizadas do futebol brasileiro, mapeando conexões de amizades históricas, blocos de alianças (União Dedo pro Alto, União Punho Colado, União Punho Cruzado, etc.), rivalidades regionais e clássicos.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm, pnpm ou yarn

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

### Build de Produção
```bash
npm run build
```

---

## 🧭 Principais Funcionalidades

1. **Silhueta Vetorial Calibrada**:
   - Silhueta do Brasil com contorno suave e traçados segmentados inspirados na identidade visual do mapa.
   - Camada fixa no fundo (`z-0`) para manter a referência visual e espacial enquanto o mapa interativo é manipulado.
2. **Coordenadas Geográficas Precisas**:
   - 95 torcidas organizadas posicionadas em suas cidades e estados de origem através do dicionário calibrado `CITY_COORDINATES`.
   - Dispersão radial automática para cidades com múltiplos clubes (ex: SP, RJ, Porto Alegre, Belo Horizonte).
3. **Rede de Conexões e Alianças**:
   - Arcos visuais para amizades/irmandades (ciano) e rivalidades/clássicos (carmesim).
   - Filtros por blocos nacionais (Dedo pro Alto, Punho Colado, Punho Cruzado), blocos regionais e torcidas neutras/independentes.
   - Filtros por estado (UF) e busca textual instantânea.
4. **Editor de Alianças e Customização Local**:
   - Capacidade de alterar blocos de alianças e adicionar/remover conexões de amizade ou rivalidade.
   - Persistência das alterações via `localStorage` com opção de restauração aos dados originais.
5. **Zoom e Interatividade**:
   - Zoom fluído de 1x a 20x com ancoragem no cursor e suporte a mouse, toque e controles na tela.
   - Rótulos inteligentes com desobstrução e expansão de detalhes conforme a aproximação.

---

## 📁 Estrutura do Projeto

```
├── src/
│   ├── components/
│   │   ├── BrazilMapVector.tsx     # Canvas SVG interativo, silhueta de fundo e renderização de nós/arestas
│   │   ├── Header.tsx              # Barra de ferramentas superior, filtros de blocos, buscas e ações
│   │   ├── TorcidaDrawer.tsx       # Painel lateral com ficha técnica, histórico e conexões da torcida
│   │   ├── TorcidaEditorModal.tsx  # Modal de edição de alianças e amizades da torcida
│   │   ├── LegendBar.tsx           # Barra informativa e legendas de blocos e tipos de laços
│   │   ├── StatsModal.tsx          # Estatísticas agregadas da rede de torcidas
│   │   └── SearchModal.tsx         # Busca rápida por clube, torcida ou cidade
│   ├── data/
│   │   ├── torcidasData.ts         # Base de dados das 95 torcidas e 80 conexões iniciais
│   │   ├── brazilMapSilhouette.ts  # Vetores SVG da silhueta do Brasil e dicionário de coordenadas de cidades
│   │   └── brazilStatesGeo.ts      # Dados e centróides das 27 unidades federativas
│   ├── types.ts                    # Definições de tipos TypeScript (TorcidaNode, NetworkConnection, etc.)
│   ├── utils/
│   │   └── torcidasStorage.ts      # Utilitários de persistência e gerenciamento de blocos
│   ├── App.tsx                     # Orquestrador principal de estado da aplicação
│   ├── main.tsx                    # Ponto de entrada React
│   └── index.css                   # Configurações de estilo global com Tailwind CSS
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide React** (Ícones modernos)
