"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminArchivePhotoAction,
  adminDeletePhotoAction,
  adminSalvarLinkInstagramAction,
  adminSalvarPrecoProdutoAction,
  adminUpdatePhotoAction,
} from "@/lib/tayssa/actions/photos";
import type { PhotoRow } from "@/lib/tayssa/types";
import { dateShort } from "@/lib/tayssa/format";
import { CATEGORIAS, chave, chavePreco } from "@/lib/tayssa/catalogo";
import { Icone } from "@/components/tayssa/admin/icons";
import { estiloQuadro } from "@/components/tayssa/admin/enquadrar";
import { Publicar, type ProdutosPorCategoria } from "@/components/tayssa/admin/publicar";

const mb = (b: number | null) => (b ? `${(b / 1024 / 1024).toFixed(1)} MB` : null);
/** de quantos em quantos a galeria mostra: mil fotos não abrem de uma vez */
const PAGINA = 48;

/** Link de download do arquivo original, com o nome que ele tinha. */
function linkOriginal(p: PhotoRow) {
  const nome = p.original_name || p.storage_path.split("/").pop() || "arquivo";
  return `${p.public_url}?download=${encodeURIComponent(nome)}`;
}

/**
 * A mídia em dois lugares: a GALERIA (tudo guardado, no original, fora do
 * site) e NO SITE (o que está publicado, organizado pelo rolo de cada
 * produto). Publicar, ajustar, tirar do site, baixar o original e apagar
 * acontecem aqui, e o site muda na hora.
 */
export function PhotoLibrary({
  photos,
  produtos,
  places,
  aba,
  precos = {},
}: {
  photos: PhotoRow[];
  produtos: ProdutosPorCategoria;
  places?: Record<string, string[]>;
  aba: "galeria" | "site";
  /** valor de cada produto, pela chave de `chavePreco()` */
  precos?: Record<string, number>;
}) {
  const [editando, setEditando] = useState<PhotoRow | null>(null);
  const galeria = photos.filter((p) => p.status !== "active");
  const noAr = photos.filter((p) => p.status === "active");

  return (
    <>
      {aba === "galeria" ? (
        <Galeria itens={galeria} onPublicar={setEditando} />
      ) : (
        <NoSite itens={noAr} places={places} onAjustar={setEditando} precos={precos} />
      )}
      {editando ? <Publicar key={editando.id} item={editando} produtos={produtos} onFechar={() => setEditando(null)} /> : null}
    </>
  );
}

function Galeria({ itens, onPublicar }: { itens: PhotoRow[]; onPublicar: (p: PhotoRow) => void }) {
  const [ver, setVer] = useState(PAGINA);
  const [filtro, setFiltro] = useState<"tudo" | "image" | "video">("tudo");
  const lista = itens.filter((p) => filtro === "tudo" || p.media_type === filtro);
  if (!itens.length) {
    return (
      <div className="tya-nada">
        <Icone nome="fotos" />
        <b>A galeria está vazia.</b>
        <span>Suba fotos e vídeos no original, quantos quiser. Eles ficam guardados aqui até você publicar.</span>
      </div>
    );
  }
  const filtros: [typeof filtro, string][] = [
    ["tudo", `Tudo (${itens.length})`],
    ["image", `Fotos (${itens.filter((p) => p.media_type !== "video").length})`],
    ["video", `Vídeos (${itens.filter((p) => p.media_type === "video").length})`],
  ];
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="tya-sugs" role="radiogroup" aria-label="Filtrar galeria">
        {filtros.map(([v, t]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={filtro === v}
            className="tya-chip"
            data-on={filtro === v ? "true" : "false"}
            onClick={() => setFiltro(v)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="tya-galeria tya-galeria--densa">
        {lista.slice(0, ver).map((p) => (
          <Cartao key={p.id} photo={p} onPrincipal={() => onPublicar(p)} principal="Publicar" />
        ))}
      </div>
      {lista.length > ver ? (
        <button type="button" className="tya-btn tya-btn--ghost" onClick={() => setVer((v) => v + PAGINA)}>
          Mostrar mais {Math.min(PAGINA, lista.length - ver)} de {lista.length - ver}
        </button>
      ) : null}
    </div>
  );
}

function NoSite({
  itens,
  places,
  onAjustar,
  precos,
}: {
  itens: PhotoRow[];
  places?: Record<string, string[]>;
  onAjustar: (p: PhotoRow) => void;
  precos: Record<string, number>;
}) {
  // um bloco por rolo: categoria › produto, do jeito que o site agrupa
  const rolos = useMemo(() => {
    const out: { slug: string; cat: string; produto: string; itens: PhotoRow[] }[] = [];
    for (const c of CATEGORIAS) {
      const daCat = itens.filter((p) => (p.category ?? "cilios") === c.slug);
      const grupos = new Map<string, PhotoRow[]>();
      for (const p of daCat) {
        const k = chave(p.lash_style);
        grupos.set(k, [...(grupos.get(k) ?? []), p]);
      }
      for (const g of grupos.values()) {
        g.sort((a, b) => Number(b.featured) - Number(a.featured));
        out.push({ slug: c.slug, cat: c.label, produto: g[0].lash_style, itens: g });
      }
    }
    return out;
  }, [itens]);

  if (!itens.length) {
    return (
      <div className="tya-nada">
        <Icone nome="fotos" />
        <b>Nada publicado ainda.</b>
        <span>Na galeria, escolha uma foto ou vídeo e toque em Publicar. Ele entra no rolo do produto no site.</span>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 26 }}>
      {rolos.map((r) => (
        <section key={`${r.cat}-${r.produto}`} className="tya-rolo-admin">
          <header>
            <h3>
              <span>{r.cat} ›</span> {r.produto}
            </h3>
            <span className="tya-rolo-admin__lado">
              <PrecoProduto categoria={r.slug} nome={r.produto} preco={precos[chavePreco(r.slug, r.produto)]} />
              <span className="tya-pill tya-pill--brand">
                {r.itens.length} {r.itens.length === 1 ? "item" : "itens"} no rolo
              </span>
            </span>
          </header>
          <div className="tya-galeria tya-galeria--densa">
            {r.itens.map((p) => (
              <Cartao key={p.id} photo={p} places={places?.[p.id]} onPrincipal={() => onAjustar(p)} principal="Ajustar" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Cartao({
  photo,
  places = [],
  onPrincipal,
  principal,
}: {
  photo: PhotoRow;
  places?: string[];
  onPrincipal: () => void;
  principal: string;
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [quebrada, setQuebrada] = useState(false);
  const live = photo.status === "active";
  const video = photo.media_type === "video";
  const quadro = { x: Number(photo.focus_x ?? 50), y: Number(photo.focus_y ?? 50), zoom: Number(photo.zoom ?? 1) };

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setErr(null);
      const r = await fn();
      if (!r.ok) setErr(r.error ?? "Não deu certo.");
      else router.refresh();
    });

  return (
    <article className={`tya-foto${live ? "" : " tya-foto--galeria"}`} data-ocupado={pending ? "true" : "false"}>
      <button
        type="button"
        className="tya-foto__img"
        onClick={onPrincipal}
        aria-label={`${principal}: ${photo.original_name ?? photo.lash_style}`}
      >
        {quebrada ? (
          <span className="tya-foto__tonal">Arquivo fora do ar</span>
        ) : video ? (
          <video
            src={photo.public_url}
            muted
            loop
            playsInline
            preload="metadata"
            style={live ? estiloQuadro(quadro) : undefined}
            onError={() => setQuebrada(true)}
          />
        ) : (
          <Image
            src={photo.public_url}
            alt={photo.alt}
            fill
            sizes="(max-width: 860px) 45vw, 220px"
            style={live ? estiloQuadro(quadro) : { objectFit: "cover" }}
            onError={() => setQuebrada(true)}
          />
        )}
        {video ? <span className="tya-pill tya-pill--dark tya-foto__tipo">Vídeo</span> : null}
        {photo.featured && live ? <span className="tya-pill tya-pill--gold tya-foto__selo">Destaque</span> : null}
      </button>

      <div style={{ display: "grid", gap: 3, minWidth: 0 }}>
        <strong className="tya-foto__t" title={photo.original_name ?? undefined}>
          {live ? photo.lash_style : photo.original_name ?? "Sem nome"}
        </strong>
        <span className="tya-small" style={{ fontSize: 12 }}>
          {[photo.width && photo.height ? `${photo.width}×${photo.height}` : null, mb(photo.bytes), dateShort(photo.created_at)]
            .filter(Boolean)
            .join(", ")}
        </span>
        {!live && photo.lash_style ? (
          <span className="tya-small" style={{ fontSize: 12 }}>
            Já foi publicado como {photo.lash_style}
          </span>
        ) : null}
      </div>

      {live && places.length ? (
        <div className="tya-foto__onde">
          {places
            .filter((p) => !p.startsWith("Rolo:"))
            .map((p) => (
              <span key={p} className={`tya-pill ${p === "Frente do cartão" ? "tya-pill--gold" : "tya-pill--brand"}`}>
                {p}
              </span>
            ))}
        </div>
      ) : null}

      {live ? <LinkInstagram id={photo.id} url={photo.instagram_url ?? ""} /> : null}

      <div className="tya-foto__acts">
        <button type="button" className="tya-btn tya-btn--sm tya-btn--primary" onClick={onPrincipal} disabled={pending}>
          {principal}
        </button>
        {live ? (
          <>
            <button
              type="button"
              className={`tya-btn tya-btn--sm ${photo.featured ? "tya-btn--ghost" : "tya-btn--soft"}`}
              disabled={pending}
              onClick={() =>
                run(() =>
                  adminUpdatePhotoAction({
                    id: photo.id,
                    lash_style: photo.lash_style,
                    category: photo.category,
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
              onClick={() => run(() => adminArchivePhotoAction({ id: photo.id, archived: true }))}
            >
              Tirar do site
            </button>
          </>
        ) : null}
        <a className="tya-btn tya-btn--sm tya-btn--ghost" href={linkOriginal(photo)} download={photo.original_name ?? undefined}>
          Baixar original
        </a>
        <button
          type="button"
          className="tya-btn tya-btn--sm tya-btn--danger"
          disabled={pending}
          onClick={() => {
            if (window.confirm(`Apagar ${video ? "este vídeo" : "esta foto"} de vez? Some da galeria, do site e da nuvem.`)) {
              run(() => adminDeletePhotoAction({ id: photo.id }));
            }
          }}
        >
          Apagar
        </button>
      </div>

      {err ? (
        <p className="tya-err" role="alert">
          {err}
        </p>
      ) : null}
    </article>
  );
}

/**
 * O post desta mídia no Instagram: no portfólio do site, "Ver no
 * Instagram" abre ele. Vazio = o botão leva ao perfil.
 */
function LinkInstagram({ id, url }: { id: string; url: string }) {
  const [valor, setValor] = useState(url);
  const [salvo, setSalvo] = useState(url);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const mudou = valor.trim() !== salvo;
  return (
    <form
      className="tya-preco tya-foto__ig"
      onSubmit={(e) => {
        e.preventDefault();
        if (!mudou || pending) return;
        start(async () => {
          setErro(null);
          const r = await adminSalvarLinkInstagramAction({ id, url: valor });
          if (!r.ok) return setErro(r.error);
          setSalvo(valor.trim());
        });
      }}
    >
      <label>
        <span>Post</span>
        <input
          type="url"
          inputMode="url"
          value={valor}
          placeholder="cole o link do post"
          aria-label="Link do post no Instagram"
          maxLength={300}
          onChange={(e) => setValor(e.target.value)}
        />
      </label>
      {mudou ? (
        <button type="submit" className="tya-btn tya-btn--sm tya-btn--primary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </button>
      ) : null}
      {erro ? (
        <span className="tya-err" role="alert">
          {erro}
        </span>
      ) : null}
    </form>
  );
}

/**
 * O valor do produto, no cabeçalho do rolo: escreve e salva. Vazio = o
 * site não mostra valor para esse produto.
 */
function PrecoProduto({ categoria, nome, preco }: { categoria: string; nome: string; preco?: number }) {
  const inicial = preco != null ? String(preco).replace(".", ",") : "";
  const [valor, setValor] = useState(inicial);
  const [salvo, setSalvo] = useState(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const mudou = valor.trim() !== salvo;
  const salvar = () =>
    start(async () => {
      setErro(null);
      const r = await adminSalvarPrecoProdutoAction({ categoria, nome, preco: valor });
      if (!r.ok) return setErro(r.error);
      setSalvo(valor.trim());
    });
  return (
    <form
      className="tya-preco"
      onSubmit={(e) => {
        e.preventDefault();
        if (mudou && !pending) salvar();
      }}
    >
      <label>
        <span>R$</span>
        <input
          inputMode="decimal"
          value={valor}
          placeholder="valor"
          aria-label={`Valor de ${nome}`}
          maxLength={12}
          onChange={(e) => setValor(e.target.value)}
        />
      </label>
      {mudou ? (
        <button type="submit" className="tya-btn tya-btn--sm tya-btn--primary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </button>
      ) : null}
      {erro ? (
        <span className="tya-err" role="alert">
          {erro}
        </span>
      ) : null}
    </form>
  );
}
