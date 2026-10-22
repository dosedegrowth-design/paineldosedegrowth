"use client";

import type { CSSProperties, MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { BusinessSettings } from "@/lib/tayssa/config";
import { ROUTES } from "@/lib/tayssa/config";
import { TyBrand } from "@/components/tayssa/ui/brand";
import { Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { scrollToTarget } from "@/components/tayssa/ui/smooth-scroll";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** As seções do site. O href é real: de outra página, leva até a home. */
const SECOES = [
  { id: "trabalho", label: "Trabalho" },
  { id: "servicos", label: "Serviços" },
  { id: "vip", label: "Tayssa VIP" },
];

/**
 * O telefone da casa como se escreve: +55 11 99982-7606. Só formata o
 * que reconhece (55 + DDD + 8 ou 9 dígitos); no resto, devolve os
 * dígitos como estão — nunca um número inventado.
 */
function fone(digitos: string): string {
  const d = digitos.replace(/\D/g, "");
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(d);
  return m ? `+55 ${m[1]} ${m[2]}-${m[3]}` : `+${d}`;
}

/**
 * Link de seção. O endereço é sempre real (`/tayssa#servicos`), então
 * vale clique do meio, favorito e rastreamento. Quando a seção existe na
 * página aberta, o clique é interceptado e vira rolagem suave; quando não
 * existe — o rodapé também mora em `/indicar` — o link navega de verdade.
 */
function LinkDeSecao({ id, label }: { id: string; label: string }) {
  const aoClicar = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!document.getElementById(id)) return; // deixa o link levar até a home
    e.preventDefault();
    scrollToTarget(`#${id}`);
  };
  return (
    <TransitionLink href={`${ROUTES.home}#${id}`} className="ty-link typ__link" onClick={aoClicar}>
      {label}
    </TransitionLink>
  );
}

/**
 * O colofão da casa.
 *
 * Marca, voz e os caminhos reais: navegar pelo site, o contato que sai
 * das settings (WhatsApp e Instagram, nada de rede que não existe), e o
 * clube — pedir acesso, entrar e indicar. Embaixo, a assinatura: a marca
 * gigante outra vez, saindo pelas bordas, fechando o que o herói abriu;
 * e a ficha em mono.
 *
 * Serve nos dois temas (o rodapé também fica na página clara de
 * `/indicar`) e não usa nenhuma foto.
 */
export function PublicFooter({ business }: { business: BusinessSettings }) {
  const reduced = useReducedMotion();

  const partes = business.name.trim().split(/\s+/);
  const primeira = partes[0] ?? "Tayssa";
  const segunda = partes.slice(1).join(" ");
  // a palavra ocupa a largura da tela: o corpo sai do número de letras
  const letras = (segunda ? `${primeira} ${segunda}` : primeira).length;

  const sobe = (delay: number) => ({
    initial: reduced ? false : { y: "16%", opacity: 0 },
    whileInView: { y: "0%", opacity: 1 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 1.05, delay, ease: EASE },
    style: { display: "inline-block" },
  });

  return (
    <footer className="typ" aria-label="Rodapé">
      <div className="ty-container">
        <div className="ty-rule" />

        <div className="typ__grade">
          {/* a marca e a voz da casa */}
          <Reveal className="typ__marca" y={16}>
            <TyBrand name={primeira} suffix={segunda} />
            <p className="ty-body typ__dizer">{business.specialty}</p>
            <span className="ty-oval">{business.tagline}</span>
          </Reveal>

          {/* navegar: as seções do site */}
          <Reveal className="typ__coluna typ__coluna--navegar" delay={0.06} y={16}>
            <span className="ty-mono typ__titulo">Navegar</span>
            {SECOES.map((s) => (
              <LinkDeSecao key={s.id} id={s.id} label={s.label} />
            ))}
          </Reveal>

          {/* contato: só o que existe de verdade, direto das settings */}
          <Reveal className="typ__coluna typ__coluna--contato" delay={0.12} y={16}>
            <span className="ty-mono typ__titulo">Contato</span>
            <a
              className="typ__contato"
              href={whatsappUrl(business.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ty-link typ__link">WhatsApp</span>
              <span className="ty-mono typ__num">{fone(business.whatsapp)}</span>
            </a>
            <a
              className="typ__contato"
              href={business.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ty-link typ__link">Instagram</span>
              <span className="ty-mono typ__num">{business.instagram_handle}</span>
            </a>
          </Reveal>

          {/* o clube: pedir acesso, entrar, indicar */}
          <Reveal className="typ__coluna typ__coluna--vip" delay={0.18} y={16}>
            <span className="ty-mono typ__titulo">VIP</span>
            <TransitionLink href={ROUTES.signup} className="ty-link typ__link">
              Pedir acesso
            </TransitionLink>
            <TransitionLink href={ROUTES.login} className="ty-link typ__link">
              Entrar no VIP
            </TransitionLink>
            <TransitionLink href={ROUTES.refer} className="ty-link typ__link">
              Indicar alguém
            </TransitionLink>
          </Reveal>
        </div>
      </div>

      {/* a assinatura: a marca outra vez, com as pontas na borda da tela.
          Decorativa — quem lê com leitor de tela já ouviu a marca acima. */}
      <div className="typ__assinatura" aria-hidden>
        <span className="ty-wordmark" style={{ "--ty-letras": letras } as CSSProperties}>
          <motion.span {...sobe(0)}>{primeira}</motion.span>
          {segunda ? (
            <>
              {" "}
              <motion.em {...sobe(0.08)}>{segunda}</motion.em>
            </>
          ) : null}
        </span>
      </div>

      <div className="ty-container">
        <div className="typ__ficha">
          {/* sem ano. `/tayssa` e `/tayssa/indicar` são pré-renderizadas
              estáticas (nenhuma tem revalidate ou force-dynamic), então
              qualquer ano calculado no servidor congela no momento do
              build e fica velho até o próximo deploy — e corrigi-lo no
              navegador significaria ou aceitar divergência de hidratação,
              ou montar estado só para isso. O aviso de direito vale sem a
              data; o que não vale é o site afirmar um ano errado. */}
          <span>© {business.name}</span>
          <span>{business.instagram_handle}</span>
        </div>
      </div>
    </footer>
  );
}
