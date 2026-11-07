# Instala los hooks compartidos del repo (ejecutar UNA vez por cada clon).
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot
git config core.hooksPath .githooks
Write-Host "OK: hooks instalados (core.hooksPath = .githooks)" -ForegroundColor Green
