import "server-only";
import { vipDb } from "@/lib/tayssa/db";
import { logAudit } from "@/lib/tayssa/audit";
import { stampVisit, syncLoyaltyEligibility } from "@/lib/tayssa/engine";
import type { ServiceRow } from "@/lib/tayssa/types";

/**
 * Uma visita confirmada pela Tayssa — de onde quer que venha (registro
 * direto na ficha ou atendimento fechado pela agenda): entra aprovada,
 * carimba o cartão e recalcula os marcos de pontos. É o único caminho
 * pelo qual pontos nascem já confirmados.
 */
export async function registerVisit(input: {
  adminId: string;
  clientId: string;
  service: Pick<ServiceRow, "id" | "name" | "point_value">;
  serviceDate: string;
  amount?: number | null;
  points?: number | null;
  notes?: string | null;
  auditAction?: string;
  auditMeta?: Record<string, unknown>;
}): Promise<{ id: string; points: number }> {
  const now = new Date().toISOString();
  const points = Number.isInteger(input.points) && (input.points as number) >= 0 ? (input.points as number) : input.service.point_value;
  const { data, error } = await vipDb()
    .from("client_services")
    .insert({
      client_id: input.clientId,
      service_id: input.service.id,
      service_name: input.service.name,
      service_date: input.serviceDate,
      amount: input.amount ?? null,
      points,
      status: "approved",
      notes: input.notes ?? null,
      submitted_by: "admin",
      reviewed_by: input.adminId,
      reviewed_at: now,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const row = data as { id: string };
  await logAudit({
    actorId: input.adminId,
    actorRole: "admin",
    action: input.auditAction ?? "service_added",
    entityType: "client_service",
    entityId: row.id,
    meta: { client_id: input.clientId, points, ...(input.auditMeta ?? {}) },
  });
  // visita confirmada: carimbo no cartão + marcos de pontos
  await stampVisit(input.clientId, { id: row.id, service_name: input.service.name, points, reviewed_at: now });
  await syncLoyaltyEligibility(input.clientId);
  return { id: row.id, points };
}
