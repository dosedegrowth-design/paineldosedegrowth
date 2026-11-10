import { fotoDoHorario } from "@/lib/tayssa/cartao-foto";

/**
 * /tayssa/horario/<id>/cartao: o cartão do horário como foto (PNG em pé).
 * O botão "Enviar o cartão no WhatsApp" baixa esta imagem e entrega para o
 * compartilhar do celular, para ir na conversa como foto. Mesma regra do
 * folder: público pelo id, sem nome nem contato de ninguém.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // falha do banco não é "não existe": 503, e o celular cai no plano B (o link do horário)
  const foto = await fotoDoHorario(id).catch(() => undefined);
  if (foto === undefined) return new Response("Não deu para montar o cartão agora.", { status: 503, headers: { "cache-control": "no-store" } });
  if (!foto) return new Response("Horário não encontrado.", { status: 404, headers: { "cache-control": "no-store" } });
  return foto;
}
