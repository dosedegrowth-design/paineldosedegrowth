"use client";

/**
 * Copiar no celular: a área de transferência quando dá, e a seleção do texto
 * quando o navegador não deixa (Safari antigo, aba sem permissão). Usado pelo
 * Pix copia e cola do sinal e pela mensagem de confirmação do painel.
 */
export async function copiarTexto(texto: string): Promise<boolean> {
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
