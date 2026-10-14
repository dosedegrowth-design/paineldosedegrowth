"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

export function Aprovacao() {
  const [novoNoAr, setNovoNoAr] = useState(false);
  return (
    <div className="pa-temas">
      <div className={`pa-tema${novoNoAr ? "" : " is-ar"}`}>
        <div className="pa-tema-mini is-velho" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <div>
          <b>Tema atual</b>
          <span>{novoNoAr ? "Guardado. Volta ao ar quando você quiser." : "É o que as clientes veem hoje."}</span>
        </div>
        <em>{novoNoAr ? "guardado" : "no ar"}</em>
      </div>
      <div className={`pa-tema${novoNoAr ? " is-ar" : ""}`}>
        <div className="pa-tema-mini is-novo" aria-hidden>
          <img src="/palavracomalma/logo-claro.png" alt="" />
        </div>
        <div>
          <b>Tema novo</b>
          <span>{novoNoAr ? "Publicado depois do seu OK." : "Em construção. Só abre pelo link de prévia."}</span>
        </div>
        <em>{novoNoAr ? "no ar" : "prévia"}</em>
      </div>
      <button className="pa-apv-btn" onClick={() => setNovoNoAr((v) => !v)}>
        <ArrowLeftRight size={16} /> {novoNoAr ? "Simular: voltar ao tema atual" : "Simular: publicar o tema novo"}
      </button>
    </div>
  );
}
