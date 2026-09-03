#!/usr/bin/env python3
"""
Renderiza um MP4 de previa a partir do mesmo roteiro.json que gera o projeto
do CapCut. Serve para revisar a edicao antes de abrir o app.

A previa leva o audio ambiente dos clipes, com cruzamento nas transicoes.
Se o roteiro tiver "musica", ela entra por cima e o ambiente cai para
"volume_clipes"; sem musica, o ambiente vai em volume cheio.

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
    p.add_argument("--sem-audio", action="store_true", help="renderiza mudo")
    a = p.parse_args()

    r = json.load(open(a.roteiro, encoding="utf-8"))
    base = os.path.expanduser(r.get("pasta_base", ""))
    A = a.altura
    L = A * 1080 // 1920 // 2 * 2                 # mantem 9:16, largura par
    t = float(r.get("transicao_duracao", 0.6)) if r.get("transicao") else 0.0

    clipes = r["clipes"]
    musica = r.get("musica")
    if musica:
        musica = os.path.expanduser(musica)
        if not os.path.isabs(musica):
            musica = os.path.join(base, musica)
        if not os.path.isfile(musica):
            sys.exit(f"trilha nao encontrada: {musica}")
    com_audio = not a.sem_audio
    # sem trilha o ambiente e o unico som, entao vai cheio
    vol_amb = float(r.get("volume_clipes", 0.15)) if musica else 1.0

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
        if com_audio:
            filtros.append(f"[{i}:a]aresample=44100,aformat=channel_layouts=stereo,"
                           f"volume={vol_amb},afade=t=in:d=0.15,"
                           f"afade=t=out:st={max(0.0, dur - 0.15):.2f}:d=0.15[a{i}]")

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

    mapa_audio = None
    if com_audio:
        if len(clipes) == 1:
            mapa_audio = "[a0]"
        elif t > 0:
            # o audio cruza junto com a imagem, na mesma duracao
            atual = "[a0]"
            for i in range(1, len(clipes)):
                saida = f"[ax{i}]" if i < len(clipes) - 1 else "[amix]"
                filtros.append(f"{atual}[a{i}]acrossfade=d={t}:c1=tri:c2=tri{saida}")
                atual = saida
            mapa_audio = "[amix]"
        else:
            filtros.append("".join(f"[a{i}]" for i in range(len(clipes)))
                           + f"concat=n={len(clipes)}:v=0:a=1[amix]")
            mapa_audio = "[amix]"

        if musica:
            idx = len(clipes)
            entradas += ["-i", musica]
            filtros.append(f"[{idx}:a]aresample=44100,aformat=channel_layouts=stereo,"
                           f"volume={float(r.get('musica_volume', 0.7))}[trilha]")
            filtros.append(f"{mapa_audio}[trilha]amix=inputs=2:duration=first:"
                           f"dropout_transition=0[aout]")
            mapa_audio = "[aout]"

    cmd = ["ffmpeg", "-y", "-v", "error", *entradas,
           "-filter_complex", ";".join(filtros), "-map", mapa,
           "-c:v", "libx264", "-crf", str(a.crf), "-preset", "veryfast",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
    if mapa_audio:
        cmd += ["-map", mapa_audio, "-c:a", "aac", "-b:a", "128k"]
    else:
        cmd += ["-an"]
    cmd.append(a.saida)
    subprocess.run(cmd, check=True)

    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "format=duration", "-of", "default=nw=1:nk=1", a.saida],
                         capture_output=True, text=True).stdout.strip()
    print(f"{a.saida}  {L}x{A}  {float(dur):.2f}s  "
          f"{os.path.getsize(a.saida) / 1048576:.1f} MB")


if __name__ == "__main__":
    main()
