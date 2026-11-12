import type { Metadata } from "next";
import { Aprovar, type ItemAprovar } from "@/components/marina/aprovar";
import { getRespostas } from "@/lib/marina/queries/aprovacoes";
import { NO_AR, NO_AR_TOPO } from "./dados";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marina Saleme · Anúncios no ar",
  description: "O que está rodando hoje, para manter ou tirar.",
  robots: { index: false, follow: false },
};

export default async function AprovarNoArPage() {
  const salvas = await getRespostas("no-ar");

  const itens: ItemAprovar[] = [...NO_AR, ...NO_AR_TOPO].map((a) => ({
    id: a.id,
    nome: a.nome,
    meta: `${a.formato} · ${a.campanha} · ${a.gasto} e ${a.impressoes} impressões nos últimos 7 dias`,
    texto: a.texto,
    titulo: a.titulo,
    botao: a.botao,
    midia: a.midia,
  }));

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
      <header className="mx-auto max-w-[760px] border-b-2 border-neutral-900 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#F15839]">
          Marina Saleme · Aprovação
        </p>
        <h1 className="mt-3 font-serif text-[32px] leading-[1.1] text-neutral-900 sm:text-[40px]">
          Os anúncios que estão no ar hoje
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
          São {itens.length} anúncios rodando agora, do jeito que aparecem no
          celular. Em cada um, diga se <strong className="font-semibold text-neutral-900">mantém</strong> ou
          se <strong className="font-semibold text-neutral-900">tira</strong>. Se quiser explicar alguma
          coisa, tem um campo de comentário.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
          A resposta salva sozinha assim que você toca, e dá para voltar e
          mudar depois. No fim tem o botão para copiar tudo e colar no
          WhatsApp. Os {NO_AR.length} primeiros são a campanha de vendas de
          novembro; os {NO_AR_TOPO.length} últimos são os de alcance e tráfego,
          que rodam desde junho.
        </p>
      </header>

      <div className="mt-6">
        <Aprovar
          link="no-ar"
          titulo="Marina Saleme · anúncios no ar"
          itens={itens}
          salvas={salvas}
        />
      </div>

      <footer className="mx-auto mt-14 max-w-[760px] border-t border-neutral-200 pt-5 text-[12.5px] leading-relaxed text-neutral-500">
        Dose de Growth · Dados do Meta em 12 de novembro de 2026, conta Marina
        Saleme - 02. Todas as imagens foram conferidas uma a uma: nenhuma é
        foto de peça sozinha, todas têm modelo.
      </footer>
    </main>
  );
}
