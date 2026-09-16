import React, { useState } from 'react';
import { TeamInfo } from '../types';
import { 
  Palette, 
  Download, 
  Check, 
  Copy, 
  Code2, 
  RotateCcw, 
  Sparkles,
  Link,
  Shield,
  Flag
} from 'lucide-react';
import { downloadProjectZip } from '../utils/zipExporter';
import { saveGameIntegrationTheme } from '../config/gameIntegration';

interface GameColorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  onUpdateHomeTeam: (team: TeamInfo) => void;
  onUpdateAwayTeam: (team: TeamInfo) => void;
}

export const GameColorConfigModal: React.FC<GameColorConfigModalProps> = ({
  isOpen,
  onClose,
  homeTeam,
  awayTeam,
  onUpdateHomeTeam,
  onUpdateAwayTeam,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'integration' | 'download'>('colors');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipSuccess, setZipSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Atualizadores de cor do mandante
  const handleHomeColorChange = (key: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    const updated = { ...homeTeam, [key]: value };
    onUpdateHomeTeam(updated);
    saveGameIntegrationTheme({ homeTeam: updated, awayTeam });
  };

  // Atualizadores de cor do visitante
  const handleAwayColorChange = (key: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    const updated = { ...awayTeam, [key]: value };
    onUpdateAwayTeam(updated);
    saveGameIntegrationTheme({ homeTeam, awayTeam: updated });
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip({ homeTeam, awayTeam });
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao gerar ZIP:', err);
      alert('Erro ao gerar o arquivo ZIP. Tente novamente.');
    } finally {
      setIsZipping(false);
    }
  };

  // Código para integração
  const integrationSnippet = `// 1. No seu jogo, passe as cores para o Bancada Simulator via postMessage (se em iframe):
const iframe = document.getElementById('bancada-frame');
iframe.contentWindow.postMessage({
  type: 'BANCADA_SET_TEAMS',
  homeTeam: {
    name: '${homeTeam.name}',
    primaryColor: '${homeTeam.primaryColor}',   // Camisas e bandeirão
    secondaryColor: '${homeTeam.secondaryColor}', // Faixas e faixas verticais
    accentColor: '${homeTeam.accentColor}',    // Mosaico e fumaça
    stadium: '${homeTeam.stadium}',
    baseStrength: ${homeTeam.baseStrength}
  },
  awayTeam: {
    name: '${awayTeam.name}',
    primaryColor: '${awayTeam.primaryColor}',
    secondaryColor: '${awayTeam.secondaryColor}',
    baseStrength: ${awayTeam.baseStrength}
  }
}, '*');

// 2. Ou via URL direta:
// ?homeName=${encodeURIComponent(homeTeam.name)}&homePrimary=${encodeURIComponent(homeTeam.primaryColor)}&homeSecondary=${encodeURIComponent(homeTeam.secondaryColor)}&homeAccent=${encodeURIComponent(homeTeam.accentColor)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(integrationSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">🎨</span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Vincular Cores do Seu Jogo & Baixar ZIP
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalize as cores da torcida e do time para o seu jogo ou exporte o projeto completo compactado.
            </p>
          </div>
          <button
            type="button"
            id="btn-close-colors-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'colors'
                ? 'border-amber-400 text-amber-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Cores da Torcida & Time</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integration')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'integration'
                ? 'border-amber-400 text-amber-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Como Vincular ao Jogo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'download'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Projeto ZIP</span>
          </button>
        </div>

        {/* Conteúdo Aba 1: Cores da Torcida e do Time */}
        {activeTab === 'colors' && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Seção Mandante (Torcida) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-400 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Flag className="w-4 h-4" /> Time da Casa & Cores da Torcida
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Bancada, Faixas, Bandeirão e Ataque
                </span>
              </div>

              {/* Nome do Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">
                    Nome do Clube:
                  </label>
                  <input
                    type="text"
                    value={homeTeam.name}
                    onChange={(e) => {
                      const updated = { ...homeTeam, name: e.target.value };
                      onUpdateHomeTeam(updated);
                      saveGameIntegrationTheme({ homeTeam: updated, awayTeam });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">
                    Estádio:
                  </label>
                  <input
                    type="text"
                    value={homeTeam.stadium}
                    onChange={(e) => {
                      const updated = { ...homeTeam, stadium: e.target.value };
                      onUpdateHomeTeam(updated);
                      saveGameIntegrationTheme({ homeTeam: updated, awayTeam });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                  />
                </div>
              </div>

              {/* Seletor das 3 Cores do Time Mandante */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {/* Cor Primária */}
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1.5">
                  <span className="text-[10px] text-slate-300 font-black uppercase">
                    Camisas & Fumaça
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="input-home-primary"
                      value={homeTeam.primaryColor}
                      onChange={(e) => handleHomeColorChange('primaryColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={homeTeam.primaryColor}
                      onChange={(e) => handleHomeColorChange('primaryColor', e.target.value)}
                      className="w-16 bg-black/60 border border-slate-700 text-[10px] font-mono text-center rounded px-1 py-0.5 text-white"
                    />
                  </div>
                </div>

                {/* Cor Secundária */}
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1.5">
                  <span className="text-[10px] text-slate-300 font-black uppercase">
                    Faixas & Degraus
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="input-home-secondary"
                      value={homeTeam.secondaryColor}
                      onChange={(e) => handleHomeColorChange('secondaryColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={homeTeam.secondaryColor}
                      onChange={(e) => handleHomeColorChange('secondaryColor', e.target.value)}
                      className="w-16 bg-black/60 border border-slate-700 text-[10px] font-mono text-center rounded px-1 py-0.5 text-white"
                    />
                  </div>
                </div>

                {/* Cor de Destaque */}
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1.5">
                  <span className="text-[10px] text-slate-300 font-black uppercase">
                    Mosaico & Bordas
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="input-home-accent"
                      value={homeTeam.accentColor}
                      onChange={(e) => handleHomeColorChange('accentColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={homeTeam.accentColor}
                      onChange={(e) => handleHomeColorChange('accentColor', e.target.value)}
                      className="w-16 bg-black/60 border border-slate-700 text-[10px] font-mono text-center rounded px-1 py-0.5 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção Visitante (Adversário) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-rose-400 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Time Adversário (Visitante)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Defensores no campinho
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">
                    Nome do Adversário:
                  </label>
                  <input
                    type="text"
                    value={awayTeam.name}
                    onChange={(e) => {
                      const updated = { ...awayTeam, name: e.target.value };
                      onUpdateAwayTeam(updated);
                      saveGameIntegrationTheme({ homeTeam, awayTeam: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Cor Principal</span>
                    <input
                      type="color"
                      id="input-away-primary"
                      value={awayTeam.primaryColor}
                      onChange={(e) => handleAwayColorChange('primaryColor', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Cor Secundária</span>
                    <input
                      type="color"
                      id="input-away-secondary"
                      value={awayTeam.secondaryColor}
                      onChange={(e) => handleAwayColorChange('secondaryColor', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dica de Persistência */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                As cores alteradas são aplicadas instantaneamente em toda a bancada, bandeirões, fumaça e campinho, e salvas no arquivo <strong className="font-mono text-white">src/config/gameIntegration.ts</strong>!
              </span>
            </div>
          </div>
        )}

        {/* Conteúdo Aba 2: Como Vincular ao Jogo */}
        {activeTab === 'integration' && (
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <Link className="w-4 h-4" /> Integração no seu Jogo
              </h4>
              <p>
                Você pode acoplar o Bancada Simulator ao seu jogo de duas maneiras:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                <li>
                  <strong>Arquivo de Configuração:</strong> O arquivo <code className="text-amber-400 bg-black/40 px-1 py-0.5 rounded font-mono">src/config/gameIntegration.ts</code> armazena as cores e nomes padrão para você substituir com os dados do seu jogo.
                </li>
                <li>
                  <strong>Iframe & postMessage:</strong> Se você embutir o simulador no seu jogo através de um <code className="text-amber-400 bg-black/40 px-1 py-0.5 rounded font-mono">&lt;iframe&gt;</code>, basta enviar a mensagem com as cores!
                </li>
              </ul>
            </div>

            <div className="relative">
              <pre className="p-3.5 bg-black rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {integrationSnippet}
              </pre>
              <button
                type="button"
                onClick={copyToClipboard}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white flex items-center gap-1 border border-slate-700 shadow"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo Aba 3: Baixar ZIP */}
        {activeTab === 'download' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl text-emerald-400">
                📦
              </div>
              <div>
                <h4 className="font-black text-base text-white">
                  Baixar Projeto Completo em ZIP
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Gera um pacote .ZIP contendo todos os componentes React, estilos Tailwind, motor matemático (75%/25%), efeitos sonoros e o arquivo de configuração com as cores atuais do seu jogo.
                </p>
              </div>

              {zipSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-bounce">
                  <Check className="w-4 h-4" />
                  <span>Download iniciado com sucesso! Verifique a pasta de downloads.</span>
                </div>
              )}

              <button
                type="button"
                id="btn-confirm-download-zip"
                disabled={isZipping}
                onClick={handleDownloadZip}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Compactando Arquivos...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Baixar bancada-simulator.zip</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <p className="font-bold text-slate-300 mb-1">Conteúdo do arquivo ZIP:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Código completo em React 19 + TypeScript + Vite + Tailwind CSS</li>
                <li>Arquivo de configuração <code className="text-amber-400 font-mono">src/config/gameIntegration.ts</code> com suas cores personalizadas</li>
                <li>Componentes de Arquibancada, Campinho Tático, Recepção do Ônibus e Motor de Simulação</li>
                <li>README.md com instruções passo a passo para rodar com <code className="text-white font-mono">npm install && npm run dev</code></li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer do Modal */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Cores ativas:{' '}
            <span
              className="inline-block w-3 h-3 rounded-full align-middle mx-1 border border-white/20"
              style={{ backgroundColor: homeTeam.primaryColor }}
            />
            <strong className="text-white">{homeTeam.name}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar ZIP</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide transition"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
