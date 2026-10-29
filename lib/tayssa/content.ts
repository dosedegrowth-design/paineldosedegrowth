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
  // ela quer mostrar só o bairro
  espaco: { descricao: null, endereco: "Pirituba, São Paulo", mapaUrl: null },
  atendimento: {
    // os horários saem da agenda (Configurações → Agenda): mudou lá, muda aqui
    horarios: null,
    // o sinal e a antecedência também vêm da agenda (visit-info.tsx)
    comoAgendar: ["Escolha o serviço, o dia e o horário aqui no site. O pedido chega pronto no WhatsApp da Tayssa."],
    politica: [
      "10 minutos de tolerância para atraso.",
      "Remarcando com 48 horas de antecedência ou mais, o sinal vale para a nova data.",
      "Com menos de 48 horas, ou se você não vier, o sinal não é devolvido.",
    ],
    pagamento: ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"],
  },
  depoimentos: [],
  instagram: [],
  // o que a Tayssa escreveu no formulário (28/10/2026), sem os erros do ditado
  servicos: {
    "volume-fox-eyes": {
      diferencial:
        "Os comprimentos são distribuídos para alongar o olhar. O mapeamento segue o formato dos seus olhos e o efeito que você quer, sem perder a harmonia.",
    },
    "lash-lifting": {
      diferencial:
        "Curva e modela os seus próprios fios para realçar o olhar. Antes, uma avaliação confere se o comprimento e a quantidade de cílios são adequados.",
    },
    "remocao-extensao": {
      diferencial: "Produtos próprios dissolvem a cola e soltam os fios, com cuidado para evitar puxões e poupar os seus cílios naturais.",
    },
    "brow-lamination": {
      diferencial:
        "Produtos específicos remodelam por um tempo a direção dos fios. O resultado se adapta ao formato do rosto e ao efeito desejado, respeitando cada sobrancelha.",
    },
    "design-sobrancelhas": {
      diferencial:
        "A remoção dos pelos é estratégica e o desenho é personalizado: formato do rosto, crescimento dos fios e o que você prefere, sem molde único.",
    },
    hidragloss: {
      diferencial: "Um protocolo de hidratação labial que inclui microagulhamento. O foco é a hidratação e o aspecto dos lábios, não o preenchimento.",
    },
    "lip-spa": {
      diferencial: "Etapas de preparação e hidratação, com atenção ao conforto e ao que os seus lábios precisam.",
    },
  },
};

/** A seção tem algo real para mostrar no site publicado? */
export const temSobre = (c: ConteudoSite) => Boolean(c.sobre.bio?.length);
/** o estúdio abre com a descrição dela (ou foto e vídeo do lugar); o bairro sozinho vai no Atendimento */
export const temEspaco = (c: ConteudoSite) => Boolean(c.espaco.descricao);
export const temAtendimento = (c: ConteudoSite) =>
  Boolean(c.atendimento.horarios?.length || c.atendimento.comoAgendar?.length || c.espaco.endereco);
export const temDepoimentos = (c: ConteudoSite) => c.depoimentos.length > 0;
