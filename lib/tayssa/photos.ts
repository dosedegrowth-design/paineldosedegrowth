/**
 * Fotografia real — manifesto de slots.
 *
 * As fotos do @1.tayssa entram em `public/tayssa/photos/` com estes nomes.
 * Enquanto o arquivo não existe, o componente <RealPhoto> renderiza um
 * campo tonal com legenda — nunca imagem sintética, nunca stock.
 *
 * Trocar a foto = trocar o arquivo. Nada de redesenho.
 */

export type PhotoSlot = {
  src: string;
  alt: string;
  /** proporção largura/altura usada no fallback e no layout */
  ratio: number;
  /** legenda curta opcional (aparece no hover / abaixo) */
  caption?: string;
};

const base = "/tayssa/photos";

export const PHOTOS = {
  hero: {
    src: `${base}/hero.jpg`,
    alt: "Cílios aplicados pela Tayssa, close-up do olhar",
    ratio: 4 / 5,
    caption: "Olhar · aplicação",
  },
  // sem legenda e sem nome de técnica: estes três são recortes do mesmo
  // close que a Tayssa publicou, e nada no arquivo diz qual técnica está
  // ali. Afirmar "fio a fio" aqui seria inventar o trabalho dela.
  work01: {
    src: `${base}/work-01.jpg`,
    alt: "Cílios aplicados pela Tayssa, close do olhar",
    ratio: 4 / 5,
  },
  work02: {
    src: `${base}/work-02.jpg`,
    alt: "Cílios aplicados pela Tayssa, desenho da curvatura",
    ratio: 4 / 5,
  },
  work03: {
    src: `${base}/work-03.jpg`,
    alt: "Cílios aplicados pela Tayssa, detalhe das pontas",
    ratio: 4 / 5,
  },
  serviceLash: {
    src: `${base}/service-lash.jpg`,
    alt: "Aplicação de cílios",
    ratio: 3 / 4,
  },
  serviceMaintenance: {
    src: `${base}/service-maintenance.jpg`,
    alt: "Manutenção de cílios",
    ratio: 3 / 4,
  },
  serviceBrow: {
    src: `${base}/service-brow.jpg`,
    alt: "Design de sobrancelhas",
    ratio: 3 / 4,
  },
  serviceLip: {
    src: `${base}/service-lip.jpg`,
    alt: "Lip spa",
    ratio: 3 / 4,
  },
  serviceFacial: {
    src: `${base}/service-facial.jpg`,
    alt: "Limpeza de pele",
    ratio: 3 / 4,
  },
  detail01: { src: `${base}/detail-01.jpg`, alt: "Detalhe do trabalho", ratio: 4 / 5 },
  detail02: { src: `${base}/detail-02.jpg`, alt: "Publicação do Instagram @1.tayssa", ratio: 4 / 5 },
  detail03: { src: `${base}/detail-03.jpg`, alt: "Detalhe do estúdio", ratio: 3 / 4 },
  detail04: { src: `${base}/detail-04.jpg`, alt: "Publicação do Instagram @1.tayssa", ratio: 4 / 5 },
  detail05: { src: `${base}/detail-05.jpg`, alt: "Resultado de cliente", ratio: 4 / 5 },
  detail06: { src: `${base}/detail-06.jpg`, alt: "Publicação do Instagram @1.tayssa", ratio: 4 / 5 },
  studio: {
    src: `${base}/studio.jpg`,
    alt: "Ambiente do estúdio da Tayssa",
    ratio: 16 / 10,
  },
  entrance: {
    src: `${base}/entrance.jpg`,
    alt: "Detalhe do trabalho da Tayssa",
    ratio: 3 / 4,
  },
  vip: {
    src: `${base}/vip.jpg`,
    alt: "Estúdio da Tayssa",
    ratio: 16 / 10,
  },
} satisfies Record<string, PhotoSlot>;

export type PhotoKey = keyof typeof PHOTOS;

/** Foto da biblioteca (banco) no formato que <RealPhoto> consome. */
export type LibraryPhoto = {
  id: string;
  public_url: string;
  lash_style: string;
  caption: string | null;
  alt: string;
  width: number | null;
  height: number | null;
  featured: boolean;
};

export function slotFromPhoto(p: LibraryPhoto, ratio?: number): PhotoSlot {
  const natural = p.width && p.height ? p.width / p.height : undefined;
  return {
    src: p.public_url,
    alt: p.alt,
    ratio: ratio ?? natural ?? 4 / 5,
    caption: p.caption ?? p.lash_style,
  };
}

export type PhotoAssignment = {
  /** undefined quando não existe foto real — a composição se vira sem ela */
  hero?: PhotoSlot;
  entrance?: PhotoSlot;
  work: PhotoSlot[];
  details: PhotoSlot[];
  byService: Record<string, PhotoSlot>;
  /** sequência para a frente do cartão (destaques primeiro) */
  card: PhotoSlot[];
};

/**
 * As três técnicas da sequência de trabalho, na ordem em que o site as
 * mostra, com as palavras que identificam cada uma no nome que a Tayssa
 * dá à foto (`lash_style`).
 */
const WORK_KEYWORDS: string[][] = [
  ["fio a fio", "fio-a-fio", "fio", "clássico", "classico"],
  ["volume", "russo", "brasileiro", "egípcio", "egipcio"],
  ["manuten"],
];

const SERVICE_KEYWORDS: Record<string, string[]> = {
  "manutencao-cilios": ["manuten"],
  "design-sobrancelhas": ["sobrancelh", "brow"],
  "lip-spa": ["lip", "lábio", "labio"],
  "limpeza-de-pele": ["limpeza", "pele", "skin"],
  "aplicacao-cilios": ["volume", "fio", "cílio", "cilio", "lash"],
};

/**
 * Distribui a biblioteca pelos lugares do site. Regra simples e
 * previsível: destaques primeiro; cada lugar recebe as próximas fotos;
 * onde faltar, entra o slot estático (que vira campo tonal se não houver
 * arquivo). A Tayssa só sobe a foto — aqui ela encontra o lugar.
 */
export function assignPhotos(library: LibraryPhoto[]): PhotoAssignment {
  const ordered = [...library].sort((a, b) => Number(b.featured) - Number(a.featured));
  const slots = ordered.map((p) => slotFromPhoto(p));
  const take = (n: number, from: number) => slots.slice(from, from + n);
  const hero = slots[0] ?? PHOTOS.hero;
  // A sequência de trabalho é por TÉCNICA, não por ordem de destaque.
  // Pegar a 2ª, 3ª e 4ª foto da fila fazia o site pôr uma foto de
  // sobrancelha debaixo do título "Fio a fio". Então cada técnica recebe a
  // primeira foto cujo nome a declara; quem não tiver foto declarada fica
  // com o estático, que não afirma técnica nenhuma.
  const estaticos = [PHOTOS.work01, PHOTOS.work02, PHOTOS.work03];
  const usadas = new Set<string>();
  const work = WORK_KEYWORDS.map((palavras, i) => {
    const achou = ordered.find(
      (p) => !usadas.has(p.id) && palavras.some((w) => p.lash_style.toLowerCase().includes(w))
    );
    if (achou) {
      usadas.add(achou.id);
      return slotFromPhoto(achou);
    }
    return estaticos[i];
  });
  const detailStatics = [PHOTOS.detail01, PHOTOS.detail02, PHOTOS.detail03, PHOTOS.detail04, PHOTOS.detail05, PHOTOS.detail06];
  const details = detailStatics.map((st, i) => take(1, 4 + i)[0] ?? st);
  const byService: Record<string, PhotoSlot> = {};
  for (const [slug, words] of Object.entries(SERVICE_KEYWORDS)) {
    const hit = ordered.find((p) => words.some((w) => p.lash_style.toLowerCase().includes(w)));
    if (hit) byService[slug] = slotFromPhoto(hit, 3 / 4);
  }
  return {
    hero,
    entrance: slots[1] ?? slots[0] ?? PHOTOS.entrance,
    work,
    details,
    byService,
    card: slots.length ? slots.slice(0, 6) : [PHOTOS.hero, PHOTOS.work01, PHOTOS.work02, PHOTOS.work03],
  };
}
