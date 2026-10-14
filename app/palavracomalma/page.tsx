/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import {
  Ban,
  BarChart3,
  Check,
  CircleAlert,
  CreditCard,
  Film,
  Hand,
  Instagram,
  Link2,
  Lightbulb,
  MonitorPlay,
  Package,
  PenLine,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Archive,
  Eye,
  FlaskConical,
  Rocket,
  Hammer,
  Newspaper,
  MessageCircle,
} from "lucide-react";
import { Revelar, Navegacao, type ItemNav } from "@/components/palavracomalma/revelar";
import { Comparar } from "@/components/palavracomalma/comparar";
import { Cores } from "@/components/palavracomalma/cores";
import { Letras } from "@/components/palavracomalma/letras";
import { Formatos } from "@/components/palavracomalma/formatos";
import { Motions } from "@/components/palavracomalma/motions";
import { Passagens } from "@/components/palavracomalma/passagens";
import { Catalogo } from "@/components/palavracomalma/catalogo";
import { Personalizacao, ProdutoVariacoes } from "@/components/palavracomalma/produto";
import { CheckoutCores } from "@/components/palavracomalma/checkout-cores";
import { Aprovacao } from "@/components/palavracomalma/aprovacao";
import { porId } from "./produtos";

const NAV: ItemNav[] = [
  { id: "como", rotulo: "Como funciona" },
  { id: "zero", rotulo: "Do zero" },
  { id: "cores", rotulo: "Cores" },
  { id: "letras", rotulo: "Letras" },
  { id: "formatos", rotulo: "Formatos" },
  { id: "motion", rotulo: "Motion" },
  { id: "passagens", rotulo: "Passagens" },
  { id: "video", rotulo: "Vídeo" },
  { id: "catalogo", rotulo: "Catálogo" },
  { id: "produto", rotulo: "Produto" },
  { id: "blog", rotulo: "Blog" },
  { id: "checkout", rotulo: "Checkout" },
  { id: "limites", rotulo: "Pode e não pode" },
  { id: "igual", rotulo: "O que não muda" },
  { id: "aprovacao", rotulo: "Aprovação" },
];

function LogoDDG() {
  return (
    <span className="pa-ddg">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dose de Growth">
        <path d="M24 2L43.6 13V35L24 46L4.4 35V13L24 2Z" fill="#F15839" />
        <path d="M18 14L18 32L24 36L24 14L18 14Z" fill="white" fillOpacity="0.95" />
        <path d="M24 14L30 18L30 28L24 32L24 14Z" fill="#171717" fillOpacity="0.85" />
      </svg>
      <span>Dose de Growth</span>
    </span>
  );
}

function Cabeca({ id, n, kicker, titulo, children }: { id: string; n: string; kicker: string; titulo: ReactNode; children?: ReactNode }) {
  return (
    <div className="pa-rv">
      <p className="pa-kicker">
        <span className="pa-n">{n}</span> {kicker}
      </p>
      <h2 className="pa-h2" id={`${id}-t`}>
        {titulo}
      </h2>
      {children && <p className="pa-sub">{children}</p>}
    </div>
  );
}

function Leigo({ children, icone = "luz" }: { children: ReactNode; icone?: "luz" | "alerta" }) {
  return (
    <div className="pa-leigo pa-rv">
      {icone === "luz" ? <Lightbulb size={20} /> : <CircleAlert size={20} />}
      <p>{children}</p>
    </div>
  );
}

/** Estrelas e brasas em posições fixas (mesmas no servidor e no navegador). */
const { ESTRELAS, BRASAS } = (() => {
  let s = 7;
  const r = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const estrelas = Array.from({ length: 70 }, () => ({
    top: r() * 78,
    left: r() * 100,
    tam: 1 + r() * 1.8,
    t: 2.5 + r() * 4,
    dl: r() * 5,
  }));
  const brasas = Array.from({ length: 14 }, () => ({ left: 10 + r() * 80, t: 8 + r() * 7, dl: r() * 10, dx: (r() - 0.5) * 120 }));
  return { ESTRELAS: estrelas, BRASAS: brasas };
})();

function Ceu() {
  return (
    <div className="pa-ceu" aria-hidden>
      {ESTRELAS.map((e, k) => (
        <span
          key={k}
          className="pa-estrela"
          style={{
            top: `${e.top}%`,
            left: `${e.left}%`,
            width: e.tam,
            height: e.tam,
            ["--t" as string]: `${e.t}s`,
            ["--dl" as string]: `${e.dl}s`,
          }}
        />
      ))}
      <div className="pa-lua" />
      <div className="pa-brasas">
        {BRASAS.map((b, k) => (
          <span
            key={k}
            className="pa-brasa"
            style={{ left: `${b.left}%`, ["--t" as string]: `${b.t}s`, ["--dl" as string]: `${b.dl}s`, ["--dx" as string]: `${b.dx}px` }}
          />
        ))}
      </div>
    </div>
  );
}

const DIVISORES = [
  { nome: "Onda", texto: "Curva suave, como tecido.", d: "M0 0 H400 V14 C330 40 260 0 200 18 C140 36 70 2 0 22 Z" },
  { nome: "Arco", texto: "Como o topo de um portal.", d: "M0 0 H400 V2 C300 46 100 46 0 2 Z" },
  { nome: "Rasgo de papel", texto: "Combina com o artesanal.", d: "M0 0 H400 V18 L380 26 L362 15 L340 28 L318 17 L300 30 L276 19 L256 27 L232 14 L210 29 L188 18 L166 27 L144 15 L122 28 L100 18 L80 26 L58 16 L36 28 L18 19 L0 25 Z" },
];

function Divisores() {
  return (
    <div className="pa-div-grid pa-rv">
      {DIVISORES.map((d) => (
        <div className="pa-div" key={d.nome}>
          <div className="pa-div-a" />
          <div style={{ background: "var(--perg)" }}>
            <svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden>
              <path d={d.d} fill="#2A0E17" />
            </svg>
          </div>
          <div className="pa-div-b" />
          <p>
            <b>{d.nome}</b>
            {d.texto}
          </p>
        </div>
      ))}
      <div className="pa-div">
        <div className="pa-div-a" />
        <div style={{ background: "#2A0E17", display: "flex", justifyContent: "space-around", alignItems: "center", height: 36 }} aria-hidden>
          {["100%", "70%", "40%", "0%", "40%", "70%", "100%"].map((v, k) => (
            <span
              key={k}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: `radial-gradient(circle at ${k < 3 ? "30%" : "70%"} 50%, #ECD9A4 ${v === "0%" ? "0%" : "55%"}, ${
                  v === "0%" ? "rgba(236,217,164,.25)" : "rgba(236,217,164,.12)"
                } 56%)`,
                border: "1px solid rgba(236,217,164,.4)",
              }}
            />
          ))}
        </div>
        <div className="pa-div-b" />
        <p>
          <b>Fases da lua</b>
          Uma faixa de luas separando as partes.
        </p>
      </div>
    </div>
  );
}

const POSTS = [
  { img: 211, tag: "Orixás", t: "Iemanjá: símbolos, cores e o que inspirou a capa", d: "A história por trás de cada caderno da Coleção Orixás." },
  { img: 283, tag: "Baralho Cigano", t: "Baralho cigano: por onde começar", d: "Um guia para quem está tirando as primeiras cartas." },
  { img: 267, tag: "Rotina", t: "Como usar um caderno de estudos espirituais", d: "Ideias de organização para anotações e oráculos." },
];

export default function PalavraComAlmaPage() {
  return (
    <main>
      <Revelar />

      {/* ============ HERO ============ */}
      <header className="pa-hero" id="inicio">
        <Ceu />
        <div className="pa-wrap pa-top">
          <div className="pa-marcas">
            <LogoDDG />
            <span className="pa-x">×</span>
            <span style={{ fontFamily: "var(--f-cap)", fontSize: 12, letterSpacing: ".18em" }}>PALAVRA COM ALMA</span>
          </div>
          <span className="pa-selo">Guia · não é proposta</span>
        </div>
        <div className="pa-wrap pa-hero-in">
          <img className="pa-hero-logo" src="/palavracomalma/logo-claro.png" alt="Loja Palavra com Alma" />
          <h1>
            Um site feito do zero. <em className="pa-ouro">Dentro da Tray.</em>
          </h1>
          <p className="pa-hero-sub">
            Este é um guia visual do que dá para criar no site novo da Palavra com Alma: cores, letras, formatos, movimento e vídeo.
            E também do pouco que não dá. Tudo o que você vê aqui funciona de verdade, com os seus produtos: toque, arraste e teste.
          </p>
          <p className="pa-aviso">
            <Hand size={16} /> Não é uma proposta. É uma explicação, com exemplos ao vivo.
          </p>
        </div>
        <a className="pa-desce" href="#como">
          ROLE
          <i />
        </a>
      </header>

      <Navegacao itens={NAV} />

      {/* ============ 01 COMO FUNCIONA ============ */}
      <section className="pa-sec" id="como">
        <div className="pa-wrap">
          <Cabeca id="como" n="01" kicker="O principal" titulo={<>A vitrine é nossa. Os bastidores <em>continuam da Tray.</em></>}>
            Pense numa loja física: a gente redesenha a fachada, a vitrine, as prateleiras e toda a decoração. O caixa, a maquininha e
            a nota fiscal continuam os mesmos de hoje.
          </Cabeca>

          <div className="pa-grid2">
            <div className="pa-card pa-lado is-nosso pa-rv">
              <span className="pa-tag is-nosso">
                <Sparkles size={12} /> Feito do zero por nós
              </span>
              <h3>Tudo o que a cliente vê</h3>
              <p>Enquanto ela passeia, procura e escolhe.</p>
              <ul>
                {[
                  "Página inicial",
                  "Menu e categorias",
                  "Busca",
                  "Página de cada produto, com as variações",
                  "Sacola que abre de lado (carrinho lateral)",
                  "Visual do blog e das páginas de texto",
                  "Cabeçalho, rodapé, cores, letras, animações e vídeos",
                ].map((t) => (
                  <li key={t}>
                    <Check size={16} /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pa-card pa-lado is-tray pa-rv" data-d="1">
              <span className="pa-tag is-tray">
                <Store size={12} /> Continua da Tray
              </span>
              <h3>Tudo o que acontece depois</h3>
              <p>Do pagamento até a etiqueta. Nada disso muda.</p>
              <ul>
                {[
                  "Checkout, a tela de pagamento (aqui só mudam as cores)",
                  "Pagamento pela Vindi: cartão, boleto e Pix",
                  "Nota fiscal pelo emissor da Tray",
                  "Frete e etiquetas: Tray Envios e Melhor Envio",
                  "Integração com o Mercado Livre",
                  "Cadastro de produtos, estoque e pedidos no painel",
                ].map((t) => (
                  <li key={t}>
                    <Check size={16} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pa-card pa-fluxo pa-rv">
            <p className="pa-fluxo-t">O caminho de uma compra no site novo:</p>
            <ol>
              <li className="is-nosso">
                <i>1</i>
                <b>Visita</b>
                <span>Chega na página inicial</span>
              </li>
              <li className="is-nosso">
                <i>2</i>
                <b>Escolhe</b>
                <span>Catálogo e página do produto</span>
              </li>
              <li className="is-nosso">
                <i>3</i>
                <b>Sacola</b>
                <span>Junta os produtos</span>
              </li>
              <li>
                <i>4</i>
                <b>Paga</b>
                <span>Checkout da Tray + Vindi</span>
              </li>
              <li>
                <i>5</i>
                <b>Nota</b>
                <span>Emissor de NF-e da Tray</span>
              </li>
              <li>
                <i>6</i>
                <b>Envio</b>
                <span>Tray Envios</span>
              </li>
            </ol>
            <div className="pa-legenda">
              <span className="is-nosso">Desenhado por nós</span>
              <span>Da Tray, como hoje</span>
            </div>
          </div>

          <Leigo>
            <b>Em outras palavras:</b> muda tudo o que a cliente vê enquanto passeia pela loja. Não muda nada do que você faz depois
            que o pedido chega.
          </Leigo>
        </div>
      </section>

      {/* ============ 02 DO ZERO ============ */}
      <section className="pa-sec" id="zero">
        <div className="pa-wrap">
          <Cabeca id="zero" n="02" kicker="Modelo pronto × feito do zero" titulo={<>Não é escolher um modelo e <em>trocar a cor.</em></>}>
            Um modelo pronto é como alugar uma casa mobiliada: dá para trocar as almofadas e os quadros, mas a planta é a mesma de
            milhares de outras lojas. Aqui, a gente desenha a planta.
          </Cabeca>

          <div className="pa-cmp">
            <div className="pa-rv">
              <Comparar />
            </div>
            <div className="pa-rv" data-d="1">
              <ul className="pa-lista-dif">
                <li className="pa-cab">
                  <span>Modelo pronto</span>
                  <span>Feito do zero</span>
                </li>
                <li>
                  <span>Layout igual ao de outras lojas</span>
                  <span>Desenhado para os seus produtos</span>
                </li>
                <li>
                  <span>Cores que o modelo permite</span>
                  <span>Qualquer cor, com degradê e textura</span>
                </li>
                <li>
                  <span>Pouco ou nenhum movimento</span>
                  <span>Animações e passagens do jeito que a gente imaginar</span>
                </li>
                <li>
                  <span>Página de produto padrão</span>
                  <span>Pensada para personalização e variações</span>
                </li>
                <li>
                  <span>Quem decide é quem fez o modelo</span>
                  <span>Quem decide é você</span>
                </li>
              </ul>
              <Leigo>
                <b>Como isso é possível na Tray:</b> ela oferece um tema em branco, só com o básico funcionando (frete, compra,
                medição). Todo o resto, cada tela e cada detalhe, é escrito por nós em código, como num site feito fora dela.
              </Leigo>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 03 CORES ============ */}
      <section className="pa-sec" id="cores">
        <div className="pa-wrap">
          <Cabeca id="cores" n="03" kicker="Cores" titulo={<>Qualquer cor. <em>Em qualquer lugar.</em></>}>
            Fundo, botões, preço, selo de promoção, bordas e até a cor que aparece quando a pessoa passa o dedo. Abaixo está a mesma
            tela em quatro caminhos diferentes. Toque e veja mudar.
          </Cabeca>
          <div className="pa-rv">
            <Cores />
          </div>
          <Leigo>
            Essas paletas são só exemplos. A definitiva sai da sua marca (vinho, vermelho, preto e dourado) na etapa de design, e você
            aprova antes de qualquer coisa ir ao ar.
          </Leigo>
        </div>
      </section>

      {/* ============ 04 LETRAS ============ */}
      <section className="pa-sec" id="letras">
        <div className="pa-wrap">
          <Cabeca id="letras" n="04" kicker="Letras" titulo={<>A letra também <em>conta a história.</em></>}>
            Cada tipo de letra passa uma sensação. Toque nos estilos e veja o mesmo produto mudar de personalidade.
          </Cabeca>
          <div className="pa-rv">
            <Letras />
          </div>
        </div>
      </section>

      {/* ============ 05 FORMATOS ============ */}
      <section className="pa-sec" id="formatos">
        <div className="pa-wrap">
          <Cabeca id="formatos" n="05" kicker="Formatos" titulo={<>Do formato da foto ao jeito de <em>arrumar a prateleira.</em></>}>
            Nada precisa ser quadrado. A foto pode ter forma de arco, de carta ou de lua. E cada parte do site pode organizar os
            produtos de um jeito diferente.
          </Cabeca>
          <div className="pa-rv">
            <Formatos />
          </div>
        </div>
      </section>

      {/* ============ 06 MOTION ============ */}
      <section className="pa-sec" id="motion">
        <div className="pa-wrap">
          <Cabeca id="motion" n="06" kicker="Motion · movimento" titulo={<>Movimento <em>com intenção.</em></>}>
            “Motion” é tudo que se mexe no site: o que aparece, vira, brilha ou desliza. Abaixo há 10 exemplos funcionando. Toque,
            passe o mouse e arraste.
          </Cabeca>
          <Motions />
          <Leigo>
            <b>Equilíbrio:</b> movimento demais pesa e cansa. A gente usa onde ajuda a vender ou a criar clima, e deixa o resto calmo e
            rápido. Quem configura o celular para reduzir animações recebe o site mais quieto, automaticamente.
          </Leigo>
        </div>
      </section>

      {/* ============ 07 PASSAGENS ============ */}
      <section className="pa-sec" id="passagens">
        <div className="pa-wrap">
          <Cabeca id="passagens" n="07" kicker="Passagens" titulo={<>O jeito de ir de uma tela <em>para a outra.</em></>}>
            Passagem (ou transição) é o que acontece entre sair de uma página e chegar na outra. Pode ser um corte seco, como na
            maioria dos sites, ou um momento da marca.
          </Cabeca>
          <div className="pa-rv">
            <Passagens />
          </div>
          <p className="pa-sub pa-rv" style={{ marginTop: 48 }}>
            <b>E entre as partes da mesma página</b> também dá para fugir da linha reta. Alguns jeitos de separar uma seção da outra:
          </p>
          <Divisores />
          <Leigo>
            As passagens valem para todas as páginas da vitrine. Na ida para o checkout da Tray a troca de tela é a normal, porque
            aquela tela é dela.
          </Leigo>
        </div>
      </section>

      {/* ============ 08 VÍDEO ============ */}
      <section className="pa-sec" id="video">
        <div className="pa-wrap">
          <Cabeca id="video" n="08" kicker="Vídeo" titulo={<>Vídeo onde <em>fizer sentido.</em></>}>
            Pode ter vídeo de fundo no topo da página, vídeo na página do produto, bastidores da produção. O exemplo abaixo foi montado
            só com fotos da própria loja, tocando sozinho e sem som, como um fundo.
          </Cabeca>
          <div className="pa-video pa-rv">
            <video src="/palavracomalma/video-loja.mp4" poster="/palavracomalma/video-capa.jpg" autoPlay muted loop playsInline preload="metadata" />
            <span className="pa-video-rot">
              <i /> vídeo de fundo
            </span>
            <div className="pa-video-txt">
              <small>FEITO À MÃO · COM INTENÇÃO</small>
              <h3>Objetos que guardam o seu sagrado</h3>
              <span>Ver coleção</span>
            </div>
          </div>
          <div className="pa-usos">
            {[
              { i: <MonitorPlay size={22} />, t: "Topo da home", d: "Um vídeo curto em loop, atrás do título, no lugar do banner parado." },
              { i: <Hammer size={22} />, t: "Bastidores", d: "As mãos fazendo um caderno ou montando um baralho. Mostra que é produção própria." },
              { i: <Film size={22} />, t: "Produto em uso", d: "Folheando o caderno, embaralhando as cartas. Na galeria, junto das fotos." },
              { i: <Instagram size={22} />, t: "Reels", d: "Os vídeos que já estão no Instagram, aproveitados dentro do site." },
            ].map((u) => (
              <div className="pa-uso pa-rv" key={u.t}>
                {u.i}
                <b>{u.t}</b>
                {u.d}
              </div>
            ))}
          </div>
          <Leigo icone="alerta">
            <b>Um detalhe técnico:</b> a Tray não guarda arquivos de vídeo dentro do tema. O vídeo fica hospedado fora (YouTube,
            Vimeo ou um servidor nosso) e aparece no site normalmente, sem a cara de YouTube se a gente preferir. Para quem visita,
            não muda nada.
          </Leigo>
        </div>
      </section>

      {/* ============ 09 CATÁLOGO ============ */}
      <section className="pa-sec" id="catalogo">
        <div className="pa-wrap">
          <Cabeca id="catalogo" n="09" kicker="Catálogo" titulo={<>Com cara de catálogo, <em>como você pediu.</em></>}>
            Busca no topo, categorias em botões que deslizam, produtos em duas colunas e o “+” que põe na sacola sem sair da página.
            Os produtos e preços abaixo são os da sua loja hoje. Teste à vontade.
          </Cabeca>
          <div className="pa-demo">
            <div className="pa-rv">
              <Catalogo />
            </div>
            <div className="pa-demo-lado pa-rv" data-d="1">
              <ol className="pa-pontos">
                <li>
                  <span>1</span>
                  <p>
                    <b>Busca que filtra enquanto digita.</b> Escreva “caderno” ou “cabaça” no celular ao lado.
                  </p>
                </li>
                <li>
                  <span>2</span>
                  <p>
                    <b>Categorias em botões.</b> Cadernos, Baralhos, Magias, Facas e Variedades 3D, um toque e a lista troca.
                  </p>
                </li>
                <li>
                  <span>3</span>
                  <p>
                    <b>O “+” coloca na sacola</b> sem sair da página. O número na sacolinha sobe na hora.
                  </p>
                </li>
                <li>
                  <span>4</span>
                  <p>
                    <b>Sacola lateral.</b> Abre de lado, muda a quantidade, mostra o subtotal. “Finalizar” leva para o checkout da
                    Tray.
                  </p>
                </li>
                <li>
                  <span>5</span>
                  <p>
                    <b>Esgotado não some.</b> Ganha selo e um botão “Avise-me”, e vai para o fim da lista.
                  </p>
                </li>
                <li>
                  <span>6</span>
                  <p>
                    <b>Selo de desconto</b> calculado sozinho a partir do preço promocional cadastrado.
                  </p>
                </li>
              </ol>
            </div>
          </div>
          <Leigo>
            Hoje a loja tem 20 produtos indisponíveis. No site novo eles podem aparecer com selo e “Avise-me”, ir para o fim da lista
            ou sumir. Você escolhe.
          </Leigo>
        </div>
      </section>

      {/* ============ 10 PRODUTO ============ */}
      <section className="pa-sec" id="produto">
        <div className="pa-wrap">
          <Cabeca id="produto" n="10" kicker="Página do produto" titulo={<>Variações que dá gosto <em>de escolher.</em></>}>
            34 produtos da loja têm variação. Em vez de uma lista de texto, a escolha pode ser visual: bolinha de cor, botão, foto que
            muda junto. Abaixo, a Cabaça Simples com as 5 variações que estão cadastradas hoje.
          </Cabeca>
          <div className="pa-rv">
            <ProdutoVariacoes />
          </div>
          <p className="pa-sub pa-rv" style={{ marginTop: 56 }}>
            <b>E a personalização explicada na própria página.</b> Quando a cliente escolhe a opção personalizada, a página mostra o
            passo a passo. Toque em “Modelo Padrão” e “Personalizado”:
          </p>
          <div className="pa-rv">
            <Personalizacao />
          </div>
          <Leigo>
            As etapas acima são um exemplo. As reais (prazo, como enviar a arte, quantas alterações) vêm de você, e a gente transforma
            em texto e desenho.
          </Leigo>
        </div>
      </section>

      {/* ============ 11 BLOG ============ */}
      <section className="pa-sec" id="blog">
        <div className="pa-wrap">
          <Cabeca id="blog" n="11" kicker="Blog" titulo={<>O blog em destaque, <em>com a cara da loja.</em></>}>
            O blog da Tray continua sendo o lugar onde você escreve. A gente desenha como ele aparece: uma seção na página inicial com
            os posts mais recentes e a página do blog com o visual da marca.
          </Cabeca>
          <div className="pa-blog pa-rv">
            <div className="pa-blog-cab">
              <div>
                <small>DO NOSSO GRIMÓRIO</small>
                <h3>Leituras com alma</h3>
              </div>
              <span>Ver todos os posts</span>
            </div>
            <div className="pa-blog-grid">
              {POSTS.map((p) => (
                <article className="pa-post" key={p.t}>
                  <div className="pa-fig">
                    <img src={porImg(p.img)} alt="" loading="lazy" />
                  </div>
                  <div>
                    <small>{p.tag}</small>
                    <b>{p.t}</b>
                    <p>{p.d}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="pa-post-ex">Títulos de exemplo, só para mostrar o visual.</p>
          </div>
          <div className="pa-como">
            <div className="pa-rv">
              <PenLine size={22} />
              <b>Você escreve no painel</b>
              No mesmo painel da Tray de hoje, na parte de notícias. Título, texto e foto.
            </div>
            <div className="pa-rv" data-d="1">
              <Newspaper size={22} />
              <b>Aparece sozinho no site</b>
              A seção da home e a página do blog se atualizam. Ninguém precisa mexer em código.
            </div>
            <div className="pa-rv" data-d="2">
              <Link2 size={22} />
              <b>O post leva para o produto</b>
              No meio do texto, um link para o caderno ou o baralho de que o post fala.
            </div>
          </div>
          <Leigo icone="alerta">
            <b>Ponto de atenção:</b> a página de cada post é montada pela Tray. Ali a gente muda o visual (cores, letras,
            espaçamentos), mas não a estrutura. Se um dia o blog virar o centro do site, dá para levar o blog para um sistema próprio
            sem mexer na loja.
          </Leigo>
        </div>
      </section>

      {/* ============ 12 CHECKOUT ============ */}
      <section className="pa-sec" id="checkout">
        <div className="pa-wrap">
          <Cabeca id="checkout" n="12" kicker="Checkout" titulo={<>A única tela em que <em>só mudam as cores.</em></>}>
            O checkout é onde a cliente paga. Ele é da Tray em qualquer loja da Tray, seja com modelo pronto ou com tema próprio.
          </Cabeca>
          <div className="pa-rv">
            <CheckoutCores />
          </div>
        </div>
      </section>

      {/* ============ 13 LIMITES ============ */}
      <section className="pa-sec" id="limites">
        <div className="pa-wrap">
          <Cabeca id="limites" n="13" kicker="Resumo" titulo={<>O que dá, o que dá com limite <em>e o que não dá.</em></>} />
          <div className="pa-pode">
            <div className="pa-card pa-pode-col is-sim pa-rv">
              <h3>
                <i>
                  <Check size={18} />
                </i>
                Dá, à vontade
              </h3>
              <ul>
                <li>
                  <b>Home, categorias, busca e produto</b>Desenho 100% nosso.
                </li>
                <li>
                  <b>Cores, letras e formatos</b>Qualquer combinação.
                </li>
                <li>
                  <b>Motion e passagens</b>Animações, efeitos e transições.
                </li>
                <li>
                  <b>Vídeos</b>Hospedados fora da Tray, aparecem normalmente.
                </li>
                <li>
                  <b>Sacola lateral</b>A sacola que abre de lado, com o nosso visual.
                </li>
                <li>
                  <b>Cabeçalho, menu e rodapé</b>Do jeito que a marca pedir.
                </li>
              </ul>
            </div>
            <div className="pa-card pa-pode-col is-lim pa-rv" data-d="1">
              <h3>
                <i>
                  <CircleAlert size={18} />
                </i>
                Dá, com limite
              </h3>
              <ul>
                <li>
                  <b>Checkout e área do cliente</b>Só as cores.
                </li>
                <li>
                  <b>Páginas de texto</b>Como comprar, Trocas, Envio: o texto é editado no painel e o visual a gente ajusta.
                </li>
                <li>
                  <b>Página de cada post do blog</b>Visual sim, estrutura não.
                </li>
                <li>
                  <b>Login e cadastro</b>Ajustes de visual.
                </li>
                <li>
                  <b>Velocidade</b>Cada efeito pesa um pouco. A gente equilibra beleza e rapidez.
                </li>
              </ul>
            </div>
            <div className="pa-card pa-pode-col is-nao pa-rv" data-d="2">
              <h3>
                <i>
                  <Ban size={18} />
                </i>
                Não dá
              </h3>
              <ul>
                <li>
                  <b>Mudar o desenho do checkout</b>É da Tray, em qualquer loja da Tray.
                </li>
                <li>
                  <b>Guardar vídeo dentro do tema</b>Por isso ele fica num serviço de vídeo.
                </li>
                <li>
                  <b>Criar sistemas novos dentro da Tray</b>Uma área de membros, por exemplo. Se um dia precisar, roda à parte e
                  conversa com a loja.
                </li>
                <li>
                  <b>Tirar os códigos da Tray do site</b>São invisíveis e fazem frete, compra e medição funcionarem.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 14 O QUE NÃO MUDA ============ */}
      <section className="pa-sec" id="igual">
        <div className="pa-wrap">
          <Cabeca id="igual" n="14" kicker="O que não muda" titulo={<>Para você, o dia a dia <em>continua igual.</em></>} />
          <div className="pa-igual">
            {[
              { i: <CreditCard size={22} />, t: "Pagamentos pela Vindi", d: "Cartão, boleto e Pix, como hoje." },
              { i: <ReceiptText size={22} />, t: "Nota fiscal da Tray", d: "O mesmo emissor, cada nota ligada ao pedido." },
              { i: <Truck size={22} />, t: "Frete e etiquetas", d: "Tray Envios com Melhor Envio." },
              { i: <ShoppingBag size={22} />, t: "Mercado Livre", d: "A integração segue ativa." },
              { i: <Package size={22} />, t: "Cadastro de produtos", d: "No mesmo painel. O site novo mostra sozinho." },
              { i: <Link2 size={22} />, t: "Endereços das páginas", d: "Os links de hoje continuam valendo, sem perder posição no Google." },
              { i: <BarChart3 size={22} />, t: "Google Analytics e Pixel", d: "A medição de visitas e anúncios continua." },
              { i: <MessageCircle size={22} />, t: "WhatsApp e Instagram", d: "Os botões continuam, com visual novo." },
            ].map((x) => (
              <div className="pa-rv" key={x.t}>
                {x.i}
                <p>
                  <b>{x.t}</b>
                  <span>{x.d}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 15 APROVAÇÃO ============ */}
      <section className="pa-sec" id="aprovacao">
        <div className="pa-wrap">
          <Cabeca id="aprovacao" n="15" kicker="Segurança" titulo={<>Nada muda na loja <em>sem o seu OK.</em></>}>
            O site novo é construído do lado, sem tirar o atual do ar. A loja continua vendendo normalmente o tempo todo.
          </Cabeca>
          <div className="pa-apv">
            <ol className="pa-etapas pa-rv">
              {[
                { i: <Archive size={18} />, t: "Cópia de segurança", d: "O site de hoje é baixado e guardado antes de qualquer coisa." },
                { i: <Hammer size={18} />, t: "Tema novo em paralelo", d: "Construído fora do ar. As clientes continuam vendo o site atual." },
                { i: <Eye size={18} />, t: "Você testa pelo link de prévia", d: "No celular e no computador, com os seus produtos de verdade." },
                { i: <FlaskConical size={18} />, t: "Compra de teste", d: "Do produto até a nota e a etiqueta, para garantir que tudo conversa." },
                { i: <Rocket size={18} />, t: "Publica com o seu OK", d: "E, se precisar, o tema antigo volta ao ar." },
              ].map((e) => (
                <li key={e.t}>
                  <span>{e.i}</span>
                  <div>
                    <b>{e.t}</b>
                    <p>{e.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="pa-rv" data-d="1">
              <p className="pa-sel-t">Simule a troca</p>
              <Aprovacao />
              <Leigo>
                Os dois temas ficam guardados na Tray. Publicar é escolher qual deles está no ar, e dá para voltar.
              </Leigo>
            </div>
          </div>
        </div>
      </section>

      <footer className="pa-fim">
        <div className="pa-wrap">
          <h2>
            Ficou alguma <em className="pa-ouro">dúvida?</em>
          </h2>
          <p>Fala com a gente pelo WhatsApp de sempre. Esta página é só para explicar. O próximo passo é conversar sobre o que você imagina.</p>
          <div className="pa-marcas">
            <LogoDDG />
            <span className="pa-x">×</span>
            <img className="pa-logo-mini" src="/palavracomalma/logo-claro.png" alt="Palavra com Alma" />
          </div>
        </div>
      </footer>
    </main>
  );
}

function porImg(id: number) {
  return id === 211 || id === 283 ? `/palavracomalma/p/${id}.jpg` : porId(id).img;
}
