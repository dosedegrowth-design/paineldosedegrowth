import type { CSSProperties } from "react";
import "../../entrar/entrar.css";
import "../horario.css";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { Entrada } from "@/components/tayssa/auth/entrada";
import { WhatsAppIcon } from "@/components/tayssa/ui/whatsapp";

/**
 * O link de um horário que não está mais no banco (10/11/2026): os pedidos
 * de teste apagados quando o painel foi zerado continuam nas conversas do
 * WhatsApp, e um link pode chegar cortado. Antes caía na página padrão
 * "404 · This page could not be found", em inglês, e parecia o site quebrado.
 * Agora diz o que houve, na cara do site, e leva aos horários de verdade.
 * Continua respondendo 404 (para o WhatsApp e os robôs, o pedido não existe).
 */
export default async function HorarioQueSaiu() {
  const settings = await getSettings().catch(() => null);
  const conversa = settings?.business.whatsapp
    ? whatsappUrl(settings.business.whatsapp, "Oi, Tayssa! Abri o link de um horário e ele não está mais na agenda: ")
    : null;
  return (
    <Entrada aviso="Horário marcado pelo site da Tayssa Farias">
      <div className="tyl__body tyl-surge" style={{ "--d": "0.4s" } as CSSProperties}>
        <h1 className="tyl__title">
          Esse horário <em>não está mais na agenda</em>
        </h1>
        <p className="tyl__sub">
          O link é de um pedido que saiu da agenda. Os seus horários de agora ficam em Meus horários, e
          a Tayssa responde no WhatsApp.
        </p>
        <div className="tyhr__acoes">
          {conversa ? (
            <a className="tyhr__whats" href={conversa} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={20} />
              Falar com a Tayssa
            </a>
          ) : null}
          <a className="tyl__link" href={ROUTES.vipBook}>
            Ver meus horários
          </a>
        </div>
      </div>
    </Entrada>
  );
}
