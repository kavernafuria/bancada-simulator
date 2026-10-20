"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  X,
  Users,
  Drum,
  Swords,
  Bus,
  Wallet,
  Shirt,
  Building2,
  ShieldAlert,
  Download,
  CheckCircle2,
  Sparkles,
  Trophy,
  Compass,
  Scale,
  RotateCcw,
  Target,
} from "lucide-react";

interface GameTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: "Bem-Vindo ao Bancada Simulator!",
    subtitle: "Os 5 Atributos Vitais e Indicadores da Agremiação",
    icon: <BookOpen className="w-5 h-5 text-amber-400" />,
    badge: "FUNDAMENTOS",
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
        <p>
          No comando da diretoria da sua Torcida Organizada, você tem a missão de gerenciar a agremiação durante <strong className="text-amber-400">15 Temporadas Históricas</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-black text-amber-400 block text-[11px] mb-0.5">👥 MASSA / CONTINGENTE</span>
            <p className="text-[10.5px] text-zinc-400">Quantidade de associados ativos e capacidade de encher a arquibancada.</p>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-black text-orange-400 block text-[11px] mb-0.5">🥁 PRESSÃO DE BANCADA</span>
            <p className="text-[10.5px] text-zinc-400">Poder de canto, ritmo de bateria, bandeirões e empurrão tático para o time.</p>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-black text-red-400 block text-[11px] mb-0.5">🥊 PODER DE PISTA (PEC)</span>
            <p className="text-[10.5px] text-zinc-400">Capacidade do bonde de frente para defender a faixa em comboios e emboscadas.</p>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-black text-blue-400 block text-[11px] mb-0.5">🚌 CAPACIDADE CARAVANA</span>
            <p className="text-[10.5px] text-zinc-400">Logística de frota de ônibus para invasões interestaduais e viagens longas.</p>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 sm:col-span-2">
            <span className="font-black text-emerald-400 block text-[11px] mb-0.5">💵 AUTONOMIA FINANCEIRA & CAIXA</span>
            <p className="text-[10.5px] text-zinc-400">Capacidade de gerar receita e manter independência financeira, além do <strong className="text-emerald-400">Caixa Operacional (R$)</strong> para custear ações imediatas.</p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-[10.5px] text-amber-300">
          <strong className="font-black uppercase block mb-0.5">🔥 Indicadores de Estado:</strong>
          Acompanhe também a <strong className="text-amber-400">Moral da Agremiação</strong>, a <strong className="text-red-400">Pressão do Ministério Público (Risco MP)</strong>, a <strong className="text-indigo-400">Relação com a Diretoria do Clube</strong> e o <strong className="text-purple-400">Respeito Nacional</strong>.
        </div>
      </div>
    ),
  },
  {
    step: 2,
    title: "O Ciclo da Temporada & As 10 Etapas",
    subtitle: "Como Funciona a Progressão de Jogos e Ações",
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    badge: "FLUXO DE JOGO",
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
        <p>
          Cada temporada é dividida em <strong className="text-amber-400">10 Etapas</strong> sequenciais. Você avançará passo a passo no calendário oficial do futebol nacional:
        </p>

        <div className="space-y-2 pt-1">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-start gap-2">
            <span className="bg-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded text-[9.5px] shrink-0 mt-0.5">AÇÕES</span>
            <div>
              <strong className="text-white block font-bold">Ações de Sede & Preparativos</strong>
              <span className="text-[10.5px] text-zinc-400">Decisões administrativas objetivas com 4 opções de postura, custos em R$ e prós/contras equilibrados nos atributos da torcida.</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-start gap-2">
            <span className="bg-red-500/20 text-red-400 font-black px-2 py-0.5 rounded text-[9.5px] shrink-0 mt-0.5">DERBIES</span>
            <div>
              <strong className="text-white block font-bold">Os 4 Grandes Confrontos da Temporada</strong>
              <span className="text-[10.5px] text-zinc-400">Jogos decisivos (Etapas 3, 5, 7 e 10) com 4 fases: Reunião com a PM/Segurança, Escolha de Transporte, Espionagem de Pista e Batalha Tática/Minigames.</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[10.5px] text-zinc-400">
          <strong className="text-emerald-400 font-black block mb-0.5">🎮 Minigames de Pista & Caldeirão:</strong>
          Durante os Derbies, você jogará minigames de ação e ritmo (Avanço 3D, Combate de Pista, Bateria de Rojões com portais alternados, Agito de Bandeirão, Mosaico de Cores e Caldeirão Pitch) usando as cores oficiais da sua torcida!
        </div>

        <div className="bg-zinc-950 p-2.5 rounded-xl border border-amber-500/30 text-[10.5px] text-zinc-400">
          <strong className="text-amber-400 font-black block mb-0.5">📱 Repercussão Viral em Momentos-Chave:</strong>
          Após grandes clássicos e confrontos de pista, acompanhe a repercussão viral nas redes sociais (@ettorcida.oficiall / @ritmodetorcida) com notícias dinâmicas de faixas tomadas, vitórias e ocorrências policiais.
        </div>
      </div>
    ),
  },
  {
    step: 3,
    title: "Metas da Diretoria & Objetivos Sazonais",
    subtitle: "Como Cumprir Metas para Elevar a Reputação e o Caixa",
    icon: <Target className="w-5 h-5 text-amber-400" />,
    badge: "METAS & OBJETIVOS",
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
        <p>
          No início de cada temporada, a diretoria estabelece <strong className="text-amber-400">4 Metas Estratégicas</strong> prioritárias para a agremiação.
        </p>

        <div className="space-y-2 pt-1">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-bold text-amber-400 block text-[11px] mb-0.5">🎯 Tipos de Metas da Temporada:</span>
            <p className="text-[10.5px] text-zinc-400">
              Metas dinâmicas e diversificadas: <strong className="text-white">Agasalhos na Loja</strong>, <strong className="text-emerald-400">Apoio da Várzea</strong>, <strong className="text-purple-400">Desafios Interestaduais</strong> por estado, <strong className="text-orange-400">Ensaios da Bateria</strong> e <strong className="text-red-400">Confecção de Bandeirões</strong>.
            </p>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-bold text-emerald-400 block text-[11px] mb-0.5">📊 Fechamento do Ano & Auditagem:</span>
            <p className="text-[10.5px] text-zinc-400">
              Ao final de cada temporada, o balanço de metas é auditado no relatório anual. Cumprir metas garante <strong className="text-emerald-400">bônus financeiro em dinheiro</strong>, eleva a <strong className="text-amber-400">Moral</strong> e faz sua torcida subir no <strong className="text-purple-400">Ranking Nacional</strong>!
            </p>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-bold text-indigo-400 block text-[11px] mb-0.5">🏛️ Eleições da Diretoria a cada 3 Anos:</span>
            <p className="text-[10.5px] text-zinc-400">
              Nas temporadas 1, 4, 7, 10 e 13, escolha o perfil do presidente da torcida: <strong className="text-amber-400">Linha de Frente / Pista</strong> (+15% PEC), <strong className="text-emerald-400">Gestor / Comercial</strong> (+20% Faturamento) ou <strong className="text-orange-400">Mestre de Bateria / Barra Brava</strong> (+15 Pressão de Bancada), cada um com seus bônus e penalidades operacionais para o mandato.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    title: "Loja Social, Uniformes & Investimentos de Elite",
    subtitle: "Como Multiplicar o Caixa e Expandir Patrimônio",
    icon: <Shirt className="w-5 h-5 text-emerald-400" />,
    badge: "FINANÇAS & LOJA",
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
        <p>
          A nova aba <strong className="text-amber-400">Loja</strong> reúne todas as oportunidades de expansão financeira e patrimonial da agremiação:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-amber-500/40">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-amber-400 text-[11px]">🎽 CONFECÇÃO DE VESTUÁRIO</span>
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded">2X LUCRO</span>
            </div>
            <p className="text-[10.5px] text-zinc-400">
              Financie lotes de Camisas, Bermudas e Agasalhos. As vendas ocorrem ao longo do ano e retornam o <strong className="text-emerald-400">dobro do investido (2x)</strong> no Ano +1.
            </p>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-black text-white block text-[11px] mb-1">🏢 INVESTIMENTOS DE ELITE</span>
            <p className="text-[10.5px] text-zinc-400">
              Construa a Sede Social Própria, Ônibus Executivo, Loja Virtual, Galpão de Alegorias e Centro de Treinamento Ultras para bônus permanentes.
            </p>
          </div>
        </div>

        <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[10.5px]">
          <span className="text-amber-400 font-bold block mb-0.5">💡 Dica de Ouro da Diretoria:</span>
          Sempre reinvestir parte do caixa em novos lotes de vestuário na aba Loja garante um fluxo financeiro saudável para bancar comboios caros nas fases finais!
        </div>
      </div>
    ),
  },
  {
    step: 5,
    title: "Geopolítica, Alianças & Troféus de Pista",
    subtitle: "Eixos Nacionais, Diplomacia e Faixas Tomadas",
    icon: <Compass className="w-5 h-5 text-indigo-400" />,
    badge: "GEOPOLÍTICA",
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
        <p>
          Nenhuma torcida vive isolada. No cenário nacional, as agremiações organizam-se em <strong className="text-amber-400">Eixos de Alianças de Pista</strong>:
        </p>

        <div className="space-y-2 pt-1">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <strong className="text-amber-400 font-black block text-[11px] mb-0.5">🤝 Diplomacia & Eixos Nacionais:</strong>
            <p className="text-[10.5px] text-zinc-400">
              Mais de <strong className="text-amber-400">138 Torcidas Organizadas</strong> mapeadas! Abra a aba <strong className="text-white">Alianças</strong> para consultar os Eixos Nacionais (Punho Cruzado, DPA, PC, Aliança Alvinegra, União Punho Colado, Nordeste Lado A/B, Independentes) e agendar reuniões diplomáticas (+10 Moral, +10 Respeito).
            </p>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-amber-500/50">
            <strong className="text-amber-400 font-black block text-[11px] mb-0.5">🚌 A Grande Invasão (Etapa 10) & Apoio de Aliadas:</strong>
            <p className="text-[10.5px] text-zinc-400">
              Na Etapa 10, escolha entre 4 opções de viagens com ineditismo de rivais e histórico retrospectivo de pista! Em caravanas de alto risco, conte com <strong className="text-emerald-400">Apoio de Torcida Aliada</strong> (reforço de contingente irmão proporcional ao tamanho da aliada com custos embutidos).
            </p>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <strong className="text-indigo-400 font-black block text-[11px] mb-0.5">🏠 Reforço Aliado em Jogos em Casa:</strong>
            <p className="text-[10.5px] text-zinc-400">
              Caso sofra 2 derrotas seguidas para um mesmo rival no seu estádio, a torcida aliada avisa que vai marcar presença na quadra e no setor, somando forças na <strong className="text-amber-400">Massa</strong> e no <strong className="text-red-400">Poder de Pista</strong> para garantir a soberania local!
            </p>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <strong className="text-emerald-400 font-black block text-[11px] mb-0.5">🏆 Armário de Troféus & Faixas Tomadas:</strong>
            <p className="text-[10.5px] text-zinc-400">
              Vencer embates táticos contra torcidas rivais permite capturar faixas oficiais do rival (Troféus de Pista), gerando bônus permanente de Moral!
            </p>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-amber-500/40">
            <strong className="text-amber-400 font-black block text-[11px] mb-0.5">🏟️ Relações com o Clube & 🚩 Ações Sociais:</strong>
            <p className="text-[10.5px] text-zinc-400">
              Na aba <strong className="text-indigo-400">Clube</strong>, negocie cotas de ingressos, apoio de ônibus e conciliação política. Na aba <strong className="text-amber-400">Social</strong>, atraia patrocinadores locais e convoque times de bairro para encher a bancada.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 6,
    title: "Gestão de Crises, MP & Autoridades",
    subtitle: "Inquéritos Judiciais, TACs e Coletivas de Imprensa",
    icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
    badge: "SEGURANÇA & LEI",
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
        <p>
          Ações irresponsáveis e brigas de pista aumentam o indicador <strong className="text-red-400">Risco MP (Ministério Público)</strong>.
        </p>

        <div className="space-y-2 pt-1">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-bold text-amber-400 block text-[11px] mb-0.5">⚠️ 1º Estágio: Aviso Judicial / TAC</span>
            <p className="text-[10.5px] text-zinc-400">
              Ao atingir alto Risco MP, a diretoria será convocada para assinar um Termo de Ajustamento de Conduta (TAC) perante as autoridades.
            </p>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="font-bold text-red-400 block text-[11px] mb-0.5">⚖️ 2º Estágio: Punições & Restrições de Bancada</span>
            <p className="text-[10.5px] text-zinc-400">
              Caso o Risco MP continue subindo, a agremiação sofrerá sanções pesadas, podendo ter materiais e festas veto-restringidos pelas autoridades.
            </p>
          </div>
        </div>

        <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[10.5px] text-zinc-400">
          <strong className="text-indigo-400 font-black block mb-0.5">🎤 Coletiva de Imprensa & Inquérito:</strong>
          Responda aos jornalistas com sabedoria diplomática para acalmar os juízes e recuperar o respaldo das autoridades!
        </div>
      </div>
    ),
  },
  {
    step: 7,
    title: "Aba Perfil, Central Beta & Backup do Jogo",
    subtitle: "Como Pedir Torcidas, Relatar Bugs e Proteger seu Save JSON",
    icon: <Download className="w-5 h-5 text-emerald-400" />,
    badge: "PERFIL & BETA",
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-2.5 space-y-1">
          <strong className="text-amber-400 font-black block text-[11px] uppercase">
            🧪 Versão Beta • Pedir Torcidas, Sugestões e Bugs:
          </strong>
          <p className="text-[10.5px] text-zinc-300">
            Estamos com <strong className="text-amber-300">atualizações constantes</strong>! Clique na aba <strong className="text-blue-400">PERFIL</strong> (sinalizada com a bolinha de aviso no menu) para encontrar o painel em destaque onde você pode <strong className="text-white">pedir a inclusão de novas torcidas</strong>, <strong className="text-white">sugerir mudanças</strong> ou <strong className="text-white">informar qualquer bug</strong>.
          </p>
        </div>

        <p>
          Na mesma aba <strong className="text-blue-400">PERFIL</strong>, você também protege o progresso da sua agremiação usando o backup em <strong className="text-emerald-400">Save JSON</strong>:
        </p>

        <div className="space-y-2 pt-0.5">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <strong className="text-emerald-400 font-bold block text-[11px]">📥 Exportar Save JSON</strong>
              <span className="text-[10.5px] text-zinc-400">Baixa um arquivo `.json` completo com todos os dados da sua torcida.</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <strong className="text-amber-400 font-bold block text-[11px]">📤 Importar Save JSON</strong>
              <span className="text-[10.5px] text-zinc-400">Carrega o arquivo salvo no menu inicial ou na aba Perfil para restaurar o jogo.</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-center text-emerald-300 font-black text-xs">
          🏆 Pronto para liderar sua agremiação rumo ao topo do Ranking Nacional de Torcidas?
        </div>
      </div>
    ),
  },
];

export function GameTutorialModal({ isOpen, onClose }: GameTutorialModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[110] animate-fade-in">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl flex flex-col justify-between max-h-[90vh] relative overflow-hidden">
        {/* Top Gradient Accent Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              {currentStep.icon}
            </div>
            <div>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                PASSO {currentStep.step} DE {TUTORIAL_STEPS.length} • {currentStep.badge}
              </span>
              <h3 className="text-sm font-black text-white uppercase mt-0.5">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Fechar Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitle */}
        <div className="pt-2 text-[11px] font-bold text-amber-300">
          {currentStep.subtitle}
        </div>

        {/* Step Body Content */}
        <div className="py-3 my-1 overflow-y-auto max-h-[55vh] pr-1">
          {currentStep.content}
        </div>

        {/* Navigation Controls Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex ? "w-6 bg-amber-500" : "w-2 bg-zinc-800 hover:bg-zinc-700"
                }`}
                title={`Ir para o Passo ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95 ${
                isLastStep
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-black hover:from-emerald-400 hover:to-emerald-300"
                  : "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400"
              }`}
            >
              <span>{isLastStep ? "Concluir Tutorial" : "Próximo"}</span>
              {isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
