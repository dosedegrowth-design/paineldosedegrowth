import { requireAdminPage } from "@/lib/auth/guards";
import { AdminHeader } from "@/components/admin/shell";
import { ClientCreateForm } from "@/components/admin/forms";

export default async function NewClientPage() {
  await requireAdminPage();
  return (
    <>
      <AdminHeader
        eyebrow="Clientes"
        title={<>Nova <em>cliente</em></>}
        lead="Você cria a conta; ela recebe um link único para escolher a senha. Nenhuma senha é exibida aqui."
      />
      <ClientCreateForm />
    </>
  );
}
