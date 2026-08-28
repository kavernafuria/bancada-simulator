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
        statEffects: { pressao_bancada: 5, autonomia_financeira: 6, contingente: -3 },
        stateEffects: { moral: 5, respeito_nacional: 4 },
        log: "Lançou coleção premium retrô. Fardou os setores centrais com alto lucro, mas o preço alto afastou associados de baixa renda.",
        formattedDeltas: [
          { label: "Bancada", value: "+5", isPositive: true },
          { label: "Autonomia", value: "+6", isPositive: true },
          { label: "Exclusividade (Massa)", value: "-3", isPositive: false },
          { label: "Caixa", value: "-R$ 14.000", isPositive: false },
        ],
      },
      {
        id: "FARDAMENTO_POPULAR",
        text: "Linha Popular em Dry-Fit no Preço de Custo (R$ 0)",
        cost: 0,
        statEffects: { contingente: 6, pressao_bancada: 3, autonomia_financeira: -4, poder_pista: -3 },
        stateEffects: { moral: 4 },
        log: "Lançou regatas populares a preço de custo. Padronizou milhares de torcedores, mas zerou a margem da loja e reduziu a postura de pista.",
        formattedDeltas: [
          { label: "Massa", value: "+6", isPositive: true },
          { label: "Bancada", value: "+3", isPositive: true },
          { label: "Lucro de Loja", value: "-4", isPositive: false },
          { label: "Postura de Pista", value: "-3", isPositive: false },
        ],
      },
      {
        id: "AGASALHOS_BOMBER",
        text: "Jaquetas Corta-Vento Impermeáveis de Pista (-R$ 18.000)",
        cost: 18000,
        statEffects: { poder_pista: 6, autonomia_financeira: 4, pressao_bancada: -2 },
        stateEffects: { moral: 6, respeito_nacional: 6 },
        log: "Equipou o bonde de pista com jaquetas pesadas, impondo respeito nas ruas, mas concentrou a atenção longe das arquibancadas.",
        formattedDeltas: [
          { label: "Pista", value: "+6", isPositive: true },
          { label: "Respeito", value: "+6", isPositive: true },
          { label: "Foco de Bancada", value: "-2", isPositive: false },
          { label: "Caixa", value: "-R$ 18.000", isPositive: false },
        ],
      },
      {
        id: "RATEIO_SUBSEDES",
        text: "Descentralizar a Produção para as Subsedes Regionais (R$ 0)",
        cost: 0,
        statEffects: { caravana: 5, contingente: 3, pressao_bancada: -3, autonomia_financeira: -3 },
        stateEffects: { moral: 3, relacao_clube: 2 },
        log: "Autorizou polos regionais a confeccionarem lotes locais. Fortaleceu viagens do interior, mas pulverizou a arrecadação da sede.",
        formattedDeltas: [
          { label: "Caravana", value: "+5", isPositive: true },
          { label: "Massa Regional", value: "+3", isPositive: true },
          { label: "Vozes na Capital", value: "-3", isPositive: false },
          { label: "Caixa Central", value: "-3", isPositive: false },
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
        statEffects: { pressao_bancada: 8, contingente: 5, poder_pista: -3 },
        stateEffects: { moral: 9, respeito_nacional: 8 },
        log: "Desfile triunfal com nota 10 dos jurados, mas a dedicação ao samba drenou a energia do bonde de pista nos estádios.",
        formattedDeltas: [
          { label: "Moral", value: "+9", isPositive: true },
          { label: "Respeito Nacional", value: "+8", isPositive: true },
          { label: "Foco de Pista", value: "-3", isPositive: false },
          { label: "Caixa", value: "-R$ 20.000", isPositive: false },
        ],
      },
      {
        id: "BLOCO_DE_RUA_POPULAR",
        text: "Puxar Megabloco Popular de Rua Arrastando a Massa na Quebrada (R$ 0)",
        cost: 0,
        statEffects: { contingente: 7, pressao_bancada: 3, poder_pista: -4, autonomia_financeira: -3 },
        stateEffects: { moral: 6, risco_mp: 8 },
        log: "Arrastou 25 mil pessoas no bloco de rua, mas a aglomeração desorganizada aumentou a fiscalização do Ministério Público.",
        formattedDeltas: [
          { label: "Massa", value: "+7", isPositive: true },
          { label: "Risco MP", value: "+8%", isPositive: false },
          { label: "Disciplina de Pista", value: "-4", isPositive: false },
        ],
      },
      {
        id: "ABAFADORES_E_SURDOS",
        text: "Renovação Completa dos Instrumentos de Percussão (-R$ 8.000)",
        cost: 8000,
        statEffects: { pressao_bancada: 6, autonomia_financeira: -3, caravana: -2 },
        stateEffects: { moral: 5 },
        log: "Novos surdos e repiques cromados garantiram som estrondoso nos ensaios, mas consumiram verba de suporte rodoviário.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Autonomia", value: "-3", isPositive: false },
          { label: "Caixa", value: "-R$ 8.000", isPositive: false },
        ],
      },
      {
        id: "CAMAROTE_SEDE_LUCRO",
        text: "Venda de Camarote VIP na Quadra com Open Bar (+R$ 15.000)",
        cost: -15000,
        statEffects: { autonomia_financeira: 7, pressao_bancada: -3, contingente: -3 },
        stateEffects: { moral: -3 },
        log: "Lucro altíssimo na quadra vendendo ingressos corporativos, mas causou revolta na velha guarda e distanciamento dos sócios raízes.",
        formattedDeltas: [
          { label: "Lucro no Caixa", value: "+R$ 15.000", isPositive: true },
          { label: "Bancada Raiz", value: "-3", isPositive: false },
          { label: "Moral da Tropa", value: "-3", isPositive: false },
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
        statEffects: { autonomia_financeira: 7, contingente: -3 },
        stateEffects: { risco_mp: -12, moral: 4 },
        log: "Modernizou o cadastro com biometria facial, reduzindo atritos com o MP, porém afastou torcedores clandestinos.",
        formattedDeltas: [
          { label: "Autonomia", value: "+7", isPositive: true },
          { label: "Risco MP", value: "-12%", isPositive: true },
          { label: "Contingente Total", value: "-3", isPositive: false },
          { label: "Caixa", value: "-R$ 8.000", isPositive: false },
        ],
      },
      {
        id: "PLANO_POPULAR_ANUIDADE",
        text: "Campanha 'Sócio da Bancada' com Mensalidade Simbólica (R$ 0)",
        cost: 0,
        statEffects: { contingente: 7, pressao_bancada: 3, autonomia_financeira: -4, poder_pista: -3 },
        stateEffects: { moral: 5 },
        log: "Atraiu 1.500 novos sócios da periferia, mas a anuidade simbólica gerou pouca receita e sobrecarregou a segurança.",
        formattedDeltas: [
          { label: "Massa", value: "+7", isPositive: true },
          { label: "Receita de Sócios", value: "-4", isPositive: false },
          { label: "Controle de Pista", value: "-3", isPositive: false },
        ],
      },
      {
        id: "EXIGENCIA_PRESENCA_REUNIOES",
        text: "Exigência Rígida de Presença em Reuniões de Pista (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 6, contingente: -5, pressao_bancada: -2 },
        stateEffects: { moral: 4, respeito_nacional: 5 },
        log: "Filtrou o quadro social exigindo lealdade nas assembleias. Ganhou respeito de pista, mas perdeu centenas de torcedores ocasionais.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+6", isPositive: true },
          { label: "Respeito", value: "+5", isPositive: true },
          { label: "Perda de Massa", value: "-5", isPositive: false },
        ],
      },
      {
        id: "PACOTE_CARAVANA_INCLUSO",
        text: "Combo 'Sócio Viajante' com Desconto Garantido em Ônibus (-R$ 5.000)",
        cost: 5000,
        statEffects: { caravana: 7, autonomia_financeira: -3, pressao_bancada: -2 },
        stateEffects: { moral: 5 },
        log: "Fidelizou centenas de viajantes garantindo prioridade em ônibus, mas a subvenção reduziu o saldo reservado para a bateria.",
        formattedDeltas: [
          { label: "Caravana", value: "+7", isPositive: true },
          { label: "Autonomia", value: "-3", isPositive: false },
          { label: "Caixa", value: "-R$ 5.000", isPositive: false },
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
        statEffects: { pressao_bancada: 6, poder_pista: -4, caravana: -2 },
        stateEffects: { risco_mp: -10, moral: -3 },
        log: "Acordo com o Choque garantiu mastros no setor, mas o trajeto 100% escoltado minou a reputação de pista da torcida.",
        formattedDeltas: [
          { label: "Bancada Visual", value: "+6", isPositive: true },
          { label: "Risco MP", value: "-10%", isPositive: true },
          { label: "Postura de Pista", value: "-4", isPositive: false },
          { label: "Moral da Tropa", value: "-3", isPositive: false },
        ],
      },
      {
        id: "ROTAS_INDEPENDENTES",
        text: "Manter Autonomia de Rota sem Assinar Termo de Compromisso Rígido (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 6, contingente: -3, autonomia_financeira: -2 },
        stateEffects: { risco_mp: 12, moral: 5 },
        log: "Manteve liberdade tática pelas ruas, mas a falta de escolta assustou torcedores com famílias e disparou atritos com o MP.",
        formattedDeltas: [
          { label: "Pista", value: "+6", isPositive: true },
          { label: "Risco MP", value: "+12%", isPositive: false },
          { label: "Massa Familiar", value: "-3", isPositive: false },
        ],
      },
      {
        id: "COMISSAO_SEGURANCA_INTERNA",
        text: "Criar Comissão Própria de Disciplina e Segurança de Quadra (-R$ 3.000)",
        cost: 3000,
        statEffects: { poder_pista: 4, pressao_bancada: 3, autonomia_financeira: -3 },
        stateEffects: { risco_mp: -8, moral: 5 },
        log: "Coletes da disciplina organizaram catracas evitando brigas, mas o custo operacional reduziu verbas de caravana.",
        formattedDeltas: [
          { label: "Risco MP", value: "-8%", isPositive: true },
          { label: "Organização", value: "+4", isPositive: true },
          { label: "Caixa", value: "-R$ 3.000", isPositive: false },
        ],
      },
      {
        id: "DENUNCIA_ABUSO_PUBLICO",
        text: "Dossiê Jurídico contra Abusos Policiais nas Catracas (-R$ 2.000)",
        cost: 2000,
        statEffects: { contingente: 3, pressao_bancada: -2 },
        stateEffects: { moral: 5, respeito_nacional: 5, risco_mp: -5, relacao_clube: -3 },
        log: "Denunciou arbitrariedades. Ganhou respeito dos sócios, mas azedou a relação institucional com a diretoria do clube.",
        formattedDeltas: [
          { label: "Respeito", value: "+5", isPositive: true },
          { label: "Risco MP", value: "-5%", isPositive: true },
          { label: "Atrito no Clube", value: "-3", isPositive: false },
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
        statEffects: { caravana: 8, autonomia_financeira: 5, contingente: 4, pressao_bancada: -3 },
        stateEffects: { respeito_nacional: 6, moral: 6 },
        log: "Inaugurou subsede imponente no interior. Aumentou o fluxo de caravanas, mas drenou a atenção do setor central do estádio.",
        formattedDeltas: [
          { label: "Caravana", value: "+8", isPositive: true },
          { label: "Massa", value: "+4", isPositive: true },
          { label: "Presença Central", value: "-3", isPositive: false },
          { label: "Caixa", value: "-R$ 15.000", isPositive: false },
        ],
      },
      {
        id: "APROVACAO_POLO_AUTONOMO",
        text: "Homologar a Subsede com Gestão 100% Autônoma pelos Moradores (R$ 0)",
        cost: 0,
        statEffects: { caravana: 5, contingente: 4, autonomia_financeira: -3, pressao_bancada: -3 },
        stateEffects: { moral: 4 },
        log: "Oficializou nova faixa regional sem custos, mas a falta de controle central gerou inadimplência no repasse de mensalidades.",
        formattedDeltas: [
          { label: "Caravana", value: "+5", isPositive: true },
          { label: "Massa", value: "+4", isPositive: true },
          { label: "Repasse Financeiro", value: "-3", isPositive: false },
          { label: "Controle da Sede", value: "-3", isPositive: false },
        ],
      },
      {
        id: "TREINO_LINHA_FRENTE_REGIONAL",
        text: "Enviar Oficiais de Pista para Treinar a Linha de Frente Regional (-R$ 4.000)",
        cost: 4000,
        statEffects: { poder_pista: 6, caravana: 4, contingente: -2 },
        stateEffects: { moral: 4, respeito_nacional: 5 },
        log: "Blindou o trajeto rodoviário integrando a tropa do interior, mas a rigidez militar afastou sócios recreativos.",
        formattedDeltas: [
          { label: "Pista", value: "+6", isPositive: true },
          { label: "Caravana", value: "+4", isPositive: true },
          { label: "Caixa", value: "-R$ 4.000", isPositive: false },
        ],
      },
      {
        id: "LIMITAR_EXPANSAO",
        text: "Manter Concentração Exclusiva na Capital e Centralizar Recursos (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 5, caravana: -4, contingente: -3 },
        stateEffects: { moral: 2 },
        log: "Focou 100% do contingente no setor central da capital, aumentando a bancada mas estagnando o crescimento no interior.",
        formattedDeltas: [
          { label: "Bancada Capital", value: "+5", isPositive: true },
          { label: "Caravana Interior", value: "-4", isPositive: false },
          { label: "Crescimento de Massa", value: "-3", isPositive: false },
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
        statEffects: { poder_pista: 9, contingente: 3, autonomia_financeira: -4 },
        stateEffects: { moral: 7, respeito_nacional: 8, risco_mp: 6 },
        log: "Formou atletas de elite e disciplinou a linha de frente, mas os treinos chamaram a atenção de investigadores do MP.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+9", isPositive: true },
          { label: "Respeito Nacional", value: "+8", isPositive: true },
          { label: "Risco MP", value: "+6%", isPositive: false },
          { label: "Caixa", value: "-R$ 12.000", isPositive: false },
        ],
      },
      {
        id: "TREINO_FUNCIONAL_GRATUITO",
        text: "Treinamento Funcional e Calistenia Gratuito para Toda a Massa (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 5, contingente: 4, autonomia_financeira: -3 },
        stateEffects: { moral: 5, risco_mp: 5 },
        log: "Treinos diários na quadra integraram os associados, mas exigiram custos ocultos de iluminação e manutenção do espaço.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+5", isPositive: true },
          { label: "Massa", value: "+4", isPositive: true },
          { label: "Manutenção da Sede", value: "-3", isPositive: false },
        ],
      },
      {
        id: "CONVITE_ATLETAS_EXTERNOS",
        text: "Contratar Lutadores Profissionais para Seminários de Defesa Pessoal (-R$ 5.000)",
        cost: 5000,
        statEffects: { poder_pista: 6, pressao_bancada: -2 },
        stateEffects: { moral: 4, respeito_nacional: 5 },
        log: "Seminário intensivo aprimorou o posicionamento tático da tropa, mas retirou verba de manutenção da bateria.",
        formattedDeltas: [
          { label: "Pista", value: "+6", isPositive: true },
          { label: "Respeito", value: "+5", isPositive: true },
          { label: "Caixa", value: "-R$ 5.000", isPositive: false },
        ],
      },
      {
        id: "FOCO_TOTAL_FESTA",
        text: "Rejeitar Foco Marcial e Investir Todo o Espaço em Sala de Troféus (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 5, poder_pista: -4, autonomia_financeira: -2 },
        stateEffects: { risco_mp: -8, moral: 3 },
        log: "Priorizou a vertente cultural e histórica, reduzindo investigações policiais mas enfraquecendo a postura de pista.",
        formattedDeltas: [
          { label: "Risco MP", value: "-8%", isPositive: true },
          { label: "Bancada Cultural", value: "+5", isPositive: true },
          { label: "Defesa de Pista", value: "-4", isPositive: false },
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
        statEffects: { pressao_bancada: 9, contingente: 4, autonomia_financeira: -5 },
        stateEffects: { moral: 9, respeito_nacional: 9 },
        log: "Mosaico monumental repercutiu no mundo inteiro. Trouxe prestígio gigante, mas drenou o caixa de viagens.",
        formattedDeltas: [
          { label: "Bancada Visual", value: "+9", isPositive: true },
          { label: "Respeito Mundial", value: "+9", isPositive: true },
          { label: "Reserva Financeira", value: "-5", isPositive: false },
          { label: "Caixa", value: "-R$ 16.000", isPositive: false },
        ],
      },
      {
        id: "CORREDOR_FOGO_EXTERNO",
        text: "Mega Corredor de Fogo na Avenida com 300 Sinalizadores Marítimos (-R$ 7.000)",
        cost: 7000,
        statEffects: { poder_pista: 6, pressao_bancada: 6, autonomia_financeira: -3 },
        stateEffects: { moral: 8, risco_mp: 7 },
        log: "Avenida guiando o ônibus do time em clima de guerra. Incendiou a torcida, mas abriu novo inquérito no MP.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
          { label: "Risco MP", value: "+7%", isPositive: false },
          { label: "Caixa", value: "-R$ 7.000", isPositive: false },
        ],
      },
      {
        id: "FESTA_PAPEL_PICADO_BALOES",
        text: "Chuva de 3 Toneladas de Papel Picado e 40 Mil Balões Metalizados (-R$ 3.500)",
        cost: 3500,
        statEffects: { pressao_bancada: 5, contingente: 4, poder_pista: -2 },
        stateEffects: { moral: 5 },
        log: "Festa visual clássica cobriu o setor sem risco de punição, porém teve impacto de intimidação menor.",
        formattedDeltas: [
          { label: "Bancada", value: "+5", isPositive: true },
          { label: "Moral", value: "+5", isPositive: true },
          { label: "Intimidação", value: "-2", isPositive: false },
        ],
      },
      {
        id: "CANTO_A_CAPELLA_BRUTO",
        text: "Pressão Sonora Pura com Bateria Cadenciada sem Artefatos Visuais (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 5, poder_pista: -4, caravana: -2 },
        stateEffects: { moral: 4, risco_mp: -5 },
        log: "Vozes cantando em uníssono estremeceram o estádio sem gastar R$ 1, mas a falta de visual decepcionou os fotógrafos.",
        formattedDeltas: [
          { label: "Pressão Sonora", value: "+5", isPositive: true },
          { label: "Risco MP", value: "-5%", isPositive: true },
          { label: "Impacto Visual", value: "-4", isPositive: false },
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
        statEffects: { pressao_bancada: 9, autonomia_financeira: -4, caravana: -3 },
        stateEffects: { moral: 8, respeito_nacional: 8 },
        log: "Bandeirão histórico de proporções bíblicas desfraldado no estádio, consumindo grande parte da logística rodoviária.",
        formattedDeltas: [
          { label: "Bancada Visual", value: "+9", isPositive: true },
          { label: "Respeito", value: "+8", isPositive: true },
          { label: "Frota de Caravana", value: "-3", isPositive: false },
          { label: "Caixa", value: "-R$ 18.000", isPositive: false },
        ],
      },
      {
        id: "RESTAURACAO_TRAPOS_HISTORICOS",
        text: "Restauração Completa dos 50 Trapos Históricos da Década de 80 (-R$ 4.000)",
        cost: 4000,
        statEffects: { pressao_bancada: 5, poder_pista: -2 },
        stateEffects: { moral: 6, respeito_nacional: 6 },
        log: "Resgatou a mística das faixas antigas preservando a raiz ultra, mas reduziu a agilidade nas catracas.",
        formattedDeltas: [
          { label: "Respeito Histórico", value: "+6", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
          { label: "Agilidade Catracas", value: "-2", isPositive: false },
        ],
      },
      {
        id: "MUTIRAO_PINTURA_COMUNITARIO",
        text: "Mutirão Noturno na Quadra com Sócios Pintando Faixas à Mão (R$ 0)",
        cost: 0,
        statEffects: { contingente: 4, pressao_bancada: 4, autonomia_financeira: -2, poder_pista: -2 },
        stateEffects: { moral: 5 },
        log: "Noites na quadra com pizza e tinta uniram a massa na confecção, custando pequenos gastos de material na cantina.",
        formattedDeltas: [
          { label: "União da Massa", value: "+4", isPositive: true },
          { label: "Bancada", value: "+4", isPositive: true },
          { label: "Gasto em Tintas", value: "-2", isPositive: false },
        ],
      },
      {
        id: "GUARDA_BLINDADA_MATERIAIS",
        text: "Contratação de Galpão Seguro e Escolta Privada para o Acervo (-R$ 6.000)",
        cost: 6000,
        statEffects: { poder_pista: 5, pressao_bancada: -2 },
        stateEffects: { risco_mp: -5, respeito_nacional: 5 },
        log: "Blindou o patrimônio contra tentativas de furto de rivais, mas desviou recursos da confecção de novas faixas.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+5", isPositive: true },
          { label: "Segurança de Acervo", value: "+5", isPositive: true },
          { label: "Caixa", value: "-R$ 6.000", isPositive: false },
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
        statEffects: { pressao_bancada: 6, contingente: -3 },
        stateEffects: { relacao_clube: -6, moral: 7, risco_mp: 5 },
        log: "Cobrança olho no olho exigiu entrega total do elenco. Aumentou o moral da tropa, mas trincou a relação com os cartolas.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Moral da Tropa", value: "+7", isPositive: true },
          { label: "Atrito na Diretoria", value: "-6", isPositive: false },
          { label: "Risco MP", value: "+5%", isPositive: false },
        ],
      },
      {
        id: "TREINO_ABERTO_APOIO_TOTAL",
        text: "Organizar Treino Aberto com 20 Mil Pessoas Incendiando o Estádio (-R$ 5.000)",
        cost: 5000,
        statEffects: { contingente: 6, pressao_bancada: 4, autonomia_financeira: -3 },
        stateEffects: { relacao_clube: 12, moral: 8 },
        log: "Lotou o treino com festa comovente blindando o elenco. Fortaleceu laços no clube, gastando reserva da cantina.",
        formattedDeltas: [
          { label: "Relação Clube", value: "+12", isPositive: true },
          { label: "Moral", value: "+8", isPositive: true },
          { label: "Caixa", value: "-R$ 5.000", isPositive: false },
        ],
      },
      {
        id: "AERO_TORCIDA_EMBARQUE",
        text: "Aero-Torcida: Bloqueio do Aeroporto com Fumaça e Sinalizadores (-R$ 3.500)",
        cost: 3500,
        statEffects: { caravana: 5, contingente: 4, poder_pista: -2 },
        stateEffects: { moral: 7, respeito_nacional: 6, risco_mp: 6 },
        log: "Fechou o saguão e empurrou o time no embarque, gerando grande moral mas atrito com a fiscalização aeroportuária.",
        formattedDeltas: [
          { label: "Caravana", value: "+5", isPositive: true },
          { label: "Moral", value: "+7", isPositive: true },
          { label: "Risco MP", value: "+6%", isPositive: false },
        ],
      },
      {
        id: "BOICOTE_E_PROTESTO_PIPOQUEIROS",
        text: "Faixas de Cabeça para Baixo e Chuva de Pipoca na Entrada do Conselho (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: -4, contingente: -3 },
        stateEffects: { relacao_clube: -12, respeito_nacional: 6, moral: 3 },
        log: "Protesto de pipoca desestabilizou cartolas omissos. Ganhou respeito nacional, mas esvaziou a bancada no jogo seguinte.",
        formattedDeltas: [
          { label: "Respeito Nacional", value: "+6", isPositive: true },
          { label: "Bancada no Jogo", value: "-4", isPositive: false },
          { label: "Relação Clube", value: "-12", isPositive: false },
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
        statEffects: { poder_pista: 6, caravana: 6, autonomia_financeira: -3 },
        stateEffects: { respeito_nacional: 12, moral: 6 },
        log: "Mediou a crise selando a trégua no bloco de alianças, mantendo a força militar nas rodovias.",
        formattedDeltas: [
          { label: "Respeito Nacional", value: "+12", isPositive: true },
          { label: "Poder de Pista", value: "+6", isPositive: true },
          { label: "Caixa", value: "-R$ 3.000", isPositive: false },
        ],
      },
      {
        id: "TROCA_DE_BATERIAS_E_MATERIAIS",
        text: "Intercâmbio de Bateria e Faixas Conjuntas nas Caravanas (R$ 0)",
        cost: 0,
        statEffects: { caravana: 4, pressao_bancada: 3, autonomia_financeira: -2, poder_pista: -2 },
        stateEffects: { respeito_nacional: 6, moral: 4 },
        log: "Ritimistas e materiais reforçaram o bloco aliado, custando transporte extra de instrumentos.",
        formattedDeltas: [
          { label: "Respeito", value: "+6", isPositive: true },
          { label: "Caravana", value: "+4", isPositive: true },
          { label: "Gasto de Transporte", value: "-2", isPositive: false },
        ],
      },
      {
        id: "PACTO_DEFENSIVO_RODOVIAS",
        text: "Rede de Inteligência Rodoviária em Tempo Real com Aliados (-R$ 3.000)",
        cost: 3000,
        statEffects: { caravana: 6, poder_pista: 4, contingente: -2 },
        stateEffects: { respeito_nacional: 8, risco_mp: -5 },
        log: "Monitoramento por rádio e GPS evitou emboscadas rivais, mas exigiu dedicação exclusiva de líderes.",
        formattedDeltas: [
          { label: "Segurança Caravana", value: "+6", isPositive: true },
          { label: "Respeito", value: "+8", isPositive: true },
          { label: "Caixa", value: "-R$ 3.000", isPositive: false },
        ],
      },
      {
        id: "NEUTRALIDADE_RACHA",
        text: "Manter Neutralidade Absoluta Perante o Racha Diplomático (R$ 0)",
        cost: 0,
        statEffects: { contingente: 3, caravana: -4, poder_pista: -3 },
        stateEffects: { respeito_nacional: -6, moral: 2 },
        log: "Adotou postura neutra no racha. Manteve o foco local, mas perdeu prestígio e escolta nos comboios fora de casa.",
        formattedDeltas: [
          { label: "Massa Local", value: "+3", isPositive: true },
          { label: "Escolta de Caravana", value: "-4", isPositive: false },
          { label: "Respeito Nacional", value: "-6", isPositive: false },
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
        statEffects: { autonomia_financeira: 8, contingente: -3, pressao_bancada: -2 },
        stateEffects: { moral: 5, respeito_nacional: 5 },
        log: "Blindou o patrimônio guardando o superávit na poupança da sede, reduzindo o investimento em festa visual.",
        formattedDeltas: [
          { label: "Autonomia Financeira", value: "+8", isPositive: true },
          { label: "Respeito Patrimonial", value: "+5", isPositive: true },
          { label: "Investimento em Festa", value: "-2", isPositive: false },
        ],
      },
      {
        id: "SUBSIDIO_MEGA_CARAVANA",
        text: "Destinar Verba para Subsidiar Passagens de Caravana do Próximo Ano (-R$ 10.000)",
        cost: 10000,
        statEffects: { caravana: 9, contingente: 4, autonomia_financeira: -4 },
        stateEffects: { moral: 8 },
        log: "Subsidia passagens a preço popular para viagens do próximo ano, consumindo caixa de emergência.",
        formattedDeltas: [
          { label: "Caravana", value: "+9", isPositive: true },
          { label: "Massa", value: "+4", isPositive: true },
          { label: "Reserva de Caixa", value: "-4", isPositive: false },
          { label: "Caixa Destinado", value: "-R$ 10.000", isPositive: false },
        ],
      },
      {
        id: "ESTUDIO_AUDIOVISUAL_MIDIA",
        text: "Montagem de Estúdio Profissional de Mídia e Podcast na Sede (-R$ 6.000)",
        cost: 6000,
        statEffects: { contingente: 6, autonomia_financeira: 4, poder_pista: -3 },
        stateEffects: { respeito_nacional: 6, moral: 5, risco_mp: 5 },
        log: "Canal de comunicação oficial alcançou milhões de acessos, mas a exposição na mídia atraiu olhos da polícia.",
        formattedDeltas: [
          { label: "Massa Digital", value: "+6", isPositive: true },
          { label: "Respeito", value: "+6", isPositive: true },
          { label: "Risco MP", value: "+5%", isPositive: false },
          { label: "Postura Secreta de Pista", value: "-3", isPositive: false },
        ],
      },
      {
        id: "CHAPA_UNICA_CONSENSO",
        text: "Aclamação por Unanimidade e Celebração com Chopp na Quadra (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 4, pressao_bancada: 4, autonomia_financeira: -3 },
        stateEffects: { moral: 6 },
        log: "Aclamação unânime demonstrou união da diretoria, com custos de recepção bancados pela torcida.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+4", isPositive: true },
          { label: "Bancada", value: "+4", isPositive: true },
          { label: "Gasto com Evento", value: "-3", isPositive: false },
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
        statEffects: { autonomia_financeira: 6, contingente: 4, poder_pista: -2 },
        stateEffects: { moral: 8, respeito_nacional: 3 },
        log: "Lotou o galpão da sede com 600 torcedores e veteranos da cidade. Arrecadou fundos, mas o evento festivo amoleceu o treino de pista.",
        formattedDeltas: [
          { label: "Moral da Cidade", value: "+8", isPositive: true },
          { label: "Autonomia", value: "+6", isPositive: true },
          { label: "Massa Local", value: "+4", isPositive: true },
          { label: "Foco de Pista", value: "-2", isPositive: false },
          { label: "Custo Alimentos", value: "-R$ 2.500", isPositive: false },
        ],
      },
      {
        id: "RIFA_CAMISA_AUTOGRAFADA",
        text: "Rifa Popular de Camisas Históricas de Acesso nos Bares da Cidade (R$ 0)",
        cost: 0,
        statEffects: { autonomia_financeira: 4, contingente: 3, pressao_bancada: -2 },
        stateEffects: { moral: 5 },
        log: "Vendeu 2.000 bilhetes nos botecos. Arrecadou fundos sem desembolso, mas a falta de brindes novos reduziu o canto na bancada.",
        formattedDeltas: [
          { label: "Autonomia", value: "+4", isPositive: true },
          { label: "Moral", value: "+5", isPositive: true },
          { label: "Bancada", value: "-2", isPositive: false },
        ],
      },
      {
        id: "PATROCINIO_COMERCIO_LOCAL",
        text: "Parceria com Auto-Peças e Padaria da Cidade na Barra da Regata (-R$ 800)",
        cost: 800,
        statEffects: { autonomia_financeira: 5, pressao_bancada: 3, poder_pista: -2 },
        stateEffects: { moral: 4, relacao_clube: 3 },
        log: "Firmou apoio do comércio regional viabilizando novos uniformes, mas as marcas na regata geraram chiado dos sócios tradicionais.",
        formattedDeltas: [
          { label: "Autonomia", value: "+5", isPositive: true },
          { label: "Bancada", value: "+3", isPositive: true },
          { label: "Identidade de Pista", value: "-2", isPositive: false },
        ],
      },
      {
        id: "MUTIRAO_LIMPEZA_SEDE",
        text: "Mutirão de Pintura e Limpeza da Sede Feito pelos Próprios Sócios (R$ 0)",
        cost: 0,
        statEffects: { contingente: 3, pressao_bancada: 3, autonomia_financeira: -2, caravana: -2 },
        stateEffects: { moral: 5 },
        log: "Sócios pintaram o muro da sede e recuperaram os bancos, gastando materiais de consumo mantidos pela cantina.",
        formattedDeltas: [
          { label: "Moral", value: "+5", isPositive: true },
          { label: "União", value: "+3", isPositive: true },
          { label: "Gasto Tintas", value: "-2", isPositive: false },
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
        statEffects: { pressao_bancada: 6, autonomia_financeira: 4, contingente: -2 },
        stateEffects: { moral: 6 },
        log: "Padronizou a geral do estádio com Silk emborrachado, elevando o valor da regata para a massa periférica.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Autonomia", value: "+4", isPositive: true },
          { label: "Acesso Popular", value: "-2", isPositive: false },
          { label: "Caixa", value: "-R$ 3.200", isPositive: false },
        ],
      },
      {
        id: "BONE_TRUCKER_POPULAR",
        text: "Bonés Modelo Trucker e Chaveiros Vendidos no Bar da Sede (-R$ 1.200)",
        cost: 1200,
        statEffects: { autonomia_financeira: 4, contingente: 3, poder_pista: -2 },
        stateEffects: { moral: 4 },
        log: "Venda rápida nos dias de jogo fortaleceu o caixa semanal, mas o modelo comercial desagradou o bonde de frente.",
        formattedDeltas: [
          { label: "Autonomia", value: "+4", isPositive: true },
          { label: "Massa", value: "+3", isPositive: true },
          { label: "Poder de Pista", value: "-2", isPositive: false },
        ],
      },
      {
        id: "CONFECCAO_ARTESANAL_LOCAL",
        text: "Estamparia Manual com Tinta de Tecido na Quadra Social (R$ 0)",
        cost: 0,
        statEffects: { contingente: 4, pressao_bancada: 3, autonomia_financeira: -2, poder_pista: -2 },
        stateEffects: { moral: 5 },
        log: "Produção artesanal na calçada fardou os jovens à mão, gastando tintas da cantina e com acabamento irregular.",
        formattedDeltas: [
          { label: "Massa", value: "+4", isPositive: true },
          { label: "Moral", value: "+5", isPositive: true },
          { label: "Acabamento/Pista", value: "-2", isPositive: false },
        ],
      },
      {
        id: "CORTA_VENTO_INTERIOR",
        text: "Agasalhos Corta-Vento para Noites Frias nas Rodovias (-R$ 4.000)",
        cost: 4000,
        statEffects: { poder_pista: 5, caravana: 5, autonomia_financeira: -3 },
        stateEffects: { moral: 6, respeito_nacional: 3 },
        log: "Fardou o bonde de viagem para as noites de estrada nas rodovias estaduais, reduzindo a verba de confecção de faixas.",
        formattedDeltas: [
          { label: "Pista", value: "+5", isPositive: true },
          { label: "Caravana", value: "+5", isPositive: true },
          { label: "Caixa", value: "-R$ 4.000", isPositive: false },
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
        statEffects: { caravana: 6, poder_pista: -3 },
        stateEffects: { risco_mp: -10, moral: 5 },
        log: "Passagem fluida nas praças de pedágio sem revista abusiva, mas a escolta rígida impediu paradas em postos de apoio.",
        formattedDeltas: [
          { label: "Caravana Ágil", value: "+6", isPositive: true },
          { label: "Risco MP", value: "-10%", isPositive: true },
          { label: "Liberdade de Pista", value: "-3", isPositive: false },
        ],
      },
      {
        id: "BONDE_VICINAIS_INDEPENDENTE",
        text: "Utilizar Estradas Vicinais do Interior Mantendo Autonomia Tática (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 6, caravana: 3, contingente: -3, autonomia_financeira: -2 },
        stateEffects: { moral: 5, risco_mp: 8 },
        log: "Desviou dos postos fixos por rodovias secundárias. Manteve postura de pista, mas atrasou 2 vans e assustou sócios novos.",
        formattedDeltas: [
          { label: "Poder de Pista", value: "+6", isPositive: true },
          { label: "Risco MP", value: "+8%", isPositive: false },
          { label: "Perda de Pontualidade", value: "-3", isPositive: false },
        ],
      },
      {
        id: "DISCIPLINA_INTERNA_VANS",
        text: "Nomear Responsáveis por Cada Van para Evitar Confusão em Postos (R$ 0)",
        cost: 0,
        statEffects: { caravana: 4, poder_pista: -2 },
        stateEffects: { risco_mp: -8, moral: 4 },
        log: "Controle rígido nos postos manteve a integridade do comboio, reduzindo a agressividade de pista dos mais jovens.",
        formattedDeltas: [
          { label: "Risco MP", value: "-8%", isPositive: true },
          { label: "Organização", value: "+4", isPositive: true },
          { label: "Pressão de Pista", value: "-2", isPositive: false },
        ],
      },
      {
        id: "DEFESA_PRAÇA_MATRIZ",
        text: "Ponto de Concentração Seguro na Praça da Matriz da Cidade (-R$ 800)",
        cost: 800,
        statEffects: { poder_pista: 4, contingente: 3, autonomia_financeira: -2 },
        stateEffects: { moral: 5, respeito_nacional: 3 },
        log: "Reuniu os bondes de bairro no centro histórico antes do embarque das vans, gastando com segurança privada.",
        formattedDeltas: [
          { label: "Pista Local", value: "+4", isPositive: true },
          { label: "Moral", value: "+5", isPositive: true },
          { label: "Custo Concentração", value: "-2", isPositive: false },
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
        statEffects: { contingente: 6, autonomia_financeira: -3 },
        stateEffects: { risco_mp: -15, moral: 7, respeito_nacional: 5 },
        log: "Ação beneficente ganhou grande repercussão na imprensa local, limpando o nome da torcida perante as autoridades.",
        formattedDeltas: [
          { label: "Risco MP", value: "-15%", isPositive: true },
          { label: "Massa", value: "+6", isPositive: true },
          { label: "Caixa", value: "-R$ 1.800", isPositive: false },
        ],
      },
      {
        id: "TORNEIO_VARZEA_SEDE",
        text: "Torneio de Futebol Society dos Bondes de Bairro da Cidade (R$ 0)",
        cost: 0,
        statEffects: { contingente: 4, poder_pista: 3, autonomia_financeira: -2, pressao_bancada: -2 },
        stateEffects: { moral: 6 },
        log: "Reuniu 16 times de bairros na quadra com churrasco. Aumentou o contingente, gastando a limpeza e manutenção do campo.",
        formattedDeltas: [
          { label: "Massa", value: "+4", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
          { label: "Manutenção Quadra", value: "-2", isPositive: false },
        ],
      },
      {
        id: "DOACAO_SANGUE_HEMOCENTRO",
        text: "Comboio de Sócios ao Hemocentro Regional para Doação Coletiva (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 3, poder_pista: -2, autonomia_financeira: -2 },
        stateEffects: { risco_mp: -12, respeito_nacional: 5, moral: 5 },
        log: "Bateu recorde de doações no hospital regional vestindo a camisa da torcida. Reduziu atrito com o MP.",
        formattedDeltas: [
          { label: "Risco MP", value: "-12%", isPositive: true },
          { label: "Respeito", value: "+5", isPositive: true },
          { label: "Foco de Pista", value: "-2", isPositive: false },
        ],
      },
      {
        id: "OFICINA_BATUCADA_JOVENS",
        text: "Aulas Gratuitas de Percussão e Ritmo para Jovens da Comunidade (-R$ 500)",
        cost: 500,
        statEffects: { pressao_bancada: 5, contingente: 3, poder_pista: -2 },
        stateEffects: { moral: 4 },
        log: "Formou novos ritmistas para a bateria do estádio, desacelerando o foco na segurança de pista.",
        formattedDeltas: [
          { label: "Bancada", value: "+5", isPositive: true },
          { label: "Massa Jovem", value: "+3", isPositive: true },
          { label: "Treino de Pista", value: "-2", isPositive: false },
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
        statEffects: { pressao_bancada: 6, poder_pista: 4, autonomia_financeira: -2 },
        stateEffects: { moral: 8, respeito_nacional: 5, risco_mp: 5 },
        log: "Fechou a rotatória com cortina de fumaça. Empurrou o elenco, mas gerou advertência formal da diretoria do estádio.",
        formattedDeltas: [
          { label: "Moral", value: "+8", isPositive: true },
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Risco MP", value: "+5%", isPositive: false },
          { label: "Custo", value: "-R$ 1.600", isPositive: false },
        ],
      },
      {
        id: "BALOES_PAPEL_PICADO_LOCAL",
        text: "Distribuição de 5 Mil Balões e Papel Picado no Alambrado (-R$ 500)",
        cost: 500,
        statEffects: { pressao_bancada: 4, contingente: 3, poder_pista: -2 },
        stateEffects: { moral: 5 },
        log: "Alambrado forrado de festa visual alegre sem riscos policiais, mas de baixo efeito intimidador no adversário.",
        formattedDeltas: [
          { label: "Bancada", value: "+4", isPositive: true },
          { label: "Moral", value: "+5", isPositive: true },
          { label: "Intimidação", value: "-2", isPositive: false },
        ],
      },
      {
        id: "CANTO_PRESSAO_ALAMBRADO",
        text: "Pressão Sonoro Colada no Alambrado com Charanga e Apitos (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: 5, poder_pista: -3, caravana: -2 },
        stateEffects: { moral: 5, risco_mp: -4 },
        log: "Pressão sonora a 1 metro do gramado sem gastos, mas a ausência de sinalizadores reduziu a repercussão visual nas redes.",
        formattedDeltas: [
          { label: "Bancada", value: "+5", isPositive: true },
          { label: "Risco MP", value: "-4%", isPositive: true },
          { label: "Repercussão Visual", value: "-3", isPositive: false },
        ],
      },
      {
        id: "FAIXAO_ESTADIO_COMPLETO",
        text: "Faixão de 60 Metros Cobrindo Todo o Alambrado Lateral (-R$ 2.200)",
        cost: 2200,
        statEffects: { pressao_bancada: 7, autonomia_financeira: -3, caravana: -2 },
        stateEffects: { moral: 7, respeito_nacional: 5 },
        log: "Faixa imponente pintada no galpão virou cartão postal, reduzindo todavia os fundos para aluguel de ônibus.",
        formattedDeltas: [
          { label: "Bancada", value: "+7", isPositive: true },
          { label: "Moral", value: "+7", isPositive: true },
          { label: "Fundo de Ônibus", value: "-2", isPositive: false },
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
        statEffects: { pressao_bancada: 6, autonomia_financeira: -2 },
        stateEffects: { moral: 6 },
        log: "Bateria renovada tocou com ritmo acelerado sem parar um minuto, consumindo caixa de reposição.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
          { label: "Caixa", value: "-R$ 1.400", isPositive: false },
        ],
      },
      {
        id: "CHARANGA_TRADICIONAL_METAIS",
        text: "Incorporar Trompetes e Trombones da Tradicional Charanga Regional (-R$ 900)",
        cost: 900,
        statEffects: { pressao_bancada: 5, contingente: 3, poder_pista: -2 },
        stateEffects: { moral: 6, respeito_nacional: 5 },
        log: "Metais trouxeram a mística das marchinhas de estádio do interior, mas o tom festivo suavizou o clima de pista.",
        formattedDeltas: [
          { label: "Bancada", value: "+5", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
          { label: "Clima de Guerra", value: "-2", isPositive: false },
        ],
      },
      {
        id: "ENSAIO_GERAL_PORTAO",
        text: "Ensaio Geral com a Massa no Portão Principal do Estádio (R$ 0)",
        cost: 0,
        statEffects: { contingente: 4, pressao_bancada: 3, autonomia_financeira: -2, poder_pista: -2 },
        stateEffects: { moral: 5 },
        log: "Centenas aprenderam os novos cantos no portão principal, gastando cervejas e bebidas de recepção da cantina.",
        formattedDeltas: [
          { label: "Massa", value: "+4", isPositive: true },
          { label: "Bancada", value: "+3", isPositive: true },
          { label: "Estoque da Cantina", value: "-2", isPositive: false },
        ],
      },
      {
        id: "AQUISICAO_BANDEIRAS_VARA",
        text: "Lote de 20 Bandeiras de Bambu Pintadas pelos Sócios (-R$ 600)",
        cost: 600,
        statEffects: { pressao_bancada: 4, poder_pista: -2 },
        stateEffects: { moral: 4 },
        log: "Bandeiras tremulando cobriram o fundo da trave, mas exigiram atenção extra na revista das catracas.",
        formattedDeltas: [
          { label: "Bancada", value: "+4", isPositive: true },
          { label: "Moral", value: "+4", isPositive: true },
          { label: "Flexibilidade Catraca", value: "-2", isPositive: false },
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
        statEffects: { pressao_bancada: 6, contingente: -3 },
        stateEffects: { relacao_clube: -5, moral: 6, risco_mp: 4 },
        log: "Cobrança firme no alambrado conscientizou o elenco, porém criou clima de tensão com a diretoria do clube.",
        formattedDeltas: [
          { label: "Bancada", value: "+6", isPositive: true },
          { label: "Moral da Tropa", value: "+6", isPositive: true },
          { label: "Atrito Diretoria", value: "-5", isPositive: false },
        ],
      },
      {
        id: "CHURRASCO_COM_ELENCO",
        text: "Almoço de Apoio e Confraternização com os Atletas no CT (-R$ 1.200)",
        cost: 1200,
        statEffects: { contingente: 4, pressao_bancada: 3, poder_pista: -2 },
        stateEffects: { relacao_clube: 12, moral: 7 },
        log: "Uniu elenco e torcida em clima de churrasco no CT, aumentando o moral mas suavizando o tom de cobrança.",
        formattedDeltas: [
          { label: "Relação com o Clube", value: "+12", isPositive: true },
          { label: "Moral", value: "+7", isPositive: true },
          { label: "Tom de Cobrança", value: "-2", isPositive: false },
        ],
      },
      {
        id: "FESTA_SAIDA_ONIBUS_DELEGAÇÃO",
        text: "Corredor de Fogos na Rodovia na Partida da Delegação (-R$ 700)",
        cost: 700,
        statEffects: { caravana: 4, autonomia_financeira: -2 },
        stateEffects: { moral: 6, respeito_nacional: 4, risco_mp: 4 },
        log: "Dezenas de carros e motos escoltaram o ônibus do time até a saída da rodovia, gerando empolgação e multa de trânsito.",
        formattedDeltas: [
          { label: "Caravana", value: "+4", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
          { label: "Risco MP", value: "+4%", isPositive: false },
        ],
      },
      {
        id: "PROTESTO_FAIXAS_CONSELHO",
        text: "Protesto Pacífico no Conselho Deliberativo contra Cartolas Omissos (R$ 0)",
        cost: 0,
        statEffects: { pressao_bancada: -3, contingente: -2 },
        stateEffects: { relacao_clube: -10, respeito_nacional: 5, moral: 4 },
        log: "Exigiu transparência no Conselho. Ganhou respeito da imprensa regional, mas esvaziou a bancada no treino.",
        formattedDeltas: [
          { label: "Respeito", value: "+5", isPositive: true },
          { label: "Atrito Diretoria", value: "-10", isPositive: false },
          { label: "Bancada Treino", value: "-3", isPositive: false },
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
        statEffects: { caravana: 9, contingente: 6, pressao_bancada: 6, autonomia_financeira: -4 },
        stateEffects: { moral: 9, respeito_nacional: 9 },
        log: "Desceu em peso na capital lotando o setor visitante. Impos respeito gigante, mas esgotou o caixa de caravanas do ano.",
        formattedDeltas: [
          { label: "Caravana Histórica", value: "+9", isPositive: true },
          { label: "Respeito na Capital", value: "+9", isPositive: true },
          { label: "Caixa Rodoviário", value: "-4", isPositive: false },
          { label: "Caixa Destinado", value: "-R$ 3.000", isPositive: false },
        ],
      },
      {
        id: "CARAVANA_RATEIO_PULVERIZADO",
        text: "Organização em Dezenas de Vans e Carros Particulares por Rateio (R$ 0)",
        cost: 0,
        statEffects: { caravana: 6, poder_pista: 4, contingente: -3, autonomia_financeira: -2 },
        stateEffects: { moral: 6 },
        log: "Chegada em comboio ágil pelas marginais sem chamar atenção, mas a desorganização pulverizou parte dos passageiros.",
        formattedDeltas: [
          { label: "Caravana", value: "+6", isPositive: true },
          { label: "Pista", value: "+4", isPositive: true },
          { label: "Desorganização Frota", value: "-3", isPositive: false },
        ],
      },
      {
        id: "APOIO_SOCIOS_CAPITAL",
        text: "Ponto de Encontro com Sócios que Moram ou Estudam na Capital (R$ 0)",
        cost: 0,
        statEffects: { contingente: 4, caravana: 3, pressao_bancada: -2, autonomia_financeira: -2 },
        stateEffects: { moral: 5, respeito_nacional: 4 },
        log: "Conterrâneos residentes na capital se juntaram à caravana no portão, mas exigiram suporte de ingressos extras.",
        formattedDeltas: [
          { label: "Massa", value: "+4", isPositive: true },
          { label: "Moral", value: "+5", isPositive: true },
          { label: "Logística Ingressos", value: "-2", isPositive: false },
        ],
      },
      {
        id: "ESCOLTA_RODOVIARIA_NEGOCIADA",
        text: "Alinhamento Prévia com a PM da Capital para Evitar Emboscadas (-R$ 1.000)",
        cost: 1000,
        statEffects: { caravana: 4, poder_pista: -3 },
        stateEffects: { risco_mp: -10, moral: 4 },
        log: "Deslocamento seguro das rodovias ao estádio sem nenhuma janela quebrada, sacrificando a postura combativa de pista.",
        formattedDeltas: [
          { label: "Risco MP", value: "-10%", isPositive: true },
          { label: "Segurança", value: "+4", isPositive: true },
          { label: "Postura de Pista", value: "-3", isPositive: false },
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
        statEffects: { caravana: 7, autonomia_financeira: 6, pressao_bancada: -2, contingente: -2 },
        stateEffects: { moral: 6, respeito_nacional: 4 },
        log: "Garantido sinal de entrada para as vans do próximo ano, poupando recursos mas cancelando o banquete festivo.",
        formattedDeltas: [
          { label: "Caravana Futura", value: "+7", isPositive: true },
          { label: "Autonomia", value: "+6", isPositive: true },
          { label: "Festa de Fim de Ano", value: "-2", isPositive: false },
        ],
      },
      {
        id: "CHURRASCO_COMUNITARIO_CHOPP",
        text: "Churrasco com Chopp Liberado para Todos os Sócios Adimplentes (-R$ 2.000)",
        cost: 2000,
        statEffects: { contingente: 4, pressao_bancada: 3, autonomia_financeira: -3 },
        stateEffects: { moral: 8 },
        log: "Confraternização festiva na calçada celebrou o amor ao clube, reduzindo contudo o caixa reservado para a sede.",
        formattedDeltas: [
          { label: "Moral da Comunidade", value: "+8", isPositive: true },
          { label: "Massa", value: "+4", isPositive: true },
          { label: "Caixa", value: "-R$ 2.000", isPositive: false },
        ],
      },
      {
        id: "REFORMA_PINTURA_SEDE",
        text: "Compra de Tintas para Renovar os Murais e Escudos na Fachada (-R$ 1.000)",
        cost: 1000,
        statEffects: { pressao_bancada: 4, autonomia_financeira: -2 },
        stateEffects: { respeito_nacional: 4, moral: 4 },
        log: "Fachada da sede revitalizada com grafites dos ídolos, gastando verba de tintas da tesouraria.",
        formattedDeltas: [
          { label: "Respeito", value: "+4", isPositive: true },
          { label: "Bancada Visual", value: "+4", isPositive: true },
        ],
      },
      {
        id: "CHAPA_UNICA_BAIRROS",
        text: "Aclamação da Diretoria de Consenso com Representantes dos Bairros (R$ 0)",
        cost: 0,
        statEffects: { poder_pista: 3, pressao_bancada: 3, autonomia_financeira: -2 },
        stateEffects: { moral: 6 },
        log: "União consolidada entre todos os bondes regionais, com pequenos custos de recepção dos líderes de bairro.",
        formattedDeltas: [
          { label: "União", value: "+3", isPositive: true },
          { label: "Moral", value: "+6", isPositive: true },
          { label: "Custos de Recepção", value: "-2", isPositive: false },
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
    const costValue = 2500 + (i % 6) * 1500;

    templates.push({
      category: `${cat.icon} ${cat.name}`,
      title: `Projeto Estratégico #${i}: ${item}`,
      contextNarrative: `A diretoria reuniu as lideranças da bancada e conselho para deliberar sobre o plano de ação nº ${i} focado em "${item}".`,
      choices: [
        {
          id: `PROC_CHOICE_A_${i}`,
          text: `Investimento de Elite com Foco em Qualidade (-R$ ${costValue.toLocaleString()})`,
          cost: costValue,
          statEffects: { pressao_bancada: 4 + (i % 3), autonomia_financeira: 4, contingente: -2 },
          stateEffects: { moral: 5 + (i % 2), respeito_nacional: 4 },
          log: `Executou o plano premium nº ${i} de ${item} com alto acabamento, mas o investimento alto reduziu o folego para a massa periférica.`,
          formattedDeltas: [
            { label: "Bancada", value: `+${4 + (i % 3)}`, isPositive: true },
            { label: "Moral", value: `+${5 + (i % 2)}`, isPositive: true },
            { label: "Acesso Popular", value: "-2", isPositive: false },
            { label: "Caixa", value: `-R$ ${costValue.toLocaleString()}`, isPositive: false },
          ],
        },
        {
          id: `PROC_CHOICE_B_${i}`,
          text: `Modelo Comunitário Participativo dos Associados (R$ 0)`,
          cost: 0,
          statEffects: { contingente: 5 + (i % 3), poder_pista: 2, autonomia_financeira: -3, pressao_bancada: -2 },
          stateEffects: { moral: 4 },
          log: `Mobilizou os associados no mutirão comunitário para viabilizar ${item}. Gastou suprimentos da cantina e pulverizou a regência.`,
          formattedDeltas: [
            { label: "Massa", value: `+${5 + (i % 3)}`, isPositive: true },
            { label: "Moral", value: "+4", isPositive: true },
            { label: "Estoque Cantina", value: "-3", isPositive: false },
            { label: "Controle Central", value: "-2", isPositive: false },
          ],
        },
        {
          id: `PROC_CHOICE_C_${i}`,
          text: `Parceria de Apoio com Comércio Local e Subsedes (-R$ ${(1000 + (i % 3) * 800).toLocaleString()})`,
          cost: 1000 + (i % 3) * 800,
          statEffects: { caravana: 4 + (i % 3), autonomia_financeira: 3, poder_pista: -2 },
          stateEffects: { respeito_nacional: 3 },
          log: `Fechou parceria com subsedes regionais para fortalecer ${item}, dividindo o controle de marcas da barra.`,
          formattedDeltas: [
            { label: "Caravana", value: `+${4 + (i % 3)}`, isPositive: true },
            { label: "Respeito", value: "+3", isPositive: true },
            { label: "Autonomia de Marca", value: "-2", isPositive: false },
            { label: "Caixa", value: `-R$ ${(1000 + (i % 3) * 800).toLocaleString()}`, isPositive: false },
          ],
        },
        {
          id: `PROC_CHOICE_D_${i}`,
          text: `Postura de Cautela e Reserva Financeira (R$ 0)`,
          cost: 0,
          statEffects: { autonomia_financeira: 4, contingente: -3, pressao_bancada: -2 },
          stateEffects: { moral: 2 },
          log: `Optou por poupar recursos do caixa mantendo cautela, mas a falta de investimentos esfriou o ritmo da bancada.`,
          formattedDeltas: [
            { label: "Autonomia", value: "+4", isPositive: true },
            { label: "Pressão Sonora", value: "-2", isPositive: false },
            { label: "Massa Jovem", value: "-3", isPositive: false },
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
