import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getComprovantesDoPeriodo, type ComprovanteComArquivo } from "@/lib/tayssa/queries/relatorios";
import { agoraNaCasa, getFinanceiroDoPeriodo, linhasDoRelatorio, listarLinksDoRelatorio } from "@/lib/tayssa/queries/gestao";
import { brl, diaMes, linhaFin, parametrosDoPeriodo, resolverPeriodo, resumoDoRelatorio } from "@/lib/tayssa/financeiro";
import { dateTime, dayMonth, hhmm, plural, weekdayShort } from "@/lib/tayssa/format";
import { PeriodoSeletor } from "@/components/tayssa/admin/periodo";
import { RepasseLista } from "@/components/tayssa/admin/financeiro-resumo";
import { EnviarRelatorio, RevogarLink } from "@/components/tayssa/admin/enviar-relatorio";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { reais } from "@/lib/tayssa/agendar";
import type { AppointmentStatus } from "@/lib/tayssa/types";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { Icone } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/**
 * Relatórios (Lucas, 16 e 17/11/2026). O modelo do repasse: toda cliente
 * paga no salão (Pix ou maquininha da Larissa) e a Larissa repassa a parte
 * da Tayssa por quinzena, do dia 1 ao 15 no dia 15 e do dia 16 ao fim do mês
 * no dia 1º. O relatório é isso e só isso: o período (quinzena ou datas),
 * os números, o repasse com a data, os atendimentos, o PDF e o link para a
 * Larissa. Sem "recebido" nem "pendente", e os comprovantes do sinal ficam
 * fora do relatório, num bloco fechado no fim (Lucas: "não vale nesse
 * relatório, tem coisas do passado").
 */

const TOM: Record<AppointmentStatus, "warn" | "brand" | "ok" | "quiet"> = {
  requested: "warn",
  confirmed: "brand",
  done: "ok",
  cancelled: "quiet",
  no_show: "quiet",
};

function Comprovante({ c }: { c: ComprovanteComArquivo }) {
  return (
    <li className="tya-item">
      <div>
        <div className="tya-slot__top">
          <span className="tya-slot__name">{c.clienteId ? <TransitionLink href={ROUTES.adminClient(c.clienteId)} className="tya-link">{c.cliente}</TransitionLink> : c.cliente}</span>
          <span className={`tya-pill tya-pill--${TOM[c.status]}`}>{c.situacao}</span>
        </div>
        <p className="tya-slot__meta">
          {c.servico}
          {` · ${weekdayShort(c.dia)}, ${dayMonth(c.dia)} às ${hhmm(c.hora)}`}
        </p>
        <p className="tya-slot__mine">Comprovante enviado em {dateTime(c.enviadoEm)}</p>
      </div>
      <div className="tya-item__acts">
        <a href={ROUTES.adminComprovante(c.id)} target="_blank" rel="noopener noreferrer" className="tya-btn tya-btn--ghost tya-btn--sm">
          Ver comprovante
        </a>
      </div>
    </li>
  );
}

function porDia<T extends { data: string; hora: string | null }>(lista: T[]): { iso: string; itens: T[] }[] {
  const ordem = [...lista].sort((a, b) => (a.data + (a.hora ?? "99")).localeCompare(b.data + (b.hora ?? "99")));
  const dias: { iso: string; itens: T[] }[] = [];
  for (const a of ordem) {
    const ultimo = dias[dias.length - 1];
    if (ultimo?.iso === a.data) ultimo.itens.push(a);
    else dias.push({ iso: a.data, itens: [a] });
  }
  return dias;
}

const OPCOES = [
  { tipo: "quinzena" as const, rotulo: "Esta quinzena" },
  { tipo: "quinzena-passada" as const, rotulo: "Quinzena anterior" },
  { tipo: "mes" as const, rotulo: "Este mês" },
  { tipo: "mes-passado" as const, rotulo: "Mês anterior" },
];

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; data?: string; mes?: string; de?: string; ate?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const hoje = agoraNaCasa().iso;
  // no dia 1º a quinzena nova ainda está vazia: abre na que acabou de fechar (a do repasse de hoje)
  const periodo = resolverPeriodo(params, hoje, hoje.endsWith("-01") ? "quinzena-passada" : "quinzena");
  const [{ lista }, comprovantes, settings, links] = await Promise.all([
    getFinanceiroDoPeriodo(periodo.de, periodo.ate),
    getComprovantesDoPeriodo(periodo.de, periodo.ate),
    getSettings(),
    listarLinksDoRelatorio(),
  ]);
  const larissa = settings.financeiro.larissa_nome || "Larissa";
  const linhas = linhasDoRelatorio(lista);
  const r = resumoDoRelatorio(linhas, periodo.de, periodo.ate);
  const pctT = r.pctTayssa ?? settings.financeiro.pct_tayssa;
  const pct = (n: number) => `${String(Math.round(n * 10) / 10).replace(".", ",")}%`;
  const parametros = parametrosDoPeriodo(periodo);
  const qsPeriodo = new URLSearchParams(parametros).toString();
  const qsComprovantes = new URLSearchParams({ de: periodo.de, ate: periodo.ate }).toString();
  const rotulo = periodo.rotulo.charAt(0).toLowerCase() + periodo.rotulo.slice(1);
  const datas = periodo.de === periodo.ate ? diaMes(periodo.de) : `${diaMes(periodo.de)} a ${diaMes(periodo.ate)}`;

  return (
    <>
      <AdminHeader
        eyebrow="Relatórios"
        title={
          <>
            Relatório · <em>{rotulo}</em>
          </>
        }
        lead="As clientes pagam no salão (Pix ou maquininha da Larissa). A parte da Tayssa é repassada por quinzena: do dia 1 ao 15, no dia 15; do dia 16 ao fim do mês, no dia 1º."
      />

      <section className="tya-sec tya-up" id="periodo">
        <div className="tya-card tyaf-filtros">
          <PeriodoSeletor base={ROUTES.adminRelatorios} periodo={periodo} hoje={hoje} opcoes={OPCOES} ancora="#periodo" datasAbertas />
        </div>
      </section>

      <AdminBlock title={`Resumo · ${datas}`}>
        <div className="tyad-fin__numeros tyarel-numeros">
          <div>
            <span>Atendimentos realizados</span>
            <b>{r.atendimentos}</b>
          </div>
          <div>
            <span>Faturamento</span>
            <b>{brl(r.faturamento)}</b>
          </div>
          <div data-destaque>
            <span>Parte da Tayssa ({pct(pctT)})</span>
            <b>{brl(r.tayssa)}</b>
          </div>
          <div>
            <span>
              Parte da {larissa} ({pct(100 - pctT)})
            </span>
            <b>{brl(r.larissa)}</b>
          </div>
        </div>
      </AdminBlock>

      <AdminBlock title="Repasse para a Tayssa">
        <RepasseLista resumo={r} />
      </AdminBlock>

      <AdminBlock id="fechamento" title="Mandar o relatório">
        <div className="tyaenv__acoes">
          <a href={ROUTES.adminRelatorioPdf(qsPeriodo)} download className="tya-btn tya-btn--ghost">
            <Icone nome="relatorios" />
            Baixar relatório em PDF
          </a>
          <EnviarRelatorio periodo={parametros} nomeLarissa={larissa} />
        </div>
        <p className="tya-small" style={{ marginTop: 10 }}>
          O link abre uma página só deste relatório (sem telefone e sem sobrenome de cliente) e guarda os números da hora em que foi gerado. Mudou algo depois? Gere outro e desative o antigo em “Links enviados”.
        </p>
      </AdminBlock>

      <AdminBlock title="Atendimentos" aside={<span className="tya-small">{linhas.length} no período</span>}>
        {lista.length ? (
          <div className="tyad-quem__dias">
            {porDia(lista).map((d) => (
              <section key={d.iso} className="tyad-quem__dia" aria-label={`${weekdayShort(d.iso)}, ${diaMes(d.iso)}`}>
                <h3>
                  {weekdayShort(d.iso)}, {diaMes(d.iso)}
                </h3>
                <ul>
                  {d.itens.map((a) => {
                    const l = linhaFin(a);
                    return (
                      <li key={a.id}>
                        <span className="tyad-quem__hora tya-num" data-sem-hora={a.hora ? undefined : true}>
                          {a.hora ?? "sem hora"}
                        </span>
                        <div className="tyad-quem__corpo">
                          <TransitionLink href={ROUTES.adminClient(a.clienteId)} className="tyad-quem__nome">
                            {a.cliente}
                          </TransitionLink>
                          <span className="tyad-quem__servico">{a.servico}</span>
                        </div>
                        <div className="tyad-quem__valor">
                          <b className="tya-num">{a.valor != null ? brl(a.valor) : "sem valor"}</b>
                          <span className="tyarel-split tya-num">
                            Tayssa {brl(l.tayssa)}
                            <br />
                            {larissa} {brl(l.larissa)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <Empty>Nenhum atendimento realizado neste período.</Empty>
        )}
      </AdminBlock>

      <AdminBlock id="links" title="Links enviados" aside={<span className="tya-small">os 20 mais recentes</span>}>
        {links.length ? (
          <ul className="tya-list">
            {links.map((l) => (
              <li key={l.id} className="tya-item">
                <div>
                  <div className="tya-slot__top">
                    <span className="tya-slot__name">{l.rotulo}</span>
                    <span className={`tya-pill ${l.revogadoEm ? "tya-pill--quiet" : "tya-pill--ok"}`}>{l.revogadoEm ? "desativado" : "ativo"}</span>
                  </div>
                  <p className="tya-slot__meta">
                    Gerado em {dateTime(l.criadoEm)} · {l.acessos} {plural(l.acessos, "acesso", "acessos")}
                    {l.ultimoAcesso ? ` · último em ${dateTime(l.ultimoAcesso)}` : ""}
                  </p>
                </div>
                {!l.revogadoEm ? (
                  <div className="tya-item__acts">
                    <RevogarLink id={l.id} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nenhum link gerado ainda. Use “Enviar relatório para {larissa}”.</Empty>
        )}
      </AdminBlock>

      {/* fora do relatório (Lucas, 17/11/2026): os arquivos do sinal, só para conferir quando precisar */}
      <section className="tya-sec" id="comprovantes">
        <details className="tya-card tyarel-comprovantes">
          <summary>
            <b>Comprovantes do sinal</b>
            <span>
              {comprovantes.length} {plural(comprovantes.length, "anexado", "anexados")} no período · não entram no relatório
            </span>
          </summary>
          <div className="tya-baixar" style={{ marginTop: 12 }}>
            {comprovantes.length ? (
              <>
                <a href={`${ROUTES.adminRelatorios}/comprovantes?${qsComprovantes}`} download className="tya-btn tya-btn--ghost">
                  Baixar os comprovantes (.zip)
                </a>
                <a href={`${ROUTES.adminRelatorios}/planilha?${qsComprovantes}`} download className="tya-btn tya-btn--ghost">
                  Baixar a planilha
                </a>
              </>
            ) : (
              <span className="tya-small">Nenhum comprovante neste período.</span>
            )}
          </div>
          {comprovantes.length ? (
            <ul className="tya-list" style={{ marginTop: 14 }}>
              {comprovantes.map((c) => (
                <Comprovante key={c.id} c={c} />
              ))}
            </ul>
          ) : null}
          <p className="tya-small" style={{ marginTop: 10 }}>
            Os sinais de {reais(settings.booking.deposit_reais)} caem no Pix do salão. Aqui ficam só os arquivos que as clientes anexaram no site.
          </p>
        </details>
      </section>
    </>
  );
}
