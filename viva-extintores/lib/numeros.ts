/**
 * Números (§15 do briefing).
 *
 * Regra dura: NUNCA INVENTAR NÚMEROS. Os três abaixo vieram do briefing
 * da VIVA — não foram calculados nem estimados aqui.
 *
 * ⚠️ PENDENTE DE CONFIRMAÇÃO: o briefing cita "20 anos no mercado" num
 * trecho e "mais de 15 anos no mercado" no outro. Está publicado o número
 * menor (o mais conservador). A VIVA precisa confirmar qual vale antes de
 * a página ir ao ar — é trocar a string aqui, mais nada.
 *
 * E eles não aparecem em quatro quadradinhos: entram como prova dentro da
 * narrativa, numa faixa fina (§15 rejeitou o "site de academia").
 */

export type Numero = { valor: string; rotulo: string };

export const NUMEROS: Numero[] = [
  { valor: "+5.000", rotulo: "AVCBs entregues" },
  { valor: "+2.000", rotulo: "obras executadas" },
  { valor: "+15", rotulo: "anos de mercado" },
];

/** Frase leve que acompanha os números (§ "tratar de forma leve e real"). */
export const NUMEROS_NOTA =
  "O que já entregamos, sem adjetivo: obra executada, documentação aprovada e cliente atendido.";
