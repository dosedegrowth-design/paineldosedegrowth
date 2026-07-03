"use client";

/* Barra de conversão fixa no mobile — o CTA nunca sai da tela.
   Aparece após o primeiro scroll pra não brigar com o hero. */

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

export function MobileCtaBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 sm:hidden andre-anim-in"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        background:
          "linear-gradient(0deg, hsl(220 20% 4% / 0.96), hsl(220 20% 4% / 0.86))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid var(--andre-border)",
      }}
    >
      <div className="flex items-stretch gap-2 p-3">
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="andre-btn-primary flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl text-[14.5px] whitespace-nowrap"
        >
          <WhatsAppIcon className="h-5 w-5 shrink-0" />
          Orçamento grátis no WhatsApp
        </a>
        <a
          href={telLink()}
          aria-label="Ligar agora"
          className="andre-btn-ghost inline-flex items-center justify-center h-12 w-12 rounded-xl shrink-0"
        >
          <Phone className="h-5 w-5 text-[var(--andre-primary)]" />
        </a>
      </div>
    </div>
  );
}
