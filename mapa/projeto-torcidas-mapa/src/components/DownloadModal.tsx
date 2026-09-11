import React, { useState } from 'react';
import { 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  FolderArchive, 
  Terminal, 
  X, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const directUrl = `${window.location.origin}/projeto-torcidas-mapa.zip`;

  const handleBlobDownload = async (filename: string) => {
    try {
      setDownloading(true);
      setStatusMessage('Preparando arquivo verificado...');
      
      const response = await fetch(`/${filename}`, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      if (blob.size < 1000) {
        throw new Error('Arquivo recebido incompleto');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setStatusMessage('Download iniciado com sucesso!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setStatusMessage('Abrindo download em nova aba para contornar restrições do navegador...');
      window.open(`/${filename}`, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-200 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Syne',sans-serif]">
                Exportar Projeto para o Antigravity
              </h2>
              <p className="text-xs text-slate-400">
                Arquivo .ZIP verificado e calibrado para Windows, macOS e Linux
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Download Options */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Primary Download Button */}
            <button
              onClick={() => handleBlobDownload('projeto-torcidas-mapa.zip')}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Baixando...' : 'Baixar ZIP (Windows / Pasta)'}</span>
            </button>

            {/* Open in New Tab Button (Bypasses iframe sandboxes) */}
            <a
              href="/projeto-torcidas-mapa.zip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Abre o download direto em uma nova aba do navegador"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>Nova Aba</span>
            </a>
          </div>

          {/* Alternative Direct Root Format */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-300 font-medium">Formato sem subpasta:</span>
              <span className="text-[11px] font-mono text-slate-400">projeto-torcidas-direto.zip</span>
            </div>
            <button
              onClick={() => handleBlobDownload('projeto-torcidas-direto.zip')}
              className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 rounded-xl transition-all cursor-pointer"
            >
              Baixar Alternativo
            </button>
          </div>
        </div>

        {/* Direct Link Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Link Direto de Download
          </span>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={directUrl}
              className="flex-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Windows Extraction Guide */}
        <div className="bg-slate-950/40 border border-slate-800/70 rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Como extrair no Windows sem erros:</span>
          </div>
          <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
            <li>Após baixar, vá na sua pasta <strong>Downloads</strong>.</li>
            <li>Clique com o <strong>botão direito</strong> no arquivo <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">projeto-torcidas-mapa.zip</code>.</li>
            <li>Selecione <strong>"Extrair Tudo..."</strong> (ou use 7-Zip / WinRAR) e clique em <strong>Extrair</strong>.</li>
            <li>Abra a pasta extraída no <strong>Antigravity</strong> (ou no terminal) e rode:</li>
          </ol>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>npm install && npm run dev</span>
          </div>
        </div>
      </div>
    </div>
  );
};
