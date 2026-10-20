import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { vipDb } from "@/lib/tayssa/db";
import { getSettings } from "@/lib/tayssa/settings";
import type { ArquivoBriefing, Respostas, SecaoId, TipoArquivo } from "@/lib/tayssa/briefing";

/**
 * A chave do link (?k=) confere com o hash guardado em vip.briefing,
 * linha '_acesso'. Sem a linha, ninguém entra: o formulário só existe
 * depois que a DDG gera o link.
 */
export async function chaveConfere(k: string | null | undefined): Promise<boolean> {
  if (!k || k.length < 16 || k.length > 200) return false;
  const { data } = await vipDb().from("briefing").select("dados").eq("secao", "_acesso").maybeSingle();
  const guardado = (data as { dados: { chave_hash?: string } } | null)?.dados?.chave_hash;
  if (!guardado) return false;
  const a = Buffer.from(createHash("sha256").update(k).digest("hex"));
  const b = Buffer.from(guardado);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Uma regra do VIP, escrita como a cliente lê hoje no site. */
export type BeneficioAtual = { key: string; nome: string; descricao: string; regra: string };

export type BriefingCompleto = {
  partes: Partial<Record<SecaoId, Record<string, unknown> & { pronto?: boolean }>>;
  padroes: Respostas;
  arquivos: ArquivoBriefing[];
  beneficios: BeneficioAtual[];
  enviadoEm: string | null;
};

type LinhaBeneficio = {
  key: string;
  name: string;
  description: string | null;
  type: "loyalty" | "referral" | "birthday" | "custom";
  threshold: number | null;
  threshold_unit: "points" | "referrals" | "services" | null;
};

export async function getBriefing(): Promise<BriefingCompleto> {
  const db = vipDb();
  const [settings, partesR, arquivosR, servicosR, beneficiosR] = await Promise.all([
    getSettings(),
    db.from("briefing").select("secao, dados"),
    db
      .from("briefing_arquivos")
      .select("id, tipo, public_url, nome, mime, bytes, tecnica")
      .order("created_at", { ascending: true }),
    db.from("services").select("name, description, preco").eq("active", true).order("sort_order"),
    db
      .from("benefits")
      .select("key, name, description, type, threshold, threshold_unit")
      .eq("active", true)
      .order("sort_order"),
  ]);
  for (const r of [partesR, arquivosR, servicosR, beneficiosR]) {
    if (r.error) throw new Error(r.error.message);
  }

  const partes: BriefingCompleto["partes"] = {};
  let enviadoEm: string | null = null;
  for (const linha of (partesR.data ?? []) as { secao: string; dados: Record<string, unknown> }[]) {
    if (linha.secao === "_envio") enviadoEm = (linha.dados.enviado_em as string) ?? null;
    else if (!linha.secao.startsWith("_")) partes[linha.secao as SecaoId] = linha.dados;
  }

  const arquivos: ArquivoBriefing[] = (
    (arquivosR.data ?? []) as {
      id: string;
      tipo: TipoArquivo;
      public_url: string;
      nome: string;
      mime: string;
      bytes: number | null;
      tecnica: string | null;
    }[]
  ).map((a) => ({ id: a.id, tipo: a.tipo, url: a.public_url, nome: a.nome, mime: a.mime, bytes: a.bytes, tecnica: a.tecnica }));

  const { booking, birthday, business, numeros, loyalty } = settings;
  const beneficios: BeneficioAtual[] = ((beneficiosR.data ?? []) as LinhaBeneficio[]).map((b) => ({
    key: b.key,
    nome: b.name,
    descricao: b.key === "card_complete" ? loyalty.card_reward_description : (b.description ?? ""),
    regra:
      b.type === "birthday"
        ? `Na semana do aniversário: de ${birthday.window_days_before} dias antes a ${birthday.window_days_after} depois${birthday.once_per_year ? ", uma vez por ano" : ""}.`
        : b.threshold_unit === "points"
          ? `Ao juntar ${b.threshold} pontos.`
          : b.threshold_unit === "services"
            ? `Ao completar o cartão de ${b.threshold} visitas confirmadas.`
            : b.threshold_unit === "referrals"
              ? `A cada ${b.threshold} indicações confirmadas.`
              : "",
  }));

  const reais = (n: number | null) => (n == null ? "" : String(n).replace(".", ","));
  const padroes: Respostas = {
    voce: { nome: business.name.replace(/\s*Lash$/i, ""), bio: "", tempo: "", formacao: "" },
    servicos: {
      itens: ((servicosR.data ?? []) as { name: string; description: string | null; preco: number | null }[]).map((s) => ({
        nome: s.name,
        frase: s.description ?? "",
        diferencial: "",
        duracao: "",
        valor: reais(s.preco),
        mostrarValor: s.preco != null,
      })),
    },
    atendimento: {
      dias: booking.weekdays,
      horarios: booking.slots.join(", "),
      antecedencia: `${booking.lead_hours} horas`,
      sinal: booking.deposit_reais ? String(booking.deposit_reais) : "",
      pix: "",
      pagamentos: [],
      atraso: "",
      endereco: "",
      mostrarEndereco: "",
    },
    midia: { drive: "" },
    depoimentos: { itens: [] },
    vip: { beneficios: Object.fromEntries(beneficios.map((b) => [b.key, { ok: "", texto: "" }])) },
    numeros: { periodo: numeros.periodo, itens: numeros.itens.map((n) => ({ valor: n.valor, rotulo: n.rotulo })) },
    marca: { instagram: business.instagram_handle, whatsapp: business.whatsapp, logo: "" },
    final: { recado: "" },
  };

  return { partes, padroes, arquivos, beneficios, enviadoEm };
}
