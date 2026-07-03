/* Moldura de estúdio: grão de filme global + trilho lateral fixo. */

export function SiteFrame() {
  return (
    <>
      <div className="andre-grain" aria-hidden />
      <div className="andre-scanlines" aria-hidden />
      <div className="andre-siderail" aria-hidden>
        André AC — São Paulo · est. 2014
      </div>
    </>
  );
}

/* Tipografia gigante vazada atrás de uma seção */
export function Watermark({
  text,
  top = "6%",
}: {
  text: string;
  top?: string;
}) {
  return (
    <span className="andre-watermark" style={{ top }} aria-hidden>
      {text}
    </span>
  );
}
