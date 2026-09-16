import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listAllPhotos, lashStyles } from "@/lib/tayssa/queries/photos";
import { AdminBlock, AdminHeader } from "@/components/tayssa/admin/shell";
import { PhotoUpload } from "@/components/tayssa/admin/photo-upload";
import { PhotoLibrary } from "@/components/tayssa/admin/photo-library";

/**
 * Fotos: um lugar só. O que entra aqui aparece no site, na frente do
 * cartão e no que vier — sem subir duas vezes, sem escolher onde vai.
 */
export default async function PhotosPage() {
  await requireAdminPage();
  const photos = await listAllPhotos();
  const styles = lashStyles(photos);
  const active = photos.filter((p) => p.status === "active").length;
  return (
    <>
      <AdminHeader
        eyebrow="Fotos"
        title={active ? <>{active} <em>{active === 1 ? "foto no ar" : "fotos no ar"}</em></> : <>Sua <em>biblioteca.</em></>}
        lead="Suba a foto e diga o volume ou estilo. O sistema decide onde ela aparece: herói do site, sequência de trabalhos, trilho de detalhes, serviços e a frente do cartão da cliente. Destaques entram primeiro."
      />
      <AdminBlock title="Adicionar foto">
        <PhotoUpload styles={styles} />
      </AdminBlock>
      <AdminBlock title="Biblioteca">
        <PhotoLibrary photos={photos} styles={styles} />
      </AdminBlock>
    </>
  );
}
