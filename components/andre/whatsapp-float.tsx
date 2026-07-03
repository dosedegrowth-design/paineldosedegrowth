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
      className="fixed bottom-5 right-5 z-30 h-14 w-14 rounded-full inline-flex items-center justify-center andre-wa-pulse shadow-xl"
      style={{ background: "linear-gradient(135deg, #25d366, #16a34a)" }}
    >
      <WhatsAppIcon className="h-7 w-7 text-white" />
    </a>
  );
}
