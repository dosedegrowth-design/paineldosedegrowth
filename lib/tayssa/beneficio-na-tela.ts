import type { ClientBenefitStatus } from "@/lib/tayssa/types";
import type { ClientBenefitView } from "@/lib/tayssa/queries/client";

/**
 * O benefício como a cliente vê: só o que a tela usa. Anotação interna da
 * Tayssa (fora dos estados em que ela aparece), quem criou e o recado da
 * própria cliente não vão para o navegador.
 */
export type BeneficioNaTela = Pick<ClientBenefitView, "id" | "status" | "benefit" | "title" | "description" | "expires_at" | "admin_note">;

/** O recado da Tayssa só aparece nesses estados; nos outros nem sai do servidor. */
export const COM_RECADO: ClientBenefitStatus[] = ["approved", "available", "rejected"];

export function beneficioNaTela(b: ClientBenefitView): BeneficioNaTela {
  return {
    id: b.id,
    status: b.status,
    benefit: b.benefit,
    title: b.title,
    description: b.description,
    expires_at: b.expires_at,
    admin_note: COM_RECADO.includes(b.status) ? b.admin_note : null,
  };
}
