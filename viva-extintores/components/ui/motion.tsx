"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Camada de movimento.
 *
 * A gramática é a de site de estúdio: linha de título que sobe de dentro
 * de uma máscara, entrada em cascata, foto que desliza mais devagar que a
 * página e número que conta ao aparecer. Easing única — a curva `power3`,
 * que sai rápido e assenta devagar.
 *
 * Duas regras valem para tudo aqui:
 * 1. **Sem JavaScript, tudo aparece.** O HTML sai do servidor visível; só
 *    depois de montar é que o componente esconde o que ainda está abaixo
 *    da dobra. Página de captação com conteúdo preso atrás de JS é lead
 *    perdido e buscador cego.
 * 2. **`prefers-reduced-motion` desliga tudo.** Sem exceção.
 */

const MARGEM = "-12% 0px -8% 0px";

const CONSULTA = "(prefers-reduced-motion: reduce)";

function assinar(aviso: () => void) {
  const m = window.matchMedia(CONSULTA);
  m.addEventListener("change", aviso);
  return () => m.removeEventListener("change", aviso);
}

/**
 * Há movimento? No servidor a resposta é sempre **não** — e é por isso
 * que o HTML sai visível. No cliente, depende de o usuário não ter pedido
 * menos movimento; se ele mudar a preferência, isto reage sozinho.
 */
function useMovimento() {
  return useSyncExternalStore(
    assinar,
    () => !window.matchMedia(CONSULTA).matches,
    () => false,
  );
}

/**
 * Quando revelar.
 *
 * `naEntrada` é para o que está acima da dobra: anima já no carregamento,
 * um quadro depois de montar, que é o tempo de o estado escondido existir
 * e a transição ter de onde sair. O resto espera entrar na tela.
 */
function useNaTela(
  ref: React.RefObject<HTMLElement | null>,
  ativo: boolean,
  naEntrada = false,
) {
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    if (!ativo || !naEntrada) return;
    const id = requestAnimationFrame(() => setVisto(true));
    return () => cancelAnimationFrame(id);
  }, [ativo, naEntrada]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ativo || naEntrada) return;
    const obs = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            setVisto(true);
            obs.disconnect();
          }
        }
      },
      { rootMargin: MARGEM },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, ativo, naEntrada]);

  return visto;
}

/* ------------------------------------------------------------------
   Título: cada linha sobe de dentro da própria máscara, em cascata
   ------------------------------------------------------------------ */

export function Linhas({
  linhas,
  className,
  id,
  as: Tag = "h2",
  ponto = false,
  destaque,
  atraso = 0,
  naEntrada = false,
}: {
  linhas: readonly (string | undefined)[];
  className?: string;
  id?: string;
  as?: "h1" | "h2" | "h3" | "p";
  /** fecha a última linha com o ponto vermelho */
  ponto?: boolean;
  /** última linha em vermelho (em vez do ponto) */
  destaque?: string;
  atraso?: number;
  /** acima da dobra: anima no carregamento, sem esperar o scroll */
  naEntrada?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const ativo = useMovimento();
  const visivel = useNaTela(ref, ativo, naEntrada);

  const itens = [...linhas.filter(Boolean) as string[]];
  if (destaque) itens.push(destaque);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      id={id}
      className={className}
      data-motion={ativo ? "on" : undefined}
      data-shown={visivel ? "true" : undefined}
    >
      {itens.map((linha, i) => {
        const ultima = i === itens.length - 1;
        const vermelha = Boolean(destaque) && ultima;
        return (
          <span className="v-linha" key={i}>
            <span
              className={[
                "v-linha__in",
                ponto && ultima && !destaque ? "v-dot" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                {
                  "--atraso": `${atraso + i * 0.09}s`,
                  ...(vermelha ? { color: "var(--v-red)" } : {}),
                } as CSSProperties
              }
            >
              {vermelha ? linha.replace(/\.$/, "") : linha}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}

/* ------------------------------------------------------------------
   Entrada em cascata para blocos e listas
   ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  id,
  cascata = false,
  naEntrada = false,
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "ul" | "ol";
  className?: string;
  id?: string;
  /** escalona os filhos diretos, um depois do outro */
  cascata?: boolean;
  /** acima da dobra: anima no carregamento, sem esperar o scroll */
  naEntrada?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const ativo = useMovimento();
  const visivel = useNaTela(ref, ativo, naEntrada);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      id={id}
      className={["v-reveal", cascata ? "v-cascata" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      data-motion={ativo ? "on" : undefined}
      data-shown={visivel ? "true" : undefined}
      style={delay ? ({ "--atraso": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------
   Número que conta ao entrar na tela
   ------------------------------------------------------------------ */

export function Contador({ valor, className }: { valor: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const ativo = useMovimento();
  const visivel = useNaTela(ref, ativo);
  const [texto, setTexto] = useState(valor);

  // "+10.000" -> prefixo "+", 10000, sufixo. Memorizado de propósito: sem
  // isto o objeto do match nasce de novo a cada render, o effect reinicia
  // a cada quadro e a contagem nunca sai do lugar.
  const alvo = useMemo(() => {
    const m = valor.match(/^(\D*)([\d.]+)(\D*)$/);
    if (!m) return null;
    return { prefixo: m[1], numero: Number(m[2].replace(/\./g, "")), sufixo: m[3] };
  }, [valor]);

  useEffect(() => {
    if (!ativo || !visivel || !alvo) return;
    const { prefixo, numero, sufixo } = alvo;
    // Começa em 40% do alvo, nunca em zero: um quadro que leia "+0 anos de
    // experiência" é pior do que não animar.
    const inicio = Math.round(numero * 0.4);
    const dur = 1100;
    let t0 = 0;
    let raf = 0;
    const passo = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3); // a mesma sensação da curva power3
      const n = Math.round(inicio + (numero - inicio) * e);
      setTexto(`${prefixo}${n.toLocaleString("pt-BR")}${sufixo}`);
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [ativo, visivel, alvo]);

  // Enquanto a contagem não começa, o que está na tela é o valor real.
  return (
    <span ref={ref} className={className}>
      {texto}
    </span>
  );
}


/* ------------------------------------------------------------------
   Parallax: a foto do hero anda mais devagar que a página
   ------------------------------------------------------------------ */

export function Parallax({
  children,
  intensidade = 0.18,
  className,
}: {
  children: ReactNode;
  intensidade?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ativo = useMovimento();

  useEffect(() => {
    const el = ref.current;
    if (!el || !ativo) return;
    let raf = 0;
    const calcular = () => {
      raf = 0;
      const r = el.parentElement?.getBoundingClientRect();
      if (!r) return;
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      el.style.transform = `translate3d(0, ${Math.round(-r.top * intensidade)}px, 0)`;
    };
    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(calcular);
    };
    calcular();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ativo, intensidade]);

  return (
    <div ref={ref} className={className} style={{ willChange: ativo ? "transform" : undefined }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------
   Rolagem suave
   ------------------------------------------------------------------ */

export function ScrollSuave() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let parar = false;
    let destruir: (() => void) | undefined;
    import("lenis")
      .then(({ default: Lenis }) => {
        if (parar) return;
        const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
        let raf = 0;
        const loop = (t: number) => {
          lenis.raf(t);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        destruir = () => {
          cancelAnimationFrame(raf);
          lenis.destroy();
        };
      })
      .catch(() => {
        /* sem rolagem suave é só o normal do navegador */
      });
    return () => {
      parar = true;
      destruir?.();
    };
  }, []);
  return null;
}
