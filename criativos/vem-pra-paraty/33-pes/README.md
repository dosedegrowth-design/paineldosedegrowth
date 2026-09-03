# Criativos estáticos — lancha 33 pés

Oito peças de Meta Ads, cada uma em 1080×1350 (feed) e 1080×1920 (story).
A direção geral está na Carta Náutica, em `../direcao/carta-nautica.html`.

## O que muda em relação à lancha de 18 pés

A campanha da 18 pés se sustenta numa conta: fechar a lancha sai mais barato por
pessoa que um assento na compartilhada, que custa R$ 250.

**Essa conta não serve aqui.** R$ 2.500 dividido por 9 dá R$ 278 por pessoa,
acima da compartilhada. Vender esta lancha por preço por cabeça seria perder a
comparação de propósito.

O que ela vende é o que a compartilhada não tem como oferecer:

| Ativo | Por que importa |
|---|---|
| **Banheiro a bordo** | A pesquisa achou concorrente que botou "com Toilet" no nome do produto. Nem a compartilhada nem nenhuma lancha de 18 pés tem um. |
| **Suíte** | Trocar de roupa, criança dormir, sombra fechada de verdade em seis horas de sol. |
| **15 lugares** | Grupo de mais de oito hoje precisa alugar dois barcos. |

## Como gerar

```bash
cd ../motor
node gerar.mjs --lancha=33-pes
```

Saem 32 arquivos: cinco peças em dois registros e duas variantes de preço, mais
três roteiros em uma variante de registro e duas de preço.

## As oito peças

| # | Peça | Foto | Registros | Funil |
|---|---|---|---|---|
| 01 | Banheiro a bordo | B | sóbrio, forte | Fundo |
| 02 | Quinze lugares | A | sóbrio, forte | Fundo |
| 03 | A suíte | B | sóbrio, forte | Meio |
| 04 | Aniversário e despedida | A | sóbrio, forte | Meio |
| 05 | Família inteira | A | sóbrio, forte | Meio |
| 06 | Roteiro lado sul | A | roteiro | Meio |
| 07 | Roteiro Mamanguá | B | roteiro | Meio |
| 08 | Roteiro lado norte | A | roteiro | Meio |

## Como o preço aparece

O barco tem 15 lugares e o valor de R$ 2.500 cobre até 9 pessoas. Os dois fatos
são verdadeiros e ficam separados na arte de propósito:

- o selo de preço diz **A PARTIR DE R$ 2.500**
- o chip diz **ATÉ 15 LUGARES**, que é a capacidade
- a linha de apoio diz **"R$ 2.500 até 9 pessoas. Cabe até 15."**

É a linha de apoio que impede a leitura errada. Não tire ela das peças de preço.

⚠️ **Pendente:** qual o valor acima de 9 pessoas. Sem esse número nenhuma peça
pode prometer preço para grupo grande, e o texto manda o lead perguntar.
