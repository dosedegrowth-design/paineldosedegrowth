import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * A imagem que aparece quando o link do site é mandado no WhatsApp, no
 * Instagram ou no Google: a foto da abertura e a marca no vinho da casa.
 * Montada uma vez no build (sem dado de banco).
 */
export const alt = "Tayssa Lash — cílios e embelezamento do olhar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const raiz = process.cwd();
  const [foto, regular, negrito] = await Promise.all([
    readFile(join(raiz, "public/tayssa/photos/hero.jpg")).catch(() => null),
    readFile(join(raiz, "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff")),
    readFile(join(raiz, "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #6c1529 0%, #4a0d1f 55%, #2c0712 100%)",
          color: "#fbf0f3",
          fontFamily: "Inter",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px" }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#e6c993", textTransform: "uppercase" }}>
            Private Beauty Experience
          </div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 18 }}>
            <span style={{ fontSize: 128, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Tayssa</span>
            <span style={{ fontSize: 128, fontWeight: 400, letterSpacing: -4, lineHeight: 1, color: "#e6c993", marginLeft: 22 }}>
              Lash
            </span>
          </div>
          <div style={{ fontSize: 34, marginTop: 28, color: "rgba(251, 240, 243, 0.82)", lineHeight: 1.3 }}>
            Cílios e embelezamento do olhar
          </div>
          <div style={{ display: "flex", marginTop: 40, width: 120, height: 2, background: "#e6c993" }} />
        </div>
        {foto ? (
          <img
            src={`data:image/jpeg;base64,${foto.toString("base64")}`}
            alt=""
            width={420}
            height={630}
            style={{ width: 420, height: 630, objectFit: "cover" }}
          />
        ) : null}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: negrito, weight: 700, style: "normal" },
      ],
    }
  );
}
