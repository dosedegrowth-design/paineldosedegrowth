"use client";

import { useEffect, useState } from "react";
import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

export function WhatsAppFloat() {
  const [badge, setBadge] = useState(false);

  useEffect(() => {
    const onScroll = () => setBadge(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-30 flex items-center gap-3">
      {badge && (
        <span className="andre-anim-in hidden sm:inline-flex items-center gap-2 rounded-full border border-[var(--andre-border)] bg-[var(--andre-card)] px-3.5 py-2 font-tech text-[10px] uppercase tracking-[0.2em] text-[var(--andre-fg)] backdrop-blur-md shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--andre-primary)] animate-pulse" />
          Online agora
        </span>
      )}
      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp agora"
        data-magnetic
        className="andre-orb h-16 w-16 rounded-full inline-flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, hsl(185 100% 50%), hsl(190 95% 38%))",
        }}
      >
        <WhatsAppIcon className="h-8 w-8 text-[#03151c]" />
      </a>
    </div>
  );
}
