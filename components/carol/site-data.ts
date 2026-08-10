/* Conteúdo central da LP da Carolina Kühn — copy, números e links.
   Fonte: briefing + prints do Instagram Insights (ago/2026).
   Atualizar métricas aqui quando a Carol mandar prints novos. */

export const IG_HANDLE = "daybycarolk";
export const IG_URL = `https://www.instagram.com/${IG_HANDLE}/`;
export const TIKTOK_URL = `https://www.tiktok.com/@${IG_HANDLE}`;

/* Link direto pra DM do Instagram — CTA de orçamento enquanto a Carol
   não define e-mail/WhatsApp comerciais. */
export const ORCAMENTO_URL = `https://ig.me/m/${IG_HANDLE}`;

/* TODO: preencher quando a Carol passar — seções renderizam
   condicionalmente enquanto estiverem vazios. */
export const EMAIL_CONTATO = "";
export const WHATSAPP_URL = "";
export const COMUNIDADE_URL = ""; // fallback: DM do Instagram

/* Depoimentos da comunidade — aguardando autorização das participantes
   pra uso público (briefing). Ligar quando os prints forem liberados. */
export const MOSTRAR_DEPOIMENTOS = false;
export const DEPOIMENTOS: { nome: string; texto: string }[] = [];

/* ---------- números — últimos 30 dias ---------- */
/* Prints do Insights (10/ago/2026); interações/visitas/cliques do briefing. */

export const METRICAS = [
  { valor: "2,16 mi", rotulo: "visualizações", detalhe: "96,2% de público novo" },
  { valor: "1,26 mi", rotulo: "contas alcançadas", detalhe: "alcance orgânico" },
  { valor: "431,8 mil", rotulo: "interações", detalhe: "288,4 mil contas engajadas" },
  { valor: "+3.704", rotulo: "novos seguidores", detalhe: "em 30 dias" },
  { valor: "98,2%", rotulo: "das views em Reels", detalhe: "vídeo é o formato dela" },
  { valor: "16.095", rotulo: "visitas ao perfil", detalhe: "476 cliques no link" },
] as const;

export const AUDIENCIA = [
  { rotulo: "Mulheres", valor: 92 },
  { rotulo: "25–34 anos", valor: 50.5 },
  { rotulo: "Brasil", valor: 81.5 },
] as const;

/* Estatísticas de mercado sobre UGC (briefing) */
export const UGC_STATS = [
  {
    valor: "92%",
    texto: "dos consumidores confiam mais em UGC do que em publicidade tradicional",
  },
  {
    valor: "75%",
    texto: "afirmam que UGC influencia fortemente a decisão de compra",
  },
  {
    valor: "56%",
    texto: "consideram UGC mais confiável do que conteúdo produzido pela própria marca",
  },
  {
    valor: "+29%",
    texto: "de taxa de conversão em campanhas que usam UGC",
  },
] as const;

/* Marcas em que a Carol atuou nos bastidores (estratégia/criação) */
export const MARCAS = [
  "Nestlé",
  "Itaú",
  "Caudalie",
  "McDonald's",
  "Apple",
  "ONU",
  "Clinique",
] as const;

/* ---------- portfólio ---------- */
/* Reels enviados pela Carol (03/ago). Capas: fotos reais do Drive
   "Fotos Profissionais - Carolina Kühn UGC" (public/carol/). */

export const REELS = [
  {
    categoria: "Moda",
    descricao: "Looks, provadores e styling",
    url: "https://www.instagram.com/reel/DR5LCPKEunE/",
    img: "/carol/reel-moda.webp",
  },
  {
    categoria: "Lifestyle",
    descricao: "Rotina, viagens e dia a dia",
    url: "https://www.instagram.com/reel/DRAG8ByEYRV/",
    img: "/carol/reel-lifestyle.webp",
  },
  {
    categoria: "Review de produto",
    descricao: "Análises honestas que geram confiança",
    url: "https://www.instagram.com/reel/DOrUX3PEmuR/",
    img: "/carol/reel-review.webp",
  },
  {
    categoria: "Fitness",
    descricao: "Treino, wellness e performance",
    url: "https://www.instagram.com/p/DRfMbjKkdD4/",
    img: "/carol/reel-fitness.webp",
  },
  {
    categoria: "Unboxing",
    descricao: "Primeira impressão em tempo real",
    url: "https://www.instagram.com/reel/DQ70D-WEYNx/",
    img: "/carol/reel-unboxing.webp",
  },
  {
    categoria: "GRWM & Beleza",
    descricao: "Get ready with me, skincare e make",
    url: "https://www.instagram.com/reel/DaGrF33NXf7/",
    img: "/carol/reel-grwm.webp",
  },
] as const;

/* Ensaios fotográficos — fotos reais do Drive da Carol */
export const FOTOS_AUTORAIS = [
  "/carol/foto-1.webp",
  "/carol/foto-2.webp",
  "/carol/foto-3.webp",
  "/carol/foto-4.webp",
  "/carol/foto-5.webp",
  "/carol/foto-6.webp",
  "/carol/foto-7.webp",
  "/carol/foto-8.webp",
  "/carol/foto-9.webp",
  "/carol/foto-10.webp",
] as const;

/* Cards do hero (carrossel diagonal de fundo) — fotos reais da Carol */
export const HERO_CARDS = [
  { id: 1, url: "/carol/hero-1.webp", title: "Editorial" },
  { id: 2, url: "/carol/hero-2.webp", title: "Moda" },
  { id: 3, url: "/carol/hero-3.webp", title: "Bastidores de criação" },
  { id: 4, url: "/carol/hero-4.webp", title: "Styling" },
  { id: 5, url: "/carol/hero-5.webp", title: "Campanha" },
  { id: 6, url: "/carol/hero-6.webp", title: "Ensaio" },
  { id: 7, url: "/carol/hero-7.webp", title: "Fitness" },
  { id: 8, url: "/carol/hero-8.webp", title: "Atelier" },
] as const;

/* ---------- serviços ---------- */

export const SERVICOS = [
  { icone: "Camera", titulo: "Fotografia profissional", texto: "Fotos autorais com olhar editorial — um raro diferencial entre creators." },
  { icone: "Clapperboard", titulo: "Filmagem de alta qualidade", texto: "Captação pensada pra reter atenção nos 3 primeiros segundos." },
  { icone: "Film", titulo: "Edição profissional", texto: "Cortes, ritmo e legendas que seguram o viewer até o CTA." },
  { icone: "Lightbulb", titulo: "Conceitos e ideias", texto: "Criação estratégica: cada vídeo nasce de um objetivo de negócio." },
  { icone: "Mic", titulo: "Narração e fala direta", texto: "Presença de câmera vinda do ballet — técnica, não improviso." },
  { icone: "ScrollText", titulo: "Roteiro", texto: "Escrita e leitura de roteiro com storytelling que converte." },
  { icone: "Quote", titulo: "Depoimentos", texto: "Testemunhos com tom real — o formato que mais gera confiança." },
  { icone: "PackageOpen", titulo: "Demonstração & unboxing", texto: "Produto em uso, primeira impressão e prova social autêntica." },
  { icone: "Sparkles", titulo: "GRWM & lifestyle", texto: "O formato queridinho do público feminino 25–34." },
  { icone: "Plane", titulo: "Filmagens aéreas", texto: "Tomadas de drone pra elevar a produção do seu conteúdo." },
] as const;

/* ---------- processo ---------- */

export const PROCESSO = [
  { titulo: "Briefing e contrato", texto: "Alinhamento de objetivo, formato, tom e prazos — tudo documentado." },
  { titulo: "50% do pagamento", texto: "Sinal adiantado que reserva a produção na agenda." },
  { titulo: "Pesquisa e roteiro", texto: "Estudo do produto, do público e da concorrência antes de gravar." },
  { titulo: "Filmagem e edição", texto: "Captação e pós-produção com padrão profissional." },
  { titulo: "Aprovação", texto: "Prévia enviada com marca d'água pra revisão da marca." },
  { titulo: "Entrega final", texto: "Arquivos finais liberados após a confirmação do pagamento." },
] as const;

/* ---------- investimento ---------- */

export const MODELOS = [
  {
    nome: "Creator + Distribuição",
    tag: "Alcance da audiência",
    descricao:
      "Conteúdo criado e publicado no perfil da Carolina. Sua marca aparece pra uma audiência de mais de 1,2 milhão de contas alcançadas por mês — 92% mulheres, maioria de 25 a 34 anos.",
    beneficios: [
      "Publicação no @daybycarolk (Reels + Stories)",
      "Exposição pra audiência qualificada dela",
      "Prova social pública no perfil",
      "Métricas de performance compartilhadas",
    ],
  },
  {
    nome: "UGC para seus canais",
    tag: "Conteúdo sob medida",
    descricao:
      "Conteúdo produzido e entregue direto pra marca usar nos próprios canais — anúncios, site e redes — sem publicação no perfil da Carolina. UGC puro, com direitos de uso definidos em contrato.",
    beneficios: [
      "Vídeos prontos pra Meta Ads e TikTok Ads",
      "Formato nativo, cara de conteúdo orgânico",
      "Direitos de uso conforme contrato",
      "Variações de gancho pra teste A/B",
    ],
  },
] as const;
