import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listClients } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { AdminHeader } from "@/components/tayssa/admin/shell";
import { ClientsTable } from "@/components/tayssa/admin/clients-table";
import { TyLinkButton } from "@/components/tayssa/ui/button";

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
