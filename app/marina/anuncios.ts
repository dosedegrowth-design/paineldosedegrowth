// Estrutura de anuncios Meta - Marina Saleme - Outubro 2026
// Campanha 120250690296280535 - 4 conjuntos, 26 anuncios, CBO R$ 225/dia

const CDN = "https://cdn.shopify.com/s/files/1/0272/7929/4543/files";

export type Anuncio = {
  n: string;
  nome: string;
  conjunto: string;
  legenda: string;
  img: string;
  produto: string;
};

export const CONJUNTOS = ["Sevilha", "Ipanema", "Leque", "Sacolões"] as const;

export const ANUNCIOS: Anuncio[] = [
  {
    n: "01",
    nome: "Chemise Sevilha Vermelho",
    conjunto: "Sevilha",
    legenda:
      "Chemise em linho, leve e arejada. Corte reto levemente acinturado, abotoamento de cima a baixo e mangas 3/4 com regulador em botão. Pode ser usada solta ou com cinto, sozinha ou compondo com a Calça Sevilha Vermelha.",
    img: `${CDN}/ADS_01_Chemise_Sevilha_Vermelho_FEED_4x5_1137c9c3-58eb-47bd-916a-186e63929eca.jpg`,
    produto: "chemise-sevilha-azul-copia",
  },
  {
    n: "02",
    nome: "Chemise Sevilha Azul",
    conjunto: "Sevilha",
    legenda:
      "Chemise em linho, leve e arejada. Corte reto levemente acinturado, abotoamento de cima a baixo e mangas 3/4 com regulador em botão. Compõe com a Calça Sevilha Azul.",
    img: `${CDN}/ADS_02_Chemise_Sevilha_Azul_FEED_4x5_bb59b692-47e4-42f2-b199-9e9ad34d7a71.jpg`,
    produto: "chemise-sevilha-azul",
  },
  {
    n: "03",
    nome: "Calça Sevilha Vermelha",
    conjunto: "Sevilha",
    legenda:
      "Calça 100% linho, com modelagem reta e confortável. Possui cós alto e largo. Compõe com a Chemise Sevilha Vermelho.",
    img: `${CDN}/ADS_03_Calca_Sevilha_Vermelha_FEED_4x5_205cbf6f-3df9-44ff-8df4-54df89256ea2.jpg`,
    produto: "calca-reta-stripes-preto-copia",
  },
  {
    n: "04",
    nome: "Calça Sevilha Azul",
    conjunto: "Sevilha",
    legenda:
      "Calça 100% linho, modelagem reta e cós alto e largo. Acompanha a Chemise Sevilha Azul e fecha o conjunto da coleção.",
    img: `${CDN}/ADS_04_Calca_Sevilha_Azul_FEED_4x5_4bbd7d48-0be0-42ea-9b7b-c99b061a1e86.jpg`,
    produto: "calca-reta-stripes-vermelho-copia",
  },
  {
    n: "05",
    nome: "Caftan Sevilha Vermelho",
    conjunto: "Sevilha",
    legenda:
      "O Caftan Sevilha Vermelho é fluido e envolvente, de decote em V e mangas curtas amplas. Veste com facilidade e resolve o look inteiro sozinho.",
    img: `${CDN}/ADS_05_Caftan_Sevilha_Vermelho_FEED_4x5_289e9486-2639-4a7f-aa20-24c9758572c3.jpg`,
    produto: "caftan-sevilha-vermelho",
  },
  {
    n: "06",
    nome: "Kimono Bali Sevilha",
    conjunto: "Sevilha",
    legenda:
      "Kimono longo e aberto, de mangas amplas e comprimento abaixo do joelho. Base azul turquesa com palmeira dourada ao centro, panteras e barrado vermelho. Veste por cima de qualquer base lisa.",
    img: `${CDN}/ADS_06_Kimono_Bali_Sevilha_FEED_4x5_e488f242-359e-4d60-ae90-513d9cd5bdfb.jpg`,
    produto: "kimono-bali-sevilha",
  },
  {
    n: "07",
    nome: "Camisa Ana Sevilha",
    conjunto: "Sevilha",
    legenda:
      "A camisa Ana é de corte clássico, com colarinho e punho. Não é larga nem justa: tem o caimento perfeito. Pode ser usada por dentro ou por fora da calça.",
    img: `${CDN}/ADS_07_Camisa_Ana_Sevilha_FEED_4x5_471567c0-d269-4b23-9dca-f5cc4aaa4acb.jpg`,
    produto: "camisa-ana-sevilha",
  },
  {
    n: "08",
    nome: "Camisa T Sevilha",
    conjunto: "Sevilha",
    legenda:
      "A Camisa T tem corte reto e gola careca, com mangas 3/4 e regulador em botão. Ideal para compor com saias, panneaux e calças.",
    img: `${CDN}/ADS_08_Camisa_T_Sevilha_FEED_4x5_8fd159a6-1966-4082-b86c-7295fef4bd46.jpg`,
    produto: "camisa-t-sevilha",
  },
  {
    n: "09",
    nome: "Macacão Sevilha Azul",
    conjunto: "Sevilha",
    legenda:
      "Macacão de decote reto e alças, bem solto no corpo, com ajuste na cintura pelas faixas laterais. Tem bolsos. Uma peça confortável para o verão.",
    img: `${CDN}/ADS_09_Macacao_Sevilha_Azul_FEED_4x5_0918c70f-3a9d-45d1-9b89-f3c95354aca2.jpg`,
    produto: "macacao-stripes-azul",
  },
  {
    n: "10",
    nome: "Lenço Sevilha Rosa",
    conjunto: "Sevilha",
    legenda:
      "Lenço quadrado em base rosa, com a cruz de palmeiras douradas ao centro, panteras e barrado vermelho. Usa na cabeça, no pescoço ou amarrado na alça da bolsa.",
    img: `${CDN}/ADS_10_Lenco_Sevilha_Rosa_FEED_4x5_806b5041-a801-4bfc-b3dd-360655ff2a87.jpg`,
    produto: "lenco-sevilha-rosa",
  },
  {
    n: "11",
    nome: "Camisa T Ipanema Marrom",
    conjunto: "Ipanema",
    legenda:
      "A Camisa T tem corte reto e gola careca, com mangas 3/4 e regulador em botão. A estampa Ipanema em marrom traz o grafismo de elos e ovais. Compõe com a Saia Degrau Ipanema Marrom.",
    img: `${CDN}/ADS_11_Camisa_T_Ipanema_Marrom_FEED_4x5_947e294a-01e3-4904-8f1a-a1279eca5957.jpg`,
    produto: "camisa-t-ipanema",
  },
  {
    n: "12",
    nome: "Camisa Ana Ipanema Marrom",
    conjunto: "Ipanema",
    legenda:
      "A camisa Ana é de corte clássico, com colarinho e punho, na estampa Ipanema em base marrom. Fecha o conjunto com a Saia Degrau Ipanema Marrom.",
    img: `${CDN}/ADS_12_Camisa_Ana_Ipanema_Marrom_FEED_4x5_df03e69d-782e-45ac-bbd0-14ad14b16027.jpg`,
    produto: "camisa-ana-ipanema-marrom",
  },
  {
    n: "13",
    nome: "Camisa Ana Ipanema Amarelo",
    conjunto: "Ipanema",
    legenda:
      "A camisa Ana é de corte clássico, com colarinho e punho, na estampa Ipanema em base amarela. Compõe com a Saia Degrau Ipanema Amarelo.",
    img: `${CDN}/ADS_13_Camisa_Ana_Ipanema_Amarelo_FEED_4x5_bde086b2-12f7-4681-8e6f-d3f0ad0ee241.jpg`,
    produto: "camisa-ana-ipanema-marrom-copia",
  },
  {
    n: "14",
    nome: "Saia Degrau Ipanema Marrom",
    conjunto: "Ipanema",
    legenda:
      "A saia degrau é tipo envelope, com transpasse e o detalhe de duas alturas. Se adapta a qualquer tipo de corpo. Fica ótima com a Camisa T ou a Camisa Ana na mesma estampa.",
    img: `${CDN}/ADS_14_Saia_Degrau_Ipanema_Marrom_FEED_4x5_4c2a672a-3ee0-4e46-8a23-3e7c48624595.jpg`,
    produto: "saia-degrau-ipanema-marrom",
  },
  {
    n: "15",
    nome: "Saia Degrau Ipanema Amarelo",
    conjunto: "Ipanema",
    legenda:
      "A saia degrau é tipo envelope, com transpasse e o detalhe de duas alturas. Base amarela da estampa Ipanema, com ovais brancos e contornos pretos. Última peça em estoque.",
    img: `${CDN}/ADS_15_Saia_Degrau_Ipanema_Amarelo_FEED_4x5_fe9d2934-ab06-4799-9a9c-0c912286f419.jpg`,
    produto: "saia-envelope-tokio-copia",
  },
  {
    n: "16",
    nome: "CONJUNTO Ipanema Marrom · Camisa Ana + Saia Degrau",
    conjunto: "Ipanema",
    legenda:
      "O conjunto Ipanema Marrom: a Camisa Ana de corte clássico com a Saia Degrau envelope, na mesma estampa. Funcionam juntas ou separadas, cada uma com a sua própria página.",
    img: `${CDN}/ADS_16_CONJUNTO_Ipanema_Marrom_FEED_4x5_5434e5f0-f53d-484b-9a94-92de0374be78.jpg`,
    produto: "saia-degrau-ipanema-marrom",
  },
  {
    n: "17",
    nome: "CONJUNTO Ipanema Amarelo · Camisa + Saia Degrau",
    conjunto: "Ipanema",
    legenda:
      "O conjunto Ipanema Amarelo: a camisa com a Saia Degrau envelope, na mesma estampa. Podem ser compradas juntas ou separadas. Resta uma saia em estoque.",
    img: `${CDN}/ADS_17_CONJUNTO_Ipanema_Amarelo_FEED_4x5_f38e6fa5-6d01-477e-a788-7f9a88f89b79.jpg`,
    produto: "saia-envelope-tokio-copia",
  },
  {
    n: "18",
    nome: "Vestido Princesa Leque Berinjela",
    conjunto: "Leque",
    legenda:
      "O Vestido Princesa é feito em algodão, com decote em V e mangas curtas. Tem botões forrados do decote até a altura dos joelhos e uma fenda frontal discreta que abre com o movimento. Última peça.",
    img: `${CDN}/ADS_18_Vestido_Princesa_Leque_Berinjela_FEED_4x5_ed34230d-9e82-4336-98f7-9d6e0a80899d.jpg`,
    produto: "vestido-princesa-leque-roxo",
  },
  {
    n: "19",
    nome: "Vestido Clarice Leque Cinza",
    conjunto: "Leque",
    legenda:
      "O vestido Clarice é amplo e de corte reto. Pode ser usado soltinho ou ajustado na cintura com a faixa entretelada. Tamanho único, veste do P ao GG.",
    img: `${CDN}/ADS_19_Vestido_Clarice_Leque_Cinza_FEED_4x5_872e398d-61f4-473b-bf1e-55d42445cace.jpg`,
    produto: "vestido-clarice-leque-vermelho-copia",
  },
  {
    n: "20",
    nome: "Camisa Lenço Leque Verde",
    conjunto: "Leque",
    legenda:
      "A Camisa Lenço Leque Verde é fluida, de mangas amplas e caimento leve. Conjunto em viscose que compõe com a Calça Leque Verde.",
    img: `${CDN}/ADS_20_Camisa_Lenco_Leque_Verde_FEED_4x5_1898fe89-e897-4155-bf1c-281594914da1.jpg`,
    produto: "camisa-lenco-leque-verde",
  },
  {
    n: "21",
    nome: "Sacolão Rei Rainha Vermelho",
    conjunto: "Sacolões",
    legenda:
      "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Feita em colaboração com Olga Spina Bags.",
    img: `${CDN}/ADS_21b_Sacolao_Rei_Rainha_Vermelho_V3.jpg`,
    produto: "sacolao-rei-rainha",
  },
  {
    n: "22",
    nome: "Sacolão Rei Rainha Mostarda",
    conjunto: "Sacolões",
    legenda:
      "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. A estampa Rei Rainha em base mostarda.",
    img: `${CDN}/ADS_22b_Sacolao_Rei_Rainha_Mostarda_V3.jpg`,
    produto: "sacolao-rei-rainha-mostarda",
  },
  {
    n: "23",
    nome: "Sacolão Stripes Verde",
    conjunto: "Sacolões",
    legenda:
      "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Listras em verde, para a praia e para a cidade.",
    img: `${CDN}/ADS_23_Sacolao_Stripes_Verde_FEED_4x5_6bd0ddf1-e066-4d71-86d1-cac1386ac24f.jpg`,
    produto: "sacolao-stripes-verde",
  },
  {
    n: "24",
    nome: "Sacolão Stripes Vermelho",
    conjunto: "Sacolões",
    legenda:
      "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Listras em vermelho.",
    img: `${CDN}/ADS_24_Sacolao_Stripes_Vermelho_FEED_4x5_d3136c89-84f6-41d8-a86e-78bcc729c352.jpg`,
    produto: "sacolao-stripes-vermelho",
  },
  {
    n: "25",
    nome: "Sacolão Stripes Azul",
    conjunto: "Sacolões",
    legenda:
      "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Listras em azul.",
    img: `${CDN}/ADS_25_Sacolao_Stripes_Azul_FEED_4x5_1ba81a5e-ce31-413c-994c-def5409652f7.jpg`,
    produto: "sacolao-stripes-azul",
  },
  {
    n: "26",
    nome: "CONJUNTO Saia Degrau + Sacolão",
    conjunto: "Sacolões",
    legenda:
      "A saia degrau estampada com o sacolão de lona e alças de couro. Um look de dia inteiro, da rua ao fim de semana. Cada peça tem a sua própria página. Carrossel de dois cards.",
    img: `${CDN}/ADS_14_Saia_Degrau_Ipanema_Marrom_FEED_4x5_4c2a672a-3ee0-4e46-8a23-3e7c48624595.jpg`,
    produto: "sacolao-rei-rainha",
  },
];
