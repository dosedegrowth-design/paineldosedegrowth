"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import "@/app/tayssa/sinal.css";
import { prepararComprovanteAction, salvarComprovanteAction } from "@/lib/tayssa/actions/comprovante";
import { COMPROVANTE_MAX_BYTES, COMPROVANTE_TIPOS, ROUTES, publicUrl } from "@/lib/tayssa/config";
import { diaLegivel, horaLegivel, recadoDoCartao, reais } from "@/lib/tayssa/agendar";
import { pixDoPedido, type PixDaAgenda } from "@/lib/tayssa/pix";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { WhatsAppIcon } from "@/components/tayssa/ui/whatsapp";

/** O pedido como a mensagem do WhatsApp precisa (o mesmo da folha e de "Meus horários"). */
export type PedidoDoSinal = {
  id: string;
  servico: string;
  tecnica?: string | null;
  dia: string;
  hora: string;
  valor?: number | null;
};

/** Manda o arquivo direto para o Storage pelo endereço assinado, com o andamento. */
function enviarArquivo(url: string, arquivo: File, andamento: (p: number) => void): Promise<void> {
  return new Promise((ok, falha) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", arquivo.type);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) andamento(e.loaded / e.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? ok() : falha(new Error(`envio ${xhr.status}`)));
    xhr.onerror = () => falha(new Error("rede"));
    xhr.send(arquivo);
  });
}

/** Copiar no celular: a área de transferência quando dá, e a seleção do texto quando o navegador não deixa. */
async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.setAttribute("readonly", "");
    campo.style.position = "fixed";
    campo.style.opacity = "0";
    document.body.appendChild(campo);
    campo.select();
    let deu = false;
    try {
      deu = document.execCommand("copy");
    } catch {
      deu = false;
    }
    campo.remove();
    return deu;
  }
}

/**
 * O sinal em três passos (Lucas, 05/11/2026, no modelo do Reflexo do Santo):
 * 1. copiar o Pix copia e cola (o valor do sinal já vai junto);
 * 2. anexar o comprovante (foto ou PDF, direto para o Storage privado);
 * 3. com o comprovante no pedido, aparece "Enviar o cartão no WhatsApp": o
 *    cartão do horário vai como FOTO, com um recado curto (Lucas, 05/11/2026:
 *    "não um link, como se ela estivesse enviando uma foto"), pelo
 *    compartilhar do celular. Onde o navegador não compartilha arquivo
 *    (computador), o botão abre a conversa com o recado e o link do horário,
 *    que o WhatsApp mostra como o folder.
 * Sem chave Pix cadastrada no painel, o passo 1 vira "pedir a chave no
 * WhatsApp", como antes. `tema`: "noite" na folha de agendar do site (vinho
 * escuro, a paleta dela), "perola" na conta.
 */
export function PagarSinal({
  pedido,
  nome,
  sinal,
  telefone,
  pix,
  comprovanteEm = null,
  tema,
  onAnexado,
  jaAvisada = false,
}: {
  pedido: PedidoDoSinal;
  /** primeiro nome de quem marcou (vai na mensagem) */
  nome: string;
  sinal: number;
  /** WhatsApp da Tayssa */
  telefone: string;
  pix: PixDaAgenda | null;
  comprovanteEm?: string | null;
  tema: "noite" | "perola";
  /** a conta atualiza a lista depois de anexar */
  onAnexado?: () => void;
  /**
   * Em aberto (Lucas, 05/11/2026: "já marcou, então não tem que avisar ninguém
   * de novo"): com o comprovante no pedido, em vez dos passos e do botão de
   * avisar, fica só o cartão de "já avisado".
   */
  jaAvisada?: boolean;
}) {
  const codigo = pixDoPedido(pix, sinal, pedido.id);
  const arquivoRef = useRef<HTMLInputElement>(null);
  const [copiado, setCopiado] = useState(false);
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [enviando, setEnviando] = useState<number | null>(null);
  const [em, setEm] = useState<string | null>(comprovanteEm);
  const [erro, setErro] = useState<string | null>(null);
  // acabou de anexar: o passo de avisar (ou o cartão de "já avisado") aparece embaixo, e a tela vai até ele
  const [acabou, setAcabou] = useState(false);
  const fimRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!acabou) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fimRef.current?.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "center" });
  }, [acabou]);

  // sem foto, o recado curto leva o link do horário (o WhatsApp mostra o folder)
  const comLink = (comprovante: boolean) =>
    `${recadoDoCartao({ nome, sinal, comprovante })}\n\nMeu horário: ${publicUrl(ROUTES.horario(pedido.id))}`;

  // O cartão do horário como foto: baixado assim que o passo 3 aparece, porque o
  // Safari só abre o compartilhar no mesmo toque (sem esperar a rede no meio).
  const [cartao, setCartao] = useState<{ previa: string; foto: File | null } | null>(null);
  const [semFoto, setSemFoto] = useState(false);
  const previaRef = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (previaRef.current) URL.revokeObjectURL(previaRef.current);
    },
    [],
  );
  useEffect(() => {
    if (!em) return;
    let vivo = true;
    // trocou o comprovante: busca de novo (a hora do envio muda o endereço)
    fetch(`${ROUTES.cartaoDoHorario(pedido.id)}?v=${encodeURIComponent(em)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`cartão ${r.status}`))))
      .then((blob) => {
        if (!vivo) return;
        const foto = new File([blob], "horario-tayssa-lash.png", { type: "image/png" });
        const podeFoto = typeof navigator.canShare === "function" && navigator.canShare({ files: [foto] });
        if (previaRef.current) URL.revokeObjectURL(previaRef.current);
        previaRef.current = URL.createObjectURL(blob);
        setCartao({ previa: previaRef.current, foto: podeFoto ? foto : null });
      })
      .catch(() => {
        // sem o cartão, o botão continua abrindo a conversa com o recado e o link
      });
    return () => {
      vivo = false;
    };
  }, [em, pedido.id]);

  const fotoPronta = Boolean(cartao?.foto) && !semFoto;
  const enviarCartao = (e: MouseEvent<HTMLAnchorElement>) => {
    const foto = cartao?.foto;
    // segue o link: a conversa da Tayssa com o recado e o link do horário
    if (!foto || semFoto || typeof navigator.share !== "function") return;
    e.preventDefault();
    navigator.share({ files: [foto], text: recadoDoCartao({ nome, sinal, comprovante: true }) }).catch((err: unknown) => {
      // fechou o compartilhar: nada a fazer; outra falha: o próximo toque abre a conversa com o texto
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSemFoto(true);
    });
  };

  const copiar = async () => {
    if (!codigo) return;
    const deu = await copiarTexto(codigo);
    if (deu) {
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 4000);
    } else {
      // o navegador não deixou copiar: mostra o código para ela segurar e copiar
      setMostrarCodigo(true);
    }
  };

  const anexar = async (arquivo: File | undefined) => {
    if (!arquivo) return;
    setErro(null);
    if (!COMPROVANTE_TIPOS[arquivo.type]) {
      setErro("Mande uma foto (JPG ou PNG) ou o PDF do comprovante.");
      return;
    }
    if (arquivo.size > COMPROVANTE_MAX_BYTES) {
      setErro("O arquivo passa de 8 MB. Mande um print do comprovante.");
      return;
    }
    setEnviando(0);
    try {
      const prep = await prepararComprovanteAction({ id: pedido.id, mime: arquivo.type, bytes: arquivo.size });
      if (!prep.ok) throw new Error(prep.error);
      await enviarArquivo(prep.data.signedUrl, arquivo, (p) => setEnviando(p));
      const salvo = await salvarComprovanteAction({ id: pedido.id, path: prep.data.path, mime: arquivo.type });
      if (!salvo.ok) throw new Error(salvo.error);
      setEm(salvo.data.em);
      setAcabou(true);
      onAnexado?.();
    } catch (e) {
      const texto = e instanceof Error ? e.message : "";
      setErro(
        texto && !/^envio \d+$|^rede$/.test(texto)
          ? texto
          : "Não deu para enviar o comprovante. Confira a internet e tente de novo.",
      );
    } finally {
      setEnviando(null);
      if (arquivoRef.current) arquivoRef.current.value = "";
    }
  };

  const anexado = Boolean(em);
  const passo1Feito = anexado || copiado;

  // peças que o passo 2 e o cartão de "já avisado" usam: o seletor de arquivo, o andamento, o erro e a prévia
  const campoArquivo = (
    <input
      ref={arquivoRef}
      type="file"
      accept="image/*,application/pdf"
      className="tysn__arquivo"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => anexar(e.currentTarget.files?.[0])}
    />
  );
  const andamento =
    enviando !== null ? (
      <div className="tysn__envio" role="status">
        <span className="tysn__barra" style={{ transform: `scaleX(${Math.max(0.06, enviando)})` }} />
        <span>Enviando o comprovante… {Math.round(enviando * 100)}%</span>
      </div>
    ) : null;
  const avisoDeErro = erro ? (
    <p className="tysn__erro" role="alert">
      {erro}
    </p>
  ) : null;
  const miniatura = cartao ? (
    // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob) do cartão do horário
    <img
      className="tysn__miniatura"
      src={cartao.previa}
      alt={`Cartão do seu horário: ${pedido.servico}, ${diaLegivel(pedido.dia)} às ${horaLegivel(pedido.hora)}`}
      width={1080}
      height={1350}
    />
  ) : (
    <span className="tysn__miniatura tysn__miniatura--vazia" aria-hidden />
  );

  // Em aberto, com o comprovante: o horário já foi marcado e a Tayssa já tem o comprovante no painel
  // (e o aviso no celular). Nada de avisar de novo: só o cartão de "já avisado" e trocar o arquivo.
  if (jaAvisada && anexado) {
    return (
      <div className={`tysn tysn--${tema}`}>
        <section className="tysn__passo tysn__avisado" ref={fimRef}>
          {miniatura}
          <div className="tysn__corpo">
            <h3 className="tysn__titulo">Sinal pago e Tayssa avisada</h3>
            <p className="tysn__texto">O comprovante já está com ela. A Tayssa confere o Pix e confirma o seu horário.</p>
            {campoArquivo}
            {andamento ?? (
              <button type="button" className="tysn__link" onClick={() => arquivoRef.current?.click()}>
                Trocar o comprovante
              </button>
            )}
            {avisoDeErro}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`tysn tysn--${tema}`}>
      {/* 1. o Pix */}
      <section className="tysn__passo" data-feito={passo1Feito || undefined}>
        <span className="tysn__num" aria-hidden>
          {passo1Feito ? "✓" : "1"}
        </span>
        <div className="tysn__corpo">
          <h3 className="tysn__titulo">
            {anexado ? `Sinal de ${reais(sinal)} pago no Pix` : `Pague o sinal de ${reais(sinal)} no Pix`}
          </h3>
          {anexado ? null : codigo ? (
            <>
              <p className="tysn__texto">
                Copie o código e cole no app do seu banco, em <b>Pix copia e cola</b>. O valor já vai junto.
                {pix?.nome ? (
                  <>
                    {" "}
                    O Pix sai em nome de <b>{pix.nome}</b>
                    {pix.banco ? ` (${pix.banco})` : ""}.
                  </>
                ) : null}
              </p>
              <button type="button" className="tysn__btn" onClick={copiar} aria-live="polite">
                {copiado ? "Código copiado" : "Copiar código Pix"}
              </button>
              {mostrarCodigo ? (
                <textarea
                  className="tysn__codigo"
                  readOnly
                  value={codigo}
                  rows={3}
                  aria-label="Código Pix copia e cola"
                  onFocus={(e) => e.currentTarget.select()}
                />
              ) : (
                <button type="button" className="tysn__link" onClick={() => setMostrarCodigo(true)}>
                  Ver o código
                </button>
              )}
            </>
          ) : (
            <>
              <p className="tysn__texto">
                Peça a chave Pix para a Tayssa no WhatsApp e, depois de pagar, anexe o comprovante aqui.
              </p>
              <a
                className="tysn__whats"
                href={whatsappUrl(telefone, comLink(false))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="tysn__whats-logo" aria-hidden>
                  <WhatsAppIcon size={17} />
                </span>
                Pedir a chave Pix
              </a>
            </>
          )}
        </div>
      </section>

      {/* 2. o comprovante */}
      <section className="tysn__passo" data-feito={anexado || undefined}>
        <span className="tysn__num" aria-hidden>
          {anexado ? "✓" : "2"}
        </span>
        <div className="tysn__corpo">
          <h3 className="tysn__titulo">{anexado ? "Comprovante anexado" : "Anexe o comprovante"}</h3>
          <p className="tysn__texto">
            {anexado
              ? "A Tayssa confere o Pix e confirma o seu horário."
              : "Depois de pagar, mande o print ou o PDF do comprovante. Sem ele, o horário não fica confirmado."}
          </p>
          {campoArquivo}
          {andamento ??
            (anexado ? (
              <button type="button" className="tysn__link" onClick={() => arquivoRef.current?.click()}>
                Trocar o arquivo
              </button>
            ) : (
              <button type="button" className="tysn__btn" onClick={() => arquivoRef.current?.click()}>
                Anexar comprovante
              </button>
            ))}
          {avisoDeErro}
        </div>
      </section>

      {/* 3. com o comprovante, avisar a Tayssa */}
      {anexado ? (
        <section className="tysn__passo tysn__passo--fim" ref={fimRef}>
          <span className="tysn__num" aria-hidden>
            3
          </span>
          <div className="tysn__corpo">
            <h3 className="tysn__titulo">Avise a Tayssa</h3>
            <div className="tysn__cartao">
              {miniatura}
              <p className="tysn__texto">
                O cartão do seu horário vai junto{fotoPronta ? ", como foto," : ""} com um recado curto.
              </p>
            </div>
            <a
              className="tysn__whats"
              href={whatsappUrl(telefone, comLink(true))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={enviarCartao}
            >
              <span className="tysn__whats-logo" aria-hidden>
                <WhatsAppIcon size={17} />
              </span>
              Enviar no WhatsApp
            </a>
            {fotoPronta ? (
              <a className="tysn__link" href={whatsappUrl(telefone, comLink(true))} target="_blank" rel="noopener noreferrer">
                Não achou a Tayssa? Abrir a conversa dela
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
