import { requireAdminPage } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";
import { getAllBenefits, getAllServices, getBlackouts } from "@/lib/queries/catalog";
import { AdminBlock, AdminHeader } from "@/components/admin/shell";
import {
  BenefitConfigForm,
  BirthdayForm,
  BlackoutForm,
  BlackoutList,
  BusinessForm,
  CatalogServiceForm,
  RulesForm,
  WhatsappForm,
} from "@/components/admin/settings-forms";

export default async function SettingsAdminPage() {
  await requireAdminPage();
  const [settings, services, benefits, blackouts] = await Promise.all([
    getSettings(),
    getAllServices(),
    getAllBenefits(),
    getBlackouts(),
  ]);

  return (
    <>
      <AdminHeader eyebrow="Configurações" title={<>Regras da <em>casa</em></>} lead="Tudo aqui muda o site e o espaço das clientes sem mexer em código." />

      <AdminBlock title="Serviços e pontos" aside="cada atendimento confirmado soma os pontos do serviço">
        {services.map((s) => (
          <CatalogServiceForm key={s.id} service={s} />
        ))}
        <div style={{ marginTop: 8 }}>
          <span className="ty-eyebrow">Novo serviço</span>
          <CatalogServiceForm />
        </div>
      </AdminBlock>

      <AdminBlock title="Benefícios" aside="limites, validade e textos que a cliente vê">
        {benefits.map((b) => (
          <BenefitConfigForm key={b.id} benefit={b} />
        ))}
      </AdminBlock>

      <AdminBlock title="Regras gerais">
        <RulesForm value={settings.rules} />
      </AdminBlock>

      <AdminBlock title="Aniversário">
        <BirthdayForm value={settings.birthday} />
      </AdminBlock>

      <AdminBlock title="Períodos de restrição (blackout)" aside="ex.: dezembro — benefícios não podem ser usados">
        <div style={{ display: "grid", gap: 24 }}>
          <BlackoutList items={blackouts} />
          <BlackoutForm />
        </div>
      </AdminBlock>

      <AdminBlock title="Mensagens de WhatsApp" aside="{name} e {benefit} são substituídos automaticamente">
        <WhatsappForm value={settings.whatsapp} />
      </AdminBlock>

      <AdminBlock title="Negócio">
        <BusinessForm value={settings.business} />
      </AdminBlock>
    </>
  );
}
