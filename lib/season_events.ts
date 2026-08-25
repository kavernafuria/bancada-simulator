import {
  ActionChoice,
  ActionStepEvent,
  ClubStatus,
  DerbyMatchInfo,
  OfficialTorcida,
} from "./bancada_engine";

export interface PipelineStepItem {
  stepIndex: number;
  type: "action" | "key_game";
  title: string;
  category?: string;
  description: string;
  actionEvent?: ActionStepEvent;
  gameNumber?: number;
  derby?: DerbyMatchInfo;
}

export interface EventTemplate {
  category: string;
  title: string;
  contextNarrative: string;
  choices: ActionChoice[];
}

// -------------------------------------------------------------
// EVENT TEMPLATES REPOSITORY (Categorized by Calendar Period)
// -------------------------------------------------------------

// PERIOD 1: INÍCIO DE ANO (Jan - Mar)
const PERIOD_1_EVENTS: EventTemplate[] = [
  {
    category: "CONFECÇÃO & IDENTIDADE VISUAL",
    title: "Lançamento da Coleção Oficial de Fardamento",
    contextNarrative: "A diretoria de patrimônio precisa definir a linha têxtil oficial (regatas, bermudas, agasalhos corta-vento) para abastecer a loja da sede e fardar a massa.",
    choices: [
      {
        id: "FARDAMENTO_PREMIUM",
        text: "Coleção Retrô Pesada Bordada em Algodão Fio 30 (-R$ 14.000)",
        cost: 14000,
        statEffects: { pressao_bancada: 6, autonomia_financeira: 8 },
        stateEffects: { moral: 6, respeito_nacional: 4 },
        log: "Lançou coleção premium retrô com acabamento de alfaiataria, gerando lucro recorde na loja oficial da sede.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Autonomia", value: "+8", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
          { label: "Caixa", value: "-R$ 14.000", isPositive: false },
        ],
      },
      {
        id: "FARDAMENTO_POPULAR",
        text: "Linha Popular em Dry-Fit no Preço de Custo (R$ 0)",
        cost: 0,
        statEffects: { contingente: 8, pressao_bancada: 4 },
        stateEffects: { moral: 5 },
        log: "Lançou regatas populares a preço de custo, padronizando milhares de associados nas arquibancadas.",
        formattedDeltas: [
          { label: "Massa", value: "+8", isPositive: true },
          { label: "Bancada", value: "+4", isPositive: true },
          { label: "Moral", value: "+5", isPositive: true },
        ],
      },
      {
        id: "AGASALHOS_BOMBER",
        text: "Jaquetas Corta-Vento Impermeáveis de Pista (-R$ 18.000)",
        cost: 18000,
        statEffects: { poder_pista: 8, autonomia_financeira: 5 },
        stateEffects: { moral: 8, respeito_nacional: 8 },
        log: "Equipou o bonde de pista com jaquetas pretas pesadas, impondo respeito visual em qualquer território.",
        formattedDeltas: [
          { label: "Pista", value: "+8", isPositive: true },
          { label: "Respeito", value: "+8", isPositive: true },
          { label: "Caixa", value: "-R$ 18.000", isPositive: false },
        ],
      },
      {
        id: "RATEIO_SUBSEDES",
        text: "Descentralizar a Produção para as Subsedes Regionais (R$ 0)",
        cost: 0,
        statEffects: { caravana: 7, contingente: 4 },
        stateEffects: { moral: 3, relacao_clube: 2 },
        log: "Autorizou polos regionais a confeccionarem lotes locais com selo oficial de autenticidade.",
        formattedDeltas: [
          { label: "Caravana", value: "+7", isPositive: true },
          { label: "Contingente", value: "+4", isPositive: true },
        ],
      },
    ],
  },
  {
    category: "CARNAVAL & ESCOLA DE SAMBA DE TORCIDA",
    title: "Temporada de Carnaval & Ensaio Geral da Bateria",
    contextNarrative: "A quadra social vira o epicentro do samba. A bateria nota 10 precisa afinar os surdos e definir os investimentos no desfile de rua ou passarela oficial.",
    choices: [
      {
        id: "MEGA_CARRO_ALEGORICO",
        text: "Investir Pesado em Carro Alegórico de Luxo e Fantasias (-R$ 20.000)",
        cost: 20000,
        statEffects: { pressao_bancada: 10, contingente: 8 },
        stateEffects: { moral: 12, respeito_nacional: 10 },
        log: "Desfile triunfal com nota 10 dos jurados, atraindo milhares de simpatizantes para a quadra.",
        formattedDeltas: [
          { label: "Moral", value: "+12", isPositive: true },
          { label: "Respeito Nacional", value: "+10", isPositive: true },
          { label: "Bancada", value: "+10", isPositive: true },
          { label: "Investimento", value: "-R$ 20.000", isPositive: false },
        ],
      },
      {
        id: "BLOCO_DE_RUA_POPULAR",
        text: "Puxar Megabloco Popular de Rua Arrastando a Massa na Quebrada (R$ 0)",
        cost: 0,
        statEffects: { contingente: 10, pressao_bancada: 5 },
        stateEffects: { moral: 8 },
        log: "Arrastou mais de 25 mil pessoas no bloco de rua da torcida com bandeiras e sinalizadores.",
        formattedDeltas: [
          { label: "Massa", value: "+10", isPositive: true },
          { label: "Bancada", value: "+5", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
        ],
      },
      {
        id: "ABAFADORES_E_SURDOS",
        text: "Renovação Completa dos Instrumentos de Percussão (-R$ 8.000)",
        cost: 8000,
        statEffects: { pressao_bancada: 8, autonomia_financeira: 4 },
        stateEffects: { moral: 6 },
        log: "Novos surdos e repiques cromados garantiram som estrondoso nos ensaios e jogos.",
        formattedDeltas: [
          { label: "Bancada", value: "+8", isPositive: true },
          { label: "Caixa", value: "-R$ 8.000", isPositive: false },
        ],
      },
      {
        id: "CAMAROTE_SEDE_LUCRO",
        text: "Venda de Camarote VIP na Quadra com Open Bar (+R$ 15.000)",
        cost: -15000,
        statEffects: { autonomia_financeira: 8, pressao_bancada: -2 },
        stateEffects: { moral: -2 },
        log: "Lucro altíssimo na quadra vendendo ingressos corporativos, mas gerou murmúrios na velha guarda.",
        formattedDeltas: [
          { label: "Lucro no Caixa", value: "+R$ 15.000", isPositive: true },
          { label: "Autonomia", value: "+8", isPositive: true },
        ],
      },
    ],
  },
  {
    category: "GESTÃO DE QUADRA & QUADRO SOCIAL",
    title: "Campanha de Sócios & Recadastramento de Quadra",
    contextNarrative: "Início do recadastramento anual de associados, emissão de carteirinhas de quadra e arrecadação de anuidades.",
    choices: [
      {
        id: "CADASTRO_BIOMETRICO",
        text: "Sistema Digital de Carteirinha e Catraca Biométrica na Quadra (-R$ 8.000)",
        cost: 8000,
        statEffects: { autonomia_financeira: 10, contingente: 4 },
        stateEffects: { risco_mp: -15, moral: 4 },
        log: "Modernizou o cadastro com biometria facial na quadra, reduzindo atritos de fiscalização com o MP.",
        formattedDeltas: [
          { label: "Autonomia", value: "+10", isPositive: true },
          { label: "Risco MP", value: "-15%", isPositive: true },
          { label: "Caixa", value: "-R$ 8.000", isPositive: false },
        ],
      },
      {
        id: "PLANO_POPULAR_ANUIDADE",
        text: "Campanha 'Sócio da Bancada' com Mensalidade Simbólica (R$ 0)",
        cost: 0,
        statEffects: { contingente: 10, pressao_bancada: 4 },
        stateEffects: { moral: 7 },
        log: "Atraiu 1.500 novos sócios da periferia com anuidade popular acessível a toda a massa.",
        formattedDeltas: [
          { label: "Massa", value: "+10", isPositive: true },
          { label: "Moral", value: "+7", isPositive: true },
        ],
      },
      {
        id: "EXIGENCIA_PRESENCA_REUNIOES",
        text: "Exigência Rígida de Presença em Reuniões de Pista (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 8, contingente: -3 },
        stateEffects: { moral: 5, respeito_nacional: 6 },
        log: "Filtrou o quadro social exigindo disciplina e lealdade nas assembleias de quadra.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+8", isPositive: true },
          { label: "Respeito", value: "+6", isPositive: true },
        ],
      },
      {
        id: "PACOTE_CARAVANA_INCLUSO",
        text: "Combo 'Sócio Viajante' com Desconto Garantido em Ônibus (-R$ 5.000)",
        cost: 5000,
        statEffects: { caravana: 10, autonomia_financeira: 4 },
        stateEffects: { moral: 6 },
        log: "Fidelizou centenas de viajantes garantindo prioridade na compra de assentos para jogos fora.",
        formattedDeltas: [
          { label: "Caravana", value: "+10", isPositive: true },
          { label: "Investimento", value: "-R$ 5.000", isPositive: false },
        ],
      },
    ],
  },
];

// PERIOD 2: INFRAESTRUTURA, PISTA & SEGURANÇA (Abr - Jun)
const PERIOD_2_EVENTS: EventTemplate[] = [
  {
    category: "SEGURANÇA PÚBLICA & ROTAS DE COMBOIO",
    title: "Alinhamento com Batalhão de Choque e Trânsito",
    contextNarrative: "Reunião no batalhão com o comando da PM e órgãos de trânsito para definir escolta e liberação de mastros.",
    choices: [
      {
        id: "ACORDO_ESCOLTA_TOTAL",
        text: "Firmar Pacto Estrito de Escolta em Troca de 100% dos Mastros Liberados (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 8, poder_pista: -3 },
        stateEffects: { risco_mp: -10 },
        log: "Acordo com o Choque garantiu entrada de 40 mastros oficiais com rotas 100% escoltadas.",
        formattedDeltas: [
          { label: "Bancada", value: "+8", isPositive: true },
          { label: "Risco MP", value: "-10%", isPositive: true },
        ],
      },
      {
        id: "ROTAS_INDEPENDENTES",
        text: "Manter Autonomia de Rota sem Assinar Termo de Compromisso Rígido (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 8 },
        stateEffects: { risco_mp: 12, moral: 5 },
        log: "Manteve liberdade tática de comboio pelas ruas, aumentando o respeito da linha de frente.",
        formattedDeltas: [
          { label: "Pista", value: "+8", isPositive: true },
          { label: "Risco MP", value: "+12%", isPositive: false },
        ],
      },
      {
        id: "COMISSAO_SEGURANCA_INTERNA",
        text: "Criar Comissão Própria de Disciplina e Segurança de Quadra (-R$ 3.000)",
        cost: 3000,
        statEffects: { poder_pista: 5, pressao_bancada: 4 },
        stateEffects: { risco_mp: -8, moral: 6 },
        log: "Coletes da disciplina organizaram as catracas evitando tumultos e revistas agressivas.",
        formattedDeltas: [
          { label: "Risco MP", value: "-8%", isPositive: true },
          { label: "Organização", value: "+5", isPositive: true },
        ],
      },
      {
        id: "DENUNCIA_ABUSO_PUBLICO",
        text: "Dossiê Jurídico contra Abusos Policiais nas Catracas (-R$ 2.000)",
        cost: 2000,
        statEffects: { contingente: 4 },
        stateEffects: { moral: 6, respeito_nacional: 6, risco_mp: -5 },
        log: "Denunciou arbitrariedades com apoio de órgãos de direitos humanos e juristas da arquibancada.",
        formattedDeltas: [
          { label: "Respeito", value: "+6", isPositive: true },
          { label: "Risco MP", value: "-5%", isPositive: true },
        ],
      },
    ],
  },
  {
    category: "EXPANSÃO TERRITORIAL & SUBSEDES",
    title: "Inauguração de Nova Subsede Regional",
    contextNarrative: "Bonde de sócios do interior/litoral solicita oficialização de uma nova subsede com faixa oficial e ponto de concentração.",
    choices: [
      {
        id: "COMPRA_IMOVEL_SUBSEDE",
        text: "Financiar Sede Própria na Cidade Regional com Bar e Loja (-R$ 15.000)",
        cost: 15000,
        statEffects: { caravana: 12, autonomia_financeira: 8, contingente: 6 },
        stateEffects: { respeito_nacional: 8, moral: 8 },
        log: "Inaugurou subsede imponente com quadra de futebol society e loja oficial no interior.",
        formattedDeltas: [
          { label: "Caravana", value: "+12", isPositive: true },
          { label: "Autonomia", value: "+8", isPositive: true },
          { label: "Massa", value: "+6", isPositive: true },
          { label: "Caixa", value: "-R$ 15.000", isPositive: false },
        ],
      },
      {
        id: "APROVACAO_POLO_AUTONOMO",
        text: "Homologar a Subsede com Gestão 100% Autônoma pelos Moradores (R$ 0)",
        cost: 0,
        statEffects: { caravana: 8, contingente: 6 },
        stateEffects: { moral: 6 },
        log: "Oficializou nova faixa regional, garantindo pelo menos 3 ônibus lotados por jogo grande.",
        formattedDeltas: [
          { label: "Caravana", value: "+8", isPositive: true },
          { label: "Massa", value: "+6", isPositive: true },
        ],
      },
      {
        id: "TREINO_LINHA_FRENTE_REGIONAL",
        text: "Enviar Oficiais de Pista para Treinar a Linha de Frente Regional (-R$ 4.000)",
        cost: 4000,
        statEffects: { poder_pista: 8, caravana: 5 },
        stateEffects: { moral: 5, respeito_nacional: 6 },
        log: "Blindou o trajeto rodoviário integrando a tropa do interior aos protocolos da capital.",
        formattedDeltas: [
          { label: "Pista", value: "+8", isPositive: true },
          { label: "Caravana", value: "+5", isPositive: true },
        ],
      },
      {
        id: "LIMITAR_EXPANSAO",
        text: "Manter Concentração Exclusiva na Capital e Centralizar Recursos (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 6, caravana: -3 },
        stateEffects: { moral: 2 },
        log: "Focou 100% do contingente nos setores centrais do estádio da capital.",
        formattedDeltas: [
          { label: "Bancada Local", value: "+6", isPositive: true },
          { label: "Caravana", value: "-3", isPositive: false },
        ],
      },
    ],
  },
  {
    category: "PREPARAÇÃO MARCIAL & ACADEMIA",
    title: "Estruturação da Academia de Lutas na Sede",
    contextNarrative: "Para garantir que os bondes mantenham disciplina e condicionamento, a diretoria debate a criação de um centro de treinamento de artes marciais na sede.",
    choices: [
      {
        id: "TATAME_COMPLETO_BOXE",
        text: "Montagem de Octógono, Ringue de Boxe e Tatame de Jiu-Jitsu (-R$ 12.000)",
        cost: 12000,
        statEffects: { poder_pista: 12, contingente: 4 },
        stateEffects: { moral: 9, respeito_nacional: 10 },
        log: "Formou atletas de elite e disciplinou a linha de frente sob comando de mestres faixas-pretas.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+12", isPositive: true },
          { label: "Respeito", value: "+10", isPositive: true },
          { label: "Caixa", value: "-R$ 12.000", isPositive: false },
        ],
      },
      {
        id: "TREINO_FUNCIONAL_GRATUITO",
        text: "Treinamento Funcional e Calistenia Gratuito para Toda a Massa (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 6, contingente: 6 },
        stateEffects: { moral: 7 },
        log: "Centenas de jovens da comunidade aderiram aos treinos diários na quadra.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+6", isPositive: true },
          { label: "Massa", value: "+6", isPositive: true },
        ],
      },
      {
        id: "CONVITE_ATLETAS_EXTERNOS",
        text: "Contratar Lutadores Profissionais para Seminários de Defesa Pessoal (-R$ 5.000)",
        cost: 5000,
        statEffects: { poder_pista: 8 },
        stateEffects: { moral: 5, respeito_nacional: 6 },
        log: "Seminário intensivo aprimorou o posicionamento tático de contenção da tropa de choque.",
        formattedDeltas: [
          { label: "Pista", value: "+8", isPositive: true },
          { label: "Respeito", value: "+6", isPositive: true },
        ],
      },
      {
        id: "FOCO_TOTAL_FESTA",
        text: "Rejeitar Foco Marcial e Investir Todo o Espaço em Sala de Troféus (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 6, poder_pista: -4 },
        stateEffects: { risco_mp: -10, moral: 4 },
        log: "Priorizou a vertente cultural e histórica, reduzindo o radar de investigações policiais.",
        formattedDeltas: [
          { label: "Risco MP", value: "-10%", isPositive: true },
          { label: "Bancada", value: "+6", isPositive: true },
        ],
      },
    ],
  },
];

// PERIOD 3: ESPETÁCULO VISUAL & PATRIMÔNIO (Jul - Set)
const PERIOD_3_EVENTS: EventTemplate[] = [
  {
    category: "MOSAICO 3D & PIROTECNIA",
    title: "Espetáculo de Mosaico 3D & Corredor de Fogo",
    contextNarrative: "Aproximação de jogos decisivos exige uma recepção histórica nas arquibancadas com mosaicos de alta complexidade e fumaça oficial.",
    choices: [
      {
        id: "MOSAICO_3D_PLASTIFICADO",
        text: "Mosaico Dupla Face de 50 Mil Placas com Desenho 3D Suspenso (-R$ 16.000)",
        cost: 16000,
        statEffects: { pressao_bancada: 12, contingente: 6 },
        stateEffects: { moral: 12, respeito_nacional: 12 },
        log: "Mosaico monumental repercutiu nos principais jornais esportivos do mundo inteiro.",
        formattedDeltas: [
          { label: "Bancada", value: "+12", isPositive: true },
          { label: "Respeito Mundial", value: "+12", isPositive: true },
          { label: "Moral", value: "+12", isPositive: true },
          { label: "Caixa", value: "-R$ 16.000", isPositive: false },
        ],
      },
      {
        id: "CORREDOR_FOGO_EXTERNO",
        text: "Mega Corredor de Fogo na Avenida com 300 Sinalizadores Marítimos (-R$ 7.000)",
        cost: 7000,
        statEffects: { poder_pista: 8, pressao_bancada: 8 },
        stateEffects: { moral: 10, risco_mp: 6 },
        log: "Avenida transformada em um inferno rubro/alvinegro/tricolor guiando o ônibus até o portão.",
        formattedDeltas: [
          { label: "Bancada", value: "+8", isPositive: true },
          { label: "Moral", value: "+10", isPositive: true },
          { label: "Custo", value: "-R$ 7.000", isPositive: false },
        ],
      },
      {
        id: "FESTA_PAPEL_PICADO_BALOES",
        text: "Chuva de 3 Toneladas de Papel Picado e 40 Mil Balões Metalizados (-R$ 3.500)",
        cost: 3500,
        statEffects: { pressao_bancada: 7, contingente: 5 },
        stateEffects: { moral: 6 },
        log: "Festa visual clássica cobriu o setor com as cores tradicionais sem risco de punição.",
        formattedDeltas: [
          { label: "Bancada", value: "+7", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
        ],
      },
      {
        id: "CANTO_A_CAPELLA_BRUTO",
        text: "Pressão Sonora Pura com Bateria Cadenciada sem Artefatos Visuais (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 6 },
        stateEffects: { moral: 5, risco_mp: -5 },
        log: "Vozes de 40 mil torcedores cantando em uníssono estremeceram a estrutura do estádio.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Risco MP", value: "-5%", isPositive: true },
        ],
      },
    ],
  },
  {
    category: "PATRIMÔNIO & BANDEIRÕES",
    title: "Confecção de Novo Bandeirão Monumental de Setor",
    contextNarrative: "O ateliê de pintura da torcida está pronto para confeccionar a maior bandeira do estado cobrindo todo o anel de arquibancada.",
    choices: [
      {
        id: "BANDEIRAO_GIGANTE_COSTURA",
        text: "Bandeirão de 150 Metros em Tecido Especial Antichamas (-R$ 18.000)",
        cost: 18000,
        statEffects: { pressao_bancada: 12, autonomia_financeira: 4 },
        stateEffects: { moral: 10, respeito_nacional: 10 },
        log: "Desfraldado bandeirão histórico de proporções bíblicas, paralisando a transmissão de TV.",
        formattedDeltas: [
          { label: "Bancada", value: "+12", isPositive: true },
          { label: "Respeito", value: "+10", isPositive: true },
          { label: "Caixa", value: "-R$ 18.000", isPositive: false },
        ],
      },
      {
        id: "RESTAURACAO_TRAPOS_HISTORICOS",
        text: "Restauração Completa dos 50 Trapos Históricos da Década de 80 (-R$ 4.000)",
        cost: 4000,
        statEffects: { pressao_bancada: 7 },
        stateEffects: { moral: 8, respeito_nacional: 8 },
        log: "Resgatou a mística dos tirantes e faixas antigas preservando a raiz ultra da bancada.",
        formattedDeltas: [
          { label: "Respeito Histórico", value: "+8", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
        ],
      },
      {
        id: "MUTIRAO_PINTURA_COMUNITARIO",
        text: "Mutirão Noturno na Quadra com Sócios Pintando Faixas à Mão (R$ 0)",
        cost: 0,
        statEffects: { contingente: 6, pressao_bancada: 5 },
        stateEffects: { moral: 7 },
        log: "Noites em claro na quadra com pizza e cerveja uniram veteranos e novatos na confecção.",
        formattedDeltas: [
          { label: "União / Massa", value: "+6", isPositive: true },
          { label: "Moral", value: "+7", isPositive: true },
        ],
      },
      {
        id: "GUARDA_BLINDADA_MATERIAIS",
        text: "Contratação de Galpão Seguro e Escolta Privada para o Acervo (-R$ 6.000)",
        cost: 6000,
        statEffects: { poder_pista: 6 },
        stateEffects: { risco_mp: -5, respeito_nacional: 6 },
        log: "Blindou o patrimônio de qualquer tentativa de furto ou sabotagem de rivais.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+6", isPositive: true },
          { label: "Segurança", value: "+6", isPositive: true },
        ],
      },
    ],
  },
];

// PERIOD 4: POLÍTICA, CLUBE & RETA DECISIVA (Out - Dez)
const PERIOD_4_EVENTS: EventTemplate[] = [
  {
    category: "POLÍTICA DE CLUBE & COBRANÇA",
    title: "Intervenção Política & Posicionamento no Clube",
    contextNarrative: "Momento decisivo da temporada. A diretoria da torcida é convocada a agir frente aos bastidores políticos do clube e ao desempenho em campo.",
    choices: [
      {
        id: "COBRANCA_OLHO_NO_OLHO",
        text: "Reunião Olho no Olho com a Diretoria e Lideranças do Elenco no CT (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 8 },
        stateEffects: { relacao_clube: -5, moral: 9 },
        log: "Pactuou compromisso de sangue com os jogadores e exigiu entrega total sob pena de cobrança.",
        formattedDeltas: [
          { label: "Bancada", value: "+8", isPositive: true },
          { label: "Moral da Tropa", value: "+9", isPositive: true },
        ],
      },
      {
        id: "TREINO_ABERTO_APOIO_TOTAL",
        text: "Organizar Treino Aberto com 20 Mil Pessoas Incendiando o Estádio (-R$ 5.000)",
        cost: 5000,
        statEffects: { contingente: 8, pressao_bancada: 6 },
        stateEffects: { relacao_clube: 15, moral: 10 },
        log: "Lotou o treino com festa comovente que blindou o elenco antes do jogo decisivo.",
        formattedDeltas: [
          { label: "Relação Clube", value: "+15", isPositive: true },
          { label: "Moral", value: "+10", isPositive: true },
          { label: "Custo", value: "-R$ 5.000", isPositive: false },
        ],
      },
      {
        id: "AERO_TORCIDA_EMBARQUE",
        text: "Aero-Torcida: Bloqueio do Aeroporto com Fumaça e Sinalizadores (-R$ 3.500)",
        cost: 3500,
        statEffects: { caravana: 7, contingente: 6 },
        stateEffects: { moral: 9, respeito_nacional: 8 },
        log: "Milhares fecharam o saguão e empurraram a delegação até a pista de decolagem.",
        formattedDeltas: [
          { label: "Moral", value: "+9", isPositive: true },
          { label: "Caravana", value: "+7", isPositive: true },
        ],
      },
      {
        id: "BOICOTE_E_PROTESTO_PIPOQUEIROS",
        text: "Faixas de Cabeça para Baixo e Chuva de Pipoca na Entrada do Conselho (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: -4 },
        stateEffects: { relacao_clube: -15, respeito_nacional: 8, moral: 4 },
        log: "Protesto impactante desestabilizou cartolas e exigiu renúncia de diretores omissos.",
        formattedDeltas: [
          { label: "Respeito Nacional", value: "+8", isPositive: true },
          { label: "Atrito Clube", value: "-15", isPositive: false },
        ],
      },
    ],
  },
  {
    category: "DIPLOMACIA & EIXO NACIONAL",
    title: "Reunião de Cúpula com as Torcidas Aliadas & Gestão de Crise",
    contextNarrative: "Delegações do eixo interestadual chegam para traçar estratégias. Um atrito entre duas torcidas aliadas exige mediação diplomática da nossa diretoria.",
    choices: [
      {
        id: "CHURRASCO_PACIFICACAO",
        text: "Churrasco de Pacificação na Sede e Selar Trégua no Bloco (-R$ 3.000)",
        cost: 3000,
        statEffects: { poder_pista: 8, caravana: 8 },
        stateEffects: { respeito_nacional: 15, moral: 8 },
        log: "Organizou churrasco de pacificação na quadra social, mediando o conflito e unificando o bloco de alianças.",
        formattedDeltas: [
          { label: "Respeito Nacional", value: "+15", isPositive: true },
          { label: "União do Bloco", value: "Pacto Mantido", isPositive: true },
          { label: "Poder de Pista", value: "+8", isPositive: true },
          { label: "Investimento", value: "-R$ 3.000", isPositive: false },
        ],
      },
      {
        id: "TROCA_DE_BATERIAS_E_MATERIAIS",
        text: "Intercâmbio de Bateria e Faixas Conjuntas nas Caravanas (R$ 0)",
        cost: 0,
        statEffects: { caravana: 6, pressao_bancada: 4 },
        stateEffects: { respeito_nacional: 8, moral: 5 },
        log: "Ritimistas e integrantes reforçaram a bancada aliada em jogos interestaduais.",
        formattedDeltas: [
          { label: "Respeito", value: "+8", isPositive: true },
          { label: "Caravana", value: "+6", isPositive: true },
        ],
      },
      {
        id: "PACTO_DEFENSIVO_RODOVIAS",
        text: "Rede de Inteligência Rodoviária em Tempo Real com Aliados (-R$ 3.000)",
        cost: 3000,
        statEffects: { caravana: 8, poder_pista: 6 },
        stateEffects: { respeito_nacional: 10, risco_mp: -5 },
        log: "Monitoramento por rádio e GPS evitou 4 emboscadas rivais em postos de combustível.",
        formattedDeltas: [
          { label: "Segurança de Caravana", value: "+8", isPositive: true },
          { label: "Respeito", value: "+10", isPositive: true },
        ],
      },
      {
        id: "NEUTRALIDADE_RACHA",
        text: "Manter Neutralidade Absoluta Perante o Racha Diplomático (R$ 0)",
        cost: 0,
        statEffects: { contingente: 4, caravana: -4 },
        stateEffects: { respeito_nacional: -5, moral: 2 },
        log: "Adotou postura neutra no conflito dos aliados, mas perdeu 5 pontos de Respeito Nacional por omissão.",
        formattedDeltas: [
          { label: "Massa Local", value: "+4", isPositive: true },
          { label: "Respeito Nacional", value: "-5", isPositive: false },
        ],
      },
    ],
  },
];

// PERIOD 5: BALANÇO & TRANSIÇÃO (Dezembro)
const PERIOD_5_EVENTS: EventTemplate[] = [
  {
    category: "ASSEMBLEIA GERAL & PRESTAÇÃO DE CONTAS",
    title: "Assembleia Geral de Encerramento & Planejamento",
    contextNarrative: "Assembleia geral de prestação de contas na quadra social com votação dos associados e definição das diretrizes orçamentárias do próximo ano.",
    choices: [
      {
        id: "FUNDO_RESERVA_IMOVEIS",
        text: "Aportar Todo o Superávit no Fundo Imobiliário da Sede Própria (R$ 0)",
        cost: 0,
        statEffects: { autonomia_financeira: 12 },
        stateEffects: { moral: 6, respeito_nacional: 6 },
        log: "Blindou o patrimônio da torcida criando fundo de reserva para ampliação da sede.",
        formattedDeltas: [
          { label: "Autonomia Financeira", value: "+12", isPositive: true },
          { label: "Respeito", value: "+6", isPositive: true },
        ],
      },
      {
        id: "SUBSIDIO_MEGA_CARAVANA",
        text: "Destinar Verba para Subsidiar Passagens de Caravana do Próximo Ano (-R$ 10.000)",
        cost: 10000,
        statEffects: { caravana: 12, contingente: 6 },
        stateEffects: { moral: 10 },
        log: "Garantidas passagens a preço popular para todas as viagens interestaduais do próximo ano.",
        formattedDeltas: [
          { label: "Caravana", value: "+12", isPositive: true },
          { label: "Massa", value: "+6", isPositive: true },
          { label: "Moral", value: "+10", isPositive: true },
          { label: "Caixa Destinado", value: "-R$ 10.000", isPositive: false },
        ],
      },
      {
        id: "ESTUDIO_AUDIOVISUAL_MIDIA",
        text: "Montagem de Estúdio Profissional de Mídia e Podcast na Sede (-R$ 6.000)",
        cost: 6000,
        statEffects: { contingente: 8, autonomia_financeira: 6 },
        stateEffects: { respeito_nacional: 8, moral: 6 },
        log: "Canal oficial no YouTube e streaming de caravanas alcançou milhões de visualizações.",
        formattedDeltas: [
          { label: "Massa Digital", value: "+8", isPositive: true },
          { label: "Respeito", value: "+8", isPositive: true },
          { label: "Finanças", value: "+6", isPositive: true },
        ],
      },
      {
        id: "CHAPA_UNICA_CONSENSO",
        text: "Aclamação por Unanimidade e Celebração com Chopp na Quadra (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 5, pressao_bancada: 5 },
        stateEffects: { moral: 8 },
        log: "A aclamação unânime demonstrou força inabalável da liderança perante as arquibancadas.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+5", isPositive: true },
          { label: "Bancada", value: "+5", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------
// INTERIOR DE SÃO PAULO & CLUBES REGIONAIS (Event Pools & Dynamics)
// -------------------------------------------------------------

export function isInteriorSP(torcida?: OfficialTorcida | null): boolean {
  if (!torcida) return false;
  const capitalBig4 = ["corinthians", "palmeiras", "são paulo", "sao paulo", "santos", "flamengo", "vasco", "fluminense", "botafogo", "grêmio", "internacional", "cruzeiro", "atlético-mg"];
  const clubLower = torcida.clube.toLowerCase();
  
  if (torcida.estado === "SP" && !["corinthians", "palmeiras", "são paulo", "sao paulo", "santos", "portuguesa"].includes(clubLower) && torcida.tier !== "S") {
    return true;
  }
  
  const knownInterior = [
    "ponte preta", "guarani", "botafogo-sp", "botafogo sp", "comercial-rp", "comercial rp", "comercial",
    "são josé", "sao jose", "são josé ec", "santo andré", "santo andre", "rio branco", "união barbarense",
    "uniao barbarense", "paulista jundiaí", "paulista jundiai", "paulista", "ferroviária", "ferroviaria",
    "xv de piracicaba", "xv de jaú", "são bento", "sao bento", "noroeste", "marília", "marilia",
    "inter de limeira", "ituano", "novorizontino", "mirassol", "taubaté", "taubate", "bragantino",
    "red bull bragantino", "oeste", "penapolense", "votuporanguense", "linense", "matonense", "mogi mirim"
  ];
  
  return knownInterior.some(k => clubLower.includes(k));
}

// PERIOD 1 INTERIOR: INÍCIO DE TEMPORADA & PAULISTÃO A1/A2/A3
const PERIOD_1_INTERIOR: EventTemplate[] = [
  {
    category: "RIFAS, FEIJÃO & FINANÇAS DO INTERIOR",
    title: "Rifa de Camisa Oficial & Costelão Fogo de Chão na Sede",
    contextNarrative: "Para levantar o caixa inicial do ano e custear a reforma do galpão da torcida, a diretoria organiza um almoço na sede e rifas pela cidade.",
    choices: [
      {
        id: "COSTELAO_FOGO_CHAO",
        text: "Organizar Costelão de Chão com Chopp Artesanal da Região (-R$ 2.500)",
        cost: 2500,
        statEffects: { autonomia_financeira: 8, contingente: 6 },
        stateEffects: { moral: 10, respeito_nacional: 4 },
        log: "Lotou a calçada e o galpão da sede com 600 torcedores e veteranos da cidade, gerando lucro limpo no caixa.",
        formattedDeltas: [
          { label: "Moral da Cidade", value: "+10", isPositive: true },
          { label: "Autonomia", value: "+8", isPositive: true },
          { label: "Massa Local", value: "+6", isPositive: true },
          { label: "Custo Alimentos", value: "-R$ 2.500", isPositive: false },
        ],
      },
      {
        id: "RIFA_CAMISA_AUTOGRAFADA",
        text: "Rifa Popular de Camisas Históricas de Acesso nos Bares da Cidade (R$ 0)",
        cost: 0,
        statEffects: { autonomia_financeira: 6, contingente: 4 },
        stateEffects: { moral: 6 },
        log: "Vendeu 2.000 bilhetes nos botecos ao redor do estádio, arrecadando fundos para os primeiros jogos.",
        formattedDeltas: [
          { label: "Autonomia", value: "+6", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
        ],
      },
      {
        id: "PATROCINIO_COMERCIO_LOCAL",
        text: "Parceria com Auto-Peças e Padaria da Cidade na Barra da Regata (-R$ 800)",
        cost: 800,
        statEffects: { autonomia_financeira: 7, pressao_bancada: 4 },
        stateEffects: { moral: 5, relacao_clube: 4 },
        log: "Firmou apoio do comércio regional, viabilizando novos uniformes com desconto para os sócios.",
        formattedDeltas: [
          { label: "Autonomia", value: "+7", isPositive: true },
          { label: "Bancada", value: "+4", isPositive: true },
        ],
      },
      {
        id: "MUTIRAO_LIMPEZA_SEDE",
        text: "Mutirão de Pintura e Limpeza da Sede Feito pelos Próprios Sócios (R$ 0)",
        cost: 0,
        statEffects: { contingente: 4, pressao_bancada: 4 },
        stateEffects: { moral: 7 },
        log: "Sócios pintaram o muro da sede e os bancos de madeira, reforçando o sentimento de pertencimento.",
        formattedDeltas: [
          { label: "Moral", value: "+7", isPositive: true },
          { label: "União", value: "+4", isPositive: true },
        ],
      },
    ],
  },
  {
    category: "FARDAMENTO DA GERAL & IDENTIDADE CAIPIRA",
    title: "Confecção de Regatas e Bonés Tradicionais da Torcida",
    contextNarrative: "A diretoria encomenda o lote de regatas e bonés bordados para fardar o setor atrás do gol no estádio municipal.",
    choices: [
      {
        id: "REGATAS_BORDADAS_LOTE",
        text: "Lote de 500 Regatas Tradicionais em Silk Emborrachado (-R$ 3.200)",
        cost: 3200,
        statEffects: { pressao_bancada: 8, autonomia_financeira: 6 },
        stateEffects: { moral: 8 },
        log: "Esgotou as regatas em três dias de treino e arquibancada, padronizando a geral do estádio.",
        formattedDeltas: [
          { label: "Bancada", value: "+8", isPositive: true },
          { label: "Autonomia", value: "+6", isPositive: true },
          { label: "Caixa", value: "-R$ 3.200", isPositive: false },
        ],
      },
      {
        id: "BONE_TRUCKER_POPULAR",
        text: "Bonés Modelo Trucker e Chaveiros Vendidos no Bar da Sede (-R$ 1.200)",
        cost: 1200,
        statEffects: { autonomia_financeira: 5, contingente: 4 },
        stateEffects: { moral: 5 },
        log: "Venda rápida nos dias de jogo fortaleceu o caixa semanal para custear os instrumentos.",
        formattedDeltas: [
          { label: "Autonomia", value: "+5", isPositive: true },
          { label: "Massa", value: "+4", isPositive: true },
        ],
      },
      {
        id: "CONFECCAO_ARTESANAL_LOCAL",
        text: "Estamparia Manual com Tinta de Tecido na Quadra Social (R$ 0)",
        cost: 0,
        statEffects: { contingente: 5, pressao_bancada: 4 },
        stateEffects: { moral: 6 },
        log: "Produção artesanal na calçada uniu a juventude com fardamentos personalizados à mão.",
        formattedDeltas: [
          { label: "Massa", value: "+5", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
        ],
      },
      {
        id: "CORTA_VENTO_INTERIOR",
        text: "Agasalhos Corta-Vento para Noites Frias nas Rodovias (-R$ 4.000)",
        cost: 4000,
        statEffects: { poder_pista: 6, caravana: 6 },
        stateEffects: { moral: 7, respeito_nacional: 4 },
        log: "Fardou o bonde de viagem para as noites de estrada nas rodovias estaduais.",
        formattedDeltas: [
          { label: "Pista", value: "+6", isPositive: true },
          { label: "Caravana", value: "+6", isPositive: true },
          { label: "Investimento", value: "-R$ 4.000", isPositive: false },
        ],
      },
    ],
  },
];

// PERIOD 2 INTERIOR: PISTA REGIONAL, RODOVIAS & DEFESA DA CIDADE
const PERIOD_2_INTERIOR: EventTemplate[] = [
  {
    category: "RODOVIAS ESTADUAIS & ACORDO REGIONAL",
    title: "Alinhamento com a Polícia Rodoviária & Praças de Pedágio",
    contextNarrative: "Para transitar pelas rodovias (Anhanguera, Washington Luís, Dutra, Castelo Branco), a torcida alinha rotas para evitar retenções nas praças de pedágio.",
    choices: [
      {
        id: "ROTA_PAGAMENTO_PEDAGIO_RAPIDO",
        text: "Tags de Pedágio Rápido e Horário Alinhado com a Base Rodoviária (-R$ 1.500)",
        cost: 1500,
        statEffects: { caravana: 8 },
        stateEffects: { risco_mp: -12, moral: 6 },
        log: "Passagem fluida nas praças de pedágio sem revista abusiva, garantindo chegada pontual no estádio.",
        formattedDeltas: [
          { label: "Caravana Ágil", value: "+8", isPositive: true },
          { label: "Risco MP", value: "-12%", isPositive: true },
        ],
      },
      {
        id: "BONDE_VICINAIS_INDEPENDENTE",
        text: "Utilizar Estradas Vicinais do Interior Mantendo Autonomia Tática (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 8, caravana: 4 },
        stateEffects: { moral: 6, risco_mp: 8 },
        log: "Desviou dos postos fixos cortando por rodovias secundárias com total liberdade tática.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+8", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
        ],
      },
      {
        id: "DISCIPLINA_INTERNA_VANS",
        text: "Nomear Responsáveis por Cada Van para Evitar Confusão em Postos (R$ 0)",
        cost: 0,
        statEffects: { caravana: 6 },
        stateEffects: { risco_mp: -10, moral: 4 },
        log: "Controle rígido nos postos de gasolina manteve a integridade e reputação da comitiva.",
        formattedDeltas: [
          { label: "Risco MP", value: "-10%", isPositive: true },
          { label: "Organização", value: "+6", isPositive: true },
        ],
      },
      {
        id: "DEFESA_PRAÇA_MATRIZ",
        text: "Ponto de Concentração Seguro na Praça da Matriz da Cidade (-R$ 800)",
        cost: 800,
        statEffects: { poder_pista: 6, contingente: 4 },
        stateEffects: { moral: 6, respeito_nacional: 4 },
        log: "Reuniu os bondes de todos os bairros no centro histórico antes do embarque das vans.",
        formattedDeltas: [
          { label: "Pista Local", value: "+6", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
        ],
      },
    ],
  },
  {
    category: "AÇÃO SOCIAL NO MUNICÍPIO",
    title: "Campanha Comunitária nas Vilas & Quebradas da Cidade",
    contextNarrative: "Ação beneficente nos bairros periféricos do município com doação de cestas básicas e apoio às escolinhas de futebol de várzea.",
    choices: [
      {
        id: "CESTAS_BASICAS_VILAS",
        text: "Distribuição de 150 Cestas Básicas e Brinquedos nas Vilas (-R$ 1.800)",
        cost: 1800,
        statEffects: { contingente: 8 },
        stateEffects: { risco_mp: -18, moral: 8, respeito_nacional: 6 },
        log: "Ação ganhou grande repercussão na rádio local e nos jornais da cidade.",
        formattedDeltas: [
          { label: "Risco MP", value: "-18%", isPositive: true },
          { label: "Moral na Cidade", value: "+8", isPositive: true },
          { label: "Massa", value: "+8", isPositive: true },
        ],
      },
      {
        id: "TORNEIO_VARZEA_SEDE",
        text: "Torneio de Futebol Society dos Bondes de Bairro da Cidade (R$ 0)",
        cost: 0,
        statEffects: { contingente: 6, poder_pista: 4 },
        stateEffects: { moral: 7 },
        log: "Reuniu 16 times de bairros diferentes na quadra com churrasco comunitário e confraternização.",
        formattedDeltas: [
          { label: "Massa", value: "+6", isPositive: true },
          { label: "Moral", value: "+7", isPositive: true },
        ],
      },
      {
        id: "DOACAO_SANGUE_HEMOCENTRO",
        text: "Comboio de Sócios ao Hemocentro Regional para Doação Coletiva (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 4 },
        stateEffects: { risco_mp: -15, respeito_nacional: 6, moral: 6 },
        log: "Bateu recorde de doações no hospital regional vestindo a camisa da torcida.",
        formattedDeltas: [
          { label: "Risco MP", value: "-15%", isPositive: true },
          { label: "Respeito", value: "+6", isPositive: true },
        ],
      },
      {
        id: "OFICINA_BATUCADA_JOVENS",
        text: "Aulas Gratuitas de Percussão e Ritmo para Jovens da Comunidade (-R$ 500)",
        cost: 500,
        statEffects: { pressao_bancada: 6, contingente: 4 },
        stateEffects: { moral: 5 },
        log: "Formou novos ritmistas garantindo renovação de talentos para a bateria do estádio.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Massa Jovem", value: "+4", isPositive: true },
        ],
      },
    ],
  },
];

// PERIOD 3 INTERIOR: GERAL CAIPIRA, FUMAÇA & BATUCADA
const PERIOD_3_INTERIOR: EventTemplate[] = [
  {
    category: "FESTA VISUAL NA GERAL DO INTERIOR",
    title: "Pirotecnia na Rotatória & Fumaça no Estádio Municipal",
    contextNarrative: "Para os jogos decisivos em casa, a torcida prepara uma recepção calorosa na rotatória de entrada do estádio com fumaça e sinalizadores.",
    choices: [
      {
        id: "FUMACA_COLORIDA_ROTATORIA",
        text: "Potes de Fumaça Colorida e 80 Sinalizadores na Chegada do Ônibus (-R$ 1.600)",
        cost: 1600,
        statEffects: { pressao_bancada: 8, poder_pista: 6 },
        stateEffects: { moral: 10, respeito_nacional: 6 },
        log: "Fechou a rotatória com uma cortina de fumaça espetacular que empurrou o elenco na descida.",
        formattedDeltas: [
          { label: "Moral", value: "+10", isPositive: true },
          { label: "Bancada", value: "+8", isPositive: true },
          { label: "Custo", value: "-R$ 1.600", isPositive: false },
        ],
      },
      {
        id: "BALOES_PAPEL_PICADO_LOCAL",
        text: "Distribuição de 5 Mil Balões e Papel Picado no Alambrado (-R$ 500)",
        cost: 500,
        statEffects: { pressao_bancada: 6, contingente: 4 },
        stateEffects: { moral: 6 },
        log: "Alambrado forrado de festa visual que contagiou todo o estádio municipal.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
        ],
      },
      {
        id: "CANTO_PRESSAO_ALAMBRADO",
        text: "Pressão Sonoro Colada no Alambrado com Charanga e Apitos (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 7 },
        stateEffects: { moral: 6, risco_mp: -4 },
        log: "Abafou o banco de reservas adversário com pressão contínua e apupos a 1 metro do gramado.",
        formattedDeltas: [
          { label: "Bancada", value: "+7", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
        ],
      },
      {
        id: "FAIXAO_ESTADIO_COMPLETO",
        text: "Faixão de 60 Metros Cobrindo Todo o Alambrado Lateral (-R$ 2.200)",
        cost: 2200,
        statEffects: { pressao_bancada: 9, autonomia_financeira: 3 },
        stateEffects: { moral: 8, respeito_nacional: 6 },
        log: "Faixa imponente pintada à mão no galpão virou cartão postal dos jogos no interior.",
        formattedDeltas: [
          { label: "Bancada", value: "+9", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
        ],
      },
    ],
  },
  {
    category: "INSTRUMENTOS & BATERIA CAIPIRA",
    title: "Reforma dos Surdos de Marcação & Repiques Rápidos",
    contextNarrative: "A bateria precisa afinar os instrumentos e adquirir peles resistentes para aguentar 90 minutos de chuva e calor na geral.",
    choices: [
      {
        id: "REFORMAS_PELES_LEVES",
        text: "Troca Completa de Peles e Manutenção de 12 Surdos e Taróis (-R$ 1.400)",
        cost: 1400,
        statEffects: { pressao_bancada: 8 },
        stateEffects: { moral: 7 },
        log: "Bateria renovada tocou com ritmo acelerado e pesado, não deixando a torcida parar um minuto.",
        formattedDeltas: [
          { label: "Bancada", value: "+8", isPositive: true },
          { label: "Moral", value: "+7", isPositive: true },
        ],
      },
      {
        id: "CHARANGA_TRADICIONAL_METAIS",
        text: "Incorporar Trompetes e Trombones da Tradicional Charanga Regional (-R$ 900)",
        cost: 900,
        statEffects: { pressao_bancada: 7, contingente: 4 },
        stateEffects: { moral: 8, respeito_nacional: 6 },
        log: "Os metais trouxeram a autêntica mística das marchinhas de estádio do interior paulista.",
        formattedDeltas: [
          { label: "Bancada", value: "+7", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
        ],
      },
      {
        id: "ENSAIO_GERAL_PORTAO",
        text: "Ensaio Geral com a Massa no Portão Principal do Estádio (R$ 0)",
        cost: 0,
        statEffects: { contingente: 5, pressao_bancada: 4 },
        stateEffects: { moral: 6 },
        log: "Centenas de torcedores aprenderam os novos cantos em uma noite de festa antes do dérby.",
        formattedDeltas: [
          { label: "Massa", value: "+5", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
        ],
      },
      {
        id: "AQUISICAO_BANDEIRAS_VARA",
        text: "Lote de 20 Bandeiras de Bambu Pintadas pelos Sócios (-R$ 600)",
        cost: 600,
        statEffects: { pressao_bancada: 6 },
        stateEffects: { moral: 5 },
        log: "Bandeiras tremulando sem parar cobriram o fundo da trave durante toda a partida.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Moral", value: "+5", isPositive: true },
        ],
      },
    ],
  },
];

// PERIOD 4 INTERIOR: DÉRBY REGIONAL & A GRANDE INVASÃO DA CAPITAL
const PERIOD_4_INTERIOR: EventTemplate[] = [
  {
    category: "CLUBE, ELENCO & COBRANÇA NA CIDADE",
    title: "Conversa no Alambrado com Atletas da Base e Comissão Técnica",
    contextNarrative: "Momento decisivo da temporada no interior. A torcida se posiciona para cobrar entrega máxima aos pratas da casa e jogadores contratados.",
    choices: [
      {
        id: "CONVERSA_FRANCA_ALAMBRADO",
        text: "Reunião Olho no Olho no Alambrado Exigindo Raça e Respeito à Cidade (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 8 },
        stateEffects: { relacao_clube: 2, moral: 8 },
        log: "Cobrança firme sem agressão física conscientizou o elenco da importância do clube para a cidade.",
        formattedDeltas: [
          { label: "Bancada", value: "+8", isPositive: true },
          { label: "Moral da Tropa", value: "+8", isPositive: true },
        ],
      },
      {
        id: "CHURRASCO_COM_ELENCO",
        text: "Almoço de Apoio e Confraternização com os Atletas no CT (-R$ 1.200)",
        cost: 1200,
        statEffects: { contingente: 6, pressao_bancada: 4 },
        stateEffects: { relacao_clube: 15, moral: 9 },
        log: "Uniu elenco e torcida em clima familiar, fortalecendo a confiança antes do mata-mata.",
        formattedDeltas: [
          { label: "Relação com o Clube", value: "+15", isPositive: true },
          { label: "Moral", value: "+9", isPositive: true },
        ],
      },
      {
        id: "FESTA_SAIDA_ONIBUS_DELEGAÇÃO",
        text: "Corredor de Fogos na Rodovia na Partida da Delegação (-R$ 700)",
        cost: 700,
        statEffects: { caravana: 6 },
        stateEffects: { moral: 8, respeito_nacional: 5 },
        log: "Dezenas de motos e carros escoltaram o ônibus do time até a saída da cidade.",
        formattedDeltas: [
          { label: "Caravana", value: "+6", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
        ],
      },
      {
        id: "PROTESTO_FAIXAS_CONSELHO",
        text: "Protesto Pacífico no Conselho Deliberativo contra Cartolas Omissos (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 4 },
        stateEffects: { relacao_clube: -10, respeito_nacional: 6, moral: 5 },
        log: "Exigiu transparência na venda de ingressos e prestação de contas dos dirigentes.",
        formattedDeltas: [
          { label: "Respeito", value: "+6", isPositive: true },
          { label: "Atrito Diretoria", value: "-10", isPositive: false },
        ],
      },
    ],
  },
  {
    category: "INVASÃO DA CAPITAL & CARAVANA DO INTERIOR",
    title: "A Grande Invasão da Capital nos Templos do Futebol",
    contextNarrative: "O jogo do ano na capital! A torcida organiza uma caravana histórica de vans e ônibus para desafiar os gigantes nos grandes estádios da capital paulista.",
    choices: [
      {
        id: "COMBOIO_COMPLETO_CAPITAL",
        text: "Subsidiar Frota de Vans e Ônibus para Lotar o Setor de Visitante (-R$ 3.000)",
        cost: 3000,
        statEffects: { caravana: 12, contingente: 8, pressao_bancada: 8 },
        stateEffects: { moral: 12, respeito_nacional: 12 },
        log: "Desceu em peso na capital, estendeu a faixa principal e cantou mais alto que a torcida local.",
        formattedDeltas: [
          { label: "Caravana Histórica", value: "+12", isPositive: true },
          { label: "Respeito na Capital", value: "+12", isPositive: true },
          { label: "Moral", value: "+12", isPositive: true },
          { label: "Caixa Destinado", value: "-R$ 3.000", isPositive: false },
        ],
      },
      {
        id: "CARAVANA_RATEIO_PULVERIZADO",
        text: "Organização em Dezenas de Vans e Carros Particulares por Rateio (R$ 0)",
        cost: 0,
        statEffects: { caravana: 8, poder_pista: 6 },
        stateEffects: { moral: 8 },
        log: "Chegada em comboio ágil pelas marginais sem chamar atenção da fiscalização.",
        formattedDeltas: [
          { label: "Caravana", value: "+8", isPositive: true },
          { label: "Pista", value: "+6", isPositive: true },
        ],
      },
      {
        id: "APOIO_SOCIOS_CAPITAL",
        text: "Ponto de Encontro com Sócios que Moram ou Estudam na Capital (R$ 0)",
        cost: 0,
        statEffects: { contingente: 6, caravana: 4 },
        stateEffects: { moral: 7, respeito_nacional: 6 },
        log: "Centenas de conterrâneos residentes na capital se juntaram à caravana no portão de visitante.",
        formattedDeltas: [
          { label: "Massa", value: "+6", isPositive: true },
          { label: "Moral", value: "+7", isPositive: true },
        ],
      },
      {
        id: "ESCOLTA_RODOVIARIA_NEGOCIADA",
        text: "Alinhamento Prévia com a PM da Capital para Evitar Emboscadas (-R$ 1.000)",
        cost: 1000,
        statEffects: { caravana: 6 },
        stateEffects: { risco_mp: -12, moral: 5 },
        log: "Deslocamento seguro das rodovias até o estádio sem nenhum confronto ou janela quebrada.",
        formattedDeltas: [
          { label: "Risco MP", value: "-12%", isPositive: true },
          { label: "Segurança", value: "+6", isPositive: true },
        ],
      },
    ],
  },
];

// PERIOD 5 INTERIOR: PRESTAÇÃO DE CONTAS & CHURRASCO DO INTERIOR
const PERIOD_5_INTERIOR: EventTemplate[] = [
  {
    category: "PRESTAÇÃO DE CONTAS & CHURRASCO NA CALÇADA",
    title: "Churrasco de Encerramento & Prestação de Contas na Calçada",
    contextNarrative: "Fechamento do ano com prestação de contas na sede, chopp artesanal na calçada e planejamento das viagens do próximo ano.",
    choices: [
      {
        id: "FUNDO_VANS_PROXIMO_ANO",
        text: "Guardar o Saldo da Vaquinha no Fundo de Viagens do Próximo Ano (R$ 0)",
        cost: 0,
        statEffects: { caravana: 10, autonomia_financeira: 8 },
        stateEffects: { moral: 8, respeito_nacional: 6 },
        log: "Garantido sinal de entrada para todas as vans da próxima Copa Paulista e Série A2.",
        formattedDeltas: [
          { label: "Caravana Futura", value: "+10", isPositive: true },
          { label: "Autonomia", value: "+8", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
        ],
      },
      {
        id: "CHURRASCO_COMUNITARIO_CHOPP",
        text: "Churrasco com Chopp Liberado para Todos os Sócios Adimplentes (-R$ 2.000)",
        cost: 2000,
        statEffects: { contingente: 6, pressao_bancada: 4 },
        stateEffects: { moral: 10 },
        log: "Confraternização inesquecível na calçada da sede celebrou o amor incondicional ao clube.",
        formattedDeltas: [
          { label: "Moral da Comunidade", value: "+10", isPositive: true },
          { label: "Massa", value: "+6", isPositive: true },
        ],
      },
      {
        id: "REFORMA_PINTURA_SEDE",
        text: "Compra de Tintas para Renovar os Murais e Escudos na Fachada (-R$ 1.000)",
        cost: 1000,
        statEffects: { pressao_bancada: 6, autonomia_financeira: 4 },
        stateEffects: { respeito_nacional: 6, moral: 6 },
        log: "Fachada da sede revitalizada com grafites homenageando os grandes ídolos do clube.",
        formattedDeltas: [
          { label: "Respeito", value: "+6", isPositive: true },
          { label: "Bancada", value: "+6", isPositive: true },
        ],
      },
      {
        id: "CHAPA_UNICA_BAIRROS",
        text: "Aclamação da Diretoria de Consenso com Representantes dos Bairros (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 4, pressao_bancada: 4 },
        stateEffects: { moral: 8 },
        log: "União consolidada entre todos os bondes regionais garantiu paz e força para o próximo ano.",
        formattedDeltas: [
          { label: "União", value: "+4", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------
// REPOSITÓRIO PROCEDURAL EXPANDIDO (200+ EVENTOS DIVERSIFICADOS)
// -------------------------------------------------------------
const PROCEDURAL_CATEGORIES = [
  { name: "CONFECÇÃO & PATRIMÔNIO", icon: "👕" },
  { name: "SABEDORIA & ADVOVACIA", icon: "⚖️" },
  { name: "CARAVANAS & LOGÍSTICA", icon: "🚌" },
  { name: "MOSAICO & ARQUIBANCADA", icon: "🎨" },
  { name: "BATERIA & SAMBA", icon: "🥁" },
  { name: "AÇÃO SOCIAL & COMUNIDADE", icon: "❤️" },
  { name: "SUBSEDES & REGIONALISMO", icon: "🚩" },
  { name: "GEOPOLÍTICA DE ALIANÇAS", icon: "🤝" },
  { name: "POLÍTICA NO CLUBE", icon: "🏟️" },
  { name: "SEGURANÇA & INTELIGÊNCIA", icon: "🛡️" },
];

function generateProceduralEventPool(): EventTemplate[] {
  const templates: EventTemplate[] = [];

  const items = [
    "Casacos Corta-Vento Estampa Retrô", "Blusões de Lã Bordados", "Regatas Modelo Tradicional 1990",
    "Agasalhos de Viagem Impermeáveis", "Bonés 5-Panel com Patch Emborrachado", "Kits de Adesivos de Pista",
    "Bandeirões Oficiais de 40 Metros", "Fumaça Colorida Importada", "Sinalizadores Marítimos",
    "Surdos de Marcação de 22 Polegadas", "Repiques de Alumínio Polido", "Caixas de Guerra com Pele Dupla",
    "Sistema de Som e Amplificação da Sede", "Churrasqueira Industrial para Ensaios", "Reforma do Bar da Sede Social",
    "Reforma da Fachada com Mosaico Grafitado", "Troca dos Ônibus para Caravana Festiva", "Manutenção da Frota de Micro-ônibus",
    "Confecção de Mosaico 3D com Mastro", "Bandeiras de Bambu para Setor Local", "Camisas de Edição Limitada do Centenário",
    "Acervo Histórico e Memória do Pavilhão", "Reforma do Camarim e Palco de Samba", "Cadastro Biométrico de Associados"
  ];

  for (let i = 1; i <= 200; i++) {
    const cat = PROCEDURAL_CATEGORIES[i % PROCEDURAL_CATEGORIES.length];
    const item = items[i % items.length];

    templates.push({
      category: `${cat.icon} ${cat.name}`,
      title: `Projeto Estratégico #${i}: ${item}`,
      contextNarrative: `A diretoria reuniu as lideranças da bancada e conselho para deliberar sobre o plano de ação nº ${i} focado em "${item}".`,
      choices: [
        {
          id: `PROC_CHOICE_A_${i}`,
          text: `Investimento de Elite com Foco em Qualidade (-R$ ${(3000 + (i % 7) * 2000).toLocaleString()})`,
          cost: 3000 + (i % 7) * 2000,
          statEffects: { pressao_bancada: 5 + (i % 4), autonomia_financeira: 6 },
          stateEffects: { moral: 6 + (i % 3), respeito_nacional: 5 },
          log: `Executou o plano premium nº ${i} de ${item} com sucesso e retorno na massa.`,
          formattedDeltas: [
            { label: "Bancada", value: `+${5 + (i % 4)}`, isPositive: true },
            { label: "Moral", value: `+${6 + (i % 3)}`, isPositive: true },
            { label: "Respeito", value: "+5", isPositive: true },
            { label: "Caixa", value: `-R$ ${(3000 + (i % 7) * 2000).toLocaleString()}`, isPositive: false },
          ],
        },
        {
          id: `PROC_CHOICE_B_${i}`,
          text: `Modelo Comunitário Participativo dos Associados (R$ 0)`,
          cost: 0,
          statEffects: { contingente: 6 + (i % 5), poder_pista: 3 },
          stateEffects: { moral: 5 },
          log: `Mobilizou os associados no mutirão comunitário para viabilizar ${item}.`,
          formattedDeltas: [
            { label: "Massa", value: `+${6 + (i % 5)}`, isPositive: true },
            { label: "Moral", value: "+5", isPositive: true },
            { label: "Custo", value: "R$ 0", isPositive: true },
          ],
        },
        {
          id: `PROC_CHOICE_C_${i}`,
          text: `Parceria de Apoio com Comércio Local e Subsedes (-R$ ${(1000 + (i % 3) * 1000).toLocaleString()})`,
          cost: 1000 + (i % 3) * 1000,
          statEffects: { caravana: 5 + (i % 4), autonomia_financeira: 4 },
          stateEffects: { respeito_nacional: 4 },
          log: `Fechou parceria com subsedes regionais para fortalecer ${item}.`,
          formattedDeltas: [
            { label: "Caravana", value: `+${5 + (i % 4)}`, isPositive: true },
            { label: "Respeito", value: "+4", isPositive: true },
            { label: "Caixa", value: `-R$ ${(1000 + (i % 3) * 1000).toLocaleString()}`, isPositive: false },
          ],
        },
        {
          id: `PROC_CHOICE_D_${i}`,
          text: `Postura de Cautela e Reserva Financeira (R$ 0)`,
          cost: 0,
          statEffects: { autonomia_financeira: 5 },
          stateEffects: { moral: 2 },
          log: `Optou por poupar recursos do caixa mantendo planejamento prudente.`,
          formattedDeltas: [
            { label: "Autonomia", value: "+5", isPositive: true },
            { label: "Caixa", value: "Preservado", isPositive: true },
          ],
        },
      ],
    });
  }

  return templates;
}

const EXTENDED_200_EVENT_POOL = generateProceduralEventPool();

// Helper to pick event with seasonal variety and interior support
export function getSeasonalActionEvent(
  period: 1 | 2 | 3 | 4 | 5,
  season: number,
  slotIndex: number,
  isInterior: boolean = false
): ActionStepEvent {
  let pool = PERIOD_1_EVENTS;
  if (isInterior) {
    if (period === 1) pool = PERIOD_1_INTERIOR;
    else if (period === 2) pool = PERIOD_2_INTERIOR;
    else if (period === 3) pool = PERIOD_3_INTERIOR;
    else if (period === 4) pool = PERIOD_4_INTERIOR;
    else if (period === 5) pool = PERIOD_5_INTERIOR;
  } else {
    if (period === 2) pool = PERIOD_2_EVENTS;
    else if (period === 3) pool = PERIOD_3_EVENTS;
    else if (period === 4) pool = PERIOD_4_EVENTS;
    else if (period === 5) pool = PERIOD_5_EVENTS;
  }

  // Combine curated period pool with procedural 200+ event pool based on season hash
  const useProcedural = season > 1 || slotIndex > 4;
  const targetPool = useProcedural ? EXTENDED_200_EVENT_POOL : pool;

  // PRNG hash for 100% non-repeating event rotation
  const hash = Math.abs((season * 37 + slotIndex * 19 + (isInterior ? 101 : 13)) % targetPool.length);
  const template = targetPool[hash];

  return {
    stepIndex: slotIndex,
    title: `Etapa ${slotIndex + 1 < 10 ? `0${slotIndex + 1}` : slotIndex + 1} - ${template.title}`,
    category: template.category,
    contextNarrative: template.contextNarrative,
    choices: template.choices,
  };
}
