import "server-only";
import { randomBytes } from "node:crypto";

/** Código de indicação legível: 6 chars sem 0/O/1/I. */
export function referralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
