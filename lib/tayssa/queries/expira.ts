import "server-only";
import { vipDb, logServerError } from "@/lib/tayssa/db";
import { logAudit } from "@/lib/tayssa/audit";
import { getSettings } from "@/lib/tayssa/settings";

let ultimaVez = 0;

/**
 * O pedido só vale com o sinal (05/11/2026): a Tayssa pede o Pix no
 * WhatsApp e confirma quando ele cai. Pedido sem confirmação depois de
 * `booking.sinal_horas` (24h) cai sozinho e o horário volta para a agenda.
 *
 * Roda antes de quem lê a agenda (site, área da cliente, painel), no máximo
 * a cada 30 s por servidor. Em produção um job do banco (pg_cron
 * `tayssa_pedidos_sem_sinal`) faz o mesmo a cada 10 minutos, para o
 * horário voltar mesmo sem ninguém abrir o site. Nunca derruba a leitura.
 */
export async function expirarPedidosSemSinal(): Promise<void> {
  const agora = Date.now();
  if (agora - ultimaVez < 30_000) return;
  ultimaVez = agora;
  try {
    const horas = (await getSettings()).booking.sinal_horas || 24;
    const limite = new Date(agora - horas * 3_600_000).toISOString();
    const { data, error } = await vipDb()
      .from("appointments")
      .update({
        status: "cancelled",
        admin_note: `Sem o sinal em ${horas}h, o horário voltou para a agenda.`,
        reviewed_at: new Date(agora).toISOString(),
      })
      .eq("status", "requested")
      .lt("created_at", limite)
      .select("id");
    if (error) throw new Error(error.message);
    const ids = ((data ?? []) as { id: string }[]).map((r) => r.id);
    if (ids.length) {
      await logAudit({
        actorId: null,
        actorRole: "system",
        action: "appointment_expired",
        entityType: "appointment",
        entityId: ids.length === 1 ? ids[0] : null,
        meta: { ids, horas },
      });
    }
  } catch (e) {
    logServerError("agenda.expira", e);
  }
}
