"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Lock } from "lucide-react";

const OPCOES = [
  { nome: "Padrão da Tray", logo: "escuro", v: { fundo: "#f5f5f5", top: "#ffffff", topTxt: "#333333", dest: "#333333", btn: "#2e9e4f", btnTxt: "#ffffff" } },
  { nome: "Vinho e ouro", logo: "claro", v: { fundo: "#f6f0e6", top: "#3A0C17", topTxt: "#ECD9A4", dest: "#8E1B2E", btn: "#8E1B2E", btnTxt: "#F1E4CB" } },
  { nome: "Preto e vermelho", logo: "claro", v: { fundo: "#f2f2f2", top: "#111111", topTxt: "#f5f5f5", dest: "#C8102E", btn: "#C8102E", btnTxt: "#ffffff" } },
];

export function CheckoutCores() {
  const [i, setI] = useState(1);
  const o = OPCOES[i];
  const vars = {
    "--ck-fundo": o.v.fundo,
    "--ck-top": o.v.top,
    "--ck-top-txt": o.v.topTxt,
    "--ck-dest": o.v.dest,
    "--ck-btn": o.v.btn,
    "--ck-btn-txt": o.v.btnTxt,
  } as React.CSSProperties;

  return (
    <div className="pa-demo">
      <div className="pa-cel">
        <div className="pa-cel-tela is-curta">
          <div className="pa-ck" style={vars}>
            <div className="pa-ck-top">
              <img src={`/palavracomalma/logo-${o.logo}.png`} alt="" />
              <span>
                <Lock size={11} /> Compra segura
              </span>
            </div>
            <div className="pa-ck-passos">
              <span>Carrinho</span>
              <b>Identificação</b>
              <span>Pagamento</span>
              <span>Pedido</span>
            </div>
            <div className="pa-ck-box">
              <h5>Seus dados</h5>
              <div className="pa-ck-campo">E-mail</div>
              <div className="pa-ck-campo">CPF</div>
              <div className="pa-ck-campo">CEP</div>
            </div>
            <div className="pa-ck-box">
              <h5>Pagamento</h5>
              <div className="pa-ck-pg">
                <span>Pix</span>
                <span>Cartão</span>
                <span>Boleto</span>
              </div>
            </div>
            <div className="pa-ck-box">
              <div className="pa-ck-linha">
                <span>Subtotal</span>
                <span>R$ 146,49</span>
              </div>
              <div className="pa-ck-linha">
                <span>Frete (Tray Envios)</span>
                <span>R$ 22,90</span>
              </div>
            </div>
            <div className="pa-ck-btn">Finalizar pedido</div>
            <div className="pa-ck-rod">Palavra com Alma · ambiente seguro</div>
          </div>
        </div>
      </div>
      <div className="pa-demo-lado">
        <div>
          <p className="pa-sel-t">Toque para trocar as cores do checkout</p>
          <div className="pa-sel" role="group" aria-label="Cores do checkout">
            {OPCOES.map((x, k) => (
              <button key={x.nome} aria-pressed={k === i} onClick={() => setI(k)}>
                {x.nome}
              </button>
            ))}
          </div>
        </div>
        <p className="pa-explica">
          Repare que <b>só as cores mudam</b>: topo, rodapé, botões e destaques. Os campos, a ordem das etapas e o jeito de pagar
          continuam iguais, porque esse desenho é da Tray.
        </p>
        <p className="pa-explica">
          É exatamente essa tela que fala com a Vindi, calcula o frete e gera o pedido que vira nota fiscal. Por isso a Tray não
          deixa ninguém mexer no código dela, e isso é bom: o que já funciona continua funcionando.
        </p>
        <p className="pa-explica" style={{ fontSize: 13, color: "var(--apagado)" }}>
          Desenho ilustrativo. As cores são ajustadas no painel da Tray, em Configurações › Minha Loja › Aparência do carrinho, e
          valem também para a área do cliente.
        </p>
      </div>
    </div>
  );
}
