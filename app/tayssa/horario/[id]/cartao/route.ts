import { fotoDoHorario } from "@/lib/tayssa/cartao-foto";

/**
 * /tayssa/horario/<id>/cartao: o cartão do horário como foto (PNG em pé).
 * O botão "Enviar o cartão no WhatsApp" baixa esta imagem e entrega para o
 * compartilhar do celular, para ir na conversa como foto. Mesma regra do
 * folder: público pelo id, sem nome nem contato de ninguém.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const foto = await fotoDoHorario(id);
  if (!foto) return new Response("Horário não encontrado.", { status: 404, headers: { "cache-control": "no-store" } });
  return foto;
}
