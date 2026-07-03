/* Painel de foto estilo makepill: moldura escura, caption monospace,
   zoom sutil no hover. As imagens vivem em public/andre/. */

export function PhotoPanel({
  src,
  alt,
  caption,
  ratio = "16/9",
  className = "",
}: {
  src: string;
  alt: string;
  caption: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-2xl border border-sky-400/20 group ${className}`}
      style={{ aspectRatio: ratio, background: "#0a1120" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      {/* wash frio pra casar com a paleta */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,9,20,0.05) 55%, rgba(5,9,20,0.72) 100%)",
          mixBlendMode: "multiply",
        }}
      />
      <figcaption className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <span className="tech-stamp" style={{ fontSize: 10 }}>
          {caption}
        </span>
      </figcaption>
      {/* cantos HUD */}
      <span className="absolute top-2.5 left-2.5 w-4 h-4 border-l border-t border-sky-300/60" />
      <span className="absolute top-2.5 right-2.5 w-4 h-4 border-r border-t border-sky-300/60" />
    </figure>
  );
}
