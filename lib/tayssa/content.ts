/**
 * Conteúdo institucional do site — o que só a Tayssa pode dizer.
 *
 * Cada campo começa VAZIO (null / lista vazia) de propósito: nada aqui é
 * inventado. Uma seção só aparece no site publicado quando o conteúdo
 * dela existe de verdade. Para revisar a estrutura com os espaços
 * reservados, abra o site com `?estrutura=1` — os campos pendentes
 * aparecem marcados, com o que falta e para que serve.
 *
 * Preencher = trocar o null pelo texto real (ou subir a mídia com o nome
 * do manifesto em lib/tayssa/media.ts e lib/tayssa/photos.ts).
 */

export type ServicoDetalhe = {
  /** ex.: "2h a 2h30" — só o que a Tayssa confirmar */
  duracao?: string;
  /** só se ela quiser divulgar; senão fica "valor no WhatsApp" */
  preco?: string;
  /** o que diferencia o atendimento dela neste serviço */
  diferencial?: string;
  /** para quem é / quando indicar */
  indicacao?: string;
};

export type Depoimento = {
  /** primeiro nome ou como a cliente autorizou ser citada */
  nome: string;
  texto: string;
  /** de onde veio: "Instagram", "WhatsApp" — com autorização da cliente */
  fonte: string;
};

export type Horario = { dias: string; horas: string };

/** Um vídeo do Instagram que toca no próprio site, com o link do post. */
export type ReelInstagram = {
  /** arquivo do vídeo (public/tayssa/videos/instagram/… ou URL do Storage) */
  video: string;
  /** imagem de capa enquanto o vídeo carrega (opcional) */
  poster?: string;
  /** link da publicação no Instagram */
  url: string;
  legenda?: string;
};

export type ConteudoSite = {
  sobre: {
    /** 2 a 4 parágrafos curtos, na voz dela */
    bio: string[] | null;
    /** formação/cursos que ela queira mostrar, com nome real da instituição */
    formacao: string[] | null;
    /** frase de assinatura dela (opcional) */
    assinatura: string | null;
  };
  espaco: {
    /** como é o estúdio: 1 parágrafo */
    descricao: string | null;
    /** endereço como ela quer publicar (pode ser só bairro/cidade) */
    endereco: string | null;
    /** link do Google Maps, se ela quiser */
    mapaUrl: string | null;
  };
  atendimento: {
    horarios: Horario[] | null;
    /** como se agenda: só WhatsApp? com sinal? antecedência? */
    comoAgendar: string[] | null;
    /** política de atraso/cancelamento, se existir */
    politica: string[] | null;
    /** formas de pagamento aceitas */
    pagamento: string[] | null;
  };
  /** só com autorização de cada cliente — nunca escrito por nós */
  depoimentos: Depoimento[];
  /** vídeos do Instagram que tocam no site (chegam no fim do projeto) */
  instagram: ReelInstagram[];
  /** detalhes por slug do catálogo (vip.services) */
  servicos: Record<string, ServicoDetalhe>;
};

export const CONTEUDO: ConteudoSite = {
  sobre: { bio: null, formacao: null, assinatura: null },
  espaco: { descricao: null, endereco: null, mapaUrl: null },
  atendimento: { horarios: null, comoAgendar: null, politica: null, pagamento: null },
  depoimentos: [],
  instagram: [],
  servicos: {},
};

/** A seção tem algo real para mostrar no site publicado? */
export const temSobre = (c: ConteudoSite) => Boolean(c.sobre.bio?.length);
export const temEspaco = (c: ConteudoSite) => Boolean(c.espaco.descricao || c.espaco.endereco);
export const temAtendimento = (c: ConteudoSite) =>
  Boolean(c.atendimento.horarios?.length || c.atendimento.comoAgendar?.length || c.espaco.endereco);
export const temDepoimentos = (c: ConteudoSite) => c.depoimentos.length > 0;
