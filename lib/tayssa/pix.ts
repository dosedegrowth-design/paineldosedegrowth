/**
 * Pix copia e cola (BR Code / EMV do Banco Central), gerado no próprio site,
 * sem serviço de fora. Mesma conta do Reflexo do Santo (lib/pix.ts de lá):
 * a cliente copia o código com o valor do sinal já embutido, paga no app do
 * banco e anexa o comprovante. Puro: roda no servidor e no navegador.
 */

function tlv(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, "0") + valor;
}

/** Nome e cidade no código: sem acento, só letras, números e espaço, em maiúsculas, sem cortar palavra no meio. */
export function textoDoPix(txt: string, max: number): string {
  const limpo = txt
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .toUpperCase()
    .trim();
  if (limpo.length <= max) return limpo;
  const corte = limpo.slice(0, max);
  const espaco = corte.lastIndexOf(" ");
  return (espaco > 0 ? corte.slice(0, espaco) : corte).trim();
}

/** CRC16-CCITT (polinômio 0x1021, início 0xFFFF), como pede o manual do BR Code. */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * A chave como o Pix espera: CPF/CNPJ só com os números, telefone com +55,
 * e-mail em minúsculas, chave aleatória como veio. Vazio = sem Pix no site.
 */
export function chavePix(bruta: string): string {
  const k = bruta.trim();
  if (!k) return "";
  if (k.includes("@")) return k.toLowerCase();
  // chave aleatória (EVP): 32 hexadecimais com hífens
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)) return k.toLowerCase();
  const digitos = k.replace(/\D/g, "");
  if (k.startsWith("+")) return `+${digitos}`;
  // CNPJ (14) e CPF (11) escritos com ou sem pontuação
  if (/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(k) || /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(k)) return digitos;
  // telefone com DDD (10 ou 11 números, ou já com o 55 na frente)
  if (/^[\d\s().-]+$/.test(k)) {
    if (digitos.length === 10 || (digitos.length === 11 && digitos[2] === "9")) return `+55${digitos}`;
    if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) return `+${digitos}`;
    return digitos;
  }
  return k;
}

function digitoVerificador(numeros: string, pesos: number[]): number {
  const soma = pesos.reduce((t, p, i) => t + Number(numeros[i]) * p, 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function cpfValido(d: string): boolean {
  if (!/^\d{11}$/.test(d) || /^(\d)\1+$/.test(d)) return false;
  const a = digitoVerificador(d, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const b = digitoVerificador(d, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return a === Number(d[9]) && b === Number(d[10]);
}

function cnpjValido(d: string): boolean {
  if (!/^\d{14}$/.test(d) || /^(\d)\1+$/.test(d)) return false;
  const a = digitoVerificador(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const b = digitoVerificador(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return a === Number(d[12]) && b === Number(d[13]);
}

/** A chave existe no formato do Pix? (CPF e CNPJ com os dígitos que conferem, celular +55, e-mail ou aleatória) */
export function chavePixValida(bruta: string): boolean {
  const k = chavePix(bruta);
  if (!k) return false;
  if (k.includes("@")) return k.length <= 77 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(k);
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(k)) return true;
  if (k.startsWith("+")) return /^\+55\d{10,11}$/.test(k);
  return cpfValido(k) || cnpjValido(k);
}

/** O identificador do pedido no Pix (aparece no extrato de quem recebe): letras e números, até 25. */
export function txidDoPedido(id: string): string {
  return `TL${id
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 10)
    .toUpperCase()}`;
}

export function gerarPixCopiaECola({
  chave,
  nome,
  cidade,
  valor,
  txid = "***",
}: {
  chave: string;
  nome: string;
  cidade: string;
  valor?: number | null;
  txid?: string;
}): string {
  const conta = tlv("00", "br.gov.bcb.pix") + tlv("01", chavePix(chave));
  let payload = tlv("00", "01") + tlv("26", conta) + tlv("52", "0000") + tlv("53", "986");
  if (valor && valor > 0) payload += tlv("54", valor.toFixed(2));
  const id = txid === "***" ? "***" : txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  payload +=
    tlv("58", "BR") +
    tlv("59", textoDoPix(nome, 25) || "TAYSSA LASH") +
    tlv("60", textoDoPix(cidade, 15) || "SAO PAULO") +
    tlv("62", tlv("05", id));
  payload += "6304";
  return payload + crc16(payload);
}

/** O Pix que o site mostra: com chave cadastrada, o código do pedido; sem chave, nada (a cliente pede no WhatsApp). */
export type PixDaAgenda = { chave: string; nome: string; cidade: string; banco: string };

export function pixDoPedido(pix: PixDaAgenda | null, valor: number, pedidoId: string): string | null {
  if (!pix || !chavePix(pix.chave)) return null;
  return gerarPixCopiaECola({
    chave: pix.chave,
    nome: pix.nome,
    cidade: pix.cidade,
    valor,
    txid: txidDoPedido(pedidoId),
  });
}
