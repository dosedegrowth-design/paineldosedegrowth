import { Bloom } from "@/components/tayssa/flora/bloom";

/**
 * A marca viva: a flor da parede como símbolo, o nome ao lado. Entra
 * desfocada e fica nítida, depois flutua de leve e um brilho passa por
 * ela — como o símbolo na entrada do painel da iWin.
 */
export function MarcaViva({ sub = "Cílios e olhar", className }: { sub?: string; className?: string }) {
  return (
    <span className={["ty-marca-viva", className ?? ""].join(" ").trim()}>
      <span className="ty-marca-viva__simbolo">
        <Bloom seed={5} tom="magenta" />
      </span>
      <span className="ty-marca-viva__txt">
        <span className="ty-marca-viva__nome">
          Tayssa <em>Lash</em>
        </span>
        <span className="ty-marca-viva__sub">{sub}</span>
      </span>
    </span>
  );
}
