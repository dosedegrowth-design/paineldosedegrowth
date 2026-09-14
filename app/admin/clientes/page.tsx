import { requireAdminPage } from "@/lib/auth/guards";
import { listClients } from "@/lib/queries/admin";
import { ROUTES } from "@/lib/config";
import { AdminHeader } from "@/components/admin/shell";
import { ClientsTable } from "@/components/admin/clients-table";
import { TyLinkButton } from "@/components/ui/button";

export default async function ClientsPage() {
  await requireAdminPage();
  const clients = await listClients();
  return (
    <>
      <AdminHeader
        eyebrow="Clientes"
        title={<>{clients.length} <em>{clients.length === 1 ? "cliente" : "clientes"}</em></>}
        actions={<TyLinkButton href={ROUTES.adminClientNew} size="sm" variant="solid" arrow>Nova cliente</TyLinkButton>}
      />
      <ClientsTable clients={clients} />
    </>
  );
}
