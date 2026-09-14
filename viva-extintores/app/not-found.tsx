import Link from "next/link";
import { AREAS } from "@/lib/areas";
import { MENU, ROUTES } from "@/lib/config";
import { Botao } from "@/components/ui/botao";

export default function NotFound() {
  return (
    <section className="v-section" style={{ paddingBlock: "clamp(64px, 10vw, 120px)" }}>
      <div className="v-wrap">
        <p className="v-eyebrow">Erro 404</p>
        <h1 className="v-display v-h1" style={{ marginTop: 12 }}>
          Essa página
          <br />
          <span className="v-dot">não existe</span>
        </h1>
        <p className="v-lead" style={{ marginTop: 16, color: "var(--v-on-light-soft)" }}>
          Talvez você esteja procurando uma destas.
        </p>

        <ul className="v-cards">
          {MENU.filter((m) => m.href !== ROUTES.home).map((m) => (
            <li className="v-card" key={m.href}>
              <Link className="v-card__t" href={m.href}>
                {m.rotulo}
              </Link>
            </li>
          ))}
          {AREAS.map((a) => (
            <li className="v-card" key={a.slug}>
              <Link className="v-card__t" href={a.href}>
                {a.numero} · {a.nome}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 28 }}>
          <Botao href={ROUTES.home}>Voltar ao início</Botao>
        </div>
      </div>
    </section>
  );
}
