import { requireAdminPage } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";
import { getAllBenefits, getAllServices, getBlackouts } from "@/lib/queries/catalog";
import { AdminBlock, AdminHeader } from "@/components/admin/shell";
import {
  BenefitConfigForm,
  BirthdayForm,
  BlackoutForm,
  BlackoutList,
  BookingForm,
  BusinessForm,
  CatalogServiceForm,
  LoyaltyForm,
  RulesForm,
  SignupForm,
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

      <AdminBlock id="agenda" title="Agenda" aside="dias e horários que a cliente vê ao marcar">
        <BookingForm value={settings.booking} />
      </AdminBlock>

      <AdminBlock id="cartao" title="Cartão de fidelidade" aside="cada visita confirmada carimba uma posição">
        <LoyaltyForm value={settings.loyalty} />
      </AdminBlock>

      <AdminBlock id="cadastro" title="Cadastro pelo site" aside="quem pede acesso espera a sua aprovação">
        <SignupForm value={settings.signup} />
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
