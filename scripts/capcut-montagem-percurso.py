#!/usr/bin/env python3
"""
Monta um video de percurso: varios clipes em ordem, com transicao entre eles,
uma trilha por baixo e o nome do ponto sobre cada trecho.

Uso:
  # 1. gera um roteiro de exemplo para voce editar
  python3 scripts/capcut-montagem-percurso.py --exemplo > roteiro.json

  # 2. edita o roteiro.json (arquivos, legendas, ordem) e monta
  python3 scripts/capcut-montagem-percurso.py --roteiro roteiro.json \
      --draft-folder "$HOME/Movies/CapCut/User Data/Projects/com.lveditor.draft"

Ver docs/capcut-mcp.md para pre-requisitos e armadilhas conhecidas.
"""
import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request

API = "http://127.0.0.1:9077"

FORMATOS = {
    "vertical": (1080, 1920),    # Reels / TikTok / Shorts
    "horizontal": (1920, 1080),  # YouTube
    "quadrado": (1080, 1080),    # feed
}

EXEMPLO = {
    "formato": "vertical",
    "pasta_base": "/Users/voce/Movies/lancha-paraty",
    "trecho": 4.5,
    "transicao": "Dissolve",
    "transicao_duracao": 0.6,
    "musica": "trilha.mp3",
    "musica_volume": 0.7,
    "volume_clipes": 0.15,
    "clipes": [
        {"arquivo": "lancha-saindo.mp4", "legenda": "Saindo do pier", "inicio": 2.0},
        {"arquivo": "ilha-1.mp4",        "legenda": "Ilha do Araujo"},
        {"arquivo": "mar-aberto.mp4",    "legenda": "Mar aberto",     "inicio": 5.0},
        {"arquivo": "chegada.mp4",       "legenda": "Chegando em Paraty"},
    ],
}


def call(endpoint: str, payload: dict) -> dict:
    req = urllib.request.Request(
        f"{API}/{endpoint}",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    resposta = json.loads(urllib.request.urlopen(req, timeout=600).read())
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
    p.add_argument("--roteiro", help="arquivo JSON com o roteiro")
    p.add_argument("--exemplo", action="store_true", help="imprime um roteiro de exemplo")
    p.add_argument("--draft-folder", default=None, help="pasta de rascunhos do CapCut")
    args = p.parse_args()

    if args.exemplo:
        print(json.dumps(EXEMPLO, indent=2, ensure_ascii=False))
        return
    if not args.roteiro:
        sys.exit("use --roteiro roteiro.json (ou --exemplo para gerar um modelo)")

    r = json.load(open(args.roteiro, encoding="utf-8"))
    base = os.path.expanduser(r.get("pasta_base", ""))

    def caminho(nome: str) -> str:
        """Resolve o nome do arquivo contra pasta_base, se nao for absoluto."""
        nome = os.path.expanduser(nome)
        p = nome if os.path.isabs(nome) else os.path.join(base, nome)
        if not os.path.isfile(p):
            sys.exit(f"arquivo nao encontrado: {p}")
        return p

    largura, altura = FORMATOS[r.get("formato", "vertical")]
    trecho = float(r.get("trecho", 4.5))
    volume_clipes = float(r.get("volume_clipes", 0.15))

    draft_id = call("create_draft", {"width": largura, "height": altura})["draft_id"]
    print(f"rascunho: {draft_id}  ({largura}x{altura})")

    posicao = 0.0
    for i, c in enumerate(r["clipes"]):
        arquivo = caminho(c["arquivo"])
        fonte = duracao(arquivo)
        dur = float(c.get("duracao", trecho))
        inicio = float(c.get("inicio", 0.0))
        if inicio + dur > fonte:                    # nao passa do fim do arquivo
            inicio = max(0.0, fonte - dur)
            dur = min(dur, fonte)

        video = {
            "draft_id": draft_id,
            "video_url": arquivo,
            "start": round(inicio, 2),
            "end": round(inicio + dur, 2),
            "target_start": round(posicao, 2),
            "track_name": "video_main",
            "volume": volume_clipes,                # som ambiente baixo, musica lidera
            "width": largura,
            "height": altura,
        }
        if i > 0 and r.get("transicao"):            # transicao entra no clipe seguinte
            video["transition"] = r["transicao"]
            video["transition_duration"] = float(r.get("transicao_duracao", 0.6))
        call("add_video", video)

        if c.get("legenda"):
            call("add_text", {
                "draft_id": draft_id,
                "text": c["legenda"],
                "start": round(posicao + 0.3, 2),
                "end": round(posicao + dur - 0.3, 2),
                "font": "Poppins_Bold",
                "font_color": "#FFFFFF",
                "font_size": 11,
                "transform_y": 0.62,
                "border_color": "#000000",
                "border_width": 12.0,
                "intro_animation": "Fade_In",
                "intro_duration": 0.4,
                "outro_animation": "Fade_Out",
                "outro_duration": 0.4,
                "track_name": "text_main",
                "width": largura,
                "height": altura,
            })
        print(f"  {posicao:6.2f}s  {os.path.basename(arquivo):<28} "
              f"[{inicio:.1f}-{inicio + dur:.1f}]  {c.get('legenda', '')}")
        posicao += dur

    if r.get("musica"):
        call("add_audio", {
            "draft_id": draft_id,
            "audio_url": caminho(r["musica"]),
            "start": 0,
            "end": round(posicao, 2),
            "target_start": 0,
            "volume": float(r.get("musica_volume", 0.7)),
            "track_name": "audio_main",
        })
        print(f"  trilha: {os.path.basename(r['musica'])} (vol {r.get('musica_volume', 0.7)})")

    salvar = {"draft_id": draft_id}
    if args.draft_folder:
        salvar["draft_folder"] = args.draft_folder
    call("save_draft", salvar)
    for _ in range(300):
        status = call("query_draft_status", {"task_id": draft_id})
        if status["status"] in ("completed", "failed"):
            break
        time.sleep(1)

    print(f"\n{status['completed_files']}/{status['total_files']} arquivos | "
          f"duracao final {posicao:.2f}s")
    print(f"PASTA DO RASCUNHO: {draft_id}")


if __name__ == "__main__":
    main()
