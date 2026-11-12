# Convite VIP · WhatsApp (Tayssa Farias)

Card e mensagem para a Tayssa mandar no privado de cada cliente VIP, apresentando o site (12/11/2026).

- `convite-vip-tayssa.jpg`: o card, 1080 x 1350, para enviar no WhatsApp.
- `convite-vip-tayssa-alta.png`: o mesmo em 2160 x 2700.
- `mensagem-whatsapp.txt`: o texto para copiar. Trocar `{nome}` pelo nome da cliente (ou apagar).
- `gerador/`: `card.html` + `render.mjs` (Playwright). Para refazer: `cd gerador && NODE_PATH=$(npm root -g) node render.mjs` (sai em `gerador/out/`, em 2x).

Visual igual ao carrossel de dezembro: fundo marfim com os lírios do estúdio (IA do Canva, arte rascunho `DAHainzdQbk`), Bodoni Moda e Inter, foto real da Tayssa (selfie de blusa cinza, sem retoque).

Como o site trata o cadastro (conferido em 12/11/2026): `/cadastro` cria a conta em `pending`; quem tenta entrar antes ouve "Seu cadastro está com a Tayssa"; no painel, Clientes → "Cadastros para liberar", a Tayssa usa **Liberar como VIP** (o botão "Liberar" sozinho cria conta comum, sem Área VIP).
