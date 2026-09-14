import "server-only";
import { vipDb, logServerError } from "@/lib/tayssa/db";

type AuditInput = {
  actorId: string | null;
  actorRole: "client" | "admin" | "public" | "system";
  action: string;
  entityType?: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
};

/** Auditoria: quem fez o quê, quando. Nunca derruba a ação principal. */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await vipDb().from("audit_log").insert({
      actor_user_id: input.actorId,
      actor_role: input.actorRole,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      meta: input.meta ?? {},
    });
  } catch (e) {
    logServerError("audit", e);
  }
}
