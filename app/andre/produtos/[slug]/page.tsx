import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/andre/detail-page";
import { PRODUTOS, findBySlug } from "@/components/andre/site-data";

export function generateStaticParams() {
  return PRODUTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = findBySlug(PRODUTOS, slug);
  if (!item) return {};
  return {
    title: `${item.titulo} — Climafrio | São Paulo`,
    description: item.resumo,
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = findBySlug(PRODUTOS, slug);
  if (!item) notFound();

  return (
    <DetailPage
      n="03"
      kicker="Linha de produto"
      item={item}
      parent={{ label: "Produtos", href: "/andre/produtos" }}
      related={PRODUTOS.filter((p) => p.slug !== item.slug)}
      relatedTitle="Outras linhas de produto"
      relatedBase="/andre/produtos"
    />
  );
}
