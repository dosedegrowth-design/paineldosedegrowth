/**
 * Nome completo — normalização e validação.
 */

/** Colapsa espaços repetidos e apara as pontas. */
export function normalizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

const WORD = "[\\p{L}][\\p{L}'’.\\-]*";
const FULL_NAME = new RegExp(`^${WORD}(?: ${WORD})+$`, "u");

/**
 * Nome completo válido: pelo menos duas palavras, só letras (com acentos),
 * apóstrofo, ponto ou hífen; entre 5 e 80 caracteres.
 */
export function isValidFullName(value: string): boolean {
  const n = normalizeName(value);
  if (n.length < 5 || n.length > 80) return false;
  return FULL_NAME.test(n);
}

const PARTICLES = new Set(["da", "das", "de", "do", "dos", "e", "di", "du", "del", "van", "von"]);

/** "maria DA silva" → "Maria da Silva". */
export function titleCaseName(value: string): string {
  return normalizeName(value)
    .split(" ")
    .map((word, i) => {
      const lower = word.toLocaleLowerCase("pt-BR");
      if (i > 0 && PARTICLES.has(lower)) return lower;
      return lower
        .split("-")
        .map((part) => part.charAt(0).toLocaleUpperCase("pt-BR") + part.slice(1))
        .join("-");
    })
    .join(" ");
}

/** Primeiro nome, capitalizado — usado na saudação da tela de resultado. */
export function firstName(value: string): string {
  const full = titleCaseName(value);
  return full.split(" ")[0] ?? "";
}
