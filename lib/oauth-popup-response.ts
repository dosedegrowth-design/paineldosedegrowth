/**
 * Helper para callbacks OAuth quando rodando em modo popup.
 * Renderiza HTML que envia postMessage ao window.opener e fecha o popup.
 *
 * Lado cliente (página principal) escuta:
 *   window.addEventListener("message", (e) => {
 *     if (e.data?.type === "ddg_oauth_complete") { ... }
 *   })
 */

import { NextResponse } from "next/server";

interface PopupResponseInput {
  ok: boolean;
  provider: "meta" | "google";
  clienteId?: string;
  error?: string;
  origin: string; // URL.origin do callback (usado como targetOrigin no postMessage)
}

export function renderPopupResponse(input: PopupResponseInput): NextResponse {
  const payload = {
    type: "ddg_oauth_complete",
    provider: input.provider,
    ok: input.ok,
    clienteId: input.clienteId ?? null,
    error: input.error ?? null,
  };

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${input.ok ? "Conectado" : "Erro"} — DDG Tráfego</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0a;
    color: #fafafa;
    padding: 24px;
  }
  .container {
    text-align: center;
    max-width: 380px;
  }
  .icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${input.ok ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"};
    color: ${input.ok ? "#10b981" : "#ef4444"};
    font-size: 36px;
  }
  h1 {
    font-size: 18px;
    margin-bottom: 8px;
    color: ${input.ok ? "#10b981" : "#ef4444"};
  }
  p {
    font-size: 14px;
    color: #a3a3a3;
    line-height: 1.5;
  }
  .small {
    font-size: 11px;
    color: #525252;
    margin-top: 16px;
  }
</style>
</head>
<body>
<div class="container">
  <div class="icon">${input.ok ? "✓" : "✕"}</div>
  <h1>${input.ok ? "Conectado com sucesso!" : "Falha na conexão"}</h1>
  <p>${
    input.ok
      ? "Voltando para o painel..."
      : escapeHtml(input.error ?? "Erro desconhecido")
  }</p>
  <p class="small">Esta janela vai fechar automaticamente.</p>
</div>
<script>
  (function() {
    var payload = ${JSON.stringify(payload)};
    try {
      if (window.opener && !window.opener.closed) {
        // Tenta postMessage no opener (página que abriu o popup)
        window.opener.postMessage(payload, ${JSON.stringify(input.origin)});
      }
    } catch (err) {
      console.error("postMessage failed:", err);
    }
    // Fecha o popup após pequeno delay pro user ver o feedback
    setTimeout(function() {
      try { window.close(); } catch (e) {}
      // Fallback: se não conseguir fechar, redireciona pra página principal
      setTimeout(function() {
        if (!window.closed) {
          window.location.href = ${JSON.stringify(
            input.origin + "/clientes"
          )};
        }
      }, 500);
    }, 1200);
  })();
</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
