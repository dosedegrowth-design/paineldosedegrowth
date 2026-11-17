import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../relatorio.css";
import { relatorioDoToken } from "@/lib/tayssa/queries/gestao";
import { ROUTES } from "@/lib/tayssa/config";
import { FORMAS, LISTA_FORMAS, SITUACAO_PAGAMENTO, brl } from "@/lib/tayssa/financeiro";

/**
 * O relatório que vai para a Larissa (17/11/2026): a página que o link do
 * WhatsApp abre. Pública só com o token (aleatório, só o hash fica no
 * banco), revogável pelo painel, e mostra a foto do fechamento na hora em
 * que o link foi gerado. Cliente aparece só pelo primeiro nome e a inicial.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Relatório · Tayssa Farias",
  robots: { index: false, follow: false },
};

function dataBr(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}
const pct = (n: number) => `${String(n).replace(".", ",")}%`;

export default async function RelatorioCompartilhado({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await relatorioDoToken(token);
  if (r.estado === "nao_existe") notFound();
  if (r.estado === "revogado") {
    return (
      <main className="tyrel">
        <div className="tyrel__papel tyrel__papel--aviso">
          <p className="tyrel__marca">Tayssa Farias</p>
          <h1>Este link foi desativado</h1>
          <p>A Tayssa desativou este relatório. Peça a ela um link novo.</p>
        </div>
      </main>
    );
  }
  const d = r.dados;
  const s = d.resumo;
  const gerado = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d.geradoEm));

  return (
    <main className="tyrel">
      <article className="tyrel__papel">
        <header className="tyrel__topo">
          <div>
            <p className="tyrel__marca">{d.negocio}</p>
            <p className="tyrel__sub">Relatório de atendimentos e financeiro</p>
          </div>
          <div className="tyrel__periodo">
            <h1>{d.periodo.rotulo}</h1>
            <p>{d.periodo.de === d.periodo.ate ? dataBr(d.periodo.de) : `${dataBr(d.periodo.de)} a ${dataBr(d.periodo.ate)}`}</p>
            <p>Gerado em {gerado}</p>
          </div>
        </header>

        <section className="tyrel__secao">
          <h2>Resumo</h2>
          <div className="tyrel__numeros">
            <div>
              <span>Atendimentos realizados</span>
              <b>{s.atendimentos}</b>
            </div>
            <div>
              <span>Clientes atendidas</span>
              <b>{s.clientes}</b>
            </div>
            <div>
              <span>Faturamento bruto</span>
              <b>{brl(s.bruto)}</b>
            </div>
            <div>
              <span>Ticket médio</span>
              <b>{brl(s.ticketMedio)}</b>
            </div>
            <div>
              <span>Recebido</span>
              <b>{brl(s.recebido)}</b>
            </div>
            <div>
              <span>Pendente</span>
              <b>{brl(s.pendente)}</b>
            </div>
          </div>
        </section>

        <section className="tyrel__secao">
          <h2>Divisão</h2>
          <div className="tyrel__divisao">
            {[
              { nome: "Tayssa", p: s.tayssa },
              { nome: d.larissa, p: s.larissa },
            ].map(({ nome, p }) => (
              <div key={nome} className="tyrel__parte">
                <p>
                  <b>{nome}</b> <span>{pct(p.pct)}</span>
                </p>
                <strong>{brl(p.bruto)}</strong>
                <p className="tyrel__detalhe">
                  já recebido {brl(p.recebido)} · a receber {brl(p.aReceber)}
                </p>
              </div>
            ))}
          </div>
          {s.divisaoVariou ? <p className="tyrel__nota">A divisão mudou dentro do período: cada atendimento conta com a regra da data em que fechou.</p> : null}
        </section>

        <section className="tyrel__secao">
          <h2>Formas de pagamento</h2>
          <ul className="tyrel__lista">
            {LISTA_FORMAS.map((f) => (
              <li key={f}>
                <span>{FORMAS[f]}</span>
                <b>{brl(s.porForma[f])}</b>
              </li>
            ))}
            <li>
              <span>Pendente (não recebido)</span>
              <b>{brl(s.pendente)}</b>
            </li>
            <li className="tyrel__total">
              <span>Total efetivamente recebido</span>
              <b>{brl(s.recebido)}</b>
            </li>
          </ul>
          {d.comprovantes ? <p className="tyrel__nota">{d.comprovantes} comprovantes do sinal anexados no período.</p> : null}
        </section>

        {s.servicos.length ? (
          <section className="tyrel__secao">
            <h2>Serviços realizados</h2>
            <p className="tyrel__servicos">
              {s.servicos.map((x) => (
                <span key={x.nome}>
                  {x.nome} · {x.vezes}x
                </span>
              ))}
            </p>
          </section>
        ) : null}

        <section className="tyrel__secao">
          <h2>Atendimentos</h2>
          {d.linhas.length ? (
            <ul className="tyrel__atendimentos">
              {d.linhas.map((l, i) => (
                <li key={i}>
                  <div>
                    <b>{l.cliente}</b>
                    <span>
                      {dataBr(l.data).slice(0, 5)}
                      {l.hora ? ` às ${l.hora}` : ""} · {l.servico}
                    </span>
                  </div>
                  <div className="tyrel__valor">
                    <b>{l.valor != null ? brl(l.valor) : "sem valor"}</b>
                    <span>
                      {l.formas || "sem pagamento"} · {SITUACAO_PAGAMENTO[l.situacao]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="tyrel__nota">Nenhum atendimento realizado neste período.</p>
          )}
        </section>

        <footer className="tyrel__pe">
          <a href={ROUTES.relatorioCompartilhadoPdf(token)} className="tyrel__botao" download>
            Baixar em PDF
          </a>
          <p>O relatório mostra o fechamento do período na hora em que o link foi gerado.</p>
        </footer>
      </article>
    </main>
  );
}
