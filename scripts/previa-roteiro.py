#!/usr/bin/env python3
"""
Renderiza um MP4 de previa a partir do mesmo roteiro.json que gera o projeto
do CapCut. Serve para revisar a edicao antes de abrir o app.

A previa sai sem audio: a trilha entra no CapCut. O que ela mostra e o corte,
a ordem, as transicoes e as legendas.

Uso:
  python3 scripts/previa-roteiro.py roteiro.json previa.mp4
  python3 scripts/previa-roteiro.py roteiro.json previa.mp4 --altura 1280
"""
import argparse
import json
import os
import subprocess
import sys

FONTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def escapar(t: str) -> str:
    """Escapa o texto para o filtro drawtext."""
    return t.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("roteiro")
    p.add_argument("saida")
    p.add_argument("--altura", type=int, default=960, help="altura da previa")
    p.add_argument("--crf", type=int, default=30)
    p.add_argument("--fonte", default=FONTE)
    a = p.parse_args()

    r = json.load(open(a.roteiro, encoding="utf-8"))
    base = os.path.expanduser(r.get("pasta_base", ""))
    A = a.altura
    L = A * 1080 // 1920 // 2 * 2                 # mantem 9:16, largura par
    t = float(r.get("transicao_duracao", 0.6)) if r.get("transicao") else 0.0

    clipes = r["clipes"]
    entradas, filtros, rotulos = [], [], []
    for i, c in enumerate(clipes):
        arq = os.path.expanduser(c["arquivo"])
        if not os.path.isabs(arq):
            arq = os.path.join(base, arq)
        if not os.path.isfile(arq):
            sys.exit(f"arquivo nao encontrado: {arq}")
        dur = float(c.get("duracao", r.get("trecho", 4.5)))
        entradas += ["-ss", str(c.get("inicio", 0)), "-t", str(dur), "-i", arq]

        f = (f"[{i}:v]scale={L}:{A}:force_original_aspect_ratio=increase,"
             f"crop={L}:{A},setsar=1,fps=30,format=yuv420p")
        if c.get("legenda"):
            # contorno grosso para ler sobre mar e areia clara
            f += (f",drawtext=fontfile={a.fonte}:text='{escapar(c['legenda'])}'"
                  f":fontcolor=white:fontsize={A//22}:borderw={max(2, A//240)}"
                  f":bordercolor=black@0.85:x=(w-tw)/2:y=h*0.72"
                  f":enable='between(t,0.3,{max(0.4, dur - 0.3):.2f})'")
        filtros.append(f + f"[v{i}]")
        rotulos.append(f"[v{i}]")

    if t > 0 and len(clipes) > 1:
        # encadeia xfade: cada corte entra dissolvendo no anterior
        atual, deslocamento = "[v0]", 0.0
        for i in range(1, len(clipes)):
            d_ant = float(clipes[i - 1].get("duracao", r.get("trecho", 4.5)))
            deslocamento += d_ant - (t if i > 1 else 0.0)
            saida = f"[x{i}]" if i < len(clipes) - 1 else "[vout]"
            filtros.append(f"{atual}[v{i}]xfade=transition=fade:duration={t}"
                           f":offset={deslocamento - t:.3f}{saida}")
            atual = saida
        mapa = "[vout]"
    else:
        filtros.append("".join(rotulos) + f"concat=n={len(clipes)}:v=1:a=0[vout]")
        mapa = "[vout]"

    cmd = ["ffmpeg", "-y", "-v", "error", *entradas,
           "-filter_complex", ";".join(filtros), "-map", mapa,
           "-c:v", "libx264", "-crf", str(a.crf), "-preset", "veryfast",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", a.saida]
    subprocess.run(cmd, check=True)

    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "format=duration", "-of", "default=nw=1:nk=1", a.saida],
                         capture_output=True, text=True).stdout.strip()
    print(f"{a.saida}  {L}x{A}  {float(dur):.2f}s  "
          f"{os.path.getsize(a.saida) / 1048576:.1f} MB")


if __name__ == "__main__":
    main()
