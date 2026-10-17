import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import Link from "next/link";
import { getPrecosProdutos, listAllPhotos } from "@/lib/tayssa/queries/photos";
import { ROUTES } from "@/lib/tayssa/config";
import { getActiveServices } from "@/lib/tayssa/queries/catalog";
import { assignPhotos, type PhotoSlot } from "@/lib/tayssa/photos";
import { AdminBlock, AdminHeader, Stat } from "@/components/tayssa/admin/shell";
import { PhotoUpload } from "@/components/tayssa/admin/photo-upload";
import { PhotoLibrary } from "@/components/tayssa/admin/photo-library";
import { montarCatalogo } from "@/lib/tayssa/catalogo";
import type { CategoriaMidia } from "@/lib/tayssa/types";

/**
 * Fotos: um lugar só. O que entra aqui aparece no site, na frente do
 * cartão e no que vier — sem subir duas vezes, sem escolher onde vai.
 *
 * Os destinos de cada foto não são chute: saem de `assignPhotos()`, a
 * mesma função que o site público e o cartão usam. Se a regra mudar lá,
 * esta tela muda com ela.
 */
export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  await requireAdminPage();
  const aba = (await searchParams).aba === "site" ? "site" : "galeria";
  const [photos, services, precos] = await Promise.all([listAllPhotos(), getActiveServices(), getPrecosProdutos()]);
  const activePhotos = photos.filter((p) => p.status === "active");
  const naGaleria = photos.length - activePhotos.length;
  // sugestões de produto por categoria (inclui o que saiu do site: é vocabulário)
  const produtos: Partial<Record<CategoriaMidia, string[]>> = {};
  for (const p of photos) {
    if (!p.lash_style) continue; // item da galeria que nunca foi publicado
    const lista = (produtos[p.category] ??= []);
    if (!lista.includes(p.lash_style)) lista.push(p.lash_style);
  }
  // o catálogo no ar: é dele que saem os rolos do site
  const catalogo = montarCatalogo(activePhotos);
  const nProdutos = catalogo.reduce((n, c) => n + c.produtos.length, 0);
  const nVideos = activePhotos.filter((p) => p.media_type === "video").length;

  // onde cada foto caiu, lido da mesma distribuição que o site consome
  const assigned = assignPhotos(activePhotos);
  const idByUrl = new Map(activePhotos.map((p) => [p.public_url, p.id]));
  const serviceName = new Map(services.map((s) => [s.slug, s.name]));
  const places: Record<string, string[]> = {};
  const put = (slot: PhotoSlot | undefined, label: string) => {
    if (!slot) return;
    const id = idByUrl.get(slot.src);
    if (!id) return; // slot estático de reserva: não é foto da biblioteca
    const list = (places[id] ??= []);
    if (!list.includes(label)) list.push(label);
  };
  put(assigned.hero, "Herói do site");
  // a sequência de trabalho é escolhida por palavra-chave de técnica
  // (WORK_KEYWORDS em lib/tayssa/photos.ts), não por posição na fila
  ["Fio a fio", "Volume", "Manutenção"].forEach((tecnica, i) => put(assigned.work[i], tecnica));
  assigned.details.forEach((s) => put(s, "Detalhes"));
  // `assignPhotos()` casa as cinco slugs fixas de SERVICE_KEYWORDS, esteja o
  // serviço ativo ou não; a página pública só desenha os serviços ativos.
  // Serviço desativado, então, não é lugar: a foto não ganha selo por ele. E
  // o selo leva o nome do catálogo — slug é endereço, não palavra de tela.
  for (const [slug, s] of Object.entries(assigned.byService)) {
    const nome = serviceName.get(slug);
    if (nome) put(s, nome);
  }
  assigned.card.forEach((s) => put(s, "Frente do cartão"));
  // todo item no ar está no rolo do produto dele
  for (const c of catalogo) {
    for (const prod of c.produtos) {
      for (const item of prod.itens) {
        const list = (places[item.id] ??= []);
        list.push(`Rolo: ${c.label} › ${prod.nome}`);
      }
    }
  }

  const gb = photos.reduce((n, p) => n + (p.bytes ?? 0), 0) / 1024 / 1024 / 1024;

  return (
    <>
      <AdminHeader
        eyebrow="Mídia"
        title={
          <>
            Galeria e <em>rolos do site</em>
          </>
        }
        lead="Suba fotos e vídeos na galeria, no original e quantos quiser. Quando for publicar, escolha a categoria, o produto e o enquadramento: o item entra no rolo daquele produto no site."
      />

      <div className="tya-kpis tya-kpis--2sm tya-stagger">
        <Stat n={naGaleria} label="Na galeria" sub="guardados, fora do site" />
        <Stat n={activePhotos.length} label="No site" sub="publicados nos rolos" />
        <Stat n={nProdutos} label="Rolos" sub="um por produto" />
        <Stat n={nVideos} label="Vídeos no site" sub={gb >= 0.1 ? `${gb.toFixed(1)} GB guardados` : "tocam sem som nos rolos"} />
      </div>

      <nav className="tya-abas" aria-label="Mídia">
        <Link href={`${ROUTES.adminPhotos}?aba=galeria`} className="tya-aba" data-on={aba === "galeria"}>
          Galeria <span>{naGaleria}</span>
        </Link>
        <Link href={`${ROUTES.adminPhotos}?aba=site`} className="tya-aba" data-on={aba === "site"}>
          No site <span>{activePhotos.length}</span>
        </Link>
      </nav>

      {aba === "galeria" ? (
        <AdminBlock title="Subir para a galeria">
          <PhotoUpload />
        </AdminBlock>
      ) : null}

      <AdminBlock title={aba === "galeria" ? "Galeria" : "Rolos no site"}>
        <PhotoLibrary photos={photos} produtos={produtos} places={places} aba={aba} precos={precos} />
      </AdminBlock>
    </>
  );
}
