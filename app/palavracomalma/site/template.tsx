// Recria a cada navegação: dá a passagem suave entre as páginas da loja.
export default function Passagem({ children }: { children: React.ReactNode }) {
  return <div className="lj-passagem">{children}</div>;
}
