/**
 * fetch + parse de JSON com guarda de resposta não-JSON.
 *
 * Sem isso, uma resposta de infraestrutura (413 da Vercel, 502/504 do proxy)
 * chega como texto/HTML e o `res.json()` estoura com "Unexpected token 'R'",
 * escondendo o motivo real da falha.
 */

function mensagemDeFalha(status: number, corpo: string): string {
  // A Vercel corta o corpo da requisição em 4,5MB antes de chegar no handler.
  if (status === 413) {
    return "Requisição grande demais: a Vercel corta acima de 4,5MB. Arquivo grande precisa ir direto pro Storage; lista grande precisa ser enviada em lotes.";
  }
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
