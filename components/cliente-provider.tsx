"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CLIENTES, type Cliente } from "@/lib/mock-data";

interface ClienteContextValue {
  cliente: Cliente;
  setClienteSlug: (slug: string) => void;
  clientes: Cliente[];
}

const ClienteContext = createContext<ClienteContextValue | null>(null);

const STORAGE_KEY = "ddg-trafego-cliente";

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string>(CLIENTES[0]?.slug ?? "petderma");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEY)
      : null;
    if (saved && CLIENTES.find((c) => c.slug === saved)) {
      setSlug(saved);
    }
    setHydrated(true);
  }, []);

  const setClienteSlug = (newSlug: string) => {
    setSlug(newSlug);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newSlug);
    }
  };

  const cliente =
    CLIENTES.find((c) => c.slug === slug) ?? CLIENTES[0];

  if (!hydrated) {
    return <>{children}</>;
  }

  return (
    <ClienteContext.Provider
      value={{ cliente, setClienteSlug, clientes: CLIENTES }}
    >
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente(): ClienteContextValue {
  const ctx = useContext(ClienteContext);
  if (!ctx) {
    return {
      cliente: CLIENTES[0],
      setClienteSlug: () => {},
      clientes: CLIENTES,
    };
  }
  return ctx;
}
