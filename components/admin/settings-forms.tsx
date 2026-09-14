"use client";

import { useActionState } from "react";
import {
  addBlackoutAction,
  toggleBlackoutAction,
  updateBenefitConfigAction,
  updateBirthdaySettingsAction,
  updateBusinessSettingsAction,
  updateRulesSettingsAction,
  updateWhatsappTemplatesAction,
  upsertCatalogServiceAction,
} from "@/lib/actions/settings";
import type { Settings } from "@/lib/config";
import type { ActionResult, BenefitRow, BlackoutRow, ServiceRow } from "@/lib/types";
import { BENEFIT_TYPE_LABEL } from "@/lib/types";
import { formatBrPhone } from "@/lib/phone";
import { dateShort } from "@/lib/format";
import { TyCheckbox, TyInput, TyTextarea } from "@/components/ui/field";
import { TyButton } from "@/components/ui/button";
import { ActionButton } from "@/components/admin/controls";

function Feedback({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  if (state.ok) return <div className="ty-form-ok">Salvo.</div>;
  return <div className="ty-form-error" role="alert">{state.error}</div>;
}

export function BusinessForm({ value }: { value: Settings["business"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateBusinessSettingsAction, null);
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 18, maxWidth: 640 }}>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <TyInput label="Nome" name="name" defaultValue={value.name} required />
        <TyInput label="Assinatura" name="tagline" defaultValue={value.tagline} />
        <TyInput label="Especialidade" name="specialty" defaultValue={value.specialty} />
        <TyInput label="WhatsApp" name="whatsapp" defaultValue={formatBrPhone(value.whatsapp)} required />
        <TyInput label="Instagram (URL)" name="instagram_url" defaultValue={value.instagram_url} />
        <TyInput label="Instagram (@)" name="instagram_handle" defaultValue={value.instagram_handle} />
      </div>
      <Feedback state={state} />
      <div>
        <TyButton type="submit" size="sm" variant="solid" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </TyButton>
      </div>
    </form>
  );
}

export function RulesForm({ value }: { value: Settings["rules"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateRulesSettingsAction, null);
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 18, maxWidth: 640 }}>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <TyInput label="Atendimentos sugeridos p/ VIP" name="vip_min_services" inputMode="numeric" defaultValue={String(value.vip_min_services)} hint="Só referência: você decide quem entra." />
        <TyInput label="Dias sem atendimento = inativa" name="inactivity_days" inputMode="numeric" defaultValue={String(value.inactivity_days)} />
        <TyInput label="Validade padrão de benefício (dias)" name="benefit_validity_days" inputMode="numeric" defaultValue={String(value.benefit_validity_days)} />
      </div>
      <Feedback state={state} />
      <div>
        <TyButton type="submit" size="sm" variant="solid" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </TyButton>
      </div>
    </form>
  );
}

export function BirthdayForm({ value }: { value: Settings["birthday"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateBirthdaySettingsAction, null);
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 18, maxWidth: 640 }}>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <TyInput label="Dias antes" name="window_days_before" inputMode="numeric" defaultValue={String(value.window_days_before)} />
        <TyInput label="Dias depois" name="window_days_after" inputMode="numeric" defaultValue={String(value.window_days_after)} />
      </div>
      <TyCheckbox name="once_per_year" label="Uma vez por ano" defaultChecked={value.once_per_year} />
      <TyTextarea label="Regras (uma por linha — a cliente vê)" name="rules" rows={8} defaultValue={value.rules.join("\n")} />
      <Feedback state={state} />
      <div>
        <TyButton type="submit" size="sm" variant="solid" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </TyButton>
      </div>
    </form>
  );
}

const WA_FIELDS: { key: keyof Settings["whatsapp"]; label: string }[] = [
  { key: "public_schedule", label: "Site · Agendar" },
  { key: "public_vip_info", label: "Site · Quero saber do VIP" },
  { key: "public_refer", label: "Site · Indicar" },
  { key: "vip_support", label: "VIP · Falar com Tayssa ({name})" },
  { key: "vip_refer", label: "VIP · Indicar" },
  { key: "benefit_request", label: "VIP · Agendar benefício ({name}, {benefit})" },
  { key: "birthday_request", label: "VIP · Aniversário ({name})" },
  { key: "inactive_outreach", label: "Admin · Cliente inativa ({name})" },
];

export function WhatsappForm({ value }: { value: Settings["whatsapp"] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateWhatsappTemplatesAction, null);
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 18, maxWidth: 720 }}>
      {WA_FIELDS.map((f) => (
        <TyTextarea key={f.key} label={f.label} name={f.key} rows={2} defaultValue={value[f.key]} maxLength={300} />
      ))}
      <Feedback state={state} />
      <div>
        <TyButton type="submit" size="sm" variant="solid" disabled={pending}>
          {pending ? "Salvando…" : "Salvar mensagens"}
        </TyButton>
      </div>
    </form>
  );
}

export function CatalogServiceForm({ service }: { service?: ServiceRow }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(upsertCatalogServiceAction, null);
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 14, padding: "16px 0", borderTop: "1px solid var(--t-line)" }}>
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "minmax(160px, 2fr) minmax(160px, 3fr) 90px 70px auto", alignItems: "end" }}>
        <TyInput label="Serviço" name="name" defaultValue={service?.name ?? ""} required />
        <TyInput label="Descrição" name="description" defaultValue={service?.description ?? ""} />
        <TyInput label="Pontos" name="point_value" inputMode="numeric" defaultValue={String(service?.point_value ?? 10)} />
        <TyInput label="Ordem" name="sort_order" inputMode="numeric" defaultValue={String(service?.sort_order ?? 50)} />
        <div style={{ display: "grid", gap: 8 }}>
          <TyCheckbox name="active" label="Ativo" defaultChecked={service ? service.active : true} />
          <TyButton type="submit" size="xs" variant={service ? "line" : "solid"} disabled={pending}>
            {pending ? "…" : service ? "Salvar" : "Adicionar"}
          </TyButton>
        </div>
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function BenefitConfigForm({ benefit }: { benefit: BenefitRow }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateBenefitConfigAction, null);
  const unit = benefit.threshold_unit === "referrals" ? "indicações" : benefit.threshold_unit === "services" ? "atendimentos" : "pontos";
  const percent = typeof benefit.config?.percent === "number" ? String(benefit.config.percent) : "";
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 14, padding: "18px 0", borderTop: "1px solid var(--t-line)" }}>
      <input type="hidden" name="id" value={benefit.id} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span className="ty-eyebrow">{BENEFIT_TYPE_LABEL[benefit.type]} · {benefit.key}</span>
        <TyCheckbox name="active" label="Ativo" defaultChecked={benefit.active} />
      </div>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <TyInput label="Nome (a cliente vê)" name="name" defaultValue={benefit.name} required />
        {benefit.type !== "birthday" ? (
          <TyInput label={`Limite (${unit})`} name="threshold" inputMode="numeric" defaultValue={benefit.threshold != null ? String(benefit.threshold) : ""} />
        ) : null}
        {benefit.type === "referral" ? <TyInput label="Percentual (%)" name="percent" inputMode="numeric" defaultValue={percent} /> : null}
        <TyInput label="Validade (dias)" name="validity_days" inputMode="numeric" defaultValue={benefit.validity_days != null ? String(benefit.validity_days) : ""} hint="Vazio = padrão das regras" />
      </div>
      <TyInput label="Descrição (a cliente vê)" name="description" defaultValue={benefit.description ?? ""} />
      <Feedback state={state} />
      <div>
        <TyButton type="submit" size="xs" disabled={pending}>
          {pending ? "…" : "Salvar"}
        </TyButton>
      </div>
    </form>
  );
}

export function BlackoutForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addBlackoutAction, null);
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 14, maxWidth: 640 }}>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <TyInput label="Nome" name="name" placeholder="Ex.: Dezembro" required />
        <TyInput label="Início" name="starts_on" type="date" required />
        <TyInput label="Fim" name="ends_on" type="date" required />
      </div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <TyCheckbox name="benefit_types" value="birthday" label="Aniversário" defaultChecked />
        <TyCheckbox name="benefit_types" value="loyalty" label="Fidelidade" />
        <TyCheckbox name="benefit_types" value="referral" label="Indicação" />
        <TyCheckbox name="benefit_types" value="custom" label="Especiais" />
      </div>
      <Feedback state={state} />
      <div>
        <TyButton type="submit" size="xs" variant="solid" disabled={pending}>
          {pending ? "…" : "Adicionar período"}
        </TyButton>
      </div>
    </form>
  );
}

export function BlackoutList({ items }: { items: BlackoutRow[] }) {
  if (!items.length) return <p className="ty-small">Nenhum período de restrição cadastrado.</p>;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {items.map((b) => (
        <li key={b.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "12px 0", borderTop: "1px solid var(--t-line)", alignItems: "center", opacity: b.active ? 1 : 0.55 }}>
          <div>
            <strong style={{ fontWeight: 500 }}>{b.name}</strong>
            <span className="ty-small" style={{ display: "block" }}>
              {dateShort(b.starts_on)} a {dateShort(b.ends_on)} · {b.benefit_types.join(", ")}
            </span>
          </div>
          <ActionButton action={toggleBlackoutAction} args={{ id: b.id, active: !b.active }}>
            {b.active ? "Desativar" : "Ativar"}
          </ActionButton>
        </li>
      ))}
    </ul>
  );
}
