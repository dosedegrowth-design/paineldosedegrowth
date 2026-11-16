/**
 * Manual do painel (pedido da Tayssa, 16/11/2026): um documento só, por
 * categorias, passo a passo, em linguagem simples, dentro do painel.
 *
 * REGRA: mudou o painel, muda o manual no mesmo commit (o tópico, o print
 * se a tela mudou e `MANUAL_ATUALIZADO_EM`). A versão para o grupo sai
 * daqui também (`docs/tayssa/manual-grupo.mjs`).
 *
 * `*assim*` vira negrito: nome de botão, de menu ou de campo, escrito
 * exatamente como aparece na tela. Sem travessão (texto de cliente).
 */
import type { IconeNome } from "@/components/tayssa/admin/icons";

export const MANUAL_ATUALIZADO_EM = "2026-11-16";

export type ImagemDoManual = {
  src: string;
  alt: string;
  largura: number;
  altura: number;
  legenda?: string;
  /** print do computador (ocupa a largura toda); sem isso, print do celular */
  larga?: boolean;
};

export type TopicoDoManual = {
  id: string;
  titulo: string;
  /** o caminho até a tela: ["Agenda", "Pedidos de horário"] */
  onde?: string[];
  texto?: string;
  passos?: string[];
  dica?: string;
  imagem?: ImagemDoManual;
};

export type CategoriaDoManual = {
  letra: string;
  id: string;
  titulo: string;
  resumo: string;
  icone: IconeNome;
  topicos: TopicoDoManual[];
};

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
          "No computador, o menu fica à esquerda, em quatro grupos: *Atendimento* (Visão geral, Agenda, Atendimentos, Clientes, Relatórios), *Relacionamento* (Indicações, Benefícios, Aniversários), *Marca* (Mídia) e *Ajustes* (Configurações, Manual do painel). No celular, a barra de baixo tem *Início*, *Agenda*, *Clientes*, *Benefícios* e *Mais*; o *Mais* abre o menu inteiro.",
        dica: "Um número ao lado de um item do menu quer dizer que tem coisa esperando você ali: pedido de horário, cliente nova, atendimento ou benefício para conferir.",
      },
      {
        id: "inicio",
        titulo: "Voltar para o início",
        passos: [
          "Toque em *Visão geral* no menu (no celular, em *Início* na barra de baixo).",
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
      },
      {
        id: "topo",
        titulo: "Os botões do topo: Manual, Ver o site e Sair",
        texto:
          "*Manual* abre este manual. *Ver o site* abre o site como a cliente vê, em outra aba (o painel continua aberto na aba dele). *Sair* fecha o painel neste aparelho e volta para a tela de entrar. No celular, Manual e Ver o site aparecem só com o ícone (o livro e o globo).",
      },
    ],
  },
  {
    letra: "B",
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
    id: "agenda",
    titulo: "Agenda e agendamentos",
    resumo: "Ver a semana, conferir pedidos e comprovantes, confirmar, remarcar, cancelar e abrir novos dias.",
    icone: "agenda",
    topicos: [
      {
        id: "como-chega",
        titulo: "Como um horário chega até você",
        texto:
          "A cliente escolhe o serviço, o dia e a hora no site, cria a conta (ou entra) e o pedido aparece na sua *Agenda* como *Aguardando sinal*. Ela paga o sinal no Pix e anexa o comprovante no site: o pedido vira *Comprovante enviado* e sobe para o topo da lista. Pedido sem comprovante cai sozinho depois de 24 horas e o horário volta para a agenda; pedido com comprovante nunca cai sozinho, espera você.",
      },
      {
        id: "varios-servicos",
        titulo: "Pedido com mais de um serviço",
        texto:
          "A cliente pode marcar vários serviços no mesmo horário, um depois do outro (ex.: Manutenção de cílios + Design de sobrancelhas). Chega *um pedido só*, com os nomes juntos, o tempo somado (a agenda segura o tempo todo) e *um sinal só*. Você confirma uma vez e, no fim, marca *Realizado* uma vez: os pontos de todos os serviços entram juntos, num atendimento e num carimbo do cartão.",
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
        id: "semana",
        titulo: "Ver a semana e fechar um horário ou um dia",
        onde: ["Agenda", "Semana"],
        passos: [
          "Em *Semana*, use as setas para mudar de semana e *Hoje* para voltar.",
          "Toque num horário *Livre* para fechar (ex.: compromisso). Toque num *Fechado* para abrir de novo.",
          "Folga ou viagem: toque em *Fechar dia* no alto do dia. *Abrir dia* devolve.",
        ],
        dica: "O horário fechado aparece riscado para a cliente, ela não consegue marcar. Toque num horário com cliente para abrir a ficha dela.",
      },
      {
        id: "fechar-atendimento",
        titulo: "Depois do atendimento: Realizado ou Não compareceu",
        onde: ["Agenda", "Hoje ou Para fechar"],
        passos: [
          "Passado o horário, o pedido mostra *Realizado* e *Não compareceu* (em *Hoje* ou, nos dias seguintes, em *Para fechar*).",
          "Toque em *Realizado*. Se fez outro serviço ou quer outros pontos, escreva em *Pontos desta visita*; vazio usa os pontos do serviço. Toque em *Confirmar*.",
          "Pronto: o atendimento entra no histórico dela com os pontos e o carimbo do cartão.",
        ],
        dica: "*Não compareceu* não soma nada para a cliente.",
      },
      {
        id: "corrigir-data",
        titulo: "Remarcar ou corrigir a data de um horário",
        onde: ["Agenda", "o horário", "Corrigir data"],
        passos: [
          "Ache o horário na *Agenda* (pedido, confirmado ou para fechar) e toque em *Corrigir data*.",
          "Escolha o *Dia certo* e a *Hora* e toque em *Gravar a data*.",
          "É o mesmo pedido que muda de lugar: o serviço, o valor, a cliente e o comprovante continuam. Se o horário novo já tem outra cliente, o painel avisa.",
        ],
        dica: "Atendimento que entrou com o dia errado no passado (ex.: marcado para dezembro, mas feito antes): corrija a data para o dia em que ela veio. Ele vai para *Para fechar*, e aí é só tocar em *Realizado*.",
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
        id: "marcar-por-ela",
        titulo: "Uma cliente pediu horário pelo WhatsApp",
        texto:
          "O painel não marca horário no lugar da cliente. Mande o link do site para ela marcar (leva 1 minuto e já sai com o sinal). Se ela não conseguir, feche o horário na *Semana* para ninguém pegar e, depois do atendimento, registre em *Clientes* › a ficha › *Atendimentos* › *Registrar atendimento confirmado*.",
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
        titulo: "Dezembro: horário especial",
        texto:
          "Em dezembro a agenda abre das 7h às 21h de segunda a sábado e das 7h às 17h no domingo. O primeiro e o último horário de cada dia têm R$ 30 a mais. No dia 24, das 6h às 15h, todo horário tem R$ 30 a mais. Nos dias 25, 30 e 31 não tem atendimento. A taxa aparece para a cliente no site, na mensagem e no pedido, e é uma só por pedido (mesmo com vários serviços). Para mudar essas regras, fale com a DDG.",
      },
    ],
  },
  {
    letra: "D",
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
          "Ou use os filtros: *Todas*, *Novas clientes*, *Da agenda*, *VIP*, *Prontas para VIP*, *Com pendência*, *Inativas*.",
          "Toque no nome para abrir a ficha.",
        ],
      },
      {
        id: "ficha",
        titulo: "O que tem na ficha da cliente",
        onde: ["Clientes", "a ficha"],
        texto:
          "No alto, os números (pontos, atendimentos, indicações, benefícios, aniversário, pendências). Depois: *Quem é ela*, *Acesso e VIP*, *Pontos, marcos e VIP*, *Aniversário*, *Atendimentos* (o histórico de procedimentos), *Benefícios*, *Indicações feitas por ela*, *Dados* e o *Histórico de ações*. O botão *WhatsApp* no alto abre a conversa com ela.",
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
          "Escolha o *Serviço* e a *Data* (hoje ou antes), e o valor se quiser. *Pontos* vazio usa os do serviço.",
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
    id: "beneficios",
    titulo: "Benefícios, pontos e recorrência",
    resumo: "Como os pontos e o VIP funcionam, liberar presentes, corrigir pontos e as regras de tempo.",
    icone: "beneficios",
    topicos: [
      {
        id: "como-funciona",
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
    id: "relatorios",
    titulo: "Relatórios e visão geral",
    resumo: "Ler a visão geral e baixar os comprovantes do mês para mandar à Larissa.",
    icone: "relatorios",
    topicos: [
      {
        id: "visao-geral",
        titulo: "A Visão geral",
        onde: ["Visão geral"],
        texto:
          "É a tela de abrir o dia: o que espera você, os *Próximos horários* (com *Confirmar* nos pedidos), as *Novas clientes*, quem está *Pronta para VIP*, os aniversários da semana, quem sumiu e os últimos movimentos. Cada cartão de número leva para a tela certa.",
      },
      {
        id: "comprovantes",
        titulo: "Baixar os comprovantes do mês e mandar para a Larissa",
        onde: ["Relatórios"],
        passos: [
          "Abra *Relatórios*. Ele abre no mês atual; *‹* e *›* mudam o mês.",
          "Toque em *Baixar os comprovantes (.zip)*: vem um arquivo só, com um comprovante por cliente, cada um com o dia, a hora e o nome no arquivo.",
          "Toque em *Baixar a planilha*: a lista com cliente, WhatsApp, serviço, dia, situação, sinal e valor (abre no Excel).",
          "No WhatsApp da Larissa, toque no clipe (ou no +), escolha *Documento* e mande os dois arquivos.",
        ],
        dica: "No iPhone, os arquivos baixados ficam no app *Arquivos* (pasta Downloads). *Ver comprovante* abre um de cada vez.",
      },
      {
        id: "numeros",
        titulo: "Os números dos relatórios",
        onde: ["Relatórios"],
        texto:
          "*Comprovantes*: quantas clientes anexaram o comprovante no mês. *Em sinais*: o total que entrou de sinal (comprovantes × valor do sinal). *Ainda para conferir*: comprovantes que você ainda não confirmou na Agenda. Pedido cancelado depois do Pix continua na lista, porque o dinheiro entrou.",
      },
    ],
  },
];
