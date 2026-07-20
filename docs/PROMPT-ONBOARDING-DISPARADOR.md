# PROMPT DE ARRANQUE — Disparador WhatsApp

> Cole o bloco abaixo na **primeira mensagem** do Claude Code, já dentro
> da pasta do projeto (`cd paineldosedegrowth && claude`).
>
> Ele dá todo o contexto de uma vez: o que é o projeto, onde está a
> documentação, as regras de trabalho e o que não pode ser feito.

---

## COPIE DAQUI PARA BAIXO

```
Você vai me ajudar a mexer no Disparador WhatsApp da agência Dose de Growth (DDG).

CONTEXTO
- Sou dev do time do Lucas Cassiano (dono da DDG).
- O Disparador é um módulo de disparo em massa via WhatsApp Cloud API (Meta oficial),
  dentro do painel DDG. Produção: https://painel.dosedegrowth.com/disparador
- Estou na minha máquina, começando do zero neste projeto.

PRIMEIRA COISA A FAZER
Leia estes arquivos ANTES de qualquer outra coisa e me diga que leu:
1. docs/RUNBOOK-DISPARADOR.md   ← documentação completa, é a fonte da verdade
2. CLAUDE.md                     ← regras gerais do repositório

O runbook cobre: arquitetura, mapa de arquivos, schema do banco, edge functions,
setup da Meta, troubleshooting dos bugs conhecidos, gotchas e pendências.
Não me peça informação que já esteja lá — leia primeiro.

STACK
Next.js 16 + React 19 + TypeScript + Supabase (Postgres + Edge Functions em Deno)
+ Vercel + Meta Graph API v25.0. Node 24+.

REGRAS DE TRABALHO (o Lucas leva a sério, não pule nenhuma)

1. VALIDAR SEMPRE antes de dizer "feito"
   Padrão obrigatório: (a) auditar a edição, (b) testar com caso real,
   (c) monitorar em produção depois do deploy.
   Me mostre o resultado da validação. Não diga só "subi" ou "pronto".

2. COMMIT ARQUIVO POR ARQUIVO
   Nunca `git add -A`. O repo tem erros pré-existentes em outras páginas
   que quebram o build se forem commitados junto.

3. NÃO REMOVER regras, validações ou tratamentos existentes
   sem antes entender por que estão lá. Muita coisa foi construída
   em cima de bug real em produção.

4. TYPE-CHECK ANTES DE COMMITAR
   Sempre `npx tsc --noEmit` antes de qualquer commit.

5. NADA DE SEGREDO EM LUGAR NENHUM
   Token, chave, secret: nunca em commit, print, issue ou chat.
   Se precisar de um token pra debug, leia do Supabase Vault na hora e descarte.

6. CUIDADO COM RATE LIMIT DA META
   A cota é horária e COMPARTILHADA entre todos os clientes do mesmo app.
   Não rode sync em loop. Antes de sincronizar, confira:
     curl -sI "https://graph.facebook.com/v25.0/138706958770254?access_token=$TOKEN" | grep -i x-app-usage
   Se call_count >= 100, está bloqueado — espere, não insista.
   Cada tentativa que falha ainda queima cota.

7. DEPLOY
   Push na main → Vercel builda sozinho. Vercel Hobby = 1 build por vez.
   Se travar na fila, cancele os deploys QUEUED.

COMO EU QUERO QUE VOCÊ TRABALHE
- Investigue a causa-raiz antes de propor fix. Não chute.
- Se não tiver certeza, diga que não tem certeza e proponha como descobrir.
- Se um teste falhar, me mostre a saída real do erro. Não maquie.
- Português nas respostas.

Comece lendo os dois arquivos e me dando um resumo do que entendeu
da arquitetura, pra eu confirmar que você pegou o contexto certo.
```

## COPIE ATÉ AQUI

---

## ANTES DE MANDAR O PROMPT, GARANTA QUE A PESSOA TEM:

- [ ] Convite aceito no **GitHub** (repo `dosedegrowth-design/paineldosedegrowth`)
- [ ] Convite aceito na **Vercel** (team `dose-de-growths-projects`)
- [ ] Convite aceito no **Supabase** (projeto `hkjukobqpjezhpxzplpj`)
- [ ] Acesso ao **Meta Business Manager** `138706958770254`
- [ ] Arquivo **`.env.local`** recebido por canal seguro (1Password / Bitwarden / DM)
      — **nunca por e-mail, nunca em commit**
- [ ] **Node 24+** instalado (`node -v`)

---

## SEQUÊNCIA COMPLETA PRA PESSOA

```bash
# 1. clonar
git clone https://github.com/dosedegrowth-design/paineldosedegrowth.git
cd paineldosedegrowth

# 2. instalar
npm install

# 3. env (ou usar o .env.local que o Lucas mandou)
npx vercel link
npx vercel env pull .env.local

# 4. subir local e conferir que abre
npm run dev
# http://localhost:3000/disparador

# 5. abrir o Claude Code JÁ DENTRO da pasta
claude
# e colar o prompt de arranque acima
```
