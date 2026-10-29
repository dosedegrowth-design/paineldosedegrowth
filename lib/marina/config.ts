/**
 * Onde os arquivos do briefing da Marina moram e o que é aceito.
 * Fora do arquivo de actions de propósito: um módulo "use server" só
 * pode exportar função async, nada de constante.
 */

export const BUCKET = "marina-briefing";

export const FOTO_MAX_BYTES = 50 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;

export const FOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/heic": "heic",
};

export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

/** O que o seletor de arquivo do celular oferece. */
export const ACEITA = [...Object.keys(FOTO_TYPES), ...Object.keys(VIDEO_TYPES)].join(",");

/** Quantos anúncios cabem num mês. Teto de segurança, não meta. */
export const MAX_ANUNCIOS_MES = 60;

/** As extensões que o caminho do Storage pode ter, para conferir no registro. */
export const ACEITA_EXT = [...new Set([...Object.values(FOTO_TYPES), ...Object.values(VIDEO_TYPES)])].join("|");
