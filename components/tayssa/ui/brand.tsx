import { Bloom } from "@/components/tayssa/flora/bloom";

/**
 * A marca: a flor da parede do estúdio flutuando ao lado do nome. Uma peça
 * só, usada em todas as telas — público, entrada, app da cliente e rodapé.
 * A cor do nome vem de quem usa (currentColor); "Lash" leva o rosé da casa.
 */
export function TyBrand({
  size = "md",
  className,
  name = "Tayssa",
  suffix = "Lash",
}: {
  size?: "md" | "sm";
  className?: string;
  /** primeira palavra (dela) */
  name?: string;
  /** segunda palavra, mais leve */
  suffix?: string;
}) {
  return (
    <span className={["ty-brand", size === "sm" ? "ty-brand--sm" : "", className ?? ""].join(" ").trim()}>
      <span className="ty-brand__flor" aria-hidden>
        <Bloom seed={5} tom="magenta" />
      </span>
      <span className="ty-brand__name">
        {name} <em>{suffix}</em>
      </span>
    </span>
  );
}
