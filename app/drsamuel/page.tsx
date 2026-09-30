function LogoDDG() {
  return (
    <span className="ds-ddg">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dose de Growth">
        <path d="M24 2L43.6 13V35L24 46L4.4 35V13L24 2Z" fill="#F15839" />
        <path d="M18 14L18 32L24 36L24 14L18 14Z" fill="white" fillOpacity="0.95" />
        <path d="M24 14L30 18L30 28L24 32L24 14Z" fill="#171717" fillOpacity="0.85" />
      </svg>
      <span>Dose de Growth</span>
    </span>
  );
}

const VERBA = [
  { canal: "Google", nome: "Rede de Pesquisa", faz: "Aparece para quem digita no Google que procura quiropraxia ou tratamento para dor na coluna.", dia: "R$ 20", mes: "R$ 600" },
  { canal: "Google", nome: "Performance Max", faz: "Leva a clínica ao Google Maps, YouTube, Discover e Gmail para quem está perto e tem o mesmo interesse.", dia: "R$ 13", mes: "R$ 400" },
  { canal: "Meta", nome: "Remarketing", faz: "Reencontra no Instagram quem já visitou o site e ainda não chamou no WhatsApp.", dia: "R$ 23", mes: "R$ 700" },
  { canal: "Meta", nome: "Público semelhante", faz: "Apresenta o Dr. Samuel a pessoas da região com perfil parecido com quem visita o site.", dia: "R$ 10", mes: "R$ 300" },
];

const FRENTES_GOOGLE = [
  {
    tag: "Pesquisa · Frente 01",
    titulo: "Quiropraxia",
    texto: "Quem já sabe o que quer e está escolhendo onde fazer. É a busca de maior intenção da conta.",
    busca: "quiropraxia, quiropraxista, quiropraxia perto de mim, quiropraxia no Brooklin, em Moema, no Campo Belo",
    destino: "página inicial do site",
  },
  {
    tag: "Pesquisa · Frente 02",
    titulo: "Hérnia de disco e ciático",
    texto: "Quem tem um diagnóstico e procura tratamento, muitas vezes querendo evitar a cirurgia.",
    busca: "tratamento para hérnia de disco, hérnia de disco sem cirurgia, tratamento do nervo ciático",
    destino: "página de hérnia de disco",
  },
  {
    tag: "Pesquisa · Frente 03",
    titulo: "Dor lombar e coluna",
    texto: "Quem convive com dor nas costas e está procurando quem resolva, não só um alívio de momento.",
    busca: "tratamento para dor lombar, fisioterapia para coluna, tratamento para dor nas costas",
    destino: "página de lombalgia",
  },
  {
    tag: "Performance Max",
    titulo: "Maps, YouTube, Discover e Gmail",
    texto: "Mostra a clínica para quem está por perto e tem o mesmo interesse, usando as fotos reais do atendimento. Alcança quem ainda não digitou a busca, mas já está no momento.",
    busca: "sinais de busca por quiropraxia, hérnia, dor lombar e fisioterapia de coluna",
    destino: "página inicial do site",
  },
];

const FLUXO = [
  { t: "Google", d: "traz ao site quem está procurando tratamento" },
  { t: "Site", d: "apresenta o tratamento e registra a visita" },
  { t: "Instagram", d: "reencontra quem visitou e ainda não chamou" },
  { t: "WhatsApp", d: "a conversa com você, onde vira agendamento" },
];

const PASSOS = [
  { t: "Responder rápido", d: "Quem recebe resposta em poucos minutos agenda muito mais do que quem espera horas. As mensagens chegam no (11) 91352-8080." },
  { t: "Nos contar o que virou agendamento", d: "Uma vez por semana, quantas conversas chegaram e quantas viraram avaliação. É o que separa curioso de paciente e mostra onde investir mais." },
  { t: "Acesso ao Perfil da Empresa no Google", d: "Com o perfil da clínica vinculado, o endereço e as avaliações passam a aparecer junto dos anúncios e no Google Maps." },
  { t: "Convênio ou particular", d: "Confirmar se atende algum convênio. Se for só particular, filtramos quem busca por plano de saúde e a verba vai só para quem pode agendar." },
];

export default function DrSamuelPage() {
  return (
    <main>
      {/* Abertura */}
      <header className="ds-hero">
        <div className="ds-hero-img" />
        <div className="ds-wrap ds-hero-top">
          <LogoDDG />
          <span className="ds-x">×</span>
          <span className="ds-cli">Dr. Samuel Chagas</span>
        </div>
        <div className="ds-wrap ds-hero-body">
          <p className="ds-kicker">Estrutura de anúncios · Google + Instagram</p>
          <h1>
            Estrutura pronta.
            <br />
            <span className="ds-gold">No ar a partir de 01/10.</span>
          </h1>
          <p className="ds-lead">
            Hoje fizemos a validação final de toda a estrutura (rastreamento, textos, páginas de destino, região e
            orçamento) e deixamos os últimos detalhes ajustados. A partir de amanhã, as campanhas rodam no Google e no
            Instagram com um único objetivo: <b>colocar pacientes da região conversando com você no WhatsApp.</b>
          </p>
          <div className="ds-kpis">
            <div className="ds-hk"><div className="l">Investimento</div><div className="v ds-num ds-gold">R$ 2.000</div><div className="s">por mês: R$ 1.000 Google e R$ 1.000 Meta</div></div>
            <div className="ds-hk"><div className="l">Região</div><div className="v ds-num ds-gold">6 km</div><div className="s">ao redor da clínica, na Cidade Monções</div></div>
            <div className="ds-hk"><div className="l">Destino</div><div className="v ds-num ds-gold">WhatsApp</div><div className="s">(11) 91352-8080 e perfil do Instagram</div></div>
            <div className="ds-hk"><div className="l">Início</div><div className="v ds-num ds-gold">01/10</div><div className="s">quinta-feira, com as 6 frentes no ar</div></div>
          </div>
        </div>
      </header>

      {/* Investimento */}
      <section className="ds-sec">
        <div className="ds-wrap">
          <p className="ds-kicker">Para onde vai o investimento</p>
          <h2>
            R$ 2.000 por mês,
            <br />
            <span className="ds-gold">em frentes que se completam.</span>
          </h2>
          <p className="ds-sub">
            Metade no Google, para quem está procurando tratamento agora. Metade no Instagram, para reencontrar quem já
            conheceu o seu trabalho e apresentar você a quem tem o mesmo perfil.
          </p>

          <div className="ds-split">
            <div className="a">30%</div>
            <div className="b">20%</div>
            <div className="c">35%</div>
            <div className="d">15%</div>
          </div>
          <div className="ds-leg">
            <div><b>Google · Pesquisa</b>R$ 600 por mês</div>
            <div><b>Google · Performance Max</b>R$ 400 por mês</div>
            <div><b>Instagram · Remarketing</b>R$ 700 por mês</div>
            <div><b>Instagram · Semelhante</b>R$ 300 por mês</div>
          </div>

          <div className="ds-tw">
            <table>
              <thead>
                <tr><th>Canal</th><th>Campanha</th><th>O que faz</th><th className="n">Por dia</th><th className="n">Por mês</th></tr>
              </thead>
              <tbody>
                {VERBA.map((v) => (
                  <tr key={v.nome}>
                    <td><span className="ds-ch">{v.canal}</span></td>
                    <td><b>{v.nome}</b></td>
                    <td>{v.faz}</td>
                    <td className="n">{v.dia}</td>
                    <td className="n"><b>{v.mes}</b></td>
                  </tr>
                ))}
                <tr className="tot"><td></td><td>Total</td><td></td><td className="n">≈ R$ 66</td><td className="n">R$ 2.000</td></tr>
              </tbody>
            </table>
          </div>

          <div className="ds-destaque">
            <p>Os dois lados trabalham juntos. O Google traz ao site quem está procurando tratamento; o Instagram reencontra quem visitou e ainda não chamou.</p>
            <p>Por isso a verba da Meta está concentrada no remarketing: cada visita que o Google gera vira público quente no Instagram. Quanto mais o Google trabalha, mais forte fica o remarketing.</p>
          </div>
        </div>
      </section>

      {/* Google */}
      <section className="ds-sec">
        <div className="ds-wrap">
          <p className="ds-kicker">Google Ads · R$ 1.000 por mês</p>
          <h2>
            Quem procura,
            <br />
            <span className="ds-gold">encontra você primeiro.</span>
          </h2>
          <p className="ds-sub">
            A Rede de Pesquisa aparece no momento exato em que a pessoa digita o problema dela no Google. São três
            frentes, cada uma com anúncio próprio, levando para a página do site que fala exatamente daquilo que ela
            buscou.
          </p>

          <div className="ds-grid">
            {FRENTES_GOOGLE.map((f) => (
              <div className="ds-card" key={f.titulo}>
                <div className="tag">{f.tag}</div>
                <h3>{f.titulo}</h3>
                <p>{f.texto}</p>
                <div className="kw">
                  <b>Quem busca:</b> {f.busca}
                  <br />
                  <b>Destino:</b> {f.destino}
                </div>
              </div>
            ))}
          </div>

          <div className="ds-band">
            <p>
              <b>Em todos os anúncios:</b> botão para ligar direto para a clínica, atalhos para as páginas de hérnia,
              lombar, ciático, pescoço e escoliose, horário de atendimento e o registro no Crefito. Tudo limitado a{" "}
              <b>6 km da clínica</b>: Brooklin, Campo Belo, Vila Olímpia, Itaim Bibi, Moema, Morumbi e arredores. Buscas
              de curso, emprego, conteúdo gratuito e exercício em casa ficam bloqueadas para a verba ir só para quem quer
              ser atendido.
            </p>
          </div>

          <div className="ds-photo" style={{ backgroundImage: "url('/drsamuel/google.jpg')" }} />
        </div>
      </section>

      {/* Meta */}
      <section className="ds-sec">
        <div className="ds-wrap">
          <p className="ds-kicker">Meta Ads · R$ 1.000 por mês · Instagram</p>
          <h2>
            Quem conheceu, volta.
            <br />
            <span className="ds-gold">Quem é parecido, conhece.</span>
          </h2>
          <p className="ds-sub">
            Toda a verba da Meta roda no Instagram (feed, stories e reels) com dois destinos: a conversa no WhatsApp e a
            visita ao seu perfil, que é onde o paciente vê os seus vídeos e ganha confiança antes de marcar.
          </p>

          <div className="ds-grid">
            <div className="ds-card">
              <div className="pct ds-num ds-gold">70%</div>
              <div className="val">R$ 700 por mês · Remarketing</div>
              <h3>Quem já visitou o site</h3>
              <p>
                Para quem entrou no site e ainda não chamou. É o público mais quente: já conhece o seu trabalho, já leu
                sobre o problema que tem e está a um toque de agendar. Os anúncios reaparecem para essas pessoas no feed,
                nos stories e nos reels.
              </p>
              <div className="kw"><b>Destino:</b> conversa no WhatsApp</div>
            </div>
            <div className="ds-card">
              <div className="pct ds-num ds-gold">30%</div>
              <div className="val">R$ 300 por mês · Público semelhante</div>
              <h3>Quem tem o mesmo perfil</h3>
              <p>
                A Meta encontra, na região, pessoas com comportamento parecido com quem visita o seu site. Elas conhecem
                o Dr. Samuel pelo Instagram, visitam o perfil e, se entram no site, passam a receber o remarketing.
              </p>
              <div className="kw"><b>Destino:</b> perfil @dr.samuelchagas e WhatsApp</div>
            </div>
          </div>

          <p className="ds-kicker" style={{ marginTop: 36 }}>Como tudo se conecta</p>
          <div className="ds-flow">
            {FLUXO.map((f, i) => (
              <div className="ds-fstep" key={f.t}>
                <div className="n">0{i + 1}</div>
                <div className="t">{f.t}</div>
                <div className="d">{f.d}</div>
              </div>
            ))}
          </div>

          <div className="ds-photo" style={{ backgroundImage: "url('/drsamuel/meta.jpg')" }} />
        </div>
      </section>

      {/* Medição */}
      <section className="ds-sec">
        <div className="ds-wrap">
          <p className="ds-kicker">Medição</p>
          <h2>
            Cada conversa
            <br />
            <span className="ds-gold">tem origem.</span>
          </h2>
          <p className="ds-sub">
            A estrutura foi montada para responder a pergunta que importa: de onde veio cada paciente. Assim a verba vai
            para o que traz conversa, e sai do que não traz.
          </p>
          <div className="ds-med">
            <div className="ds-mc"><div className="who">WhatsApp do site</div><div className="what">Cada clique que abre uma conversa é registrado, junto com a campanha e a busca que trouxeram a pessoa.</div></div>
            <div className="ds-mc"><div className="who">Ligação pelo anúncio</div><div className="what">Chamadas feitas direto do anúncio do Google contam como resultado, com duração mínima para filtrar engano.</div></div>
            <div className="ds-mc"><div className="who">Visitas ao site</div><div className="what">Cada visita alimenta os públicos do Instagram. É o que mantém o remarketing sempre abastecido.</div></div>
          </div>

          <p className="ds-kicker" style={{ marginTop: 44 }}>O que esperar</p>
          <div className="ds-tl">
            <div className="ds-tl-i"><div className="w">01/10 · Início</div><p>As campanhas entram no ar no Google e no Instagram. As primeiras mensagens começam a chegar já nos primeiros dias.</p></div>
            <div className="ds-tl-i"><div className="w">Semanas 1 e 2 · Aprendizado</div><p>Google e Meta testam buscas, públicos e anúncios para descobrir o que traz conversa. Acompanhamos todos os dias e cortamos o que não traz paciente.</p></div>
            <div className="ds-tl-i"><div className="w">Semanas 3 e 4 · Ajuste fino</div><p>Com os primeiros resultados, a verba passa a se concentrar nas buscas e nos públicos que mais geram conversa.</p></div>
            <div className="ds-tl-i"><div className="w">Fim do mês · Relatório</div><p>Você recebe o resultado do mês: quantas conversas chegaram, quanto custou cada uma e de onde vieram.</p></div>
          </div>
        </div>
      </section>

      {/* Próximos passos */}
      <section className="ds-sec">
        <div className="ds-wrap">
          <p className="ds-kicker">A partir de agora</p>
          <h2>
            O anúncio traz a conversa.
            <br />
            <span className="ds-gold">O atendimento fecha o paciente.</span>
          </h2>
          <p className="ds-sub">
            A parte da mídia está pronta. Para o resultado aparecer por completo, quatro pontos do seu lado fazem toda a
            diferença.
          </p>
          <div className="ds-passos">
            {PASSOS.map((p, i) => (
              <div className="ds-passo" key={p.t}>
                <div className="n ds-num ds-gold">0{i + 1}</div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>

          <div className="ds-destaque">
            <p>Resumo: R$ 2.000 por mês, 6 frentes no ar a partir de 01/10, todas levando ao seu WhatsApp e ao seu Instagram, com cada conversa medida desde a origem.</p>
            <p>Qualquer dúvida sobre a estrutura, é só chamar. Seguimos acompanhando de perto a partir de amanhã.</p>
          </div>

          <p className="ds-final">
            A partir de amanhã, cada real investido
            <br />
            <span className="ds-gold">tem um destino: uma conversa com você.</span>
          </p>
        </div>
      </section>

      <footer className="ds-footer">
        <div className="ds-wrap">
          <LogoDDG />
          <p>Estrutura de anúncios · Dr. Samuel Chagas · Setembro de 2026</p>
        </div>
      </footer>
    </main>
  );
}
