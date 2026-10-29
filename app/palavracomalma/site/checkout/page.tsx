import type { Metadata } from "next";
import { CheckoutTray } from "@/components/palavracomalma/site/checkout-tray";
import { PRODUTOS, cartao } from "../catalogo";

export const metadata: Metadata = { title: { absolute: "Carrinho · Palavra com Alma" } };

export default function CheckoutPage() {
  const sugestoes = PRODUTOS.filter((p) => p.disponivel && p.destaque).map(cartao);
  return <CheckoutTray sugestoes={sugestoes} />;
}
