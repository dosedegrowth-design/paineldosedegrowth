import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { dateLong } from "@/lib/tayssa/format";
import { VIP_STATUS_LABEL } from "@/lib/tayssa/types";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { VipSection } from "@/components/tayssa/vip/section";
import { ChangePasswordForm, ProfileForm } from "@/components/tayssa/vip/forms";

export default async function ProfilePage() {
  const user = await requireClientPage();
  const p = user.profile;
  return (
    <>
      <div style={{ paddingBottom: "clamp(40px, 6vw, 88px)" }}>
        <Reveal>
          <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
            Perfil
          </span>
        </Reveal>
        <MaskedLines as="h1" inView={false} className="ty-display" lineClassName="ty-vip-title" lines={[user.name, <em key="e">{p ? VIP_STATUS_LABEL[p.vip_status] : "Cliente"}</em>]} />
        <Reveal delay={0.35}>
          <dl style={{ margin: "26px 0 0", display: "grid", gap: 8, maxWidth: 480 }}>
            <Row k="E-mail" v={user.email} />
            <Row k="Aniversário" v={p?.birthday ? dateLong(p.birthday) : "Não cadastrado. Conte para a Tayssa."} />
            <Row k="VIP desde" v={p?.vip_since ? dateLong(p.vip_since, true) : "—"} />
          </dl>
        </Reveal>
      </div>

      <VipSection eyebrow="Dados" title={<>Como você <em>prefere</em></>}>
        <ProfileForm nickname={user.nickname} phone={user.phone} />
      </VipSection>
      <VipSection eyebrow="Segurança" title={<>Sua <em>senha</em></>}>
        <ChangePasswordForm />
      </VipSection>
      <style>{`.ty-vip-title { font-size: clamp(36px, 5.2vw, 84px); }`}</style>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, padding: "8px 0", borderTop: "1px solid var(--t-line)" }}>
      <dt className="ty-eyebrow" style={{ fontSize: 10 }}>
        {k}
      </dt>
      <dd style={{ margin: 0, fontSize: 15 }}>{v}</dd>
    </div>
  );
}
