import Link from "next/link";
import { notFound } from "next/navigation";
import type { Lancha } from "@/lib/dados";
import {
  ROTULO,
  SLUGS,
  dados,
  getLancha,
  linkWhatsApp,
  pendente,
} from "@/lib/dados";

export function generateStaticParams() {
  return SLUGS.map((lancha) => ({ lancha }));
}

/**
 * Esqueleto da LP. As dez seções seguem a ordem por objeção do BRIEFING-LP.md.
 * Sem valores em lugar nenhum: o eixo é privativo × dividir o barco com
 * estranho, vendido por lotação, roteiro e liberdade. Preço, só no WhatsApp.
 */
export default async function LanchaPage({
  params,
}: {
  params: Promise<{ lancha: string }>;
}) {
  const { lancha: slug } = await params;
  const lancha = getLancha(slug);
  if (!lancha) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 pb-28">
      <nav className="flex gap-2 text-sm">
        {SLUGS.map((s) => (
          <Link
            key={s}
            href={`/${s}`}
            className={
              s === slug
                ? "rounded bg-[var(--vpp-agua)] px-3 py-1 font-medium text-[var(--vpp-navy-900)]"
                : "rounded px-3 py-1 text-[var(--vpp-neutro-2)] hover:text-[var(--vpp-areia)]"
            }
          >
            {ROTULO[s]}
          </Link>
        ))}
      </nav>

      <header className="mt-8">
        <p className="text-sm tracking-wide text-[var(--vpp-neutro-2)]">
          {lancha.pes} pés · lancha privativa · saída do cais de Paraty
        </p>
        <h1 className="mt-3 max-w-prose font-[family-name:var(--vpp-serif)] text-4xl leading-tight">
          {lancha.vende}
        </h1>
        <Ficha lancha={lancha} />
      </header>

      <Secao n={1} titulo="O barco é de vocês" />
      <Secao n={2} titulo="Escolha o barco" />
      <Secao n={3} titulo="Os roteiros">
        <ul className="space-y-3">
          {dados.roteiros.map((r) => (
            <li key={r.id}>
              <span className="font-medium">{r.nome}</span>
              {r.paradas.length > 0 ? (
                <span className="text-[var(--vpp-neutro-2)]">
                  {" "}
                  — {r.paradas.join(", ")}
                </span>
              ) : (
                <span className="text-[var(--vpp-neutro-2)]">
                  {" "}
                  — monte o dia de vocês
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--vpp-neutro)]">
          São sugestões, não pacotes. Sem prometer duração nem número de paradas.
        </p>
      </Secao>
      <Secao n={4} titulo="O que vai a bordo">
        <ul className="grid gap-2 sm:grid-cols-2">
          {dados.operacao.incluso.map((i) => (
            <li key={i.item} className="flex gap-2">
              <span className="text-[var(--vpp-agua)]">·</span>
              {i.item}
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-prose text-sm text-[var(--vpp-neutro-2)]">
          Comida e bebida ficam por conta de vocês — tragam o que quiserem.
          O almoço nas ilhas é opcional e pago direto no restaurante.
        </p>
      </Secao>
      <Secao n={5} titulo="Privativo × dividir o barco" />
      <Secao n={6} titulo="As perguntas que ninguém responde">
        <dl className="space-y-5">
          {perguntas(lancha).map(([p, r]) => (
            <div key={p}>
              <dt className="font-medium">{p}</dt>
              <dd className="mt-1 max-w-prose text-[var(--vpp-neutro-2)]">{r}</dd>
            </div>
          ))}
        </dl>
      </Secao>
      <Secao n={7} titulo="“Vai ter barco no dia?”">
        <p className="max-w-prose">
          A frota é nossa. Boa parte de quem vende passeio em Paraty é agência
          revendendo barco de terceiro — e é aí que o grupo chega no cais e
          descobre que não tem embarcação. Aqui o barco que vocês reservam é o
          barco que sai.
        </p>
      </Secao>
      <Secao n={8} titulo="Como reserva">
        <p className="max-w-prose">
          Chamem no WhatsApp com a data e quantas pessoas vão. A gente confere a
          agenda e combina o resto por lá.
        </p>
        <p className="mt-4 max-w-prose text-[var(--vpp-neutro-2)]">
          {dados.operacao.politica_chuva} Isso vale tanto pra chuva quanto pra
          mudança de planos.
        </p>
        <p className="mt-4 max-w-prose text-sm text-[var(--vpp-neutro)]">
          Nas paradas e nas ilhas o pagamento costuma ser só em dinheiro — vale
          levar trocado.
        </p>
      </Secao>
      <Secao n={9} titulo="FAQ" />

      <Travas lancha={lancha} />
      <CtaFixo slug={slug} />
    </main>
  );
}

/** Os fatos do barco que podem ser ditos hoje. Nenhum deles é valor. */
function Ficha({ lancha }: { lancha: Lancha }) {
  const itens: string[] = [];
  if (!pendente(lancha.lotacao)) itens.push(`Até ${lancha.lotacao} passageiros`);
  if (lancha.marinheiro_ocupa_vaga === false)
    itens.push("O marinheiro não ocupa vaga");
  if (lancha.minimo) itens.push(`Mínimo de ${lancha.minimo} pessoas`);
  if (lancha.banheiro) itens.push("Banheiro a bordo");
  if ("suite" in lancha && lancha.suite) itens.push("Suíte");

  if (!itens.length) return null;

  return (
    <ul className="mt-6 flex flex-wrap gap-2 text-sm">
      {itens.map((i) => (
        <li
          key={i}
          className="rounded-full border border-[var(--vpp-navy-600)] px-3 py-1"
        >
          {i}
        </li>
      ))}
    </ul>
  );
}

/**
 * As seis perguntas que a pesquisa achou no mercado real e que nenhum anúncio
 * da praça responde. Duas delas variam por barco.
 */
function perguntas(lancha: Lancha): [string, string][] {
  const cabem = pendente(lancha.lotacao)
    ? "O marinheiro não ocupa vaga."
    : `Até ${lancha.lotacao} passageiros, e o marinheiro não ocupa vaga.`;

  return [
    [
      "Cabem quantas pessoas?",
      `${cabem} Criança conta como passageiro, inclusive bebê de colo — não existe meia-vaga.`,
    ],
    [
      "Tem colete pra criança?",
      "Tem, por faixa de peso. É exigência da Marinha e vai a bordo.",
    ],
    [
      "Vai ter mais alguém no barco?",
      "Não. O barco é de vocês e do marinheiro. Ninguém embarca no meio do caminho, e o roteiro é de quem fechou.",
    ],
    [
      "Tem banheiro a bordo?",
      lancha.banheiro
        ? "Tem, e ainda tem suíte — pra trocar de roupa, a criança dormir ou fugir do sol."
        : "Não. O roteiro passa por praias e ilhas com estrutura, e a parada é combinada com o marinheiro.",
    ],
    [
      "Dá enjoo?",
      "A baía de Paraty é abrigada, com pouca onda. É bem diferente de navegar em mar aberto.",
    ],
    ["E se chover?", dados.operacao.politica_chuva ?? ""],
  ];
}

function Secao({
  n,
  titulo,
  children,
}: {
  n: number;
  titulo: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-[var(--vpp-navy-600)] pt-6">
      <h2 className="font-[family-name:var(--vpp-serif)] text-2xl">
        <span className="mr-2 text-[var(--vpp-neutro)]">{n}</span>
        {titulo}
      </h2>
      <div className="mt-4">
        {children ?? (
          <p className="text-sm text-[var(--vpp-neutro)]">
            A escrever. Origem e propósito da seção no BRIEFING-LP.md.
          </p>
        )}
      </div>
    </section>
  );
}

function CtaFixo({ slug }: { slug: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-[var(--vpp-navy-600)] bg-[var(--vpp-navy-800)] p-4">
      <a
        href={linkWhatsApp(slug)}
        className="mx-auto block max-w-sm rounded bg-[var(--vpp-zap)] px-6 py-3 text-center font-medium text-white"
      >
        Falar no WhatsApp
      </a>
    </div>
  );
}

/** Lista o que ainda impede esta lancha de ir pro ar. Some quando zerar. */
function Travas({ lancha }: { lancha: Lancha }) {
  const travas: [string, unknown][] = [
    ["Número do WhatsApp", dados.marca.whatsapp],
    ["Política de chuva", dados.operacao.politica_chuva],
    ["Política de cancelamento", dados.operacao.politica_cancelamento],
    ["Lotação", lancha.lotacao],
  ];
  const abertas = travas.filter(([, v]) => pendente(v));

  if (!abertas.length) return null;

  return (
    <aside className="mt-14 rounded border border-[var(--vpp-sol)]/40 p-5 text-sm">
      <p className="font-medium text-[var(--vpp-sol)]">
        Trava publicação ({abertas.length})
      </p>
      <ul className="mt-3 space-y-1 text-[var(--vpp-neutro-2)]">
        {abertas.map(([k]) => (
          <li key={k}>{k}</li>
        ))}
      </ul>
    </aside>
  );
}
