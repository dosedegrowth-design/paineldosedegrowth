import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listClients } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { AdminHeader } from "@/components/tayssa/admin/shell";
import { ClientsTable } from "@/components/tayssa/admin/clients-table";
import { TransitionLink } from "@/components/tayssa/ui/transition";

export default async function ClientsPage() {
  await requireAdminPage();
  const clients = await listClients();
  const esperando = clients.filter((c) => c.user.status === "pending").length;

  return (
    <>
      <AdminHeader
        eyebrow="Clientes"
        title={
          <>
            {clients.length} <em>{clients.length === 1 ? "cliente" : "clientes"}</em>
          </>
        }
        lead={
          esperando > 0
            ? `${esperando} ${esperando === 1 ? "pedido de acesso espera" : "pedidos de acesso esperam"} a sua decisão — é o filtro que já está aberto.`
            : "Nenhum pedido de acesso aberto. A lista mostra todas as clientes."
        }
        actions={
          <TransitionLink href={ROUTES.adminClientNew} className="tya-btn tya-btn--primary">
            Nova cliente
          </TransitionLink>
        }
      />
      <ClientsTable clients={clients} />
    </>
  );
}
