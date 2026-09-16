import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/guards";
import { vipDb } from "@/lib/db";
import { AdminNav } from "@/components/admin/nav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Painel operacional: sempre por requisição, nunca cacheado. */
export const dynamic = "force-dynamic";

async function attentionCounts() {
  const db = vipDb();
  const [a, s, r, b] = await Promise.all([
    db.from("appointments").select("id", { count: "exact", head: true }).eq("status", "requested"),
    db.from("client_services").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("referrals").select("id", { count: "exact", head: true }).in("status", ["pending", "contacted", "scheduled", "completed"]),
    db.from("client_benefits").select("id", { count: "exact", head: true }).in("status", ["pending_validation", "requested"]),
  ]);
  return { appointments: a.count ?? 0, services: s.count ?? 0, referrals: r.count ?? 0, benefits: b.count ?? 0, birthdays: 0 };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  const attention = await attentionCounts();
  return (
    <div className="ty-scope" data-theme="night">
      <div className="ty-grain" aria-hidden />
      <AdminNav name={user.displayName} attention={attention} />
      <main className="ty-container" style={{ paddingBottom: "clamp(64px, 8vw, 120px)" }}>
        {children}
      </main>
    </div>
  );
}
