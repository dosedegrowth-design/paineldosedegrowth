"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminArchivePhotoAction, adminDeletePhotoAction, adminUpdatePhotoAction } from "@/lib/tayssa/actions/photos";
import type { PhotoRow } from "@/lib/tayssa/types";
import { dateShort } from "@/lib/tayssa/format";
import { Campo } from "@/components/tayssa/admin/forms";
import { Icone } from "@/components/tayssa/admin/icons";

/**
 * A biblioteca: tudo que a Tayssa subiu, onde cada foto está, e os
 * controles que mudam o site na hora (destaque, arquivar, apagar).
 *
 * `places` vem do servidor e diz, para cada foto, os lugares que ela
 * ocupa de verdade — a mesma distribuição que o site e o cartão leem.
 */
export function PhotoLibrary({
  photos,
  styles,
  places,
}: {
  photos: PhotoRow[];
  styles: string[];
  places?: Record<string, string[]>;
}) {
  const active = photos.filter((p) => p.status === "active");
  const archived = photos.filter((p) => p.status === "archived");

  if (!photos.length) {
    return (
      <div className="tya-nada">
        <Icone nome="fotos" />
        <b>Nenhuma foto ainda.</b>
        <span>
          Enquanto a biblioteca está vazia, o site se sustenta na tipografia — nunca com foto de banco nem caixote
          vazio. A primeira que você subir muda isso na hora.
        </span>
        <ol className="tya-passos">
          <li>A 1ª foto abre o site: ela vira o herói.</li>
          <li>Ela entra também na frente do cartão da cliente.</li>
          <li>Da 2ª em diante o sistema preenche a sequência de trabalhos, o trilho de detalhes e os serviços.</li>
          <li>Destaque sobe a foto para o começo da fila; arquivar tira do ar sem apagar.</li>
        </ol>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <datalist id="tayssa-styles-lib">
        {styles.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      {active.length ? (
        <Grid photos={active} places={places} queued />
      ) : (
        <div className="tya-nada">
          <Icone nome="fotos" />
          <b>Nenhuma foto no ar.</b>
          <span>Tudo que você subiu está arquivado. Restaure uma foto para o site voltar a mostrar o seu trabalho.</span>
        </div>
      )}
      {archived.length ? (
        <div>
          <span className="tya-eyebrow" style={{ display: "block", marginBottom: 12 }}>
            {archived.length === 1 ? "1 arquivada" : `${archived.length} arquivadas`}
          </span>
          <Grid photos={archived} places={places} />
        </div>
      ) : null}
    </div>
  );
}

function Grid({ photos, places, queued }: { photos: PhotoRow[]; places?: Record<string, string[]>; queued?: boolean }) {
  return (
    <div className="tya-galeria tya-stagger">
      {photos.map((p, i) => (
        <PhotoCard key={p.id} photo={p} places={places?.[p.id] ?? []} position={queued ? i + 1 : null} />
      ))}
    </div>
  );
}

function PhotoCard({ photo, places, position }: { photo: PhotoRow; places: string[]; position: number | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [style, setStyle] = useState(photo.lash_style);
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [alt, setAlt] = useState(photo.alt);
  const [err, setErr] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const [pending, start] = useTransition();
  const live = photo.status === "active";

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setErr(null);
      const r = await fn();
      if (!r.ok) setErr(r.error ?? "Não deu certo.");
      else {
        setEditing(false);
        router.refresh();
      }
    });

  return (
    <article className={`tya-foto${live ? "" : " tya-foto--off"}`} data-ocupado={pending ? "true" : "false"}>
      <div className="tya-foto__img">
        {broken ? (
          <span className="tya-foto__tonal">Arquivo fora do ar</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.public_url} alt={photo.alt} loading="lazy" onError={() => setBroken(true)} />
        )}
        {photo.featured ? <span className="tya-pill tya-pill--gold tya-foto__selo">Destaque</span> : null}
        {position ? (
          <span className="tya-foto__n" title={`${position}ª da fila`}>
            {position}
          </span>
        ) : null}
      </div>

      {editing ? (
        <div style={{ display: "grid", gap: 10 }}>
          <Campo
            label="Volume / estilo"
            name={`style-${photo.id}`}
            list="tayssa-styles-lib"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
          <Campo
            label="Legenda"
            name={`caption-${photo.id}`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={120}
          />
          <Campo
            label="Descrição (leitores de tela)"
            name={`alt-${photo.id}`}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            maxLength={200}
          />
          <div className="tya-foto__acts">
            <button
              type="button"
              className="tya-btn tya-btn--sm tya-btn--primary"
              disabled={pending}
              onClick={() =>
                run(() =>
                  adminUpdatePhotoAction({
                    id: photo.id,
                    lash_style: style,
                    caption,
                    alt,
                    featured: photo.featured,
                    sort_order: photo.sort_order,
                  })
                )
              }
            >
              {pending ? "Salvando…" : "Salvar"}
            </button>
            <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => setEditing(false)} disabled={pending}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 5 }}>
            <strong className="tya-foto__t">{photo.lash_style}</strong>
            <span className="tya-small">{photo.caption ?? "sem legenda"}</span>
            <span className="tya-small" style={{ fontSize: 11, color: "var(--tya-muted-2)" }}>
              {photo.width && photo.height ? `${photo.width}×${photo.height} · ` : ""}
              {dateShort(photo.created_at)}
            </span>
          </div>

          <div className="tya-foto__onde">
            {live ? (
              places.length ? (
                places.map((p) => (
                  <span key={p} className={`tya-pill ${p === "Frente do cartão" ? "tya-pill--gold" : "tya-pill--brand"}`}>
                    {p}
                  </span>
                ))
              ) : (
                <span className="tya-pill tya-pill--quiet" title="No ar, mas a fila ainda não chegou nela">
                  Na reserva
                </span>
              )
            ) : (
              <span className="tya-pill tya-pill--quiet">Fora do ar</span>
            )}
          </div>

          <div className="tya-foto__acts">
            <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => setEditing(true)} disabled={pending}>
              Editar
            </button>
            <button
              type="button"
              className={`tya-btn tya-btn--sm ${photo.featured ? "tya-btn--ghost" : "tya-btn--soft"}`}
              disabled={pending}
              onClick={() =>
                run(() =>
                  adminUpdatePhotoAction({
                    id: photo.id,
                    lash_style: photo.lash_style,
                    caption: photo.caption ?? "",
                    alt: photo.alt,
                    featured: !photo.featured,
                    sort_order: photo.sort_order,
                  })
                )
              }
            >
              {photo.featured ? "Tirar destaque" : "Destacar"}
            </button>
            <button
              type="button"
              className="tya-btn tya-btn--sm tya-btn--ghost"
              disabled={pending}
              onClick={() => run(() => adminArchivePhotoAction({ id: photo.id, archived: live }))}
            >
              {live ? "Arquivar" : "Restaurar"}
            </button>
            <button
              type="button"
              className="tya-btn tya-btn--sm tya-btn--danger"
              disabled={pending}
              onClick={() => {
                if (window.confirm("Apagar esta foto de vez? Ela some do site, do cartão e do bucket.")) {
                  run(() => adminDeletePhotoAction({ id: photo.id }));
                }
              }}
            >
              Apagar
            </button>
          </div>
        </>
      )}

      {err ? (
        <p className="tya-err" role="alert">
          {err}
        </p>
      ) : null}
    </article>
  );
}
