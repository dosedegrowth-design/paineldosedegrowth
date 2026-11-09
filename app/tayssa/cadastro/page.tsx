import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/tayssa/config";

/**
 * Sem pedido de acesso ao VIP (Lucas e Tayssa, 09/11/2026): o VIP é por
 * convite da Tayssa, pelo painel (Clientes → ficha → "Incluir no VIP"). O
 * endereço antigo leva ao site, onde toda cliente agenda com a conta dela.
 */
export default function SignupPage() {
  redirect(ROUTES.home);
}
