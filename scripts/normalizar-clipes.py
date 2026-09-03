#!/usr/bin/env python3
"""
Normaliza clipes para a montagem: aplica a rotacao gravada no metadado,
enquadra tudo no mesmo formato e reescreve sem metadado de rotacao.

Por que isso e necessario: o capcut-mcp le a dimensao com
`ffprobe -show_entries stream=width,height`, que devolve a dimensao
CODIFICADA e ignora a rotacao (save_draft_impl.py:427). Um video de celular
gravado em pe costuma vir como 1280x720 com rotacao -90; sem normalizar,
o projeto registra 1280x720 e o clipe entra deitado no CapCut.

Uso:
  python3 scripts/normalizar-clipes.py ~/Movies/originais ~/Movies/prontos
  python3 scripts/normalizar-clipes.py ~/Movies/originais ~/Movies/prontos --formato horizontal
"""
import argparse
import json
import os
import subprocess
import sys

FORMATOS = {"vertical": (1080, 1920), "horizontal": (1920, 1080), "quadrado": (1080, 1080)}
EXTENSOES = (".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm")


def sonda(caminho: str) -> dict:
    saida = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height",
         "-show_entries", "side_data=rotation",
         "-show_entries", "format=duration", "-of", "json", caminho],
        capture_output=True, text=True, check=True,
    )
    d = json.loads(saida.stdout)
    st = (d.get("streams") or [{}])[0]
    rot = 0
    for sd in st.get("side_data_list", []) or []:
        if "rotation" in sd:
            rot = int(sd["rotation"])
    l, a = int(st.get("width") or 0), int(st.get("height") or 0)
    if abs(rot) in (90, 270):          # exibicao troca largura por altura
        l, a = a, l
    return {"largura": l, "altura": a, "rotacao": rot,
            "duracao": float(d["format"]["duration"])}


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("entrada")
    p.add_argument("saida")
    p.add_argument("--formato", default="vertical", choices=list(FORMATOS))
    p.add_argument("--crf", type=int, default=20, help="qualidade (menor = melhor)")
    a = p.parse_args()

    entrada, saida = os.path.expanduser(a.entrada), os.path.expanduser(a.saida)
    if not os.path.isdir(entrada):
        sys.exit(f"pasta nao encontrada: {entrada}")
    os.makedirs(saida, exist_ok=True)
    L, A = FORMATOS[a.formato]

    arquivos = sorted(n for n in os.listdir(entrada)
                      if n.lower().endswith(EXTENSOES) and not n.startswith("."))
    if not arquivos:
        sys.exit(f"nenhum video em {entrada}")

    for nome in arquivos:
        origem = os.path.join(entrada, nome)
        try:
            info = sonda(origem)
        except Exception as e:
            print(f"  ! {nome}: {e}", file=sys.stderr)
            continue
        # preserva o nome original: os roteiros referenciam os clipes por nome
        destino = os.path.join(saida, f"{os.path.splitext(nome)[0]}.mp4")

        # escala cobrindo o quadro e corta o excedente (sem tarja preta)
        vf = (f"scale={L}:{A}:force_original_aspect_ratio=increase,"
              f"crop={L}:{A},setsar=1")
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", origem, "-vf", vf,
             "-c:v", "libx264", "-crf", str(a.crf), "-preset", "medium",
             "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
             "-metadata:s:v", "rotate=0", "-movflags", "+faststart", destino],
            check=True,
        )
        depois = sonda(destino)
        aviso = ""
        if info["largura"] < L or info["altura"] < A:
            aviso = f"  (origem menor que {L}x{A}: vai perder nitidez)"
        print(f"  {nome[:46]:<46} {info['largura']}x{info['altura']} "
              f"rot={info['rotacao']:<5} -> {depois['largura']}x{depois['altura']} "
              f"rot={depois['rotacao']}{aviso}")

    print(f"\n{len(arquivos)} clipes normalizados em {saida}")


if __name__ == "__main__":
    main()
