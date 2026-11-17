import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getComprovantesDoPeriodo, type ComprovanteComArquivo } from "@/lib/tayssa/queries/relatorios";
import { agoraNaCasa, getFinanceiroDoPeriodo, listarLinksDoRelatorio } from "@/lib/tayssa/queries/gestao";
import { SITUACAO_PAGAMENTO, brl, parametrosDoPeriodo, resolverPeriodo } from "@/lib/tayssa/financeiro";
import { dateShort } from "@/lib/tayssa/format";
import { PeriodoSeletor } from "@/components/tayssa/admin/periodo";
import { DivisaoTabela, FormasDePagamento } from "@/components/tayssa/admin/financeiro-resumo";
import { EnviarRelatorio, RevogarLink } from "@/components/tayssa/admin/enviar-relatorio";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { dateTime, dayMonth, hhmm, plural, weekdayShort } from "@/lib/tayssa/format";
import { reais } from "@/lib/tayssa/agendar";
import type { AppointmentStatus } from "@/lib/tayssa/types";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { Icone } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/**
 * Relatórios (Lucas, 16/11/2026: "no painel tem que ter relatórios para ela
 * baixar os comprovantes e enviar para a Larissa"; 17/11/2026: o fechamento
 * do período). Escolhido o período: os atendimentos, o financeiro, a divisão
 * Tayssa/Larissa, o detalhamento, o PDF, o link para a Larissa e os
 * comprovantes do sinal (o .zip e a planilha de antes continuam aqui).
 */

/** "Comprovante enviado" ainda espera a Tayssa conferir; o resto já andou. */
const TOM: Record<AppointmentStatus, "warn" | "brand" | "ok" | "quiet"> = {
  requested: "warn",
  confirmed: "brand",
  done: "ok",
  cancelled: "quiet",
  no_show: "quiet",
};



function Linha({ c }: { c: ComprovanteComArquivo }) {
  return (
    <li className={`tya-item${c.status === "requested" ? " tya-item--wait" : ""}`}>
      <div>
        <div className="tya-slot__top">
          <span className="tya-slot__name">
            {c.clienteId ? (
              <TransitionLink href={ROUTES.adminClient(c.clienteId)} className="tya-link">
                {c.cliente}
              </TransitionLink>
            ) : (
              c.cliente
            )}
          </span>
          <span className={`tya-pill tya-pill--${TOM[c.status]}`}>{c.situacao}</span>
        </div>
        <p className="tya-slot__meta">
          {c.servico}
          {c.valor != null ? ` · ${reais(c.valor)}` : ""}
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

const OPCOES = [
  { tipo: "hoje" as const, rotulo: "Hoje" },
  { tipo: "semana" as const, rotulo: "Esta semana" },
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
  const periodo = resolverPeriodo(params, hoje, "mes");
  const [{ lista: atendimentos, resumo }, comprovantes, settings, links] = await Promise.all([
    getFinanceiroDoPeriodo(periodo.de, periodo.ate),
    getComprovantesDoPeriodo(periodo.de, periodo.ate),
    getSettings(),
    listarLinksDoRelatorio(),
  ]);
  const sinal = settings.booking.deposit_reais;
  const larissa = settings.financeiro.larissa_nome || "Larissa";
  const paraConferir = comprovantes.filter((c) => c.status === "requested").length;
  const parametros = parametrosDoPeriodo(periodo);
  const qsPeriodo = new URLSearchParams(parametros).toString();
  const qsComprovantes = new URLSearchParams({ de: periodo.de, ate: periodo.ate }).toString();
  const rotulo = periodo.rotulo.charAt(0).toLowerCase() + periodo.rotulo.slice(1);
  const ordenados = [...atendimentos].sort((a, b) => (a.data + (a.hora ?? "")).localeCompare(b.data + (b.hora ?? "")));

  return (
    <>
      <AdminHeader
        eyebrow="Relatórios"
        title={
          <>
            Relatório · <em>{rotulo}</em>
          </>
        }
        lead="Escolha o período: os atendimentos, o financeiro, a divisão e os comprovantes do sinal mudam juntos. Baixe em PDF ou mande o link para a Larissa."
      />

      <section className="tya-sec tya-up">
        <div className="tya-card tyaf-filtros">
          <PeriodoSeletor base={ROUTES.adminRelatorios} periodo={periodo} hoje={hoje} opcoes={OPCOES} />
          <p className="tya-small">Para um dia específico, em “Escolher as datas” use a mesma data em De e Até.</p>
        </div>
      </section>

      <AdminBlock id="fechamento" title="Fechamento do período">
        <div className="tyaenv__acoes">
          <a href={ROUTES.adminRelatorioPdf(qsPeriodo)} download className="tya-btn tya-btn--ghost">
            <Icone nome="relatorios" />
            Baixar relatório em PDF
          </a>
          <EnviarRelatorio periodo={parametros} nomeLarissa={larissa} />
        </div>
        <p className="tya-small" style={{ marginTop: 10 }}>
          O link abre uma página só deste relatório (não mostra telefone nem sobrenome de cliente). Ele guarda os números da hora em que foi gerado e você pode desativá-lo quando quiser, aqui embaixo.
        </p>
      </AdminBlock>

      <AdminBlock title="Resumo de atendimentos">
        <div className="tyad-fin__numeros tyarel-numeros">
          <div>
            <span>Atendimentos realizados</span>
            <b>{resumo.atendimentos}</b>
          </div>
          <div>
            <span>Clientes atendidas</span>
            <b>{resumo.clientes}</b>
          </div>
          <div>
            <span>Ticket médio</span>
            <b>{brl(resumo.ticketMedio)}</b>
          </div>
          <div>
            <span>Faturamento bruto</span>
            <b>{brl(resumo.bruto)}</b>
          </div>
        </div>
        {resumo.servicos.length ? (
          <p className="tyar-hist__servicos">
            <span className="tya-eyebrow">Serviços realizados</span>
            {resumo.servicos.map((x) => (
              <span key={x.nome} className="tya-pill tya-pill--quiet">
                {x.nome} · {x.vezes}x
              </span>
            ))}
          </p>
        ) : null}
      </AdminBlock>

      <AdminBlock title="Resumo financeiro">
        <FormasDePagamento resumo={resumo} />
      </AdminBlock>

      <AdminBlock title="Divisão">
        <DivisaoTabela resumo={resumo} larissa={larissa} />
      </AdminBlock>

      <AdminBlock title="Detalhamento" aside={<span className="tya-small">{ordenados.length} atendimentos</span>}>
        {ordenados.length ? (
          <div className="tya-tablewrap tya-tablewrap--bare">
            <table className="tya-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th className="tya-num">Valor</th>
                  <th>Forma de pagamento</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.map((a) => (
                  <tr key={a.id}>
                    <td data-rotulo="Data" className="tya-num" style={{ whiteSpace: "nowrap" }}>
                      {dateShort(a.data)}
                      {a.hora ? ` ${a.hora}` : ""}
                    </td>
                    <td data-rotulo="Cliente">
                      <TransitionLink href={ROUTES.adminClient(a.clienteId)} className="tya-link">
                        {a.cliente}
                      </TransitionLink>
                    </td>
                    <td data-rotulo="Serviço">{a.servico}</td>
                    <td data-rotulo="Valor" className="tya-num">
                      {a.valor != null ? brl(a.valor) : "—"}
                    </td>
                    <td data-rotulo="Forma">{a.formas || "—"}</td>
                    <td data-rotulo="Situação">{SITUACAO_PAGAMENTO[a.situacao]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Nenhum atendimento realizado neste período.</Empty>
        )}
      </AdminBlock>

      <AdminBlock
        id="comprovantes"
        title="Comprovantes do sinal"
        aside={paraConferir ? <span className="tya-pill tya-pill--warn">{paraConferir} para conferir na Agenda</span> : <span className="tya-small">{comprovantes.length} no período</span>}
      >
        <p className="tya-small" style={{ marginBottom: 12 }}>
          {comprovantes.length} {plural(comprovantes.length, "comprovante", "comprovantes")} · {reais(comprovantes.length * sinal)} em sinais ({reais(sinal)} cada)
        </p>
        <ol className="tya-passos">
          <li>
            Toque em <b>Baixar os comprovantes</b>: vem um arquivo .zip com todos, cada um com o dia e o nome da cliente.
          </li>
          <li>
            Toque em <b>Baixar a planilha</b>: a lista com cliente, serviço, dia e valor (abre no Excel).
          </li>
          <li>
            No WhatsApp da Larissa, toque no clipe (ou no +), escolha <b>Documento</b> e mande os dois arquivos.
          </li>
        </ol>
        <div className="tya-baixar">
          {comprovantes.length ? (
            <>
              <a href={`${ROUTES.adminRelatorios}/comprovantes?${qsComprovantes}`} download className="tya-btn tya-btn--primary">
                <Icone nome="relatorios" />
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
              <Linha key={c.id} c={c} />
            ))}
          </ul>
        ) : null}
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
    </>
  );
}
