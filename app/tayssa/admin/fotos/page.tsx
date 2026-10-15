import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listAllPhotos, lashStyles } from "@/lib/tayssa/queries/photos";
import { getActiveServices } from "@/lib/tayssa/queries/catalog";
import { assignPhotos, type PhotoSlot } from "@/lib/tayssa/photos";
import { AdminBlock, AdminHeader, Stat } from "@/components/tayssa/admin/shell";
import { PhotoUpload } from "@/components/tayssa/admin/photo-upload";
import { PhotoLibrary } from "@/components/tayssa/admin/photo-library";

/**
 * Fotos: um lugar só. O que entra aqui aparece no site, na frente do
 * cartão e no que vier — sem subir duas vezes, sem escolher onde vai.
 *
 * Os destinos de cada foto não são chute: saem de `assignPhotos()`, a
 * mesma função que o site público e o cartão usam. Se a regra mudar lá,
 * esta tela muda com ela.
 */
export default async function PhotosPage() {
  await requireAdminPage();
  const [photos, services] = await Promise.all([listAllPhotos(), getActiveServices()]);
  const activePhotos = photos.filter((p) => p.status === "active");
  const archived = photos.length - activePhotos.length;
  const featured = activePhotos.filter((p) => p.featured).length;
  // Dois recortes do mesmo vocabulário. `styles` é tudo que ela já nomeou,
  // inclusive em foto arquivada: serve para reaproveitar o nome nos campos.
  // `activeStyles` é o que está no ar — e é esse que o painel conta, porque
  // só foto no ar entra em `assignPhotos()`.
  const styles = lashStyles(photos);
  const activeStyles = lashStyles(activePhotos);

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

  return (
    <>
      <AdminHeader
        eyebrow="Fotos"
        title={
          activePhotos.length ? (
            <>
              {activePhotos.length} <em>{activePhotos.length === 1 ? "foto no ar" : "fotos no ar"}</em>
            </>
          ) : (
            <>
              Sua <em>biblioteca.</em>
            </>
          )
        }
        lead="Suba a foto e diga o volume ou estilo. O sistema decide onde ela aparece: herói do site, sequência de trabalhos, trilho de detalhes, serviços e a frente do cartão da cliente. Destaques entram primeiro."
      />

      {photos.length ? (
        <div className="tya-kpis tya-kpis--2sm tya-stagger">
          <Stat n={activePhotos.length} label="No ar" sub="alimentam o site e o cartão" />
          <Stat n={featured} label="Destaques" sub="vão para o começo da fila" alert={featured > 0} />
          <Stat n={archived} label="Arquivadas" sub="guardadas, fora do ar" />
          <Stat n={activeStyles.length} label="Volumes / estilos" sub="é o nome que acha o lugar" />
        </div>
      ) : null}

      <div className="tya-fotos">
        <div className="tya-fotos__col">
          <div className="tya-fotos__sobe">
            <AdminBlock title="Adicionar foto">
              <PhotoUpload styles={styles} />
            </AdminBlock>
          </div>

          <div className="tya-fotos__onde">
            <AdminBlock title="Onde a foto aparece">
              <dl className="tya-defs">
                <dt>Fila</dt>
                <dd>
                  Destaque primeiro; depois a mais nova. É a posição na fila que decide o resto — o número aparece em
                  cada foto.
                </dd>
                <dt>Herói</dt>
                <dd>A 1ª da fila abre o site.</dd>
                <dt>Trabalho</dt>
                <dd>
                  Aqui não é a fila que manda: cada técnica recebe a primeira foto cujo volume/estilo tem a palavra
                  dela — fio, volume, manutenção. Sem foto com a palavra, a técnica fica sem foto.
                </dd>
                <dt>Detalhes</dt>
                <dd>As seguintes entram no trilho de detalhes.</dd>
                <dt>Serviços</dt>
                <dd>
                  O volume/estilo com a palavra do serviço (volume, fio, manutenção, sobrancelha, lip, limpeza) ilustra
                  aquele serviço.
                </dd>
                <dt>Cartão</dt>
                <dd>As 6 primeiras formam a frente do cartão da cliente.</dd>
              </dl>
              <p className="tya-small" style={{ marginTop: 14 }}>
                Onde não houver foto sua, a composição se sustenta na tipografia: o site nunca mostra caixote vazio nem
                imagem de banco.
              </p>
            </AdminBlock>
          </div>
        </div>

        <div className="tya-fotos__lista">
          <AdminBlock
            title="Biblioteca"
            aside={
              photos.length ? (
                <span className="tya-pills">
                  <span className="tya-pill tya-pill--ok">{activePhotos.length} no ar</span>
                  {archived ? <span className="tya-pill tya-pill--quiet">{archived} arquivadas</span> : null}
                </span>
              ) : null
            }
          >
            <PhotoLibrary photos={photos} styles={styles} places={places} />
          </AdminBlock>
        </div>
      </div>
    </>
  );
}
