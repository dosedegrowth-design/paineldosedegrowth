#!/usr/bin/env python3
"""
Motor de direcao: renderiza a previa e constroi o projeto do CapCut a partir
do mesmo roteiro.

Diferente de capcut-montagem-percurso.py, que enfileira clipes de duracao
igual, aqui cada plano tem duracao propria, movimento de camera proprio,
transicao propria e texto com tempo proprio — o corte serve a narracao.

Uso:
  python3 scripts/dirigir.py roteiro.json --previa previa.mp4
  python3 scripts/dirigir.py roteiro.json --capcut \
      --draft-folder "$HOME/Movies/CapCut/User Data/Projects/com.lveditor.draft"
"""
import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request

try:
    from PIL import ImageFont
except ImportError:
    ImageFont = None

API = "http://127.0.0.1:9077"
FORMATOS = {"vertical": (1080, 1920), "horizontal": (1920, 1080), "quadrado": (1080, 1080)}
# fracao da altura onde a linha de base do texto fica
POSICOES = {"alto": 0.20, "cima": 0.30, "meio": 0.50, "baixo": 0.70, "rodape": 0.80}
# no CapCut, transform_y vai de -1 (topo) a 1 (base)
POSICOES_CAPCUT = {"alto": -0.66, "cima": -0.42, "meio": 0.0, "baixo": 0.42, "rodape": 0.66}
FINO = " "          # espaco fino, usado para abrir o espacamento entre letras


def espacar(t: str, ativo: bool) -> str:
    """Abre o espacamento entre letras. drawtext nao tem letter-spacing."""
    if not ativo:
        return t
    return FINO.join(t)


def escapar(t: str) -> str:
    return t.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’").replace("%", "\\%")


def medir(t: str, fonte: str, tam: int) -> float:
    if ImageFont is None:
        return len(t) * tam * 0.55
    return ImageFont.truetype(fonte, tam).getbbox(t)[2]


def sonda_dur(caminho: str) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", caminho],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def resolver(nome: str, base: str) -> str:
    nome = os.path.expanduser(nome)
    p = nome if os.path.isabs(nome) else os.path.join(base, nome)
    if not os.path.isfile(p):
        sys.exit(f"arquivo nao encontrado: {p}")
    return p


# ---------------------------------------------------------------- previa

def filtro_movimento(mov: dict, L: int, A: int, dur: float, fps: int = 30) -> str:
    """Movimento de camera.

    Panoramica sai por scale+crop animado, nao por zoompan: zoompan combinado
    com drawtext derruba o ffmpeg por memoria neste ambiente, e crop com
    eval=frame faz o mesmo trabalho sem bufferizar.
    """
    encaixe = f"scale={L}:{A}:force_original_aspect_ratio=increase,crop={L}:{A}"
    if not mov:
        return encaixe
    tipo = mov.get("tipo", "push")
    de = float(mov.get("de", 1.0))
    ate = float(mov.get("ate", 1.08))

    if tipo in ("push", "pull"):
        z0, z1 = (de, ate) if tipo == "push" else (ate, de)
        n = max(1, int(dur * fps))
        z = f"{z0}+({z1}-{z0})*on/{n}" if z1 >= z0 else f"{z0}-({z0}-{z1})*on/{n}"
        # zoompan direto da fonte: sem pre-escala, que e o que pesava
        return (f"{encaixe},zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)'"
                f":y='ih/2-(ih/zoom/2)':s={L}x{A}:fps={fps},setsar=1")

    # panoramica: amplia um pouco e desliza a janela
    z = max(de, 1.10)
    lg, al = int(L * z), int(A * z)
    lg += lg % 2
    al += al % 2
    if tipo in ("esq", "dir"):
        x = f"(iw-ow)*t/{dur}" if tipo == "dir" else f"(iw-ow)*(1-t/{dur})"
        y = "(ih-oh)/2"
    else:
        x = "(iw-ow)/2"
        y = f"(ih-oh)*t/{dur}" if tipo == "baixo" else f"(ih-oh)*(1-t/{dur})"
    return (f"scale={lg}:{al}:force_original_aspect_ratio=increase,crop={lg}:{al},"
            f"crop={L}:{A}:x='{x}':y='{y}',setsar=1")


def camadas_texto(txt: dict, L: int, A: int, dur: float, fonte: str) -> str:
    """Titulo em caixa alta, espacado, com sombra suave — nunca contorno grosso."""
    linhas = [l for l in (txt.get("linhas") or [txt.get("linha", "")]) if l]
    if not linhas:
        return ""
    estilo = txt.get("estilo", "titulo")
    escala = float(txt.get("tamanho", 1.0))
    base_tam = int(A * (0.038 if estilo == "titulo" else 0.030) * escala)
    espaca = estilo == "titulo" and max(len(l) for l in linhas) <= 26
    ini = float(txt.get("inicio", 0.2))
    fim = min(dur, ini + float(txt.get("duracao", dur - ini - 0.2)))
    fade = 0.35

    # hierarquia intencional: a primeira linha e o titulo, as seguintes sao
    # subtitulo em 78%. Sem isso a linha mais longa encolhe sozinha e a
    # hierarquia vira acidente.
    render = []
    for j, l in enumerate(linhas):
        t = espacar(l.upper() if estilo == "titulo" else l, espaca)
        tam = base_tam if j == 0 else int(base_tam * 0.78)
        while medir(t, fonte, tam) > L * 0.84 and tam > int(A * 0.018):
            tam -= 1
        render.append((t, tam))
    alt = int(render[0][1] * 1.45)
    y0 = POSICOES.get(txt.get("posicao", "baixo"), 0.70) * A - (len(render) - 1) * alt / 2

    f = ""
    # veu em degrade atras do texto: branco sobre agua clara nao separa so com
    # sombra. Oito faixas de opacidade decrescente aproximam um gradiente.
    if txt.get("veu", True):
        altura_veu = int(alt * (len(render) + 2.6))
        topo = int(y0 - alt * 1.25)
        faixas = 24
        for k in range(faixas):
            op = 0.30 * (1 - k / faixas) ** 1.7
            h = max(1, altura_veu // faixas)
            yk = topo + k * h
            # espelha para escurecer tambem acima do texto
            for yy in (yk, topo + altura_veu - (k + 1) * h):
                f += (f",drawbox=x=0:y={yy}:w={L}:h={h}:color=black@{op:.3f}:t=fill"
                      f":enable='between(t,{ini},{fim})'")
    for j, (t, tam) in enumerate(render):
        # opacidade animada: entra e sai em fade, sem salto
        alpha = (f"if(lt(t,{ini}),0,"
                 f"if(lt(t,{ini + fade}),(t-{ini})/{fade},"
                 f"if(lt(t,{fim - fade}),1,"
                 f"if(lt(t,{fim}),({fim}-t)/{fade},0))))")
        # duas sombras: uma difusa para separar do fundo claro, outra fina
        # logo abaixo para definir a letra. Sem contorno, que engrossa o texto.
        for dx, dy, op in ((0, max(2, tam // 12), 0.5), (0, max(1, tam // 26), 0.9)):
            f += (f",drawtext=fontfile={fonte}:text='{escapar(t)}'"
                  f":fontcolor=white@0:fontsize={tam}"
                  f":shadowcolor=black@{op}:shadowx={dx}:shadowy={dy}"
                  f":x=(w-tw)/2"
                  f":y='{y0 + j * alt:.0f}+{max(3, tam//7)}"
                  f"*(1-min(1,max(0,(t-{ini})/{fade})))'"
                  f":alpha='{alpha}'")
        # sobe alguns pixels enquanto entra: o texto assenta, nao pisca
        yb = y0 + j * alt
        ye = f"{yb:.0f}+{max(3, tam//7)}*(1-min(1,max(0,(t-{ini})/{fade})))"
        f += (f",drawtext=fontfile={fonte}:text='{escapar(t)}'"
              f":fontcolor=white:fontsize={tam}"
              f":x=(w-tw)/2:y='{ye}'"
              f":alpha='{alpha}'")
    return f


def previa(r: dict, base: str, saida: str, altura: int, crf: int, fonte: str) -> None:
    """Renderiza em passes: um plano por vez, depois junta.

    Um unico grafo com todos os planos estoura a memoria — zoompan bufferiza
    por entrada e onze entradas simultaneas levam SIGKILL.
    """
    A = altura
    L = A * 1080 // 1920 // 2 * 2
    planos = r["planos"]
    tmp = os.path.join(os.path.dirname(os.path.abspath(saida)) or ".", ".previa_tmp")
    os.makedirs(tmp, exist_ok=True)
    amb = float(r.get("ambiente_volume", 0.10))

    # passe 1: cada plano isolado
    segs = []
    for i, p in enumerate(planos):
        arq = resolver(p["arquivo"], base)
        dur = float(p["duracao"])
        vel = float(p.get("velocidade", 1.0))
        vf = ""
        if vel != 1.0:
            vf += f"setpts=PTS/{vel},"
        vf += filtro_movimento(p.get("movimento"), L, A, dur)
        vf += ",fps=30,format=yuv420p"
        af = (f"aresample=44100,aformat=channel_layouts=stereo,volume={amb},"
              f"afade=t=in:d=0.12,afade=t=out:st={max(0.0, dur-0.12):.2f}:d=0.12")
        out = os.path.join(tmp, f"seg{i:02d}.mp4")
        # o segundo passe roda quando ha texto ou grading: somar eq/curves ao
        # zoompan no mesmo grafo tambem leva SIGKILL neste ambiente
        segundo = bool(p.get("texto")) or r.get("grading", True)
        bruto = os.path.join(tmp, f"mov{i:02d}.mp4") if segundo else out
        # movimento e texto em passagens separadas: zoompan junto com drawtext
        # derruba o ffmpeg por memoria neste ambiente
        subprocess.run(["ffmpeg", "-y", "-v", "error",
                        "-ss", str(p.get("inicio", 0)), "-t", str(dur * vel), "-i", arq,
                        "-vf", vf, "-af", af, "-t", str(dur),
                        "-c:v", "libx264", "-crf", str(max(16, crf - 6)),
                        "-preset", "veryfast", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "192k", "-ar", "44100", bruto], check=True)
        if segundo:
            camadas = ""
            if r.get("grading", True):
                # tratamento leve: contraste, um toque de saturacao, pretos
                # levantados. Nada de azul neon — a agua continua agua.
                camadas += ("eq=contrast=1.06:saturation=1.05:gamma=1.01,"
                            "curves=all='0/0.015 0.25/0.245 0.75/0.765 1/1'")
            if p.get("texto"):
                t2 = camadas_texto(p["texto"], L, A, dur, fonte)
                camadas = (camadas + t2) if camadas else t2.lstrip(",")
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", bruto,
                            "-vf", camadas, "-c:v", "libx264",
                            "-crf", str(max(18, crf - 4)), "-preset", "veryfast",
                            "-pix_fmt", "yuv420p", "-c:a", "copy", out], check=True)
            os.remove(bruto)
        segs.append(out)

    # passe 2: onde ha transicao, funde o par num arquivo so (2 entradas, leve)
    fundidos, i = [], 0
    while i < len(segs):
        if i + 1 < len(segs) and planos[i + 1].get("transicao"):
            t = float(planos[i + 1].get("transicao_dur", 0.4))
            d0 = sonda_dur(segs[i])
            out = os.path.join(tmp, f"par{i:02d}.mp4")
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", segs[i], "-i", segs[i + 1],
                            "-filter_complex",
                            f"[0:v][1:v]xfade=transition=fade:duration={t}:offset={d0-t:.3f}[v];"
                            f"[0:a][1:a]acrossfade=d={t}:c1=tri:c2=tri[a]",
                            "-map", "[v]", "-map", "[a]",
                            "-c:v", "libx264", "-crf", str(max(18, crf - 4)),
                            "-preset", "veryfast", "-pix_fmt", "yuv420p",
                            "-c:a", "aac", "-b:a", "192k", "-ar", "44100", out], check=True)
            fundidos.append(out)
            i += 2
        else:
            fundidos.append(segs[i])
            i += 1

    # passe 3: concatena tudo em corte seco
    lista = os.path.join(tmp, "lista.txt")
    with open(lista, "w") as f:
        for x in fundidos:
            f.write(f"file '{os.path.abspath(x)}'\n")
    corte = os.path.join(tmp, "corte.mp4")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
                    "-i", lista, "-c", "copy", corte], check=True)

    # passe 4: mistura de audio — ambiente + trilha abaixada sob a voz + voz
    entradas = ["-i", corte]
    filtros, mapa_a = [], "0:a"
    efeitos = []
    idx = 1
    if r.get("musica"):
        entradas += ["-i", resolver(r["musica"], base)]
        filtros.append(f"[{idx}:a]aresample=44100,aformat=channel_layouts=stereo,"
                       f"volume={float(r.get('musica_volume', 0.5))}[mus]")
        i_mus = idx
        idx += 1
    if r.get("narracao"):
        entradas += ["-i", resolver(r["narracao"], base)]
        atraso = int(float(r.get("narracao_atraso", 0)) * 1000)
        filtros.append(f"[{idx}:a]aresample=44100,aformat=channel_layouts=stereo,"
                       f"adelay={atraso}|{atraso},"
                       f"volume={float(r.get('narracao_volume', 1.0))}[voz]")
        idx += 1
        if r.get("musica"):
            filtros.append("[voz]asplit=2[voz1][chave]")
            filtros.append("[mus][chave]sidechaincompress=threshold=0.06:ratio=12"
                           ":attack=15:release=420:makeup=1[musduck]")
            filtros.append("[0:a][musduck][voz1]amix=inputs=3:duration=first"
                           ":dropout_transition=0:normalize=0[mx]")
        else:
            filtros.append("[0:a][voz]amix=inputs=2:duration=first:normalize=0[mx]")
        filtros.append("[mx]alimiter=limit=0.95:level=false[aout]")
        mapa_a = "[aout]"
    elif r.get("musica"):
        filtros.append("[0:a][mus]amix=inputs=2:duration=first:normalize=0[mx]")
        filtros.append("[mx]alimiter=limit=0.95:level=false[aout]")
        mapa_a = "[aout]"

    # efeitos sonoros pontuais, cada um entrando no seu tempo
    for e in r.get("sfx", []) or []:
        entradas += ["-i", resolver(e["arquivo"], base)]
        atraso_e = int(float(e.get("em", 0)) * 1000)
        corte = f"atrim=0:{float(e['duracao'])}," if e.get("duracao") else ""
        filtros.append(f"[{idx}:a]aresample=44100,aformat=channel_layouts=stereo,"
                       f"{corte}asetpts=PTS-STARTPTS,"
                       f"volume={float(e.get('volume', 0.5))},"
                       f"afade=t=in:d=0.25,"
                       f"afade=t=out:st={max(0.0, float(e.get('duracao', 3)) - 0.6):.2f}:d=0.6,"
                       f"adelay={atraso_e}|{atraso_e}[sfx{idx}]")
        efeitos.append(f"[sfx{idx}]")
        idx += 1
    if efeitos:
        antes = mapa_a
        filtros.append(f"{antes}{''.join(efeitos)}amix=inputs={1+len(efeitos)}"
                       f":duration=first:dropout_transition=0:normalize=0[comsfx]")
        filtros.append("[comsfx]alimiter=limit=0.95:level=false[afinal]")
        mapa_a = "[afinal]"

    cmd = ["ffmpeg", "-y", "-v", "error", *entradas]
    if filtros:
        cmd += ["-filter_complex", ";".join(filtros)]
    cmd += ["-map", "0:v", "-map", mapa_a, "-c:v", "libx264", "-crf", str(crf),
            "-preset", "veryfast", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", saida]
    subprocess.run(cmd, check=True)

    for x in os.listdir(tmp):
        os.remove(os.path.join(tmp, x))
    os.rmdir(tmp)
    print(f"{saida}  {L}x{A}  {sonda_dur(saida):.2f}s  "
          f"{os.path.getsize(saida)/1048576:.1f} MB  {len(planos)} planos")


# ---------------------------------------------------------------- capcut

def api(ep: str, payload: dict) -> dict:
    req = urllib.request.Request(f"{API}/{ep}", data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req, timeout=600).read())
    if not resp.get("success"):
        sys.exit(f"FALHOU {ep}: {resp.get('error')}")
    return resp["output"]


def capcut(r: dict, base: str, draft_folder, fonte_capcut: str) -> str:
    L, A = FORMATOS[r.get("formato", "vertical")]
    did = api("create_draft", {"width": L, "height": A})["draft_id"]
    print(f"rascunho: {did}  ({L}x{A})")

    pos = 0.0
    for i, p in enumerate(r["planos"]):
        arq = resolver(p["arquivo"], base)
        dur = round(float(p["duracao"]), 3)
        ini = round(float(p.get("inicio", 0)), 3)
        pos = round(pos, 3)
        v = {"draft_id": did, "video_url": arq, "start": ini,
             "end": round(ini + dur * float(p.get("velocidade", 1.0)), 3),
             "target_start": pos, "track_name": "video_main",
             "volume": float(r.get("ambiente_volume", 0.10)),
             "speed": float(p.get("velocidade", 1.0)), "width": L, "height": A}
        if p.get("transicao"):
            v["transition"] = p["transicao"]
            v["transition_duration"] = float(p.get("transicao_dur", 0.4))
        api("add_video", v)

        mov = p.get("movimento")
        if mov:                       # o movimento vira keyframe de escala no projeto
            tipo = mov.get("tipo", "push")
            de, ate = float(mov.get("de", 1.0)), float(mov.get("ate", 1.08))
            if tipo == "pull":
                de, ate = ate, de
            if tipo in ("push", "pull"):
                props, tempos, vals = ["uniform_scale"]*2, [pos, pos+dur], [str(de), str(ate)]
            else:
                z = max(de, 1.06)
                eixo = "position_x" if tipo in ("esq", "dir") else "position_y"
                a, b = (-0.08, 0.08) if tipo in ("dir", "baixo") else (0.08, -0.08)
                props = ["uniform_scale", "uniform_scale", eixo, eixo]
                tempos = [pos, pos+dur, pos, pos+dur]
                vals = [str(z), str(z), str(a), str(b)]
            api("add_video_keyframe", {"draft_id": did, "track_name": "video_main",
                                       "property_types": props, "times": tempos,
                                       "values": vals})

        t = p.get("texto")
        if t:
            linhas = [l for l in (t.get("linhas") or [t.get("linha", "")]) if l]
            if linhas:
                ti = pos + float(t.get("inicio", 0.2))
                td = float(t.get("duracao", dur - float(t.get("inicio", 0.2)) - 0.2))
                espaca = t.get("estilo", "titulo") == "titulo" and max(map(len, linhas)) <= 26
                texto = "\n".join(espacar(l.upper(), espaca)
                                  if t.get("estilo", "titulo") == "titulo" else l
                                  for l in linhas)
                api("add_text", {
                    "draft_id": did, "text": texto,
                    "start": round(ti, 3), "end": round(ti + td, 3),
                    "font": fonte_capcut, "font_color": "#FFFFFF",
                    "font_size": round(7.5 * float(t.get("tamanho", 1.0)), 1),
                    "transform_y": POSICOES_CAPCUT.get(t.get("posicao", "baixo"), 0.42),
                    "border_width": 0.0, "background_alpha": 0.0,
                    "intro_animation": "Fade_In", "intro_duration": 0.35,
                    "outro_animation": "Fade_Out", "outro_duration": 0.35,
                    "track_name": "text_main", "width": L, "height": A})
        pos = round(pos + dur, 3)

    if r.get("musica"):
        api("add_audio", {"draft_id": did, "audio_url": resolver(r["musica"], base),
                          "start": 0, "end": round(pos, 3), "target_start": 0,
                          "volume": float(r.get("musica_duck", 0.22)),
                          "track_name": "musica"})
    if r.get("narracao"):
        nar = resolver(r["narracao"], base)
        api("add_audio", {"draft_id": did, "audio_url": nar, "start": 0,
                          "end": round(min(sonda_dur(nar), pos), 3),
                          "target_start": round(float(r.get("narracao_atraso", 0)), 3),
                          "volume": float(r.get("narracao_volume", 1.0)),
                          "track_name": "narracao"})

    salvar = {"draft_id": did}
    if draft_folder:
        salvar["draft_folder"] = draft_folder
    api("save_draft", salvar)
    for _ in range(300):
        st = api("query_draft_status", {"task_id": did})
        if st["status"] in ("completed", "failed"):
            break
        time.sleep(1)
    print(f"  {st['completed_files']}/{st['total_files']} arquivos | {pos:.2f}s")
    print(f"  PASTA DO RASCUNHO: {did}")
    return did


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("roteiro")
    p.add_argument("--previa", metavar="ARQ")
    p.add_argument("--capcut", action="store_true")
    p.add_argument("--draft-folder", default=None)
    p.add_argument("--altura", type=int, default=960)
    p.add_argument("--crf", type=int, default=28)
    p.add_argument("--fonte", default="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf")
    p.add_argument("--fonte-capcut", default="Poppins_Regular")
    a = p.parse_args()

    r = json.load(open(a.roteiro, encoding="utf-8"))
    base = os.path.expanduser(r.get("pasta_base", ""))
    total = sum(float(x["duracao"]) for x in r["planos"])
    print(f"{r.get('titulo', a.roteiro)}: {len(r['planos'])} planos | {total:.2f}s")
    if a.previa:
        previa(r, base, a.previa, a.altura, a.crf, a.fonte)
    if a.capcut:
        capcut(r, base, a.draft_folder, a.fonte_capcut)
    if not a.previa and not a.capcut:
        sys.exit("use --previa ARQ e/ou --capcut")


if __name__ == "__main__":
    main()
