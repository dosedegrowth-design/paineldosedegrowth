"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ROUTES, type Settings } from "@/lib/tayssa/config";
import type { BenefitRow, BenefitType } from "@/lib/tayssa/types";
import { criterioLegivel, numero } from "@/lib/tayssa/format";
import { mesesDoMarco } from "@/lib/tayssa/rules";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { Magnetic } from "@/components/tayssa/ui/magnetic";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";
import { Jornada } from "@/components/tayssa/ui/jornada";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * As quatro formas de ganhar, na voz da casa: o texto diz como funciona, e
 * a ficha em mono diz o que se ganha, nas palavras que a própria Tayssa
 * escreveu no painel (catálogo de benefícios e cartão). Os números da
 * ficha de pontos (marcos e meses seguidos) saem do mesmo catálogo que o
 * motor usa; sem benefício ativo do tipo, entra `fichaPadrao`, que não
 * afirma quantidade nenhuma.
 */
type Forma = {
  n: string;
  icone: IconeNome;
  nome: string;
  texto: string;
  ficha: (benefits: BenefitRow[], settings: Settings) => string | null;
  fichaPadrao: string;
};

/** O primeiro benefício ativo do tipo, na ordem que ela definiu. */
function doCatalogo(benefits: BenefitRow[], tipo: BenefitType, filtro: (b: BenefitRow) => boolean = () => true) {
  return [...benefits].sort((a, b) => a.sort_order - b.sort_order).filter((b) => b.type === tipo && b.active && filtro(b));
}

const marcoDePontos = (b: BenefitRow) => (b.threshold_unit ?? "points") === "points" && (b.threshold ?? 0) > 0;

const FORMAS: Forma[] = [
  {
    n: "01",
    icone: "cartao",
    nome: "Cartão de visitas",
    texto: "Cada visita confirmada pela Tayssa é um carimbo no seu cartão. Quando ele enche, vem o presente, e um cartão novo começa.",
    ficha: (_b, settings) => settings.loyalty.card_reward_description?.trim() || null,
    fichaPadrao: "a cada cartão completo",
  },
  {
    n: "02",
    icone: "brilho",
    nome: "Pontos",
    texto:
      "Cada atendimento confirmado soma pontos, e toda aplicação de cílios vale o mesmo, em qualquer técnica. O que conta é você voltar: os pontos abrem os marcos e o caminho até o VIP.",
    ficha: (benefits) => {
      const marcos = doCatalogo(benefits, "loyalty", marcoDePontos).sort((a, b) => (a.threshold ?? 0) - (b.threshold ?? 0));
      return marcos.length
        ? marcos.map((m) => `${m.name}: ${criterioLegivel(m.threshold ?? 0, mesesDoMarco(m))}`).join(" · ")
        : null;
    },
    fichaPadrao: "cada atendimento confirmado",
  },
  {
    n: "03",
    icone: "presente",
    nome: "Aniversário",
    texto:
      "Exclusivo para quem já é VIP. Uma vez por ano o estúdio para por você: o presente é combinado com você e encaixado na agenda, nunca um cupom que cai sozinho.",
    ficha: (benefits) => doCatalogo(benefits, "birthday")[0]?.description?.trim() || null,
    fichaPadrao: "uma vez por ano, no seu aniversário",
  },
  {
    n: "04",
    icone: "coracao",
    nome: "Indicação",
    texto:
      "Você passa o nome de quem ainda não conhece o estúdio. A Tayssa atende essa pessoa e confirma a indicação. O benefício não cai sozinho na sua conta: quem libera é ela.",
    ficha: (benefits) => {
      const r = doCatalogo(benefits, "referral")[0];
      const d = r?.description?.trim().replace(/\.$/, "");
      if (!r || !d) return null;
      const quando = (r.threshold ?? 1) <= 1 ? "A cada indicação confirmada" : `A cada ${r.threshold} indicações confirmadas`;
      return `${quando}: ${d.charAt(0).toLowerCase()}${d.slice(1)}.`;
    },
    fichaPadrao: "depois da confirmação dela",
  },
];

/**
 * A luz abaixa e vem o convite: o VIP é a seção vinho com ouro, entre o
 * rosé do Instagram e o champanhe da indicação. (A página inteira já
 * escureceu por scroll aqui; reescrever os tokens da raiz a cada quadro
 * recalculava o estilo do site todo e travava o celular — e cada tópico
 * passou a ter o próprio fundo.)
 *
 * A composição é um convite, não uma lista de programa: ficha de topo com
 * o rótulo dourado, o fio dourado que se risca da esquerda (único fio de
 * ouro do site público), a declaração grande com a palavra em itálico
 * serifado e, abaixo, as quatro formas de ganhar como índice numerado em
 * mono, separadas por régua fina, e o caminho até o VIP em três paradas. Fecha com o caminho real: pedir acesso
 * (cadastro) e a entrada discreta de quem já é de casa.
 *
 * Nenhuma foto participa — e nenhuma faria falta: aqui a matéria é
 * tipografia, régua e ar.
 */
export function VipIntro({ benefits, settings }: { benefits: BenefitRow[]; settings: Settings }) {
  const reduced = useReducedMotion();
  const marcos = doCatalogo(benefits, "loyalty", marcoDePontos).sort((a, b) => (a.threshold ?? 0) - (b.threshold ?? 0));

  return (
    <section id="vip" className="ty-section tyvi ty-night" aria-label="Tayssa VIP">
      <div className="ty-container">
        {/* ficha de topo: o rótulo dourado de um lado, a regra da casa do outro */}
        <Reveal className="tyvi__topo" y={14}>
          <span className="ty-mono tyvi__selo">Tayssa VIP</span>
          <span className="ty-mono">entra por aprovação dela</span>
        </Reveal>
        {/* o fio de ouro: a linha que se cruza para entrar */}
        <motion.div
          className="tyvi__fio"
          aria-hidden
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 1.3, delay: 0.12, ease: EASE }}
        />

        {/* a declaração, com a coluna de voz descendo em diagonal ao lado */}
        <div className="ty-split ty-split--wide-left ty-split--offset tyvi__cabeca">
          <MaskedLines
            as="h2"
            className="ty-display tyvi__declaracao"
            lines={["Um convite", "para dentro", <em key="estudio">do estúdio.</em>]}
          />
          <div className="tyvi__lado">
            <Reveal delay={0.12}>
              <p className="ty-lead ty-measure">
                É a forma da Tayssa cuidar de quem já faz parte da rotina do estúdio: ela
                sabe seu nome, seu olhar e o seu tempo, e decide, uma a uma, cada coisa que
                te oferece.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <span className="ty-oval">fica entre nós</span>
            </Reveal>
          </div>
        </div>

        {/* o índice do convite: as quatro formas de ganhar, numeradas em mono */}
        <Reveal className="tyvi__chapeu" y={14}>
          <span className="ty-mono ty-mono--ink">Como você ganha</span>
          <span className="ty-index">
            <b>04</b> formas
          </span>
        </Reveal>
        <ul className="tyvi__lista">
          {FORMAS.map((f, i) => (
            <Reveal key={f.n} as="li" delay={i * 0.07} amount={0.3}>
              <div className="tyvi__linha ty-ico-gatilho">
                <span className="tyvi__icone">
                  <Icone nome={f.icone} />
                </span>
                <span className="ty-num tyvi__n">{f.n}</span>
                <h3 className="tyvi__nome">{f.nome}</h3>
                <p className="tyvi__texto">{f.texto}</p>
                <span className="tyvi__ficha">{f.ficha(benefits, settings) ?? f.fichaPadrao}</span>
              </div>
            </Reveal>
          ))}
        </ul>

        {/* o caminho até o VIP: o VIP é de quem volta, não de quem gasta de uma vez */}
        <Reveal className="tyvi__chapeu tyvi__chapeu--caminho" y={14}>
          <span className="ty-mono ty-mono--ink">O caminho até o VIP</span>
          <span className="ty-index">
            <b>03</b> etapas
          </span>
        </Reveal>
        <Jornada
          className="tyvi__jornada"
          paradas={[
            {
              n: "01",
              nome: "Você entra",
              texto: "Pede acesso pelo cadastro e a Tayssa aprova. Desde a primeira visita, cada atendimento soma carimbos e pontos.",
              icone: "mensagem",
            },
            {
              n: "02",
              nome: "Você volta",
              texto: marcos.length
                ? `${marcos.map((m) => `${m.name} com ${criterioLegivel(m.threshold ?? 0, mesesDoMarco(m))}`).join("; ")}.`
                : "A cada volta, os pontos crescem e os marcos chegam.",
              icone: "calendario",
            },
            {
              n: "03",
              nome: "Você é VIP",
              texto: `Ao chegar a ${numero(settings.rules.vip_pontos)} pontos, com ${settings.rules.vip_meses} meses seguidos de atendimento, a Tayssa confirma o seu VIP. O aniversário entra junto.`,
              icone: "check",
            },
          ]}
        />

        {/* o caminho real: cadastro de um lado, entrada de quem já é de casa do outro */}
        <div className="ty-split ty-split--wide-right tyvi__porta">
          <Reveal>
            <h3 className="ty-h tyvi__porta-h">Como se entra</h3>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="ty-body ty-measure">
              O cadastro é um pedido de acesso, não uma porta aberta: a Tayssa lê, confere e
              responde. E nenhum benefício cai sozinho na sua conta: cada um passa pela
              confirmação dela.
            </p>
            <div className="tyvi__acoes">
              <Magnetic>
                <TransitionLink href={ROUTES.signup} className="ty-btn ty-btn--solid">
                  <span>Pedir acesso</span>
                  <span className="ty-btn__arrow" aria-hidden />
                </TransitionLink>
              </Magnetic>
              <TransitionLink href={ROUTES.login} className="tyvi__entrar">
                Já tenho acesso · Entrar
              </TransitionLink>
            </div>
            <p className="ty-mono tyvi__nota">a resposta vem dela, pelo WhatsApp</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
