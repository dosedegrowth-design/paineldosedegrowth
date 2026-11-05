import "server-only";
import webpush from "web-push";
import { vipDb, logServerError } from "@/lib/tayssa/db";

/**
 * Avisos no celular da Tayssa (05/11/2026): quando uma cliente marca um
 * horário, cada aparelho em que ela ativou os avisos no painel recebe uma
 * notificação (Web Push). Sem serviço de fora: a chave do servidor (VAPID)
 * é gerada no primeiro uso e guardada em `vip.settings` (linha `push`, só o
 * servidor lê). Um aviso que falha nunca derruba o pedido.
 */

type Chaves = { publicKey: string; privateKey: string };
let guardadas: Chaves | null = null;

/** quem manda os avisos: o próprio site (vai no cabeçalho do envio) */
const REMETENTE = `${process.env.NEXT_PUBLIC_TAYSSA_ORIGIN || "https://painel.dosedegrowth.com"}/tayssa`;

export async function chavesDosAvisos(): Promise<Chaves> {
  if (guardadas) return guardadas;
  const db = vipDb();
  const ler = async () => {
    const { data, error } = await db.from("settings").select("value").eq("key", "push").maybeSingle();
    if (error) throw new Error(error.message);
    const v = (data as { value: Partial<Chaves> } | null)?.value;
    return v?.publicKey && v?.privateKey ? { publicKey: v.publicKey, privateKey: v.privateKey } : null;
  };
  let chaves = await ler();
  if (!chaves) {
    // dois servidores ao mesmo tempo: o primeiro grava, o outro lê a dele
    const { error } = await db
      .from("settings")
      .upsert({ key: "push", value: webpush.generateVAPIDKeys() }, { onConflict: "key", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    chaves = await ler();
    if (!chaves) throw new Error("chaves dos avisos não gravaram");
  }
  guardadas = chaves;
  return chaves;
}

export type Aviso = { titulo: string; corpo: string; url: string; tag?: string };

/** Manda o aviso para todos os aparelhos da Tayssa. Aparelho que saiu (404/410) é esquecido. */
export async function avisarTayssa(aviso: Aviso, soDoUsuario?: string): Promise<number> {
  try {
    const db = vipDb();
    let consulta = db.from("avisos_aparelhos").select("id, endpoint, p256dh, auth");
    if (soDoUsuario) consulta = consulta.eq("user_id", soDoUsuario);
    const { data, error } = await consulta;
    if (error) throw new Error(error.message);
    const aparelhos = (data ?? []) as { id: string; endpoint: string; p256dh: string; auth: string }[];
    if (!aparelhos.length) return 0;
    const chaves = await chavesDosAvisos();
    webpush.setVapidDetails(REMETENTE, chaves.publicKey, chaves.privateKey);
    const corpo = JSON.stringify(aviso);
    const enviados = await Promise.all(
      aparelhos.map(async (a) => {
        try {
          await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, corpo, {
            TTL: 60 * 60 * 24,
            urgency: "high",
          });
          await db.from("avisos_aparelhos").update({ ultimo_envio_at: new Date().toISOString() }).eq("id", a.id);
          return 1;
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) await db.from("avisos_aparelhos").delete().eq("id", a.id);
          else logServerError("avisos.enviar", e);
          return 0;
        }
      }),
    );
    return enviados.reduce<number>((s, n) => s + n, 0);
  } catch (e) {
    logServerError("avisos", e);
    return 0;
  }
}
