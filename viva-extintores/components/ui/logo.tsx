import Image from "next/image";
import Link from "next/link";
import { MARCA, ROUTES } from "@/lib/config";

/** A marca oficial da VIVA. O arquivo tem fundo transparente e contorno
 *  branco, então funciona igual no claro e no escuro. */
export function Logo({
  altura = 34,
  assinatura = false,
}: {
  altura?: number;
  /** a linha "Projetos e Segurança Contra Incêndio" embaixo da marca.
   *  Fora do cabeçalho: lá ela empurrava a barra para baixo e brigava
   *  por espaço com o menu. */
  assinatura?: boolean;
}) {
  return (
    <Link href={ROUTES.home} className="v-logo" aria-label={`${MARCA.nome} — início`}>
      <Image
        src="/brand/viva-logo.png"
        alt={MARCA.nome}
        width={Math.round((altura * 1024) / 456)}
        height={altura}
        priority
      />
      {assinatura ? <span className="v-logo__sub">{MARCA.assinatura}</span> : null}
    </Link>
  );
}
