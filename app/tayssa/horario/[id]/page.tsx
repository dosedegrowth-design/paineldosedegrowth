import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import "../../entrar/entrar.css";
import "../horario.css";
import { getHorarioPublico } from "@/lib/tayssa/queries/horario";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { diaLegivel, duracaoLegivel, horaLegivel, prazoDoSinal, reais, valorComTaxa } from "@/lib/tayssa/agendar";
import { Entrada } from "@/components/tayssa/auth/entrada";
import { WhatsAppIcon } from "@/components/tayssa/ui/whatsapp";

/** O horário pode mudar a qualquer momento (sinal, confirmação): sempre do banco. */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // o título não derruba a página: se o banco falhar, a própria página mostra "Tentar de novo"
  const h = await getHorarioPublico((await params).id).catch(() => null);
  return {
    title: "Seu horário com a Tayssa",
    description: h ? `${h.servico} · ${diaLegivel(h.dia)} às ${horaLegivel(h.hora)}` : undefined,
    robots: { index: false, follow: false },
  };
}

/**
 * A página do "folder" (05/11/2026): o link que vai na mensagem do WhatsApp
 * abre aqui, e a imagem dela (opengraph-image.tsx) é o cartão que o
 * WhatsApp mostra na conversa.
 */
export default async function HorarioPage({ params }: Props) {
  const [h, settings] = await Promise.all([getHorarioPublico((await params).id), getSettings()]);
  // pedido que não existe mais: not-found.tsx ao lado explica, na cara do site
  if (!h) notFound();
  const b = settings.booking;
  const fora = h.status === "cancelled" || h.status === "no_show";
  const conversa = whatsappUrl(
    settings.business.whatsapp,
    `Oi, Tayssa! Sobre o meu horário de ${diaLegivel(h.dia)} às ${horaLegivel(h.hora)}: `,
  );

  return (
    <Entrada aviso="Horário marcado pelo site da Tayssa Farias">
      <div className="tyl__body tyl-surge" style={{ "--d": "0.4s" } as CSSProperties}>
        <h1 className="tyl__title">
          {fora ? (
            <>
              Esse horário <em>não está mais na agenda</em>
            </>
          ) : (
            <>
              Seu <em>horário</em>
            </>
          )}
        </h1>
        <div className="tyhr">
          <p className="tyhr__servico">{h.volume ? `${h.servico} · ${h.volume}` : h.servico}</p>
          <p className="tyhr__quando">
            {diaLegivel(h.dia)} às {horaLegivel(h.hora)}
            {duracaoLegivel(h.duracao) ? <span> · {duracaoLegivel(h.duracao)}</span> : null}
          </p>
          {valorComTaxa(h.valor, h.taxa) ? <p className="tyhr__valor">{valorComTaxa(h.valor, h.taxa)}</p> : null}
          <p className="tyhr__situacao" data-status={h.status}>
            {h.status === "requested" && h.comprovante
              ? `Comprovante do sinal enviado · a Tayssa confere o Pix e confirma`
              : h.status === "requested"
                ? `Aguardando o sinal de ${reais(b.deposit_reais)} no Pix · guardado até ${prazoDoSinal(h.criadoEm, b.sinal_horas).legivel}`
                : h.status === "confirmed"
                  ? "Confirmado pela Tayssa"
                  : h.status === "done"
                    ? "Realizado"
                    : "Fora da agenda"}
          </p>
          {!fora && b.tolerancia_min > 0 ? (
            <p className="tyhr__nota">
              Tolerância de {b.tolerancia_min} minutos de atraso: passando disso, você perde o sinal.
            </p>
          ) : null}
        </div>
        <div className="tyhr__acoes">
          <a className="tyhr__whats" href={conversa} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={20} />
            Falar com a Tayssa
          </a>
          <a className="tyl__link" href={ROUTES.vipBook}>
            Ver meus horários
          </a>
        </div>
      </div>
    </Entrada>
  );
}
