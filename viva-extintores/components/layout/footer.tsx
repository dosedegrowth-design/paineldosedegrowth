import Link from "next/link";
import { AREAS } from "@/lib/areas";
import { CONTATO, MARCA, MENU, ROUTES } from "@/lib/config";
import { INSTAGRAM } from "@/lib/instagram";

export function Footer() {
  const temContato = Boolean(CONTATO.whatsapp || CONTATO.telefone || CONTATO.email);

  return (
    <footer className="v-footer">
      <div className="v-wrap">
        <div className="v-footer__grid">
          <div>
            <p className="v-eyebrow">{MARCA.posicionamento}</p>
            <h2 className="v-display v-h3" style={{ marginTop: 14 }}>
              Fale com a nossa
              <br />
              <span className="v-dot">equipe técnica</span>
            </h2>
            <p className="v-body" style={{ marginTop: 14, maxWidth: "40ch", color: "var(--v-on-dark-soft)" }}>
              Conte o que está acontecendo na sua edificação. A gente avalia e
              devolve um caminho técnico claro.
            </p>
          </div>

          <div>
            <p className="v-footer__label">Portfólio</p>
            <ul className="v-footer__list">
              {AREAS.map((a) => (
                <li key={a.slug}>
                  <Link href={a.href}>
                    {a.numero} · {a.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="v-footer__label">Site</p>
            <ul className="v-footer__list">
              {MENU.map((m) => (
                <li key={m.href}>
                  <Link href={m.href}>{m.rotulo}</Link>
                </li>
              ))}
            </ul>

            <p className="v-footer__label" style={{ marginTop: 24 }}>
              Contato
            </p>
            <ul className="v-footer__list">
              {CONTATO.telefone ? (
                <li>
                  <a href={`tel:${CONTATO.telefone.replace(/\D/g, "")}`}>{CONTATO.telefone}</a>
                </li>
              ) : null}
              {CONTATO.whatsapp ? (
                <li>
                  <a href={`https://wa.me/${CONTATO.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {CONTATO.email ? (
                <li>
                  <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
                </li>
              ) : null}
              {INSTAGRAM.url ? (
                <li>
                  <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer">
                    Instagram {INSTAGRAM.handle}
                  </a>
                </li>
              ) : null}
              {!temContato ? (
                <li>
                  <span className="v-vazio">
                    <span className="v-vazio__tag">A preencher</span>
                    <span className="v-vazio__txt">
                      Telefone, WhatsApp, e-mail e Instagram da VIVA — definir nas
                      variáveis de ambiente (ver README).
                    </span>
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>

      <div className="v-wrap">
        <div className="v-footer__base">
          <span>
            © {new Date().getFullYear()} {MARCA.nome} · {MARCA.assinatura}
          </span>
          <Link href={ROUTES.portfolio}>Portfólio</Link>
        </div>
      </div>
    </footer>
  );
}
