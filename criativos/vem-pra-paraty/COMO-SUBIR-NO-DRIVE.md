# Como colocar os 144 PNGs no Drive da DDG

As pastas já existem no Drive de `dosedegrowth@gmail.com`, em
**Vem Pra Paraty — Criativos**, com Feed, Story e Fotos originais em cada
lancha. O que falta são os arquivos.

**Por que eu não subo daqui:** o conector de Drive do Claude passa o conteúdo do
arquivo por dentro da conversa. São 230 MB em 144 PNGs — não cabe, nem perto.
Texto e pastas passam; imagem em tamanho real, não. Por isso as duas saídas
abaixo rodam na sua máquina, onde o byte vai direto pro Google.

## Caminho 1 — script do repositório (recomendado, uma configuração só)

Sem dependência de npm. Roda com o Node que você já tem.

### Configuração, uma vez

1. `console.cloud.google.com` → **APIs e serviços** → ativar a **Google Drive API**
2. **Credenciais** → Criar credenciais → **ID do cliente OAuth** → tipo
   **Aplicativo para computador**
3. Se a conta `dosedegrowth@gmail.com` não for a dona do projeto, adicione ela em
   **Público-alvo → Usuários de teste**, senão o Google recusa o consentimento
4. No terminal:

```bash
export GOOGLE_OAUTH_CLIENT_ID="....apps.googleusercontent.com"
export GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-..."

cd criativos/vem-pra-paraty/motor
node subir-drive.mjs --auth      # abre o navegador, autoriza, guarda o token
```

O token fica em `~/.config/ddg-drive.json`, fora do repositório.

### Uso

```bash
node subir-drive.mjs             # sobe tudo que ainda não está lá
node subir-drive.mjs --lancha=24-pes
node subir-drive.mjs --seco      # só lista o que subiria, não envia
```

Ele compara nome e tamanho antes de enviar, então rodar duas vezes não duplica
nada — e se cair no meio, é só rodar de novo que ele continua de onde parou.
Sobe os PNGs, as fotos originais e o `INDICE-CRIATIVOS.txt` de cada lancha.

## Caminho 2 — arrastar, sem configurar nada

Se não quiser mexer em credencial:

1. Baixe a branch como ZIP:
   `https://github.com/dosedegrowth-design/paineldosedegrowth/archive/refs/heads/claude/vem-pra-paraty-meta-ads-b43uni.zip`
2. Descompacte e abra `criativos/vem-pra-paraty/`
3. Arraste o conteúdo de cada `<lancha>/out/feed-1080x1350/` pra pasta
   **Feed 1080x1350** da lancha correspondente no Drive, e o mesmo pra Story

São seis arrastadas. As pastas do Drive já estão nomeadas igual às do
repositório de propósito, pra não ter como errar.

## Caminho 3 — rclone, se você já usa

```bash
rclone config                    # novo remote, tipo drive, autorização no navegador
rclone copy 18-pes/out/feed-1080x1350 ddg:"Vem Pra Paraty — Criativos/18 pés — Mestra 180/Feed 1080x1350"
```

## O que já está no Drive

| | |
|---|---|
| Estrutura de pastas das três lanchas | pronta |
| LEIA-ME de cada lancha, com a estratégia e a ordem de teste | pronto |
| PNGs, fotos originais e índices | falta subir, por um dos caminhos acima |

E a [galeria](https://claude.ai/code/artifact/7a844de7-34ce-43a5-9967-493aaf4e903e)
continua valendo pra escolher criativo no celular sem baixar nada.
