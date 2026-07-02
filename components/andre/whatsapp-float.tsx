"use client";

import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-30 h-14 w-14 rounded-full inline-flex items-center justify-center andre-wa-pulse"
      style={{
        background: "linear-gradient(135deg, #25d366, #1ea952)",
        boxShadow:
          "0 12px 30px -8px rgba(37, 211, 102, 0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      <WhatsAppIcon className="h-7 w-7 text-white" />
    </a>
  );
}
