import Link from "next/link";
import type { ReactNode } from "react";
import { PRIORIDADE_VIP, ROUTES } from "@/lib/tayssa/config";
import { criterioLegivel, faltaLegivel, numero, plural } from "@/lib/tayssa/format";
import type { LoyaltyProgress, ProgressoVip } from "@/lib/tayssa/rules";
import type { ServiceRow } from "@/lib/tayssa/types";

/**
 * O programa da Tayssa explicado para a cliente, sem margem para leitura
 * dupla: o caminho até o VIP (mimo, kit, VIP) com o que falta em cada
 * etapa, e as quatro formas de ganhar (cartão, pontos, aniversário,
 * indicação). Os nomes, os limites e os textos vêm do catálogo que a
 * Tayssa edita no painel; aqui nada é inventado nem prometido.
 */

type Estado = "feito" | "proximo" | "depois";

export type PassoCaminho = {
  chave: string;
  titulo: string;
  descricao: string | null;
  criterio: string;
  estado: Estado;
  nota: string;
};

/** As etapas na ordem em que ela vive: os marcos de pontos e, no fim, o VIP. */
export function passosDoCaminho(loyalty: LoyaltyProgress, vip: ProgressoVip, ehVip: boolean): PassoCaminho[] {
  const marcos = loyalty.milestones.map((m) => ({
    chave: m.key,
    titulo: m.title,
    descricao: m.description,
    criterio: criterioLegivel(m.threshold, m.meses),
    feito: m.reached,
    nota: m.reached
      ? "alcançado"
      : faltaLegivel(Math.max(0, m.threshold - loyalty.points), Math.max(0, m.meses - loyalty.meses)),
  }));
  const final = {
    chave: "vip",
    titulo: "VIP",
    descricao: `O presente de aniversário e ${PRIORIDADE_VIP}.`,
    criterio: criterioLegivel(vip.criterios.pontos, vip.criterios.meses),
    feito: ehVip,
    nota: ehVip
      ? "você é VIP"
      : vip.cumpre
        ? "você cumpre os critérios: a Tayssa confirma o seu VIP"
        : faltaLegivel(vip.faltamPontos, vip.faltamMeses),
  };
  const todos = [...marcos, final];
  const proximo = todos.findIndex((p) => !p.feito);
  return todos.map(({ feito, ...p }, i) => ({
    ...p,
    estado: feito ? "feito" : i === proximo ? "proximo" : "depois",
  }));
}

function Marca({ estado, n }: { estado: Estado; n: number }) {
  return (
    <span className="tyv-caminho__marca" aria-hidden>
      {estado === "feito" ? (
        <svg viewBox="0 0 24 24">
          <path d="m6 12.5 4 4 8-9" />
        </svg>
      ) : (
        n
      )}
    </span>
  );
}

/**
 * O caminho até o VIP. Na casa da cliente vai compacto (as etapas e o
 * que falta); em Benefícios, com o texto de cada etapa e a regra dos
 * meses seguidos.
 */
export function CaminhoVip({
  loyalty,
  vip,
  ehVip,
  compacto = false,
}: {
  loyalty: LoyaltyProgress;
  vip: ProgressoVip;
  ehVip: boolean;
  compacto?: boolean;
}) {
  const passos = passosDoCaminho(loyalty, vip, ehVip);
  return (
    <div className="tyv-panel tyv-caminho-bloco">
      {!compacto ? (
        <p className="tyv-sub tyv-caminho__intro">
          O VIP é de quem volta com constância. Pontos de uma vez só não bastam: são{" "}
          <b>{criterioLegivel(vip.criterios.pontos, vip.criterios.meses)}</b> com atendimento.
        </p>
      ) : null}
      <ol className="tyv-caminho">
        {passos.map((p, i) => (
          <li key={p.chave} className="tyv-caminho__passo" data-estado={p.estado}>
            <Marca estado={p.estado} n={i + 1} />
            <div className="tyv-caminho__txt">
              <p className="tyv-caminho__titulo">{p.titulo}</p>
              <p className="tyv-caminho__criterio">{p.criterio}</p>
              {!compacto && p.descricao ? <p className="tyv-caminho__desc">{p.descricao}</p> : null}
              <p className="tyv-caminho__nota">{p.nota}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="tyv-caminho__agora">
        <div>
          <span className="tyv-num">{numero(loyalty.points)}</span>
          <span className="tyv-caminho__unid">{plural(loyalty.points, "ponto", "pontos")}</span>
        </div>
        <div>
          <span className="tyv-num">{loyalty.meses}</span>
          <span className="tyv-caminho__unid">{plural(loyalty.meses, "mês seguido", "meses seguidos")}</span>
        </div>
      </div>
      {compacto ? (
        <Link href={`${ROUTES.vipBenefits}#como-funciona`} className="tyv-link tyv-caminho__mais">
          Como funciona
        </Link>
      ) : (
        <p className="tyv-caminho__regra">
          <b>Mês seguido</b> é cada mês do calendário com pelo menos um atendimento confirmado pela Tayssa. Se um mês
          inteiro passar sem atendimento, a contagem recomeça do zero. Os pontos não somem.
        </p>
      )}
    </div>
  );
}

/** As técnicas de aplicação de cílios (cada volume é um serviço no catálogo). */
const ehAplicacao = (slug: string) => slug === "aplicacao-cilios" || slug.startsWith("volume-");

/**
 * Quanto vale cada atendimento, agrupado pelos pontos (o que a Tayssa
 * definiu em Serviços). Quando todas as aplicações valem o mesmo, elas
 * viram uma linha só, "Aplicação de cílios" (a frase abaixo da tabela diz
 * que vale para qualquer técnica).
 */
export function TabelaDePontos({ servicos }: { servicos: Pick<ServiceRow, "slug" | "name" | "point_value">[] }) {
  const validos = servicos.filter((s) => s.slug !== "outro" && s.point_value > 0);
  const aplicacoes = validos.filter((s) => ehAplicacao(s.slug));
  const juntas = aplicacoes.length > 1 && aplicacoes.every((s) => s.point_value === aplicacoes[0].point_value);
  const grupos = new Map<number, string[]>();
  for (const s of validos) {
    const nome = juntas && ehAplicacao(s.slug) ? "Aplicação de cílios" : s.name;
    const grupo = grupos.get(s.point_value) ?? [];
    if (!grupo.includes(nome)) grupos.set(s.point_value, [...grupo, nome]);
  }
  const linhas = [...grupos.entries()].sort((a, b) => b[0] - a[0]);
  if (!linhas.length) return null;
  return (
    <dl className="tyv-pontos">
      {linhas.map(([pts, nomes]) => (
        <div key={pts} className="tyv-pontos__linha">
          <dt>
            <span className="tyv-num">{pts}</span> {plural(pts, "ponto", "pontos")}
          </dt>
          <dd>
            {nomes.map((n) => (
              <span key={n} className="tyv-pontos__servico">
                {n}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Uma das quatro formas de ganhar: número, nome, a regra e o que é dela agora. */
export function FormaDeGanhar({
  n,
  titulo,
  selo,
  regra,
  children,
  id,
}: {
  n: number;
  titulo: string;
  selo?: string;
  regra: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <article className="tyv-panel tyv-forma" id={id}>
      <div className="tyv-forma__topo">
        <span className="tyv-forma__n" aria-hidden>
          {String(n).padStart(2, "0")}
        </span>
        <h3 className="tyv-h2 tyv-forma__titulo">{titulo}</h3>
        {selo ? <span className="tyv-badge tyv-badge--quiet">{selo}</span> : null}
      </div>
      <div className="tyv-forma__regra">{regra}</div>
      {children ? <div className="tyv-forma__agora">{children}</div> : null}
    </article>
  );
}
