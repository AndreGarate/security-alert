# Ejecutar en PowerShell (preferible "Ejecutar como administrador" si winget falla).
# Instala Python 3.12 y MongoDB Server desde el catalogo winget (sin Microsoft Store).

$ErrorActionPreference = 'Stop'
$winget = "$env:LOCALAPPDATA\Microsoft\WindowsApps\winget.exe"
if (-not (Test-Path $winget)) {
  Write-Error "No se encuentra winget. Instala App Installer desde Microsoft Store o usa Python/Mongo desde https://www.python.org y https://www.mongodb.com/try/download/community"
}

$common = @(
  '--source', 'winget',
  '--accept-package-agreements',
  '--accept-source-agreements',
  '--disable-interactivity'
)

Write-Host 'Instalando Python 3.12...' -ForegroundColor Cyan
& $winget install --id Python.Python.3.12 @common

Write-Host 'Instalando MongoDB Community Server...' -ForegroundColor Cyan
& $winget install --id MongoDB.Server @common

Write-Host 'Listo. Cierra y abre la terminal, luego: python --version  y  mongod --version' -ForegroundColor Green
