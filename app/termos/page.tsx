import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Bancada Simulator",
  description: "Termos de uso e aviso legal do Bancada Simulator.",
};

export default function TermosPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 text-zinc-300 text-sm leading-relaxed space-y-4">
      <Link href="/bancada" className="text-amber-400 text-xs font-bold">← Voltar ao jogo</Link>
      <h1 className="text-xl font-black text-white uppercase">Termos de Uso & Aviso Legal</h1>
      <p className="text-xs text-zinc-500">Última atualização: outubro de 2026</p>

      <h2 className="font-black text-white pt-2">1. Obra de ficção e paródia</h2>
      <p>
        O Bancada Simulator é um <strong>jogo de simulação ficcional</strong> de humor e
        entretenimento. Eventos, rivalidades, pontuações, confrontos e crônicas são
        <strong> inventados</strong> e não representam fatos reais.
      </p>

      <h2 className="font-black text-white pt-2">2. Sem vínculo oficial</h2>
      <p>
        Nomes de clubes, torcidas e estádios são citados apenas para fins de referência cultural.
        O jogo <strong>não possui qualquer vínculo, patrocínio ou endosso</strong> de clubes,
        federações, torcidas organizadas ou seus integrantes. Marcas pertencem a seus respectivos
        titulares. Se você representa alguma entidade citada e deseja solicitar ajuste ou remoção,
        escreva para <a className="text-amber-400" href="mailto:contato@kaversgames.com.br">contato@kaversgames.com.br</a>.
      </p>

      <h2 className="font-black text-white pt-2">3. Sem incentivo à violência</h2>
      <p>
        O jogo trata de forma ficcional temas de rivalidade e confronto. <strong>Não incentiva,
        promove ou defende</strong> violência, vandalismo ou qualquer conduta ilegal no mundo real.
        Torça com respeito.
      </p>

      <h2 className="font-black text-white pt-2">4. Classificação etária</h2>
      <p>
        O conteúdo é destinado a <strong>maiores de 18 anos</strong>. Ao entrar, você declara ter
        18 anos ou mais.
      </p>

      <h2 className="font-black text-white pt-2">5. Uso</h2>
      <p>
        O jogo é oferecido &quot;como está&quot;, sem garantias. O progresso é salvo localmente no
        seu navegador e pode ser perdido. Kavers Games pode alterar ou encerrar o serviço a qualquer momento.
      </p>

      <p className="pt-2">
        Veja também a <Link href="/privacidade" className="text-amber-400">Política de Privacidade</Link>.
      </p>
    </main>
  );
}
