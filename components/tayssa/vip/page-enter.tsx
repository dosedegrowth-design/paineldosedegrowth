"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Cada tela do app entra com um respiro curto; a chave é a rota, então trocar de aba refaz a entrada. */
export function PageEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="tyv-enter">
      {children}
    </div>
  );
}
