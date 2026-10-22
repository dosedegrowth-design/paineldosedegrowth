/**
 * Enquanto os dados da cliente chegam. Vale para todas as telas do VIP
 * (início, cartão, agendar, benefícios, jornada, perfil), então é neutro:
 * o cumprimento, uma linha e dois blocos — sem inventar nenhum valor nem
 * desenhar uma tela que não é a que vai abrir.
 */
export default function VipLoading() {
  return (
    <div className="tyv-skel-page" aria-busy="true" aria-label="Carregando">
      <span className="tyv-skel" style={{ width: "58%", height: 38, marginTop: 18 }} />
      <span className="tyv-skel" style={{ width: "80%", height: 16, marginTop: 14 }} />
      <span className="tyv-skel" style={{ height: 210, borderRadius: "var(--tyv-radius)", marginTop: 26 }} />
      <span className="tyv-skel" style={{ height: 150, borderRadius: "var(--tyv-radius)", marginTop: 18 }} />
    </div>
  );
}
