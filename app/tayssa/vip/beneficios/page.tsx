import Link from "next/link";
import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getClientOverview, getClientReferrals } from "@/lib/tayssa/queries/client";
import { getActiveServices } from "@/lib/tayssa/queries/catalog";
import { getCardState } from "@/lib/tayssa/engine";
import { ROUTES } from "@/lib/tayssa/config";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { dateLong, numero, plural } from "@/lib/tayssa/format";
import { REFERRAL_STATUS_LABEL } from "@/lib/tayssa/types";
import { BenefitItem } from "@/components/tayssa/vip/benefit-item";
import { beneficioNaTela } from "@/lib/tayssa/beneficio-na-tela";
import { VipReferralForm } from "@/components/tayssa/vip/forms";
import { CaminhoVip, FormaDeGanhar, TabelaDePontos } from "@/components/tayssa/vip/programa";

/**
 * Tudo que a cliente pode ganhar, em uma tela: o que já é dela, o caminho
 * até o VIP e as quatro formas de ganhar (cartão, pontos, aniversário e
 * indicação), cada uma com a regra inteira e onde ela está agora.
 */
export default async function BenefitsPage() {
  const user = await requireClientPage();
  const [o, referrals, servicos, card] = await Promise.all([
    getClientOverview(user),
    getClientReferrals(user.id),
    getActiveServices(),
    getCardState(user.id),
  ]);
  // o prêmio pelo que ele é ("15% de desconto e um spa dos lábios…"), não pelo
  // nome interno do benefício ("Indicação confirmada" lia como mais uma indicação)
  const descricao = o.referral.rewardDescription?.trim().replace(/\.$/, "");
  const premio = descricao ? `${descricao.charAt(0).toLowerCase()}${descricao.slice(1)}` : `“${o.referral.rewardTitle}”`;
  const porIndicacao = o.referral.threshold === 1;
  const phone = o.settings.business.whatsapp;
  const wa = o.settings.whatsapp;

  const active = o.benefits.filter((b) => ["available", "requested", "approved"].includes(b.status));
  const validating = o.benefits.filter((b) => b.status === "pending_validation");
  const past = o.benefits.filter((b) => ["redeemed", "expired", "rejected"].includes(b.status));
  const carimbos = card.stamps.length;

  const link = (title: string, type: string | undefined) =>
    whatsappUrl(
      phone,
      renderTemplate(type === "birthday" ? wa.birthday_request : wa.benefit_request, {
        name: user.displayName,
        benefit: title,
      })
    );

  return (
    <>
      <h1 className="tyv-hello">
        {user.displayName}, <em>seus benefícios</em>.
      </h1>
      <p className="tyv-sub">
        {active.length
          ? `${active.length} ${plural(active.length, "desbloqueado", "desbloqueados")} esperando você.`
          : "Cada visita, cada indicação e o seu aniversário abrem algo por aqui."}
      </p>

      {active.length ? (
        <section className="tyv-section">
          <div className="tyv-section-head">
            <h2 className="tyv-h2">Para usar</h2>
          </div>
          <div className="tyv-stack">
            {active.map((b) => (
              <BenefitItem key={b.id} item={beneficioNaTela(b)} isVip={user.isVip} whatsappUrl={link(b.title, b.benefit?.type)} />
            ))}
          </div>
        </section>
      ) : null}

      {validating.length ? (
        <section className="tyv-section">
          <div className="tyv-section-head">
            <h2 className="tyv-h2">Em validação</h2>
            <span className="tyv-label">a Tayssa confirma</span>
          </div>
          <div className="tyv-stack">
            {validating.map((b) => (
              <BenefitItem key={b.id} item={beneficioNaTela(b)} isVip={user.isVip} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="tyv-section" aria-labelledby="caminho-titulo">
        <div className="tyv-section-head">
          <h2 className="tyv-h2" id="caminho-titulo">
            {user.isVip ? "Você é VIP" : "O seu caminho até o VIP"}
          </h2>
          {user.isVip && user.profile?.vip_since ? (
            <span className="tyv-label">desde {dateLong(user.profile.vip_since, true)}</span>
          ) : null}
        </div>
        <CaminhoVip loyalty={o.loyalty} vip={o.vip} ehVip={user.isVip} />
      </section>

      <section className="tyv-section" id="como-funciona" aria-labelledby="como-titulo">
        <div className="tyv-section-head">
          <h2 className="tyv-h2" id="como-titulo">
            Como funciona
          </h2>
          <span className="tyv-label">4 formas de ganhar</span>
        </div>
        <div className="tyv-stack">
          <FormaDeGanhar
            n={1}
            titulo="Cartão de visitas"
            regra={
              <p>
                Cada visita confirmada pela Tayssa é um carimbo no seu cartão. {o.settings.loyalty.card_reward_description}
              </p>
            }
          >
            <div className="tyv-dots">
              {Array.from({ length: card.size }, (_, i) => (
                <i key={i} data-on={i < carimbos} />
              ))}
            </div>
            <p>
              {carimbos} de {card.size} {plural(card.size, "visita", "visitas")} neste cartão.{" "}
              <Link href={ROUTES.vipCard} className="tyv-link">
                Ver meu cartão
              </Link>
            </p>
          </FormaDeGanhar>

          <FormaDeGanhar
            n={2}
            titulo="Pontos"
            regra={
              <>
                <p>Cada atendimento confirmado pela Tayssa soma pontos, conforme o serviço:</p>
                <TabelaDePontos servicos={servicos} />
                <p>
                  Toda aplicação de cílios vale o mesmo, em qualquer técnica, inclusive mega volume: o que conta é você
                  voltar.
                </p>
              </>
            }
          >
            <p>
              Você tem <b>{numero(o.points)}</b> {plural(o.points, "ponto", "pontos")}. Eles levam às etapas do caminho acima: os
              marcos e o VIP.
            </p>
          </FormaDeGanhar>

          <FormaDeGanhar
            n={3}
            titulo="Aniversário"
            selo="só VIP"
            regra={
              <p>
                {o.birthdayDescription ??
                  `${o.birthday?.mesInteiro === false ? "Na semana do seu aniversário" : "No mês do seu aniversário"}, uma experiência escolhida pela Tayssa para você.`}
              </p>
            }
          >
            <p>
              {!user.isVip
                ? "Faz parte do VIP: chega junto com o seu título."
                : !o.birthday
                  ? "Conte sua data de aniversário para a Tayssa. Ela cadastra, e o seu presente aparece aqui."
                  : o.birthday.inWindow
                    ? `${o.birthday.mesInteiro ? "É o mês do seu aniversário." : "É a sua semana."} A Tayssa libera seu presente por aqui.`
                    : `Seu aniversário é em ${dateLong(o.birthday.nextDate)}.`}
            </p>
            {o.blackout ? (
              <p>
                Em {o.blackout.name} a agenda tem restrições até {dateLong(o.blackout.endsOn)}.
              </p>
            ) : null}
          </FormaDeGanhar>

          <FormaDeGanhar
            id="indicar"
            n={4}
            titulo="Indicação"
            regra={
              <p>
                {porIndicacao ? "A cada indicação confirmada" : `A cada ${o.referral.threshold} indicações confirmadas`}:{" "}
                {premio}. Vale quando a pessoa indicada faz o primeiro atendimento e a Tayssa confirma.
              </p>
            }
          >
            <p>
              {o.referral.approved
                ? `${o.referral.approved} ${plural(o.referral.approved, "indicação confirmada", "indicações confirmadas")}`
                : "Nenhuma indicação confirmada ainda"}
              {o.referralsInProgress ? ` · ${o.referralsInProgress} em andamento` : ""}.
              {!porIndicacao && o.referral.approved
                ? ` ${plural(o.referral.remaining, "Falta", "Faltam")} ${o.referral.remaining} para o próximo.`
                : ""}
            </p>
            <div className="tyv-divider" />
            <VipReferralForm />
            {referrals.length ? (
              <div className="tyv-forma__lista">
                {referrals.slice(0, 6).map((r) => (
                  <div key={r.id} className="tyv-row">
                    <div>
                      <p style={{ fontSize: 15 }}>{r.referred_name}</p>
                      <p className="tyv-sub" style={{ fontSize: 12.5 }}>
                        {dateLong(r.created_at)}
                      </p>
                    </div>
                    <span className={`tyv-badge ${r.status === "approved" ? "" : "tyv-badge--quiet"}`}>
                      {REFERRAL_STATUS_LABEL[r.status]}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </FormaDeGanhar>
        </div>
        <p className="tyv-nota">
          Nenhum benefício sai sozinho: a Tayssa confere e confirma cada um. Quando ela libera, ele aparece no topo desta
          tela, em “Para usar”.
        </p>
      </section>

      {past.length ? (
        <section className="tyv-section">
          <div className="tyv-section-head">
            <h2 className="tyv-h2">Já viveu</h2>
          </div>
          <div className="tyv-stack">
            {past.slice(0, 4).map((b) => (
              <BenefitItem key={b.id} item={beneficioNaTela(b)} isVip={user.isVip} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
