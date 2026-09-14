import Link from "next/link";
import { AREAS } from "@/lib/areas";
import { CONTATO, MARCA, ROUTES } from "@/lib/config";
import { INSTAGRAM } from "@/lib/instagram";

/** Rodapé + seção de contato (é para onde o CTA cai enquanto não há WhatsApp). */
export function Footer() {
  const temContato = Boolean(CONTATO.whatsapp || CONTATO.telefone || CONTATO.email);

  return (
    <footer className="v-footer" id="contato">
      <div className="v-wrap">
        <div className="v-footer__grid">
          <div>
            <p className="v-eyebrow">{MARCA.posicionamento}</p>
            <h2 className="v-display v-h3" style={{ marginTop: 14 }}>
              Fale com a nossa
              <br />
              equipe técnica<span style={{ color: "var(--v-red)" }}>.</span>
            </h2>
            <p className="v-body" style={{ marginTop: 14, maxWidth: "42ch" }}>
              Conte o que está acontecendo no seu edifício. A gente avalia e
              devolve um caminho técnico claro.
            </p>
          </div>

          <div>
            <p className="v-footer__label">Áreas</p>
            <ul className="v-footer__list">
              {AREAS.map((a) => (
                <li key={a.slug}>
                  <Link href={a.href}>
                    {a.numero} · {a.cardTitulo.filter(Boolean).join(" ")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="v-footer__label">Contato</p>
            <ul className="v-footer__list">
              {CONTATO.telefone ? (
                <li>
                  <a href={`tel:${CONTATO.telefone.replace(/\D/g, "")}`}>
                    {CONTATO.telefone}
                  </a>
                </li>
              ) : null}
              {CONTATO.whatsapp ? (
                <li>
                  <a
                    href={`https://wa.me/${CONTATO.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
                <li className="v-vazio" style={{ minHeight: 0, display: "block" }}>
                  <span className="v-vazio__tag">A preencher</span>
                  <span className="v-vazio__txt" style={{ display: "block", marginTop: 6 }}>
                    Telefone, WhatsApp, e-mail e Instagram da VIVA — definir nas
                    variáveis de ambiente (ver README).
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>

      <p className="v-footer__frase">{MARCA.frase}</p>

      <div className="v-wrap" style={{ paddingBlock: 18 }}>
        <p
          style={{
            fontSize: 13,
            color: "var(--v-on-dark-faint)",
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <span>
            © {new Date().getFullYear()} {MARCA.nome}
          </span>
          <Link href={ROUTES.home}>Portfólio</Link>
        </p>
      </div>
    </footer>
  );
}
