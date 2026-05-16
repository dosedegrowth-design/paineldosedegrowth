"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { listClientes, type ClienteCompleto } from "@/lib/actions/clientes";
import type { TipoNegocio } from "@/lib/mock-data";

/**
 * Cliente leve usado pelo Provider (subset de ClienteCompleto).
 * id aqui é o UUID real do Supabase — fundamental para as queries.
 */
export interface ClienteContextItem {
  id: string; // UUID do Supabase
  slug: string;
  nome: string;
  tipo_negocio: TipoNegocio;
  cor_primaria: string;
  logo_url: string;
  cac_maximo: number;
  ticket_medio: number;
  ativo: boolean;
  // Status real de conexão/sync — pra UI dizer a verdade
  status_meta: string | null;
  status_google: string | null;
  ultima_sync_meta: string | null;
  ultima_sync_google: string | null;
  ultima_sync_status: string | null;
}

interface ClienteContextValue {
  cliente: ClienteContextItem;
  setClienteSlug: (slug: string) => void;
  clientes: ClienteContextItem[];
  carregando: boolean;
}

const ClienteContext = createContext<ClienteContextValue | null>(null);

const STORAGE_KEY = "ddg-trafego-cliente";

const FALLBACK: ClienteContextItem = {
  id: "",
  slug: "carregando",
  nome: "Carregando...",
  tipo_negocio: "lead_whatsapp",
  cor_primaria: "#F15839",
  logo_url: "/brand/logo-icon.svg",
  cac_maximo: 0,
  ticket_medio: 0,
  ativo: true,
  status_meta: null,
  status_google: null,
  ultima_sync_meta: null,
  ultima_sync_google: null,
  ultima_sync_status: null,
};

function fromCompleto(c: ClienteCompleto): ClienteContextItem {
  return {
    id: c.id,
    slug: c.slug,
    nome: c.nome,
    tipo_negocio: c.tipo_negocio,
    cor_primaria: c.cor_primaria,
    logo_url: "/brand/logo-icon.svg",
    cac_maximo: c.cac_maximo ?? 0,
    ticket_medio: c.ticket_medio ?? 0,
    ativo: c.ativo,
    status_meta: c.status_meta ?? null,
    status_google: c.status_google ?? null,
    ultima_sync_meta: c.ultima_sync_meta ?? null,
    ultima_sync_google: c.ultima_sync_google ?? null,
    ultima_sync_status: c.ultima_sync_status ?? null,
  };
}

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [clientes, setClientes] = useState<ClienteContextItem[]>([]);
  const [slug, setSlug] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Carrega clientes do Supabase ao montar
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const lista = await listClientes();
      if (cancelado) return;
      const mapped = lista
        .filter((c) => c.ativo && c.setup_concluido !== false)
        .map(fromCompleto);
      // Se houver rascunhos (setup_concluido false), incluí-los também
      // mas dando preferência aos concluídos
      const finais = mapped.length > 0 ? mapped : lista.filter((c) => c.ativo).map(fromCompleto);
      setClientes(finais);

      // Determina slug inicial: storage > primeiro disponível
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      const slugInicial =
        saved && finais.find((c) => c.slug === saved)
          ? saved
          : (finais[0]?.slug ?? "");

      setSlug(slugInicial);
      setHydrated(true);
      setCarregando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const setClienteSlug = (newSlug: string) => {
    setSlug(newSlug);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newSlug);
    }
  };

  const cliente =
    clientes.find((c) => c.slug === slug) ?? clientes[0] ?? FALLBACK;

  if (!hydrated) {
    return (
      <ClienteContext.Provider
        value={{
          cliente: FALLBACK,
          setClienteSlug,
          clientes: [],
          carregando: true,
        }}
      >
        {children}
      </ClienteContext.Provider>
    );
  }

  return (
    <ClienteContext.Provider
      value={{ cliente, setClienteSlug, clientes, carregando }}
    >
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente(): ClienteContextValue {
  const ctx = useContext(ClienteContext);
  if (!ctx) {
    return {
      cliente: FALLBACK,
      setClienteSlug: () => {},
      clientes: [],
      carregando: true,
    };
  }
  return ctx;
}
