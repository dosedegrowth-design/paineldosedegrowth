---
name: ddg-processo-padrao-site
description: "REGRA Lucas 14/09/2026 — todo site/projeto web nasce com o processo padrão: pasta interna em ~/Antigravity + repo GitHub dosedegrowth-design + projeto Vercel no team Dose de Growth. Exceção só se o Lucas disser explicitamente."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0f90eabe-7896-44c0-8e4a-b23896674aa3
  modified: 2026-09-15T02:04:14.403Z
---

# Processo padrão pra criar site (vale pra TODO projeto web da DDG)

1. **Pasta interna**: `~/Antigravity/<nome-do-projeto>` (nunca deixar o projeto só em ~/Claude ou scratchpad).
2. **Git + GitHub**: repo em `github.com/dosedegrowth-design/<nome>` (privado por padrão), branch `main`.
   Não tem `gh` instalado: usar a API com o token do keychain
   (`printf 'protocol=https\nhost=github.com\n\n' | git credential-osxkeychain get`) → `POST /user/repos`.
3. **Vercel**: `npx vercel link --yes --project <nome> --scope dose-de-growths-projects` (conecta o repo GitHub
   automaticamente) e `npx vercel --prod --yes --scope dose-de-growths-projects`. CLI já logada como dosedegrowth-design.
4. Registrar no `~/Claude/.claude/launch.json` uma entrada de preview (`name`, porta própria) pra validar no navegador.

**Why:** o Lucas quer tudo vinculado à Dose de Growth, no mesmo lugar, pra qualquer pessoa/sessão achar e continuar.
Ele já teve que pedir isso depois de eu ter criado o site da Soffia em ~/Claude ("processo padrão pasta interna + git + vercel").

**How to apply:** ao criar qualquer site/LP/app: fazer os 4 passos SEM perguntar (é o padrão). Só sair do padrão se o
Lucas disser explicitamente naquela hora ("esse aqui vai pra conta X"). Exceção é pontual e dita por ele.
Deploy em produção também entra no padrão quando ele diz "sobe"/"vercel"; se for site de cliente com domínio, confirmar
o domínio antes de apontar DNS. Ver [[soffia-tecnologia-site]] (primeiro projeto que seguiu o fluxo completo).

**Exceção (21/09/2026):** site de **prospecção no RADAR** não segue isso; vai pro hub único, ver [[ddg-radar-sites-prospeccao-hub]]. Só quando o Lucas disser que é prospecção no RADAR.

Antes de entregar qualquer site: validar o celular primeiro, ver [[ddg-site-mobile-primeiro]].
