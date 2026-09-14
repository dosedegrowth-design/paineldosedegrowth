# TAYSSA — Private Beauty Experience · Direção de design

> Documento de trabalho da experiência `/tayssa` (subdomínio `tayssa.dosedegrowth.com`).
> Produto novo, do zero. Não reaproveita componentes, layouts ou identidade de nenhuma outra LP do repo.

## 1. Conceito

**Não é um site de profissional de beleza. É um clube privado digital para as clientes da Tayssa.**

Duas experiências, um só mundo físico:

| | Público | Privado (VIP) |
|---|---|---|
| Função | Criar desejo | Recompensar relação |
| Luz | Marfim, editorial, aberto | Noite quente, íntimo, silencioso |
| Ritmo | Cinematográfico, scroll como narrativa | Calmo, pessoal, o nome da cliente vira arquitetura |
| Verbo | Descobrir → admirar → entender → desejar → interagir → contatar | Entrar → ser reconhecida → progredir → desbloquear → voltar |

A **transição público→privado é o momento central**: ao entrar, a luz abaixa. O marfim escurece até o "noir café"; o nome da cliente aparece letra a letra; só depois o espaço dela se revela.

## 2. Paleta (extraída da natureza do trabalho: pele, cílios, luz quente de estúdio)

Sem rosa de salão, sem rosé-gold, sem dourado sobre preto, sem neon.

| Token | Valor | Uso |
|---|---|---|
| `--t-ivory` | `#f4efe8` | Fundo público |
| `--t-bone` | `#e8e0d5` | Superfícies, faixas |
| `--t-sand` | `#cdbfb0` | Linhas, molduras de foto |
| `--t-umber` | `#6b5a4e` | Texto secundário sobre marfim |
| `--t-ink` | `#1a1512` | Texto principal / fundo privado |
| `--t-noir` | `#100d0b` | Fundo mais profundo (login, VIP) |
| `--t-cassis` | `#6e2f45` | Acento único (ameixa fumê) — usado com parcimônia: cursor, sublinhados, estados |
| `--t-cassis-soft` | `#a5647a` | Acento sobre fundos escuros |

Fotos reais mandam na cor. A UI fica neutra para que a pele e os cílios sejam a única "cor" viva.

## 3. Tipografia

- **Display:** Bodoni Moda (variável, opsz + itálico). Alto contraste, campanha de moda. Títulos enormes, itálico para palavras de afeto ("sua", "você", nomes).
- **Corpo/UI:** Hanken Grotesk (variável). Neutra, quente, legível em 12px.
- Eyebrows em caixa alta com tracking 0.28em, 11px.
- Hierarquia por escala e espaço, não por peso.

## 4. Sistema de motion

Uma física só para o site inteiro.

| Nível | Nome | Duração | Easing | Exemplo |
|---|---|---|---|---|
| 1 | micro | 160–240ms | `cubic-bezier(.2,.7,.2,1)` | hover de link, sublinhado, cursor |
| 2 | ui | 320–480ms | `cubic-bezier(.16,1,.3,1)` (expo out) | modal, menu, campo em foco |
| 3 | content | 640–900ms | expo out | reveal de linha de texto, entrada de foto |
| 4 | section | 900–1200ms | `cubic-bezier(.65,0,.35,1)` (in-out) | máscara entre seções, morph do nav |
| 5 | cinematic | 1200–1800ms | expo out longo | abertura do site, nome da cliente, escurecer ao entrar |

Regras:
- Só `transform`, `opacity`, `clip-path`. Nada de animar layout.
- Reveal de texto = linhas mascaradas subindo (`translateY(110%) → 0`), stagger 60–90ms.
- Foto entra sempre por máscara (`clip-path: inset`) + escala 1.08 → 1.
- `prefers-reduced-motion`: pins viram seções estáticas, reveals viram fade curto, loader some.
- Mobile: parallax e cursor desligados; pins mantidos mas mais curtos (scroll ×1.6 em vez de ×2.4).

## 5. Matriz de referência (Awwwards SOTD — ferramenta interna, não aparece no produto)

| Padrão de interação | ERA Residence (The First The Last) | Illoca (Unseen) | Miu Miu "A House…" (Merci Michel) | Warm & Fuzzy (Neutral) | Studio Freight / basement (repertório) | Adaptação Tayssa |
|---|---|---|---|---|---|---|
| Preloader como abertura | ✓ | | ✓ | ✓ | ✓ | "TAYSSA" em Bodoni surge por máscara, contador discreto, cortina sobe revelando a foto-hero |
| Storytelling com pin + imagens sequenciais | ✓ | | ✓ | | ✓ | Seção **Trabalho**: pin de 3 fotos empilhadas; cada uma assume o quadro enquanto a legenda muda |
| Scroll horizontal dentro do vertical | ✓ | | | | ✓ | Seção **Detalhes**: pin, trilho horizontal de fotos/prints reais com tipografia ancorada |
| Máscara de imagem (clip-path) | ✓ | ✓ | ✓ | | ✓ | Transições entre seções: a próxima seção "nasce" de um retângulo estreito que abre |
| Cursor contextual | | ✓ | ✓ | ✓ | ✓ | Cursor mínimo (ponto cassis) que vira `VER`, `ABRIR`, `ENTRAR` — desktop apenas |
| Elementos que reagem ao mouse | | ✓ | ✓ | ✓ | | Foto do hero desloca 1–2% com o cursor; botões magnéticos |
| Tipografia como objeto | | | | ✓ | ✓ | Título gigante "SUA BELEZA" cruza a foto; nome da cliente vira título do dashboard |
| Nav que muda com o scroll | ✓ | ✓ | | ✓ | ✓ | Nav some ao descer, volta compacto ao subir; fundo passa de transparente a marfim translúcido |
| Tema claro/escuro como narrativa | ✓ (dia/noite) | | | | | Público = dia; privado = noite. A troca acontece no login |
| Micro-interações de hover | | ✓ | | ✓ | ✓ | Seta que anda, sublinhado que cresce, foto escala 1.04 |
| Transições de página | | | ✓ | ✓ | ✓ | Cortina de ink sobe/desce entre rotas públicas → privadas |

Depois de extraído o vocabulário: **as referências são esquecidas.** O layout, as proporções, a copy e o ritmo são próprios.

## 6. Mapa de transições (a experiência é o intervalo entre estados)

1. **Entrada** — loader (1.4s máx.) → cortina sobe → foto-hero em máscara vertical estreita abre até a borda; "TAYSSA" e "Private Beauty Experience" sobem por linhas.
2. **Hero → Declaração** — a foto do hero encolhe e vira um "cartão" que desliza para o canto; o marfim domina; frase editorial em Bodoni.
3. **Declaração → Trabalho** — pin: 3 fotos empilhadas trocam de dominância pelo scroll; legendas de serviço mudam sincronizadas.
4. **Trabalho → Serviços** — a última foto vira fundo escurecido; lista de serviços em tipografia grande, cada linha revela foto ao hover (desktop) / ao tocar (mobile).
5. **Serviços → Detalhes** — pin horizontal: trilho de prints e detalhes reais (artefatos de Instagram como objeto editorial).
6. **Detalhes → Experiência VIP** — a página "apaga a luz": fundo vai a `--t-ink`; três privilégios (Indicação · Fidelidade · Aniversário) apresentados como tipografia + linhas, não cards.
7. **VIP → Indicação** — formulário público inline, curto, com confirmação cinematográfica.
8. **Fechamento** — "Sua experiência começa aqui." → AGENDAR · CONHECER O VIP · INDICAR.
9. **Público → Privado** — `/entrar`: foto com máscara ocupa metade, formulário mínimo; ao autenticar, a foto desfoca e escurece; "Olá, {Nome}." aparece letra a letra; cortina revela o espaço privado.
10. **Dashboard** — o nome é o título. A jornada (trilha vertical de marcos) desenha-se conforme o scroll. Benefícios como objetos: tipografia grande, linha, estado.

## 7. Arquitetura de informação

```
/tayssa                    público · experiência única em scroll
/tayssa/indicar            indicação pública (validação obrigatória depois)
/tayssa/entrar             login
/tayssa/entrar/definir-senha?token=…   primeiro acesso / redefinição
/tayssa/acesso             área restrita (403 desenhado)
/tayssa/vip                Olá, {Nome} · status · jornada · pendências
/tayssa/vip/jornada        fidelidade em detalhe + enviar atendimento p/ validação
/tayssa/vip/indicacoes     minhas indicações + indicar
/tayssa/vip/beneficios     objetos de valor + estados
/tayssa/vip/aniversario    experiência de aniversário (VIP)
/tayssa/vip/historico      linha do tempo de atendimentos confirmados
/tayssa/vip/perfil         dados, senha
/tayssa/admin              o que precisa da minha atenção
/tayssa/admin/clientes[/novo|/:id]
/tayssa/admin/atendimentos   aprovações
/tayssa/admin/indicacoes     pipeline de indicação
/tayssa/admin/beneficios     elegíveis → validar → liberar → utilizado
/tayssa/admin/aniversarios   mês corrente + ação
/tayssa/admin/configuracoes  regras, serviços, blackouts, copy WhatsApp
```

## 8. Fotografia real — slots

As fotos reais do `@1.tayssa` entram em `public/tayssa/photos/` com os nomes definidos em `lib/tayssa/photos.ts`. Enquanto o arquivo não existe, o slot renderiza um campo tonal com a legenda "foto real · @1.tayssa" — nunca imagem sintética, nunca stock.

| Slot | Uso | Proporção |
|---|---|---|
| `hero.jpg` | Abertura | 4:5 (mobile) / 16:10 (desktop) |
| `work-01..03.jpg` | Pin do trabalho | 4:5 |
| `service-*.jpg` | Hover dos serviços | 3:4 |
| `detail-01..06.jpg` | Trilho horizontal (prints e detalhes) | livre |
| `studio.jpg` | Experiência | 16:10 |
| `entrance.jpg` | Login | 3:4 |
| `vip.jpg` | Boas-vindas VIP | 16:10 |

Nada de HDR, nitidez artificial ou "melhoria" por IA. Imperfeição real > perfeição falsa.

## 9. Copy — tom

Íntimo, curto, confiante, sem exclamações em série, sem "transforme sua autoestima".
Linguagem de estado sem jargão: "Seu registro foi confirmado.", "Indicação confirmada.", "Você desbloqueou um benefício."
