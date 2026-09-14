"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CONTATO, ROUTES } from "@/lib/config";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { Seta, Whatsapp } from "@/components/ui/icones";

/**
 * Barra de ação — só no celular.
 *
 * O site vai ser lido de pé, com uma mão. A ação principal não pode
 * depender de o visitante rolar até o rodapé nem esticar o polegar até o
 * topo: ela mora embaixo, na faixa que o dedo alcança sem mudar a pegada.
 *
 * Aparece depois que a abertura sai da tela — enquanto o hero está
 * visível o CTA dele já resolve, e duas chamadas ao mesmo tempo só
 * competem entre si.
 */
export function BarraAcao() {
  const [visivel, setVisivel] = useState(false);
  const ultimo = useRef(false);

  useEffect(() => {
    const alvo = () => window.scrollY > window.innerHeight * 0.75;
    let raf = 0;
    const checar = () => {
      raf = 0;
      const agora = alvo();
      if (agora !== ultimo.current) {
        ultimo.current = agora;
        setVisivel(agora);
      }
    };
    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(checar);
    };
    agendar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const temWhats = Boolean(CONTATO.whatsapp);

  return (
    <div className="v-barra" data-visivel={visivel ? "true" : undefined} aria-hidden={!visivel}>
      <Link className="v-barra__sec" href={ROUTES.portfolio} tabIndex={visivel ? 0 : -1}>
        Ver obras
      </Link>
      <a
        className="v-barra__cta"
        href={temWhats ? whatsappUrl(MENSAGENS.geral) : ROUTES.contato}
        target={temWhats ? "_blank" : undefined}
        rel={temWhats ? "noopener noreferrer" : undefined}
        tabIndex={visivel ? 0 : -1}
      >
        {temWhats ? <Whatsapp /> : null}
        <span>Solicite um orçamento</span>
        {temWhats ? null : <Seta />}
      </a>
    </div>
  );
}
