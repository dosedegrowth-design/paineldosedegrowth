"use client";

/* Capítulo 05 — Na prática. Desktop: galeria HORIZONTAL pinada
   (o scroll vertical vira travelling lateral). Mobile: grid vertical. */

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PhotoPanel } from "./photo-panel";
import { RevealSection } from "./tilt-card";
import { Chapter } from "./chapter";
import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

const photos = [
  {
    src: "/andre/tecnico-manutencao.jpg",
    alt: "Técnico verificando pressão do sistema com manifold",
    caption: "Diagnóstico em campo",
  },
  {
    src: "/andre/tecnico-gas.jpg",
    alt: "Recarga de gás com manômetro de precisão",
    caption: "Recarga com manômetro",
  },
  {
    src: "/andre/ambiente-quarto.jpg",
    alt: "Quarto climatizado com split instalado e acabamento limpo",
    caption: "Resultado entregue",
  },
];

function Header() {
  return (
    <RevealSection className="max-w-2xl">
      <Chapter n="05" label="Na prática" />
      <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
        O padrão que{" "}
        <span className="andre-gradient-text">você pode exigir</span>.
      </h2>
    </RevealSection>
  );
}

export function FieldGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0.12, 0.95], ["4%", "-58%"]);

  return (
    <>
      {/* Desktop: travelling horizontal */}
      <section ref={ref} className="relative hidden lg:block h-[280vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <div className="max-w-6xl w-full mx-auto px-8 mb-10">
            <Header />
          </div>
          <motion.div style={{ x }} className="flex gap-8 pl-[10vw] w-max">
            {photos.map((p, i) => (
              <div key={p.src} className="w-[36vw] shrink-0">
                <PhotoPanel {...p} ratio="4/3" delay={i * 0.05} />
              </div>
            ))}
            {/* último quadro: convite */}
            <div className="w-[30vw] shrink-0 flex items-center">
              <div className="andre-card p-10 w-full">
                <p className="text-2xl font-black text-white leading-snug">
                  O próximo ambiente
                  <br />
                  <span className="andre-gradient-text">pode ser o seu.</span>
                </p>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="andre-btn-primary mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-2xl text-[15px]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Pedir orçamento
                </a>
              </div>
            </div>
          </motion.div>
          <p className="max-w-6xl w-full mx-auto px-8 mt-8 text-xs text-slate-500 tracking-[0.24em] uppercase font-bold">
            Role para percorrer →
          </p>
        </div>
      </section>

      {/* Mobile/tablet: vertical */}
      <section className="relative lg:hidden py-24">
        <div className="max-w-6xl mx-auto px-5">
          <Header />
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {photos.map((p, i) => (
              <PhotoPanel
                key={p.src}
                {...p}
                ratio="4/3"
                delay={i * 0.1}
                className={i === 2 ? "sm:col-span-2" : ""}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
