#!/usr/bin/env python3
"""
Estima o andamento (BPM) de uma trilha e onde cai a primeira batida.

Serve para alinhar os cortes da montagem ao ritmo da musica, em vez de cortar
em blocos de duracao fixa. Usa so ffmpeg + numpy.

Uso:
  python3 scripts/analisar_trilha.py trilha.mp3
  python3 scripts/analisar_trilha.py trilha.mp3 --json
"""
import argparse
import json
import subprocess
import sys

import numpy as np

TAXA = 22050          # Hz; suficiente para percussao
JANELA = 1024
SALTO = 256          # resolucao do lag: passo menor evita erro de oitava
BPM_MIN, BPM_MAX = 60.0, 180.0


def ler_audio(caminho: str) -> np.ndarray:
    """Decodifica para mono float32 via ffmpeg."""
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", caminho,
         "-ac", "1", "-ar", str(TAXA), "-f", "f32le", "-"],
        capture_output=True, check=True,
    )
    return np.frombuffer(p.stdout, dtype=np.float32)


def envelope_de_ataque(x: np.ndarray) -> np.ndarray:
    """Fluxo espectral: quanto de energia NOVA aparece a cada quadro."""
    n = 1 + (len(x) - JANELA) // SALTO
    if n < 8:
        sys.exit("audio curto demais para estimar andamento")
    janela = np.hanning(JANELA).astype(np.float32)
    quadros = np.lib.stride_tricks.sliding_window_view(x, JANELA)[::SALTO][:n]
    mag = np.abs(np.fft.rfft(quadros * janela, axis=1))
    fluxo = np.maximum(0.0, np.diff(mag, axis=0)).sum(axis=1)
    fluxo -= fluxo.mean()
    desvio = fluxo.std()
    return fluxo / desvio if desvio > 0 else fluxo


def estimar(caminho: str) -> dict:
    x = ler_audio(caminho)
    duracao = len(x) / TAXA
    env = envelope_de_ataque(x)
    fps = TAXA / SALTO                      # quadros por segundo do envelope

    # autocorrelacao do envelope: o periodo da batida vira um pico
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    lag_min = int(round(fps * 60.0 / BPM_MAX))
    lag_max = min(int(round(fps * 60.0 / BPM_MIN)), len(ac) - 1)
    if lag_max <= lag_min:
        sys.exit("audio curto demais para estimar andamento")
    lags = np.arange(lag_min, lag_max + 1)
    candidatos = 60.0 * fps / lags
    # prior log-normal centrado em 120 BPM: desempata erro de oitava (60 vs 120
    # vs 240 tem o mesmo pico de autocorrelacao) sem dobrar andamento legitimo
    peso = np.exp(-0.5 * (np.log2(candidatos / 120.0) / 0.9) ** 2)
    i = int(np.argmax(ac[lag_min:lag_max + 1] * peso))
    lag = float(lags[i])
    # interpolacao parabolica: o pico real cai entre dois lags inteiros
    k = lag_min + i
    if 0 < k < len(ac) - 1:
        a, b, c = ac[k - 1], ac[k], ac[k + 1]
        denom = a - 2.0 * b + c
        if denom != 0:
            lag += float(np.clip(0.5 * (a - c) / denom, -0.5, 0.5))
    bpm = 60.0 * fps / lag
    intervalo = 60.0 / bpm

    # fase: qual deslocamento faz o pente de batidas casar melhor com o envelope
    passo = intervalo * fps
    melhor_fase, melhor_soma = 0.0, -np.inf
    for fase in np.arange(0.0, passo, max(1.0, passo / 64.0)):
        idx = np.round(np.arange(fase, len(env) - 1, passo)).astype(int)
        soma = env[idx].sum() / max(1, len(idx))
        if soma > melhor_soma:
            melhor_soma, melhor_fase = soma, fase

    return {
        "arquivo": caminho,
        "duracao": round(duracao, 2),
        "bpm": round(bpm, 1),
        "intervalo_batida": round(intervalo, 4),
        "primeira_batida": round(melhor_fase / fps, 3),
        "confianca": round(float(melhor_soma), 3),
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("trilha")
    p.add_argument("--json", action="store_true")
    a = p.parse_args()
    r = estimar(a.trilha)
    if a.json:
        print(json.dumps(r, ensure_ascii=False))
        return
    print(f"{r['arquivo']}")
    print(f"  duracao         {r['duracao']}s")
    print(f"  andamento       {r['bpm']} BPM")
    print(f"  batida a cada   {r['intervalo_batida']}s")
    print(f"  primeira batida {r['primeira_batida']}s")
    print(f"  confianca       {r['confianca']}")


if __name__ == "__main__":
    main()
