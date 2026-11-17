/**
 * Manual do painel (pedido da Tayssa, 16/11/2026): um documento só, por
 * categorias, passo a passo, em linguagem simples, dentro do painel.
 *
 * REGRA: mudou o painel, muda o manual no mesmo commit (o tópico, o print
 * se a tela mudou e `MANUAL_ATUALIZADO_EM`). Os prints saem do painel local
 * com dados falsos (`docs/tayssa/manual-prints.mjs`) e o PDF para o grupo,
 * desta mesma página (`docs/tayssa/manual-pdf.mjs`).
 *
 * `*assim*` vira negrito: nome de botão, de menu ou de campo, escrito
 * exatamente como aparece na tela. Sem travessão (texto de cliente).
 */
import type { IconeNome } from "@/components/tayssa/admin/icons";

export const MANUAL_ATUALIZADO_EM = "2026-11-17";

export type ImagemDoManual = {
  src: string;
  alt: string;
  largura: number;
  altura: number;
  legenda?: string;
  /** print do computador (ocupa a largura toda); sem isso, print do celular */
  larga?: boolean;
};

import { type LadoDoManual } from "./manual-lados.ts";

export { LADOS, type LadoDoManual } from "./manual-lados.ts";

export type TopicoDoManual = {
  id: string;
  titulo: string;
  /** quando foge do lado da categoria (ex.: no painel, um tópico que explica o que a cliente faz) */
  lado?: LadoDoManual;
  /** o caminho até a tela: ["Agenda", "Pedidos de horário"] */
  onde?: string[];
  texto?: string;
  passos?: string[];
  dica?: string;
  imagem?: ImagemDoManual;
};

export type CategoriaDoManual = {
  letra: string;
  lado: "painel" | "cliente";
  id: string;
  titulo: string;
  resumo: string;
  icone: IconeNome;
  topicos: TopicoDoManual[];
};

/** O lado de um tópico: o dele, se tiver; senão, o da categoria. */
export function ladoDoTopico(t: TopicoDoManual, c: CategoriaDoManual): LadoDoManual {
  return t.lado ?? c.lado;
}

/** O texto que a busca "O que você quer fazer?" procura (sem as marcas de negrito). */
export function textoDaBusca(t: TopicoDoManual): string {
  return [t.titulo, ...(t.onde ?? []), t.texto, ...(t.passos ?? []), t.dica]
    .filter(Boolean)
    .join(" ")
    .replace(/\*/g, "");
}

export const MANUAL: CategoriaDoManual[] = [
  {
    letra: "A",
    lado: "painel",
    id: "acesso",
    titulo: "Acesso e navegação",
    resumo: "Entrar no painel, usar o menu, buscar uma tela e voltar ao início.",
    icone: "visao",
    topicos: [
      {
        id: "entrar",
        titulo: "Entrar no painel",
        onde: ["tayssafarias.com.br/admin"],
        passos: [
          "Abra *tayssafarias.com.br/admin* no navegador do celular ou do computador.",
          "Em *WhatsApp ou e-mail*, digite o e-mail do painel; em *Senha*, a sua senha. Toque em *Entrar*.",
          "O painel abre na *Visão geral*. Ele fica aberto neste aparelho até você tocar em *Sair*.",
        ],
        dica: "No iPhone, adicione o painel à Tela de Início: no Safari, toque em Compartilhar e em *Adicionar à Tela de Início*. Ele vira um app no celular, e é por ele que os avisos funcionam no iPhone.",
      },
      {
        id: "menu",
        titulo: "Usar o menu",
        texto:
          "No computador, o menu fica à esquerda, em quatro grupos: *Atendimento* (Visão geral, Agenda, Atendimentos realizados, Clientes, Financeiro, Relatórios), *Relacionamento* (Indicações, Benefícios, Aniversários), *Marca* (Mídia) e *Ajustes* (Configurações, Manual do painel). No celular, a barra de atalhos no alto tem *Início*, *Agenda*, *Clientes*, *Financeiro* e *Mais*; o *Mais* abre o menu inteiro.",
        dica: "Um número ao lado de um item do menu quer dizer que tem coisa esperando você ali: pedido de horário, cliente nova, atendimento ou benefício para conferir. No celular, o número no *Mais* avisa o que espera dentro do menu (benefícios, indicações).",
        imagem: {
          src: "/tayssa/manual/menu.webp",
          alt: "Menu do painel aberto no celular, com Atendimento, Relacionamento, Marca e Ajustes",
          largura: 780,
          altura: 1500,
          legenda: "No celular, o Mais abre o menu inteiro.",
        },
      },
      {
        id: "inicio",
        titulo: "Voltar para o início",
        passos: [
          "Toque em *Visão geral* no menu (no celular, em *Início* na barra de atalhos no alto).",
          "Ou toque no nome *Tayssa Farias* no alto do menu.",
        ],
      },
      {
        id: "buscar",
        titulo: "Achar uma tela ou uma ação rápido",
        onde: ["Topo", "Buscar página ou ação…"],
        passos: [
          "Toque em *Buscar página ou ação…* no alto (no computador, aperte ⌘K no Mac ou Ctrl+K no Windows).",
          "Digite o nome da tela ou do que quer fazer: agenda, mídia, nova cliente, adicionar foto…",
          "Toque no resultado.",
        ],
        dica: "Essa busca acha telas e ações. Para achar uma cliente pelo nome ou telefone, use a busca da tela *Clientes*.",
        imagem: {
          src: "/tayssa/manual/busca.webp",
          alt: "Busca do painel aberta com a palavra agen e o resultado Agenda",
          largura: 780,
          altura: 600,
          legenda: "A busca do topo acha telas e ações.",
        },
      },
      {
        id: "topo",
        titulo: "Os botões do topo: Manual, Ver o site e Sair",
        texto:
          "*Manual* abre este manual. *Ver o site* abre o site como a cliente vê, em outra aba (o painel continua aberto na aba dele). *Sair* fecha o painel neste aparelho e volta para a tela de entrar. No celular, Manual e Ver o site aparecem só com o ícone (o livro e o globo).",
        imagem: {
          src: "/tayssa/manual/topo.webp",
          alt: "Botões Manual, Ver o site e Sair no alto do painel",
          largura: 1300,
          altura: 128,
          legenda: "No alto, à direita: Manual, Ver o site e Sair.",
          larga: true,
        },
      },
    ],
  },
  {
    letra: "B",
    lado: "painel",
    id: "servicos",
    titulo: "Serviços",
    resumo: "Criar e editar serviços, valor, tempo, manutenção, pontos, capa e tirar do site.",
    icone: "cilio",
    topicos: [
      {
        id: "editar-servico",
        titulo: "Mudar o valor, o tempo ou os pontos de um serviço",
        onde: ["Configurações", "Serviços e pontos"],
        passos: [
          "Abra *Configurações* e vá em *Serviços e pontos*.",
          "Ache o serviço e mude o que precisar: *Valor (R$)*, *Tempo* (escreva como fala: 3h, 1h30, 40 min), *Pontos*, *Descrição*.",
          "Toque em *Salvar* embaixo daquele serviço. Pronto: o site e a agenda já usam o valor novo.",
        ],
        dica: "O *Tempo* é o que o serviço ocupa na agenda. Um volume de 3h às 9h segura 9h, 10h e 11h, e esses horários somem para as outras clientes.",
      },
      {
        id: "manutencao",
        titulo: "O campo “Valor da manutenção deste volume”",
        onde: ["Configurações", "Serviços e pontos"],
        texto:
          "Só serve para os volumes de cílios (brasileiro, inglês, egípcio, Fox eyes…). É o preço de quando a cliente volta para a *manutenção* daquele volume, diferente do *Valor (R$)* de cima, que é o da aplicação. No site, aparece como “Manutenção” e é o valor cobrado quando ela marca *Manutenção de cílios* e escolhe este volume.",
        passos: [
          "Nos volumes de cílios: preencha com o valor da manutenção (ex.: Volume brasileiro, Valor R$ 170 e manutenção R$ 120).",
          "Nos outros serviços (design, lash lifting, lábios…): deixe vazio.",
          "Vazio num volume: ele não aparece na pergunta “de qual volume é a sua manutenção?”.",
        ],
        imagem: {
          src: "/tayssa/manual/servico.webp",
          alt: "Formulário do Volume brasileiro com Valor 170 e Valor da manutenção deste volume 120",
          largura: 664,
          altura: 1844,
          legenda: "O valor da aplicação em cima; o da manutenção embaixo, com a explicação.",
        },
      },
      {
        id: "novo-servico",
        titulo: "Criar um serviço novo",
        onde: ["Configurações", "Serviços e pontos", "Novo serviço"],
        passos: [
          "Em *Serviços e pontos*, desça até o último formulário, *Novo serviço*.",
          "Preencha *Serviço* (o nome), *Descrição*, *Valor (R$)*, *Tempo* e *Pontos*.",
          "Toque em *Adicionar serviço*. Ele já aparece no site e na agenda.",
        ],
        dica: "A *Ordem* decide a posição do serviço na lista do site: número menor aparece antes.",
      },
      {
        id: "desativar-servico",
        titulo: "Tirar um serviço do site (e voltar depois)",
        onde: ["Configurações", "Serviços e pontos"],
        passos: [
          "Ache o serviço e desmarque *Ativo*.",
          "Toque em *Salvar*. Ele sai do site e da agenda, mas o histórico de quem já fez continua.",
          "Para voltar, marque *Ativo* de novo e salve.",
        ],
        dica: "Não existe apagar serviço, de propósito: assim nenhum atendimento antigo perde o nome nem os pontos.",
      },
      {
        id: "capa",
        titulo: "Trocar a foto de capa de um serviço",
        onde: ["Mídia", "Capas"],
        passos: [
          "Abra *Mídia* e a aba *Capas*.",
          "No serviço, toque em *Escolher capa* (ou *Trocar capa*).",
          "Escolha a foto (as do serviço vêm primeiro; *Ver outras fotos da galeria* mostra todas), arraste para enquadrar e toque em *Salvar capa*.",
        ],
        dica: "*Voltar para a automática* devolve a capa que o site escolhe sozinho.",
      },
    ],
  },
  {
    letra: "C",
    lado: "painel",
    id: "agenda",
    titulo: "Agenda e agendamentos",
    resumo: "Ver a semana, conferir pedidos e comprovantes, confirmar, remarcar, cancelar e abrir novos dias.",
    icone: "agenda",
    topicos: [
      {
        id: "como-chega",
        lado: "ambos",
        titulo: "Como um horário chega até você",
        texto:
          "A cliente escolhe o serviço, o dia e a hora no site, cria a conta (ou entra) e o pedido aparece na sua *Agenda* como *Aguardando sinal*. Ela paga o sinal no Pix e anexa o comprovante no site: o pedido vira *Comprovante enviado* e sobe para o topo da lista. Pedido sem comprovante cai sozinho depois de 24 horas e o horário volta para a agenda; pedido com comprovante nunca cai sozinho, espera você.",
      },
      {
        id: "varios-servicos",
        lado: "ambos",
        titulo: "Pedido com mais de um serviço",
        texto:
          "A cliente pode marcar vários serviços no mesmo horário, um depois do outro (ex.: Manutenção de cílios + Design de sobrancelhas). Chega *um pedido só*, com os nomes juntos, o tempo somado (a agenda segura o tempo todo) e *um sinal só*. Você confirma uma vez e, no fim, marca *Realizado* uma vez: os pontos de todos os serviços entram juntos, num atendimento e num carimbo do cartão.",
        imagem: {
          src: "/tayssa/manual/folha-varios.webp",
          alt: "Folha de agendar do site com dois serviços escolhidos, o total e o botão Adicionar outro serviço",
          largura: 780,
          altura: 1500,
          legenda: "O que a cliente vê no site: dois serviços, o total e um sinal só.",
        },
      },
      {
        id: "confirmar",
        titulo: "Conferir o comprovante e confirmar",
        onde: ["Agenda", "Pedidos de horário"],
        passos: [
          "Abra *Agenda*. Em *Pedidos de horário*, quem já mandou o comprovante vem primeiro.",
          "Toque em *Ver comprovante* e confira no app do banco se o Pix caiu.",
          "Toque em *Confirmar*. Se quiser, escreva um recado para ela (ele vai na mensagem) e toque em *Confirmar* de novo.",
          "Abre a mensagem pronta para a cliente: toque em *Abrir a conversa no WhatsApp* e envie (ou *Copiar mensagem*).",
        ],
        dica: "Fechou sem mandar? Todo horário confirmado tem *Mensagem de confirmação* para abrir a mensagem de novo.",
        imagem: {
          src: "/tayssa/manual/pedido.webp",
          alt: "Pedido de teste com comprovante enviado, Ver comprovante, Confirmar e Recusar",
          largura: 664,
          altura: 636,
          legenda: "Pedido com comprovante: confira e toque em Confirmar.",
        },
      },
      {
        id: "pedir-sinal",
        titulo: "Cobrar o sinal de quem ainda não pagou",
        onde: ["Agenda", "Pedidos de horário"],
        passos: [
          "No pedido *Aguardando sinal*, toque em *Pedir o sinal no WhatsApp*.",
          "A conversa dela abre com a mensagem pronta: o horário, o valor do sinal e o Pix copia e cola. É só enviar.",
        ],
      },
      {
        id: "ver-agenda",
        titulo: "Ver a agenda: dia, semana e mês",
        onde: ["Agenda"],
        passos: [
          "Abra *Agenda*. No alto, escolha *Dia*, *Semana* ou *Mês* (o painel lembra a última que você usou neste aparelho).",
          "*Dia*: a linha do tempo com cada horário, os livres (“Livre · tocar para marcar”) e os fechados. A fita com os dias da semana leva a outro dia com um toque.",
          "*Semana*: um cartão por dia, com os agendamentos e quantos horários estão livres. *Mês*: o calendário com um pontinho por horário; toque no dia para abrir.",
          "As setas mudam de dia, semana ou mês; *Hoje* volta para hoje; o calendário ao lado leva a qualquer data.",
        ],
        dica: "As cores: dourado é *Agendado* (pedido esperando o sinal), vinho é *Confirmado*, rosa cheio é *Em atendimento* (está acontecendo agora), verde é *Concluído*, cinza riscado é *Cancelado* e vermelho é *Não compareceu*.",
        imagem: {
          src: "/tayssa/manual/agenda-dia.webp",
          alt: "Agenda do dia no celular com a fita da semana, horários livres e um agendamento",
          largura: 780,
          altura: 1500,
          legenda: "O dia: livres para tocar e marcar, e cada agendamento na sua cor.",
        },
      },
      {
        id: "marcar",
        titulo: "Marcar um horário pela agenda",
        onde: ["Agenda", "Novo agendamento"],
        passos: [
          "Toque num horário *Livre* e em *Marcar um horário aqui* (ou em *Novo agendamento* no alto).",
          "Em *Cliente*, escreva o nome ou o WhatsApp e toque nela. Cliente nova? Toque em *+ Cliente nova* e preencha nome e WhatsApp.",
          "Escolha o serviço (pode mais de um), confira *Data* e *Horário* (os horários livres aparecem embaixo) e, se precisar, a *Duração*, o *Valor* e a *Forma de pagamento*.",
          "Toque em *Marcar horário*. Marcado por você, o horário já entra *Confirmado*.",
        ],
        dica: "Duração e valor vazios usam a soma dos serviços. Se o WhatsApp digitado já é de uma cliente, o painel avisa e usa o cadastro dela (nada de cadastro duplicado). Se o horário cruzar com outro, o painel avisa e não marca.",
        imagem: {
          src: "/tayssa/manual/novo-agendamento.webp",
          alt: "Formulário Novo agendamento com a cliente escolhida, os serviços, a data e os horários livres",
          largura: 780,
          altura: 1500,
          legenda: "Novo agendamento: cliente, serviço, dia e horário.",
        },
      },
      {
        id: "detalhes",
        titulo: "Ver um agendamento e o que dá para fazer",
        onde: ["Agenda", "o agendamento"],
        passos: [
          "Toque no agendamento: abre quando, serviço, valor, sinal, observações, o WhatsApp dela e *Ver ficha*.",
          "Embaixo ficam só as ações que valem agora: *Confirmar* (pedido), *Editar ou reagendar*, *Mensagem de confirmação*, *Cancelar* ou *Recusar*; depois do horário, *Realizado* e *Não compareceu*.",
        ],
        imagem: {
          src: "/tayssa/manual/detalhes.webp",
          alt: "Detalhes de um agendamento confirmado com as ações Realizado, Editar ou reagendar, Não compareceu e Cancelar",
          largura: 780,
          altura: 1500,
          legenda: "Os detalhes e as ações do agendamento.",
        },
      },
      {
        id: "fechar-atendimento",
        titulo: "Depois do atendimento: Realizado (com o pagamento) ou Não compareceu",
        onde: ["Agenda", "o agendamento", "Realizado"],
        passos: [
          "Passado o horário, toque no agendamento e em *Realizado* (nos dias seguintes ele também fica em *Para fechar*).",
          "Confira o *Valor cobrado* e a *Forma de pagamento*. Se ela pagou o sinal, o painel já conta os R$ 50 no Pix.",
          "Em *O restante*, escolha *Recebi agora* ou *Fica pendente* e toque em *Confirmar realizado*.",
          "Pronto: entra em Atendimentos realizados e no Financeiro, com os pontos, o carimbo do cartão e a divisão Tayssa/Larissa.",
        ],
        dica: "*Não compareceu* não soma nada (nem ponto, nem faturamento). O que ficou pendente você marca como pago depois, em *Atendimentos realizados*.",
        imagem: {
          src: "/tayssa/manual/realizado.webp",
          alt: "Formulário Realizado com o valor cobrado, a forma de pagamento e Recebi agora ou Fica pendente",
          largura: 780,
          altura: 1500,
          legenda: "Realizado: o valor, a forma e se recebeu agora.",
        },
      },
      {
        id: "corrigir-data",
        titulo: "Reagendar, editar ou corrigir a data",
        onde: ["Agenda", "o agendamento", "Editar ou reagendar"],
        passos: [
          "Horário em aberto: toque no agendamento e em *Editar ou reagendar*. Mude dia, hora, serviço, duração, valor, forma ou observação e toque em *Salvar alterações*.",
          "Já realizado com o dia errado: toque em *Corrigir data*, escolha o *Dia certo* e toque em *Gravar a data*.",
          "É o mesmo agendamento que muda de lugar: a cliente e o comprovante continuam. Se o horário novo cruzar com outra cliente, o painel avisa.",
        ],
        dica: "Atendimento que entrou com o dia errado no passado (ex.: marcado para dezembro, mas feito antes): corrija a data para o dia em que ela veio. Ele vai para *Para fechar*, e aí é só tocar em *Realizado*.",
        imagem: {
          src: "/tayssa/manual/corrigir-data.webp",
          alt: "Corrigir data aberto num pedido, com Dia certo, Hora e Gravar a data",
          largura: 664,
          altura: 1116,
          legenda: "Corrigir data: o dia certo, a hora e Gravar a data.",
        },
      },
      {
        id: "corrigir-data-ficha",
        titulo: "Corrigir a data de um atendimento já realizado",
        onde: ["Clientes", "a ficha", "Atendimentos"],
        passos: [
          "Abra a ficha da cliente e desça até *Atendimentos*.",
          "Na linha do atendimento, toque em *Corrigir data*, escolha o *Dia certo* e toque em *Gravar a data*.",
          "O histórico, a sequência do VIP e os meses seguidos passam a contar com o dia certo. Nada é duplicado.",
        ],
      },
      {
        id: "cancelar",
        titulo: "Cancelar ou recusar um horário",
        onde: ["Agenda"],
        passos: [
          "Pedido novo: *Recusar*. Horário confirmado: *Cancelar*.",
          "Escreva o motivo (ela vê) e toque em *Confirmar*. O horário volta a ficar livre.",
        ],
      },
      {
        id: "fechar-horario",
        titulo: "Fechar um horário ou dias (folga, compromisso)",
        onde: ["Agenda", "Dia"],
        passos: [
          "No *Dia*, toque num horário *Livre* e em *Fechar este horário (a cliente não marca)*. Para abrir de novo, toque no *Fechado* e em *Abrir este horário*.",
          "Dia inteiro (folga, viagem): feche os horários do dia, ou tire o dia em *Configurações* › *Agenda* › *Dias e horários*.",
        ],
        dica: "Fechado aparece riscado para a cliente: ela vê, mas não consegue marcar. Você ainda pode marcar nele pelo *Novo agendamento*.",
      },
      {
        id: "novos-dias",
        titulo: "Abrir novos dias e horários",
        onde: ["Agenda", "Editar disponibilidade"],
        passos: [
          "Na *Agenda*, toque em *Editar disponibilidade* (leva para *Configurações* › *Agenda*).",
          "Em *Dias e horários*, marque os dias em que atende e o primeiro e o último horário de cada um.",
          "Em *Dias à frente*, escolha até quantos dias a cliente enxerga (ex.: 60 mostra dois meses).",
          "Toque em *Salvar disponibilidade*.",
        ],
        dica: "*Prioridade VIP* deixa um período (ex.: dezembro) só para as VIPs até a data de *Abre para todas em*. Dezembro já está aberto para todas desde 16/11/2026.",
      },
      {
        id: "dezembro",
        lado: "ambos",
        titulo: "Dezembro: horário especial",
        texto:
          "Em dezembro a agenda abre das 7h às 21h de segunda a sábado e das 7h às 17h no domingo. O primeiro e o último horário de cada dia têm R$ 30 a mais. No dia 24, das 6h às 15h, todo horário tem R$ 30 a mais. Nos dias 25, 30 e 31 não tem atendimento. A taxa aparece para a cliente no site, na mensagem e no pedido, e é uma só por pedido (mesmo com vários serviços). Para mudar essas regras, fale com a DDG.",
      },
    ],
  },
  {
    letra: "D",
    lado: "painel",
    id: "clientes",
    titulo: "Clientes",
    resumo: "Achar uma cliente, ver o histórico, responder as novas, editar dados e acompanhar quem sumiu.",
    icone: "clientes",
    topicos: [
      {
        id: "achar",
        titulo: "Achar uma cliente",
        onde: ["Clientes"],
        passos: [
          "Abra *Clientes* e digite em *Buscar por nome, e-mail ou telefone* (pode ser sem acento e o telefone de qualquer jeito).",
          "Ou use os filtros: *Todas*, *Novas clientes*, *Da agenda*, *VIP*, *Prontas para VIP*, *Com pendência*, *Recorrentes* (3 atendimentos ou mais) e *Sem voltar há tempo*.",
          "Cada cliente mostra quantos atendimentos fez, o total gasto, o último atendimento e de quanto em quanto tempo ela volta.",
          "Toque no nome para abrir a ficha.",
        ],
      },
      {
        id: "ficha",
        titulo: "O que tem na ficha da cliente",
        onde: ["Clientes", "a ficha"],
        texto:
          "No alto, os números (pontos, atendimentos, indicações, benefícios, aniversário, pendências). Depois: *Quem é ela*, *Acesso e VIP*, *Pontos, marcos e VIP*, *Aniversário*, *Resumo do relacionamento* (atendimentos, primeira e última visita, frequência, total gasto, valores pagos, horários à frente, cancelados e faltas), *Atendimentos* (cada um com o pagamento), *Benefícios*, *Indicações feitas por ela*, *Dados* e o *Histórico de ações*. O botão *WhatsApp* no alto abre a conversa com ela.",
      },
      {
        id: "novas",
        titulo: "Cliente nova: Aprovar VIP ou Não aprovar",
        onde: ["Clientes", "Novas clientes"],
        passos: [
          "Quando alguém faz o cadastro no site, chega o aviso *Nova cliente* e ela aparece em *Novas clientes*. A conta dela já funciona: ela já marca horário.",
          "Abra a ficha. No alto, o cartão *Nova cliente* tem dois botões: *Aprovar VIP* (vira VIP) ou *Não aprovar* (continua cliente comum).",
          "Depois, toque em *Mandar saudação no WhatsApp*: a mensagem certa já vem pronta para cada caso.",
        ],
        dica: "Não aprovou agora? Ela ainda pode virar VIP pela sequência de atendimentos ou pelo *Incluir no VIP* da ficha.",
        imagem: {
          src: "/tayssa/manual/nova-cliente.webp",
          alt: "Ficha de uma cliente de teste com o cartão Nova cliente e os botões Aprovar VIP e Não aprovar",
          largura: 780,
          altura: 1688,
          legenda: "O cartão Nova cliente fica no alto da ficha.",
        },
      },
      {
        id: "nova-cliente",
        titulo: "Cadastrar uma cliente você mesma",
        onde: ["Clientes", "Nova cliente"],
        passos: [
          "Toque em *Nova cliente* (na Visão geral ou em Clientes).",
          "Preencha *Nome completo*, *WhatsApp* e o que souber (apelido, aniversário, notas só suas). Marque *Já liberar acesso VIP* se ela já for VIP.",
          "Toque em *Criar cliente e gerar link* e depois em *Enviar pelo WhatsApp*. Ela abre o link, cria a senha e entra.",
        ],
        dica: "O link vale uma vez, por 7 dias. Perdeu? Na ficha, em *Acesso e VIP*, toque em *Gerar link de acesso*.",
      },
      {
        id: "dados",
        titulo: "Atualizar os dados da cliente",
        onde: ["Clientes", "a ficha", "Dados"],
        passos: [
          "Na ficha, desça até *Dados*.",
          "Mude nome, apelido, e-mail, WhatsApp, aniversário ou *Notas internas* (só você vê).",
          "Toque em *Salvar*.",
        ],
      },
      {
        id: "registrar",
        titulo: "Registrar um atendimento que não passou pela agenda",
        onde: ["Clientes", "a ficha", "Atendimentos"],
        passos: [
          "Na ficha, em *Atendimentos*, vá em *Registrar atendimento confirmado*.",
          "Escolha o *Serviço* e a *Data* (hoje ou antes), o *Valor*, a *Forma de pagamento* e se foi *Recebido* ou fica *Pendente*. *Pontos* vazio usa os do serviço.",
          "Toque em *Registrar atendimento confirmado*: entra no histórico com os pontos e o carimbo.",
        ],
      },
      {
        id: "pendentes",
        titulo: "Atendimentos que a cliente registrou",
        onde: ["Atendimentos"],
        passos: [
          "Em *Atendimentos*, o bloco *Aguardando você* mostra o que as clientes registraram.",
          "*Confirmar* faz os pontos entrarem. *Não confirmar* pede o motivo (ela vê).",
        ],
      },
      {
        id: "inativas",
        titulo: "Clientes que sumiram (inativas)",
        onde: ["Clientes", "Inativas"],
        texto:
          "Quem passa um tempo sem atendimento *Realizado* aparece em *Clientes* › *Inativas* e na *Visão geral*, em “Clientes sem atendimento há…”. Lá, *Chamar* abre o WhatsApp dela com uma mensagem pronta. Quanto tempo conta como “sumida” você decide em *Configurações* › *VIP e regras gerais* › *Dias sem atendimento para virar inativa*.",
      },
      {
        id: "conta",
        titulo: "Suspender ou desativar uma conta",
        onde: ["Clientes", "a ficha", "Acesso e VIP"],
        passos: [
          "*Suspender conta*: ela perde o acesso até você reativar.",
          "*Desativar*: para quem não é mais cliente. *Reativar conta* volta.",
        ],
        dica: "Nada é apagado: o histórico dela fica guardado.",
      },
    ],
  },
  {
    letra: "E",
    lado: "painel",
    id: "mensagens",
    titulo: "Mensagens e avisos",
    resumo: "Ligar os avisos no celular, mandar as mensagens prontas e acompanhar as novidades.",
    icone: "aviso",
    topicos: [
      {
        id: "ligar-avisos",
        titulo: "Ligar os avisos no celular",
        onde: ["Agenda", "Avisos de novos pedidos"],
        passos: [
          "No iPhone, primeiro abra o painel pelo ícone da Tela de Início (veja “Entrar no painel”). No Android, use o Chrome.",
          "Abra *Agenda* e, no cartão *Avisos de novos pedidos*, toque em *Ligar avisos*.",
          "O celular pergunta se pode mandar notificações: toque em *Permitir*. Chega um aviso de teste em alguns segundos.",
        ],
        dica: "Chega aviso a cada horário marcado, comprovante enviado e cliente nova. Vale para cada aparelho: no outro celular, ligue lá também. *Mandar teste* confere se está funcionando.",
      },
      {
        id: "mensagens-prontas",
        titulo: "As mensagens prontas do WhatsApp",
        texto:
          "O painel não manda nada sozinho: ele monta a mensagem e abre a conversa da cliente no WhatsApp, e você só confere e envia. As principais: *Pedir o sinal no WhatsApp* (Agenda), a mensagem de confirmação (abre ao *Confirmar*), *Mandar saudação no WhatsApp* (cliente nova), *Avisar no WhatsApp* (quando você inclui no VIP), *Enviar pelo WhatsApp* (link de acesso) e *Chamar* (inativas).",
      },
      {
        id: "editar-mensagens",
        titulo: "Mudar os textos das mensagens",
        onde: ["Configurações", "Mensagens de WhatsApp"],
        passos: [
          "Em *Configurações* › *Mensagens de WhatsApp*, edite os textos de *Pelo site*, *Pelo espaço da cliente* e *Daqui do painel*.",
          "Toque em *Salvar mensagens*.",
        ],
      },
      {
        id: "novidades",
        titulo: "Ver o que chegou de novo",
        onde: ["Visão geral"],
        texto:
          "Na *Visão geral*, o alto diz quantas coisas esperam você. Os cartões levam direto a cada uma (novas clientes, horários a confirmar, benefícios a validar…). Em *Próximos horários* estão os próximos atendimentos por dia, e em *Últimos movimentos* o que aconteceu por último. Os números no menu mostram o mesmo.",
      },
    ],
  },
  {
    letra: "F",
    lado: "painel",
    id: "beneficios",
    titulo: "Benefícios, pontos e recorrência",
    resumo: "Como os pontos e o VIP funcionam, liberar presentes, corrigir pontos e as regras de tempo.",
    icone: "beneficios",
    topicos: [
      {
        id: "como-funciona",
        lado: "ambos",
        titulo: "Como funciona (o resumo)",
        texto:
          "Cada atendimento *Realizado* dá os pontos do serviço e um carimbo no cartão. O cartão cheio e os marcos de pontos geram presentes, mas *nada é liberado sozinho*: o sistema avisa e você valida. O VIP também é sempre decisão sua: o painel só mostra quem completou a sequência (em *Prontas para VIP*).",
      },
      {
        id: "liberar",
        titulo: "Liberar um benefício",
        onde: ["Benefícios"],
        passos: [
          "Abra *Benefícios*. No bloco *Elegíveis*, toque em *Validar e desbloquear* (pode escrever um recado e mudar a validade) ou *Não liberar*.",
          "Quando ela pedir para usar, ele aparece em *Solicitados*: toque em *Confirmar*.",
          "Depois que ela usar, toque em *Marcar utilizado*.",
        ],
      },
      {
        id: "corrigir-pontos",
        titulo: "Corrigir os pontos de uma cliente",
        onde: ["Clientes", "a ficha", "Pontos, marcos e VIP", "Corrigir pontos"],
        passos: [
          "Ex.: ela marcou manutenção, mas na hora fez aplicação. Abra a ficha e vá em *Corrigir pontos*.",
          "Toque em *Tirar pontos* e escolha o serviço que entrou errado (ex.: Manutenção). O painel mostra a conta: “Ela tem 95 pontos e fica com 0”. Toque em *Tirar 95 pontos*.",
          "Toque em *Adicionar pontos*, escolha o serviço certo (ex.: aplicação) e confirme.",
        ],
        dica: "Os pontos sempre saem do serviço, nunca um número solto. O motivo é opcional e só você vê. O saldo nunca fica negativo.",
        imagem: {
          src: "/tayssa/manual/corrigir-pontos.webp",
          alt: "Corrigir pontos com Tirar pontos, o serviço Manutenção de cílios e a conta antes de gravar",
          largura: 664,
          altura: 984,
          legenda: "O painel mostra a conta antes de gravar.",
        },
      },
      {
        id: "vip",
        titulo: "Quem vira VIP e como incluir",
        onde: ["Clientes", "Prontas para VIP"],
        passos: [
          "A regra fica em *Configurações* › *VIP e regras gerais*. Hoje: 4 atendimentos em até 70 dias, com 15 a 20 dias entre um e outro.",
          "Quem completa aparece em *Prontas para VIP* (Visão geral e Clientes).",
          "Abra a ficha e toque em *Incluir no VIP*. Depois, *Avisar no WhatsApp* manda a mensagem pronta para ela.",
        ],
      },
      {
        id: "intervalos",
        titulo: "“Entre um atendimento e outro”: no mínimo e no máximo",
        onde: ["Configurações", "VIP e regras gerais"],
        texto:
          "São as regras da sequência do VIP. *No mínimo (dias)*: o próximo atendimento só conta se vier pelo menos estes dias depois do anterior (com 15, quem volta em 10 dias não conta esse, mas não perde os que já tinha). *No máximo (dias)*: se ela passar destes dias sem voltar, a sequência começa de novo (com 20, quem volta em 25 dias recomeça do primeiro).",
      },
      {
        id: "inativa",
        titulo: "“Dias sem atendimento para virar inativa”",
        onde: ["Configurações", "VIP e regras gerais"],
        texto:
          "Quem passa estes dias sem um atendimento *Realizado* aparece como inativa (Clientes › *Inativas* e a lista na Visão geral), para você chamar. Com 30, quem não vem há um mês entra na lista. Não muda nada para a cliente.",
      },
      {
        id: "validade",
        titulo: "“Validade padrão de benefício (dias)”",
        onde: ["Configurações", "VIP e regras gerais"],
        texto:
          "Quanto tempo a cliente tem para usar um benefício depois que você libera, quando ele não tem validade própria. Com 60, o presente liberado hoje vale por 60 dias. Dá para mudar na hora de liberar.",
      },
      {
        id: "aniversario",
        titulo: "Presente de aniversário",
        onde: ["Aniversários"],
        passos: [
          "Abra *Aniversários* (o mês atual já vem escolhido; os botões jan a dez mudam o mês).",
          "Na cliente VIP, escreva o presente, a validade e toque em *Liberar benefício de aniversário*.",
          "*WhatsApp* abre a conversa para dar os parabéns.",
        ],
        dica: "Só VIP ganha o presente, e ele vale o mês inteiro do aniversário.",
      },
      {
        id: "indicacoes",
        titulo: "Indicações",
        onde: ["Indicações"],
        passos: [
          "Cada indicação anda: Em análise › Contato feito › Atendimento agendado › Atendimento realizado › Confirmada. Mude o passo no seletor da linha e toque em *Aplicar*.",
          "Quando a indicada fizer o atendimento, toque em *Confirmar indicação*: quem indicou ganha o benefício.",
        ],
        dica: "Indicação de quem já era cliente não vale. A mesma pessoa só conta uma vez.",
      },
    ],
  },
  {
    letra: "G",
    lado: "painel",
    id: "site",
    titulo: "Site e configurações gerais",
    resumo: "Ver o site, fotos e vídeos, Pix, endereço e as opções que mudam o que a cliente vê.",
    icone: "site",
    topicos: [
      {
        id: "ver-site",
        titulo: "Ver o site como a cliente vê",
        passos: ["Toque em *Ver o site* no alto (o globo, no celular). Abre em outra aba; o painel continua aberto."],
      },
      {
        id: "fotos",
        titulo: "Colocar fotos e vídeos no site",
        onde: ["Mídia"],
        passos: [
          "Em *Mídia* › *Galeria*, toque em *Escolher fotos e vídeos* (pode várias de uma vez; a foto sobe sem perder qualidade).",
          "Na foto, toque em *Publicar*: arraste para enquadrar, escolha a *Categoria* e o *Produto* e toque em *Publicar no rolo*.",
          "Para tirar do site, vá em *No site* e toque em *Tirar do site* (ela volta para a galeria).",
        ],
        dica: "*Baixar original* baixa a foto como você subiu. *Apagar* tira de vez, do site e da nuvem.",
      },
      {
        id: "pix",
        titulo: "A chave Pix do sinal",
        onde: ["Configurações", "Agenda", "Pix do sinal"],
        passos: [
          "Em *Configurações* › *Agenda* › *Pix do sinal*, confira *Chave Pix*, *Em nome de*, *Banco* e *Cidade da conta*.",
          "Toque em *Salvar disponibilidade*. O Pix copia e cola do site já sai com a chave nova.",
        ],
        dica: "O valor do sinal fica em *Sinal no Pix (R$)* e o prazo para pagar em *Prazo do sinal (horas)*, no mesmo lugar.",
      },
      {
        id: "endereco",
        titulo: "Endereço, sala e interfone",
        onde: ["Configurações", "Agenda", "Endereço do atendimento"],
        texto:
          "Preencha *Endereço*, *Sala* e *Interfone* e salve. Eles aparecem só para a cliente com horário confirmado (no site e na mensagem de confirmação). O site aberto mostra só o bairro.",
      },
      {
        id: "config-cliente",
        titulo: "Opções que mudam o que a cliente vê",
        onde: ["Configurações"],
        texto:
          "*Serviços e pontos* (valores e tempos do site), *Agenda* (dias, horários, sinal, tolerância de atraso, prioridade VIP), *Cartão de fidelidade*, *Aniversário* (as regras que ela lê), *Benefícios*, *Cadastro pelo site* (aberto ou fechado), *Mensagens de WhatsApp*, *Números do site* (a seção de números da home) e *VIP e regras gerais* (abrir ou fechar a área VIP e as regras da sequência). Cada bloco tem o próprio botão de salvar.",
      },
      {
        id: "cadastro",
        titulo: "Abrir ou fechar o cadastro pelo site",
        onde: ["Configurações", "Cadastro pelo site"],
        texto:
          "Com *Aceitar cadastro pelo site* marcado, quem chega pelo site cria a conta na hora e você recebe o aviso de cliente nova. Desmarcado, a página de cadastro VIP fecha (quem marca horário continua criando a conta na hora de agendar).",
      },
    ],
  },
  {
    letra: "H",
    lado: "painel",
    id: "relatorios",
    titulo: "Relatórios e visão geral",
    resumo: "A visão geral do dia, o relatório de qualquer período, o PDF e o link para a Larissa.",
    icone: "relatorios",
    topicos: [
      {
        id: "visao-geral",
        titulo: "A Visão geral",
        onde: ["Visão geral"],
        texto:
          "É a tela de abrir o dia. No alto, o cartão *Escolha a data* (*Hoje*, *Ontem*, *Esta semana*, *Este mês*, *Mês passado* ou *De* e *Até*): ele muda os dois cartões de baixo. Primeiro, *Atendimentos realizados*: quem você atendeu no período. Depois, o *Financeiro* do período: o faturamento total em destaque, os atendimentos realizados, o ticket médio, a *Parte da Tayssa* e a *Parte da Larissa*. Embaixo, os gráficos: *Faturamento por dia* (uma coluna por dia; toque numa coluna para ver o valor e quantos atendimentos teve), *Como entrou o dinheiro* (como as clientes pagaram no salão: Pix, dinheiro ou cartão), *Serviços mais feitos* e o *Repasse para a Tayssa* de cada quinzena, com a data. Depois, o que espera você, os *Próximos horários*, as *Novas clientes*, quem está *Pronta para VIP*, os aniversários, quem sumiu e os últimos movimentos.",
        imagem: {
          src: "/tayssa/manual/visao-geral.webp",
          alt: "Visão geral com o faturamento do mês em destaque e o gráfico de colunas do faturamento por dia",
          largura: 780,
          altura: 1500,
          legenda: "A Visão geral abre com o financeiro e os gráficos do período.",
        },
      },
      {
        id: "quem-atendi",
        titulo: "Ver quem você atendeu num dia ou período",
        onde: ["Visão geral", "Escolha a data"],
        passos: [
          "Abra a *Visão geral* (no celular, *Início*). No cartão *Escolha a data*, toque em *Hoje*, *Ontem*, *Esta semana*, *Este mês* ou *Mês passado*; as setas levam ao dia, à semana ou ao mês ao lado.",
          "Para outras datas, preencha *De* e *Até* e toque em *Ver o período* (um dia só: a mesma data nos dois).",
          "Logo embaixo, *Atendimentos realizados* mostra quem você atendeu, separado por dia: a hora, o nome (toque para abrir a ficha), o serviço, o valor e a forma de pagamento, quando foi informada.",
          "Mais de 10 no período? Toque em *Ver os atendimentos do período*: abre *Atendimentos realizados* com as mesmas datas.",
        ],
        dica: "O *Financeiro* logo abaixo usa o mesmo período. Cancelamento e falta não aparecem: só quem foi atendida.",
        imagem: {
          src: "/tayssa/manual/quem-atendi.webp",
          alt: "Cartão Escolha a data e, embaixo, os atendimentos realizados do período separados por dia",
          largura: 780,
          altura: 1500,
          legenda: "Escolha a data e veja quem você atendeu.",
        },
      },
      {
        id: "relatorio-periodo",
        titulo: "O relatório de um período",
        onde: ["Relatórios"],
        passos: [
          "Abra *Relatórios* e escolha *Esta quinzena*, *Quinzena anterior*, *Este mês* ou *Mês anterior*, ou preencha *De* e *Até* e toque em *Ver o período* (para um dia só, a mesma data nos dois).",
          "No *Resumo*: os atendimentos realizados, o faturamento, a *Parte da Tayssa (70%)* e a *Parte da Larissa (30%)*.",
          "Em *Repasse para a Tayssa*: o valor de cada quinzena e o dia do repasse. As clientes pagam no salão (Pix ou maquininha da Larissa) e a Larissa repassa a parte da Tayssa: do dia 1 ao 15, no dia 15; do dia 16 ao fim do mês, no dia 1º.",
          "Em *Atendimentos*: cada um com a data, a cliente, o serviço, o valor e quanto fica para cada uma.",
        ],
        imagem: {
          src: "/tayssa/manual/relatorios.webp",
          alt: "Tela de Relatórios com a quinzena escolhida, o resumo e o repasse para a Tayssa",
          largura: 780,
          altura: 1500,
          legenda: "Relatórios: a quinzena, o resumo e o repasse.",
        },
      },
      {
        id: "pdf",
        titulo: "Baixar o relatório em PDF",
        onde: ["Relatórios", "Fechamento do período"],
        passos: [
          "Com o período escolhido, toque em *Baixar relatório em PDF*.",
          "Vem um PDF com o período, o resumo (atendimentos, faturamento, a parte da Tayssa e a da Larissa), o repasse de cada quinzena com a data e os atendimentos (só o primeiro nome e a inicial da cliente).",
        ],
        dica: "No iPhone, o PDF fica no app *Arquivos* (pasta Downloads); dá para mandar no WhatsApp como *Documento*.",
      },
      {
        id: "enviar-larissa",
        titulo: "Enviar o relatório para a Larissa",
        onde: ["Relatórios", "Fechamento do período"],
        passos: [
          "Com o período escolhido, toque em *Enviar relatório para Larissa*.",
          "O painel cria a página do relatório e mostra o link. Toque em *Abrir o WhatsApp da Larissa*: a conversa dela abre com a mensagem pronta (atendimentos, faturamento, a sua parte, a parte dela e o dia do repasse) e o link. Confira e envie.",
          "Para tirar o acesso, em *Links enviados* toque em *Desativar link*. Quem abrir depois vê “Este link foi desativado”.",
        ],
        dica: "A página guarda os números da hora em que o link foi gerado (é o fechamento) e não mostra telefone nem sobrenome de cliente. Lançou algo depois? Gere outro link e desative o antigo. O WhatsApp da Larissa fica em *Financeiro* › *Configurar a divisão* › *Para onde vai o relatório*.",
      },
      {
        id: "comprovantes",
        titulo: "Os comprovantes do sinal (fora do relatório)",
        onde: ["Relatórios"],
        passos: [
          "Os comprovantes não entram no relatório. Abra *Relatórios*, escolha o período e, no fim da tela, toque em *Comprovantes do sinal* para abrir.",
          "Toque em *Baixar os comprovantes (.zip)*: vem um arquivo só, com um comprovante por cliente, cada um com o dia, a hora e o nome no arquivo.",
          "Toque em *Baixar a planilha*: a lista com cliente, WhatsApp, serviço, dia, situação, sinal e valor (abre no Excel).",
          "No WhatsApp da Larissa, toque no clipe (ou no +), escolha *Documento* e mande os dois arquivos.",
        ],
        dica: "No iPhone, os arquivos baixados ficam no app *Arquivos* (pasta Downloads). *Ver comprovante* abre um de cada vez.",
        imagem: {
          src: "/tayssa/manual/relatorios.webp",
          alt: "Tela de Relatórios com os números do mês, os passos e o botão Baixar os comprovantes",
          largura: 780,
          altura: 1500,
          legenda: "Relatórios: os números do mês e os botões de baixar.",
        },
      },
    ],
  },
  {
    letra: "I",
    lado: "painel",
    id: "financeiro",
    titulo: "Financeiro e atendimentos realizados",
    resumo: "Quanto entrou, o que falta receber, a divisão 70/30 e quem já foi atendida.",
    icone: "financeiro",
    topicos: [
      {
        id: "atendimentos-realizados",
        titulo: "Atendimentos realizados",
        onde: ["Atendimentos realizados"],
        passos: [
          "Abra *Atendimentos realizados*: só entra atendimento que aconteceu (cancelamento e falta ficam de fora).",
          "Escolha o período (*Hoje*, *Ontem*, *Esta semana*, *Este mês*, *Mês passado* ou as datas) e, se quiser, filtre por *Cliente*, *Serviço*, *Forma de pagamento* ou *Pagamento* (pago, pendente, parcial).",
          "Cada linha mostra a data, a hora, a cliente, o serviço, o valor, como pagou e a situação. Pendente? Toque em *Recebi R$…* (ou *Recebi só uma parte*).",
        ],
        dica: "Toque no nome da cliente para ver o histórico dela: quantos atendimentos, primeira e última visita, frequência, serviços, valores pagos e total gasto.",
        imagem: {
          src: "/tayssa/manual/atendimentos.webp",
          alt: "Atendimentos realizados com o período, os filtros e os números do mês",
          largura: 780,
          altura: 1500,
          legenda: "Atendimentos realizados: período, filtros e o que entrou.",
        },
      },
      {
        id: "financeiro",
        titulo: "O Financeiro",
        onde: ["Financeiro"],
        passos: [
          "Abra *Financeiro* e escolha o período.",
          "*Faturamento bruto* é o valor dos atendimentos realizados. Ao lado, a *Parte da Tayssa* e a *Parte da Larissa*.",
          "Os gráficos mostram o período de outro jeito: *Faturamento por dia* (toque numa coluna para ver o dia; *Ver em tabela* mostra todos os dias), *Como entrou o dinheiro* e *Serviços mais feitos*.",
          "Em *Divisão e repasse*: a parte da Tayssa com o repasse de cada quinzena (do dia 1 ao 15, no dia 15; do 16 ao fim do mês, no dia 1º) e a parte da Larissa, que fica no salão. Em *Como as clientes pagaram*, quanto foi em Pix, dinheiro e cartão.",
        ],
        imagem: {
          src: "/tayssa/manual/financeiro.webp",
          alt: "Tela Financeiro com o faturamento, a parte da Tayssa e a parte da Larissa",
          largura: 780,
          altura: 1500,
          legenda: "O Financeiro do período.",
        },
      },
      {
        id: "divisao",
        titulo: "A divisão 70/30 e como mudar",
        onde: ["Financeiro", "Configurar a divisão"],
        texto:
          "Todo atendimento realizado se divide sozinho: hoje, 70% para a Tayssa e 30% para a Larissa (num serviço de R$ 100, R$ 70 e R$ 30; de R$ 200, R$ 140 e R$ 60). Você não precisa fazer conta. As clientes pagam no salão (Pix ou maquininha da Larissa), e a Larissa repassa os 70% da Tayssa por quinzena: do dia 1 ao 15, no dia 15; do dia 16 ao fim do mês, no dia 1º.",
        passos: [
          "Em *Financeiro*, desça até *Configurar a divisão* e mude um dos campos (o outro acompanha: a soma é sempre 100%).",
          "Toque em *Salvar a divisão*. Vale para os atendimentos que fecharem daqui para frente; os que já fecharam continuam com a divisão da época.",
        ],
        dica: "Toda mudança fica em *Histórico da divisão*, com a data e quem mudou.",
      },
    ],
  },
  // ------------------------------------------------------------------
  // No site da cliente (17/11/2026): o que a cliente vê e faz, para a
  // Tayssa responder as dúvidas com certeza. Cada parte do site, um cartão.
  // ------------------------------------------------------------------
  {
    letra: "J",
    lado: "cliente",
    id: "cliente-site",
    titulo: "O site",
    resumo: "O que a cliente encontra no site e os botões que levam para a conta dela.",
    icone: "site",
    topicos: [
      {
        id: "partes-do-site",
        titulo: "O que a cliente encontra no site",
        onde: ["tayssafarias.com.br"],
        texto:
          "O site abre com o seu retrato e o botão *Agendar horário*. Descendo: *Cada serviço, um olhar* (cada técnica com a capa e o seu jeito de fazer), a lista de serviços (valor, tempo, manutenção e as fotos de cada um), *Cada técnica, de perto* (a galeria por categoria), a sua história, o Instagram, as avaliações (prints do WhatsApp), o VIP, a indicação e as informações de atendimento (bairro, horários, sinal e a regra de remarcar).",
        dica: "Para ver exatamente o que ela vê, toque em *Ver o site* no alto do painel.",
      },
      {
        id: "botoes-do-site",
        titulo: "Os botões que levam a cliente para a conta",
        onde: ["tayssafarias.com.br", "Menu"],
        passos: [
          "*Agendar* (em qualquer lugar do site) abre a folha de marcar horário, sem sair da página.",
          "*Meus horários* leva para a conta dela: os horários marcados, o sinal e o histórico. Pede o WhatsApp e a senha.",
          "*Área VIP* leva para o mesmo login; quem é VIP cai direto na área VIP.",
          "*Indicar* abre a página de indicar uma amiga.",
        ],
        dica: "Quando uma cliente perguntar “onde eu vejo o meu horário?”, a resposta é *Meus horários*, no alto do site (no celular, também no menu).",
      },
    ],
  },
  {
    letra: "K",
    lado: "cliente",
    id: "cliente-agendar",
    titulo: "Agendar pelo site",
    resumo: "Como a cliente escolhe o serviço, o dia e o horário, cria a conta e marca.",
    icone: "agenda",
    topicos: [
      {
        id: "como-marca",
        titulo: "Como a cliente marca um horário",
        onde: ["Site", "Agendar"],
        passos: [
          "Ela toca em *Agendar* e abre a folha *Seu horário com a Tayssa*.",
          "Escolhe o serviço: três aparecem primeiro e *Mais serviços* mostra o resto. Na manutenção, o site pergunta de qual volume é.",
          "Escolhe o dia na fita de dias (os botões de mês levam direto ao mês) e toca em *Escolher horário*. Aparecem os horários em que o serviço cabe; ocupado e fechado aparecem riscados.",
          "Toca em *Continuar*. Em *Quase lá*: se já entrou neste celular, aparece *Agendando como* com o nome dela e é só tocar em *Agendar*. Se não, ela cria a conta ali mesmo (*Criar conta*: nome, como quer ser chamada, WhatsApp e senha) ou entra (*Já tenho conta*: WhatsApp ou e-mail e senha).",
          "Aparece *Horário reservado*, com o sinal para pagar. Na sua Agenda chega o pedido *Aguardando sinal* (e o aviso no celular, se estiver ligado).",
        ],
        dica: "Se ela disser que um horário “sumiu”: ou outra cliente marcou, ou você fechou, ou o serviço dela é longo e não cabe ali. Riscado quer dizer ocupado ou fechado.",
      },
      {
        id: "varios-servicos-site",
        titulo: "Marcar mais de um serviço no mesmo horário",
        onde: ["Site", "Agendar", "Adicionar outro serviço"],
        passos: [
          "Depois do primeiro serviço, ela toca em *Adicionar outro serviço* (no mesmo horário, com um sinal só).",
          "Cada serviço vira uma linha com *Tirar*, e embaixo aparece o *Total*, com o valor e o tempo somados. Cabem até 5 serviços.",
          "O horário precisa caber todos juntos. Se não couber mais, o site pede outro horário.",
        ],
        dica: "No painel chega um pedido só, com os nomes juntos, o tempo somado e um sinal só.",
        imagem: {
          src: "/tayssa/manual/folha-varios.webp",
          alt: "Folha de agendar do site com dois serviços escolhidos, o total e o botão Adicionar outro serviço",
          largura: 780,
          altura: 1500,
          legenda: "No site: dois serviços, o total e um sinal só.",
        },
      },
      {
        id: "dezembro-site",
        titulo: "Dezembro: o que a cliente vê",
        onde: ["Site", "Agendar"],
        texto:
          "Em dezembro, os horários com taxa aparecem com *+R$ 30* e a folha avisa que é horário especial de dezembro. O valor com a taxa aparece no resumo, na mensagem do WhatsApp e no cartão do horário. A taxa é uma só por pedido, mesmo com vários serviços.",
      },
    ],
  },
  {
    letra: "L",
    lado: "cliente",
    id: "cliente-sinal",
    titulo: "Sinal e comprovante",
    resumo: "O Pix do sinal, o comprovante, o aviso no WhatsApp e o prazo de 24 horas.",
    icone: "financeiro",
    topicos: [
      {
        id: "pagar-sinal",
        titulo: "Como a cliente paga o sinal e avisa você",
        onde: ["Site", "Horário reservado"],
        texto: "Depois de marcar (e também em *Meus horários*), aparecem três passos:",
        passos: [
          "*Pague o sinal no Pix*: ela toca em *Copiar código Pix* e cola no app do banco, em Pix copia e cola. O valor já vai junto, e o site mostra em nome de quem o Pix sai.",
          "*Anexe o comprovante*: ela toca em *Anexar comprovante* e escolhe o print ou o PDF.",
          "*Avise a Tayssa*: ela toca em *Enviar no WhatsApp* e o cartão do horário vai como foto, com a mensagem pronta (serviço, dia, horário, valor e sinal).",
        ],
        dica: "Não achou a sua conversa na lista do WhatsApp? Embaixo do botão tem *Não achou a Tayssa? Abrir a conversa dela*. No painel, o pedido dela sobe para o topo como *Comprovante enviado*.",
      },
      {
        id: "prazo-sinal",
        titulo: "O prazo de 24 horas, a tolerância e a regra de remarcar",
        texto:
          "O horário fica guardado por 24 horas esperando o comprovante. Sem comprovante nesse prazo, o pedido cai sozinho e o horário volta para a agenda. Com comprovante, nunca cai sozinho: espera você conferir e confirmar. No site ela lê a tolerância de atraso (10 minutos; passando disso, perde o sinal) e a regra de remarcar: com 48 horas ou mais de antecedência, o sinal vale para a nova data; com menos, ou se ela não vier, o sinal não é devolvido.",
      },
      {
        id: "cartao-horario",
        titulo: "O cartão do horário (a foto que vai no WhatsApp)",
        texto:
          "É a imagem do horário dela: serviço, dia, hora, valor, sinal e a situação do pedido (esperando o sinal, comprovante enviado ou confirmado). Quem abre o link vê só o horário, nunca nome nem telefone. Se o horário for apagado, o link mostra “Esse horário não está mais na agenda”.",
      },
    ],
  },
  {
    letra: "M",
    lado: "cliente",
    id: "cliente-horarios",
    titulo: "Meus agendamentos",
    resumo: "Onde a cliente vê os horários dela, o confirmado com o endereço e como desmarca.",
    icone: "atendimentos",
    topicos: [
      {
        id: "onde-ve",
        titulo: "Onde a cliente vê os horários dela",
        onde: ["Site", "Meus horários"],
        passos: [
          "No site, ela toca em *Meus horários* e entra com o WhatsApp e a senha.",
          "Abre *Meus agendamentos*, com três abas: *Realizados* (o que já foi feito), *Em aberto* (o que está marcado) e *Marcar* (marcar outro horário).",
          "Em *Em aberto*, o pedido sem comprovante mostra os passos do sinal; com comprovante, mostra *Sinal pago e Tayssa avisada*.",
          "Depois que você confirma, o cartão diz *Horário confirmado* e mostra o endereço (com *Abrir no mapa*), a sala, o interfone, a tolerância de atraso e o recado que você escreveu ao confirmar.",
        ],
        dica: "O endereço completo só aparece para quem tem horário confirmado. O site aberto mostra só o bairro.",
      },
      {
        id: "desmarcar",
        titulo: "Quando a cliente desmarca pelo site",
        onde: ["Meus horários", "Em aberto", "Desmarcar"],
        texto:
          "Em *Em aberto*, ela pode tocar em *Desmarcar* e confirmar em *Sim, desmarcar*, até a hora do atendimento. O horário volta a ficar livre na sua agenda e o pedido aparece como cancelado. O sinal segue a regra de remarcar do site.",
      },
      {
        id: "realizados-cliente",
        titulo: "O que ela vê em Realizados",
        onde: ["Meus horários", "Realizados"],
        texto:
          "Cada atendimento que você marcou como *Realizado* aparece riscado, com o check. Embaixo, apagados, os cancelados e os não confirmados.",
      },
    ],
  },
  {
    letra: "N",
    lado: "cliente",
    id: "cliente-conta",
    titulo: "Conta, cadastro e senha",
    resumo: "Entrar, esqueceu a senha, o cadastro VIP pelo site e o perfil da cliente.",
    icone: "clientes",
    topicos: [
      {
        id: "entrar-cliente",
        titulo: "Como a cliente entra na conta",
        onde: ["Site", "Meus horários ou Área VIP"],
        texto:
          "Ela entra com o *WhatsApp ou e-mail* e a *Senha*. *Manter conectada neste celular* já vem marcado: a conta fica aberta no aparelho. Cada WhatsApp tem uma conta só.",
      },
      {
        id: "esqueci-senha",
        titulo: "Cliente esqueceu a senha",
        onde: ["Clientes", "a ficha", "Acesso e VIP"],
        lado: "ambos",
        passos: [
          "O site não tem “esqueci a senha”: ela fala com você.",
          "Abra a ficha dela e, em *Acesso e VIP*, toque em *Gerar link de redefinição* (ou *Gerar link de acesso*, se ela nunca criou senha).",
          "Mande o link pelo WhatsApp. Ela abre, cria a senha nova e entra.",
        ],
        dica: "O link vale uma vez, por 7 dias.",
      },
      {
        id: "cadastro-vip",
        titulo: "O cadastro VIP pelo site",
        onde: ["Site", "Fazer meu cadastro VIP"],
        lado: "ambos",
        passos: [
          "Ela toca em *Fazer meu cadastro VIP* (na parte VIP do site ou na tela de entrar).",
          "Preenche em três passos: nome, como quer ser chamada e WhatsApp; a senha duas vezes; e, se quiser, o aniversário e como conheceu você.",
          "A conta já nasce pronta para marcar horário. No fim, ela pode tocar em *Avisar a Tayssa no WhatsApp*.",
          "Você recebe o aviso de cliente nova e decide: *Aprovar VIP* ou *Não aprovar* (veja “Cliente nova”, em Clientes).",
        ],
      },
      {
        id: "meu-perfil",
        titulo: "Meu perfil: dados, senha e sair",
        onde: ["Conta da cliente", "Meu perfil"],
        texto:
          "Em *Meu perfil*, ela muda os dados e toca em *Salvar*, troca a senha (*Senha atual*, *Nova senha* e *Repetir nova senha*) e toca em *Sair da minha conta* para sair.",
      },
    ],
  },
  {
    letra: "O",
    lado: "cliente",
    id: "cliente-vip",
    titulo: "Área VIP",
    resumo: "O que a VIP vê: o cartão e os carimbos, os benefícios, a jornada e a indicação.",
    icone: "beneficios",
    topicos: [
      {
        id: "area-vip",
        titulo: "O que a cliente VIP vê",
        onde: ["Site", "Área VIP"],
        texto:
          "O início da área VIP mostra o nome dela, o cartão e os atalhos *Agendar*, *Meu cartão*, *Benefícios*, *Minha jornada*, *Indicar alguém* e *Meu perfil*. Quem ainda não é VIP vê essas telas trancadas, com a regra do VIP e quantos atendimentos da sequência já fez.",
      },
      {
        id: "carimbos",
        titulo: "O cartão e os carimbos",
        onde: ["Área VIP", "Meu cartão"],
        texto:
          "Cada atendimento que você marca como *Realizado* vira um carimbo no cartão dela. No celular, ela raspa o carimbo com o dedo e vê os pontos (ou toca em *Revelar sem raspar*). Os pontos já valem desde a sua confirmação: raspar só mostra. A cada 8 visitas, o cartão cheio gera o presente, que espera a sua validação em *Benefícios*.",
      },
      {
        id: "beneficios-cliente",
        titulo: "Benefícios: como ela pede para usar",
        onde: ["Área VIP", "Benefícios"],
        lado: "ambos",
        texto:
          "O que você liberou fica em *Para usar*: ela toca em *Quero usar* e o pedido chega para você em *Benefícios*, no bloco *Solicitados*. O que ainda espera a sua validação aparece para ela em *Em validação*. Embaixo, *O seu caminho até o VIP* e *Como funciona* explicam as regras.",
      },
      {
        id: "jornada",
        titulo: "Minha jornada e o ranking",
        onde: ["Área VIP", "Minha jornada"],
        texto:
          "Em *Minha jornada*, ela vê os pontos, os marcos e o ranking. No ranking aparece só o primeiro nome das outras clientes, nunca contato nem histórico.",
      },
      {
        id: "indicar-cliente",
        titulo: "Indicar uma amiga",
        onde: ["Site", "Indicar"],
        lado: "ambos",
        passos: [
          "No site (*Indicar*) ou na área VIP (*Indicar alguém*), ela preenche os dados de quem indica e envia.",
          "A indicação chega para você em *Indicações*. Só vale depois que a indicada faz o atendimento, e o benefício de quem indicou é você quem libera.",
        ],
      },
      {
        id: "registrar-visita",
        titulo: "Quando a cliente registra um atendimento",
        onde: ["Área VIP", "Meu perfil", "Registrar visita"],
        lado: "ambos",
        texto:
          "Em *Meu perfil*, a cliente VIP pode registrar um atendimento em *Registrar visita* (atendimento, data e, se quiser, o valor). Ele chega para você em *Atendimentos realizados*, nos registros das clientes, e só soma pontos depois que você confirma.",
      },
    ],
  },
];
