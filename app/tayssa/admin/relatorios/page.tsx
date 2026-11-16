import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getComprovantesDoMes, type ComprovanteComArquivo } from "@/lib/tayssa/queries/relatorios";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { dateTime, dayMonth, hhmm, nowInBusinessTz, plural, weekdayShort } from "@/lib/tayssa/format";
import { reais } from "@/lib/tayssa/agendar";
import { mesLegivel, mesValido, outroMes } from "@/lib/tayssa/relatorios";
import type { AppointmentStatus } from "@/lib/tayssa/types";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { Icone } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/**
 * Relatórios (Lucas, 16/11/2026: "no painel tem que ter relatórios para ela
 * baixar os comprovantes e enviar para a Larissa"). Os comprovantes do
 * sinal de um mês: a lista, o .zip com todos e a planilha.
 */

/** "Comprovante enviado" ainda espera a Tayssa conferir; o resto já andou. */
const TOM: Record<AppointmentStatus, "warn" | "brand" | "ok" | "quiet"> = {
  requested: "warn",
  confirmed: "brand",
  done: "ok",
  cancelled: "quiet",
  no_show: "quiet",
};

function mesAtual(): string {
  const d = nowInBusinessTz();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function Atalho({ n, label, alerta }: { n: string | number; label: string; alerta?: boolean }) {
  return (
    <div className={`tya-card tya-kpi${alerta ? " tya-kpi--alert" : ""}`}>
      <span className="tya-eyebrow">{label}</span>
      <p className="tya-kpi__n">{n}</p>
    </div>
  );
}

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

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await requireAdminPage();
  const { mes: pedido } = await searchParams;
  const atual = mesAtual();
  // mês que ainda não chegou não tem comprovante: volta para o de agora
  const mes = mesValido(pedido) && pedido <= atual ? pedido : atual;
  const [lista, settings] = await Promise.all([getComprovantesDoMes(mes), getSettings()]);
  const sinal = settings.booking.deposit_reais;
  const paraConferir = lista.filter((c) => c.status === "requested").length;
  const nome = mesLegivel(mes);
  const soMes = nome.split(" de ")[0];
  const anterior = outroMes(mes, -1);
  const seguinte = outroMes(mes, 1);

  return (
    <>
      <AdminHeader
        eyebrow="Relatórios"
        title={
          <>
            Comprovantes de <em>{soMes}</em>
          </>
        }
        lead="Os comprovantes do sinal que as clientes anexaram no mês. Baixe tudo de uma vez e mande para a Larissa."
      />

      <div className="tya-toolbar">
        <div className="tya-chips">
          <a href={`${ROUTES.adminRelatorios}?mes=${anterior}`} className="tya-chip">
            ‹ {mesLegivel(anterior).split(" de ")[0]}
          </a>
          <span className="tya-chip" data-on="true" aria-current="page">
            {nome}
          </span>
          {seguinte <= atual ? (
            <a href={`${ROUTES.adminRelatorios}?mes=${seguinte}`} className="tya-chip">
              {mesLegivel(seguinte).split(" de ")[0]} ›
            </a>
          ) : null}
        </div>
      </div>

      <div className="tya-kpis tya-kpis--2sm tya-kpis--rel tya-stagger">
        <Atalho n={lista.length} label={plural(lista.length, "Comprovante", "Comprovantes")} />
        <Atalho n={reais(lista.length * sinal)} label={`Em sinais (${reais(sinal)} cada)`} />
        <Atalho n={paraConferir} label="Ainda para conferir" alerta={paraConferir > 0} />
      </div>

      <AdminBlock id="baixar" title="Mandar para a Larissa">
        <ol className="tya-passos">
          <li>
            Toque em <b>Baixar os comprovantes</b>: vem um arquivo .zip com todos, cada um com o dia e o nome da
            cliente.
          </li>
          <li>
            Toque em <b>Baixar a planilha</b>: a lista com cliente, serviço, dia e valor (abre no Excel).
          </li>
          <li>
            No WhatsApp da Larissa, toque no clipe (ou no +), escolha <b>Documento</b> e mande os dois arquivos.
          </li>
        </ol>
        <div className="tya-baixar">
          {lista.length ? (
            <>
              <a href={ROUTES.adminRelatorioComprovantes(mes)} download className="tya-btn tya-btn--primary">
                <Icone nome="relatorios" />
                Baixar os comprovantes (.zip)
              </a>
              <a href={ROUTES.adminRelatorioPlanilha(mes)} download className="tya-btn tya-btn--ghost">
                Baixar a planilha
              </a>
            </>
          ) : (
            <span className="tya-small">Nada para baixar em {soMes}.</span>
          )}
        </div>
      </AdminBlock>

      <AdminBlock
        id="lista"
        title={`Os comprovantes de ${soMes}`}
        aside={
          paraConferir ? (
            <TransitionLink href={`${ROUTES.adminAgenda}#pedidos`} className="tya-pill tya-pill--warn">
              {paraConferir} para conferir na Agenda
            </TransitionLink>
          ) : null
        }
      >
        {lista.length ? (
          <ul className="tya-list">
            {lista.map((c) => (
              <Linha key={c.id} c={c} />
            ))}
          </ul>
        ) : (
          <Empty>
            <span className="tya-nada">
              <Icone nome="relatorios" />
              <b>Nenhum comprovante em {soMes}</b>
              <span>Quando uma cliente anexar o comprovante do sinal, ele aparece aqui.</span>
            </span>
          </Empty>
        )}
      </AdminBlock>
    </>
  );
}
