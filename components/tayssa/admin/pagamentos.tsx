"use client";

import { useState } from "react";
import { useTarefa } from "@/components/tayssa/ui/acao";
import { FORMAS, LISTA_FORMAS, brl, type FormaPagamento, type SituacaoPagamento } from "@/lib/tayssa/financeiro";
import {
  adminDefinirValorAtendimentoAction,
  adminQuitarAtendimentoAction,
  adminRegistrarPagamentoAction,
  adminRemoverPagamentoAction,
} from "@/lib/tayssa/actions/gestao";

/**
 * As ações de pagamento de um atendimento realizado (17/11/2026): marcar
 * como pago (o que falta, de uma vez), registrar uma parte, informar o
 * valor de um atendimento antigo sem valor e desfazer um pagamento lançado errado.
 */
export function PagamentoAcoes({
  atendimentoId,
  valor,
  recebido,
  situacao,
  formaPadrao,
}: {
  atendimentoId: string;
  valor: number | null;
  recebido: number;
  situacao: SituacaoPagamento;
  formaPadrao?: FormaPagamento | null;
}) {
  const [modo, setModo] = useState<null | "parte" | "valor">(null);
  const [forma, setForma] = useState<string>(formaPadrao ?? "pix");
  const [quanto, setQuanto] = useState("");
  const [data, setData] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  const falta = valor != null ? Math.max(0, Math.round((valor - recebido) * 100) / 100) : null;

  const rodar = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setErro(null);
    iniciar(async () => {
      const r = await fn();
      if (!r.ok) setErro(r.error ?? "Não deu certo. Tente de novo.");
      else setModo(null);
    });
  };

  if (situacao === "pago") return null;

  if (situacao === "sem_valor" || modo === "valor") {
    return (
      <div className="tyapg">
        <div className="tyapg__linha">
          <input className="tya-field" inputMode="decimal" placeholder="Valor cobrado (R$)" aria-label="Valor cobrado" value={quanto} onChange={(e) => setQuanto(e.target.value)} />
          <button type="button" className="tya-btn tya-btn--ghost" disabled={pendente} onClick={() => rodar(() => adminDefinirValorAtendimentoAction({ atendimentoId, valor: quanto }))}>
            {pendente ? "Salvando…" : "Informar valor"}
          </button>
        </div>
        {erro ? <p className="tya-err">{erro}</p> : null}
      </div>
    );
  }

  return (
    <div className="tyapg">
      {modo === "parte" ? (
        <div className="tyapg__linha">
          <input className="tya-field" inputMode="decimal" placeholder={falta != null ? `até ${brl(falta)}` : "Valor"} aria-label="Valor recebido" value={quanto} onChange={(e) => setQuanto(e.target.value)} />
          <select className="tya-field" value={forma} onChange={(e) => setForma(e.target.value)} aria-label="Forma de pagamento">
            {LISTA_FORMAS.map((f) => (
              <option key={f} value={f}>
                {FORMAS[f]}
              </option>
            ))}
          </select>
          <input type="date" className="tya-field" value={data} onChange={(e) => setData(e.target.value)} aria-label="Data em que recebeu (vazio = hoje)" />
          <button type="button" className="tya-btn tya-btn--primary" disabled={pendente} onClick={() => rodar(() => adminRegistrarPagamentoAction({ atendimentoId, valor: quanto, forma, data }))}>
            {pendente ? "Registrando…" : "Registrar"}
          </button>
          <button type="button" className="tya-link" onClick={() => setModo(null)}>
            Voltar
          </button>
        </div>
      ) : (
        <div className="tyapg__linha">
          <select className="tya-field" value={forma} onChange={(e) => setForma(e.target.value)} aria-label="Forma de pagamento">
            {LISTA_FORMAS.map((f) => (
              <option key={f} value={f}>
                {FORMAS[f]}
              </option>
            ))}
          </select>
          <button type="button" className="tya-btn tya-btn--primary" disabled={pendente} onClick={() => rodar(() => adminQuitarAtendimentoAction({ atendimentoId, forma }))}>
            {pendente ? "Registrando…" : falta != null ? `Recebi ${brl(falta)}` : "Marcar como pago"}
          </button>
          <button type="button" className="tya-link" onClick={() => setModo("parte")}>
            Recebi só uma parte
          </button>
        </div>
      )}
      {erro ? <p className="tya-err">{erro}</p> : null}
    </div>
  );
}

/** Desfazer um pagamento lançado errado (some do recebido; o atendimento volta a ter o que falta). */
export function RemoverPagamento({ id }: { id: string }) {
  const [certeza, setCerteza] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  if (!certeza) {
    return (
      <button type="button" className="tya-link tyapg__tirar" onClick={() => setCerteza(true)}>
        desfazer
      </button>
    );
  }
  return (
    <span className="tyapg__tirar">
      <button
        type="button"
        className="tya-link"
        disabled={pendente}
        onClick={() => {
          setErro(null);
          iniciar(async () => {
            const r = await adminRemoverPagamentoAction({ id });
            if (!r.ok) setErro(r.error);
          });
        }}
      >
        {pendente ? "Desfazendo…" : "Sim, desfazer"}
      </button>{" "}
      <button type="button" className="tya-link" onClick={() => setCerteza(false)}>
        não
      </button>
      {erro ? <span className="tya-err"> {erro}</span> : null}
    </span>
  );
}
