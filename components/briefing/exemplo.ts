import { GRUPOS_MIDIA, type Respostas, type SecaoId } from "@/lib/tayssa/briefing";
import type { BeneficioAtual, BriefingCompleto } from "@/lib/tayssa/queries/briefing";

/**
 * A cópia de exemplo do briefing (/briefing/exemplo): o mesmo formulário
 * que a Tayssa respondeu, vazio e sem dado de cliente, para mostrar em
 * outros projetos. Não fala com o banco: o que a pessoa escreve fica só no
 * aparelho dela (localStorage) e nada chega à DDG.
 */
const CHAVE = "ddg-briefing-exemplo";

type Guardado = { partes: BriefingCompleto["partes"]; enviadoEm: string | null };

export function lerExemplo(): Guardado {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const g = (bruto ? JSON.parse(bruto) : {}) as Partial<Guardado>;
    return {
      partes: g.partes && typeof g.partes === "object" ? g.partes : {},
      enviadoEm: typeof g.enviadoEm === "string" ? g.enviadoEm : null,
    };
  } catch {
    return { partes: {}, enviadoEm: null };
  }
}

function gravar(g: Guardado): boolean {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(g));
    return true;
  } catch {
    // aba anônima ou armazenamento cheio: o formulário segue, só não guarda
    return false;
  }
}

/** O mesmo formato que o banco guarda: as respostas da parte e se ela marcou "pronto". */
export function guardarParteExemplo(secao: SecaoId, dados: Record<string, unknown>): boolean {
  const g = lerExemplo();
  return gravar({ ...g, partes: { ...g.partes, [secao]: dados } });
}

export function enviarExemplo(): string {
  const enviadoEm = new Date().toISOString();
  gravar({ ...lerExemplo(), enviadoEm });
  return enviadoEm;
}

/** Onde cada resposta aparece, sem o que é só do site da Tayssa. */
export const PARA_EXEMPLO: Partial<Record<SecaoId, string>> = {
  voce: "Vira a parte “Sobre você” do site.",
};

/** As fotos e vídeos, sem o que é só do estúdio da Tayssa (a parede da flor). */
export const GRUPOS_MIDIA_EXEMPLO = GRUPOS_MIDIA.filter((g) => g.tipo !== "flor").map((g) =>
  g.tipo === "estudio" ? { ...g, dica: "Onde você atende: a cadeira, a luz, os detalhes. Foto ou vídeo curto." } : g
);

/** Tudo em branco: nada do que a Tayssa respondeu aparece aqui. */
export const PADROES_EXEMPLO: Respostas = {
  voce: { nome: "", bio: "", tempo: "", formacao: "" },
  servicos: { itens: [{ nome: "", frase: "", diferencial: "", duracao: "", valor: "", mostrarValor: true }] },
  atendimento: {
    dias: [],
    horarios: "",
    antecedencia: "",
    sinal: "",
    pix: "",
    pagamentos: [],
    atraso: "",
    endereco: "",
    mostrarEndereco: "",
  },
  midia: { drive: "" },
  depoimentos: { itens: [] },
  vip: { beneficios: { cartao: { ok: "", texto: "" }, indicacao: { ok: "", texto: "" } } },
  numeros: {
    periodo: "Últimos 30 dias",
    itens: [
      { valor: "", rotulo: "" },
      { valor: "", rotulo: "" },
    ],
  },
  marca: { instagram: "", whatsapp: "", logo: "" },
  final: { recado: "" },
};

/** Duas regras de um programa de fidelidade qualquer, só para a parte do VIP ter o que conferir. */
export const BENEFICIOS_EXEMPLO: BeneficioAtual[] = [
  {
    key: "cartao",
    nome: "Cartão fidelidade",
    regra: "Ao completar o cartão de 10 visitas confirmadas.",
    descricao: "Um atendimento de presente.",
  },
  {
    key: "indicacao",
    nome: "Indicação",
    regra: "A cada indicação confirmada.",
    descricao: "10% de desconto no próximo atendimento.",
  },
];
