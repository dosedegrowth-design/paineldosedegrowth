"use client";

import { useEffect, useRef, useState } from "react";
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
import { dateShort } from "@/lib/tayssa/format";
import { duracaoLegivel, horariosDaSemana, reais } from "@/lib/tayssa/agendar";
import { horariosDoDia, mesesDoMarco } from "@/lib/tayssa/rules";
import { MENSAGEM_CADASTRO_FEITO, MENSAGENS_DA_AGENDA, renderTemplate, respostaPronta } from "@/lib/tayssa/whatsapp";
import { Area, Campo, Marcar, useFormPreservado } from "@/components/tayssa/admin/forms";
import { ActionButton } from "@/components/tayssa/admin/controls";
import { Icone } from "@/components/tayssa/admin/icons";
import { useAcaoFormulario } from "@/components/tayssa/ui/acao";

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
  // mexeu de novo depois de salvar: o "Salvo" sai (antes ficava ali com o
  // valor novo ainda não salvo, e ela saía achando que tinha salvado)
  const botao = useRef<HTMLButtonElement>(null);
  const [mexeu, setMexeu] = useState(false);
  const [visto, setVisto] = useState(state);
  if (visto !== state) {
    setVisto(state);
    setMexeu(false);
  }
  useEffect(() => {
    const form = botao.current?.form;
    if (!form) return;
    const marca = () => setMexeu(true);
    form.addEventListener("input", marca);
    form.addEventListener("change", marca);
    return () => {
      form.removeEventListener("input", marca);
      form.removeEventListener("change", marca);
    };
  }, []);
  return (
    <div className="tya-salvar">
      {antes}
      <button
        ref={botao}
        type="submit"
        className={`tya-btn tya-btn--sm tya-btn--${tom}`}
        disabled={pending}
        aria-busy={pending || undefined}
      >
        {pending ? "Salvando…" : children}
      </button>
      {state?.ok && !pending && !mexeu ? <span className="tya-pill tya-pill--ok">{feito}</span> : null}
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
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(updateBusinessSettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form onSubmit={onSubmit} noValidate onReset={onReset} className="tya-stack">
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
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(updateRulesSettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form onSubmit={onSubmit} noValidate onReset={onReset} className="tya-stack">
      <Marcar
        name="vip_aberto"
        label="VIP aberto para as clientes (cartão, pontos, benefícios e jornada)"
        defaultChecked={value.vip_aberto}
      />
      <p className="tya-small" style={{ marginTop: -6 }}>
        Fechado, a área da cliente mostra só a agenda: marcar, ver e desmarcar os horários dela.
      </p>
      <div className="tya-grid">
        <Campo
          label="Atendimentos para o VIP"
          name="vip_visitas"
          inputMode="numeric"
          defaultValue={String(value.vip_visitas)}
          error={erroDe(state, "vip_visitas")}
          hint="Atendimentos que você marcou como Realizado. Quem completa aparece em Prontas para VIP."
        />
        <Campo
          label="Em até (dias)"
          name="vip_janela_dias"
          inputMode="numeric"
          defaultValue={String(value.vip_janela_dias)}
          error={erroDe(state, "vip_janela_dias")}
          hint="A sequência inteira cabe nesse prazo."
        />
        {/* explicados para quem está começando (Tayssa, 16/11/2026): o que cada número muda, com exemplo */}
        <Campo
          label="Entre um atendimento e outro: no mínimo (dias)"
          name="vip_intervalo_min"
          inputMode="numeric"
          defaultValue={String(value.vip_intervalo_min)}
          error={erroDe(state, "vip_intervalo_min")}
          hint={`Para contar na sequência do VIP, o próximo atendimento vem pelo menos estes dias depois do anterior. Ex.: com ${value.vip_intervalo_min}, quem volta antes não conta esse atendimento, mas não perde os que já tinha.`}
        />
        <Campo
          label="Entre um atendimento e outro: no máximo (dias)"
          name="vip_intervalo_max"
          inputMode="numeric"
          defaultValue={String(value.vip_intervalo_max)}
          error={erroDe(state, "vip_intervalo_max")}
          hint={`Se ela passar destes dias sem voltar, a sequência do VIP começa de novo. Ex.: com ${value.vip_intervalo_max}, quem volta depois de ${value.vip_intervalo_max + 5} dias recomeça do primeiro.`}
        />
        <Campo
          label="Dias sem atendimento para virar inativa"
          name="inactivity_days"
          inputMode="numeric"
          defaultValue={String(value.inactivity_days)}
          error={erroDe(state, "inactivity_days")}
          hint="Quem passa estes dias sem um atendimento Realizado aparece como inativa (Clientes › Inativas e a lista na visão geral), para você chamar. Não muda nada para a cliente."
        />
        <Campo
          label="Validade padrão de benefício (dias)"
          name="benefit_validity_days"
          inputMode="numeric"
          defaultValue={String(value.benefit_validity_days)}
          error={erroDe(state, "benefit_validity_days")}
          hint={`Quanto tempo a cliente tem para usar um benefício depois que você libera, quando ele não tem validade própria. Ex.: liberou hoje, vale ${value.benefit_validity_days} dias. Dá para mudar na hora de liberar.`}
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
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(updateBirthdaySettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form onSubmit={onSubmit} noValidate onReset={onReset} className="tya-stack">
      <Marcar name="mes_inteiro" label="Vale o mês inteiro do aniversário" defaultChecked={value.mes_inteiro} />
      <div className="tya-grid tya-grid--num">
        <Campo
          label="Dias antes"
          name="window_days_before"
          inputMode="numeric"
          defaultValue={String(value.window_days_before)}
          error={erroDe(state, "window_days_before")}
          hint="Só contam com o mês inteiro desligado."
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
        label="Regras (uma por linha, a cliente vê)"
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
   Mensagens de WhatsApp: o que a cliente manda e a resposta da Tayssa
   (Lucas, 28/11/2026: "todas as mensagens vão ter que ter a que a cliente
   manda, pra Tayssa saber, e a resposta genérica que ela tem que dar").
   Cada recado que chega pelo site vem com a resposta pronta dela ao lado,
   para copiar e colar na conversa. O recado montado pelo próprio site
   (agendamento, cadastro…) aparece como chega, sem campo.
   ------------------------------------------------------------------ */

type WaChave = keyof Settings["whatsapp"];
type WaPar = {
  titulo: string;
  /** onde a cliente toca para mandar */
  onde: string;
  /** o recado dela: um campo daqui ou o texto que o site monta sozinho */
  cliente: { campo: WaChave; marcas?: string } | { fixo: string };
  /** uma linha a mais embaixo do recado */
  clienteNota?: string;
  /** a resposta pronta; sem ela, a mensagem sai daqui (não chega) */
  resposta?: WaChave;
  respostaNota?: string;
};

function gruposDoWhatsapp(vip: { visitas: number; dias: number }): { titulo: string; pares: WaPar[] }[] {
  return [
    {
      titulo: "Chega pelo site",
      pares: [
        {
          titulo: "Agendamento feito",
          onde: "Depois de agendar e anexar o comprovante, com o cartão do horário em foto",
          cliente: { fixo: "Oi, Tayssa, tudo bem? Aqui é {nome}. Fiz meu agendamento pelo site." },
          clienteNota: "Embaixo vêm o serviço, o dia, o horário, o valor e o sinal, um em cada linha.",
          resposta: "resp_agendamento",
          respostaNota: "Conferiu o Pix? Em Agenda, toque em Confirmar: a mensagem de confirmação abre pronta.",
        },
        {
          titulo: "Cadastro feito",
          onde: "Fim do cadastro, em Avisar a Tayssa no WhatsApp",
          cliente: { fixo: renderTemplate(MENSAGEM_CADASTRO_FEITO, { name: "{nome}", visitas: vip.visitas, dias: vip.dias }) },
          resposta: "resp_cadastro",
          respostaNota: "É também a do Mandar saudação no WhatsApp, quando você não aprova o VIP.",
        },
        { titulo: "Agendar", onde: "Agendar, quando a folha de agendar não abre no aparelho dela", cliente: { campo: "public_schedule" }, resposta: "resp_public_schedule" },
        { titulo: "Indicar", onde: "Fim da indicação pelo site, em Avisar a Tayssa", cliente: { campo: "public_refer" }, resposta: "resp_public_refer" },
        { titulo: "Falar com a Tayssa", onde: "Tela de entrar (quem esqueceu a senha costuma vir por aqui)", cliente: { fixo: MENSAGENS_DA_AGENDA.falar }, resposta: "resp_falar" },
        { titulo: "Link de acesso vencido", onde: "Tela de entrar, quando o link que você mandou venceu", cliente: { fixo: MENSAGENS_DA_AGENDA.linkVencido }, resposta: "resp_link_vencido" },
        {
          titulo: "Sobre um horário",
          onde: "Página do horário, o link que vai na conversa",
          cliente: { fixo: "Oi, Tayssa! Sobre o meu horário de {dia} às {hora}:" },
          clienteNota: "E o que ela escrever depois.",
          resposta: "resp_horario",
        },
        { titulo: "Quero saber do VIP", onde: "Falar com a Tayssa, quando a área VIP está aberta a todas", cliente: { campo: "public_vip_info" }, resposta: "resp_public_vip_info" },
      ],
    },
    {
      titulo: "Chega pela conta da cliente",
      pares: [
        {
          titulo: "Falar com você",
          onde: "Botão do WhatsApp no alto da conta",
          cliente: { campo: "vip_support", marcas: "{name}" },
          clienteNota: `Quem não é VIP manda: ${MENSAGENS_DA_AGENDA.falarComNome.replace("{name}", "{nome}")}`,
          resposta: "resp_vip_support",
        },
        { titulo: "Agendar benefício", onde: "Benefícios, na conta VIP", cliente: { campo: "benefit_request", marcas: "{name}, {benefit}" }, resposta: "resp_benefit_request" },
        { titulo: "Aniversário", onde: "Presente de aniversário, na conta VIP", cliente: { campo: "birthday_request", marcas: "{name}" }, resposta: "resp_birthday_request" },
        { titulo: "Indicar", onde: "Indicar, na conta VIP", cliente: { campo: "vip_refer" }, resposta: "resp_vip_refer" },
      ],
    },
    {
      titulo: "Sai daqui do painel",
      pares: [{ titulo: "Chamar cliente inativa", onde: "Chamar, nas clientes que sumiram", cliente: { campo: "inactive_outreach", marcas: "{name}" } }],
    },
  ];
}

/** Copia a resposta como está no campo agora, com a regra do VIP no lugar do {regra}. */
function CopiarResposta({ campo, regra }: { campo: string; regra: string }) {
  const [copiada, setCopiada] = useState(false);
  return (
    <button
      type="button"
      className="tya-btn tya-btn--sm tya-btn--dark tya-wa__copiar"
      onClick={async () => {
        const area = document.getElementById(`f-${campo}`) as HTMLTextAreaElement | null;
        const texto = respostaPronta(area?.value.trim() ?? "", regra);
        if (!texto) return;
        try {
          await navigator.clipboard.writeText(texto);
          setCopiada(true);
          setTimeout(() => setCopiada(false), 1800);
        } catch {
          // sem permissão de copiar: deixa o texto selecionado para ela copiar na mão
          area?.focus();
          area?.select();
        }
      }}
    >
      {copiada ? "Resposta copiada" : "Copiar resposta"}
    </button>
  );
}

export function WhatsappForm({ value, vip }: { value: Settings["whatsapp"]; vip: { visitas: number; dias: number; regra: string } }) {
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(updateWhatsappTemplatesAction, null);
  const { onReset } = useFormPreservado();
  const grupos = gruposDoWhatsapp(vip);
  return (
    <form onSubmit={onSubmit} noValidate onReset={onReset} className="tya-stack" style={{ gap: 22 }}>
      {grupos.map((g) => (
        <div key={g.titulo} className="tya-set">
          <span className="tya-set__t">
            <span className="tya-eyebrow">{g.titulo}</span>
          </span>
          {g.pares.map((par) => {
            const chaveCliente = "campo" in par.cliente ? par.cliente.campo : null;
            // erro num campo de dentro: o cartão já abre mostrando
            const comErro = Boolean((chaveCliente && erroDe(state, chaveCliente)) || (par.resposta && erroDe(state, par.resposta)));
            return (
              <details key={`${g.titulo}-${par.titulo}`} className="tya-wa" {...(comErro ? { open: true } : {})}>
                <summary>
                  <b>{par.titulo}</b>
                  <span>{par.onde}</span>
                </summary>
                <div className="tya-wa__corpo">
                  {"campo" in par.cliente ? (
                    <Area
                      label={par.resposta ? "A cliente manda" : "Você manda"}
                      name={par.cliente.campo}
                      rows={2}
                      defaultValue={value[par.cliente.campo]}
                      maxLength={300}
                      error={erroDe(state, par.cliente.campo)}
                      hint={[par.clienteNota, par.cliente.marcas ? `Troca sozinho: ${par.cliente.marcas}` : null].filter(Boolean).join(" ") || undefined}
                    />
                  ) : (
                    <div className="tya-wa__chega">
                      <span className="tya-label">A cliente manda</span>
                      <p>{par.cliente.fixo}</p>
                      <small className="tya-small">{par.clienteNota ? `${par.clienteNota} ` : ""}O site escreve sozinho.</small>
                    </div>
                  )}
                  {par.resposta ? (
                    <>
                      <Area
                        label="Sua resposta"
                        name={par.resposta}
                        // a resposta inteira à vista no celular (cerca de 34 letras por linha)
                        rows={Math.min(10, Math.max(3, Math.ceil(value[par.resposta].length / 34)))}
                        defaultValue={value[par.resposta]}
                        maxLength={700}
                        error={erroDe(state, par.resposta)}
                        hint={[par.respostaNota, value[par.resposta].includes("{regra}") ? `{regra} vira: ${vip.regra}.` : null].filter(Boolean).join(" ") || undefined}
                      />
                      <CopiarResposta campo={par.resposta} regra={vip.regra} />
                    </>
                  ) : null}
                </div>
              </details>
            );
          })}
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
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(upsertCatalogServiceAction, null);
  const novo = !service;
  // só o formulário do "novo serviço" se esvazia; o de um serviço existente
  // continua mostrando o que foi salvo
  const { ref, onReset } = useFormPreservado(novo ? state : null);
  return (
    <form
      ref={ref}
      onSubmit={onSubmit}
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
            {service.duration_min ? (
              <span className="tya-pill tya-pill--quiet tya-num">{duracaoLegivel(service.duration_min)}</span>
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
          hint="O preço do serviço (nos volumes de cílios, o da aplicação). Vazio = o site não mostra valor."
        />
        <Campo
          label="Tempo"
          name="duration_min"
          defaultValue={duracaoLegivel(service?.duration_min) ?? ""}
          placeholder="3h, 1h30, 40 min"
          error={erroDe(state, "duration_min")}
          hint="Quanto ocupa na agenda. Vazio = duração padrão."
        />
        {/* não é o valor do serviço (Tayssa, 16/11/2026: "fiquei com dúvida sobre a finalidade desse campo") */}
        <Campo
          label="Valor da manutenção deste volume (R$)"
          name="preco_manutencao"
          inputMode="decimal"
          defaultValue={service?.preco_manutencao != null ? String(service.preco_manutencao).replace(".", ",") : ""}
          error={erroDe(state, "preco_manutencao")}
          hint="Só nos volumes de cílios. É o preço de quando a cliente volta para a manutenção deste volume, diferente do Valor acima (a aplicação). No site aparece como “Manutenção”, e é o valor quando ela marca “Manutenção de cílios” e escolhe este volume. Vazio: o volume não aparece nessa escolha. Nos outros serviços, deixe vazio."
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
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(updateBenefitConfigAction, null);
  const unit =
    benefit.threshold_unit === "referrals"
      ? "indicações"
      : benefit.threshold_unit === "services"
        ? "atendimentos"
        : "pontos";
  const percent = typeof benefit.config?.percent === "number" ? String(benefit.config.percent) : "";
  const marcoDePontos = benefit.type === "loyalty" && (benefit.threshold_unit ?? "points") === "points";
  const meses = mesesDoMarco(benefit);
  const { onReset } = useFormPreservado();
  return (
    <form onSubmit={onSubmit} noValidate onReset={onReset} className="tya-sub">
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
            label={benefit.type === "referral" ? "Indicações por benefício" : `Limite (${unit})`}
            name="threshold"
            inputMode="numeric"
            defaultValue={benefit.threshold != null ? String(benefit.threshold) : ""}
            error={erroDe(state, "threshold")}
            hint={benefit.type === "referral" ? "1 = a cada indicação confirmada" : undefined}
          />
        ) : null}
        {marcoDePontos ? (
          <Campo
            label="Meses seguidos (opcional)"
            name="meses_seguidos"
            inputMode="numeric"
            defaultValue={meses ? String(meses) : ""}
            error={erroDe(state, "meses_seguidos")}
            hint="Além dos pontos. Vazio = só pontos."
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
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(addBlackoutAction, null);
  const { ref, onReset } = useFormPreservado(state);
  return (
    <form ref={ref} onSubmit={onSubmit} noValidate onReset={onReset} className="tya-sub tya-sub--novo">
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

/** segunda primeiro, domingo no fim */
const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0];

/** Disponibilidade: o que a cliente enxerga ao marcar. Muda na hora. */
export function BookingForm({ value }: { value: Settings["booking"] }) {
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(updateBookingSettingsAction, null);
  const { onReset } = useFormPreservado();
  const semana = horariosDaSemana(value);
  return (
    <form onSubmit={onSubmit} noValidate onReset={onReset} className="tya-stack" style={{ gap: 22 }}>
      <div className="tya-set">
        <span className="tya-set__t">
          <span className="tya-eyebrow">Dias e horários</span>
        </span>
        {semana.length ? (
          <p className="tya-pills">
            {semana.map((g) => (
              <span key={g.dias} className="tya-pill tya-pill--quiet">
                {g.dias} · <span className="tya-num">{g.horas}</span>
              </span>
            ))}
          </p>
        ) : null}
        <ul className="tya-dias">
          {ORDEM_SEMANA.map((d) => {
            const grade = horariosDoDia(value, d);
            const erro = erroDe(state, `horas_${d}`);
            return (
              <li key={d} className="tya-dia">
                <label className="tya-marca tya-dia__nome">
                  <input type="checkbox" name="weekdays" value={String(d)} defaultChecked={value.weekdays.includes(d)} />
                  <span>{WEEKDAY_LABELS[d]}</span>
                </label>
                <span className="tya-dia__horas">
                  <span aria-hidden>das</span>
                  <input
                    type="time"
                    className="tya-field tya-num"
                    name={`de_${d}`}
                    defaultValue={grade[0] ?? "09:00"}
                    aria-label={`${WEEKDAY_LABELS[d]}, primeiro horário`}
                    aria-invalid={erro ? true : undefined}
                  />
                  <span aria-hidden>às</span>
                  <input
                    type="time"
                    className="tya-field tya-num"
                    name={`ate_${d}`}
                    defaultValue={grade[grade.length - 1] ?? "18:00"}
                    aria-label={`${WEEKDAY_LABELS[d]}, último horário`}
                    aria-invalid={erro ? true : undefined}
                  />
                </span>
                {erro ? (
                  <p className="tya-err" role="alert">
                    {erro}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
        {erroDe(state, "weekdays") ? (
          <p className="tya-err" role="alert">
            {erroDe(state, "weekdays")}
          </p>
        ) : null}
        <div className="tya-grid tya-grid--num">
          <Campo
            label="Intervalo entre horários (min)"
            name="intervalo_min"
            inputMode="numeric"
            defaultValue={String(value.intervalo_min)}
            error={erroDe(state, "intervalo_min")}
          />
        </div>
        <p className="tya-small">
          O último horário do dia é o último início: um volume de 3h que começa às 16h termina às 19h. Serviço longo
          ocupa sozinho os horários seguintes, e o que está ocupado aparece riscado para a cliente.
        </p>
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
            hint="Vale para o serviço sem tempo próprio."
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
            hint="O horário só vale com o sinal. Aparece para ela ao marcar."
          />
          <Campo
            label="Prazo do sinal (horas)"
            name="sinal_horas"
            inputMode="numeric"
            defaultValue={String(value.sinal_horas)}
            error={erroDe(state, "sinal_horas")}
            hint="O pedido segura o horário esse tempo. Sem você confirmar, ele cai e o horário volta."
          />
          <Campo
            label="Tolerância de atraso (min)"
            name="tolerancia_min"
            inputMode="numeric"
            defaultValue={String(value.tolerancia_min)}
            error={erroDe(state, "tolerancia_min")}
            hint="Passando disso, ela perde o sinal. Aparece ao marcar e no site."
          />
        </div>
      </div>

      {/* prioridade VIP (09/11/2026): as datas novas abrem primeiro para quem é VIP */}
      <div className="tya-stack">
        <span className="tya-eyebrow">Prioridade VIP</span>
        <p className="tya-small">
          Ligada, as datas a partir do dia escolhido ficam só para as clientes VIP. As demais veem o aviso de quando
          abre. Na hora marcada a agenda abre sozinha para todas; sem hora marcada, fica só VIP até você marcar ou
          desligar.
        </p>
        <div className="tya-marcas">
          <label className="tya-marca">
            <input type="checkbox" name="pv_ativa" defaultChecked={value.prioridade_vip?.ativa ?? false} />
            <span>Abrir primeiro para as VIPs</span>
          </label>
        </div>
        <div className="tya-grid">
          <Campo
            label="Só VIP a partir de"
            name="pv_desde"
            type="date"
            defaultValue={value.prioridade_vip?.desde ?? ""}
            error={erroDe(state, "pv_desde")}
            hint="Ex.: 01/12 guarda dezembro inteiro para as VIPs."
          />
          <Campo
            label="Abre para todas em"
            name="pv_abre_em"
            type="datetime-local"
            defaultValue={value.prioridade_vip?.abre_em ?? ""}
            error={erroDe(state, "pv_abre_em")}
            hint="Dia e hora de Brasília. Vazio: só VIP até você marcar."
          />
        </div>
      </div>

      {/* o Pix do sinal: com a chave, o site mostra o "copia e cola" e ela anexa o comprovante */}
      <div className="tya-stack">
        <span className="tya-eyebrow">Pix do sinal</span>
        <p className="tya-small">
          Com a chave cadastrada, a cliente copia o código Pix com o valor do sinal, paga no app do banco e anexa o
          comprovante no site. Sem chave, ela pede a chave no seu WhatsApp.
        </p>
        <div className="tya-grid">
          <Campo
            label="Chave Pix"
            name="pix_chave"
            defaultValue={value.pix_chave}
            error={erroDe(state, "pix_chave")}
            hint="CNPJ, CPF, celular com DDD, e-mail ou chave aleatória."
          />
          <Campo
            label="Em nome de"
            name="pix_nome"
            defaultValue={value.pix_nome}
            error={erroDe(state, "pix_nome")}
            hint="Como aparece no banco. A cliente vê antes de pagar."
          />
          <Campo
            label="Banco"
            name="pix_banco"
            defaultValue={value.pix_banco}
            error={erroDe(state, "pix_banco")}
            hint="Só para ela conferir (ex.: Nubank)."
          />
          <Campo
            label="Cidade da conta"
            name="pix_cidade"
            defaultValue={value.pix_cidade}
            error={erroDe(state, "pix_cidade")}
            hint="Vai dentro do código Pix."
          />
        </div>
      </div>

      {/* onde é: a cliente vê só no horário confirmado; o site aberto mostra só o bairro */}
      <div className="tya-stack">
        <span className="tya-eyebrow">Endereço do atendimento</span>
        <p className="tya-small">
          A cliente vê quando você confirma o horário dela, em Meus horários, junto com a tolerância de atraso e o seu
          recado. No site aberto continua só o bairro. O que ficar vazio não aparece.
        </p>
        <div className="tya-grid">
          <Campo
            label="Endereço"
            name="local_endereco"
            defaultValue={value.local_endereco ?? ""}
            error={erroDe(state, "local_endereco")}
            hint="Rua, número, bairro, cidade e CEP."
          />
          <Campo
            label="Sala"
            name="local_sala"
            defaultValue={value.local_sala ?? ""}
            error={erroDe(state, "local_sala")}
            hint="Ex.: Sala 3, 1º andar."
          />
          <Campo
            label="Interfone"
            name="local_interfone"
            defaultValue={value.local_interfone ?? ""}
            error={erroDe(state, "local_interfone")}
            hint="O número ou o nome que ela chama na portaria."
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
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(updateLoyaltySettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form onSubmit={onSubmit} noValidate onReset={onReset} className="tya-stack">
      <div className="tya-grid">
        <Campo
          label="Visitas por cartão"
          name="card_size"
          inputMode="numeric"
          defaultValue={String(value.card_size)}
          error={erroDe(state, "card_size")}
          hint="De 4 a 12. Vale para cartões novos; o cartão aberto de cada cliente mantém o tamanho com que nasceu."
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

/** Cadastro pelo site: aberto ou fechado (a mensagem ao liberar sai do painel). */
export function SignupForm({ value }: { value: Settings["signup"] }) {
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(updateSignupSettingsAction, null);
  const { onReset } = useFormPreservado();
  return (
    <form onSubmit={onSubmit} noValidate onReset={onReset} className="tya-stack">
      <div className="tya-marcas">
        <label className="tya-marca">
          <input type="checkbox" name="open" defaultChecked={value.open} />
          <span>Aceitar cadastro pelo site</span>
        </label>
      </div>
      <p className="tya-small" style={{ marginTop: -4 }}>
        A conta abre na hora e ela já marca horário; o VIP continua sendo decisão sua (Clientes › Novas clientes).
      </p>
      {/* a mensagem ao liberar é a do painel (VIP ou conta liberada, com a senha
          que ela já criou); este texto antigo ("defina sua senha") não vai mais
          para ninguém (Lucas, 12/11/2026). Fica guardado só para o salvar passar. */}
      <input type="hidden" name="welcome_template" value={value.welcome_template} />
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
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult | null>(updateNumerosSettingsAction, null);
  const { onReset } = useFormPreservado();
  const linhas = Array.from({ length: LINHAS_NUMEROS }, (_, i) => value.itens[i] ?? { valor: "", rotulo: "", detalhe: "" });
  return (
    <form onSubmit={onSubmit} noValidate onReset={onReset} className="tya-stack">
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
