type Criativo = {
  img: string;
  nome: string;
  link?: string;
  etapas: ("topo" | "meio" | "fundo")[];
};

const CRIATIVOS: Criativo[] = [
  {
    img: "/lydia/01-clube-pinheiros.webp",
    nome: "Casa próxima ao Clube Pinheiros",
    link: "https://www.instagram.com/reel/DdsxmH-x9Iq/",
    etapas: ["topo", "meio", "fundo"],
  },
  {
    img: "/lydia/02-sala-jantar.webp",
    nome: "Apartamento — sala de jantar",
    link: "https://www.instagram.com/reel/Dc2EupOCRta/",
    etapas: ["topo", "meio", "fundo"],
  },
  {
    img: "/lydia/03-varanda-vista.webp",
    nome: "Varanda com vista para a cidade",
    link: "https://www.instagram.com/reel/DcC3enAO7D4/",
    etapas: ["topo", "meio", "fundo"],
  },
  {
    img: "/lydia/04-cozinha.webp",
    nome: "Cozinha gourmet com varanda",
    link: "https://www.instagram.com/reel/DarpClju6Eo/",
    etapas: ["topo", "meio", "fundo"],
  },
  {
    img: "/lydia/05-entrevista.webp",
    nome: "Entrevista — início da carreira",
    link: "https://www.instagram.com/reel/DZv82ppgPlF/",
    etapas: ["topo", "meio", "fundo"],
  },
  {
    img: "/lydia/06-sala-vazia.webp",
    nome: "Apartamento vazio — planta livre",
    link: "https://www.instagram.com/reel/DY12tjZgJ4r/",
    etapas: ["topo", "meio", "fundo"],
  },
  {
    img: "/lydia/07-tijolinho.webp",
    nome: "Living com parede de tijolinho",
    link: "https://www.instagram.com/reel/DYSwZiXgHAi/",
    etapas: ["topo", "meio", "fundo"],
  },
  {
    img: "/lydia/08-janela-parque.webp",
    nome: "Vista para o parque",
    link: "https://www.instagram.com/reel/DX7XLQcAB3T/",
    etapas: ["topo", "meio", "fundo"],
  },
  {
    img: "/lydia/09-carrossel-esquema.webp",
    nome: "Carrossel — living amplo (fotos profissionais)",
    link: "https://www.instagram.com/p/DdItqGqDgLb/",
    etapas: ["meio", "fundo"],
  },
  {
    img: "/lydia/10-carrossel-sala-branca.webp",
    nome: "Carrossel — sala clara com poltronas",
    link: "https://www.instagram.com/p/Dch098rjs3m/",
    etapas: ["meio", "fundo"],
  },
  {
    img: "/lydia/11-carrossel-hall.webp",
    nome: "Carrossel — hall de entrada do prédio",
    link: "https://www.instagram.com/p/DcKcMlUEYPS/",
    etapas: ["meio", "fundo"],
  },
];

type Etapa = {
  id: "topo" | "meio" | "fundo";
  n: string;
  tag: string;
  titulo: string;
  frase: string;
  publico: string;
  objetivo: string;
  botao: string;
  verba: string;
  medir: string;
};

const ETAPAS: Etapa[] = [
  {
    id: "topo",
    n: "01",
    tag: "Topo",
    titulo: "Descoberta",
    frase:
      "Os vídeos rodam para gente que ainda não conhece você. É aqui que a pessoa vê o imóvel pela primeira vez e para o dedo.",
    publico: "Público frio — bairros e faixa de renda definidos abaixo.",
    objetivo: "Reconhecimento / visualizações de vídeo",
    botao: "Sem botão. O trabalho do topo é só fazer assistir.",
    verba: "R$ 250/mês",
    medir: "Alcance, custo por mil pessoas, quem assistiu 50% ou mais",
  },
  {
    id: "meio",
    n: "02",
    tag: "Meio",
    titulo: "Perfil e autoridade",
    frase:
      "Quem assistiu no topo vê o mesmo conteúdo de novo, agora com o objetivo de trazer essa pessoa para dentro do seu Instagram — para ela conhecer você, ver os outros imóveis e passar a seguir.",
    publico:
      "Quem assistiu 50% ou mais de qualquer vídeo do topo nos últimos 30 dias.",
    objetivo: "Tráfego / visitas ao perfil — crescimento do @",
    botao: "Leva direto para o perfil no Instagram",
    verba: "R$ 200/mês",
    medir: "Visitas ao perfil, seguidores novos, custo por visita",
  },
  {
    id: "fundo",
    n: "03",
    tag: "Fundo",
    titulo: "Conversa no WhatsApp",
    frase:
      "O MESMO vídeo que a pessoa já viu duas vezes volta uma terceira — agora com o botão de WhatsApp. Ela já conhece o imóvel, já conhece você. Aqui ela só clica e fala.",
    publico:
      "Quem assistiu aos vídeos + quem visitou o perfil + quem interagiu com o Instagram nos últimos 30 dias.",
    objetivo: "Mensagens (click-to-WhatsApp)",
    botao: "Enviar mensagem → abre a conversa no seu WhatsApp",
    verba: "R$ 250/mês",
    medir: "Conversas iniciadas, custo por conversa, visitas agendadas",
  },
];

const ETIQUETA: Record<string, string> = {
  topo: "Topo",
  meio: "Meio",
  fundo: "Fundo",
};

export default function LydiaPage() {
  return (
    <main className="ld-main">
      <header className="ld-hero">
        <p className="ld-kicker">Dose de Growth · Plano de campanha</p>
        <h1>Lydia Magalhães</h1>
        <p className="ld-sub">
          Como vamos usar os vídeos que você já tem para crescer o perfil no
          Instagram e trazer quem se interessou de verdade para uma conversa no
          seu WhatsApp.
        </p>
      </header>

      <section className="ld-facts" aria-label="Resumo da campanha">
        <div>
          <span>Verba</span>
          <strong>R$ 700/mês</strong>
        </div>
        <div>
          <span>Sobe hoje</span>
          <strong>Quarta, 30/set</strong>
        </div>
        <div>
          <span>Praça</span>
          <strong>São Paulo capital</strong>
        </div>
        <div>
          <span>Idade</span>
          <strong>35+</strong>
        </div>
      </section>

      <section className="ld-card ld-ideia">
        <p className="ld-tag">A ideia central</p>
        <h2>O mesmo vídeo, três vezes — com um pedido diferente a cada vez</h2>
        <p>
          A maioria das corretoras posta o vídeo uma vez e torce. A gente vai
          fazer diferente: o vídeo que funcionar no topo <strong>persegue</strong>{" "}
          quem assistiu.
        </p>
        <p>
          Exemplo real: a pessoa vê o vídeo da cozinha, gosta do móvel, assiste
          até o fim. Isso é um sinal. Ela entra numa lista. Dias depois, o mesmo
          vídeo aparece de novo para ela, agora levando ao seu perfil. Depois
          aparece uma terceira vez, com o botão de WhatsApp. Quando ela clica, já
          não é um estranho falando com você — é alguém que viu aquele imóvel
          três vezes e decidiu.
        </p>
        <p className="ld-nota">
          Os anúncios sobem hoje. Os primeiros números aparecem entre quinta e
          sexta — o Meta leva as primeiras 48h aprendendo para quem entregar,
          então o começo sempre vem mais caro e vai ajustando.
        </p>
        <p className="ld-nota">
          Por isso quase todos os criativos aparecem nas três etapas. Não é
          repetição por falta de material: é a mesma peça trabalhando em
          temperaturas diferentes.
        </p>
      </section>

      <section className="ld-funil" aria-label="Visão geral do funil">
        {ETAPAS.map((e, i) => (
          <a key={e.id} href={`#${e.id}`} className={`ld-step ld-step-${i + 1}`}>
            <span>
              {e.n} · {e.tag}
            </span>
            <strong>{e.titulo}</strong>
            <em>{e.verba}</em>
          </a>
        ))}
        <div className="ld-goal">WhatsApp da Lydia</div>
      </section>

      {ETAPAS.map((e) => (
        <section key={e.id} id={e.id} className="ld-card">
          <p className="ld-tag">
            {e.n} · {e.tag} de funil
          </p>
          <h2>{e.titulo}</h2>
          <p className="ld-obj">{e.frase}</p>

          <dl className="ld-def">
            <div>
              <dt>Quem vê</dt>
              <dd>{e.publico}</dd>
            </div>
            <div>
              <dt>Objetivo no Meta</dt>
              <dd>{e.objetivo}</dd>
            </div>
            <div>
              <dt>Botão do anúncio</dt>
              <dd>{e.botao}</dd>
            </div>
            <div>
              <dt>Verba</dt>
              <dd>{e.verba}</dd>
            </div>
            <div>
              <dt>Como medimos</dt>
              <dd>{e.medir}</dd>
            </div>
          </dl>

          <h3>Criativos que entram nesta etapa</h3>
          <div className="ld-media">
            {CRIATIVOS.filter((c) => c.etapas.includes(e.id)).map((c) => (
              <figure key={c.img}>
                <img src={c.img} alt={c.nome} loading="lazy" />
                <figcaption>
                  {c.link ? (
                    <a href={c.link} target="_blank" rel="noreferrer">
                      {c.nome}
                    </a>
                  ) : (
                    c.nome
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      <section className="ld-card">
        <p className="ld-tag">Público</p>
        <h2>Para quem os anúncios vão aparecer</h2>
        <dl className="ld-def">
          <div>
            <dt>Região</dt>
            <dd>
              Jardins, Higienópolis, Campo Belo, Itaim, Vila Nova Conceição,
              Pinheiros, Perdizes e o entorno — os bairros de alto padrão de São
              Paulo.
            </dd>
          </div>
          <div>
            <dt>Idade</dt>
            <dd>35 anos ou mais</dd>
          </div>
          <div>
            <dt>Perfil</dt>
            <dd>
              Faixa de renda mais alta da cidade. Gente que compra, vende ou
              investe em imóvel de padrão — não quem procura aluguel barato.
            </dd>
          </div>
          <div>
            <dt>No meio e no fundo</dt>
            <dd>
              O público deixa de ser por bairro e passa a ser por
              comportamento: só quem já assistiu, já visitou o perfil ou já
              interagiu.
            </dd>
          </div>
        </dl>
      </section>

      <section className="ld-card ld-acervo">
        <p className="ld-tag">Acervo</p>
        <h2>Os 11 criativos que já temos no ar</h2>
        <div className="ld-grid">
          {CRIATIVOS.map((c) => (
            <figure key={c.img}>
              <img src={c.img} alt={c.nome} loading="lazy" />
              <figcaption>
                {c.link ? (
                  <a href={c.link} target="_blank" rel="noreferrer">
                    {c.nome}
                  </a>
                ) : (
                  c.nome
                )}
                <span className="ld-pills">
                  {c.etapas.map((et) => (
                    <i key={et} className={`ld-pill ld-pill-${et}`}>
                      {ETIQUETA[et]}
                    </i>
                  ))}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="ld-card ld-next">
        <p className="ld-tag">Próximos passos</p>
        <h2>O que precisamos produzir</h2>
        <ol>
          <li>
            <strong>Mais vídeos com você aparecendo.</strong> O da entrevista é o
            único em que a pessoa vê seu rosto e ouve sua voz. É o que mais
            constrói confiança — e hoje temos um só.
          </li>
          <li>
            <strong>Vídeos de imóvel específico com preço e bairro.</strong> Para
            o fundo funcionar melhor, o anúncio precisa falar de um imóvel
            concreto, não de um tour genérico.
          </li>
          <li>
            <strong>Conteúdo de processo.</strong> Financiamento, documentação,
            avaliação. É o que faz a pessoa te seguir e te achar a corretora
            certa, mesmo antes de estar pronta para comprar.
          </li>
          <li>
            <strong>Depoimento de cliente.</strong> Um vídeo curto de quem já
            comprou ou vendeu com você vale mais que qualquer anúncio nosso.
          </li>
        </ol>
        <p className="ld-ask">
          Lydia, dá uma olhada e me fala o que faz sentido. Se algum bairro
          estiver de fora, se tiver um imóvel que você quer priorizar, ou se algo
          aqui não combina com o seu jeito de trabalhar — a gente ajusta antes de
          subir.
        </p>
      </section>

      <footer className="ld-foot">Dose de Growth · dosedegrowth.com</footer>
    </main>
  );
}
