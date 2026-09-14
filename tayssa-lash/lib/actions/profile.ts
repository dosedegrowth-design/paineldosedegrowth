"use server";

import { revalidatePath } from "next/cache";
import { vipDb } from "@/lib/db";
import { assertClient } from "@/lib/auth/guards";
import { logAudit } from "@/lib/audit";
import { ROUTES } from "@/lib/config";
import { profileUpdateSchema } from "@/lib/validation";
import { BusinessError, runAction, str } from "@/lib/actions/_helpers";
import type { ActionResult } from "@/lib/types";

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
