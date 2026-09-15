# VIVA Extintores — estado do projeto (para continuar em outro chat)

> Cole isto no primeiro prompt do chat novo: **"Leia
> `viva-extintores/docs/HANDOFF.md` e `viva-extintores/CLAUDE.md` inteiros
> antes de qualquer coisa. Branch de trabalho: `claude/sweet-cori-tutfes`."**

## O que existe

Site novo da VIVA, completo (11 páginas), em `viva-extintores/` dentro do
repo `dosedegrowth-design/paineldosedegrowth`, branch
`claude/sweet-cori-tutfes`. Build, lint e typecheck limpos.

## Onde está no ar

| | Endereço | Aberto? |
|---|---|---|
| **Provisório (usar este)** | https://dosedegrowth-design.github.io/vivaextintores/ | sim, pra qualquer um |
| Preview Vercel | `vivaextintores-git-novo-site-dose-de-growths-projects.vercel.app` | só com token `?_vercel_share=` (24h), gerado por `get_access_to_vercel_url` |
| Site antigo (não mexer) | vivaextintores.com.br — projeto Vercel `vivaextintores`, branch `main` | produção do cliente |

Fluxo de publicação: editar em `paineldosedegrowth/viva-extintores/` →
commit na `claude/sweet-cori-tutfes` → **espelhar** o fonte na branch
`novo-site` do repo `dosedegrowth-design/vivaextintores` (script no fim
deste arquivo) → push → a Action `pages.yml` exporta estático e publica
na `gh-pages`. Leva ~4 min.

## O que travou e por quê (não perder tempo de novo)

- **Criar projeto na Vercel: 403** ("no permission to create a project")
  para a conexão MCP. Testado 9 vezes, 4 nomes, upload e git. Só o Lucas
  cria (vercel.com/new → import `dosedegrowth-design/vivaextintores` →
  Production Branch `novo-site`) ou reconecta o conector com acesso total.
- **Preview da Vercel exige login** (plano Hobby, não configurável). Só o
  alias limpo de produção de um projeto é público.
- **Não usar `teste-site-five-xi.vercel.app`**: hospedou um clone do
  Bradesco e está marcado no Google Safe Browsing (status 3). Qualquer
  coisa ali abre com tela vermelha.
- **Criar repo no GitHub: 403** (token de App). Criar site do Pages pela
  API também. Publicar numa branch `gh-pages`, sim — e o Pages ligou
  sozinho.
- **Chromium do Playwright não confia na CA do proxy**: rotear tudo por
  `route.fetch()` no Node resolve (`NODE_EXTRA_CA_CERTS`). Nunca
  `--ignore-certificate-errors`.
- Não existe controle do navegador do Lucas nesta sessão remota.

## Fonte da verdade do conteúdo

O chat do cliente (Felipe × ChatGPT) está em `docs/chat-do-cliente.md`;
as pranchas aprovadas em `docs/chat-do-cliente/`. Palavras dele valem
mais que qualquer reescrita. Contato real vem do site atual
(`lib/config.ts`). Regras inegociáveis: `CLAUDE.md`, seção "Regras que
NÃO podem quebrar" — inclusive **card quadrado**, **dois toques**,
**biblioteca horizontal**, **sem número na abertura**.

## Pendente, e só o cliente resolve

- Fotos reais de alarme, SPDA, ele com o AVCB no Ed. Araken de Moraes,
  fachada da Cury, Metrô Tamanduateí (alarme/SPDA seguem ilustrativas e
  marcadas).
- Links dos posts do Instagram (sem eles a seção fica oculta).
- Validação final dos números (`lib/numeros.ts`).

Decisão em aberto: subtítulo da abertura — hoje é a frase que o Felipe
ditou; a prancha aprovada mostra outra (`docs/chat-do-cliente/LEIA-ME.md`).

## Script de espelho (fonte → branch `novo-site`)

```bash
SRC=/home/user/paineldosedegrowth/viva-extintores; DST=/home/user/vivaextintores
cd "$DST" && git checkout novo-site -q
find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name '.github' ! -name 'vercel.json' -exec rm -rf {} +
cd "$SRC"; for f in $(git ls-files . | grep -v '^public/photos' | grep -v '^public/brand' | grep -v '^package-lock.json'); do mkdir -p "$DST/$(dirname "$f")"; cp "$f" "$DST/$f"; done
cd "$DST"; printf 'node_modules\n.next\n.vercel\nout\npublic/photos\npublic/brand\npublic/img\n*.tsbuildinfo\n.env*.local\n' > .gitignore
git add -A && git commit -m "..." && git push origin novo-site
```

(O clone de `dosedegrowth-design/vivaextintores` precisa estar anexado à
sessão com `add_repo`, acesso push.)
