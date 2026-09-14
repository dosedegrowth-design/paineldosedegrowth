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
  work01: {
    src: `${base}/work-01.jpg`,
    alt: "Resultado de aplicação de cílios fio a fio",
    ratio: 4 / 5,
    caption: "Fio a fio",
  },
  work02: {
    src: `${base}/work-02.jpg`,
    alt: "Resultado de aplicação de cílios volume",
    ratio: 4 / 5,
    caption: "Volume",
  },
  work03: {
    src: `${base}/work-03.jpg`,
    alt: "Manutenção de cílios, detalhe",
    ratio: 4 / 5,
    caption: "Manutenção",
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
