#!/usr/bin/env python3
"""
Monta um video de percurso: varios clipes em ordem, com transicao entre eles,
uma trilha por baixo e o nome do ponto sobre cada trecho.

Uso:
  # MODO AUTO — varre uma pasta, descobre quantos clipes e a duracao de cada um,
  # escolhe um trecho de cada e monta. Nao precisa saber nada de antemao.
  python3 scripts/capcut-montagem-percurso.py --auto ~/Movies/lancha-paraty \
      --musica ~/Movies/lancha-paraty/trilha.mp3 \
      --salvar-roteiro roteiro.json \
      --draft-folder "$HOME/Movies/CapCut/User Data/Projects/com.lveditor.draft"

  # so inspecionar o que ele decidiria, sem montar nada:
  python3 scripts/capcut-montagem-percurso.py --auto ~/Movies/lancha-paraty --so-roteiro

  # MODO ROTEIRO — depois de editar legendas/ordem/cortes na mao
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
from typing import Optional

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


EXTENSOES = (".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm")


def sonda(caminho: str) -> dict:
    """Le duracao e dimensoes do arquivo via ffprobe."""
    saida = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-show_entries", "format=duration",
         "-of", "json", caminho],
        capture_output=True, text=True, check=True,
    )
    d = json.loads(saida.stdout)
    fluxo = (d.get("streams") or [{}])[0]
    return {
        "duracao": float(d["format"]["duration"]),
        "largura": int(fluxo.get("width") or 0),
        "altura": int(fluxo.get("height") or 0),
    }


def escanear(pasta: str, formato: str, musica: Optional[str],
             trecho: Optional[float], duracao_total: Optional[float],
             ordem: str) -> dict:
    """Varre a pasta e monta um roteiro sozinho."""
    pasta = os.path.expanduser(pasta)
    if not os.path.isdir(pasta):
        sys.exit(f"pasta nao encontrada: {pasta}")

    arquivos = [os.path.join(pasta, n) for n in os.listdir(pasta)
                if n.lower().endswith(EXTENSOES) and not n.startswith(".")]
    if musica:
        arquivos = [a for a in arquivos if os.path.abspath(a) != os.path.abspath(
            os.path.expanduser(musica))]
    if not arquivos:
        sys.exit(f"nenhum video encontrado em {pasta} (extensoes: {', '.join(EXTENSOES)})")

    arquivos.sort(key=(os.path.getmtime if ordem == "data" else str.lower))

    infos = []
    for a in arquivos:
        try:
            infos.append((a, sonda(a)))
        except Exception as e:
            print(f"  ! ignorando {os.path.basename(a)}: {e}", file=sys.stderr)
    if not infos:
        sys.exit("nenhum video legivel")

    # quanto cada clipe recebe
    alvo = duracao_total
    if alvo is None and musica:
        alvo = sonda(os.path.expanduser(musica))["duracao"]
    if trecho is not None:
        por_clipe = trecho
    elif alvo:
        por_clipe = alvo / len(infos)
    else:
        por_clipe = 4.5
    por_clipe = max(1.5, min(8.0, round(por_clipe, 2)))   # nem foto, nem tedio

    esperado = FORMATOS[formato]
    clipes = []
    for caminho_arq, info in infos:
        dur = min(por_clipe, round(info["duracao"], 2))
        # pula o comecinho (camera acomodando) sem passar do fim
        inicio = round(min(info["duracao"] * 0.15, max(0.0, info["duracao"] - dur)), 2)
        nome = os.path.basename(caminho_arq)
        clipes.append({
            "arquivo": nome,
            "legenda": "",                       # preencher: nome do ponto
            "inicio": inicio,
            "duracao": dur,
            "_fonte": f"{info['duracao']:.1f}s {info['largura']}x{info['altura']}",
        })
        if info["largura"] and (info["largura"] > info["altura"]) != (esperado[0] > esperado[1]):
            print(f"  ! {nome} e {info['largura']}x{info['altura']}, orientacao diferente "
                  f"do formato {formato} — vai sobrar tarja no CapCut", file=sys.stderr)

    roteiro = {
        "formato": formato,
        "pasta_base": pasta,
        "transicao": "Dissolve",
        "transicao_duracao": 0.6,
        "volume_clipes": 0.15,
        "clipes": clipes,
    }
    if musica:
        roteiro["musica"] = os.path.basename(os.path.expanduser(musica))
        roteiro["musica_volume"] = 0.7
    return roteiro


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
    p.add_argument("--auto", metavar="PASTA",
                   help="varre a pasta e monta o roteiro sozinho")
    p.add_argument("--musica", default=None, help="trilha (modo --auto)")
    p.add_argument("--formato", default="vertical", choices=list(FORMATOS),
                   help="modo --auto (padrao vertical)")
    p.add_argument("--trecho", type=float, default=None,
                   help="segundos por clipe; sem isso divide pela duracao da trilha")
    p.add_argument("--duracao-total", type=float, default=None,
                   help="duracao final desejada, dividida entre os clipes")
    p.add_argument("--ordem", default="nome", choices=["nome", "data"],
                   help="ordem dos clipes no modo --auto")
    p.add_argument("--salvar-roteiro", metavar="ARQ", default=None,
                   help="grava o roteiro gerado para voce editar depois")
    p.add_argument("--so-roteiro", action="store_true",
                   help="mostra o roteiro e sai, sem montar")
    p.add_argument("--exemplo", action="store_true", help="imprime um roteiro de exemplo")
    p.add_argument("--draft-folder", default=None, help="pasta de rascunhos do CapCut")
    args = p.parse_args()

    if args.exemplo:
        print(json.dumps(EXEMPLO, indent=2, ensure_ascii=False))
        return
    if not args.roteiro and not args.auto:
        sys.exit("use --auto PASTA ou --roteiro roteiro.json (--exemplo mostra um modelo)")

    if args.auto:
        r = escanear(args.auto, args.formato, args.musica,
                     args.trecho, args.duracao_total, args.ordem)
        total = sum(c["duracao"] for c in r["clipes"])
        print(f"{len(r['clipes'])} clipes encontrados | "
              f"{r['clipes'][0]['duracao']:.2f}s cada | final {total:.2f}s\n")
        for c in r["clipes"]:
            print(f"  {c['arquivo']:<34} fonte {c['_fonte']:<18} "
                  f"corte {c['inicio']:.1f}-{c['inicio'] + c['duracao']:.1f}")
        print()
        if args.salvar_roteiro:
            with open(args.salvar_roteiro, "w", encoding="utf-8") as f:
                json.dump(r, f, indent=2, ensure_ascii=False)
            print(f"roteiro salvo em {args.salvar_roteiro} "
                  f"(preencha as legendas e rode com --roteiro)\n")
        if args.so_roteiro:
            if not args.salvar_roteiro:
                print(json.dumps(r, indent=2, ensure_ascii=False))
            return
    else:
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
