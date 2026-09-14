# Fotos reais da VIVA

Este é o maior ativo do projeto (§20 do briefing). Enquanto o arquivo não
estiver aqui, o site desenha um campo tonal com a descrição do que aquela
foto precisa ser — **nunca** stock, ilustração ou imagem sintética.

## Como colocar

1. Salve o arquivo com **exatamente** o nome que `lib/photos.ts` espera
   (`.jpg`, minúsculas).
2. Pronto. Nenhum componente muda.

Proporções sugeridas: `*-hero` em 16:9 (mínimo 2000px de largura), cards
em 4:3, galerias em 1:1.

## Lista de arquivos esperados

| Arquivo | O que é |
|---|---|
| `home-hero.jpg` | Abertura: fotografia real e impactante de combate/proteção contra incêndio — fogo, água, bombeiro ou sistema funcionando, atmosfera escura (§5) |
| `combate-hero.jpg` · `combate-card.jpg` · `combate-destaque.jpg` · `combate-01..04.jpg` | Bombas, hidrantes, SPK, painéis (§8) |
| `alarme-hero.jpg` · `alarme-card.jpg` · `alarme-destaque.jpg` · `alarme-01..04.jpg` | Central, detectores, sirenes, acionadores — **em obra**, não equipamento isolado (§9) |
| `spda-hero.jpg` · `spda-card.jpg` · `spda-destaque.jpg` · `spda-01..04.jpg` | Cobertura, captores, mastros, malhas, medição com terrômetro (§10) |
| `laudos-hero.jpg` | O profissional **de frente**, em frente à edificação, com a documentação (§11) |
| `laudos-card.jpg` · `laudos-clcb.jpg` · `laudos-avcb.jpg` · `laudos-obra-01..04.jpg` | Documentos e obras de regularização (§11) |
| `relatorio-hero.jpg` | O profissional em inspeção, **de costas, com prancheta** — foto obrigatória, não substituir por ícone (§13) |
| `relatorio-card.jpg` · `relatorio-conforme.jpg` · `relatorio-falha.jpg` · `relatorio-manut-01..03.jpg` | Inspeção, item em conformidade, falha identificada, manutenção (§12) |

### Subpastas

- `casos/` — fotos das janelas de casos reais (nome definido em `lib/casos.ts`)
- `instagram/` — prints de post (nome definido em `lib/instagram.ts`)

## Regras que não podem quebrar

- Não usar obra que **não** foi executada pela VIVA (§8).
- Não usar a obra industrial/química de teste de pressão (§8).
- Não usar a foto antiga de fio/cabo como elemento principal de alarme (§9).
- Foto real > ícone > ilustração. Sempre (§13).
