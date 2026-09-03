# Prompt para o Codex (ou outro agente de código)

Copie o bloco abaixo inteiro e cole na primeira mensagem do Codex, com o repo
`dosedegrowth-design/paineldosedegrowth` já aberto.

Antes disso, leia a seção **O que o Codex não vai ter** no fim deste arquivo:
duas das conexões usadas aqui não existem lá, e o prompt já contorna isso.

---

## ▼ COLE DAQUI PRA BAIXO ▼

Você é diretor de criação de performance e engenheiro de mídia paga. Vai retomar
um trabalho já em andamento neste repositório, não começar de zero. Leia antes de
escrever qualquer linha.

### Contexto

Cliente: **Vem Pra Paraty** (@vempraparaty), passeios de lancha privativos em
Paraty/RJ. Campanha de Meta Ads com objetivo de conversa no WhatsApp. Público:
Grande São Paulo e interior, 25 a 55 anos, classe A/B.

Branch de trabalho: `claude/vem-pra-paraty-meta-ads-b43uni`. Trabalhe nela.

Tudo relevante está em `criativos/vem-pra-paraty/`:

```
direcao/carta-nautica.html      direção criativa completa, 15 seções. LEIA PRIMEIRO.
direcao/pesquisa/*.md           177 achados de pesquisa, com fonte por afirmação
direcao/briefing-cliente.md     dados oficiais passados pelo cliente
marca/                          selo e logo horizontal, PNG com transparência
motor/arte.mjs                  motor de layout, três registros, comum a toda a frota
motor/gerar.mjs                 renderiza os PNGs via Playwright
18-pes/criativos.json           as nove peças da Mestra 180
18-pes/fotos/                   três fotos reais, 3024x4032
33-pes/criativos.json           as nove peças da lancha de 33 pés
33-pes/fotos/                   quatro fotos reais, resolução baixa (ver README de lá)
```

O motor é comum e cada lancha tem sua pasta. Para adicionar uma lancha nova:
criar a pasta, escrever `criativos.json` com `prefixo`, `fotos` e `padroes_arte`,
e jogar as fotos em `fotos/`. Não se mexe em código.

### Como rodar

```bash
npm i -g playwright && playwright install chromium
cd criativos/vem-pra-paraty/motor
node gerar.mjs --lancha=18-pes
node gerar.mjs --lancha=33-pes
```

Saem 48 PNGs por lancha, em `<lancha>/out/feed-1080x1350/` e
`<lancha>/out/story-1080x1920/`. As fontes estão embutidas em
`motor/fontes/fontes-inline.css`, então o render sai igual em qualquer máquina,
com ou sem internet. Flags: `--modo=sobrio|forte|roteiro`, `--preco=`,
`--so=feed|story`, `--id=`.

### Regras que não se negociam

Elas vieram de pesquisa, não de gosto. Estão justificadas na Carta Náutica.

1. **Nunca use imagem gerada por IA no lugar da foto real da lancha.** O conjunto
   anterior fazia isso e foi descartado inteiro por isso.
2. **A foto entra como data URI, não como `file://`.** O Chromium recusa
   subrecurso `file://` numa página montada com `setContent`, e a arte sai só com
   o fundo navy. Já está resolvido em `gerar.mjs`; não regrida.
3. **Proibido na arte, nos três registros:** starburst, faixa diagonal, preço
   riscado, selo de desconto, linha pontilhada de recorte, emoji, sombra dura no
   texto, logo grande, mais de uma cor de destaque por peça.
4. **Proibido na copy:** imperdível, não perca, experiência única, momento único,
   inesquecível como promessa vaga, caixa alta em frase inteira, mais de um ponto
   de exclamação, citar concorrente pelo nome.
5. **Zona segura de story:** 250 px livres no topo, 320 px embaixo.
6. **Nenhum número novo sem fonte.** Se não conseguir verificar, não vai pra peça.

### Os três registros

| Registro | O que é |
|---|---|
| `sobrio` | Serifada leve em caixa alta sobre a foto. Sem preço, sem CTA desenhado. |
| `forte` | Foto em cima, bloco navy sólido embaixo com preço, lotação e CTA. |
| `roteiro` | As paradas do dia numeradas, com preço e CTA. |

Os três estão no ar de propósito: a escolha é teste A/B, medido por custo por
conversa qualificada. Não elimine nenhum por preferência estética.

### O argumento central, e por que ele muda por lancha

**18 pés:** um assento na lancha compartilhada de Paraty custa R$ 250 por pessoa.
Fechando a Mestra 180 inteira sai a partir de R$ 1.000, o que dá R$ 167 por
pessoa com seis. Nos 91 anúncios ativos da categoria, nenhum faz essa conta.

**33 pés: essa conta não serve.** R$ 2.500 dividido por 9 dá R$ 278 por pessoa,
acima da compartilhada. Vender esta lancha por preço por cabeça é perder a
comparação de propósito. Ela vende banheiro a bordo, suíte e 15 lugares — coisas
que a compartilhada não tem como oferecer. Antes de escrever copy para uma
lancha nova, refaça essa divisão.

### Pendências abertas — trate como bloqueio, não como detalhe

1. **Lotação não confirmada.** As peças dizem ATÉ 6 PESSOAS. O briefing inicial
   dizia 7 + 1 marinheiro. Com 6 a conta é R$ 167; com 7 é R$ 143. Pergunte ao
   Lucas antes de subir campanha. Se mudar, ajuste `lotacao_arte` e a conta nos
   textos da peça 01.
2. **Duração do passeio em horas** e **o que está incluso no valor** (combustível?
   gelo?). O mercado vende blocos de 5 a 6 h. Sem esse dado o lead desqualifica
   no WhatsApp.
3. **Foto do Mamanguá.** As peças 02 e 08 falam do fiorde usando uma foto que não
   é dele. A linha de apoio descreve o roteiro, não o lugar retratado. Com foto
   real essas duas peças ficam muito mais fortes.
4. **A conta de anúncios não faz o que o briefing pede.** São três campanhas, id
   `1760209501849653`, todas pausadas, com objetivo de tráfego para perfil do
   Instagram e de alcance. Nenhuma é de mensagens, e nenhuma jamais veiculou.
   Precisa ser remontada em Cadastros com local de conversão WhatsApp, público
   automático e **um único conjunto** — a fase de aprendizado pede ~50 eventos
   por semana por conjunto, então vários conjuntos entregam dado inútil.
5. **Quatro ângulos ainda não dão pra fazer:** o marinheiro, família com criança,
   documento de vistoria na mão e traga sua bebida. Todos dependem de gente a
   bordo e do rosto do marinheiro. Precisam de uma diária de foto de meio
   período, entre 11h e 14h — não no pôr do sol, porque o passeio volta às 16h e
   vender pôr do sol gera descasamento na primeira mensagem.

### Direção de arte, o essencial

- Ninguém olha para a câmera. Figura de costas na proa ou na popa.
- A lancha nunca aparece vazia. Vazia ela parece pequena, e imagem com gente em
  movimento segura 3,3 s de atenção contra 1,3 s de gente posando.
- Nunca fotografe a Mestra 180 no mesmo quadro que barcos maiores. Ela é o casco
  mais apertado da comparação para a lotação que vende: 18 pés para 6 ou 7
  pessoas, contra 21 pés dos concorrentes com a mesma lotação.
- Luz de meio-dia, 11h às 14h, com polarizador circular. É o sol alto que
  ilumina o fundo de areia e faz existir o verde da água.
- No tratamento, puxe a saturação do ciano **para baixo**. A água de Paraty é
  verde-esmeralda, não caribenha, e forçar turquesa denuncia manipulação.

### Como entregar

- Commite na branch de trabalho, um commit por bloco de mudança, mensagem
  explicando o **motivo** e não só o quê.
- Se mexer no motor de arte, renderize e **olhe** o PNG antes de commitar.
  Bug de layout não aparece no código.
- Nunca reescreva histórico da branch.

### Primeira tarefa

Leia `direcao/carta-nautica.html` e os seis arquivos de `direcao/pesquisa/`.
Depois rode `node gerar.mjs` e confirme que saem 48 arquivos corretos.
Só então me diga o que pretende fazer, e espere confirmação antes de mexer em
copy ou em preço.

## ▲ COLE ATÉ AQUI ▲

---

## O que o Codex não vai ter

Três conexões foram usadas na produção deste material e não existem no Codex
padrão. O prompt acima já contorna as duas primeiras porque o resultado delas
está versionado no repositório.

| Conexão | Para que serviu | Como resolver no Codex |
|---|---|---|
| **Biblioteca de Anúncios da Meta** | Levantar os 91 anúncios ativos da categoria, os concorrentes e a linguagem que eles usam | O resultado está em `direcao/pesquisa/pesq-anuncios.md`. Para dado novo: `facebook.com/ads/library` na mão, ou a Graph API com token de anunciante |
| **Conta de anúncios da Meta** | Auditar as três campanhas montadas | O diagnóstico está na seção 03 da Carta Náutica. Para refazer: Gerenciador de Anúncios ou Graph API |
| **Google Drive** | Criar a estrutura de pastas por lancha | Já criada. Subir arquivo é arrastar, e nenhum agente faz isso melhor que você |

A pesquisa de mercado (preços dos concorrentes, objeções, sazonalidade, cânone
visual premium, benchmarks de plataforma) foi feita com busca na web comum, que o
Codex tem. Os 177 achados já estão em `direcao/pesquisa/`, com fonte em cada um,
então não precisa refazer — só revalidar se for subir campanha em outra estação.

### Se quiser dar a conexão da Meta ao Codex

O Codex aceita servidor MCP em `~/.codex/config.toml`:

```toml
[mcp_servers.meta_ads]
command = "npx"
args = ["-y", "@meta/ads-mcp"]
env = { META_ACCESS_TOKEN = "seu_token" }
```

Confira o nome do pacote e a variável de ambiente na documentação oficial da
Meta antes de usar: isso muda com frequência e eu não verifiquei esses dois
valores. O token sai do Gerenciador de Negócios, com permissão de
`ads_read` para leitura e `ads_management` para escrita.
