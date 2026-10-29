"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { BASE, brl, waLink, type Cartao } from "@/app/palavracomalma/site/catalogo";
import { useSacola } from "./sacola";

export function CartaoProduto({ c, prioridade = false }: { c: Cartao; prioridade?: boolean }) {
  const { adicionar } = useSacola();
  const off = c.promo ? Math.round((1 - c.promo / c.preco) * 100) : 0;
  const link = `${BASE}/produto/${c.id}`;

  return (
    <article className={`lj-card${c.disponivel ? "" : " is-esgotado"}`}>
      <Link href={link} className="lj-card-fig" aria-label={c.nome}>
        <img src={c.img} alt={c.nome} loading={prioridade ? "eager" : "lazy"} decoding="async" />
        {c.img2 && <img src={c.img2} alt="" loading="lazy" decoding="async" className="lj-card-2" />}
        <span className="lj-card-selos">
          {!c.disponivel && <em className="is-esgotado">Esgotado</em>}
          {c.disponivel && off > 0 && <em>-{off}%</em>}
          {c.disponivel && c.lancamento && <em className="is-novo">Novo</em>}
        </span>
      </Link>
      <div className="lj-card-info">
        <span className="lj-card-cat">{c.catNome}</span>
        <Link href={link} className="lj-card-nome">
          {c.nome}
        </Link>
        {c.disponivel ? (
          <div className="lj-card-preco">
            {c.promo && <s>{brl(c.preco)}</s>}
            <strong>{brl(c.promo ?? c.preco)}</strong>
            {c.fator > 1 && <small>ou 3x de {brl(((c.promo ?? c.preco) * c.fator) / 3)}</small>}
          </div>
        ) : (
          <a
            className="lj-card-avise"
            href={waLink(`Oi! Vim pelo site. Quero um aviso quando “${c.nome}” voltar.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Bell size={13} /> Avise-me quando voltar
          </a>
        )}
      </div>
      {c.disponivel &&
        (c.temVariacao ? (
          <Link href={link} className="lj-card-mais is-texto" aria-label={`Escolher opção de ${c.nome}`}>
            Escolher
          </Link>
        ) : (
          <button
            className="lj-card-mais"
            aria-label={`Adicionar ${c.nome} à sacola`}
            onClick={(e) =>
              adicionar(
                { pid: c.id, nome: c.nome, preco: c.promo ?? c.preco, img: c.img, fator: c.fator },
                e.currentTarget.closest("article")?.querySelector("img")
              )
            }
          >
            <Plus size={18} />
          </button>
        ))}
    </article>
  );
}
