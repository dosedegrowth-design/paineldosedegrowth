/**
 * Erro que aconteceu no navegador de alguém (`avisarErro`, em
 * components/tayssa/ui/sem-quebrar.tsx): só vai para o log da Vercel, para a
 * gente ler a mensagem. Nada é gravado; o corpo é cortado em 4 KB.
 */
export async function POST(request: Request) {
  const corpo = (await request.text()).slice(0, 4000);
  const navegador = request.headers.get("user-agent")?.slice(0, 200) ?? "";
  console.error("[tayssa] erro no navegador", corpo, navegador);
  return new Response(null, { status: 204 });
}
