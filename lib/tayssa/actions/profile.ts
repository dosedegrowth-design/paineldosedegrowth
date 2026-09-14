"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/tayssa/db";
import { assertClient } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { ROUTES } from "@/lib/tayssa/config";
import { profileUpdateSchema } from "@/lib/tayssa/validation";
import { BusinessError, runAction, str } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";

/** Cliente edita só o que é dela: apelido e telefone. */
export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return runAction("profile.update", async () => {
    const me = await assertClient();
    const input = profileUpdateSchema.parse({
      nickname: str(formData, "nickname"),
      phone: str(formData, "phone"),
    });
    if (input.phone) {
      const { data: dup } = await vipDb()
        .from("users")
        .select("id")
        .eq("phone", input.phone)
        .neq("id", me.id)
        .maybeSingle();
      if (dup) throw new BusinessError("Esse telefone já está em uso em outra conta.", "phone");
    }
    const { error } = await vipDb()
      .from("users")
      .update({ nickname: input.nickname, phone: input.phone })
      .eq("id", me.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "profile_updated",
      entityType: "user",
      entityId: me.id,
    });
    revalidatePath(ROUTES.vip, "layout");
    return undefined;
  });
}
