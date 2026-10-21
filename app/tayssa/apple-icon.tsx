import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** O ícone de quem salva o site (ou o VIP) na tela de início do iPhone. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const negrito = await readFile(join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7a1d3a 0%, #4a0d1f 100%)",
          color: "#f3e3c0",
          fontFamily: "Inter",
          fontSize: 112,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        T
      </div>
    ),
    { ...size, fonts: [{ name: "Inter", data: negrito, weight: 700, style: "normal" }] }
  );
}
