import { ImageResponse } from "next/og";
import { getHorarioPublico } from "@/lib/tayssa/queries/horario";
import { getSettings } from "@/lib/tayssa/settings";
import { diaLegivel, horaLegivel, prazoDoSinal, reais } from "@/lib/tayssa/agendar";

/**
 * O "folder" do horário (pedido do Lucas, 05/11/2026): a imagem que o
 * WhatsApp mostra grande quando a mensagem leva o link do horário. Vinho e
 * dourado da casa, serviço, dia, hora, valor e o sinal. Sem nome nem
 * contato de ninguém: o link abre sem login.
 */
export const alt = "Seu horário com a Tayssa Farias";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITUACAO: Record<string, string> = {
  requested: "Aguardando sinal",
  confirmed: "Confirmado",
  done: "Realizado",
  cancelled: "Fora da agenda",
  no_show: "Não compareceu",
};

export default async function Imagem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // banco fora do ar: o WhatsApp ainda recebe o cartão genérico da casa
  const [h, settings] = await Promise.all([getHorarioPublico(id).catch(() => null), getSettings()]);
  const b = settings.booking;
  const servico = h ? (h.volume ? `${h.servico} · ${h.volume}` : h.servico) : "Seu horário com a Tayssa";
  const quando = h ? `${diaLegivel(h.dia)} · ${horaLegivel(h.hora)}` : "";
  const rodapeEsq = h?.valor != null ? reais(h.valor) : "";
  const rodapeDir =
    h?.status === "requested" && h.comprovante
      ? `Sinal pago no Pix · a Tayssa confirma`
      : h?.status === "requested"
        ? `Sinal de ${reais(b.deposit_reais)} no Pix · guardado até ${prazoDoSinal(h.criadoEm, b.sinal_horas).legivel}`
        : h?.status === "confirmed"
          ? `Tolerância de ${b.tolerancia_min} minutos de atraso`
          : "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 72px 56px",
        background: "linear-gradient(140deg, #5a1328 0%, #3d0b20 45%, #1f050d 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 44, letterSpacing: -1 }}>
          <span style={{ fontWeight: 700 }}>Tayssa</span>
          <span style={{ marginLeft: 12, fontWeight: 400, color: "#e8bf86" }}>Farias</span>
        </div>
        {h ? (
          <div
            style={{
              display: "flex",
              padding: "12px 26px",
              borderRadius: 999,
              border: "2px solid rgba(232, 191, 134, 0.65)",
              color: "#f6d9ae",
              fontSize: 28,
            }}
          >
            {h.status === "requested" && h.comprovante ? "Comprovante enviado" : (SITUACAO[h.status] ?? "")}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 28, letterSpacing: 6, color: "#f7c1d1", textTransform: "uppercase" }}>
          Seu horário
        </span>
        <span
          style={{
            marginTop: 14,
            fontSize: servico.length > 30 ? 64 : 80,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {servico}
        </span>
        {quando ? <span style={{ marginTop: 18, fontSize: 50, color: "#fbefd9" }}>{quando}</span> : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            height: 2,
            marginBottom: 22,
            background: "linear-gradient(90deg, #e8bf86, rgba(232,191,134,0))",
          }}
        />
        <div
          style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "rgba(255, 236, 222, 0.82)" }}
        >
          <span>{rodapeEsq}</span>
          <span>{rodapeDir}</span>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
