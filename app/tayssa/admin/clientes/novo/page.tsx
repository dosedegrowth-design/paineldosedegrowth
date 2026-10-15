import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { PASSWORD_TOKEN_DAYS, ROUTES } from "@/lib/tayssa/config";
import { AdminHeader } from "@/components/tayssa/admin/shell";
import { ClientCreateForm } from "@/components/tayssa/admin/forms";
import { TransitionLink } from "@/components/tayssa/ui/transition";

export default async function NewClientPage() {
  await requireAdminPage();
  return (
    <>
      <AdminHeader
        eyebrow="Clientes"
        title={
          <>
            Nova <em>cliente</em>
          </>
        }
        lead="Você cria a conta; ela recebe um link único para escolher a senha. Nenhuma senha é exibida aqui."
        actions={
          <TransitionLink href={ROUTES.adminClients} className="tya-btn tya-btn--ghost">
            Voltar para a lista
          </TransitionLink>
        }
      />

      <div className="tya-cols tya-cols--2">
        <section className="tya-card tya-up">
          <div className="tya-head">
            <h2>Dados da cliente</h2>
          </div>
          <ClientCreateForm />
        </section>

        <aside className="tya-card tya-up">
          <div className="tya-head">
            <h2>Como ela entra</h2>
          </div>
          <ol className="tya-list" style={{ display: "grid", gap: 14, counterReset: "passo" }}>
            <li className="tya-row" style={{ alignItems: "flex-start" }}>
              <div>
                <span className="tya-eyebrow">Primeiro</span>
                <p className="tya-small" style={{ marginTop: 4 }}>
                  Ao salvar, o painel gera um link de primeiro acesso de uso único, válido por {PASSWORD_TOKEN_DAYS} dias.
                </p>
              </div>
            </li>
            <li className="tya-row" style={{ alignItems: "flex-start" }}>
              <div>
                <span className="tya-eyebrow">Depois</span>
                <p className="tya-small" style={{ marginTop: 4 }}>
                  Você envia o link pelo WhatsApp (com um toque) ou copia e manda do seu jeito.
                </p>
              </div>
            </li>
            <li className="tya-row" style={{ alignItems: "flex-start" }}>
              <div>
                <span className="tya-eyebrow">Por fim</span>
                <p className="tya-small" style={{ marginTop: 4 }}>
                  Ela abre o link e escolhe a própria senha. Você nunca vê nem digita a senha dela.
                </p>
              </div>
            </li>
          </ol>
          <p className="tya-quote">
            O acesso VIP é uma escolha sua: marque na hora de criar, ou depois, na ficha dela.
          </p>
        </aside>
      </div>
    </>
  );
}
