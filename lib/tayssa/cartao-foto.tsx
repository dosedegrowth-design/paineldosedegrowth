import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getHorarioPublico, type HorarioPublico } from "@/lib/tayssa/queries/horario";
import { getSettings } from "@/lib/tayssa/settings";
import { diaLegivel, horaLegivel, prazoDoSinal, reais } from "@/lib/tayssa/agendar";
import { situacaoDoPedido } from "@/lib/tayssa/types";

/**
 * O cartão do horário como foto (pedido do Lucas, 05/11/2026): quando a
 * cliente avisa a Tayssa, o cartão vai junto como imagem, "como se ela
 * estivesse mandando uma foto", e o texto fica curto. Em pé (4:5, o formato
 * que ocupa a bolha do WhatsApp no celular), vinho e dourado como o folder:
 * serviço, dia, hora, valor e o sinal. Como o folder, nunca leva o nome nem
 * o contato de quem marcou: o endereço abre sem login.
 */
export const TAMANHO_DA_FOTO = { width: 1080, height: 1350 };

const OURO = "#e8bf86";
const CREME = "#fbefd9";

type Fonte = { name: string; data: Buffer; weight: 400 | 700; style: "normal" };
let fontes: Promise<Fonte[] | undefined> | null = null;

/** A Inter do site (a fonte padrão da imagem espaçava as palavras de um jeito torto); sem ela, segue a padrão. */
function fontesDoSite(): Promise<Fonte[] | undefined> {
  fontes ??= Promise.all(
    ([400, 700] as const).map(async (weight) => ({
      name: "Inter",
      data: await readFile(join(process.cwd(), `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`)),
      weight,
      style: "normal" as const,
    })),
  ).catch(() => undefined);
  return fontes;
}

function Celula({ rotulo, valor, largura = "50%" }: { rotulo: string; valor: string; largura?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: largura, paddingRight: 24 }}>
      <span style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "rgba(246, 217, 174, 0.72)" }}>
        {rotulo}
      </span>
      <span style={{ marginTop: 12, fontSize: 68, lineHeight: 1.1, letterSpacing: -1, color: CREME }}>{valor}</span>
    </div>
  );
}

function Foto({ h, sinal, horas, tolerancia }: { h: HorarioPublico; sinal: number; horas: number; tolerancia: number }) {
  const pago = h.status === "requested" && h.comprovante;
  const grande = h.servico.length > 24 ? 80 : h.servico.length > 17 ? 96 : 112;
  const rodape = pago
    ? "A Tayssa confere o Pix e confirma o seu horário."
    : h.status === "requested"
      ? `Guardado até ${prazoDoSinal(h.criadoEm, horas).legivel}, esperando o sinal.`
      : h.status === "confirmed"
        ? `Tolerância de ${tolerancia} minutos de atraso.`
        : "";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        padding: "112px 104px 104px",
        background: "linear-gradient(160deg, #5a1328 0%, #3d0b20 48%, #1f050d 100%)",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* a moldura em fio de ouro, como a borda do cartão do VIP */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
          display: "flex",
          borderRadius: 44,
          border: "2px solid rgba(232, 191, 134, 0.42)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 54, letterSpacing: -1.5 }}>
          <span style={{ fontWeight: 700 }}>Tayssa</span>
          <span style={{ marginLeft: 14, color: OURO }}>Lash</span>
        </div>
        <div
          style={{
            display: "flex",
            padding: "16px 34px",
            borderRadius: 999,
            border: "2px solid rgba(232, 191, 134, 0.7)",
            color: "#f6d9ae",
            fontSize: 36,
          }}
        >
          {situacaoDoPedido({ status: h.status, comprovante_em: h.comprovante ? "sim" : null })}
        </div>
      </div>

      <div style={{ display: "flex", flexGrow: 1 }} />

      <span style={{ fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: "#f7c1d1" }}>Seu horário</span>
      <span style={{ marginTop: 18, fontSize: grande, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>
        {h.servico}
      </span>
      {h.volume ? <span style={{ marginTop: 16, fontSize: 46, color: CREME }}>{h.volume}</span> : null}

      <div
        style={{
          display: "flex",
          height: 2,
          marginTop: 64,
          background: "linear-gradient(90deg, #e8bf86, rgba(232, 191, 134, 0))",
        }}
      />
      {/* dia e hora numa linha só: "segunda, 19/10" não cabia em meia coluna ao lado da hora */}
      <div style={{ display: "flex", marginTop: 48 }}>
        <Celula rotulo="Dia e horário" valor={`${diaLegivel(h.dia)} às ${horaLegivel(h.hora)}`} largura="100%" />
      </div>
      {h.valor != null || h.status === "requested" ? (
        <div style={{ display: "flex", marginTop: 44 }}>
          {h.valor != null ? <Celula rotulo="Valor" valor={reais(h.valor)} /> : null}
          {h.status === "requested" ? (
            <Celula rotulo="Sinal no Pix" valor={pago ? `${reais(sinal)} pago` : reais(sinal)} />
          ) : null}
        </div>
      ) : null}

      <div style={{ display: "flex", flexGrow: 1 }} />

      {rodape ? <span style={{ fontSize: 36, lineHeight: 1.35, color: "rgba(255, 236, 222, 0.82)" }}>{rodape}</span> : null}
    </div>
  );
}

/** A foto do horário, sempre a da hora (o selo muda quando ela anexa o comprovante); null se o pedido não existe. */
export async function fotoDoHorario(id: string): Promise<ImageResponse | null> {
  const [h, settings, fontes] = await Promise.all([getHorarioPublico(id), getSettings(), fontesDoSite()]);
  if (!h) return null;
  const b = settings.booking;
  return new ImageResponse(
    <Foto h={h} sinal={b.deposit_reais} horas={b.sinal_horas} tolerancia={b.tolerancia_min} />,
    { ...TAMANHO_DA_FOTO, fonts: fontes, headers: { "cache-control": "private, no-store" } },
  );
}
