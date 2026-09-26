/**
 * CPF — máscara e validação, sem dependências. Só formato + dígitos
 * verificadores: nenhuma consulta é feita a sistema nenhum.
 */

export const CPF_MASK_LENGTH = 14; // 000.000.000-00

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Aplica a máscara 000.000.000-00 progressivamente, aceitando entrada parcial. */
export function maskCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  let out = d.slice(0, 3);
  if (d.length > 3) out += "." + d.slice(3, 6);
  if (d.length > 6) out += "." + d.slice(6, 9);
  if (d.length > 9) out += "-" + d.slice(9, 11);
  return out;
}

/**
 * Próximo valor do campo a partir do valor anterior (já mascarado) e do que
 * o navegador entregou no evento. Resolve o clássico "backspace preso no
 * separador": apagar o "." ou o "-" também apaga o dígito anterior.
 */
export function nextCpfValue(
  previousMasked: string,
  rawInput: string,
  inputType?: string
): string {
  let digits = onlyDigits(rawInput);
  const wasDeletion = inputType === "deleteContentBackward";
  if (wasDeletion && digits === onlyDigits(previousMasked) && digits.length > 0) {
    digits = digits.slice(0, -1);
  }
  return maskCpf(digits);
}

function checkDigit(digits: string, length: number): number {
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += Number(digits[i]) * (length + 1 - i);
  }
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** Valida formato e dígitos verificadores (rejeita sequências repetidas). */
export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  if (checkDigit(d, 9) !== Number(d[9])) return false;
  if (checkDigit(d, 10) !== Number(d[10])) return false;
  return true;
}
