import { CONTATO } from "@/lib/config";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { Whatsapp } from "@/components/ui/icones";

/** Só aparece quando existe número confirmado — nada de botão pra lugar nenhum. */
export function WhatsappFlutuante() {
  if (!CONTATO.whatsapp) return null;
  return (
    <a
      className="v-float"
      href={whatsappUrl(MENSAGENS.geral)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Whatsapp />
      <span>Falar agora</span>
    </a>
  );
}
