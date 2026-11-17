import "../relatorio.css";

/** Link de relatório que não existe (cortado na mensagem ou digitado errado). */
export default function RelatorioQueNaoExiste() {
  return (
    <main className="tyrel">
      <div className="tyrel__papel tyrel__papel--aviso">
        <p className="tyrel__marca">Tayssa Farias</p>
        <h1>Relatório não encontrado</h1>
        <p>O link pode ter chegado cortado. Peça à Tayssa para enviar de novo.</p>
      </div>
    </main>
  );
}
