import Link from "next/link";
import { TomDoSite } from "@/components/tayssa/vip/tom-do-site";
import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { ROUTES } from "@/lib/tayssa/config";
import { getAppointments, getAvailability } from "@/lib/tayssa/queries/vip";
import { getSettings } from "@/lib/tayssa/settings";
import { nowInBusinessTz, plural } from "@/lib/tayssa/format";
import { appointmentEnded, taxaDoHorario } from "@/lib/tayssa/rules";
import { ehManutencao, manutencaoComVolume, valorLegivel } from "@/lib/tayssa/agendar";
import { BookingFlow } from "@/components/tayssa/vip/booking-flow";
import { AppointmentList } from "@/components/tayssa/vip/appointment-list";
import { AbasDaAgenda, type AbaDaAgenda } from "@/components/tayssa/vip/abas-agenda";
import { ListaRealizados } from "@/components/tayssa/vip/realizados";

const ABAS: AbaDaAgenda[] = ["realizados", "aberto", "marcar"];

/**
 * Meus agendamentos (Lucas, 05/11/2026): o topo com o nome dela e, logo
 * embaixo, três abas: Realizados (riscados, o que já foi feito), Em aberto
 * (o que vem por aí, com o sinal) e Marcar. Sem horário marcado, abre em
 * "Marcar"; com, em "Em aberto". `?aba=` abre direto numa delas.
 */
export default async function BookPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const user = await requireClientPage();
  // prioridade VIP: a VIP vê o fim de ano guardado para ela; as demais, o aviso de quando abre
  const [{ days, services, aviso }, appointments, settings, params] = await Promise.all([
    getAvailability(user.isVip ? "vip" : "cliente"),
    getAppointments(user.id),
    getSettings(),
    searchParams,
  ]);
  const max = settings.booking.max_open_per_client;
  const full = appointments.upcoming.length >= max;
  // o pedido segura o horário esperando o comprovante do Pix; com a chave no painel, o site mostra o copia e cola
  const b = settings.booking;
  const sinal = {
    telefone: settings.business.whatsapp,
    valor: b.deposit_reais,
    horas: b.sinal_horas,
    nome: user.displayName,
    tolerancia: b.tolerancia_min,
    pix: b.pix_chave ? { chave: b.pix_chave, nome: b.pix_nome, cidade: b.pix_cidade, banco: b.pix_banco } : null,
  };
  // onde é o atendimento: só aparece no horário confirmado (o site aberto mostra só o bairro)
  const local = { endereco: b.local_endereco, sala: b.local_sala, interfone: b.local_interfone };
  // dezembro: a taxa de horário especial de cada pedido em aberto (vai no cartão e na mensagem do sinal)
  const taxas = Object.fromEntries(
    appointments.upcoming.map((a) => [a.id, taxaDoHorario(b, a.scheduled_date, a.scheduled_time)]),
  );
  // realizado: o que a Tayssa fechou como feito, e o confirmado que já passou (ela ainda não fechou)
  const agora = nowInBusinessTz();
  const feitos = appointments.past.filter(
    (a) => a.status === "done" || (a.status === "confirmed" && appointmentEnded(a, agora)),
  );
  const outros = appointments.past.filter((a) => !feitos.includes(a));
  const pedida = ABAS.find((a) => a === params.aba);
  const inicial: AbaDaAgenda = pedida ?? (appointments.upcoming.length ? "aberto" : "marcar");

  return (
    <>
      {/* a agenda e a conta ficam na paleta do site (vip-site.css), sem o dourado do VIP */}
      <TomDoSite />
      <h1 className="tyv-hello">
        {user.displayName}, <em>seus agendamentos</em>.
      </h1>
      <p className="tyv-sub">
        O horário fica guardado por {sinal.horas}h e vale depois do sinal no Pix, com o comprovante anexado.
        {sinal.tolerancia > 0 ? ` Tolerância de ${sinal.tolerancia} minutos de atraso: passando disso, você perde o sinal.` : ""}
      </p>

      <AbasDaAgenda
        inicial={inicial}
        contagem={{ realizados: feitos.length, aberto: appointments.upcoming.length }}
        realizados={<ListaRealizados feitos={feitos} outros={outros} />}
        aberto={
          appointments.upcoming.length ? (
            <>
              <p className="tyv-abas__nota">
                Até {max} em aberto. Para trocar de horário, desmarque e marque outro.
              </p>
              <div className="tyv-panel">
                <AppointmentList items={appointments.upcoming} sinal={sinal} local={local} taxas={taxas} />
              </div>
            </>
          ) : (
            <div className="tyv-panel tyv-abas__vazio">
              <p className="tyv-empty">Você não tem horário marcado.</p>
              <Link href={`${ROUTES.vipBook}?aba=marcar`} className="tyv-btn tyv-btn--accent">
                Marcar um horário
              </Link>
            </div>
          )
        }
        marcar={
          <>
          {aviso ? <p className="tyv-abas__nota tyv-abas__nota--vip">{aviso}</p> : null}
          <BookingFlow
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              point_value: s.point_value,
              // a manutenção do Fox eyes custa mais: a manutenção é "a partir de"
              precoLabel: valorLegivel(
                s.preco != null ? Number(s.preco) : null,
                ehManutencao(s.slug, s.name)
                  ? services.map((v) => (v.preco_manutencao != null ? Number(v.preco_manutencao) : null))
                  : [],
                // manutenção de um volume (Mega Fox…): o valor é o de partida
                manutencaoComVolume(s.name),
              ),
              duracao: s.duration_min ?? settings.booking.default_duration_min,
            }))}
            days={days.map((d) => ({ iso: d.iso, slots: d.slots }))}
            atLimit={full}
            sinal={sinal}
            limitMessage={`Você já tem ${appointments.upcoming.length} ${plural(appointments.upcoming.length, "horário marcado", "horários marcados")}. Desmarque um em "Em aberto" para escolher outro.`}
          />
          </>
        }
      />
    </>
  );
}
