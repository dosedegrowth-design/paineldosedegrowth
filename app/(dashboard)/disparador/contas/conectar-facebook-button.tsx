"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Botao "Conectar via Facebook" usando Embedded Signup.
 *
 * Pre-requisitos no Meta App (developers.facebook.com -> App):
 *  - Facebook Login for Business configurado com WhatsApp Embedded Signup
 *  - `Valid OAuth Redirect URIs` inclui dominios do painel
 *  - Configuration ID criado em "Facebook Login for Business" > "Configurations"
 *
 * Fluxo:
 *  1. FB.login com config_id -> popup abre
 *  2. User escolhe BM, numero e finaliza setup
 *  3. response.authResponse.code + window.addEventListener('message')
 *     captura phone_number_id e waba_id via postMessage
 *  4. POST /api/dispatcher/oauth/facebook troca code e cadastra conta
 */

interface FbResponse {
  authResponse?: {
    code: string;
  };
  status: string;
}

interface FbSdk {
  init: (opts: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
  login: (cb: (r: FbResponse) => void, opts: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    FB?: FbSdk;
    fbAsyncInit?: () => void;
  }
}

export function ConectarFacebookButton() {
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const configId = process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID;
  const apiVersion = process.env.NEXT_PUBLIC_META_API_VERSION ?? "v25.0";

  // Carrega SDK FB
  useEffect(() => {
    if (!appId) return;
    if (window.FB) {
      setSdkReady(true);
      return;
    }
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, cookie: true, xfbml: false, version: apiVersion });
      setSdkReady(true);
    };
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, [appId, apiVersion]);

  // Listener pra postMessage do popup Embedded Signup (retorna phone_number_id + waba_id)
  const signupData = useCallback(() => {
    return new Promise<{ phone_number_id: string; waba_id: string }>((resolve, reject) => {
      const handler = (event: MessageEvent) => {
        if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
            window.removeEventListener("message", handler);
            resolve({
              phone_number_id: data.data?.phone_number_id,
              waba_id: data.data?.waba_id,
            });
          }
          if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "CANCEL") {
            window.removeEventListener("message", handler);
            reject(new Error("Signup cancelado"));
          }
        } catch { /* not our message */ }
      };
      window.addEventListener("message", handler);
      // timeout 5min
      setTimeout(() => {
        window.removeEventListener("message", handler);
        reject(new Error("Tempo esgotado aguardando FB"));
      }, 300000);
    });
  }, []);

  async function handleConnect() {
    if (!window.FB || !configId) {
      toast.error("FB SDK ou config_id nao carregado");
      return;
    }
    setLoading(true);

    try {
      // Comeca a escutar antes de abrir o popup
      const dataPromise = signupData();

      const fbResp = await new Promise<FbResponse>((resolve) => {
        window.FB!.login(resolve, {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: "",
            sessionInfoVersion: "3",
          },
        });
      });

      if (!fbResp.authResponse?.code) {
        throw new Error("Login Facebook cancelado");
      }

      const { phone_number_id, waba_id } = await dataPromise;
      if (!phone_number_id || !waba_id) {
        throw new Error("Embedded Signup nao retornou IDs");
      }

      const res = await fetch("/api/dispatcher/oauth/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: fbResp.authResponse.code,
          phone_number_id,
          waba_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha no callback");

      toast.success(`Conta ${data.conta.display_name} conectada!`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!appId || !configId) {
    return (
      <p className="text-xs text-muted-foreground">
        Embedded Signup não configurado. Defina <code>NEXT_PUBLIC_META_APP_ID</code> e{" "}
        <code>NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID</code> no <code>.env.local</code>.
      </p>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={!sdkReady || loading} className="w-full bg-[#1877F2] hover:bg-[#1865d3]">
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}
      {sdkReady ? "Conectar via Facebook" : "Carregando SDK..."}
    </Button>
  );
}
