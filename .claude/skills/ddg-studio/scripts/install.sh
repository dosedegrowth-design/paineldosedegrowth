#!/usr/bin/env bash
# Instala a skill DDG Studio na maquina (Mac/Linux). Uso:
#   bash install.sh <KIE_API_KEY>
set -e
KEY="${1:-}"
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/.claude/skills/ddg-studio"
mkdir -p "$HOME/.claude/skills" "$HOME/.ddg-studio"
if [ "$SRC" != "$DEST" ]; then
  rm -rf "$DEST"
  cp -R "$SRC" "$DEST"
fi
if [ -n "$KEY" ]; then
  printf 'KIE_API_KEY=%s\n' "$KEY" > "$HOME/.ddg-studio/.env"
  chmod 600 "$HOME/.ddg-studio/.env"
fi
echo "Skill instalada em $DEST"
python3 "$DEST/scripts/kie.py" credit || echo "Sem chave ainda: rode  bash install.sh <KIE_API_KEY>"
echo "Pronto. Abra o Claude Code em qualquer projeto e peça: 'gera um hero pro site X' (a skill ddg-studio ativa sozinha)."
