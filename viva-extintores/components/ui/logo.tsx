import Link from "next/link";
import { MARCA, ROUTES } from "@/lib/config";
import { PREFIXO } from "@/lib/photos";

/** A marca oficial da VIVA. O arquivo tem fundo transparente e contorno
 *  branco, então funciona igual no claro e no escuro.
 *
 *  <img> cru, não next/image: na exportação estática o next/image aponta
 *  para /_next/image?url=…, um otimizador que não existe num host de
 *  arquivos — foi assim que o logo apareceu quebrado no GitHub Pages. O
 *  PNG tem 50 KB; não precisa de otimizador. */
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${PREFIXO}/brand/viva-logo.png`}
        alt={MARCA.nome}
        width={Math.round((altura * 1024) / 456)}
        height={altura}
        decoding="sync"
        fetchPriority="high"
      />
      {assinatura ? <span className="v-logo__sub">{MARCA.assinatura}</span> : null}
    </Link>
  );
}
