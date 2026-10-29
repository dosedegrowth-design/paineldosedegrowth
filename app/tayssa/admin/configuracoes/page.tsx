import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { getSettings } from "@/lib/tayssa/settings";
import { getAllBenefits, getAllServices, getBlackouts } from "@/lib/tayssa/queries/catalog";
import { plural } from "@/lib/tayssa/format";
import { horariosDoDia } from "@/lib/tayssa/rules";
import { AdminBlock, AdminHeader } from "@/components/tayssa/admin/shell";
import {
  BenefitConfigForm,
  BirthdayForm,
  BlackoutForm,
  BlackoutList,
  BookingForm,
  BusinessForm,
  CatalogServiceForm,
  LoyaltyForm,
  NumerosForm,
  RulesForm,
  SignupForm,
  WhatsappForm,
} from "@/components/tayssa/admin/settings-forms";

/**
 * CONFIGURAÇÕES — a tela mais densa do painel.
 *
 * São dez formulários, cada um com a sua server action. O que impede a
 * pilha é hierarquia: índice no topo, grupos com rótulo, e cada bloco
 * dizendo em uma frase o que muda lá fora quando ela salva.
 *
 * As âncoras `#agenda`, `#cartao` e `#cadastro` são endereço público —
 * a agenda e a ficha da cliente apontam para cá. Não renomear.
 */

const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const INDICE: { href: string; label: string }[] = [
  { href: "#servicos", label: "Serviços" },
  { href: "#agenda", label: "Agenda" },
  { href: "#cartao", label: "Cartão" },
  { href: "#aniversario", label: "Aniversário" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#restricoes", label: "Restrições" },
  { href: "#cadastro", label: "Cadastro" },
  { href: "#mensagens", label: "Mensagens" },
  { href: "#numeros", label: "Números" },
  { href: "#regras", label: "Regras" },
  { href: "#negocio", label: "Negócio" },
];

/** Rótulo de uma família de ajustes. */
function Grupo({ children }: { children: ReactNode }) {
  return (
    <p className="tya-grupo">
      <span className="tya-eyebrow">{children}</span>
    </p>
  );
}

/** Um bloco de configuração: título, o selo do estado, o efeito, o formulário. */
function Bloco({
  id,
  titulo,
  selo,
  efeito,
  children,
}: {
  id: string;
  titulo: string;
  selo?: ReactNode;
  efeito: ReactNode;
  children: ReactNode;
}) {
  return (
    <AdminBlock id={id} title={titulo} aside={selo}>
      <p className="tya-explica">{efeito}</p>
      {children}
    </AdminBlock>
  );
}

/** Número que veio do banco e leva ao bloco que o governa. */
function Atalho({ n, label, href }: { n: number | string; label: string; href: string }) {
  return (
    <a href={href} className="tya-card tya-kpi tya-card--hover">
      <span className="tya-eyebrow">{label}</span>
      <p className="tya-kpi__n">{n}</p>
    </a>
  );
}

export default async function SettingsAdminPage() {
  await requireAdminPage();
  const [settings, services, benefits, blackouts] = await Promise.all([
    getSettings(),
    getAllServices(),
    getAllBenefits(),
    getBlackouts(),
  ]);

  const servicosAtivos = services.filter((s) => s.active).length;
  const beneficiosAtivos = benefits.filter((b) => b.active).length;
  const restricoesAtivas = blackouts.filter((b) => b.active).length;
  const dias = [...settings.booking.weekdays].sort((a, b) => a - b);
  const botoes = Object.keys(settings.whatsapp).length;

  return (
    <>
      <AdminHeader
        eyebrow="Configurações"
        title={
          <>
            Regras da <em>casa</em>
          </>
        }
        lead="Tudo aqui muda o site e o espaço das clientes sem mexer em código. Cada bloco salva sozinho."
        actions={
          <span className={`tya-pill ${settings.signup.open ? "tya-pill--ok" : "tya-pill--quiet"}`}>
            Cadastro pelo site {settings.signup.open ? "aberto" : "fechado"}
          </span>
        }
      />

      <nav className="tya-indice tya-up" aria-label="Índice das configurações">
        {INDICE.map((i) => (
          <a key={i.href} href={i.href} className="tya-chip">
            {i.label}
          </a>
        ))}
      </nav>

      <div className="tya-kpis tya-kpis--tight tya-kpis--cfg tya-stagger" style={{ marginTop: 18 }}>
        <Atalho n={servicosAtivos} label="Serviços no site" href="#servicos" />
        <Atalho n={dias.length} label="Dias abertos" href="#agenda" />
        <Atalho
          n={dias.reduce((n, d) => n + horariosDoDia(settings.booking, d).length, 0)}
          label="Horários na semana"
          href="#agenda"
        />
        <Atalho n={settings.loyalty.card_size} label="Visitas por cartão" href="#cartao" />
        <Atalho n={beneficiosAtivos} label="Benefícios no ar" href="#beneficios" />
        <Atalho n={restricoesAtivas} label="Restrições ativas" href="#restricoes" />
      </div>

      {/* ---------------- o atendimento ---------------- */}
      <Grupo>O atendimento</Grupo>

      <Bloco
        id="servicos"
        titulo="Serviços e pontos"
        selo={
          <span className="tya-pill tya-pill--quiet">
            {servicosAtivos} de {services.length} no site
          </span>
        }
        efeito="É a lista que aparece no site e na hora de registrar um atendimento. Cada atendimento confirmado soma os pontos do serviço. Serviço inativo some do site, mas o histórico de quem já fez continua."
      >
        <div className="tya-subs">
          {services.map((s) => (
            <CatalogServiceForm key={s.id} service={s} />
          ))}
          <CatalogServiceForm />
        </div>
      </Bloco>

      <Bloco
        id="agenda"
        titulo="Agenda"
        selo={
          dias.length ? (
            <span className="tya-pill tya-pill--brand">
              {dias.map((d) => DIAS_CURTOS[d]).join(" · ")}
            </span>
          ) : (
            <span className="tya-pill tya-pill--bad">nenhum dia aberto</span>
          )
        }
        efeito="Os dias e horários que a cliente vê ao pedir um horário. Nada aqui confirma nada: o pedido continua nascendo como pedido, e você confirma na Agenda."
      >
        <BookingForm value={settings.booking} />
      </Bloco>

      {/* ---------------- fidelidade e benefícios ---------------- */}
      <Grupo>Fidelidade e benefícios</Grupo>

      <div className="tya-dupla">
        <Bloco
          id="cartao"
          titulo="Cartão de fidelidade"
          selo={<span className="tya-pill tya-pill--gold">{settings.loyalty.card_size} posições</span>}
          efeito="Cada visita confirmada carimba uma posição. Ao fechar o cartão, o presente entra como benefício esperando a sua validação — nunca sai sozinho."
        >
          <LoyaltyForm value={settings.loyalty} />
        </Bloco>

        <Bloco
          id="aniversario"
          titulo="Aniversário"
          selo={
            <span className="tya-pill tya-pill--quiet">
              {settings.birthday.window_days_before} + {settings.birthday.window_days_after} dias
            </span>
          }
          efeito="A janela em volta da data dela e as regras que ela lê na tela de benefícios. Só VIP ativo recebe, e o presente é você quem escolhe e libera."
        >
          <BirthdayForm value={settings.birthday} />
        </Bloco>
      </div>

      <Bloco
        id="beneficios"
        titulo="Benefícios"
        selo={
          <span className="tya-pill tya-pill--quiet">
            {beneficiosAtivos} de {benefits.length} no ar
          </span>
        }
        efeito="Limites, validade e os textos que a cliente vê. Mudar um limite muda quem fica elegível daqui para a frente — o que já foi concedido continua valendo."
      >
        <div className="tya-subs">
          {benefits.map((b) => (
            <BenefitConfigForm key={b.id} benefit={b} />
          ))}
        </div>
      </Bloco>

      <Bloco
        id="restricoes"
        titulo="Períodos de restrição"
        selo={
          restricoesAtivas ? (
            <span className="tya-pill tya-pill--warn">
              {restricoesAtivas} {plural(restricoesAtivas, "ativo", "ativos")}
            </span>
          ) : (
            <span className="tya-pill tya-pill--quiet">nenhum ativo</span>
          )
        }
        efeito="Datas em que um tipo de benefício não pode ser usado — dezembro, por exemplo. Vale para a cliente na hora de pedir; você continua podendo abrir exceção."
      >
        <div className="tya-stack" style={{ gap: 20 }}>
          <BlackoutList items={blackouts} />
          <BlackoutForm />
        </div>
      </Bloco>

      {/* ---------------- a porta de entrada ---------------- */}
      <Grupo>A porta de entrada</Grupo>

      <Bloco
        id="cadastro"
        titulo="Cadastro pelo site"
        selo={
          <span className={`tya-pill ${settings.signup.open ? "tya-pill--ok" : "tya-pill--quiet"}`}>
            {settings.signup.open ? "aberto" : "fechado"}
          </span>
        }
        efeito="Com o cadastro aberto, quem chega pelo site pede acesso e fica esperando a sua aprovação na lista de clientes. Fechado, o site deixa de oferecer o pedido."
      >
        <SignupForm value={settings.signup} />
      </Bloco>

      <Bloco
        id="mensagens"
        titulo="Mensagens de WhatsApp"
        selo={
          <span className="tya-pill tya-pill--quiet">
            {botoes} {plural(botoes, "botão", "botões")}
          </span>
        }
        efeito="O texto que já vem escrito quando alguém abre a conversa por um botão do site, do espaço da cliente ou daqui do painel."
      >
        <WhatsappForm value={settings.whatsapp} />
      </Bloco>

      <Bloco
        id="numeros"
        titulo="Números do site"
        selo={
          <span className={`tya-pill ${settings.numeros.itens.length ? "tya-pill--ok" : "tya-pill--quiet"}`}>
            {settings.numeros.itens.length ? `${settings.numeros.itens.length} no site` : "fora do site"}
          </span>
        }
        efeito="O quadro do site com números que sobem na tela e o celular do Insights. Só aparece o que você escrever aqui — sem números, o quadro não entra no site."
      >
        <NumerosForm value={settings.numeros} />
      </Bloco>

      {/* ---------------- a casa ---------------- */}
      <Grupo>A casa</Grupo>

      <div className="tya-dupla">
        <Bloco
          id="regras"
          titulo="Regras gerais"
          efeito="Os números que o painel usa para sugerir: quem já poderia ser VIP, quem sumiu faz tempo, quanto tempo um benefício dura por padrão."
        >
          <RulesForm value={settings.rules} />
        </Bloco>

        <Bloco
          id="negocio"
          titulo="Negócio"
          efeito="Nome, assinatura e contatos. Aparecem no site, no rodapé e em todo botão de conversa."
        >
          <BusinessForm value={settings.business} />
        </Bloco>
      </div>
    </>
  );
}
