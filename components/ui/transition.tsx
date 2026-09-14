"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Transição de rota: uma cortina de tinta sobe, a rota troca por baixo,
 * a cortina desce revelando a página nova. Um só gesto para o site todo.
 */

type Phase = "idle" | "cover" | "reveal";
type Ctx = { navigate: (href: string) => void };
const TransitionCtx = createContext<Ctx>({ navigate: () => undefined });

const COVER_MS = 560;
const REVEAL_MS = 720;
const SAFETY_MS = 7000;

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const target = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      const path = href.split("?")[0];
      if (reduced || path === pathname) {
        router.push(href);
        return;
      }
      target.current = href;
      setPhase("cover");
    },
    [pathname, reduced, router]
  );

  // cortina cobriu -> troca a rota
  useEffect(() => {
    if (phase !== "cover" || !target.current) return;
    const href = target.current;
    const t = setTimeout(() => router.push(href), COVER_MS);
    const safety = setTimeout(() => setPhase("reveal"), SAFETY_MS);
    return () => {
      clearTimeout(t);
      clearTimeout(safety);
    };
  }, [phase, router]);

  // rota trocou -> revela
  useEffect(() => {
    if (phase !== "cover") return;
    const wanted = target.current?.split("?")[0];
    if (wanted && pathname === wanted) {
      window.scrollTo(0, 0);
      setPhase("reveal");
    }
  }, [pathname, phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => {
      setPhase("idle");
      target.current = null;
    }, REVEAL_MS);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <TransitionCtx.Provider value={{ navigate }}>
      {children}
      <motion.div
        className="ty-curtain"
        aria-hidden
        initial={false}
        animate={phase}
        variants={{
          idle: { clipPath: "inset(100% 0 0 0)", transition: { duration: 0 } },
          cover: {
            clipPath: "inset(0 0 0 0)",
            transition: { duration: COVER_MS / 1000, ease: [0.65, 0, 0.35, 1] },
          },
          reveal: {
            clipPath: "inset(0 0 100% 0)",
            transition: { duration: REVEAL_MS / 1000, ease: [0.16, 1, 0.3, 1] },
          },
        }}
      />
    </TransitionCtx.Provider>
  );
}

export function useTransitionNav() {
  return useContext(TransitionCtx);
}

type TLinkProps = ComponentProps<typeof Link> & { href: string };

/** Link que usa a cortina. Mantém prefetch e abre normal com modificadores. */
export function TransitionLink({ href, onClick, ...rest }: TLinkProps) {
  const { navigate } = useTransitionNav();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (rest.target === "_blank") return;
    e.preventDefault();
    navigate(href);
  };
  return <Link href={href} onClick={handle} {...rest} />;
}
