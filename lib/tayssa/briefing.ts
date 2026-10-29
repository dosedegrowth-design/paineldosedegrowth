/**
 * O briefing da Tayssa: as partes do formulário, o formato das respostas e
 * a conta do progresso. Puro (sem banco, sem React) para ser testado e
 * usado dos dois lados. As regras de validação ficam na action.
 */

export type SecaoId = "voce" | "servicos" | "atendimento" | "midia" | "depoimentos" | "vip" | "numeros" | "marca" | "final";

export type TipoArquivo =
  | "trabalho"
  | "retrato"
  | "estudio"
  | "flor"
  | "video_abertura"
  | "video_processo"
  | "depoimento"
  | "insights"
  | "logo";

export type ArquivoBriefing = {
  id: string;
  tipo: TipoArquivo;
  url: string;
  nome: string;
  mime: string;
  bytes: number | null;
  tecnica: string | null;
};

export type ServicoBriefing = {
  nome: string;
  frase: string;
  diferencial: string;
  duracao: string;
  valor: string;
  mostrarValor: boolean;
};

export type Depoimento = { nome: string; texto: string; autorizou: boolean };
export type Numero = { valor: string; rotulo: string };
export type Conferencia = { ok: "" | "sim" | "mudar"; texto: string };

export type Respostas = {
  voce: { nome: string; bio: string; tempo: string; formacao: string };
  servicos: { itens: ServicoBriefing[] };
  atendimento: {
    dias: number[];
    horarios: string;
    antecedencia: string;
    sinal: string;
    pix: string;
    pagamentos: string[];
    atraso: string;
    endereco: string;
    mostrarEndereco: "" | "completo" | "bairro" | "nao";
  };
  midia: { drive: string };
  depoimentos: { itens: Depoimento[] };
  vip: { beneficios: Record<string, Conferencia> };
  numeros: { periodo: string; itens: Numero[] };
  marca: { instagram: string; whatsapp: string; logo: "" | "sim" | "nao" };
  final: { recado: string };
};

/** Cada parte guarda as respostas e se ela marcou "pronto". */
export type Parte<K extends SecaoId> = Respostas[K] & { pronto?: boolean };

export type Secao = {
  id: SecaoId;
  titulo: string;
  /** onde a resposta aparece — o porquê de perguntar */
  para: string;
  /** opcional não entra na conta do progresso */
  opcional?: boolean;
};

export const SECOES: Secao[] = [
  { id: "voce", titulo: "Você", para: "Vira a parte “Tayssa, de perto” do site." },
  { id: "servicos", titulo: "Seus serviços", para: "Aparecem na lista de serviços e na hora de agendar." },
  { id: "atendimento", titulo: "Como você atende", para: "Vira a agenda do site e a parte “Atendimento”." },
  { id: "midia", titulo: "Fotos e vídeos", para: "O original do rolo da câmera deixa o site nítido. Do Instagram sai borrado." },
  { id: "depoimentos", titulo: "Depoimentos", para: "Frases de clientes, com a autorização delas." },
  { id: "vip", titulo: "Regras do VIP", para: "É o que o VIP promete hoje às clientes. Confira cada uma." },
  { id: "numeros", titulo: "Seus números", para: "Um quadro com números do Instagram. Só aparece se você quiser.", opcional: true },
  { id: "marca", titulo: "Marca e contato", para: "Instagram, WhatsApp e logotipo do site." },
  { id: "final", titulo: "Para fechar", para: "Qualquer coisa que você queira contar." },
];

export const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export const PAGAMENTOS = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"] as const;

/** As técnicas de cada foto do trabalho, na lista que ela pediu (sem fio a fio nem russo). */
export const TECNICAS = [
  "Volume brasileiro",
  "Mega brasileiro",
  "Volume inglês",
  "Mega inglês",
  "Volume egípcio",
  "Volume marrom",
  "Volume Fox eyes",
  "Mega Fox eyes",
  "Lash lifting",
  "Manutenção",
  "Brow Lamination",
  "Sobrancelha",
  "Hidragloss",
  "Spa dos lábios",
  "Outro",
] as const;

/** Os grupos de arquivo da parte "Fotos e vídeos" (os outros moram na sua parte). */
export const GRUPOS_MIDIA: { tipo: TipoArquivo; titulo: string; dica: string; varios: boolean; aceita: "foto" | "video" | "ambos" }[] = [
  { tipo: "trabalho", titulo: "Fotos do seu trabalho", dica: "De 6 a 10, originais, de preferência em pé. Diga a técnica de cada uma.", varios: true, aceita: "foto" },
  { tipo: "video_abertura", titulo: "Vídeo de abertura", dica: "6 a 10 segundos, sem som. Pode ser um em pé e um deitado.", varios: true, aceita: "video" },
  { tipo: "video_processo", titulo: "Vídeo do processo", dica: "20 a 40 segundos da aplicação de perto, sem legenda.", varios: true, aceita: "video" },
  { tipo: "estudio", titulo: "O estúdio", dica: "A cadeira, a luz, a parede da flor. Foto ou vídeo curto.", varios: true, aceita: "ambos" },
  { tipo: "flor", titulo: "A flor da parede", dica: "Uma foto de frente, com boa luz. Vira o desenho da marca.", varios: false, aceita: "foto" },
];

/** Em que parte cada tipo de arquivo mora (subir arquivo também é responder). */
export const SECAO_DO_TIPO: Record<TipoArquivo, SecaoId> = {
  trabalho: "midia",
  video_abertura: "midia",
  video_processo: "midia",
  estudio: "midia",
  flor: "midia",
  retrato: "voce",
  depoimento: "depoimentos",
  insights: "numeros",
  logo: "marca",
};

export const NOMES_TIPO: Record<TipoArquivo, string> = {
  trabalho: "Trabalho",
  retrato: "Retrato",
  estudio: "Estúdio",
  flor: "Flor da parede",
  video_abertura: "Vídeo de abertura",
  video_processo: "Vídeo do processo",
  depoimento: "Print de depoimento",
  insights: "Print do Insights",
  logo: "Logotipo",
};

const tem = (s: string | undefined | null) => Boolean(s && s.trim());

/**
 * Uma parte está feita quando ela marcou "pronto". Sem isso, conta como
 * feita só se já tem o essencial respondido — assim quem só digita e sai
 * não perde o progresso.
 */
export function parteFeita(id: SecaoId, parte: (Partial<Respostas[SecaoId]> & { pronto?: boolean }) | undefined, arquivos: ArquivoBriefing[]): boolean {
  if (parte?.pronto) return true;
  if (!parte) return false;
  const p = parte as Record<string, unknown>;
  const conta = (tipo: TipoArquivo) => arquivos.filter((a) => a.tipo === tipo).length;
  switch (id) {
    case "voce":
      return tem(p.bio as string) && (p.bio as string).trim().length >= 40;
    case "servicos":
      return ((p.itens as ServicoBriefing[]) ?? []).some((s) => tem(s.nome) && (tem(s.frase) || tem(s.duracao)));
    case "atendimento":
      return ((p.dias as number[]) ?? []).length > 0 && tem(p.horarios as string);
    case "midia":
      return conta("trabalho") >= 3 || tem(p.drive as string);
    case "depoimentos":
      return ((p.itens as Depoimento[]) ?? []).some((d) => tem(d.texto)) || conta("depoimento") > 0;
    case "vip": {
      const b = Object.values((p.beneficios as Record<string, Conferencia>) ?? {});
      return b.length > 0 && b.every((c) => c.ok === "sim" || (c.ok === "mudar" && tem(c.texto)));
    }
    case "numeros":
      return ((p.itens as Numero[]) ?? []).some((n) => tem(n.valor)) || conta("insights") > 0;
    case "marca":
      return tem(p.instagram as string) && tem(p.whatsapp as string) && p.logo !== "";
    case "final":
      return false;
  }
}

/** Quantas partes contam (as opcionais e o fechamento ficam fora) e quantas estão feitas. */
export function progresso(partes: Partial<Record<SecaoId, { pronto?: boolean } & Record<string, unknown>>>, arquivos: ArquivoBriefing[]) {
  const contam = SECOES.filter((s) => !s.opcional && s.id !== "final");
  const feitas = contam.filter((s) => parteFeita(s.id, partes[s.id] as never, arquivos)).length;
  return { feitas, total: contam.length };
}
