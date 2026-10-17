import type { CSSProperties } from "react";
import Image from "next/image";
import { estiloFoco } from "@/lib/tayssa/catalogo";
import { fileirasDoMural, type FotoMural } from "@/lib/tayssa/mural";

/**
 * O fundo do VIP: as fotos aprovadas da Tayssa em fileiras inclinadas,
 * cada uma correndo para um lado, sem fim, sob um véu pérola — o trabalho
 * dela passando atrás do espaço da cliente. Só CSS (transform na placa de
 * vídeo); com "reduzir movimento", as fileiras ficam paradas.
 */
export function MuralFotos({ fotos }: { fotos: FotoMural[] }) {
  const fileiras = fileirasDoMural(fotos, 6, 7);
  if (!fileiras.length) return null;
  return (
    <div className="tyv-mural" aria-hidden>
      <div className="tyv-mural__giro">
        {fileiras.map((fileira, f) => (
          <div
            key={f}
            className="tyv-mural__fileira"
            data-sentido={f % 2 ? "direita" : "esquerda"}
            style={{ "--dur": `${90 + f * 14}s` } as CSSProperties}
          >
            {/* a fileira vai duas vezes: andar meia largura emenda sem corte */}
            {[...fileira, ...fileira].map((foto, i) => (
              <span key={`${f}-${i}`} className="tyv-mural__foto">
                <Image src={foto.src} alt="" fill sizes="280px" style={estiloFoco(foto.foco)} draggable={false} />
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="tyv-mural__veu" />
    </div>
  );
}
