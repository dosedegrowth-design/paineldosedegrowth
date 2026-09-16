import type { Timeline as TimelineData, TimelineItem } from "@/lib/tayssa/timeline";

/**
 * A jornada, de cima para baixo: o que vem, a linha de hoje, o que já
 * foi. Cada ponto tem a cor do que é — visita, benefício, horário.
 */
export function Timeline({ data }: { data: TimelineData }) {
  const { upcoming, recent } = data;
  let i = 0;
  const row = (item: TimelineItem, future: boolean) => (
    <div
      key={item.id}
      className="tyv-tl__item"
      data-tone={item.tone}
      data-future={future || undefined}
      style={{ "--i": i++ } as React.CSSProperties}
    >
      <span className="tyv-tl__node" aria-hidden />
      <div className="tyv-tl__body">
        <span className="tyv-tl__title">{item.title}</span>
        <span className="tyv-tl__detail">{item.detail}</span>
      </div>
      {item.value ? <span className="tyv-tl__value">{item.value}</span> : null}
    </div>
  );
  return (
    <div className="tyv-tl">
      {upcoming.map((item) => row(item, true))}
      {upcoming.length && recent.length ? (
        <div className="tyv-tl__now" aria-hidden>
          <span>hoje</span>
        </div>
      ) : null}
      {recent.map((item) => row(item, false))}
    </div>
  );
}
