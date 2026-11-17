import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { MANUAL, MANUAL_ATUALIZADO_EM, ladoDoTopico, textoDaBusca } from "@/lib/tayssa/manual";
import { dateLong } from "@/lib/tayssa/format";
import { AdminHeader } from "@/components/tayssa/admin/shell";
import { Icone } from "@/components/tayssa/admin/icons";
import { BuscaNoManual, EtiquetaDoLado, TextoDoManual } from "@/components/tayssa/admin/manual";

export const metadata: Metadata = { title: "Manual do painel" };

/** As duas metades do manual (17/11/2026): o painel dela e o site da cliente, cada parte num cartão. */
const GRUPOS = [
  { lado: "painel" as const, texto: "O que você faz e vê aqui no painel." },
  { lado: "cliente" as const, texto: "O que a cliente vê e faz no site, para você tirar as dúvidas dela com certeza." },
];

/**
 * Manual do painel (pedido de 16/11/2026: "um único documento, organizado
 * por categorias, passo a passo, linguagem simples, dentro do painel").
 * O texto mora em `lib/tayssa/manual.ts`: mudou o painel, muda o manual.
 * Cada explicação diz de onde é (17/11/2026): do painel, do site da
 * cliente, ou das duas pontas.
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
        lead="Tudo o que dá para fazer aqui e o que a cliente vê no site, passo a passo. Cada explicação diz de onde é. Quando algo muda, este manual muda junto."
      />
      <p className="tya-manual__regra">
        Atualizado em {dateLong(MANUAL_ATUALIZADO_EM, true)}. Os prints usam clientes de teste.
      </p>

      <BuscaNoManual />

      {GRUPOS.map((g) => (
        <div key={g.lado} className="tya-manual__grupo" data-manual-grupo={g.lado}>
          <p className="tya-manual__grupo-titulo">
            <EtiquetaDoLado lado={g.lado} />
            <span>{g.texto}</span>
          </p>
          <ul className="tya-manual__indice" aria-label={g.lado === "painel" ? "Partes do painel" : "Partes do site da cliente"}>
            {MANUAL.filter((c) => c.lado === g.lado).map((c) => (
              <li key={c.id} data-lado={c.lado}>
                <a href={`#${c.id}`}>
                  <span className="tya-manual__letra">{c.letra}</span>
                  <b>{c.titulo}</b>
                  <small>{c.resumo}</small>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {MANUAL.map((c) => (
        <section
          key={c.id}
          id={c.id}
          className="tya-manual__secao"
          data-manual-secao
          data-lado={c.lado}
          data-busca={`${c.titulo} ${c.resumo}`}
        >
          <header>
            <span className="tya-manual__letra" aria-hidden="true">
              {c.letra}
            </span>
            <div>
              <EtiquetaDoLado lado={c.lado} />
              <h2>{c.titulo}</h2>
              <p>{c.resumo}</p>
            </div>
          </header>
          <div className="tya-manual__topicos">
            {c.topicos.map((t) => {
              const lado = ladoDoTopico(t, c);
              return (
                <article
                  key={t.id}
                  id={t.id}
                  className="tya-card tya-manual__topico"
                  data-manual-topico
                  data-lado={lado}
                  data-busca={textoDaBusca(t)}
                >
                  <EtiquetaDoLado lado={lado} />
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
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
