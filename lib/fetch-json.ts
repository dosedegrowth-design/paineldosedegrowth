/**
 * fetch + parse de JSON com guarda de resposta não-JSON.
 *
 * Sem isso, uma resposta de infraestrutura (413 da Vercel, 502/504 do proxy)
 * chega como texto/HTML e o `res.json()` estoura com "Unexpected token 'R'",
 * escondendo o motivo real da falha.
 */

/** Corpo máximo de uma requisição que passa por Serverless Function na Vercel. */
export const LIMITE_BODY_VERCEL_BYTES = 4.5 * 1024 * 1024;

export function mensagemDeUploadGrande(): string {
  return "Arquivo grande demais pro upload pelo painel: a Vercel corta requisições acima de 4,5MB. Comprima o arquivo ou suba direto pelo Storage.";
}

function mensagemDeFalha(status: number, corpo: string): string {
  if (status === 413) return mensagemDeUploadGrande();
  if (status === 408 || status === 504) {
    return "O servidor demorou demais pra responder. Tente de novo.";
  }
  const trecho = corpo.trim().replace(/\s+/g, " ").slice(0, 120);
  return trecho ? `Erro ${status} do servidor: ${trecho}` : `Erro ${status} do servidor.`;
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const corpo = await res.text();

  let data: unknown = null;
  if (corpo) {
    try {
      data = JSON.parse(corpo);
    } catch {
      // Resposta não é JSON: veio da borda/proxy, não do nosso handler.
      throw new Error(mensagemDeFalha(res.status, corpo));
    }
  }

  if (!res.ok) {
    const erro = (data as { error?: unknown } | null)?.error;
    throw new Error(typeof erro === "string" && erro ? erro : mensagemDeFalha(res.status, corpo));
  }

  return data as T;
}
