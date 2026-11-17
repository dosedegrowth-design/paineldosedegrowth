import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { agoraNaCasa, getFinanceiroDoPeriodo, getHistoricoDaDivisao } from "@/lib/tayssa/queries/gestao";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { dateShort, dateTime } from "@/lib/tayssa/format";
import { brl, parametrosDoPeriodo, resolverPeriodo, SITUACAO_PAGAMENTO } from "@/lib/tayssa/financeiro";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { Icone } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { PeriodoSeletor } from "@/components/tayssa/admin/periodo";
import { PagamentoAcoes } from "@/components/tayssa/admin/pagamentos";
import { DivisaoTabela, FormasDePagamento } from "@/components/tayssa/admin/financeiro-resumo";
import { BarrasDeServicos, ColunasDoPeriodo, RoscaDoPeriodo } from "@/components/tayssa/admin/graficos";
import { fatiasDoPeriodo, serieDoPeriodo, servicosMaisFeitos } from "@/lib/tayssa/graficos";
import { Conta } from "@/components/tayssa/ui/conta";
import { ContatoLarissaForm, DivisaoForm } from "@/components/tayssa/admin/financeiro-config";

export const metadata: Metadata = { title: "Financeiro" };

const OPCOES = [
  { tipo: "hoje" as const, rotulo: "Hoje" },
  { tipo: "semana" as const, rotulo: "Esta semana" },
  { tipo: "mes" as const, rotulo: "Este mês" },
  { tipo: "mes-passado" as const, rotulo: "Mês passado" },
];

/**
 * Financeiro (17/11/2026): o faturado, o recebido e o pendente dos
 * atendimentos realizados no período, a divisão Tayssa/Larissa (sozinha,
 * pela regra de cada atendimento) e onde mudar a divisão.
 */
export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; data?: string; mes?: string; de?: string; ate?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const hoje = agoraNaCasa().iso;
  const periodo = resolverPeriodo(params, hoje, "mes");
  const [{ lista, resumo }, settings, historico] = await Promise.all([getFinanceiroDoPeriodo(periodo.de, periodo.ate), getSettings(), getHistoricoDaDivisao()]);
  const f = settings.financeiro;
  const larissa = f.larissa_nome || "Larissa";
  const pendentes = lista.filter((a) => a.situacao === "pendente" || a.situacao === "parcial" || a.situacao === "sem_valor");
  const qs = new URLSearchParams(parametrosDoPeriodo(periodo)).toString();
  const serie = periodo.de === periodo.ate ? null : serieDoPeriodo(lista, periodo.de, periodo.ate, hoje);
  const rosca = fatiasDoPeriodo(resumo);

  return (
    <>
      <AdminHeader
        eyebrow="Financeiro"
        title={
          <>
            {brl(resumo.bruto)} <em>faturados</em>
          </>
        }
        lead="Faturado é o valor dos atendimentos realizados. Recebido é o que já entrou; pendente, o que falta. A divisão Tayssa/Larissa sai sozinha, pela regra de cada atendimento."
        actions={
          <>
            <TransitionLink href={`${ROUTES.adminRelatorios}?${qs}`} className="tya-btn tya-btn--ghost">
              <Icone nome="relatorios" />
              Relatório do período
            </TransitionLink>
            <TransitionLink href={`${ROUTES.adminServices}?${qs}`} className="tya-btn tya-btn--ghost">
              <Icone nome="atendimentos" />
              Atendimentos
            </TransitionLink>
          </>
        }
      />

      <section className="tya-sec tya-up">
        <div className="tya-card tyaf-filtros">
          <PeriodoSeletor base={ROUTES.adminFinanceiro} periodo={periodo} hoje={hoje} opcoes={OPCOES} />
        </div>
      </section>

      <div className="tya-kpis tya-kpis--2sm tyaf-kpis">
        <div className="tya-card tya-kpi">
          <span className="tya-eyebrow">Faturamento bruto</span>
          <p className="tya-kpi__n">
            <Conta valor={brl(resumo.bruto)} duracao={900} />
          </p>
        </div>
        <div className="tya-card tya-kpi">
          <span className="tya-eyebrow">Valor recebido</span>
          <p className="tya-kpi__n">
            <Conta valor={brl(resumo.recebido)} duracao={900} atraso={60} />
          </p>
        </div>
        <div className={`tya-card tya-kpi${resumo.pendente > 0 ? " tya-kpi--alert" : ""}`}>
          <span className="tya-eyebrow">Valor pendente</span>
          <p className="tya-kpi__n">
            <Conta valor={brl(resumo.pendente)} duracao={900} atraso={120} />
          </p>
        </div>
        <div className="tya-card tya-kpi">
          <span className="tya-eyebrow">Atendimentos realizados</span>
          <p className="tya-kpi__n">
            <Conta valor={String(resumo.atendimentos)} duracao={900} atraso={180} />
          </p>
        </div>
        <div className="tya-card tya-kpi">
          <span className="tya-eyebrow">Ticket médio</span>
          <p className="tya-kpi__n">
            <Conta valor={brl(resumo.ticketMedio)} duracao={900} atraso={240} />
          </p>
        </div>
      </div>

      <section className="tya-sec tya-up" aria-label="Gráficos do período">
        <div className="tya-card tyad-fin">
          <div className="tyad-fin__graficos tyad-fin__graficos--solto">
            {serie ? <ColunasDoPeriodo serie={serie} /> : null}
            <RoscaDoPeriodo fatias={rosca.fatias} pctRecebido={rosca.pctRecebido} />
            <BarrasDeServicos barras={servicosMaisFeitos(resumo.servicos)} />
          </div>
        </div>
      </section>

      <AdminBlock title="Divisão" aside={<span className="tya-small">{periodo.rotulo}</span>}>
        <DivisaoTabela resumo={resumo} larissa={larissa} />
        {resumo.divisaoVariou ? (
          <p className="tya-small" style={{ marginTop: 8 }}>
            A divisão mudou dentro deste período: cada atendimento conta com a regra da data em que fechou.
          </p>
        ) : null}
        {resumo.semValor ? (
          <p className="tya-small" style={{ marginTop: 8 }}>
            {resumo.semValor} {resumo.semValor === 1 ? "atendimento está" : "atendimentos estão"} sem valor e fora da conta. Informe o valor logo abaixo.
          </p>
        ) : null}
      </AdminBlock>

      <AdminBlock title="Por forma de pagamento">
        <FormasDePagamento resumo={resumo} />
      </AdminBlock>

      <AdminBlock
        title="A receber"
        aside={pendentes.length ? <span className="tya-pill tya-pill--warn">{pendentes.length} em aberto</span> : <span className="tya-pill tya-pill--ok">tudo recebido</span>}
      >
        {pendentes.length ? (
          <ul className="tya-list">
            {pendentes.map((a) => (
              <li key={a.id} className="tyar" data-situacao={a.situacao}>
                <div className="tyar__corpo">
                  <div className="tya-slot__top">
                    <TransitionLink href={ROUTES.adminClient(a.clienteId)} className="tya-link tya-slot__name">
                      {a.cliente}
                    </TransitionLink>
                    <span className="tya-pill tya-pill--warn">{SITUACAO_PAGAMENTO[a.situacao]}</span>
                  </div>
                  <p className="tya-slot__meta">
                    {dateShort(a.data)} · {a.servico} · {a.valor != null ? `${brl(a.valor)}, recebido ${brl(a.recebido)}` : "sem valor"}
                  </p>
                  <PagamentoAcoes atendimentoId={a.id} valor={a.valor} recebido={a.recebido} situacao={a.situacao} formaPadrao={a.pagamentos[0]?.forma ?? null} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nenhum valor pendente neste período.</Empty>
        )}
      </AdminBlock>

      <AdminBlock id="divisao" title="Configurar a divisão">
        <div className="tyaf-config">
          <div>
            <p className="tya-small" style={{ marginBottom: 10 }}>
              Hoje: Tayssa {String(f.pct_tayssa).replace(".", ",")}% e {larissa} {String(f.pct_larissa).replace(".", ",")}%. Ex.: num serviço de R$ 100, R${" "}
              {String(f.pct_tayssa).replace(".", ",")} para a Tayssa e R$ {String(f.pct_larissa).replace(".", ",")} para a {larissa}.
            </p>
            <DivisaoForm pctTayssa={f.pct_tayssa} pctLarissa={f.pct_larissa} nomeLarissa={larissa} />
          </div>
          <div>
            <p className="tya-eyebrow" style={{ marginBottom: 8 }}>
              Histórico da divisão
            </p>
            <ul className="tyaf-historico">
              {historico.map((h, i) => (
                <li key={h.id}>
                  <b>
                    {String(h.pctTayssa).replace(".", ",")}% / {String(h.pctLarissa).replace(".", ",")}%
                  </b>
                  <span>
                    {i === 0 ? "vigente desde " : "de "}
                    {dateTime(h.vigenteDesde)}
                    {h.por ? ` · ${h.por}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <p className="tya-eyebrow" style={{ marginBottom: 8 }}>
            Para onde vai o relatório
          </p>
          <ContatoLarissaForm nome={larissa} whatsapp={f.larissa_whatsapp} />
        </div>
      </AdminBlock>
    </>
  );
}
