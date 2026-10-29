import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import Link from "next/link";
import { getPrecosProdutos, listAllPhotos } from "@/lib/tayssa/queries/photos";
import { ROUTES } from "@/lib/tayssa/config";
import { getActiveServices } from "@/lib/tayssa/queries/catalog";
import { assignPhotos, type PhotoSlot } from "@/lib/tayssa/photos";
import { AdminBlock, AdminHeader, Stat } from "@/components/tayssa/admin/shell";
import { PhotoUpload } from "@/components/tayssa/admin/photo-upload";
import { PhotoLibrary } from "@/components/tayssa/admin/photo-library";
import { CapasServicos, type OpcaoCapa, type ServicoCapa } from "@/components/tayssa/admin/capas";
import { capasDosServicos, fotoDoTrabalho, montarCatalogo, roloAbaixoDaCapa, rolosDosServicos } from "@/lib/tayssa/catalogo";
import type { CategoriaMidia } from "@/lib/tayssa/types";

type Aba = "galeria" | "site" | "capas";

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
  const pedida = (await searchParams).aba;
  const aba: Aba = pedida === "site" || pedida === "capas" ? pedida : "galeria";
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

  // os serviços do site, cada um com o carrossel das fotos dele e a capa
  // (escolhida aqui, na aba Capas, ou a primeira foto do serviço)
  const servicosNoSite = services.filter((s) => s.slug !== "outro");
  // a coluna da capa só existe depois da migração 20261029010000; antes dela,
  // a aba mostra as capas automáticas e não oferece trocar
  const capaNoBanco = services.length > 0 && "capa_photo_id" in services[0];
  const rolos = rolosDosServicos(catalogo, servicosNoSite);
  const porId = Object.fromEntries(photos.map((p) => [p.id, p]));
  const capas = capasDosServicos(servicosNoSite, rolos, porId);
  const opcao = (p: (typeof photos)[number]): OpcaoCapa => ({
    id: p.id,
    url: p.public_url,
    produto: p.lash_style || "Sem nome",
    foco: { x: Number(p.focus_x ?? 50), y: Number(p.focus_y ?? 50), zoom: Number(p.zoom ?? 1) },
  });
  const servicosCapa: ServicoCapa[] = servicosNoSite.map((s) => {
    const rolo = rolos[s.slug] ?? [];
    return {
      id: s.id,
      nome: s.name,
      capa: capas[s.slug] ?? null,
      noCarrossel: roloAbaixoDaCapa(rolo, capas[s.slug] ?? null).length,
      daqui: rolo.filter((m) => m.tipo === "image").map((m) => opcao(porId[m.id])),
    };
  });
  const outrasFotos = photos.filter((p) => p.media_type !== "video").map(opcao);

  // onde cada foto caiu, lido da mesma distribuição que o site consome
  const assigned = assignPhotos(activePhotos);
  const idByUrl = new Map(activePhotos.map((p) => [p.public_url, p.id]));
  const places: Record<string, string[]> = {};
  const put = (slot: PhotoSlot | undefined, label: string) => {
    if (!slot) return;
    const id = idByUrl.get(slot.src);
    if (!id) return; // slot estático de reserva: não é foto da biblioteca
    const list = (places[id] ??= []);
    if (!list.includes(label)) list.push(label);
  };
  const marcar = (id: string, label: string) => {
    const list = (places[id] ??= []);
    if (!list.includes(label)) list.push(label);
  };
  put(assigned.hero, "Abertura do site");
  put(assigned.portrait, "A Tayssa");
  // fotos de trabalho, detalhes e dos serviços passam na colagem (Instagram e fechamento)
  assigned.work.forEach((s) => put(s, "Colagem"));
  assigned.details.forEach((s) => put(s, "Colagem"));
  Object.values(assigned.byService).forEach((s) => put(s, "Colagem"));
  // a capa de cada serviço (o selo leva o nome do serviço, não a slug) e a
  // foto dele na seção "Trabalho" (a primeira depois da capa)
  for (const s of servicosNoSite) {
    const capa = capas[s.slug];
    if (capa) marcar(capa.id, `Capa: ${s.name}`);
    const doTrabalho = fotoDoTrabalho(rolos[s.slug] ?? [], capa ?? null);
    if (doTrabalho) marcar(doTrabalho.id, `Trabalho: ${s.name}`);
  }
  assigned.card.forEach((s) => put(s, "Frente do cartão"));
  // todo item no ar passa nas fotos do serviço dele (carrossel de cima e
  // lista de serviços) e no rolo do produto ("Cada técnica, de perto")
  const nomeDoServico = new Map(servicosNoSite.map((s) => [s.slug, s.name]));
  for (const [slug, itens] of Object.entries(rolos)) {
    const nome = nomeDoServico.get(slug);
    if (nome) for (const item of itens) marcar(item.id, `Carrossel: ${nome}`);
  }
  for (const c of catalogo) {
    for (const prod of c.produtos) for (const item of prod.itens) marcar(item.id, `Rolo: ${c.label} › ${prod.nome}`);
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
        <Link href={`${ROUTES.adminPhotos}?aba=capas`} className="tya-aba" data-on={aba === "capas"}>
          Capas <span>{servicosCapa.filter((s) => s.capa).length}</span>
        </Link>
      </nav>

      {aba === "galeria" ? (
        <AdminBlock title="Subir para a galeria">
          <PhotoUpload />
        </AdminBlock>
      ) : null}

      {aba === "capas" ? (
        <AdminBlock title="Capas dos serviços">
          <p className="tya-small" style={{ marginBottom: 16 }}>
            Na lista de serviços do site, cada serviço aparece com a capa e, embaixo dela, o carrossel das outras fotos
            dele. No carrossel do topo, as fotos passam dentro do cartão, começando pela capa. Sem capa escolhida, entra a
            primeira foto do serviço. Serviço sem foto aparece sem foto: publique fotos com o nome dele na aba Galeria.
          </p>
          <CapasServicos servicos={servicosCapa} outras={outrasFotos} pronto={capaNoBanco} />
        </AdminBlock>
      ) : (
        <AdminBlock title={aba === "galeria" ? "Galeria" : "Rolos no site"}>
          <PhotoLibrary photos={photos} produtos={produtos} places={places} aba={aba} precos={precos} />
        </AdminBlock>
      )}
    </>
  );
}
