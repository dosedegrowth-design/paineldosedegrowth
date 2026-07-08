import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/andre/detail-page";
import { MARCAS, findBySlug } from "@/components/andre/site-data";

export function generateStaticParams() {
  return MARCAS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = findBySlug(MARCAS, slug);
  if (!item) return {};
  return {
    title: `${item.titulo} — Climafrio | São Paulo`,
    description: item.resumo,
  };
}

export default async function MarcaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = findBySlug(MARCAS, slug);
  if (!item) notFound();

  return (
    <DetailPage
      n="05"
      kicker="Marca parceira"
      item={item}
      parent={{ label: "Marcas", href: "/andre/marcas" }}
      related={MARCAS.filter((m) => m.slug !== item.slug)}
      relatedTitle="Outras marcas parceiras"
      relatedBase="/andre/marcas"
    />
  );
}
