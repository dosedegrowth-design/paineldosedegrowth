import Link from "next/link";
import { MARCA, ROUTES } from "@/lib/config";

/**
 * Marca em texto. Quando a VIVA entregar o SVG oficial, é trocar o miolo
 * daqui por <Image src="/brand/viva.svg" /> — nada mais muda.
 */
export function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link href={ROUTES.home} className="v-logo" aria-label={`${MARCA.nome} — início`}>
      <span className="v-logo__mark">
        Viv<span>a</span>
      </span>
      <span className="v-logo__sub">
        {compacto ? "Extintores" : MARCA.assinatura}
      </span>
    </Link>
  );
}
