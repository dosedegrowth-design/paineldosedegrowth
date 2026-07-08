import type { Metadata } from "next";
import { PageHeader } from "@/components/andre/page-header";
import { Contato } from "@/components/andre/contato";
import { Coverage } from "@/components/andre/coverage";
import { FAQ } from "@/components/andre/faq";

export const metadata: Metadata = {
  title: "Contato — Climafrio | (11) 2095-7000 · 0800 015 1011",
  description:
    "Fale com a Climafrio: Rua Padre Adelino, 2074 — São Paulo/SP. Grande SP (11) 2095-7000, demais localidades 0800 015 1011, vendas@climafrio.com.br.",
};

export default function ContatoPage() {
  return (
    <>
      <PageHeader
        n="05"
        kicker="Contato"
        crumb="Contato"
        title="Todos os canais,"
        highlight="uma equipe."
        sub="Telefone, 0800, WhatsApp, e-mail ou loja virtual — escolha o canal e fale direto com quem entende do sistema."
      />
      <Contato />
      <Coverage />
      <FAQ />
    </>
  );
}
