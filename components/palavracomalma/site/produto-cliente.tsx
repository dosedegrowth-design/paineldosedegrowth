"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState } from "react";
import { Barcode, Check, ChevronDown, ChevronLeft, ChevronRight, CreditCard, MapPin, Minus, Plus, QrCode, ShoppingBag } from "lucide-react";
import { brl, parcelamento, waLink, type Produto, type Variacao } from "@/app/palavracomalma/site/catalogo";
import { useSacola } from "./sacola";
import { WhatsAppIcon } from "./whatsapp";

type Props = {
  id: number;
  nome: string;
  nomeCurto: string;
  preco: number;
  promo: number | null;
  disponivel: boolean;
  imgs: string[];
  variacoes: Variacao[];
  prazo: string;
  parcela: Produto["parcela"];
};

export function Galeria({ imgs, nome }: { imgs: string[]; nome: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const toque = useRef<number | null>(null);
  const ir = (d: number) => setI((v) => (v + d + imgs.length) % imgs.length);

  return (
    <div className="lj-gal">
      <div
        className={`lj-gal-foto${zoom ? " is-zoom" : ""}`}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onPointerLeave={() => setZoom(null)}
        onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (toque.current === null) return;
          const d = e.changedTouches[0].clientX - toque.current;
          if (Math.abs(d) > 40) ir(d < 0 ? 1 : -1);
          toque.current = null;
        }}
        style={zoom ? { ["--zx" as string]: `${zoom.x}%`, ["--zy" as string]: `${zoom.y}%` } : undefined}
      >
        <img key={imgs[i]} src={imgs[i]} alt={`${nome}, foto ${i + 1}`} />
        {imgs.length > 1 && (
          <>
            <button className="lj-gal-seta is-esq" onClick={() => ir(-1)} aria-label="Foto anterior">
              <ChevronLeft size={20} />
            </button>
            <button className="lj-gal-seta is-dir" onClick={() => ir(1)} aria-label="Próxima foto">
              <ChevronRight size={20} />
            </button>
            <span className="lj-gal-pontos">
              {imgs.map((_, k) => (
                <i key={k} className={k === i ? "is-on" : undefined} />
              ))}
            </span>
          </>
        )}
      </div>
      {imgs.length > 1 && (
        <div className="lj-gal-mini" role="group" aria-label="Fotos">
          {imgs.map((src, k) => (
            <button key={src} aria-pressed={k === i} onClick={() => setI(k)} aria-label={`Ver foto ${k + 1}`}>
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompraProduto(p: Props) {
  const { adicionar, abrir } = useSacola();
  const tipos = useMemo(() => {
    const t: string[] = [];
    p.variacoes.forEach((v) => v.opcoes.forEach((o) => !t.includes(o.tipo) && t.push(o.tipo)));
    return t;
  }, [p.variacoes]);
  const valores = (tipo: string) => {
    const vs: string[] = [];
    p.variacoes.forEach((v) => v.opcoes.forEach((o) => o.tipo === tipo && !vs.includes(o.valor) && vs.push(o.valor)));
    return vs;
  };

  const primeira = p.variacoes.find((v) => v.disponivel);
  const [sel, setSel] = useState<Record<string, string>>(() =>
    tipos.length === 1 && primeira ? Object.fromEntries(primeira.opcoes.map((o) => [o.tipo, o.valor])) : {}
  );
  const [qtd, setQtd] = useState(1);
  const [ok, setOk] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);

  const escolhida = p.variacoes.find((v) => v.opcoes.every((o) => sel[o.tipo] === o.valor));
  const existe = (tipo: string, valor: string) =>
    p.variacoes.some(
      (v) =>
        v.disponivel &&
        v.opcoes.some((o) => o.tipo === tipo && o.valor === valor) &&
        v.opcoes.every((o) => o.tipo === tipo || !sel[o.tipo] || sel[o.tipo] === o.valor)
    );

  const precos = p.variacoes.map((v) => v.promo ?? v.preco);
  const faixa = precos.length && Math.min(...precos) !== Math.max(...precos);
  const preco = escolhida ? escolhida.preco : p.preco;
  const promo = escolhida ? escolhida.promo : p.promo;
  const final = promo ?? preco;
  const off = promo ? Math.round((1 - promo / preco) * 100) : 0;
  const falta = tipos.filter((t) => !sel[t]);
  const podeComprar = p.disponivel && (p.variacoes.length === 0 || (escolhida?.disponivel ?? false));
  const parc = parcelamento(p, !escolhida && faixa ? Math.min(...precos) : final);

  function comprar() {
    if (!podeComprar) return;
    const detalhe = escolhida ? escolhida.opcoes.map((o) => o.valor).join(" · ") : undefined;
    for (let k = 0; k < qtd; k++)
      adicionar(
        { pid: p.id, vid: escolhida?.id, nome: p.nomeCurto, detalhe, preco: final, img: (p.imgs[0]?.startsWith("/") ? p.imgs[0] : escolhida?.img) || p.imgs[0], fator: parc?.fator },
        k === 0 ? document.querySelector<HTMLElement>(".lj-gal-foto img") : null
      );
    setOk(true);
    setTimeout(() => setOk(false), 2600);
  }

  return (
    <div className="lj-compra">
      <div className="lj-preco">
        {!escolhida && faixa ? (
          <strong>
            <small>a partir de</small> {brl(Math.min(...precos))}
          </strong>
        ) : (
          <>
            {promo && <s>{brl(preco)}</s>}
            <strong>{brl(final)}</strong>
            {off > 0 && <em>-{off}%</em>}
          </>
        )}
      </div>
      {parc && (
        <p className="lj-parc">
          ou <b>{parc.n}x de {brl(parc.valor)}</b> no cartão{parc.juros ? " (com juros)" : " sem juros"}
        </p>
      )}
      <Pagamentos total={!escolhida && faixa ? Math.min(...precos) : final} parc={parc} />

      {tipos.map((tipo) => (
        <fieldset className="lj-op" key={tipo}>
          <legend>
            {tipo === "Marca" ? "Modelo" : tipo}: <b>{sel[tipo] ?? "escolha uma opção"}</b>
          </legend>
          <div className="lj-op-lista">
            {valores(tipo).map((v) => {
              const pode = existe(tipo, v);
              return (
                <button
                  key={v}
                  aria-pressed={sel[tipo] === v}
                  disabled={!pode}
                  onClick={() => setSel((s) => ({ ...s, [tipo]: v }))}
                  title={pode ? undefined : "Indisponível"}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {p.disponivel ? (
        <div className="lj-compra-linha">
          <div className="lj-qtd is-grande">
            <button onClick={() => setQtd((q) => Math.max(1, q - 1))} aria-label="Menos um">
              <Minus size={16} />
            </button>
            <span>{qtd}</span>
            <button onClick={() => setQtd((q) => Math.min(20, q + 1))} aria-label="Mais um">
              <Plus size={16} />
            </button>
          </div>
          <button
            ref={botao}
            className={`lj-btn is-ouro is-cheio lj-comprar${ok ? " is-ok" : ""}`}
            onClick={comprar}
            disabled={!podeComprar}
          >
            {ok ? (
              <>
                <Check size={18} /> Na sacola
              </>
            ) : falta.length ? (
              `Escolha ${falta[0] === "Marca" ? "o modelo" : falta[0].toLowerCase()}`
            ) : (
              <>
                <ShoppingBag size={18} /> Adicionar à sacola
              </>
            )}
          </button>
        </div>
      ) : (
        <a
          className="lj-btn is-claro is-cheio"
          href={waLink(`Oi! Vim pelo site. Quero um aviso quando “${p.nomeCurto}” voltar.`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={18} /> Esgotado · avise-me quando voltar
        </a>
      )}
      {ok && (
        <button className="lj-ver-sacola" onClick={abrir}>
          Ver sacola e finalizar
        </button>
      )}
      <Frete prazo={p.prazo} />
      <a
        className="lj-duvida"
        href={waLink(`Oi! Vim pelo site e tenho uma dúvida sobre “${p.nomeCurto}”.`)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsAppIcon size={16} /> Dúvida sobre este produto? Fala com a gente
      </a>
    </div>
  );
}

/** Formas de pagamento do jeito que a loja recebe hoje (Pix, boleto e cartão pela Vindi). */
function Pagamentos({ total, parc }: { total: number; parc: ReturnType<typeof parcelamento> }) {
  return (
    <details className="lj-formas">
      <summary>
        <span>
          <QrCode size={16} /> <CreditCard size={16} /> <Barcode size={16} />
        </span>
        Formas de pagamento
        <ChevronDown size={16} />
      </summary>
      <ul>
        <li>
          <QrCode size={18} /> <span>Pix</span> <b>{brl(total)}</b>
        </li>
        <li>
          <Barcode size={18} /> <span>Boleto bancário</span> <b>{brl(total)}</b>
        </li>
        <li>
          <CreditCard size={18} /> <span>Cartão de crédito 1x</span> <b>{brl(total)}</b>
        </li>
        {parc && (
          <li>
            <CreditCard size={18} />{" "}
            <span>
              Cartão de crédito {parc.n}x{parc.juros ? " (com juros)" : ""}
            </span>{" "}
            <b>
              {parc.n}x {brl(parc.valor)}
            </b>
          </li>
        )}
      </ul>
      <p>Pagamento processado com segurança pela Vindi, a plataforma de pagamentos da loja.</p>
    </details>
  );
}

/** Consulta do CEP: confirma o destino. Valor e prazo da transportadora saem do checkout da Tray. */
function Frete({ prazo }: { prazo: string }) {
  const [cep, setCep] = useState("");
  const [res, setRes] = useState<{ ok: true; cidade: string; uf: string; bairro: string } | { ok: false } | null>(null);
  const [busy, setBusy] = useState(false);

  async function consultar(e: React.FormEvent) {
    e.preventDefault();
    const n = cep.replace(/\D/g, "");
    if (n.length !== 8) return setRes({ ok: false });
    setBusy(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${n}/json/`);
      const j = await r.json();
      setRes(j.erro ? { ok: false } : { ok: true, cidade: j.localidade, uf: j.uf, bairro: j.bairro });
    } catch {
      setRes({ ok: false });
    }
    setBusy(false);
  }

  return (
    <form className="lj-frete" onSubmit={consultar}>
      <label htmlFor="lj-cep">
        <MapPin size={16} /> Calcular entrega
      </label>
      <div>
        <input
          id="lj-cep"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={cep}
          maxLength={9}
          onChange={(e) => {
            const n = e.target.value.replace(/\D/g, "").slice(0, 8);
            setCep(n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n);
            setRes(null);
          }}
        />
        <button type="submit" disabled={busy}>
          {busy ? "..." : "OK"}
        </button>
      </div>
      {res?.ok === false && <p className="is-erro">CEP não encontrado. Confira os números.</p>}
      {res?.ok && (
        <p>
          Entrega para <b>{[res.bairro, `${res.cidade}/${res.uf}`].filter(Boolean).join(", ")}</b> com rastreio.
          {prazo ? ` ${prazo}.` : ""} As opções de frete e o valor aparecem na finalização.
        </p>
      )}
      <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer">
        Não sei meu CEP
      </a>
    </form>
  );
}
