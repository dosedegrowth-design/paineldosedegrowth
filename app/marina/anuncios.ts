// Estrutura de anuncios Meta - Marina Saleme - Outubro 2026
// Campanha 120250690296280535 - 3 conjuntos, 22 anuncios, CBO R$ 225/dia
// Revisao da cliente em 14/10/2026: conjunto Leque saiu inteiro (18, 19, 20),
// o carrossel 26 saiu, 5 e 12 ganharam foto nova e 13 virou Camisa T.

const CDN = "https://cdn.shopify.com/s/files/1/0272/7929/4543/files";

export type Anuncio = {
  n: string;
  nome: string;
  conjunto: string;
  legenda: string;
  img: string;
  produto: string;
};

export const CONJUNTOS = ["Sevilha", "Ipanema", "Sacolões"] as const;

export const ANUNCIOS: Anuncio[] = [
  {
    n: "01",
    nome: "Chemise Sevilha Vermelho",
    conjunto: "Sevilha",
    legenda:
      "Chemise 100% linho. Corte reto levemente acinturado, abotoamento de cima a baixo e mangas 3/4 com regulador em botão. Pode ser usada solta ou com cinto, sozinha ou compondo com a Calça Sevilha Vermelha.",
    img: `${CDN}/ADS_01_Chemise_Sevilha_Vermelho_FEED_4x5_1137c9c3-58eb-47bd-916a-186e63929eca.jpg`,
    produto: "chemise-sevilha-azul-copia",
  },
  {
    n: "02",
    nome: "Chemise Sevilha Azul",
    conjunto: "Sevilha",
    legenda:
      "Chemise 100% linho. Corte reto levemente acinturado, abotoamento de cima a baixo e mangas 3/4 com regulador em botão. Compõe com a Calça Sevilha Azul.",
    img: `${CDN}/ADS_02_Chemise_Sevilha_Azul_FEED_4x5_bb59b692-47e4-42f2-b199-9e9ad34d7a71.jpg`,
    produto: "chemise-sevilha-azul",
  },
  {
    n: "03",
    nome: "Calça Sevilha Vermelha",
    conjunto: "Sevilha",
    legenda:
      "Calça 100% linho, com modelagem reta e confortável. Possui cós alto e largo. Compõe com a Chemise Sevilha e com a Blusa Diva.",
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
    img: `${CDN}/ADS_05b_Caftan_Sevilha_Vermelho.jpg`,
    produto: "caftan-sevilha-vermelho",
  },
  {
    n: "06",
    nome: "Kimono Bali Sevilha",
    conjunto: "Sevilha",
    legenda:
      "Kimono Sevilha 100% seda, com fechamento opcional sem transpasse. Vai por cima de qualquer peça neutra e traz personalidade ao look. Base azul turquesa com palmeira dourada ao centro, panteras e barrado vermelho.",
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
      "O Lenço Sevilha é super versátil: pode ser usado como top, na cintura, no pescoço. Base rosa com a cruz de palmeiras douradas ao centro, panteras e barrado vermelho.",
    img: `${CDN}/ADS_10_Lenco_Sevilha_Rosa_FEED_4x5_806b5041-a801-4bfc-b3dd-360655ff2a87.jpg`,
    produto: "lenco-sevilha-rosa",
  },
  {
    n: "11",
    nome: "Camisa T Ipanema Marrom",
    conjunto: "Ipanema",
    legenda:
      "A Camisa T tem corte reto e gola careca, com mangas 3/4 e regulador em botão. A estampa Ipanema Marrom é atemporal, e compõe com a Saia Degrau Ipanema Marrom.",
    img: `${CDN}/ADS_11_Camisa_T_Ipanema_Marrom_FEED_4x5_947e294a-01e3-4904-8f1a-a1279eca5957.jpg`,
    produto: "camisa-t-ipanema",
  },
  {
    n: "12",
    nome: "Camisa Ana Ipanema Marrom",
    conjunto: "Ipanema",
    legenda:
      "A camisa Ana é de corte clássico, com colarinho e punho, na estampa Ipanema em base marrom. Fecha o conjunto com a Saia Degrau Ipanema Marrom.",
    img: `${CDN}/ADS_12b_Camisa_Ana_Ipanema_Marrom.jpg`,
    produto: "camisa-ana-ipanema-marrom",
  },
  {
    n: "13",
    nome: "Camisa T Ipanema Amarelo",
    conjunto: "Ipanema",
    legenda:
      "A Camisa T tem corte reto e gola careca, com mangas 3/4 e regulador em botão. Na estampa Ipanema Amarelo, compõe com a Saia Degrau Ipanema Amarelo.",
    img: `${CDN}/ADS_13b_Camisa_T_Ipanema_Amarelo.jpg`,
    produto: "camisa-t-ipanema-amarelo",
  },
  {
    n: "14",
    nome: "Saia Degrau Ipanema Marrom",
    conjunto: "Ipanema",
    legenda:
      "A saia degrau é tipo envelope, com transpasse e o detalhe de duas alturas. Se adapta a qualquer tipo de corpo. Fica ótima com a Camisa T ou a Camisa Ana na mesma estampa.",
    img: `${CDN}/ADS_14c_Saia_Degrau_Ipanema_Marrom.jpg`,
    produto: "saia-degrau-ipanema-marrom",
  },
  {
    n: "15",
    nome: "Saia Degrau Ipanema Amarelo",
    conjunto: "Ipanema",
    legenda:
      "A saia degrau é tipo envelope, com transpasse e o detalhe de duas alturas. Na estampa Ipanema Amarelo, compõe muito bem com a Camisa Ana Ipanema Amarelo. Última peça.",
    img: `${CDN}/ADS_15_Saia_Degrau_Ipanema_Amarelo_FEED_4x5_fe9d2934-ab06-4799-9a9c-0c912286f419.jpg`,
    produto: "saia-envelope-tokio-copia",
  },
  {
    n: "16",
    nome: "CONJUNTO Ipanema Marrom · Camisa Lenço + Saia Degrau",
    conjunto: "Ipanema",
    legenda:
      "O conjunto Ipanema Marrom: a Camisa Lenço, de modelagem larga e caimento leve, com a Saia Degrau envelope, na mesma estampa. Funcionam juntas ou separadas, cada uma com a sua própria página.",
    img: `${CDN}/ADS_16_CONJUNTO_Ipanema_Marrom_FEED_4x5_5434e5f0-f53d-484b-9a94-92de0374be78.jpg`,
    produto: "saia-degrau-ipanema-marrom",
  },
  {
    n: "17",
    nome: "CONJUNTO Ipanema Amarelo · Camisa T + Saia Degrau",
    conjunto: "Ipanema",
    legenda:
      "O conjunto Ipanema Amarelo: a Camisa T de gola careca com a Saia Degrau envelope, na mesma estampa. Podem ser compradas juntas ou separadas. Resta uma saia em estoque.",
    img: `${CDN}/ADS_17_CONJUNTO_Ipanema_Amarelo_FEED_4x5_f38e6fa5-6d01-477e-a788-7f9a88f89b79.jpg`,
    produto: "saia-envelope-tokio-copia",
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
    img: `${CDN}/ADS_23b_Sacolao_Stripes_Verde.jpg`,
    produto: "sacolao-stripes-verde",
  },
  {
    n: "24",
    nome: "Sacolão Stripes Vermelho",
    conjunto: "Sacolões",
    legenda:
      "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Listras em vermelho.",
    img: `${CDN}/ADS_24b_Sacolao_Stripes_Vermelho.jpg`,
    produto: "sacolao-stripes-vermelho",
  },
  {
    n: "25",
    nome: "Sacolão Stripes Azul",
    conjunto: "Sacolões",
    legenda:
      "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Listras em azul.",
    img: `${CDN}/ADS_25b_Sacolao_Stripes_Azul.jpg`,
    produto: "sacolao-stripes-azul",
  },
];

// Revisao da cliente em 14/10/2026 — o que mudou em cada anuncio.
// A chave e o numero do anuncio; quem nao esta aqui ficou igual.
export type Ajuste = { tag: string; detalhe: string };

export const AJUSTES: Record<string, Ajuste> = {
  "01": { tag: "Legenda nova", detalhe: "Chemise 100% linho." },
  "02": { tag: "Legenda nova", detalhe: "Chemise 100% linho." },
  "03": {
    tag: "Legenda nova",
    detalhe: "Compõe com a Chemise Sevilha e com a Blusa Diva.",
  },
  "05": {
    tag: "Foto nova",
    detalhe: "Saiu a foto da Lara, entrou a modelo do ensaio de corpo inteiro.",
  },
  "06": {
    tag: "Legenda nova",
    detalhe: "100% seda, com fechamento opcional sem transpasse.",
  },
  "10": {
    tag: "Legenda nova",
    detalhe: "Super versátil: pode ser usado como top, na cintura, no pescoço.",
  },
  "11": {
    tag: "Legenda nova",
    detalhe: "A estampa Ipanema Marrom é atemporal.",
  },
  "12": {
    tag: "Foto nova",
    detalhe:
      "A foto anterior mostrava a Camisa Lenço. Entrou a foto real da Camisa Ana, com colarinho e punho.",
  },
  "13": {
    tag: "Peça corrigida",
    detalhe:
      "Era Camisa Ana, mas a peça da foto tem gola careca. Virou Camisa T Ipanema Amarelo e leva para a página certa.",
  },
  "14": { tag: "Foto atualizada", detalhe: "A saia aparece inteira." },
  "15": {
    tag: "Legenda nova",
    detalhe: "Compõe muito bem com a Camisa Ana Ipanema Amarelo.",
  },
  "16": {
    tag: "Camisa corrigida",
    detalhe: "A peça de cima é a Camisa Lenço, não a Camisa Ana.",
  },
  "17": {
    tag: "Camisa corrigida",
    detalhe: "A peça de cima é a Camisa T, de gola careca.",
  },
  "23": { tag: "Foto atualizada", detalhe: "A bolsa aparece de frente, inteira." },
  "24": { tag: "Foto atualizada", detalhe: "A bolsa aparece de frente, inteira." },
  "25": { tag: "Foto atualizada", detalhe: "A bolsa aparece de frente, inteira." },
};

export const SAIRAM = [
  { n: "18", nome: "Vestido Princesa Leque Berinjela" },
  { n: "19", nome: "Vestido Clarice Leque Cinza" },
  { n: "20", nome: "Camisa Lenço Leque Verde" },
  { n: "26", nome: "CONJUNTO Saia Degrau + Sacolão" },
];
