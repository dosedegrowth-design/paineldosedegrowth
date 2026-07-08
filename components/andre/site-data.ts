/* Conteúdo institucional das páginas de detalhe — produtos, marcas e
   segmentos, espelhando o inventário do climafrio.com.br (8 linhas de
   produto, 6 marcas, 8 aplicações), com copy técnica própria. */

export type DetailItem = {
  slug: string;
  nome: string;
  titulo: string;
  resumo: string;
  corpo: string[];
  destaques: string[];
};

export const PRODUTOS: DetailItem[] = [
  {
    slug: "split",
    nome: "Split",
    titulo: "Ar Condicionado Split",
    resumo:
      "A linha mais versátil do mercado: condensadora externa, evaporadora interna e o silêncio que o ambiente pede.",
    corpo: [
      "O sistema Split separa a unidade condensadora (externa) da evaporadora (interna), levando o compressor — e o ruído — pra fora do ambiente. É a solução padrão pra quartos, salas, escritórios e consultórios de pequeno e médio porte.",
      "A Climafrio dimensiona a capacidade pela carga térmica real do ambiente — insolação, ocupação, equipamentos — e instala com materiais originais, tubulação corretamente isolada e teste de estanqueidade antes da carga de gás.",
    ],
    destaques: [
      "Capacidades de 9.000 a 60.000 BTU/h",
      "Versões Hi Wall, Piso Teto e Cassete",
      "Tecnologia inverter com até 60% de economia",
      "Gás R-410A e R-32, sem CFC",
    ],
  },
  {
    slug: "hi-wall",
    nome: "Hi Wall",
    titulo: "Ar Condicionado Hi Wall",
    resumo:
      "A evaporadora de parede que virou sinônimo de split: compacta, silenciosa e discreta no ambiente.",
    corpo: [
      "Hi Wall é a configuração de evaporadora instalada no alto da parede — a mais comum em residências e escritórios pela instalação simples, custo acessível e distribuição de ar eficiente pra ambientes de até 40 m².",
      "Trabalhamos com as linhas Hi Wall de todas as marcas parceiras, incluindo modelos inverter de alta eficiência energética (selo Procel A) e unidades com filtragem avançada pra quem tem alergia ou rinite.",
    ],
    destaques: [
      "Instalação rápida e discreta",
      "Modelos inverter com selo Procel A",
      "Níveis de ruído a partir de 21 dB",
      "Filtros de alta densidade opcionais",
    ],
  },
  {
    slug: "multi-split",
    nome: "Multi Split",
    titulo: "Ar Condicionado Multi Split",
    resumo:
      "Vários ambientes climatizados com uma única condensadora — a solução quando falta espaço externo.",
    corpo: [
      "O Multi Split conecta até cinco evaporadoras internas a uma única unidade condensadora externa. É a resposta pra apartamentos e casas onde a fachada, a varanda técnica ou o condomínio limitam o número de unidades externas.",
      "Cada ambiente mantém controle individual de temperatura, e o sistema inverter modula a potência conforme a demanda combinada — menos consumo e menos ruído externo.",
    ],
    destaques: [
      "Até 5 ambientes com 1 condensadora",
      "Controle individual por ambiente",
      "Ideal pra prédios com restrição de fachada",
      "Evaporadoras Hi Wall, Cassete ou Duto",
    ],
  },
  {
    slug: "multi-v",
    nome: "Multi V",
    titulo: "Ar Condicionado Multi V",
    resumo:
      "A plataforma VRF da LG pra edifícios: controle zona a zona com eficiência de ponta.",
    corpo: [
      "Multi V é a família VRF (fluxo de refrigerante variável) da LG, projetada pra edifícios comerciais e residenciais de grande porte. Uma central externa alimenta dezenas de unidades internas, cada uma com setpoint independente.",
      "A Climafrio projeta, instala e mantém sistemas Multi V com integração à automação predial — do levantamento de carga térmica ao comissionamento assistido e à manutenção contratual.",
    ],
    destaques: [
      "Compressores inverter de alta eficiência",
      "Recuperação de calor entre zonas",
      "Integração com automação predial (BMS)",
      "Longos trechos de tubulação sem perda",
    ],
  },
  {
    slug: "vrf",
    nome: "VRF",
    titulo: "Ar Condicionado VRF",
    resumo:
      "Fluxo de refrigerante variável: o sistema central multi split pra quem precisa de escala com controle fino.",
    corpo: [
      "VRF (variable refrigerant flow) é um sistema de climatização central do tipo multi split desenvolvido pra residências amplas e edifícios comerciais: uma ou mais condensadoras alimentam até 64 unidades internas, com vazão de refrigerante modulada por controle microprocessado.",
      "O resultado é instalação mais simples que sistemas de água gelada, baixo nível de ruído, baixo consumo elétrico e expansão modular — o sistema cresce com o edifício. A Climafrio executa o ciclo completo: projeto, instalação, comissionamento e manutenção.",
    ],
    destaques: [
      "Até 64 unidades internas por sistema",
      "Refrigerante R-410A com controle microprocessado",
      "Expansão modular por etapas de obra",
      "Interface com automação e LonWorks",
    ],
  },
  {
    slug: "vrv",
    nome: "VRV",
    titulo: "Ar Condicionado VRV",
    resumo:
      "A tecnologia original da Daikin — criadora do conceito de volume de refrigerante variável.",
    corpo: [
      "VRV (variable refrigerant volume) é a marca registrada da Daikin pro conceito que ela mesma inventou em 1982 e que o mercado conhece genericamente como VRF. As gerações atuais — VRV IV e derivadas — seguem sendo referência em eficiência e confiabilidade.",
      "Como parceira Daikin, a Climafrio especifica e instala sistemas VRV pra projetos corporativos, hoteleiros e residenciais de alto padrão, com garantia de fábrica e manutenção especializada.",
    ],
    destaques: [
      "Tecnologia criada pela Daikin em 1982",
      "Referência em eficiência energética",
      "Ideal pra corporativo e hotelaria",
      "Garantia de fábrica com rede autorizada",
    ],
  },
  {
    slug: "self-contained",
    nome: "Self Contained",
    titulo: "Ar Condicionado Self Contained",
    resumo:
      "Climatização robusta em gabinete único pra grandes áreas e ambientes de missão crítica.",
    corpo: [
      "O Self Contained reúne todos os componentes do ciclo de refrigeração num único gabinete de grande capacidade, com distribuição por dutos. É o equipamento clássico pra lojas de grande área, agências bancárias, teatros e centrais de telecomunicação.",
      "Em versões de precisão, atende data centers e salas técnicas onde temperatura e umidade precisam de controle contínuo, 24 horas por dia — com redundância e manutenção preventiva rigorosa.",
    ],
    destaques: [
      "Capacidades de 3 a 40 TR por gabinete",
      "Distribuição por rede de dutos",
      "Versões de precisão pra data centers",
      "Condensação a ar ou a água",
    ],
  },
  {
    slug: "chiller",
    nome: "Chiller",
    titulo: "Ar Condicionado Chiller",
    resumo:
      "Centrais de água gelada pra plantas industriais, hospitais e shopping centers.",
    corpo: [
      "O Chiller resfria água que circula por fan coils e climatizadores distribuídos pela edificação — a arquitetura padrão pra grandes cargas térmicas: indústrias, hospitais, shoppings, aeroportos e edifícios corporativos de grande porte.",
      "A Climafrio projeta centrais de água gelada completas — chillers, bombas, torres de resfriamento e automação — e mantém contratos de operação e manutenção que garantem eficiência ao longo de toda a vida útil da planta.",
    ],
    destaques: [
      "Condensação a ar ou a água",
      "Compressores parafuso, scroll e centrífugos",
      "Projetos com redundância N+1",
      "Contratos de operação e manutenção",
    ],
  },
];

export const MARCAS: DetailItem[] = [
  {
    slug: "springer-midea",
    nome: "Springer Midea",
    titulo: "Ar Condicionado Springer Midea",
    resumo:
      "A união da tradição brasileira Springer com a escala global da Midea — líder em residencial.",
    corpo: [
      "A Springer Midea combina uma das marcas mais tradicionais do Brasil com a maior fabricante de ar-condicionado do mundo. O resultado é um portfólio forte em residencial e comercial leve, com ótima disponibilidade de peças e assistência.",
      "A Climafrio trabalha com as linhas Springer Midea do Hi Wall inverter ao piso teto, sempre com garantia de fábrica.",
    ],
    destaques: [
      "Líder do mercado residencial brasileiro",
      "Linhas AirVolution e Xtreme Save inverter",
      "Ampla rede de peças e assistência",
      "Ótimo custo-benefício em pequeno porte",
    ],
  },
  {
    slug: "elgin",
    nome: "Elgin",
    titulo: "Ar Condicionado Elgin",
    resumo:
      "Marca brasileira com portfólio completo e custo-benefício agressivo do residencial ao comercial.",
    corpo: [
      "A Elgin construiu no ar-condicionado a mesma reputação de solidez que tem em outras linhas industriais: produtos confiáveis, bem distribuídos e com preço competitivo — do Hi Wall Eco Inverter às cassetes e piso teto comerciais.",
      "É frequentemente a especificação da Climafrio quando o projeto pede equilíbrio entre investimento inicial e custo de operação.",
    ],
    destaques: [
      "Linha Eco Inverter de alta eficiência",
      "Portfólio residencial e comercial completo",
      "Marca brasileira com suporte nacional",
      "Excelente relação preço/desempenho",
    ],
  },
  {
    slug: "lg",
    nome: "LG",
    titulo: "Ar Condicionado LG",
    resumo:
      "Tecnologia coreana de ponta: do Dual Inverter residencial à plataforma Multi V pra edifícios.",
    corpo: [
      "A LG é referência em inovação: o compressor Dual Inverter reduziu consumo e ruído no residencial, e a plataforma Multi V é uma das famílias VRF mais instaladas em edifícios corporativos no Brasil.",
      "A Climafrio projeta e instala soluções LG do split residencial ao VRF predial com integração à automação.",
    ],
    destaques: [
      "Compressor Dual Inverter — até 70% de economia",
      "Plataforma Multi V pra grandes edifícios",
      "Conectividade Wi-Fi ThinQ nativa",
      "10 anos de garantia no compressor",
    ],
  },
  {
    slug: "samsung",
    nome: "Samsung",
    titulo: "Ar Condicionado Samsung",
    resumo:
      "Do WindFree sem vento direto ao DVM corporativo — conforto com tecnologia embarcada.",
    corpo: [
      "A Samsung trouxe pro ar-condicionado a mesma engenharia dos seus eletrônicos: a linha WindFree climatiza sem jato de ar direto no corpo, e a plataforma DVM atende projetos VRF de grande porte.",
      "É a escolha da Climafrio pra clientes que priorizam conforto percebido e integração com casa inteligente.",
    ],
    destaques: [
      "Tecnologia WindFree — sem vento direto",
      "Plataforma DVM pra projetos VRF",
      "Integração SmartThings nativa",
      "Modelos inverter de alta eficiência",
    ],
  },
  {
    slug: "daikin",
    nome: "Daikin",
    titulo: "Ar Condicionado Daikin",
    resumo:
      "A inventora do VRV e maior especialista em climatização do mundo — referência em qualidade.",
    corpo: [
      "A Daikin é a única grande fabricante global dedicada exclusivamente a climatização — e foi ela que inventou o conceito VRV em 1982. Do Split Hi Wall inverter ao VRV de grandes edifícios e chillers, é sinônimo de confiabilidade.",
      "A Climafrio especifica Daikin em projetos onde a vida útil e a estabilidade de operação são o critério decisivo.",
    ],
    destaques: [
      "Criadora da tecnologia VRV (1982)",
      "Especialista global exclusiva em HVAC",
      "Linhas do residencial ao chiller",
      "Níveis de ruído a partir de 22 dB",
    ],
  },
  {
    slug: "carrier",
    nome: "Carrier",
    titulo: "Ar Condicionado Carrier",
    resumo:
      "A empresa do inventor do ar-condicionado moderno — força máxima em chillers e grandes sistemas.",
    corpo: [
      "Willis Carrier inventou o ar-condicionado moderno em 1902, e a empresa que leva seu nome segue sendo referência mundial — especialmente em chillers, self contained e sistemas aplicados de grande porte.",
      "Nos projetos industriais e hospitalares da Climafrio, a linha de chillers Carrier é presença constante.",
    ],
    destaques: [
      "Herdeira do inventor do ar-condicionado",
      "Referência mundial em chillers",
      "Linha AquaEdge de alta eficiência",
      "Forte em sistemas aplicados de grande porte",
    ],
  },
];

export const SEGMENTOS_DATA: DetailItem[] = [
  {
    slug: "hospitalar",
    nome: "Hospitalar",
    titulo: "Climatização Hospitalar",
    resumo:
      "Temperatura, umidade, filtragem e pressurização controladas pra áreas onde o clima é item de segurança.",
    corpo: [
      "Em ambiente hospitalar, climatização não é conforto — é controle de infecção. Centros cirúrgicos, UTIs, CMEs e isolamentos exigem renovação de ar, filtragem em estágios, pressurização diferencial e monitoramento contínuo, conforme os requisitos normativos do segmento.",
      "A Climafrio projeta e mantém sistemas hospitalares com fan coils, self contained de precisão e centrais de água gelada, incluindo planos de manutenção com registro documentado.",
    ],
    destaques: [
      "Pressurização diferencial por área",
      "Filtragem em múltiplos estágios",
      "Renovação de ar conforme norma",
      "Manutenção com registro documentado",
    ],
  },
  {
    slug: "industrial",
    nome: "Industrial",
    titulo: "Climatização Industrial",
    resumo:
      "Clima de processo e conforto térmico pra linhas de produção que não podem parar.",
    corpo: [
      "Na indústria, temperatura e umidade afetam diretamente o processo: precisão dimensional, cura de materiais, eletrônica sensível, conforto e produtividade das equipes. O sistema precisa ser dimensionado pra carga térmica das máquinas — não só do ambiente.",
      "A Climafrio atende plantas industriais com chillers, self contained e sistemas de ventilação e exaustão, sempre com plano de manutenção que acompanha o calendário de produção.",
    ],
    destaques: [
      "Dimensionamento pela carga de processo",
      "Chillers e self contained industriais",
      "Ventilação e exaustão integradas",
      "Manutenção alinhada à produção",
    ],
  },
  {
    slug: "sala-limpa",
    nome: "Sala Limpa",
    titulo: "Climatização de Sala Limpa",
    resumo:
      "Ambientes classificados com controle de particulado pra farmacêutica, laboratórios e eletrônica.",
    corpo: [
      "Salas limpas exigem controle simultâneo de particulado, temperatura, umidade e pressão — com classificação por norma e validação periódica. O sistema de climatização é o coração do ambiente: cascatas de pressão, filtros absolutos e renovação de ar calculada.",
      "A Climafrio projeta e mantém sistemas pra salas limpas farmacêuticas, laboratoriais e de eletrônica, incluindo balanceamento e requalificação.",
    ],
    destaques: [
      "Cascatas de pressão entre ambientes",
      "Filtragem absoluta (HEPA)",
      "Controle fino de umidade relativa",
      "Balanceamento e requalificação periódica",
    ],
  },
  {
    slug: "comercial",
    nome: "Comercial",
    titulo: "Climatização Comercial",
    resumo:
      "Lojas, escritórios, restaurantes e hotéis: conforto do cliente com conta de energia sob controle.",
    corpo: [
      "No varejo e nos serviços, o clima é parte da experiência: um ambiente agradável segura o cliente; um sistema barulhento ou gotejando espanta. Ao mesmo tempo, o ar-condicionado costuma ser o maior item da conta de energia.",
      "A Climafrio projeta sistemas comerciais — de splits e cassetes a VRF — equilibrando conforto, estética (dutos e cassetes embutidos) e eficiência, com manutenção que evita paradas em horário de operação.",
    ],
    destaques: [
      "Cassete e dutado pra estética limpa",
      "VRF pra lojas de rede e escritórios",
      "Eficiência energética como premissa",
      "Manutenção fora do horário comercial",
    ],
  },
  {
    slug: "residencial",
    nome: "Residencial",
    titulo: "Climatização Residencial",
    resumo:
      "Do quarto do bebê à casa de alto padrão: silêncio, estética e o clima certo em cada cômodo.",
    corpo: [
      "Em casa, os critérios são silêncio, estética e saúde do ar. A Climafrio dimensiona cada ambiente individualmente — insolação, pé-direito, ocupação — e especifica de split simples a multi split e VRF residencial com dutos embutidos no gesso.",
      "Instalação limpa, sem quebra-quebra desnecessário, com tubulação embutida planejada junto com a obra ou reforma sempre que possível.",
    ],
    destaques: [
      "Projeto cômodo a cômodo",
      "Modelos silenciosos a partir de 21 dB",
      "Dutados embutidos pra alto padrão",
      "Higienização periódica pra saúde do ar",
    ],
  },
  {
    slug: "ambientes",
    nome: "Ambientes",
    titulo: "Climatização de Ambientes",
    resumo:
      "Auditórios, salas de reunião, academias, igrejas: cada uso pede uma estratégia de clima.",
    corpo: [
      "Ambientes de uso intenso e ocupação variável — auditórios, salas de treinamento, academias, templos — têm carga térmica que muda drasticamente ao longo do dia. O sistema precisa responder rápido sem desperdiçar energia no vazio.",
      "A Climafrio combina equipamentos inverter, zoneamento e renovação de ar dimensionada pela ocupação máxima, com controles que se adaptam ao uso real.",
    ],
    destaques: [
      "Carga térmica por cenário de ocupação",
      "Zoneamento com controle independente",
      "Renovação de ar pra ocupação máxima",
      "Resposta rápida com inverter",
    ],
  },
  {
    slug: "galpoes",
    nome: "Galpões",
    titulo: "Climatização de Galpões",
    resumo:
      "Grandes vãos com distribuição de ar uniforme pra logística, eventos e varejo atacadista.",
    corpo: [
      "Galpões desafiam qualquer sistema: pé-direito alto, grandes aberturas, cobertura metálica que irradia calor. A solução passa por equipamentos de grande vazão, distribuição por dutos ou ventilação de deslocamento e, muitas vezes, soluções híbridas com exaustão.",
      "A Climafrio dimensiona pra o uso real do galpão — operação logística, evento, indústria leve — priorizando uniformidade de temperatura na zona ocupada.",
    ],
    destaques: [
      "Self contained e rooftop de grande vazão",
      "Distribuição pra pé-direito alto",
      "Soluções híbridas com exaustão",
      "Foco na zona ocupada, não no teto",
    ],
  },
  {
    slug: "salas-climatizadas",
    nome: "Salas Climatizadas",
    titulo: "Salas Climatizadas",
    resumo:
      "Salas técnicas, de servidores e de equipamentos: climatização de precisão operando 24/7.",
    corpo: [
      "Salas de TI, nobreaks, telecom e equipamentos sensíveis precisam de temperatura e umidade estáveis o ano inteiro, 24 horas por dia — com redundância pra falha e alarme pra desvio. Um sistema de conforto comum não foi feito pra isso.",
      "A Climafrio projeta salas climatizadas com equipamentos de precisão, redundância N+1 e contratos de manutenção com atendimento prioritário.",
    ],
    destaques: [
      "Operação contínua 24/7",
      "Controle de precisão de temperatura e umidade",
      "Redundância N+1 contra falhas",
      "Atendimento prioritário em contrato",
    ],
  },
];

export function findBySlug(list: DetailItem[], slug: string) {
  return list.find((i) => i.slug === slug);
}
