#!/bin/sh
# Instala los hooks compartidos del repo (ejecutar UNA vez por cada clon).
set -e
cd "$(dirname "$0")/.."
git config core.hooksPath .githooks
echo "OK: hooks instalados (core.hooksPath = .githooks)"
