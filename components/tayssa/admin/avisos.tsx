"use client";

import { useEffect, useState } from "react";
import {
  ativarAvisosAction,
  chaveDosAvisosAction,
  desativarAvisosAction,
  testarAvisoAction,
} from "@/lib/tayssa/actions/avisos";
import { useTarefa } from "@/components/tayssa/ui/acao";

/**
 * "Avisos de novos pedidos" (05/11/2026): a Tayssa liga uma vez em cada
 * celular e, quando uma cliente marca um horário pelo site, chega uma
 * notificação como a de um aplicativo. Tocar abre a agenda para confirmar.
 * No Android vale no Chrome; no iPhone só no painel aberto pela Tela de
 * Início (o Safari só manda aviso para site instalado como app).
 */

type Estado = "carregando" | "sem-suporte" | "iphone" | "bloqueado" | "desligado" | "ligado";

const ESCOPO = "/tayssa/admin/";
const ARQUIVO = "/tayssa/avisos-sw.js";

function chaveEmBytes(base64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bruto.length));
  for (let i = 0; i < bruto.length; i++) out[i] = bruto.charCodeAt(i);
  return out;
}

function ehIphoneForaDoApp(): boolean {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instalado =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !instalado;
}

export function AvisosDePedido() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [nota, setNota] = useState<string | null>(null);
  const [ocupado, iniciar] = useTarefa();

  useEffect(() => {
    let vivo = true;
    (async () => {
      const temSuporte = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      let proximo: Estado;
      if (!temSuporte) proximo = ehIphoneForaDoApp() ? "iphone" : "sem-suporte";
      else if (Notification.permission === "denied") proximo = "bloqueado";
      else {
        const reg = await navigator.serviceWorker.getRegistration(ESCOPO);
        const sub = await reg?.pushManager.getSubscription();
        proximo = sub ? "ligado" : "desligado";
      }
      if (vivo) setEstado(proximo);
    })().catch(() => {
      if (vivo) setEstado("sem-suporte");
    });
    return () => {
      vivo = false;
    };
  }, []);

  const ativar = () =>
    iniciar(async () => {
      setNota(null);
      try {
        const permissao = await Notification.requestPermission();
        if (permissao !== "granted") {
          setEstado(permissao === "denied" ? "bloqueado" : "desligado");
          return;
        }
        const chave = await chaveDosAvisosAction();
        if (!chave.ok) {
          setNota(chave.error);
          return;
        }
        const reg = await navigator.serviceWorker.register(ARQUIVO, { scope: ESCOPO });
        await navigator.serviceWorker.ready;
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chaveEmBytes(chave.data.publicKey) }));
        const j = sub.toJSON();
        const r = await ativarAvisosAction({
          endpoint: sub.endpoint,
          p256dh: j.keys?.p256dh ?? "",
          auth: j.keys?.auth ?? "",
          aparelho: navigator.userAgent.slice(0, 200),
        });
        if (!r.ok) {
          setNota(r.error);
          return;
        }
        setEstado("ligado");
        setNota("Pronto: um aviso de teste foi enviado para este celular.");
      } catch {
        setNota("Não deu para ligar os avisos neste navegador. Tente pelo Chrome (Android) ou pelo painel na Tela de Início (iPhone).");
      }
    });

  const testar = () =>
    iniciar(async () => {
      setNota(null);
      const r = await testarAvisoAction();
      setNota(r.ok ? "Aviso de teste enviado. Ele chega em alguns segundos." : r.error);
    });

  const desligar = () =>
    iniciar(async () => {
      setNota(null);
      const reg = await navigator.serviceWorker.getRegistration(ESCOPO);
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await desativarAvisosAction({ endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setEstado("desligado");
    });

  if (estado === "carregando") return null;

  return (
    <div className="tya-card tya-avisos" data-estado={estado}>
      <span className="tya-avisos__icone" aria-hidden>
        <svg viewBox="0 0 24 24">
          <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2H4.5z" />
          <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
        </svg>
      </span>
      <div className="tya-avisos__texto">
        <b>Avisos de novos pedidos</b>
        <p className="tya-small">
          {estado === "ligado"
            ? "Ligados neste celular: cada horário marcado pelo site chega como notificação."
            : estado === "desligado"
              ? "Ligue para receber uma notificação neste celular a cada horário marcado pelo site."
              : estado === "iphone"
                ? "No iPhone: toque em Compartilhar e em “Adicionar à Tela de Início”, abra o painel por lá e ligue os avisos."
                : estado === "bloqueado"
                  ? "As notificações deste site estão bloqueadas. Libere nas configurações do navegador e volte aqui."
                  : "Este navegador não recebe avisos. No Android use o Chrome; no iPhone, o painel pela Tela de Início."}
        </p>
        {nota ? (
          <p className="tya-small tya-avisos__nota" role="status">
            {nota}
          </p>
        ) : null}
      </div>
      <div className="tya-avisos__acoes">
        {estado === "desligado" ? (
          <button type="button" className="tya-btn tya-btn--primary tya-btn--sm" onClick={ativar} disabled={ocupado}>
            {ocupado ? "Ligando…" : "Ligar avisos"}
          </button>
        ) : estado === "ligado" ? (
          <>
            <button type="button" className="tya-btn tya-btn--soft tya-btn--sm" onClick={testar} disabled={ocupado}>
              Mandar teste
            </button>
            <button type="button" className="tya-btn tya-btn--ghost tya-btn--sm" onClick={desligar} disabled={ocupado}>
              Desligar
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
