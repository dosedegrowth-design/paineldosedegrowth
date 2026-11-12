"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FORA_DA_ANALISE, GA_TAYSSA, foraDaAnalise } from "@/lib/tayssa/analytics";

const DESLIGA = `ga-disable-${GA_TAYSSA}`;

/** Liga ou desliga o envio do GA para o endereço da vez (é o desligar oficial do gtag). */
function marcar(caminho: string) {
  (window as unknown as Record<string, unknown>)[DESLIGA] = foraDaAnalise(caminho);
}

/**
 * Google Analytics 4 no site da Tayssa (ver `lib/tayssa/analytics.ts`). O GA
 * conta as páginas (a troca de página sem recarregar entra pela medição
 * otimizada do fluxo), as rolagens e os cliques de saída (WhatsApp,
 * Instagram). No painel, no entrar e no folder do horário o envio fica
 * desligado: decidido antes da primeira página e de novo a cada troca de
 * endereço, na renderização, antes de o roteador mudar o endereço do
 * navegador (o GA manda a página nova assim que o endereço muda).
 */
export function AnaliseDoSite() {
  const caminho = usePathname();
  if (typeof window !== "undefined") marcar(caminho);
  useEffect(() => marcar(caminho), [caminho]);
  return (
    <>
      <Script id="ga-tayssa" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;` +
          `window[${JSON.stringify(DESLIGA)}]=${FORA_DA_ANALISE.toString()}.test(location.pathname);` +
          `gtag('js',new Date());gtag('config',${JSON.stringify(GA_TAYSSA)});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_TAYSSA}`} strategy="afterInteractive" />
    </>
  );
}
