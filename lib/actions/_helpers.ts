import "server-only";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/guards";
import { GENERIC_ERROR, logServerError } from "@/lib/db";
import { firstIssue } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/** Erro de regra de negócio com mensagem humana (vai direto pra UI). */
export class BusinessError extends Error {
  field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.name = "BusinessError";
    this.field = field;
  }
}

/**
 * Executa uma action convertendo qualquer exceção em ActionResult.
 * Erros técnicos vão pro log; a cliente vê uma frase humana.
 */
export async function runAction<T = undefined>(
  scope: string,
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data } as ActionResult<T>;
  } catch (e) {
    if (e instanceof ZodError) {
      const { message, field } = firstIssue(e);
      return { ok: false, error: message, field };
    }
    if (e instanceof BusinessError) {
      return { ok: false, error: e.message, field: e.field };
    }
    if (e instanceof AuthError) {
      return { ok: false, error: e.message };
    }
    logServerError(scope, e);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

export function list(fd: FormData, key: string): string[] {
  return fd.getAll(key).filter((v): v is string => typeof v === "string");
}
