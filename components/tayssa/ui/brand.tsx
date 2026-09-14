/**
 * A marca: a inicial dela e o nome do estúdio. Uma peça só, usada em
 * todas as telas — público, entrada, app da cliente e admin.
 */
export function TyBrand({
  size = "md",
  className,
  name = "Tayssa",
  suffix = "Lash",
}: {
  size?: "md" | "sm";
  className?: string;
  /** primeira palavra (dela) — a inicial sai daqui */
  name?: string;
  /** segunda palavra, mais leve */
  suffix?: string;
}) {
  return (
    <span className={["ty-brand", size === "sm" ? "ty-brand--sm" : "", className ?? ""].join(" ").trim()}>
      <span className="ty-brand__mark" aria-hidden>
        {name.trim().charAt(0)}
      </span>
      <span className="ty-brand__name">
        {name} <em>{suffix}</em>
      </span>
    </span>
  );
}
