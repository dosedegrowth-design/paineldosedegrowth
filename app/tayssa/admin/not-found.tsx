import { ROUTES } from "@/lib/tayssa/config";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/**
 * Painel: uma ficha que não existe mais (a cliente de teste apagada ao
 * zerar o painel, um link antigo). Antes era a página padrão "404 · This
 * page could not be found", em inglês, fora do painel; agora fica dentro
 * dele, com a lateral, e leva de volta para as clientes.
 */
export default function PainelNaoAchou() {
  return (
    <div style={{ paddingBlock: "clamp(28px, 4vw, 56px)", maxWidth: 560 }}>
      <span className="ty-eyebrow" style={{ display: "block", marginBottom: 12 }}>
        Não está mais aqui
      </span>
      <h1 className="ty-display" style={{ fontSize: "clamp(26px, 3.34vw, 40px)" }}>
        Essa ficha <em>saiu do painel</em>.
      </h1>
      <p className="ty-body" style={{ marginTop: 12 }}>
        O link é de uma cliente ou de um pedido que não está mais no painel, como os de teste que foram
        apagados. Todo o resto continua como estava.
      </p>
      <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <TransitionLink href={ROUTES.adminClients} className="tya-btn tya-btn--primary tya-btn--sm">
          Ver as clientes
        </TransitionLink>
        <TransitionLink href={ROUTES.admin} className="tya-btn tya-btn--ghost tya-btn--sm">
          Visão geral
        </TransitionLink>
      </div>
    </div>
  );
}
