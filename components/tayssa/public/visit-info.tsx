"use client";

import type { BusinessSettings } from "@/lib/tayssa/config";
import type { ConteudoSite } from "@/lib/tayssa/content";
import { temAtendimento } from "@/lib/tayssa/content";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { Reveal } from "@/components/tayssa/ui/reveal";
import { Pendente, useEstrutura } from "@/components/tayssa/ui/estrutura";

/** +55 11 99982-7606 — só formata o que reconhece; nunca inventa número. */
function fone(digitos: string): string {
  const d = digitos.replace(/\D/g, "");
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(d);
  return m ? `+55 ${m[1]} ${m[2]}-${m[3]}` : `+${d}`;
}

/**
 * Atendimento — as informações práticas: horários, como agendar,
 * política, pagamento, onde e o contato. O contato (WhatsApp e
 * Instagram) é real e vem das configurações; o resto vem do manifesto
 * de conteúdo e só aparece quando ela informar. Sem nada além do
 * contato, a seção fica de fora (o rodapé já leva o contato).
 */
export function VisitInfo({ business, conteudo }: { business: BusinessSettings; conteudo: ConteudoSite }) {
  const estrutura = useEstrutura();
  if (!temAtendimento(conteudo) && !estrutura) return null;
  const { horarios, comoAgendar, politica, pagamento } = conteudo.atendimento;

  return (
    <section id="atendimento" className="ty-section tyat" aria-label="Atendimento">
      <div className="ty-container">
        <Reveal className="tyat__topo" y={14}>
          <span className="ty-mono ty-mono--ink">Atendimento</span>
          <span className="ty-mono">antes de marcar</span>
        </Reveal>
        <div className="ty-rule" />

        <div className="tyat__grade">
          <Reveal className="tyat__bloco">
            <h3 className="tyat__h">Horários</h3>
            {horarios?.length ? (
              <dl className="tyat__horas">
                {horarios.map((h) => (
                  <div key={h.dias}>
                    <dt>{h.dias}</dt>
                    <dd className="ty-num">{h.horas}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <Pendente titulo="Dias e horários de atendimento" detalhe="Ex.: seg a sex · 9h às 19h; sáb · 9h às 14h." />
            )}
          </Reveal>

          <Reveal className="tyat__bloco" delay={0.06}>
            <h3 className="tyat__h">Como agendar</h3>
            {comoAgendar?.length ? (
              <ul className="tyat__lista">
                {comoAgendar.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : (
              <Pendente titulo="Como funciona o agendamento" detalhe="Só WhatsApp? Pede sinal? Com quanta antecedência?" />
            )}
          </Reveal>

          <Reveal className="tyat__bloco" delay={0.12}>
            <h3 className="tyat__h">Política</h3>
            {politica?.length ? (
              <ul className="tyat__lista">
                {politica.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : (
              <Pendente titulo="Atraso, remarcação e cancelamento" detalhe="Opcional — só se ela tiver uma regra." />
            )}
          </Reveal>

          <Reveal className="tyat__bloco" delay={0.18}>
            <h3 className="tyat__h">Pagamento</h3>
            {pagamento?.length ? (
              <ul className="tyat__lista">
                {pagamento.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : (
              <Pendente titulo="Formas de pagamento" detalhe="Pix, cartão, parcelamento…" />
            )}
          </Reveal>

          <Reveal className="tyat__bloco tyat__bloco--contato" delay={0.24}>
            <h3 className="tyat__h">Contato</h3>
            <a className="tyat__contato" href={whatsappUrl(business.whatsapp)} target="_blank" rel="noopener noreferrer">
              <span className="ty-link">WhatsApp</span>
              <span className="ty-mono">{fone(business.whatsapp)}</span>
            </a>
            <a className="tyat__contato" href={business.instagram_url} target="_blank" rel="noopener noreferrer">
              <span className="ty-link">Instagram</span>
              <span className="ty-mono">{business.instagram_handle}</span>
            </a>
            {conteudo.espaco.endereco ? <p className="ty-body">{conteudo.espaco.endereco}</p> : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
