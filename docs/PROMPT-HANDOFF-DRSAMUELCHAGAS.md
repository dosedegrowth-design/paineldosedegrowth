# Prompt de Handoff — Site Dr. Samuel Chagas

Este arquivo é um **prompt pronto** para o time começar a trabalhar no site usando
o Claude Code (mesma conta DDG, em outra máquina).

## Como usar

1. Clone o repositório na máquina do time:
   ```bash
   git clone https://github.com/dosedegrowth-design/drsamuelchagas.git
   cd drsamuelchagas
   ```
2. Abra o Claude Code **dentro dessa pasta**.
3. **Copie e cole o bloco abaixo** como primeira mensagem. Depois é só pedir o ajuste.

---

## 👇 COLE ISTO NO CLAUDE CODE

```
Você vai me ajudar a ajustar o site do Dr. Samuel Chagas.

CONTEXTO DO PROJETO
- É a landing page (one-page) do Dr. Samuel Chagas, fisioterapeuta/quiropraxia em SP.
- Projeto da Dose de Growth (DDG).
- No ar: https://drsamuelchagas.com.br/
- Repo: https://github.com/dosedegrowth-design/drsamuelchagas
- Deploy: Vercel, AUTOMÁTICO no push da branch main.

STACK (importante)
- Site 100% estático, SEM framework e SEM build.
- O site inteiro está num único arquivo: index.html (HTML + CSS inline + JS inline).
- Assets em assets/images/ (tem versão desktop e -mobile de hero/sobre/parallax).
- Não existe package.json nem node_modules. Editar = mexer no index.html direto.

ANTES DE COMEÇAR
1. Leia o README.md do projeto (tem toda a arquitetura, seções e dados do negócio).
2. Leia o index.html para entender a estrutura antes de qualquer mudança.
3. As seções da página são: Hero, #sobre, #servicos, #metodo, #resultados, #videos, #contato.

REGRAS AO EDITAR
- Mobile primeiro: o histórico tem vários fixes de iOS/iPad. Sempre considere o
  comportamento no celular (existem imagens -mobile separadas).
- SEO: preserve <title>, meta description, canonical, Open Graph, Twitter Card,
  Schema.org (application/ld+json), sitemap.xml e robots.txt. Não quebrar.
- Dados de contato (WhatsApp +55 11 91352-8080, Instagram @dr.samuelchagas,
  endereço R. Quintana 719 - São Paulo/SP): se mudar algum, atualize em TODOS os
  lugares — links wa.me, texto visível E o bloco Schema.org no <head>.
- Commit por arquivo (nada de git add -A).

FLUXO DE PUBLICAÇÃO
- Depois de validar o ajuste, faça:
    git add <arquivo>
    git commit -m "descrição do ajuste"
    git push origin main
- A Vercel publica sozinha em ~1 min em drsamuelchagas.com.br.

Confirme que entendeu lendo o README.md e o index.html, me dê um resumo rápido do
que o site tem hoje, e então me pergunte qual ajuste eu quero fazer.
```

---

## Notas para o time (fora do prompt)

- **Acesso ao GitHub:** a conta `dosedegrowth-design` precisa estar autenticada na
  máquina (via `gh auth login` ou credencial Git) para dar `push`.
- **Acesso à Vercel:** não é obrigatório mexer na Vercel — o deploy sai sozinho pelo
  push. Só entre no painel da Vercel se precisar ver logs de build ou domínio.
- **Testar antes de subir:** abra o `index.html` no navegador (de preferência via
  `python3 -m http.server 8000`) e confira no celular também.
- **Dúvida sobre o negócio** (texto, foto, serviços): confirmar com o Lucas antes de
  publicar alterações de conteúdo sensível.

---

## Anexo — README do projeto (snapshot de referência)

> Cópia do `README.md` do repositório `drsamuelchagas` para consulta rápida sem
> precisar clonar. A **fonte da verdade** continua sendo o README dentro do repo do site.

### Dr. Samuel Chagas — Site Institucional

Landing page (one-page) do **Dr. Samuel Chagas**, fisioterapeuta especializado em
quiropraxia, ajuste postural, alívio de dores na coluna e recovery para atletas em
São Paulo. Projeto da **Dose de Growth (DDG)**.

- 🌐 **No ar:** https://drsamuelchagas.com.br/
- 📦 **Repositório:** https://github.com/dosedegrowth-design/drsamuelchagas
- ☁️ **Deploy:** Vercel (automático no push da branch `main`)

#### Stack

Site **estático, sem framework e sem build**. Tudo simples de propósito.

| Camada | O que é |
|---|---|
| Estrutura | `index.html` único — HTML + **CSS inline** + **JS inline** (tudo em um arquivo, ~77 KB) |
| Fontes | Google Fonts (`Inter` + `Space Grotesk`) via `<link>` |
| Ícones/Favicon | PNGs na raiz (16/32 + apple-touch) |
| Embeds | Instagram (`embed.js`) para os reels na seção Vídeos |
| Hospedagem | Vercel (static hosting) |

> Não há `package.json`, `node_modules`, nem etapa de build. Editar = abrir o
> `index.html` e mexer. É isso.

#### Estrutura de arquivos

```
dr-samuel-chagas/
├── index.html            ← O SITE INTEIRO (HTML + CSS + JS). 99% dos ajustes são aqui.
├── assets/
│   └── images/           ← logo, hero, parallax, foto do Dr., backgrounds (desktop + mobile)
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── robots.txt            ← SEO
├── sitemap.xml           ← SEO
├── .gitignore            ← ignora .DS_Store e .vercel
└── README.md
```

##### Seções do site (ordem na página)

| id | Seção | Conteúdo |
|---|---|---|
| — | Hero | Chamada principal + CTA WhatsApp |
| `#sobre` | Sobre | Bio + foto do Dr. Samuel |
| `#servicos` | Serviços | Ajuste postural, coluna, recovery, etc. |
| `#metodo` | Método | Como o atendimento funciona |
| `#resultados` | Resultados | Provas / depoimentos |
| `#videos` | Vídeos | Reels do Instagram (embed) |
| `#contato` | CTA Final | Chamada de agendamento + WhatsApp |

#### Dados do negócio (fonte da verdade — usados em texto, SEO e Schema.org)

- **Profissional:** Dr. Samuel Chagas — Fisioterapeuta · Crefito/SP **335633-F**
- **WhatsApp:** `+55 11 91352-8080` → `https://wa.me/5511913528080`
- **Instagram:** [@dr.samuelchagas](https://www.instagram.com/dr.samuelchagas/)
- **Endereço:** R. Quintana, 719 — Cidade Monções, São Paulo/SP — CEP 04569-011
- **Horário:** Seg–Sex 08:00–20:00 · Sáb 08:00–14:00
- **Especialidades:** Fisioterapia, Quiropraxia, Recovery Esportivo

> ⚠️ Ao trocar telefone/endereço, atualize em **3 lugares** dentro do `index.html`:
> (1) os links `wa.me`, (2) o texto visível na página e (3) o bloco **Schema.org**
> (`application/ld+json`) no `<head>`. Manter os três em sincronia.

#### Rodar localmente

Não precisa de servidor. Basta abrir o arquivo:

```bash
open index.html
```

Ou, se quiser servir com URL local (recomendado por causa dos embeds do Instagram):

```bash
python3 -m http.server 8000
# acessa http://localhost:8000
```

#### Publicar (deploy)

O deploy é **automático**: todo push na branch `main` do GitHub dispara um deploy
na Vercel e publica em https://drsamuelchagas.com.br/.

Fluxo normal de ajuste:

```bash
git add index.html                       # (adicione só o que mudou)
git commit -m "descreva o ajuste"
git push origin main                     # Vercel publica sozinho em ~1 min
```

#### SEO — já configurado (não quebrar)

- `<title>`, `meta description`, `keywords`, `canonical`
- Open Graph + Twitter Card (imagem = foto do Dr.)
- Schema.org `HealthBusiness` (telefone, endereço, horário, credencial, serviços)
- `sitemap.xml` + `robots.txt`
- Google Search Console verificado (meta `google-site-verification` no `<head>`)

Ao mexer no conteúdo, preserve esses blocos. Se mudar imagem de destaque, atualize
também as `og:image` / `twitter:image`.

#### Boas práticas do projeto

- **Commit por arquivo** — evite `git add -A` (o `.DS_Store`/`.vercel` já estão no
  `.gitignore`, mas mantenha o hábito).
- **Mobile primeiro** — o histórico do projeto tem vários fixes de iOS/iPad (parallax,
  imagens mobile). Sempre teste no celular antes de subir.
- **Imagens** — há versão desktop e `-mobile` separadas para hero/sobre/parallax.
  Ao trocar, troque o par.
- **Mensagem de commit** curta e descritiva, em pt-BR ou en, seguindo o padrão do
  histórico.
