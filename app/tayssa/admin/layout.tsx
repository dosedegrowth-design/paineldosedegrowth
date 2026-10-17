import type { Metadata } from "next";
import "./admin.css";
import "./iwin.css";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { vipDb } from "@/lib/tayssa/db";
import type { Atencao } from "@/components/tayssa/admin/sidebar";
import { AdminFrame } from "@/components/tayssa/admin/frame";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

/** Painel operacional: sempre por requisição, nunca cacheado. */
export const dynamic = "force-dynamic";

/** O que espera por ela — é isso que acende o número na lateral. */
async function contarAtencao(): Promise<Atencao> {
  const db = vipDb();
  const [cadastros, horarios, atendimentos, indicacoes, beneficios] = await Promise.all([
    db.from("users").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("appointments").select("id", { count: "exact", head: true }).eq("status", "requested"),
    db.from("client_services").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "contacted", "scheduled", "completed"]),
    db
      .from("client_benefits")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending_validation", "requested"]),
  ]);
  return {
    signups: cadastros.count ?? 0,
    appointments: horarios.count ?? 0,
    services: atendimentos.count ?? 0,
    referrals: indicacoes.count ?? 0,
    benefits: beneficios.count ?? 0,
  };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, atencao] = await Promise.all([requireAdminPage(), contarAtencao()]);
  return (
    <div className="ty-scope tya">
      <AdminFrame atencao={atencao} nome={user.displayName}>
        {children}
      </AdminFrame>
    </div>
  );
}
