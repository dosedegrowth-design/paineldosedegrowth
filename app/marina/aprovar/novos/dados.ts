/**
 * LINK 2 — os anúncios novos, montados SÓ com as fotos da pasta do Drive
 * "146Mpoob0R5J4FwzDN6-6vLqbSKU9GdHv" (baixadas pelo conector em 12/11/2026).
 *
 * 20 arquivos na pasta: 17 fotos, 2 PDFs e um .DS_Store. As 17 fotos foram
 * olhadas uma a uma: TODAS têm modelo, nenhuma é still, nenhuma é gerada
 * por IA. Nada foi acrescentado de fora da pasta.
 *
 * Cada foto vira o mesmo anúncio nos dois formatos. O 4:5 e o 9:16 são
 * feitos por encaixe, com a foto inteira dentro do quadro e o resto
 * preenchido com a própria foto desfocada: nada é cortado, então a cabeça
 * da modelo nunca é cortada.
 *
 * Os nomes vêm do nome do arquivo, que é como a marca nomeia. Onde o
 * arquivo não diz a peça, está escrito "nome a confirmar": não inventamos.
 * Preço e link entram depois da aprovação.
 */

import type { AnuncioNovo, CarrosselNovo } from "@/lib/marina/aprovar";

const N = "/marina/aprovar/novos";
const BOTAO = "Comprar agora";

const faz = (
  id: string,
  peca: string,
  tipo: AnuncioNovo["tipo"],
  titulo: string,
  texto: string,
): AnuncioNovo => ({
  id, peca, tipo, titulo, texto, botao: BOTAO,
  feed: `${N}/${id}__45.jpg`,
  reels: `${N}/${id}__916.jpg`,
});

export const NOVOS: AnuncioNovo[] = [
  faz("camisa-ana-casablanca-laranja-jpg", "Camisa Ana Casablanca Laranja", "camisa", "CASABLANCA",
    "A Camisa Ana é o corte clássico da casa: não é larga nem justa, tem o caimento certo.\n\nColarinho e punho, sem bolso na frente.\n\nNa estampa Casablanca, em laranja e vermelho."),
  faz("camisa-ana-copacabana-png", "Camisa Ana Copacabana", "camisa", "COPACABANA",
    "A Camisa Ana no corte clássico da casa, colarinho e punho.\n\nNa estampa Copacabana, em rosa, preto e branco.\n\nCompõe com a calça da mesma estampa."),
  faz("camisa-ana-riviera-jpg", "Camisa Ana Riviera", "camisa", "RIVIERA",
    "A Camisa Ana é o corte clássico da casa: colarinho, punho e o caimento certo.\n\nNa estampa Riviera, em verde oliva claro.\n\nA estampa aparece de perto, no tom sobre tom."),
  faz("camisa-ana-damas-jpg", "Camisa Ana Damas", "camisa", "DAMAS",
    "A Camisa Ana na estampa Damas, em losangos vermelhos, rosa e azuis.\n\nCorte clássico, colarinho e punho.\n\nCompõe com a calça da mesma estampa, como na foto."),
  faz("camisa-ana-pied-de-poule-preto-1-jpg", "Camisa Ana Pied de Poule Preto", "camisa", "PIED DE POULE",
    "A Camisa Ana na Pied de Poule preta sobre fundo claro.\n\nCorte clássico da casa: colarinho, punho e caimento certo.\n\nA estampa resolve sozinha, com calça lisa."),
  faz("camisa-t-atenas-amarela-jpg", "Camisa T Atenas Amarela", "camisa", "ATENAS",
    "A Camisa T tem corte reto e gola careca, com mangas 3/4 e regulador em botão.\n\nNa estampa Atenas, em amarelo.\n\nCompõe com a calça da mesma cor."),
  faz("camisa-t-casablanca-laranja-jpg", "Camisa T Casablanca Laranja", "camisa", "CASABLANCA",
    "A Camisa T tem corte reto e gola careca, com mangas 3/4.\n\nNa estampa Casablanca, em vermelho e laranja.\n\nUsa aberta sobre a calça, ou amarrada na cintura."),
  faz("camisa-t-linha-branca-png", "Camisa T Linha Branca", "camisa", "LINHA",
    "A Camisa T de corte reto, gola careca e mangas 3/4.\n\nNa estampa Linha, um quadriculado fino em branco e preto.\n\nA peça neutra que entra em qualquer look."),
  faz("camisas-ultimas-pecas-jpg", "Camisa estampa geométrica (nome a confirmar)", "camisa", "ÚLTIMAS PEÇAS",
    "Camisa de estampa geométrica em preto, bege e branco, amarrada na cintura.\n\nÚltimas peças: são poucas unidades."),
  faz("vestido-de-amarrar-pied-poule-verde-jpg", "Vestido de Amarrar Pied de Poule Verde", "vestido", "PIED DE POULE",
    "O Vestido de Amarrar tem a frente presa atrás do pescoço, deixando os ombros à mostra.\n\nNa Pied de Poule verde, em seda.\n\nPode ser usado solto ou com cinto."),
  faz("chemise-miriam-ultimas-pecas-jpg", "Chemise Miriam", "vestido", "MIRIAM",
    "A Chemise Miriam é longa, de mangas 3/4 e faixa para amarrar na cintura.\n\nEm mostarda, com a estampa miúda por toda a peça.\n\nÚltimas peças."),
  faz("chemises-ultimas-pecas-jpg", "Chemise Miriam · segunda foto", "vestido", "MIRIAM",
    "A Chemise Miriam vista de outro ângulo, com a faixa amarrada na frente.\n\nLonga, de mangas 3/4, em mostarda.\n\nÚltimas peças."),
  faz("chemises-ultimas-pecas-png", "Chemise estampa floral vermelha (nome a confirmar)", "vestido", "ÚLTIMAS PEÇAS",
    "Chemise longa de manga curta, em estampa floral vermelha sobre fundo creme.\n\nFenda frontal que abre com o movimento.\n\nÚltimas peças."),
  faz("chemises-ultimas-pecas-1-png", "Chemise amarela (nome a confirmar)", "vestido", "ÚLTIMAS PEÇAS",
    "Chemise midi abotoada na frente, de mangas 3/4 dobradas.\n\nEm amarelo claro, com textura miúda.\n\nÚltimas peças."),
  faz("2e9045c9-f102-4c16-b0a3-72749d5baa67-jpg", "Vestido estampa geométrica (nome a confirmar)", "vestido", "ÚLTIMAS PEÇAS",
    "Vestido longo de alças, em estampa geométrica azul, vinho e branco.\n\nCaimento reto, com fenda lateral.\n\nÚltimas peças."),
  faz("marina-saleme-056-jpg", "Vestido listrado verde (nome a confirmar)", "vestido", "ÚLTIMAS PEÇAS",
    "Vestido longo e amplo, em listras verdes e brancas.\n\nTecido leve, que acompanha o movimento.\n\nÚltimas peças."),
  faz("image-38629060-1160-4e97-90c7-7feeeb40306c-jpg", "Peça estampa floral vermelha (nome a confirmar)", "outro", "ÚLTIMAS PEÇAS",
    "A estampa floral vermelha sobre fundo creme, aberta para ver o desenho inteiro.\n\nÚltimas peças."),
];

export const CARROSSEIS: CarrosselNovo[] = [
  {
    id: "carrossel-camisas",
    nome: "Carrossel · Camisas sortidas",
    titulo: "Marina Saleme Estamparia",
    botao: BOTAO,
    texto: "A camisa da casa em nove estampas.\n\nCamisa Ana no corte clássico, Camisa T de gola careca.\n\nArraste para ver todas.",
    cards: [
      { src: `${N}/camisa-ana-casablanca-laranja-jpg__45.jpg`, nome: "Camisa Ana Casablanca Laranja" },
      { src: `${N}/camisa-ana-copacabana-png__45.jpg`, nome: "Camisa Ana Copacabana" },
      { src: `${N}/camisa-ana-riviera-jpg__45.jpg`, nome: "Camisa Ana Riviera" },
      { src: `${N}/camisa-ana-damas-jpg__45.jpg`, nome: "Camisa Ana Damas" },
      { src: `${N}/camisa-ana-pied-de-poule-preto-1-jpg__45.jpg`, nome: "Camisa Ana Pied de Poule Preto" },
      { src: `${N}/camisa-t-atenas-amarela-jpg__45.jpg`, nome: "Camisa T Atenas Amarela" },
      { src: `${N}/camisa-t-casablanca-laranja-jpg__45.jpg`, nome: "Camisa T Casablanca Laranja" },
      { src: `${N}/camisa-t-linha-branca-png__45.jpg`, nome: "Camisa T Linha Branca" },
      { src: `${N}/camisas-ultimas-pecas-jpg__45.jpg`, nome: "Camisa estampa geométrica" },
    ],
  },
  {
    id: "carrossel-vestidos",
    nome: "Carrossel · Vestidos",
    titulo: "Marina Saleme Estamparia",
    botao: BOTAO,
    texto: "Seis vestidos, seis estampas.\n\nSão poucas unidades de cada.\n\nArraste para ver.",
    cards: [
      { src: `${N}/vestido-de-amarrar-pied-poule-verde-jpg__45.jpg`, nome: "Vestido de Amarrar Pied de Poule Verde" },
      { src: `${N}/chemise-miriam-ultimas-pecas-jpg__45.jpg`, nome: "Chemise Miriam" },
      { src: `${N}/chemises-ultimas-pecas-png__45.jpg`, nome: "Chemise floral vermelha" },
      { src: `${N}/chemises-ultimas-pecas-1-png__45.jpg`, nome: "Chemise amarela" },
      { src: `${N}/2e9045c9-f102-4c16-b0a3-72749d5baa67-jpg__45.jpg`, nome: "Vestido estampa geométrica" },
      { src: `${N}/marina-saleme-056-jpg__45.jpg`, nome: "Vestido listrado verde" },
    ],
  },
];

export const TODOS_NOVOS = [
  ...NOVOS.map((a) => ({ id: a.id, nome: a.peca })),
  ...CARROSSEIS.map((c) => ({ id: c.id, nome: c.nome })),
];
