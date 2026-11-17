"use client";

import { useState } from "react";
import { useTarefa } from "@/components/tayssa/ui/acao";
import { divisaoValida, lerNumero } from "@/lib/tayssa/financeiro";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { adminSalvarContatoLarissaAction, adminSalvarDivisaoAction } from "@/lib/tayssa/actions/gestao";

/**
 * A divisão Tayssa/Larissa (17/11/2026): os dois percentuais somam 100 (ao
 * mudar um, o outro acompanha). Vale para os próximos atendimentos; os já
 * fechados ficam com a divisão da época.
 */
export function DivisaoForm({ pctTayssa, pctLarissa, nomeLarissa }: { pctTayssa: number; pctLarissa: number; nomeLarissa: string }) {
  const fmt = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");
  const [t, setT] = useState(fmt(pctTayssa));
  const [l, setL] = useState(fmt(pctLarissa));
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  const nt = lerNumero(t);
  const nl = lerNumero(l);
  const valido = nt != null && nl != null && divisaoValida(nt, nl);
  const complemento = (v: string) => {
    const n = lerNumero(v);
    return n != null && n >= 0 && n <= 100 ? fmt(100 - n) : "";
  };
  return (
    <form
      className="tyaf-divisao"
      onSubmit={(e) => {
        e.preventDefault();
        setErro(null);
        setOk(false);
        iniciar(async () => {
          const r = await adminSalvarDivisaoAction({ pct_tayssa: t, pct_larissa: l });
          if (!r.ok) setErro(r.error);
          else setOk(true);
        });
      }}
    >
      <div className="tyac-campos">
        <div>
          <label className="tya-label" htmlFor="pct-tayssa">
            Tayssa (%)
          </label>
          <input
            id="pct-tayssa"
            className="tya-field"
            inputMode="decimal"
            value={t}
            onChange={(e) => {
              setT(e.target.value);
              setL(complemento(e.target.value));
              setOk(false);
            }}
          />
        </div>
        <div>
          <label className="tya-label" htmlFor="pct-larissa">
            {nomeLarissa} (%)
          </label>
          <input
            id="pct-larissa"
            className="tya-field"
            inputMode="decimal"
            value={l}
            onChange={(e) => {
              setL(e.target.value);
              setT(complemento(e.target.value));
              setOk(false);
            }}
          />
        </div>
      </div>
      <p className={valido ? "tya-small" : "tya-err"}>
        {valido ? `Soma: 100%. Vale para os atendimentos que fecharem daqui para frente; os anteriores ficam como estão.` : "Os dois precisam somar 100%."}
      </p>
      {erro ? <p className="tya-err">{erro}</p> : null}
      {ok ? <p className="tya-ok">Divisão salva. Os próximos atendimentos já usam esta.</p> : null}
      <button type="submit" className="tya-btn tya-btn--primary" disabled={pendente || !valido}>
        {pendente ? "Salvando…" : "Salvar a divisão"}
      </button>
    </form>
  );
}

/** Para onde vai o relatório: o nome e o WhatsApp da Larissa. */
export function ContatoLarissaForm({ nome, whatsapp }: { nome: string; whatsapp: string }) {
  const [n, setN] = useState(nome);
  const [w, setW] = useState(formatBrPhone(whatsapp));
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  return (
    <form
      className="tyaf-divisao"
      onSubmit={(e) => {
        e.preventDefault();
        setErro(null);
        setOk(false);
        iniciar(async () => {
          const r = await adminSalvarContatoLarissaAction({ nome: n, whatsapp: w });
          if (!r.ok) setErro(r.error);
          else setOk(true);
        });
      }}
    >
      <div className="tyac-campos">
        <div>
          <label className="tya-label" htmlFor="larissa-nome">
            Nome
          </label>
          <input id="larissa-nome" className="tya-field" value={n} onChange={(e) => setN(e.target.value)} />
        </div>
        <div>
          <label className="tya-label" htmlFor="larissa-whats">
            WhatsApp
          </label>
          <input id="larissa-whats" className="tya-field" inputMode="tel" value={w} onChange={(e) => setW(e.target.value)} />
        </div>
      </div>
      {erro ? <p className="tya-err">{erro}</p> : null}
      {ok ? <p className="tya-ok">Contato salvo.</p> : null}
      <button type="submit" className="tya-btn tya-btn--ghost" disabled={pendente}>
        {pendente ? "Salvando…" : "Salvar o contato"}
      </button>
    </form>
  );
}
