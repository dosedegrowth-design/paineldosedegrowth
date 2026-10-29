"use client";

import { useState, useSyncExternalStore } from "react";
import { BriefingForm } from "@/components/briefing/briefing-form";
import { BENEFICIOS_EXEMPLO, PADROES_EXEMPLO, lerExemplo } from "@/components/briefing/exemplo";

const nada = () => () => {};

/**
 * O formulário de exemplo só existe no navegador: as respostas moram no
 * aparelho de quem abre, então o servidor manda a página vazia e o
 * formulário entra já com o que a pessoa tinha escrito.
 */
export function BriefingExemplo() {
  const noNavegador = useSyncExternalStore(
    nada,
    () => true,
    () => false
  );
  if (!noNavegador) return <div className="ddgb" />;
  return <Formulario />;
}

function Formulario() {
  // lido uma vez, ao abrir
  const [salvo] = useState(lerExemplo);
  return (
    <BriefingForm
      exemplo
      chave=""
      partes={salvo.partes}
      padroes={PADROES_EXEMPLO}
      arquivos={[]}
      beneficios={BENEFICIOS_EXEMPLO}
      enviadoEm={salvo.enviadoEm}
    />
  );
}
