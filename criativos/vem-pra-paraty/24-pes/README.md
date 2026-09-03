# Criativos estáticos — lancha 24 pés

Nove peças de Meta Ads, cada uma em 1080×1350 (feed) e 1080×1920 (story).
Quarenta e oito arquivos. A direção geral está na Carta Náutica, em
`../direcao/carta-nautica.html`.

## Por que esta é a lancha mais fácil de vender das três

O assento na lancha compartilhada de Paraty custa R$ 250 por pessoa. A conta de
fechar o barco inteiro muda por embarcação:

| Lancha | Preço | Base | Por pessoa | Contra os R$ 250 |
|---|---|---|---|---|
| 18 pés | R$ 1.000 | 6 | R$ 167 | ganha |
| **24 pés** | **R$ 1.600** | **12** | **R$ 133** | **ganha por larga margem** |
| 33 pés | R$ 2.500 | 9 | R$ 278 | perde — vende banheiro e suíte |

R$ 133 é o melhor número da frota, e é o argumento central desta lancha.

O ponto de virada fica em **6,4 pessoas**: com seis, o barco sai a R$ 267 por
cabeça e perde para a compartilhada; do sétimo passageiro em diante, ganha. Daí
a peça 02, "do sétimo em diante, ganha" — ela transforma o mínimo de 6, que é
uma restrição, em motivo para o lead chamar mais gente.

## Como o preço aparece

Os dois fatos ficam separados na arte de propósito, pra ninguém chegar
desinformado no WhatsApp:

- o selo diz **A PARTIR DE R$ 1.600**
- o chip diz **ATÉ 12 PESSOAS**
- a linha de apoio diz **"Mínimo de 6 pessoas. Cabe até 12."**

Na peça 01 a linha de apoio é **"Com o barco cheio de 12. Mínimo de 6."**,
porque é ela que sustenta a divisão de R$ 133. Não tire essa linha das peças
de preço.

## Como gerar

```bash
cd ../motor
node gerar.mjs --lancha=24-pes
```

Duas variantes de preço nas artes que mostram preço: `p1600` (R$ 1.600) e
`p159999` (R$ 1.599,99).

## As nove peças

| # | Peça | Foto | Registros | Frase | Funil |
|---|---|---|---|---|---|
| 01 | A conta | B | sóbrio, forte | R$ 133 por pessoa | Fundo |
| 02 | O sétimo | A | sóbrio, forte | Do sétimo em diante, ganha | Fundo |
| 03 | Doze lugares | B | sóbrio, forte | Doze lugares, um barco só | Meio |
| 04 | Só vocês | E | sóbrio, forte | O barco inteiro é de vocês | Meio |
| 05 | Celebração | F | sóbrio, forte | Aniversário no meio da baía | Meio |
| 06 | Família | D | sóbrio, forte | A família inteira num barco só | Meio |
| 07 | Roteiro lado sul | G | roteiro | Sete paradas num dia | Meio |
| 08 | Roteiro Mamanguá | H | roteiro | O único fiorde do Brasil | Meio |
| 09 | Roteiro lado norte | C | roteiro | Tartaruga e almoço na ilha | Meio |

As peças 01 e 03 usam a mesma foto de propósito: é a única com o barco cheio,
e as duas vendem exatamente isso — a conta só fecha com o barco cheio, e os
doze lugares só existem se der pra ver doze pessoas neles.

## Pendências desta lancha

1. **Qual barco é o do convés de teca.** Uma das doze fotos mostra um convés que
   não bate com o casco de `a`, `b` e `c`. Está em
   `fotos/a-confirmar-conves-cais.jpg`, fora das peças. Detalhe no
   `fotos/LEIA-ME.md`.
2. **O que muda no valor entre 6 e 12 pessoas.** R$ 1.600 é fixo pelo barco ou
   escala por cabeça? A arte hoje diz "a partir de", que é seguro nos dois
   casos, mas a resposta muda a peça 02.
3. **Duração do passeio** e **o que está incluso**, iguais às outras lanchas.
4. **Foto do convés vazio, em luz de meio-dia.** A peça 03 vende doze lugares
   com uma foto de grupo, que funciona — mas um plano do convés livre, com os
   assentos visíveis, seria a prova direta.
