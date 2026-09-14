import { AREAS } from "@/lib/areas";
import { ROUTES } from "@/lib/config";
import { Botao } from "@/components/ui/botao";

export default function NotFound() {
  return (
    <section className="v-section" style={{ paddingBlock: "clamp(72px, 12vw, 140px)" }}>
      <div className="v-wrap">
        <p className="v-eyebrow">Erro 404</p>
        <h1 className="v-display v-h1" style={{ marginTop: 14 }}>
          Essa página
          <br />
          <span className="v-dot">não existe</span>
        </h1>
        <p className="v-lead" style={{ marginTop: 18 }}>
          Talvez você esteja procurando uma das cinco áreas de atuação.
        </p>
        <ul className="v-selos" style={{ marginTop: 22 }}>
          {AREAS.map((a) => (
            <li key={a.slug}>
              <a className="v-selo" href={a.href}>
                {a.numero} · {a.aba[0]} {a.aba[1]}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 28 }}>
          <Botao href={ROUTES.home} variante="ghost">
            Voltar ao portfólio
          </Botao>
        </div>
      </div>
    </section>
  );
}
