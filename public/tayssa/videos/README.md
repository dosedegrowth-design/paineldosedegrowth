# Vídeos reais da Tayssa

Coloque aqui os vídeos com estes nomes. Enquanto um arquivo não existe, o
lugar usa a foto real do slot (ou o campo tonal com a flor da casa) — nunca
vídeo de banco. Trocar o vídeo é só trocar o arquivo. Manifesto em
`lib/tayssa/media.ts`.

Cada lugar tem **duas versões** (o site escolhe pela orientação da tela) e
**um pôster** de cada (o primeiro quadro, em JPG, que aparece antes do
vídeo carregar e para quem desliga animações).

| Arquivo | Onde aparece | Duração | Observações |
|---|---|---|---|
| `hero-16x9.mp4` + `hero-16x9.jpg` | Janela em arco da abertura (computador) | 6–10 s, loop | sem som, câmera parada ou movimento lento; o rosto/olhar no centro (o arco corta as laterais) |
| `hero-9x16.mp4` + `hero-9x16.jpg` | Mesma janela no celular | 6–10 s, loop | vertical; o olhar no terço superior |
| `processo-16x9.mp4` + `.jpg` | "O olhar, de perto" — abre até a tela cheia | 20–40 s | aplicação de perto, sem texto/legenda gravados no vídeo |
| `processo-9x16.mp4` + `.jpg` | Mesma seção no celular | 20–40 s | vertical |
| `espaco-16x9.mp4` + `.jpg` | "O estúdio" | 10–20 s | o ambiente: cadeira, luz, detalhes, a parede da flor |
| `espaco-9x16.mp4` + `.jpg` | Mesma seção no celular | 10–20 s | vertical |

Formato: MP4 H.264, sem áudio, 1920×1080 (horizontal) / 1080×1920
(vertical), até ~8 MB cada (CRF 23–26). O original da câmera, nunca o
arquivo baixado do Instagram (legenda e compressão queimadas).

Converter (exemplo):

```bash
ffmpeg -i original.mov -an -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 24 -preset slow -movflags +faststart hero-16x9.mp4
ffmpeg -i hero-16x9.mp4 -frames:v 1 -q:v 3 hero-16x9.jpg
```
