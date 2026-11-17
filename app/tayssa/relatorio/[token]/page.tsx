import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../relatorio.css";
import { relatorioDoToken } from "@/lib/tayssa/queries/gestao";
import { ROUTES } from "@/lib/tayssa/config";
import { brl, diaMes, resumoDoRelatorio } from "@/lib/tayssa/financeiro";

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
const pct = (n: number) => `${String(Math.round(n * 10) / 10).replace(".", ",")}%`;

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
  const s = resumoDoRelatorio(d.linhas, d.periodo.de, d.periodo.ate);
  const pctT = s.pctTayssa ?? 70;
  const gerado = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d.geradoEm));

  return (
    <main className="tyrel">
      <article className="tyrel__papel">
        <header className="tyrel__topo">
          <div>
            <p className="tyrel__marca">{d.negocio}</p>
            <p className="tyrel__sub">Relatório de atendimentos e repasse</p>
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
              <span>Faturamento</span>
              <b>{brl(s.faturamento)}</b>
            </div>
            <div>
              <span>Parte da Tayssa ({pct(pctT)})</span>
              <b>{brl(s.tayssa)}</b>
            </div>
            <div>
              <span>
                Parte da {d.larissa} ({pct(100 - pctT)})
              </span>
              <b>{brl(s.larissa)}</b>
            </div>
          </div>
          <p className="tyrel__nota">As clientes pagam no salão (Pix ou maquininha). A parte da Tayssa é repassada por quinzena.</p>
        </section>

        <section className="tyrel__secao">
          <h2>Repasse para a Tayssa</h2>
          <ul className="tyrel__lista">
            {s.repasses.map((q) => (
              <li key={q.inicio}>
                <span>
                  {q.nome} ({diaMes(q.inicio)} a {diaMes(q.fim)}) · repasse dia {diaMes(q.repasseEm)}
                </span>
                <b>{brl(q.tayssa)}</b>
              </li>
            ))}
            {s.repasses.length > 1 ? (
              <li className="tyrel__total">
                <span>Total</span>
                <b>{brl(s.tayssa)}</b>
              </li>
            ) : null}
          </ul>
        </section>

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
                    <span>Tayssa {brl(l.tayssa)}</span>
                    <span>
                      {d.larissa} {brl(l.larissa)}
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
