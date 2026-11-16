import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { MANUAL, MANUAL_ATUALIZADO_EM, textoDaBusca } from "@/lib/tayssa/manual";
import { dateLong } from "@/lib/tayssa/format";
import { AdminHeader } from "@/components/tayssa/admin/shell";
import { Icone } from "@/components/tayssa/admin/icons";
import { BuscaNoManual, TextoDoManual } from "@/components/tayssa/admin/manual";

export const metadata: Metadata = { title: "Manual do painel" };

/**
 * Manual do painel (pedido de 16/11/2026: "um único documento, organizado
 * por categorias, passo a passo, linguagem simples, dentro do painel").
 * O texto mora em `lib/tayssa/manual.ts`: mudou o painel, muda o manual.
 */
export default async function ManualPage() {
  await requireAdminPage();
  return (
    <div className="tya-manual">
      <AdminHeader
        eyebrow="Manual do painel"
        title={
          <>
            Como usar o <em>painel</em>
          </>
        }
        lead="Tudo o que dá para fazer aqui, passo a passo. Quando algo muda no painel, este manual muda junto."
      />
      <p className="tya-manual__regra">
        Atualizado em {dateLong(MANUAL_ATUALIZADO_EM, true)}. Os prints usam clientes de teste.
      </p>

      <BuscaNoManual />

      <ul className="tya-manual__indice" aria-label="Partes do manual">
        {MANUAL.map((c) => (
          <li key={c.id}>
            <a href={`#${c.id}`}>
              <span className="tya-manual__letra">{c.letra}</span>
              <b>{c.titulo}</b>
              <small>{c.resumo}</small>
            </a>
          </li>
        ))}
      </ul>

      {MANUAL.map((c) => (
        <section
          key={c.id}
          id={c.id}
          className="tya-manual__secao"
          data-manual-secao
          data-busca={`${c.titulo} ${c.resumo}`}
        >
          <header>
            <span className="tya-manual__letra" aria-hidden="true">
              {c.letra}
            </span>
            <div>
              <h2>{c.titulo}</h2>
              <p>{c.resumo}</p>
            </div>
          </header>
          <div className="tya-manual__topicos">
            {c.topicos.map((t) => (
              <article
                key={t.id}
                id={t.id}
                className="tya-card tya-manual__topico"
                data-manual-topico
                data-busca={textoDaBusca(t)}
              >
                <h3>{t.titulo}</h3>
                {t.onde?.length ? (
                  <ol className="tya-manual__onde" aria-label="Onde fica">
                    <li>
                      <Icone nome={c.icone} />
                    </li>
                    {t.onde.map((o) => (
                      <li key={o}>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}
                {t.texto ? (
                  <p className="tya-manual__texto">
                    <TextoDoManual texto={t.texto} />
                  </p>
                ) : null}
                {t.passos?.length ? (
                  <ol className="tya-passos">
                    {t.passos.map((p, i) => (
                      <li key={i}>
                        <TextoDoManual texto={p} />
                      </li>
                    ))}
                  </ol>
                ) : null}
                {t.dica ? (
                  <p className="tya-manual__dica">
                    <TextoDoManual texto={t.dica} />
                  </p>
                ) : null}
                {t.imagem ? (
                  <figure className={`tya-manual__foto${t.imagem.larga ? " tya-manual__foto--larga" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.imagem.src}
                      alt={t.imagem.alt}
                      width={t.imagem.largura}
                      height={t.imagem.altura}
                      loading="lazy"
                      decoding="async"
                    />
                    {t.imagem.legenda ? <figcaption>{t.imagem.legenda}</figcaption> : null}
                  </figure>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
