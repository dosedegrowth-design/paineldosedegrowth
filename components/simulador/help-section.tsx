import { COPY, WHATSAPP_NUMBER } from "@/lib/simulador/config";
import { buildWhatsappUrl } from "@/lib/simulador/whatsapp";
import { WhatsappIcon } from "./icons";

/** Contato com a equipe — presente em todas as etapas (âncora do menu). */
export function HelpSection() {
  const contactUrl = buildWhatsappUrl(WHATSAPP_NUMBER, COPY.help.contact.message, { nome: "", valor: "" });
  return (
    <section id="ajuda" className="sim-section sim-help" aria-labelledby="sim-help-title">
      <div className="sim-container">
        <h2 id="sim-help-title" className="sim-section__title">
          {COPY.help.title}
        </h2>
        <p className="sim-help__text">{COPY.help.text}</p>
        <p className="sim-help__contact">
          <a className="sim-btn sim-btn--secondary sim-btn--auto" href={contactUrl} target="_blank" rel="noopener noreferrer">
            <WhatsappIcon size={20} />
            <span>{COPY.help.contact.label}</span>
          </a>
        </p>
      </div>
    </section>
  );
}
