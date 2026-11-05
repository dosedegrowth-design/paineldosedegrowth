"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ehAreaPrivada } from "@/components/tayssa/ui/area";

/**
 * As peças que se mexem sozinhas — nunca a seção inteira: marcar uma seção
 * recalculava o estilo de todos os elementos dela de uma vez (um quadro de
 * 200 ms no celular a cada troca). Peça pequena, recálculo pequeno.
 */
const ALVOS = ".ty-vivo, .ty-faixa, .ty-rolo, .tyf-arranjo, .tyh__palco, .tyh__texto, .tyh__descer, .typf__palco, .tynu__palco";

/**
 * Animação contínua só onde o olho está. A home tem perto de 150
 * animações infinitas (luzes, chão, flores, rolos); com todas rodando ao
 * mesmo tempo, o celular perde quadro ao rolar. Aqui, cada peça que sai
 * da tela (com folga de um quarto de tela) ganha `data-fora` e o CSS
 * desliga tudo dentro dele — nada some, nada muda de lugar: ao voltar, cada
 * animação recomeça antes de entrar no campo de visão.
 */
export function PausaForaDaTela() {
  // VIP e painel não têm trilho nem rolo: o vigia (um intervalo de 300 ms e
  // um observador do documento inteiro) só gastava bateria lá
  const privada = ehAreaPrivada(usePathname());
  // trilhos que correm de lado (rolos, faixa): só o item dentro da janela
  // anima, com folga para ganhar o movimento antes de aparecer.
  //
  // Vídeo: um só toca de cada vez, o mais perto do centro da tela (como no
  // feed do Instagram) — dois decodificando juntos já derrubam o celular.
  // Quem toca ganha `data-tocar`; o <video> do cartão obedece (ver Rolo).
  //
  // Medida barata: a posição de cada item dentro do trilho é guardada uma
  // vez (só muda se a tela ou os itens mudarem); a cada rodada mede-se só a
  // caixa e o trilho — dois getBoundingClientRect, não um por cartão.
  useEffect(() => {
    if (privada) return;
    type Mapa = { n: number; largura: number; itens: HTMLElement[]; esq: number[]; larg: number[]; topo: number[]; alt: number[] };
    let mapas = new WeakMap<HTMLElement, Mapa>();
    const mapear = (trilho: HTMLElement): Mapa => {
      const itens = Array.from(trilho.querySelectorAll<HTMLElement>("[data-janela-item]"));
      const atual = mapas.get(trilho);
      // a fila mudou (outra aba do catálogo) ou a tela mudou: mede de novo
      if (atual && atual.n === itens.length && atual.itens[0] === itens[0] && atual.largura === window.innerWidth) return atual;
      const t = trilho.getBoundingClientRect();
      const m: Mapa = { n: itens.length, largura: window.innerWidth, itens, esq: [], larg: [], topo: [], alt: [] };
      for (const it of itens) {
        const r = it.getBoundingClientRect();
        m.esq.push(r.left - t.left);
        m.larg.push(r.width);
        m.topo.push(r.top - t.top);
        m.alt.push(r.height);
      }
      mapas.set(trilho, m);
      return m;
    };
    const aoRedimensionar = () => {
      mapas = new WeakMap();
    };
    window.addEventListener("resize", aoRedimensionar);

    const id = window.setInterval(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let melhor: HTMLElement | null = null;
      let menor = Infinity;
      document.querySelectorAll<HTMLElement>("[data-janela]").forEach((trilho) => {
        if (trilho.closest("[data-fora]")) return;
        const caixa = (trilho.parentElement ?? trilho).getBoundingClientRect();
        if (caixa.bottom < -vh * 0.25 || caixa.top > vh * 1.25) return;
        const m = mapear(trilho);
        const t = trilho.getBoundingClientRect();
        const folga = 160 + caixa.width * 0.25;
        const naTela = caixa.bottom > 0 && caixa.top < vh;
        m.itens.forEach((item, i) => {
          const esq = t.left + m.esq[i];
          const dir = esq + m.larg[i];
          const dentro = dir > caixa.left - folga && esq < caixa.right + folga;
          if (dentro !== item.hasAttribute("data-vivo")) item.toggleAttribute("data-vivo", dentro);
          // candidato a tocar: vídeo inteiro à vista, dentro da caixa do rolo
          if (!naTela || !item.hasAttribute("data-video")) return;
          if (esq < Math.max(0, caixa.left) || dir > Math.min(vw, caixa.right)) return;
          const d = Math.hypot(esq + m.larg[i] / 2 - vw / 2, t.top + m.topo[i] + m.alt[i] / 2 - vh / 2);
          if (d < menor) {
            menor = d;
            melhor = item;
          }
        });
      });
      document.querySelectorAll<HTMLElement>("[data-tocar]").forEach((el) => {
        if (el !== melhor) el.removeAttribute("data-tocar");
      });
      (melhor as HTMLElement | null)?.setAttribute("data-tocar", "");
    }, 300);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", aoRedimensionar);
    };
  }, [privada]);

  useEffect(() => {
    if (privada) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) e.target.toggleAttribute("data-fora", !e.isIntersecting);
      },
      { rootMargin: "25% 0px 25% 0px" },
    );
    // observar o mesmo elemento duas vezes não faz nada: dá para varrer de novo
    const varrer = () => document.querySelectorAll(ALVOS).forEach((el) => io.observe(el));
    varrer();
    // seção que monta depois (troca de aba no catálogo, rota nova)
    let pendente = 0;
    const mo = new MutationObserver(() => {
      if (pendente) return;
      pendente = requestAnimationFrame(() => {
        pendente = 0;
        varrer();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(pendente);
      mo.disconnect();
      io.disconnect();
    };
  }, [privada]);

  return null;
}
