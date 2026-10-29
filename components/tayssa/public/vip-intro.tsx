"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ROUTES } from "@/lib/tayssa/config";
import type { BenefitRow, BenefitType } from "@/lib/tayssa/types";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { Magnetic } from "@/components/tayssa/ui/magnetic";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";
import { Jornada } from "@/components/tayssa/ui/jornada";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Os três privilégios do clube, na voz da casa. Cada um diz, no próprio
 * texto, que quem confirma é a Tayssa — nada é liberado sozinho.
 *
 * Nenhuma linha publica meta. O site não diz "a partir de N": o número é
 * configurável em Configurações, o motor trata cada unidade de um jeito
 * (o cartão tem ciclo próprio e seu tamanho vem de `settings.loyalty
 * .card_size`, não do threshold; unidade nula conta como ponto) e ponto é
 * moeda do clube, não matéria do site — a mesma regra que
 * `components/tayssa/public/services.tsx` já segue. Toda tentativa de
 * derivar esse número aqui produziu afirmação errada. O que a ficha em
 * mono mostra é a `description` que a própria Tayssa escreveu no
 * catálogo; sem benefício ativo do tipo, entra `fichaPadrao`, que não
 * afirma quantidade nenhuma.
 */
const PRIVILEGIOS: {
  n: string;
  icone: IconeNome;
  tipo: BenefitType;
  nome: string;
  texto: string;
  fichaPadrao: string;
}[] = [
  {
    n: "01",
    icone: "coracao",
    tipo: "referral",
    nome: "Indicação",
    texto:
      "Você passa o nome de quem ainda não conhece o estúdio. A Tayssa atende essa pessoa e confirma a indicação. O benefício não cai sozinho na sua conta: quem libera é ela.",
    fichaPadrao: "depois da confirmação dela",
  },
  {
    n: "02",
    icone: "cartao",
    tipo: "loyalty",
    nome: "Fidelidade",
    texto:
      "Cada atendimento confirmado soma na sua jornada no estúdio. Chegar ao fim de uma etapa não abre nada sozinho: ela escolhe o que vem, confirma, e o cuidado entra no próximo encontro.",
    fichaPadrao: "cada atendimento confirmado",
  },
  {
    n: "03",
    icone: "presente",
    tipo: "birthday",
    nome: "Aniversário",
    texto:
      "Uma vez por ano o estúdio para por você. O presente é combinado com você e encaixado na agenda: não é desconto automático nem cupom que cai sozinho.",
    fichaPadrao: "uma vez por ano, no seu aniversário",
  },
];

/**
 * O que o benefício é, dito pela própria Tayssa no catálogo. Pega o
 * primeiro ativo do tipo na ordem que ela definiu e devolve a descrição
 * dela — texto que ela controla, nunca número derivado por nós.
 */
function descricaoDoCatalogo(benefits: BenefitRow[], tipo: BenefitType): string | null {
  const alvo = [...benefits].sort((a, b) => a.sort_order - b.sort_order).find((b) => b.type === tipo);
  const d = alvo?.description?.trim();
  return d ? d : null;
}

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
 * serifado e, abaixo, os três privilégios como índice numerado em mono,
 * separados por régua fina. Fecha com o caminho real: pedir acesso
 * (cadastro) e a entrada discreta de quem já é de casa.
 *
 * Nenhuma foto participa — e nenhuma faria falta: aqui a matéria é
 * tipografia, régua e ar.
 */
export function VipIntro({ benefits }: { benefits: BenefitRow[] }) {
  const reduced = useReducedMotion();

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

        {/* o índice do convite: três privilégios, numerados em mono */}
        <Reveal className="tyvi__chapeu" y={14}>
          <span className="ty-mono ty-mono--ink">O que vem com o acesso</span>
          <span className="ty-index">
            <b>03</b> privilégios
          </span>
        </Reveal>
        <ul className="tyvi__lista">
          {PRIVILEGIOS.map((p, i) => (
            <Reveal key={p.n} as="li" delay={i * 0.07} amount={0.3}>
              <div className="tyvi__linha ty-ico-gatilho">
                <span className="tyvi__icone">
                  <Icone nome={p.icone} />
                </span>
                <span className="ty-num tyvi__n">{p.n}</span>
                <h3 className="tyvi__nome">{p.nome}</h3>
                <p className="tyvi__texto">{p.texto}</p>
                <span className="tyvi__ficha">{descricaoDoCatalogo(benefits, p.tipo) ?? p.fichaPadrao}</span>
              </div>
            </Reveal>
          ))}
        </ul>

        {/* a regra em três paradas, ligadas pela linha que se desenha */}
        <Jornada
          className="tyvi__jornada"
          paradas={[
            { n: "01", nome: "Você pede", texto: "Você preenche o cadastro. É um pedido de acesso, não uma porta aberta.", icone: "mensagem" },
            { n: "02", nome: "Ela confere", texto: "A Tayssa lê e confere cada pedido, um por um.", icone: "olho" },
            { n: "03", nome: "Ela libera", texto: "Com o sim dela, o seu acesso abre. E cada benefício também passa por ela.", icone: "check" },
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
                Já sou VIP · Entrar
              </TransitionLink>
            </div>
            <p className="ty-mono tyvi__nota">a resposta vem dela, pelo WhatsApp</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
