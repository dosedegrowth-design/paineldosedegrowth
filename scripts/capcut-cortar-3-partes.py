#!/usr/bin/env python3
"""
Corta um video em 3 trechos (comeco / meio / fim), descarta as sobras,
poe uma legenda em portugues sobre cada trecho e salva o rascunho do CapCut.

Pre-requisitos:
  - ffmpeg/ffprobe instalados
  - servidor capcut-mcp rodando (.venv/bin/python main.py)

Uso:
  python3 scripts/capcut-cortar-3-partes.py \
      --video "$HOME/Movies/meus-videos/meu-video.mp4" \
      --draft-folder "$HOME/Movies/CapCut/User Data/Projects/com.lveditor.draft"

Sem --draft-folder o rascunho fica na raiz do capcut-mcp e voce copia na mao.
Ver docs/capcut-mcp.md para os detalhes e as armadilhas conhecidas.
"""
import argparse
import json
import subprocess
import sys
import time
import urllib.request

API = "http://127.0.0.1:9077"

LEGENDAS = [
    "O começo da história",
    "No meio do caminho",
    "E fecha assim",
]


def call(endpoint: str, payload: dict) -> dict:
    req = urllib.request.Request(
        f"{API}/{endpoint}",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    resposta = json.loads(urllib.request.urlopen(req, timeout=300).read())
    if not resposta.get("success"):
        sys.exit(f"FALHOU {endpoint}: {resposta.get('error')}")
    return resposta["output"]


def duracao(caminho: str) -> float:
    saida = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", caminho],
        capture_output=True, text=True, check=True,
    )
    return float(saida.stdout.strip())


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--video", required=True, help="caminho do arquivo de video")
    p.add_argument("--draft-folder", default=None,
                   help="pasta de rascunhos do CapCut (opcional)")
    p.add_argument("--trecho", type=float, default=5.0,
                   help="duracao de cada trecho em segundos (padrao 5)")
    args = p.parse_args()

    total = duracao(args.video)
    d = args.trecho
    if total < d * 3:
        sys.exit(f"video tem {total:.1f}s, curto demais para 3 trechos de {d}s")

    # comeco, meio centralizado, fim colado no final
    cortes = [
        (0.0, d),
        (round(total / 2 - d / 2, 2), round(total / 2 + d / 2, 2)),
        (round(total - d, 2), round(total, 2)),
    ]

    draft_id = call("create_draft", {"width": 1080, "height": 1920})["draft_id"]
    print(f"rascunho: {draft_id}  (fonte: {total:.2f}s)")

    posicao = 0.0
    for (inicio, fim), legenda in zip(cortes, LEGENDAS):
        call("add_video", {
            "draft_id": draft_id,
            "video_url": args.video,      # caminho local funciona: e copiado
            "start": inicio,
            "end": fim,
            "target_start": posicao,
            "track_name": "video_main",
            "volume": 1.0,
        })
        call("add_text", {
            "draft_id": draft_id,
            "text": legenda,
            "start": posicao + 0.2,
            "end": posicao + d - 0.2,
            "font": "Poppins_Bold",
            "font_color": "#FFFFFF",
            "font_size": 12,
            "transform_y": 0.55,          # terco inferior
            "border_color": "#000000",
            "border_width": 12.0,         # contorno para ler sobre qualquer imagem
            "intro_animation": "Fade_In",
            "intro_duration": 0.3,
            "track_name": "text_main",
        })
        print(f"  {inicio:6.2f}s -> {fim:6.2f}s  na timeline em {posicao:5.2f}s  | {legenda}")
        posicao += d

    salvar = {"draft_id": draft_id}
    if args.draft_folder:
        salvar["draft_folder"] = args.draft_folder
    call("save_draft", salvar)

    for _ in range(120):
        status = call("query_draft_status", {"task_id": draft_id})
        if status["status"] in ("completed", "failed"):
            break
        time.sleep(1)
    print("save_draft:", json.dumps(status, ensure_ascii=False))
    print(f"\nPASTA DO RASCUNHO: {draft_id}")


if __name__ == "__main__":
    main()
