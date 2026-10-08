import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Bancada Simulator",
  description: "Como o Bancada Simulator trata seus dados.",
};

export default function PrivacidadePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 text-zinc-300 text-sm leading-relaxed space-y-4">
      <Link href="/bancada" className="text-amber-400 text-xs font-bold">← Voltar ao jogo</Link>
      <h1 className="text-xl font-black text-white uppercase">Política de Privacidade</h1>
      <p className="text-xs text-zinc-500">Última atualização: outubro de 2026</p>

      <h2 className="font-black text-white pt-2">1. Dados que coletamos</h2>
      <p>
        O Bancada Simulator <strong>não exige cadastro</strong> e não coleta nome, CPF, e-mail,
        documentos ou qualquer dado pessoal identificável.
      </p>

      <h2 className="font-black text-white pt-2">2. Armazenamento local</h2>
      <p>
        Seu progresso de jogo, preferência de tema e a confirmação de idade (18+) ficam salvos
        apenas no <strong>navegador do seu dispositivo</strong> (<code>localStorage</code>). Esses
        dados não são enviados aos nossos servidores. Limpar os dados do navegador apaga o progresso.
        Você pode exportar e importar seu save em arquivo JSON.
      </p>

      <h2 className="font-black text-white pt-2">3. Crônicas geradas por IA</h2>
      <p>
        Para escrever a crônica de cada jogo, os dados da partida (nome da torcida, clube, rival,
        placar e tática) podem ser enviados a um serviço de inteligência artificial de terceiros
        (Google Gemini). Nenhum dado pessoal seu é incluído nesse envio.
      </p>

      <h2 className="font-black text-white pt-2">4. Anúncios</h2>
      <p>
        O jogo exibe vídeo publicitário da própria Kavers Games, com link para produto em
        marketplace de terceiros (Shopee). Ao clicar, você é direcionado a um site externo, sujeito
        à política de privacidade daquele site.
      </p>

      <h2 className="font-black text-white pt-2">5. Idade mínima</h2>
      <p>
        O conteúdo é destinado a maiores de 18 anos. A confirmação de idade é uma autodeclaração.
      </p>

      <h2 className="font-black text-white pt-2">6. Contato</h2>
      <p>
        Dúvidas ou solicitações: <a className="text-amber-400" href="mailto:contato@kaversgames.com.br">contato@kaversgames.com.br</a>.
      </p>
    </main>
  );
}
