type Etapa = {
  id: string;
  tag: string;
  titulo: string;
  objetivo: string;
  conteudos: string[];
  cta: string;
  pasta: string;
  medir: string;
};

const ETAPAS: Etapa[] = [
  {
    id: "topo",
    tag: "Topo de funil",
    titulo: "Atrair e ser descoberta",
    objetivo:
      "Chegar em quem ainda não conhece a Lidia: gente que sonha em comprar, vender ou investir em imóvel, mas não está decidida.",
    conteudos: [
      "Vídeos curtos de bastidor, tour por imóveis e dicas rápidas do mercado",
      "Conteúdo que gera curiosidade e salvamentos (\"o que ninguém conta sobre comprar imóvel\")",
      "Alcance amplo em Reels e Stories, público frio segmentado por região",
    ],
    cta: "Seguir o perfil e assistir ao próximo vídeo",
    pasta: "topo",
    medir: "Alcance, visualizações de 3s e 50%, novos seguidores",
  },
  {
    id: "meio",
    tag: "Meio de funil",
    titulo: "Gerar confiança e autoridade",
    objetivo:
      "Mostrar que a Lidia entende do assunto. Quem já conhece passa a confiar e a enxergar nela a corretora certa.",
    conteudos: [
      "Explicações de processo: financiamento, documentação, avaliação do imóvel",
      "Casos reais e depoimentos de clientes atendidos",
      "Comparativos de bairros e análises de oportunidade",
    ],
    cta: "Chamar no WhatsApp para tirar uma dúvida",
    pasta: "meio",
    medir: "Engajamento, compartilhamentos, cliques no perfil e no link",
  },
  {
    id: "fundo",
    tag: "Fundo de funil",
    titulo: "Converter em conversa no WhatsApp",
    objetivo:
      "Levar quem está pronto para agir direto ao WhatsApp da Lidia, onde o atendimento e a negociação acontecem.",
    conteudos: [
      "Anúncios de imóvel específico com botão \"Enviar mensagem\" (click-to-WhatsApp)",
      "Ofertas e oportunidades com urgência real (condição, unidade, prazo)",
      "Remarketing para quem assistiu vídeos e visitou o perfil",
    ],
    cta: "Falar agora com a Lidia no WhatsApp",
    pasta: "fundo",
    medir: "Conversas iniciadas, custo por conversa, visitas agendadas",
  },
];

const PRIORIDADES = [
  "Mais conteúdo de fundo: anúncios click-to-WhatsApp de imóveis específicos, que trazem a conversa direto.",
  "Mais conteúdo de meio: provas e explicações que tiram a dúvida de quem já acompanha a Lidia.",
  "Topo constante, mas enxuto: o suficiente para alimentar o funil com gente nova.",
];

export default function LidiaPage() {
  return (
    <main className="ld-main">
      <header className="ld-hero">
        <p className="ld-kicker">Dose de Growth · Estratégia de conteúdo</p>
        <h1>Lidia Guimarães</h1>
        <p className="ld-sub">
          Corretora de imóveis. O plano para transformar atenção em conversa no WhatsApp:
          o que já temos no ar, o que falta e o que vamos produzir.
        </p>
      </header>

      <section className="ld-funil" aria-label="Visão geral do funil">
        {ETAPAS.map((e, i) => (
          <a key={e.id} href={`#${e.id}`} className={`ld-step ld-step-${i + 1}`}>
            <span>{e.tag}</span>
            <strong>{e.titulo}</strong>
          </a>
        ))}
        <div className="ld-goal">WhatsApp da Lidia</div>
      </section>

      {ETAPAS.map((e) => (
        <section key={e.id} id={e.id} className="ld-card">
          <p className="ld-tag">{e.tag}</p>
          <h2>{e.titulo}</h2>
          <p className="ld-obj">{e.objetivo}</p>

          <h3>O que entra aqui</h3>
          <ul>
            {e.conteudos.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <div className="ld-row">
            <div>
              <h3>Chamada para ação</h3>
              <p>{e.cta}</p>
            </div>
            <div>
              <h3>Como medimos</h3>
              <p>{e.medir}</p>
            </div>
          </div>

          <h3>Criativos no ar</h3>
          <div className="ld-media" data-pasta={e.pasta}>
            <p>Prints e vídeos desta etapa entram aqui.</p>
          </div>
        </section>
      ))}

      <section className="ld-card ld-next">
        <p className="ld-tag">Próximos passos</p>
        <h2>O que vamos produzir mais</h2>
        <ol>
          {PRIORIDADES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        <p className="ld-ask">
          Lidia, o que você acha? Se algum ponto não combina com o seu jeito de atender ou
          com os imóveis que você quer vender, é só avisar que a gente ajusta.
        </p>
      </section>

      <footer className="ld-foot">Dose de Growth · dosedegrowth.com</footer>
    </main>
  );
}
