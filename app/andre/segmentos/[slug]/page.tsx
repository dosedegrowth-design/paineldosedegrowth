import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/andre/detail-page";
import { SEGMENTOS_DATA, findBySlug } from "@/components/andre/site-data";

export function generateStaticParams() {
  return SEGMENTOS_DATA.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = findBySlug(SEGMENTOS_DATA, slug);
  if (!item) return {};
  return {
    title: `${item.titulo} — Climafrio | São Paulo`,
    description: item.resumo,
  };
}

export default async function SegmentoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = findBySlug(SEGMENTOS_DATA, slug);
  if (!item) notFound();

  return (
    <DetailPage
      n="04"
      kicker="Segmento"
      item={item}
      parent={{ label: "Segmentos", href: "/andre/segmentos" }}
      related={SEGMENTOS_DATA.filter((s) => s.slug !== item.slug)}
      relatedTitle="Outros segmentos"
      relatedBase="/andre/segmentos"
    />
  );
}
