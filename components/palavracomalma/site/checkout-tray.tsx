"use client";
/* eslint-disable @next/next/no-img-element */

// Réplica do carrinho e do checkout da Tray como estão hoje na loja (capturados em 27/out/2026).
// A Tray não deixa mudar a estrutura dessas telas: só cores, fonte e logo (Aparência do carrinho).
// Por isso aqui o desenho é o dela, e só as cores são as da marca.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, Mail, Phone, Trash2 } from "lucide-react";
import { BASE, EMAIL, brl, type Cartao } from "@/app/palavracomalma/site/catalogo";
import { useSacola } from "./sacola";

const ACEITAMOS = ["Boleto", "Bradesco", "Banco do Brasil", "Pix", "Visa", "Mastercard", "Diners", "Amex", "Elo"];

function Topo() {
  return (
    <header className="lj-ck-topo">
      <div>
        <Link href={BASE} aria-label="Voltar para a loja">
          <img src="/palavracomalma/logo-claro.png" alt="Palavra com Alma" width={900} height={385} />
        </Link>
        <span className="lj-ck-seguro">
          <span>
            Seus dados
            <br />
            100% seguros
          </span>
          <i>
            <Lock size={14} />
          </i>
        </span>
      </div>
    </header>
  );
}

function Rodape() {
  return (
    <footer className="lj-ck-rod">
      <div className="lj-ck-rod-in">
        <div>
          <h3>Atendimento</h3>
          <p className="lj-ck-tel">
            <Phone size={17} /> (11) 94527-8301
          </p>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
        <div>
          <h3>Aceitamos</h3>
          <ul>
            {ACEITAMOS.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Segurança</h3>
          <span className="lj-ck-selo">
            Seus dados 100% seguros <Lock size={13} />
          </span>
        </div>
      </div>
      <p className="lj-ck-tec">
        Tecnologia <b>Traycommerce</b>
      </p>
    </footer>
  );
}

export function CheckoutTray({ sugestoes }: { sugestoes: Cartao[] }) {
  const { itens, total, mudar, adicionar } = useSacola();
  const [etapa, setEtapa] = useState<"carrinho" | "identifique_se">("carrinho");
  const [cep, setCep] = useState("");
  const [destino, setDestino] = useState<string | null>(null);
  const [fim, setFim] = useState(false);

  // a Tray usa a âncora da URL para a etapa (#carrinho, #identifique_se)
  useEffect(() => {
    const ler = () => setEtapa(location.hash === "#identifique_se" ? "identifique_se" : "carrinho");
    ler();
    window.addEventListener("hashchange", ler);
    return () => window.removeEventListener("hashchange", ler);
  }, []);
  const ir = (e: "carrinho" | "identifique_se") => {
    location.hash = e;
    window.scrollTo(0, 0);
  };

  const total3 = itens.reduce((s, i) => s + i.preco * i.qtd * (i.fator ?? 1), 0);
  const naSacola = new Set(itens.map((i) => i.pid));
  const recomendados = sugestoes.filter((c) => !naSacola.has(c.id)).slice(0, 4);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    const n = cep.replace(/\D/g, "");
    if (n.length !== 8) return setDestino("CEP inválido.");
    try {
      const j = await (await fetch(`https://viacep.com.br/ws/${n}/json/`)).json();
      setDestino(j.erro ? "CEP não encontrado." : `${j.localidade}/${j.uf}`);
    } catch {
      setDestino("Não foi possível consultar agora.");
    }
  }

  const botoes = (
    <div className="lj-ck-acoes">
      <Link href={`${BASE}/loja`} className="lj-ck-btn2">
        <ChevronLeft size={16} /> Escolher mais produtos
      </Link>
      <button className="lj-ck-btn" disabled={!itens.length} onClick={() => ir("identifique_se")}>
        Continuar
      </button>
    </div>
  );

  return (
    <div className="lj-ck">
      <Topo />
      <p className="lj-ck-nota">Tela da Tray: no site novo muda só a cor, como você vê aqui. Campos e etapas continuam os de hoje.</p>

      {etapa === "carrinho" ? (
        <main className="lj-ck-main">
          {botoes}

          <section className="lj-ck-caixa">
            <h2>Meu carrinho</h2>
            {itens.length === 0 ? (
              <p className="lj-ck-vazio">Seu carrinho está vazio.</p>
            ) : (
              <ul className="lj-ck-itens">
                {itens.map((i) => (
                  <li key={i.chave}>
                    <img src={i.img} alt="" />
                    <span className="lj-ck-nome">
                      {i.nome}
                      {i.detalhe && <small>{i.detalhe}</small>}
                    </span>
                    <span className="lj-ck-qtd">
                      <button onClick={() => mudar(i.chave, -1)} aria-label="Menos um">
                        -
                      </button>
                      <span>{i.qtd}</span>
                      <button onClick={() => mudar(i.chave, 1)} aria-label="Mais um">
                        +
                      </button>
                    </span>
                    <b>{brl(i.preco * i.qtd)}</b>
                    <button className="lj-ck-lixo" onClick={() => mudar(i.chave, -i.qtd)} aria-label="Remover">
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="lj-ck-duas">
            <section className="lj-ck-caixa">
              <h2>Frete</h2>
              <form className="lj-ck-cep" onSubmit={buscar}>
                <input
                  inputMode="numeric"
                  placeholder="Digite seu CEP"
                  value={cep}
                  maxLength={9}
                  onChange={(e) => {
                    const n = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setCep(n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n);
                    setDestino(null);
                  }}
                />
                <button className="lj-ck-btn">Buscar</button>
              </form>
              <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer">
                Não sei meu CEP
              </a>
              {destino && (
                <p className="lj-ck-dest">
                  {destino.includes("/") ? (
                    <>
                      Entrega para <b>{destino}</b>. Na loja, aqui aparecem as opções da Tray Envios com valor e prazo.
                    </>
                  ) : (
                    destino
                  )}
                </p>
              )}
            </section>

            <section className="lj-ck-caixa">
              <h2>Resumo do pedido</h2>
              <div className="lj-ck-linha">
                <span>Subtotal</span>
                <span>{brl(total)}</span>
              </div>
              <div className="lj-ck-linha is-total">
                <span>Total do pedido</span>
                <span>
                  <b>{brl(total)}</b>
                  <small>no pix à vista</small>
                  {total3 > total + 0.01 && <small>ou 3x de {brl(total3 / 3)} no cartão de crédito</small>}
                </span>
              </div>
            </section>
          </div>

          {recomendados.length > 0 && (
            <section className="lj-ck-caixa">
              <h2>Recomendamos para você</h2>
              <ul className="lj-ck-rec">
                {recomendados.map((c) => (
                  <li key={c.id}>
                    <img src={c.img} alt="" loading="lazy" />
                    <span>{c.nome}</span>
                    {c.promo && <s>De {brl(c.preco)}</s>}
                    <b>{brl(c.promo ?? c.preco)}</b>
                    <button
                      onClick={() =>
                        adicionar({ pid: c.id, nome: c.nome, preco: c.promo ?? c.preco, img: c.img, fator: c.fator })
                      }
                    >
                      Adicionar
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {botoes}
        </main>
      ) : (
        <main className="lj-ck-main lj-ck-ident">
          <h1>Informe seu e-mail ou CPF/CNPJ para prosseguir com sua compra</h1>
          <p>Utilizaremos seus dados para identificar seu cadastro ou criar uma nova conta.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFim(true);
            }}
          >
            <label>
              <Mail size={18} />
              <input placeholder="E-mail ou CPF/CNPJ" required aria-label="E-mail ou CPF/CNPJ" />
            </label>
            <button className="lj-ck-btn">Continuar</button>
          </form>
          <p className="lj-ck-ou">
            <span>ou conecte-se com a sua conta</span>
          </p>
          <div className="lj-ck-sociais">
            <button type="button" onClick={() => setFim(true)}>
              <b className="is-f">f</b> Fazer login com o Facebook
            </button>
            <button type="button" onClick={() => setFim(true)}>
              <b className="is-g">G</b> Fazer login com o Google
            </button>
          </div>
          <button className="lj-ck-voltar" onClick={() => ir("carrinho")}>
            <ChevronLeft size={16} /> Voltar ao carrinho
          </button>
        </main>
      )}

      <Rodape />

      {fim && (
        <div className="lj-ck-aviso" role="dialog" aria-modal="true" aria-label="Fim da demonstração">
          <div>
            <h2>Daqui em diante é a Tray de hoje</h2>
            <p>
              Entrega, pagamento (Pix, boleto e cartão pela Vindi) e confirmação seguem exatamente como na loja atual, só com as
              cores da marca. Nesta versão de demonstração a compra para aqui e nada é cobrado.
            </p>
            <button className="lj-ck-btn" onClick={() => setFim(false)}>
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
