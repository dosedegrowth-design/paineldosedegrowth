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
  /** para quem é / quando indicar */
  indicacao?: string;
  /**
   * apresentação das técnicas: a diferença em poucas palavras, das palavras
   * dela; `*assim*` é a palavra em destaque
   */
  frase?: string;
  /** apresentação das técnicas: o jeito dela de fazer (nunca repete a descrição da lista) */
  texto?: string;
};

export type Depoimento = {
  /** o tema da fala ("Durabilidade") ou o primeiro nome, se a cliente autorizou */
  nome: string;
  /** o que a cliente escreveu, transcrito: vira a descrição da imagem (leitor de tela, busca) */
  texto: string;
  /** de onde veio: "Instagram", "WhatsApp" — com autorização da cliente */
  fonte: string;
  /**
   * o print da mensagem, recortado no balão (sem nome, foto ou telefone de
   * cliente; sem o menu do WhatsApp), em public/tayssa/depoimentos/
   */
  print: { src: string; largura: number; altura: number };
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

export type TrechoSobre = {
  rotulo: string;
  paragrafos: string[];
  /** uma frase dela em destaque, fechando a parte (opcional) */
  frase?: string;
};

export type ConteudoSite = {
  sobre: {
    /**
     * a história dela, na voz dela, em partes curtas com um título cada
     * ("Como começou", "Hoje"…). `*assim*` destaca uma frase
     */
    bio: TrechoSobre[] | null;
    /** cursos que ela queira mostrar (todos presenciais), com nome real da instituição */
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
  // a história e os cursos que ela escreveu no formulário (28/10/2026), nas palavras dela
  sobre: {
    // o texto inteiro dela, em quatro partes com título: em bloco único era
    // "um textão" (Lucas, 29/10/2026). Nenhuma palavra saiu; só os cortes de
    // parágrafo e os destaques são nossos
    bio: [
      {
        rotulo: "Como começou",
        paragrafos: [
          "Minha história com os cílios começou em *abril de 2023*, quando eu ainda trabalhava em uma joalheria, estudava e recebia R$\u00a0600 por mês. Foi com esse dinheiro que comecei a juntar para investir no meu primeiro curso.",
          "Depois, fui comprando meus materiais aos poucos, conciliando trabalho, escola e os primeiros atendimentos. Não tinha uma estrutura pronta, mas tinha *vontade de construir algo meu*. Olhando para trás, sinto que encontrei esse caminho antes mesmo de entender tudo o que ele poderia se tornar.",
        ],
      },
      {
        rotulo: "Hoje",
        paragrafos: [
          "Hoje, enxergo os cílios como *o começo de algo muito maior* do que uma profissão. Quero construir uma marca forte, ter minha própria empresa, formar uma equipe em que eu possa confiar e, futuramente, ensinar outras mulheres a construírem seus próprios caminhos.",
          "Não quero oferecer apenas um curso técnico, mas compartilhar conhecimento, mostrar possibilidades e ajudar outras profissionais a desenvolverem não só suas habilidades, mas também seu posicionamento, sua visão de negócio e sua independência.",
        ],
      },
      {
        rotulo: "O que me move",
        paragrafos: [
          "O que me move é saber que posso construir *algo que tenha propósito*. Quero olhar para tudo o que conquistei e sentir que meu trabalho fez diferença, que abriu portas e criou oportunidades. *Minha filha faz parte dessa motivação*, assim como o desejo de conquistar liberdade para viver e escolher o meu futuro.",
        ],
      },
      {
        rotulo: "No atendimento",
        paragrafos: [
          "Na minha profissão, levo esse pensamento para cada atendimento: *escuto, observo, respeito as individualidades e cuido dos detalhes* para que cada cliente se sinta segura, valorizada e à vontade.",
        ],
        frase:
          "Porque, para mim, construir uma marca não é apenas sobre o que eu entrego, mas também sobre o impacto que posso deixar nas pessoas ao longo do caminho.",
      },
    ],
    // todos presenciais (Lucas, 29/10/2026: não há curso on-line)
    formacao: [
      "Extensão de cílios, 2023",
      "Design de sobrancelhas",
      "Hidragloss",
      "Lash lifting",
      "Técnicas de capping",
      "Técnicas de durabilidade da extensão de cílios",
      "Assistente pessoal, SENAC",
      "Informática",
    ],
    assinatura: null,
  },
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
  // as avaliações são os prints que ela mandou no formulário (pedido do Lucas,
  // 29/10/2026): o balão de cada mensagem, recortado do print, sem nome nem
  // foto de cliente. O texto transcrito fica como descrição da imagem. As 5
  // frases que ela escreveu sem print saíram: avaliação no site é print.
  depoimentos: [
    {
      nome: "Fidelidade",
      fonte: "cliente, no WhatsApp",
      texto:
        "Sou cliente da Tayssa há 3 anos e, desde que fui atendida por ela, nunca mais troquei de profissional! Ela é atenciosa, delicada e faz exatamente como você quer. Ela cria um projeto para você, do jeito que você gosta, e esse é o diferencial dela.",
      print: { src: "/tayssa/depoimentos/whatsapp-01.webp", largura: 720, altura: 528 },
    },
    {
      nome: "Durabilidade",
      fonte: "cliente, no WhatsApp",
      texto:
        "Os cílios ficam lindos, com um resultado natural e perfeito, e a durabilidade é incrível: durou 29 dias completos sem cair um cílio meu. Sempre saio me sentindo linda e muito mais confiante. Recomendo de olhos fechados!",
      print: { src: "/tayssa/depoimentos/whatsapp-02.webp", largura: 720, altura: 782 },
    },
    {
      nome: "Autoestima",
      fonte: "cliente, no WhatsApp",
      texto:
        "Vai muito além de fazer só os cílios! Eu me sinto muito mais bonita, minha autoestima muda completamente e me sinto muito melhor comigo mesma. Obrigada por realçar ainda mais a minha beleza e cuidar de mim com tanto carinho!",
      print: { src: "/tayssa/depoimentos/whatsapp-03.webp", largura: 720, altura: 597 },
    },
    {
      nome: "Fidelidade",
      fonte: "cliente, no WhatsApp",
      texto:
        "Fiz um teste num dia qualquer e desde então não larguei mais. Não falo isso somente por conta da durabilidade impecável, que me deixa por 1 mês despreocupada e lindíssima: ela preenche perfeitamente e não ficam aquelas falhas. Falo pelo atendimento em si, que cativa.",
      print: { src: "/tayssa/depoimentos/whatsapp-04.webp", largura: 720, altura: 1228 },
    },
    {
      nome: "Fidelidade",
      fonte: "cliente, no WhatsApp",
      texto:
        "Há mais de um ano usufruindo desse trabalho impecável e, sinceramente, nunca cheguei a cogitar procurar outra profissional. Já troquei os métodos e fiquei satisfeita com todos. Qualidade, delicadeza e dedicação com a mesma profissional!",
      print: { src: "/tayssa/depoimentos/whatsapp-05.webp", largura: 720, altura: 817 },
    },
    {
      nome: "Durabilidade",
      fonte: "cliente, no WhatsApp",
      texto:
        "Já faço os meus cílios com a Tayssa há quase um ano. Além de me sentir em casa quando chego, a Tayssa preza por conforto, detalhes e cuidado. A durabilidade dos meus cílios é de exatamente um mês. Não me vejo fazendo cílios com outra pessoa.",
      print: { src: "/tayssa/depoimentos/whatsapp-06.webp", largura: 720, altura: 818 },
    },
    {
      nome: "Atendimento",
      fonte: "cliente, no WhatsApp",
      texto:
        "Tayssa, amei o atendimento! Você é muito atenciosa, cuidadosa e caprichosa no que faz. Fui muito bem atendida e fiquei muito satisfeita com tudo: dá para ver o carinho que você coloca no seu trabalho.",
      print: { src: "/tayssa/depoimentos/whatsapp-07.webp", largura: 720, altura: 528 },
    },
    {
      nome: "Resultado",
      fonte: "cliente, no WhatsApp",
      texto:
        "Meus cílios ficaram lindos, curvados e com um aspecto super natural. O procedimento foi muito tranquilo e o atendimento foi maravilhoso, com muito cuidado e carinho em cada detalhe. Fiquei apaixonada pelo resultado e com certeza faria novamente!",
      print: { src: "/tayssa/depoimentos/whatsapp-08.webp", largura: 720, altura: 477 },
    },
    {
      nome: "Resultado",
      fonte: "cliente, no WhatsApp",
      texto:
        "Eu amo o seu trabalho! Os cílios duram muito, o resultado é sempre perfeito, sem falar do ambiente perfeito e do atendimento impecável. Você é maravilhosa, sucesso sempre!",
      print: { src: "/tayssa/depoimentos/whatsapp-09.webp", largura: 720, altura: 405 },
    },
  ],
  instagram: [],
  // o que a Tayssa escreveu no formulário (28/10/2026), sem os erros do ditado
  // Cada técnica aparece em dois lugares, cada um com uma função (pedido da
  // Tayssa, 29/10/2026: "menos repetição"):
  // - apresentação ("Cada serviço, um olhar"): `frase` (a diferença, em
  //   poucas palavras) e `texto` (o jeito dela de fazer), das palavras dela;
  // - lista de serviços: a descrição curta do serviço (no banco), valor,
  //   tempo e manutenção, e a galeria de fotos.
  // `texto` nunca repete a descrição da lista. Volume egípcio e marrom ainda
  // não têm texto no formulário: entram só com o nome, nada inventado.
  servicos: {
    "volume-brasileiro": {
      frase: "Definido e *expressivo*.",
    },
    "volume-ingles": {
      frase: "Preenchido e *elegante*.",
      texto: "A prioridade é preencher 100% dos seus fios; se você preferir um efeito mais leve, ela ajusta com você.",
    },
    "volume-fox-eyes": {
      frase: "Alongado e *marcante*.",
      texto:
        "Os comprimentos são distribuídos para alongar o olhar. O mapeamento segue o formato dos seus olhos e o efeito que você quer, sem perder a harmonia.",
    },
    "manutencao-cilios": {
      frase: "O cuidado que *mantém* o resultado.",
    },
    "lash-lifting": {
      frase: "Curvatura e *destaque*, sem extensão.",
      texto:
        "O resultado aproveita os seus próprios fios. Antes, uma avaliação confere se o comprimento e a quantidade dos seus cílios são adequados.",
    },
    "remocao-extensao": {
      frase: "Renovar o visual com *segurança*.",
      texto: "Produtos próprios dissolvem a cola e soltam os fios, com cuidado para evitar puxões e poupar os seus cílios naturais.",
    },
    "brow-lamination": {
      frase: "Alinhadas, definidas e *naturais*.",
      texto:
        "Produtos específicos remodelam por um tempo a direção dos fios. O resultado se adapta ao formato do rosto e ao efeito desejado, respeitando cada sobrancelha.",
    },
    "design-sobrancelhas": {
      frase: "Para valorizar os seus *traços*.",
      texto:
        "A remoção dos pelos é estratégica e o desenho é personalizado: formato do rosto, crescimento dos fios e o que você prefere, sem molde único.",
    },
    hidragloss: {
      frase: "Hidratação e *brilho*.",
      texto: "Um protocolo de hidratação labial que inclui microagulhamento.",
    },
    "lip-spa": {
      frase: "Um momento de *cuidado*.",
      texto: "Etapas de preparação e hidratação, com atenção ao conforto e ao que os seus lábios precisam.",
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
