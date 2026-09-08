import Link from "next/link";
import { notFound } from "next/navigation";
import type { Lancha } from "@/lib/dados";
import { BRL, ROTULO, SLUGS, dados, getLancha, pendente } from "@/lib/dados";

export function generateStaticParams() {
  return SLUGS.map((lancha) => ({ lancha }));
}

/**
 * Esqueleto da LP. Cada <Secao> abaixo é uma das dez da estrutura do
 * BRIEFING-LP.md, na ordem por objeção. O conteúdo real entra por instrução —
 * o que já está aqui é a moldura, os dados ligados e o aviso do que trava.
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
    <main className="mx-auto max-w-3xl px-6 py-10">
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
        <p className="mt-3 font-[family-name:var(--vpp-display)] text-5xl text-[var(--vpp-sol)]">
          {BRL.format(lancha.preco_fechado)}
        </p>
        <p className="mt-1 text-[var(--vpp-neutro-2)]">a lancha fechada</p>
        <p className="mt-4 max-w-prose text-lg">{lancha.vende}</p>
      </header>

      <Secao n={1} titulo="Hero — a conta" />
      <Secao n={2} titulo="Escolha o barco" />
      <Secao n={3} titulo="Os três roteiros, com as paradas nomeadas">
        <ul className="space-y-3">
          {dados.roteiros.map((r) => (
            <li key={r.id}>
              <span className="font-medium">{r.nome}</span>
              <span className="text-[var(--vpp-neutro-2)]">
                {" "}
                — {r.paradas.length} paradas
              </span>
            </li>
          ))}
        </ul>
      </Secao>
      <Secao n={4} titulo="O que está incluso, o que não está" />
      <Secao n={5} titulo="Privativo × compartilhada × escuna" />
      <Secao n={6} titulo="As perguntas que ninguém responde" />
      <Secao n={7} titulo="“Vai ter barco no dia?”" />
      <Secao n={8} titulo="Quem leva vocês" />
      <Secao n={9} titulo="Como reserva" />
      <Secao n={10} titulo="FAQ + CTA fixo" />

      <Travas lancha={lancha} />
    </main>
  );
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

/** Lista o que ainda impede esta lancha de ir pro ar. Some quando zerar. */
function Travas({ lancha }: { lancha: Lancha }) {
  const travas: [string, unknown][] = [
    ["WhatsApp", dados.marca.whatsapp],
    ["Duração do passeio", dados.operacao.duracao_horas],
    ["O que está incluso", dados.operacao.incluso],
    ["Sinal", dados.operacao.sinal],
    ["Política de chuva", dados.operacao.politica_chuva],
    ["Política de cancelamento", dados.operacao.politica_cancelamento],
    ["Marinheiros", dados.operacao.marinheiros],
    ["Documentos", dados.operacao.documentos],
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
