"use client";

import { useEffect, useRef, useState } from "react";
import { adminAjustarPontosAction, type AjusteFeito } from "@/lib/tayssa/actions/pontos";
import { ajusteDePontos, type TipoAjuste } from "@/lib/tayssa/rules";
import { numero, plural } from "@/lib/tayssa/format";
import type { ActionResult } from "@/lib/tayssa/types";
import { useAcaoFormulario } from "@/components/tayssa/ui/acao";
import { Campo, Escolha } from "@/components/tayssa/admin/forms";

type Servico = { id: string; name: string; point_value: number };

const pts = (n: number) => `${numero(n)} ${plural(n, "ponto", "pontos")}`;

const TIPOS: readonly (readonly [TipoAjuste, string])[] = [
  ["tirar", "Tirar pontos"],
  ["adicionar", "Adicionar pontos"],
];

/**
 * Corrigir os pontos da cliente (Lucas, 12/11/2026): tirar ou adicionar os
 * pontos de um serviço do catálogo, nunca um número solto. O caso de
 * sempre: marcou manutenção e fez aplicação; tira os da manutenção e
 * adiciona os da aplicação. Antes de gravar, a conta aparece inteira.
 */
export function CorrigirPontos({ clientId, pontos, servicos }: { clientId: string; pontos: number; servicos: Servico[] }) {
  const [state, onSubmit, pending] = useAcaoFormulario<ActionResult<AjusteFeito> | null>(adminAjustarPontosAction, null);
  const [tipo, setTipo] = useState<TipoAjuste | null>(null);
  const [servicoId, setServicoId] = useState("");
  const [feito, setFeito] = useState<AjusteFeito | null>(null);
  // o total que a última correção devolveu, e o total da tela naquela hora
  const [ultima, setUltima] = useState<{ daTela: number; total: number } | null>(null);
  const ref = useRef<HTMLFormElement>(null);

  // gravou: guarda o que foi feito e limpa a escolha para a próxima correção
  useEffect(() => {
    if (!state?.ok) return;
    setFeito(state.data);
    setUltima({ daTela: pontos, total: state.data.total });
    setTipo(null);
    setServicoId("");
    ref.current?.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só quando a ação responde
  }, [state]);

  // a tela leva uns segundos para trazer o total novo: até lá, a conta usa o
  // que a correção devolveu (duas correções seguidas nunca partem do total velho)
  const atual = ultima && ultima.daTela === pontos ? ultima.total : pontos;
  const err = state && !state.ok ? state : null;
  const servico = servicos.find((s) => s.id === servicoId) ?? null;
  const conta = tipo && servico ? ajusteDePontos(atual, servico.point_value, tipo) : null;
  const rotulo = `corrigir-${clientId}`;

  return (
    <form
      ref={ref}
      onSubmit={onSubmit}
      onChange={() => setFeito(null)}
      noValidate
      style={{ display: "grid", gap: 14, maxWidth: 560 }}
    >
      <input type="hidden" name="client_id" value={clientId} />
      <input type="hidden" name="tipo" value={tipo ?? ""} />

      <div>
        <span className="tya-label" id={rotulo}>
          O que fazer
        </span>
        <div className="tya-sugs" role="radiogroup" aria-labelledby={rotulo}>
          {TIPOS.map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={tipo === valor}
              className="tya-chip"
              data-on={tipo === valor ? "true" : "false"}
              onClick={() => {
                setTipo(valor);
                setFeito(null);
              }}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>

      <Escolha
        label="Os pontos de qual serviço"
        name="service_id"
        required
        value={servicoId}
        onChange={(e) => setServicoId(e.target.value)}
        error={err?.field === "service_id" ? err.error : undefined}
      >
        <option value="" disabled>
          Escolha o serviço
        </option>
        {servicos.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} · {pts(s.point_value)}
          </option>
        ))}
      </Escolha>

      <Campo
        label="Motivo (só você vê)"
        name="note"
        maxLength={300}
        placeholder="Ex.: fez aplicação no lugar da manutenção"
        error={err?.field === "note" ? err.error : undefined}
      />

      {/* a conta antes de gravar: quanto tem e com quanto fica */}
      {conta ? (
        conta.ok ? (
          <p className="tya-small" aria-live="polite" style={{ margin: 0 }}>
            Ela tem {pts(atual)} e fica com <b>{pts(conta.total)}</b>.
          </p>
        ) : (
          <p className="tya-err" role="alert" style={{ margin: 0 }}>
            {conta.motivo}
          </p>
        )
      ) : null}

      {err && err.field !== "service_id" && err.field !== "note" ? (
        <p className="tya-err" role="alert" style={{ margin: 0 }}>
          {err.error}
        </p>
      ) : null}
      {feito ? (
        <p className="tya-ok" role="status" style={{ margin: 0 }}>
          {feito.pontos > 0
            ? `Pronto: ${pts(feito.pontos)} de ${feito.servico} adicionados.`
            : `Pronto: ${pts(-feito.pontos)} de ${feito.servico} tirados.`}{" "}
          Ela está com {pts(feito.total)}.
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          className={`tya-btn tya-btn--sm ${tipo === "tirar" ? "tya-btn--dark" : "tya-btn--primary"}`}
          disabled={pending || !conta?.ok}
        >
          {pending
            ? "Gravando…"
            : conta?.ok && servico
              ? `${tipo === "tirar" ? "Tirar" : "Adicionar"} ${pts(servico.point_value)}`
              : "Escolha o que fazer e o serviço"}
        </button>
      </div>
    </form>
  );
}
