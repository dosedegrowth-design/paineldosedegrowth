"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  addBlackoutAction,
  toggleBlackoutAction,
  updateBenefitConfigAction,
  updateBirthdaySettingsAction,
  updateBookingSettingsAction,
  updateBusinessSettingsAction,
  updateLoyaltySettingsAction,
  updateNumerosSettingsAction,
  updateRulesSettingsAction,
  updateSignupSettingsAction,
  updateWhatsappTemplatesAction,
  upsertCatalogServiceAction,
} from "@/lib/tayssa/actions/settings";
import type { Settings } from "@/lib/tayssa/config";
import type { ActionResult, BenefitRow, BenefitType, BlackoutRow, ServiceRow } from "@/lib/tayssa/types";
import { BENEFIT_TYPE_LABEL } from "@/lib/tayssa/types";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { dateShort, hhmm } from "@/lib/tayssa/format";
import { reais } from "@/lib/tayssa/agendar";
import { Area, Campo, Marcar, useFormPreservado } from "@/components/tayssa/admin/forms";
import { ActionButton } from "@/components/tayssa/admin/controls";
import { Icone } from "@/components/tayssa/admin/icons";

/* ------------------------------------------------------------------
   Os formulários das Configurações, no vocabulário do painel (.tya-*).

   Cada bloco é um formulário com a sua própria server action: salva
   sozinho, responde no lugar. O que o servidor recusa por campo volta
   no campo (a regra do {url} na mensagem de boas-vindas, o limite do
   benefício, o percentual, a data de fim e o que fica restrito no
   período de restrição). O que ela digitou fica na tela: o reset
   automático do <form action> é barrado em useFormPreservado.
   ------------------------------------------------------------------ */

/** O erro que o servidor devolveu para este campo — ou nada. */
function erroDe(state: ActionResult | null, campo: string): string | undefined {
  return state && !state.ok && state.field === campo ? state.error : undefined;
}

/** Botão de salvar com a resposta ao lado: salvando, salvo, ou o que falhou. */
function Salvar({
  state,
  pending,
  children = "Salvar",
  feito = "Salvo",
  tom = "primary",
  antes,
}: {
  state: ActionResult | null;
  pending: boolean;
  children?: ReactNode;
  feito?: string;
  tom?: "primary" | "ghost" | "dark";
  /** o que vem antes do botão na mesma linha (ex.: a marca "Ativo") */
  antes?: ReactNode;
}) {
  const falhou = state && !state.ok ? state : null;
  return (
    <div className="tya-salvar">
      {antes}
      <button
        type="submit"
        className={`tya-btn tya-btn--sm tya-btn--${tom}`}
        disabled={pending}
        aria-busy={pending || undefined}
      >
        {pending ? "Salvando…" : children}
      </button>
      {state?.ok && !pending ? <span className="tya-pill tya-pill--ok">{feito}</span> : null}
      {falhou && !falhou.field ? (
        <span className="tya-err" role="alert">
          {falhou.error}
        </span>
      ) : null}
    </div>
  );
}

/** Vazio desenhado, igual ao resto do painel. */
function Vazio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <p className="tya-empty">
      <span className="tya-nada">
        <Icone nome="config" />
        <b>{titulo}</b>
        {children ? <span>{children}</span> : null}
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------
   Negócio
   ------------------------------------------------------------------ */

export function BusinessForm({ value }: { value: Settings["business"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateBusinessSettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form action={action} noValidate onReset={onReset} className="tya-stack">
      <div className="tya-grid">
        <Campo label="Nome" name="name" defaultValue={value.name} required error={erroDe(state, "name")} />
        <Campo label="Assinatura" name="tagline" defaultValue={value.tagline} error={erroDe(state, "tagline")} />
        <Campo
          label="Especialidade"
          name="specialty"
          defaultValue={value.specialty}
          error={erroDe(state, "specialty")}
        />
        <Campo
          label="WhatsApp"
          name="whatsapp"
          inputMode="tel"
          defaultValue={formatBrPhone(value.whatsapp)}
          required
          error={erroDe(state, "whatsapp")}
          hint="É para onde vão todos os botões de conversa."
        />
        <Campo
          label="Instagram (URL)"
          name="instagram_url"
          defaultValue={value.instagram_url}
          error={erroDe(state, "instagram_url")}
        />
        <Campo
          label="Instagram (@)"
          name="instagram_handle"
          defaultValue={value.instagram_handle}
          error={erroDe(state, "instagram_handle")}
        />
      </div>
      <Salvar state={state} pending={pending} />
    </form>
  );
}

/* ------------------------------------------------------------------
   Regras gerais
   ------------------------------------------------------------------ */

export function RulesForm({ value }: { value: Settings["rules"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateRulesSettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form action={action} noValidate onReset={onReset} className="tya-stack">
      <div className="tya-grid">
        <Campo
          label="Atendimentos sugeridos p/ VIP"
          name="vip_min_services"
          inputMode="numeric"
          defaultValue={String(value.vip_min_services)}
          error={erroDe(state, "vip_min_services")}
          hint="Só referência: você decide quem entra."
        />
        <Campo
          label="Dias sem atendimento = inativa"
          name="inactivity_days"
          inputMode="numeric"
          defaultValue={String(value.inactivity_days)}
          error={erroDe(state, "inactivity_days")}
          hint="Alimenta a lista de clientes para chamar, na visão geral."
        />
        <Campo
          label="Validade padrão de benefício (dias)"
          name="benefit_validity_days"
          inputMode="numeric"
          defaultValue={String(value.benefit_validity_days)}
          error={erroDe(state, "benefit_validity_days")}
          hint="Usada quando o benefício não tem validade própria."
        />
      </div>
      <Salvar state={state} pending={pending} />
    </form>
  );
}

/* ------------------------------------------------------------------
   Aniversário
   ------------------------------------------------------------------ */

export function BirthdayForm({ value }: { value: Settings["birthday"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateBirthdaySettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form action={action} noValidate onReset={onReset} className="tya-stack">
      <div className="tya-grid tya-grid--num">
        <Campo
          label="Dias antes"
          name="window_days_before"
          inputMode="numeric"
          defaultValue={String(value.window_days_before)}
          error={erroDe(state, "window_days_before")}
        />
        <Campo
          label="Dias depois"
          name="window_days_after"
          inputMode="numeric"
          defaultValue={String(value.window_days_after)}
          error={erroDe(state, "window_days_after")}
        />
      </div>
      <Marcar name="once_per_year" label="Uma vez por ano" defaultChecked={value.once_per_year} />
      <Area
        label="Regras (uma por linha — a cliente vê)"
        name="rules"
        rows={8}
        defaultValue={value.rules.join("\n")}
        error={erroDe(state, "rules")}
        hint="Aparecem na tela de benefícios dela, exatamente nesta ordem."
      />
      <Salvar state={state} pending={pending} />
    </form>
  );
}

/* ------------------------------------------------------------------
   Mensagens de WhatsApp
   ------------------------------------------------------------------ */

type WaCampo = { key: keyof Settings["whatsapp"]; label: string; marcas?: string };

const WA_GRUPOS: { titulo: string; campos: WaCampo[] }[] = [
  {
    titulo: "Pelo site",
    campos: [
      { key: "public_schedule", label: "Agendar" },
      { key: "public_vip_info", label: "Quero saber do VIP" },
      { key: "public_refer", label: "Indicar" },
    ],
  },
  {
    titulo: "Pelo espaço da cliente",
    campos: [
      { key: "vip_support", label: "Falar com você", marcas: "{name}" },
      { key: "vip_refer", label: "Indicar" },
      { key: "benefit_request", label: "Agendar benefício", marcas: "{name}, {benefit}" },
      { key: "birthday_request", label: "Aniversário", marcas: "{name}" },
    ],
  },
  {
    titulo: "Daqui do painel",
    campos: [{ key: "inactive_outreach", label: "Chamar cliente inativa", marcas: "{name}" }],
  },
];

export function WhatsappForm({ value }: { value: Settings["whatsapp"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateWhatsappTemplatesAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form action={action} noValidate onReset={onReset} className="tya-stack" style={{ gap: 22 }}>
      {WA_GRUPOS.map((g) => (
        <div key={g.titulo} className="tya-set">
          <span className="tya-set__t">
            <span className="tya-eyebrow">{g.titulo}</span>
          </span>
          {g.campos.map((f) => (
            <Area
              key={f.key}
              label={f.label}
              name={f.key}
              rows={2}
              defaultValue={value[f.key]}
              maxLength={300}
              error={erroDe(state, f.key)}
              hint={f.marcas ? `Troca sozinho: ${f.marcas}` : undefined}
            />
          ))}
        </div>
      ))}
      <Salvar state={state} pending={pending}>
        Salvar mensagens
      </Salvar>
    </form>
  );
}

/* ------------------------------------------------------------------
   Catálogo de serviços
   ------------------------------------------------------------------ */

export function CatalogServiceForm({ service }: { service?: ServiceRow }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(upsertCatalogServiceAction, null);
  const novo = !service;
  // só o formulário do "novo serviço" se esvazia; o de um serviço existente
  // continua mostrando o que foi salvo
  const { ref, onReset } = useFormPreservado(novo ? state : null);
  return (
    <form
      ref={ref}
      action={action}
      noValidate
      onReset={onReset}
      className={`tya-sub${novo ? " tya-sub--novo" : ""}`}
    >
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <div className="tya-sub__top">
        <span className="tya-eyebrow">{novo ? "Novo serviço" : service.name}</span>
        {service ? (
          <span className="tya-pills">
            {service.preco != null ? (
              <span className="tya-pill tya-pill--brand tya-num">{reais(Number(service.preco))}</span>
            ) : null}
            <span className="tya-pill tya-pill--quiet tya-num">{service.point_value} pts</span>
            <span className={`tya-pill ${service.active ? "tya-pill--ok" : "tya-pill--quiet"}`}>
              {service.active ? "no site" : "fora do site"}
            </span>
          </span>
        ) : null}
      </div>
      <div className="tya-grid tya-grid--serv">
        <Campo
          label="Serviço"
          name="name"
          defaultValue={service?.name ?? ""}
          required
          error={erroDe(state, "name")}
        />
        <Campo
          label="Descrição"
          name="description"
          defaultValue={service?.description ?? ""}
          error={erroDe(state, "description")}
        />
        <Campo
          label="Valor (R$)"
          name="preco"
          inputMode="decimal"
          defaultValue={service?.preco != null ? String(service.preco).replace(".", ",") : ""}
          error={erroDe(state, "preco")}
          hint="Vazio = o site não mostra valor."
        />
        <Campo
          label="Pontos"
          name="point_value"
          inputMode="numeric"
          defaultValue={String(service?.point_value ?? 10)}
          error={erroDe(state, "point_value")}
        />
        <Campo
          label="Ordem"
          name="sort_order"
          inputMode="numeric"
          defaultValue={String(service?.sort_order ?? 50)}
          error={erroDe(state, "sort_order")}
        />
      </div>
      <Salvar
        state={state}
        pending={pending}
        tom={novo ? "primary" : "ghost"}
        feito={novo ? "Adicionado" : "Salvo"}
        antes={<Marcar name="active" label="Ativo" defaultChecked={service ? service.active : true} />}
      >
        {novo ? "Adicionar serviço" : "Salvar"}
      </Salvar>
    </form>
  );
}

/* ------------------------------------------------------------------
   Benefícios (regras)
   ------------------------------------------------------------------ */

/** Dourado é o VIP; a marca é a indicação; o aniversário é o que espera data. */
const TOM_TIPO: Record<BenefitType, "gold" | "brand" | "warn" | "quiet"> = {
  loyalty: "gold",
  referral: "brand",
  birthday: "warn",
  custom: "quiet",
};

export function BenefitConfigForm({ benefit }: { benefit: BenefitRow }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateBenefitConfigAction, null);
  const unit =
    benefit.threshold_unit === "referrals"
      ? "indicações"
      : benefit.threshold_unit === "services"
        ? "atendimentos"
        : "pontos";
  const percent = typeof benefit.config?.percent === "number" ? String(benefit.config.percent) : "";
  const { onReset } = useFormPreservado();
  return (
    <form action={action} noValidate onReset={onReset} className="tya-sub">
      <input type="hidden" name="id" value={benefit.id} />
      <div className="tya-sub__top">
        <span className="tya-eyebrow">{benefit.name}</span>
        <span className="tya-pills">
          <span className={`tya-pill tya-pill--${TOM_TIPO[benefit.type]}`}>{BENEFIT_TYPE_LABEL[benefit.type]}</span>
          <span className={`tya-pill ${benefit.active ? "tya-pill--ok" : "tya-pill--quiet"}`}>
            {benefit.active ? "no ar" : "desligado"}
          </span>
        </span>
      </div>
      <div className="tya-grid">
        <Campo
          label="Nome (a cliente vê)"
          name="name"
          defaultValue={benefit.name}
          required
          error={erroDe(state, "name")}
        />
        {benefit.type !== "birthday" ? (
          <Campo
            label={`Limite (${unit})`}
            name="threshold"
            inputMode="numeric"
            defaultValue={benefit.threshold != null ? String(benefit.threshold) : ""}
            error={erroDe(state, "threshold")}
          />
        ) : null}
        {benefit.type === "referral" ? (
          <Campo
            label="Percentual (%)"
            name="percent"
            inputMode="numeric"
            defaultValue={percent}
            error={erroDe(state, "percent")}
          />
        ) : null}
        <Campo
          label="Validade (dias)"
          name="validity_days"
          inputMode="numeric"
          defaultValue={benefit.validity_days != null ? String(benefit.validity_days) : ""}
          error={erroDe(state, "validity_days")}
          hint="Vazio = padrão das regras"
        />
      </div>
      <Campo
        label="Descrição (a cliente vê)"
        name="description"
        defaultValue={benefit.description ?? ""}
        error={erroDe(state, "description")}
      />
      <Salvar
        state={state}
        pending={pending}
        tom="ghost"
        antes={<Marcar name="active" label="Ativo" defaultChecked={benefit.active} />}
      />
      <p className="tya-small" style={{ fontSize: 11 }}>
        Mesmo ativo, nenhum benefício é concedido sozinho: o sistema propõe e você libera.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------
   Períodos de restrição (blackout)
   ------------------------------------------------------------------ */

const TIPOS_BLACKOUT: { value: string; label: string }[] = [
  { value: "birthday", label: "Aniversário" },
  { value: "loyalty", label: "Fidelidade" },
  { value: "referral", label: "Indicação" },
  { value: "custom", label: "Especiais" },
];

export function BlackoutForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addBlackoutAction, null);
  const { ref, onReset } = useFormPreservado(state);
  return (
    <form ref={ref} action={action} noValidate onReset={onReset} className="tya-sub tya-sub--novo">
      <div className="tya-sub__top">
        <span className="tya-eyebrow">Novo período</span>
      </div>
      <div className="tya-grid">
        <Campo label="Nome" name="name" placeholder="Ex.: Dezembro" required error={erroDe(state, "name")} />
        <Campo label="Início" name="starts_on" type="date" required error={erroDe(state, "starts_on")} />
        <Campo label="Fim" name="ends_on" type="date" required error={erroDe(state, "ends_on")} />
      </div>
      <div>
        <span className="tya-label">O que fica restrito</span>
        <div className="tya-marcas">
          {TIPOS_BLACKOUT.map((t) => (
            <label key={t.value} className="tya-marca">
              <input type="checkbox" name="benefit_types" value={t.value} defaultChecked={t.value === "birthday"} />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
        {erroDe(state, "benefit_types") ? (
          <p className="tya-err" role="alert">
            {erroDe(state, "benefit_types")}
          </p>
        ) : null}
      </div>
      <Salvar state={state} pending={pending} feito="Adicionado">
        Adicionar período
      </Salvar>
    </form>
  );
}

export function BlackoutList({ items }: { items: BlackoutRow[] }) {
  if (!items.length) {
    return (
      <Vazio titulo="Nenhum período de restrição">
        Enquanto não houver período aqui, os benefícios valem o ano inteiro. Dezembro costuma ser o primeiro a entrar.
      </Vazio>
    );
  }
  return (
    <ul className="tya-list">
      {items.map((b) => (
        <li key={b.id} className="tya-item">
          <div>
            <div className="tya-pills" style={{ alignItems: "center" }}>
              <strong style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</strong>
              <span className={`tya-pill ${b.active ? "tya-pill--bad" : "tya-pill--quiet"}`}>
                {b.active ? "restringindo" : "desligado"}
              </span>
            </div>
            <p className="tya-small" style={{ marginTop: 4 }}>
              {dateShort(b.starts_on)} a {dateShort(b.ends_on)}
            </p>
            <p className="tya-pills" style={{ marginTop: 8 }}>
              {b.benefit_types.map((t) => (
                <span key={t} className="tya-pill tya-pill--quiet">
                  {TIPOS_BLACKOUT.find((x) => x.value === t)?.label ?? t}
                </span>
              ))}
            </p>
          </div>
          <div className="tya-item__acts">
            <ActionButton action={toggleBlackoutAction} args={{ id: b.id, active: !b.active }}>
              {b.active ? "Desativar" : "Ativar"}
            </ActionButton>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------
   Agenda
   ------------------------------------------------------------------ */

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/** Disponibilidade: o que a cliente enxerga ao marcar. Muda na hora. */
export function BookingForm({ value }: { value: Settings["booking"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateBookingSettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form action={action} noValidate onReset={onReset} className="tya-stack" style={{ gap: 22 }}>
      <div className="tya-set">
        <span className="tya-set__t">
          <span className="tya-eyebrow">Dias abertos</span>
        </span>
        <div className="tya-marcas">
          {WEEKDAY_LABELS.map((label, d) => (
            <label key={d} className="tya-marca">
              <input type="checkbox" name="weekdays" value={String(d)} defaultChecked={value.weekdays.includes(d)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {erroDe(state, "weekdays") ? (
          <p className="tya-err" role="alert">
            {erroDe(state, "weekdays")}
          </p>
        ) : null}
      </div>

      <div className="tya-set">
        <span className="tya-set__t">
          <span className="tya-eyebrow">Horários</span>
        </span>
        {value.slots.length ? (
          <p className="tya-pills">
            {value.slots.map((s) => (
              <span key={s} className="tya-pill tya-pill--quiet tya-num">
                {hhmm(s)}
              </span>
            ))}
          </p>
        ) : (
          <p className="tya-small">Sem horário nenhum, a cliente não consegue pedir data.</p>
        )}
        <Area
          label="Horários oferecidos (um por linha, HH:MM)"
          name="slots"
          rows={7}
          defaultValue={value.slots.join("\n")}
          error={erroDe(state, "slots")}
          hint="Cada horário vale para todos os dias abertos. Horário já ocupado some sozinho para as clientes."
        />
      </div>

      <div className="tya-set">
        <span className="tya-set__t">
          <span className="tya-eyebrow">Limites do pedido</span>
        </span>
        <div className="tya-grid">
          <Campo
            label="Antecedência mínima (horas)"
            name="lead_hours"
            inputMode="numeric"
            defaultValue={String(value.lead_hours)}
            error={erroDe(state, "lead_hours")}
            hint="Abaixo disso o horário não aparece para ela."
          />
          <Campo
            label="Dias à frente"
            name="horizon_days"
            inputMode="numeric"
            defaultValue={String(value.horizon_days)}
            error={erroDe(state, "horizon_days")}
            hint="Até onde a agenda dela enxerga."
          />
          <Campo
            label="Duração padrão (min)"
            name="default_duration_min"
            inputMode="numeric"
            defaultValue={String(value.default_duration_min)}
            error={erroDe(state, "default_duration_min")}
          />
          <Campo
            label="Horários em aberto por cliente"
            name="max_open_per_client"
            inputMode="numeric"
            defaultValue={String(value.max_open_per_client)}
            error={erroDe(state, "max_open_per_client")}
            hint="Quantos pedidos futuros ela pode ter ao mesmo tempo."
          />
          <Campo
            label="Sinal no Pix (R$)"
            name="deposit_reais"
            inputMode="decimal"
            defaultValue={String(value.deposit_reais)}
            error={erroDe(state, "deposit_reais")}
            hint="Vai na mensagem de quem agenda pelo site, pedindo a chave Pix."
          />
        </div>
      </div>

      <Salvar state={state} pending={pending}>
        Salvar disponibilidade
      </Salvar>
    </form>
  );
}

/* ------------------------------------------------------------------
   Cartão de fidelidade
   ------------------------------------------------------------------ */

/** O cartão: quantas visitas e qual o presente ao fechar. */
export function LoyaltyForm({ value }: { value: Settings["loyalty"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateLoyaltySettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form action={action} noValidate onReset={onReset} className="tya-stack">
      <div className="tya-grid">
        <Campo
          label="Visitas por cartão"
          name="card_size"
          inputMode="numeric"
          defaultValue={String(value.card_size)}
          error={erroDe(state, "card_size")}
          hint="Vale para cartões novos; o cartão aberto de cada cliente mantém o tamanho com que nasceu."
        />
        <Campo
          label="Nome do presente (a cliente vê)"
          name="card_reward_title"
          defaultValue={value.card_reward_title}
          required
          error={erroDe(state, "card_reward_title")}
        />
      </div>
      <Area
        label="Descrição do presente"
        name="card_reward_description"
        rows={2}
        defaultValue={value.card_reward_description}
        maxLength={300}
        error={erroDe(state, "card_reward_description")}
      />
      <Salvar state={state} pending={pending}>
        Salvar cartão
      </Salvar>
    </form>
  );
}

/* ------------------------------------------------------------------
   Cadastro pelo site
   ------------------------------------------------------------------ */

/** Cadastro pelo site: aberto/fechado e a mensagem de boas-vindas ao aprovar. */
export function SignupForm({ value }: { value: Settings["signup"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateSignupSettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form action={action} noValidate onReset={onReset} className="tya-stack">
      <div className="tya-marcas">
        <label className="tya-marca">
          <input type="checkbox" name="open" defaultChecked={value.open} />
          <span>Aceitar pedidos de acesso pelo site</span>
        </label>
      </div>
      <p className="tya-small" style={{ marginTop: -4 }}>
        Cada pedido continua passando por você: ninguém entra sozinha.
      </p>
      <Area
        label="Mensagem de boas-vindas ao aprovar"
        name="welcome_template"
        rows={3}
        defaultValue={value.welcome_template}
        maxLength={400}
        error={erroDe(state, "welcome_template")}
        hint="Abre no WhatsApp com o nome dela e o link de entrada já preenchidos. Troca sozinho: {name}, {url} — e o {url} é obrigatório."
      />
      <Salvar state={state} pending={pending}>
        Salvar cadastro
      </Salvar>
    </form>
  );
}

/* ------------------------------------------------------------------
   Números do site
   ------------------------------------------------------------------ */

const LINHAS_NUMEROS = 6;
const EXEMPLOS: [string, string, string][] = [
  ["2,16 mi", "Visualizações", "96% de quem ainda não te segue"],
  ["312 mil", "Contas alcançadas", ""],
  ["+5 mil", "Novos seguidores", ""],
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

/**
 * O quadro de números do site: ela copia do Insights (ou de onde quiser)
 * e o site anima subindo. Nada inventado — sem número, o quadro some.
 */
export function NumerosForm({ value }: { value: Settings["numeros"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateNumerosSettingsAction, null);
  const { onReset } = useFormPreservado();
  const linhas = Array.from({ length: LINHAS_NUMEROS }, (_, i) => value.itens[i] ?? { valor: "", rotulo: "", detalhe: "" });
  return (
    <form action={action} noValidate onReset={onReset} className="tya-stack">
      <div className="tya-grid">
        <Campo label="Período" name="periodo" defaultValue={value.periodo} maxLength={40} hint="Ex.: Últimos 30 dias" />
        <Campo label="De onde vêm" name="fonte" defaultValue={value.fonte} maxLength={40} hint="Ex.: Instagram Insights" />
        <Campo
          label="% de quem ainda não te segue"
          name="nao_seguidores"
          inputMode="decimal"
          defaultValue={value.nao_seguidores ?? ""}
          maxLength={6}
          error={erroDe(state, "nao_seguidores")}
          hint="A barra do celular. Vazio = sem barra."
        />
      </div>
      <div className="tya-numeros">
        <div className="tya-numeros__topo" aria-hidden>
          <span>Número</span>
          <span>Rótulo</span>
          <span>Detalhe (opcional)</span>
        </div>
        {linhas.map((n, i) => (
          <div key={i} className="tya-numeros__linha">
            <input
              className="tya-field"
              name="valor"
              defaultValue={n.valor}
              placeholder={EXEMPLOS[i][0]}
              maxLength={14}
              aria-label={`Número ${i + 1}`}
            />
            <input
              className="tya-field"
              name="rotulo"
              defaultValue={n.rotulo}
              placeholder={EXEMPLOS[i][1]}
              maxLength={32}
              aria-label={`Rótulo do número ${i + 1}`}
            />
            <input
              className="tya-field"
              name="detalhe"
              defaultValue={n.detalhe}
              placeholder={EXEMPLOS[i][2]}
              maxLength={60}
              aria-label={`Detalhe do número ${i + 1}`}
            />
          </div>
        ))}
      </div>
      <p className="tya-small" style={{ marginTop: -4 }}>
        O primeiro é o destaque do celular; os dois primeiros também flutuam em volta dele. Escreva do jeito que quer ver:
        “2,16 mi”, “+5 mil”, “98%”.
      </p>
      <Salvar state={state} pending={pending}>
        Salvar números
      </Salvar>
    </form>
  );
}
