/**
 * Números.
 *
 * Regra dura: NUNCA INVENTAR NÚMERO. Os quatro abaixo são os únicos que
 * saíram da boca da VIVA. Os que apareceram nos mockups da agência
 * (+3.000 clientes, +1.500 obras, +300 sistemas, +150 edificações,
 * +1.200 relatórios, 100% conformidade…) NÃO entram: são números de
 * layout, não fatos confirmados.
 *
 * ⚠️ PENDENTE DE VALIDAÇÃO FINAL DA VIVA. Quando a lista definitiva
 * chegar, é trocar aqui — nenhum componente muda.
 *
 * "+15 anos": a VIVA confirmou 16 anos e pediu para publicar "mais de
 * 15". Continua verdadeiro por mais quatro anos, sem manutenção.
 */

export type Numero = { valor: string; rotulo: string };

/** A faixa da página-mãe e do institucional. */
export const NUMEROS: Numero[] = [
  { valor: "+15", rotulo: "anos de experiência" },
  { valor: "+10.000", rotulo: "laudos entregues" },
  { valor: "+30", rotulo: "obras entregues em 2026" },
  { valor: "+20", rotulo: "itens no Relatório Tecno-Fotográfico" },
];

/**
 * O trio de selos que aparece ao lado do texto em cada página de área.
 * Dois são qualitativos; o terceiro é o único número por página que a
 * VIVA confirmou.
 */
export const SELOS_AREA = [
  { titulo: "Projetos", subtitulo: "personalizados" },
  { titulo: "Execução", subtitulo: "com qualidade" },
] as const;

export const SELO_OBRAS = {
  valor: "+30",
  rotulo: "obras entregues em 2026",
} as const;

export const NUMEROS_NOTA =
  "O que já entregamos, sem adjetivo: obra executada, documentação aprovada e cliente atendido.";
