import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listClients } from "@/lib/tayssa/queries/admin";
import { getEstatisticasDasClientes } from "@/lib/tayssa/queries/gestao";
import { ROUTES } from "@/lib/tayssa/config";
import { AdminHeader } from "@/components/tayssa/admin/shell";
import { ClientsTable } from "@/components/tayssa/admin/clients-table";
import { TransitionLink } from "@/components/tayssa/ui/transition";

export default async function ClientsPage() {
  await requireAdminPage();
  const [clients, stats] = await Promise.all([listClients(), getEstatisticasDasClientes()]);
  // por cliente: atendimentos, total gasto e frequência de retorno (dos atendimentos realizados)
  const estatisticas = Object.fromEntries(
    [...stats.entries()].map(([id, h]) => [id, { quantidade: h.quantidade, totalGasto: h.totalGasto, frequenciaDias: h.frequenciaDias }]),
  );
  const esperando = clients.filter((c) => c.pedidoVip).length;

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
            ? `${esperando} ${esperando === 1 ? "cliente nova espera" : "clientes novas esperam"} a sua saudação e o VIP: é o filtro que já está aberto.`
            : "Nenhuma cliente nova esperando você. A lista mostra todas as clientes."
        }
        actions={
          <TransitionLink href={ROUTES.adminClientNew} className="tya-btn tya-btn--primary">
            Nova cliente
          </TransitionLink>
        }
      />
      <ClientsTable clients={clients} estatisticas={estatisticas} />
    </>
  );
}
