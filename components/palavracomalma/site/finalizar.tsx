"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import { Barcode, CreditCard, Lock, QrCode, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { BASE, brl } from "@/app/palavracomalma/site/catalogo";
import { useSacola } from "./sacola";

type Forma = "pix" | "cartao" | "boleto";

const so = (v: string, n: number) => v.replace(/\D/g, "").slice(0, n);
const mascara = {
  cpf: (v: string) => so(v, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  cel: (v: string) => so(v, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2"),
  cep: (v: string) => so(v, 8).replace(/^(\d{5})(\d)/, "$1-$2"),
  cartao: (v: string) => so(v, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
  val: (v: string) => so(v, 4).replace(/^(\d{2})(\d)/, "$1/$2"),
};

export function Finalizar() {
  const { itens, total } = useSacola();
  const [forma, setForma] = useState<Forma>("pix");
  const [parcelas, setParcelas] = useState(1);
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [endereco, setEndereco] = useState<{ rua: string; bairro: string; cidade: string; uf: string } | null>(null);
  const [fim, setFim] = useState(false);

  // total parcelado em 3x com os juros que a Tray mostra em cada produto
  const total3 = itens.reduce((s, i) => s + i.preco * i.qtd * (i.fator ?? 1), 0);
  const temParcela = total3 > total + 0.01;
  const totalPago = forma === "cartao" && parcelas === 3 ? total3 : total;

  const set = (k: string, v: string) => setCampos((c) => ({ ...c, [k]: v }));
  const campo = (k: string, rotulo: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}, m?: (v: string) => string) => (
    <label className="lj-campo">
      <span>{rotulo}</span>
      <input value={campos[k] ?? ""} onChange={(e) => set(k, m ? m(e.target.value) : e.target.value)} {...extra} />
    </label>
  );

  async function buscarCep(v: string) {
    const n = v.replace(/\D/g, "");
    if (n.length !== 8) return setEndereco(null);
    try {
      const j = await (await fetch(`https://viacep.com.br/ws/${n}/json/`)).json();
      if (!j.erro) setEndereco({ rua: j.logradouro, bairro: j.bairro, cidade: j.localidade, uf: j.uf });
    } catch {}
  }

  if (itens.length === 0)
    return (
      <div className="lj-wrap lj-fin-vazio">
        <ShoppingBag size={36} />
        <h1>Sua sacola está vazia</h1>
        <p>Escolha suas peças e volte aqui para finalizar.</p>
        <Link href={`${BASE}/loja`} className="lj-btn is-ouro">
          Ver a loja
        </Link>
      </div>
    );

  return (
    <div className="lj-wrap lj-fin">
      <div className="lj-fin-topo">
        <h1>Finalizar compra</h1>
        <p>
          <Lock size={14} /> Ambiente seguro
        </p>
      </div>

      <div className="lj-fin-grade">
        <form
          className="lj-fin-form"
          onSubmit={(e) => {
            e.preventDefault();
            setFim(true);
          }}
        >
          <section className="lj-fin-bloco">
            <h2>
              <i>1</i> Seus dados
            </h2>
            <div className="lj-campos">
              {campo("email", "E-mail", { type: "email", autoComplete: "email", required: true })}
              {campo("nome", "Nome completo", { autoComplete: "name", required: true })}
              {campo("cel", "Celular com DDD", { inputMode: "tel", autoComplete: "tel", required: true }, mascara.cel)}
              {campo("cpf", "CPF", { inputMode: "numeric", required: true }, mascara.cpf)}
            </div>
          </section>

          <section className="lj-fin-bloco">
            <h2>
              <i>2</i> Entrega
            </h2>
            <div className="lj-campos">
              <label className="lj-campo">
                <span>CEP</span>
                <input
                  inputMode="numeric"
                  autoComplete="postal-code"
                  required
                  value={campos.cep ?? ""}
                  onChange={(e) => {
                    const v = mascara.cep(e.target.value);
                    set("cep", v);
                    buscarCep(v);
                  }}
                />
              </label>
              {endereco && (
                <p className="lj-fin-end">
                  {[endereco.rua, endereco.bairro, `${endereco.cidade}/${endereco.uf}`].filter(Boolean).join(", ")}
                </p>
              )}
              {campo("num", "Número", { inputMode: "numeric", required: true })}
              {campo("comp", "Complemento (opcional)")}
            </div>
            <div className="lj-fin-frete">
              <Truck size={18} />
              <p>
                {endereco ? (
                  <>
                    Envio com rastreio para <b>{endereco.cidade}/{endereco.uf}</b>. No site no ar, aqui aparecem as opções da Tray
                    Envios com valor e prazo para o seu CEP.
                  </>
                ) : (
                  "Digite o CEP para ver as opções de entrega."
                )}
              </p>
            </div>
          </section>

          <section className="lj-fin-bloco">
            <h2>
              <i>3</i> Pagamento
            </h2>
            <div className="lj-fin-formas" role="radiogroup" aria-label="Forma de pagamento">
              {(
                [
                  ["pix", "Pix", QrCode],
                  ["cartao", "Cartão", CreditCard],
                  ["boleto", "Boleto", Barcode],
                ] as const
              ).map(([id, nome, Icone]) => (
                <button key={id} type="button" role="radio" aria-checked={forma === id} onClick={() => setForma(id)}>
                  <Icone size={20} /> {nome}
                </button>
              ))}
            </div>

            {forma === "pix" && (
              <div className="lj-fin-pag">
                <p>
                  Pague <b>{brl(total)}</b> pelo app do seu banco. O QR Code e o código copia e cola aparecem assim que você
                  confirmar o pedido, e a aprovação é na hora.
                </p>
              </div>
            )}
            {forma === "cartao" && (
              <div className="lj-fin-pag">
                <div className="lj-campos">
                  {campo("cc", "Número do cartão", { inputMode: "numeric", autoComplete: "cc-number", required: true }, mascara.cartao)}
                  {campo("ccnome", "Nome impresso no cartão", { autoComplete: "cc-name", required: true })}
                  <div className="lj-campos-2">
                    {campo("ccval", "Validade", { inputMode: "numeric", autoComplete: "cc-exp", placeholder: "MM/AA", required: true }, mascara.val)}
                    {campo("cvv", "CVV", { inputMode: "numeric", autoComplete: "cc-csc", maxLength: 4, required: true })}
                  </div>
                  <label className="lj-campo">
                    <span>Parcelas</span>
                    <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}>
                      <option value={1}>1x de {brl(total)} sem juros</option>
                      {temParcela && <option value={3}>3x de {brl(total3 / 3)} com juros ({brl(total3)})</option>}
                    </select>
                  </label>
                </div>
                <p className="lj-fin-seg">
                  <ShieldCheck size={15} /> Pagamento processado pela Vindi. Os dados do cartão não ficam na loja.
                </p>
              </div>
            )}
            {forma === "boleto" && (
              <div className="lj-fin-pag">
                <p>
                  Boleto de <b>{brl(total)}</b>, gerado ao confirmar o pedido. O pedido é confirmado depois da compensação.
                </p>
              </div>
            )}
          </section>

          <button className="lj-btn is-ouro is-cheio lj-fin-btn" type="submit">
            <Lock size={16} /> Confirmar pedido · {brl(totalPago)}
          </button>
        </form>

        <aside className="lj-fin-resumo">
          <h2>Resumo do pedido</h2>
          <ul>
            {itens.map((i) => (
              <li key={i.chave}>
                <span className="lj-fin-foto">
                  <img src={i.img} alt="" />
                  <i>{i.qtd}</i>
                </span>
                <span>
                  {i.nome}
                  {i.detalhe && <small>{i.detalhe}</small>}
                </span>
                <b>{brl(i.preco * i.qtd)}</b>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{brl(total)}</dd>
            </div>
            <div>
              <dt>Frete</dt>
              <dd>calculado pela Tray Envios</dd>
            </div>
            {forma === "cartao" && parcelas === 3 && (
              <div>
                <dt>Juros do parcelamento</dt>
                <dd>{brl(total3 - total)}</dd>
              </div>
            )}
            <div className="is-total">
              <dt>Total</dt>
              <dd>{brl(totalPago)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      {fim && (
        <div className="lj-fin-aviso" role="dialog" aria-modal="true" aria-label="Pedido de demonstração">
          <div>
            <ShieldCheck size={30} />
            <h2>Aqui o pedido seria criado</h2>
            <p>
              Esta é a versão de demonstração do site novo, então nada foi cobrado. No site no ar, este botão cria o pedido na Tray,
              o pagamento passa pela Vindi e a nota fiscal e o envio seguem como hoje.
            </p>
            <button className="lj-btn is-claro" onClick={() => setFim(false)}>
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
