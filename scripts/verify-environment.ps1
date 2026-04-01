# Verifica Python, MongoDB, dependencias del backend y puertos.
# Ejecutar: powershell -ExecutionPolicy Bypass -File scripts/verify-environment.ps1

$ErrorActionPreference = 'Continue'
$ok = $true
$root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $root "backend\server.py"))) {
  Write-Host "No se encontro backend\server.py bajo $root" -ForegroundColor Red
  exit 1
}
Write-Host ""
Write-Host "=== Alerta Segura - verificacion del entorno ===" -ForegroundColor Cyan
Write-Host ""

function Test-Port($port) {
  try {
    return Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
  } catch { return $false }
}

# Python
$py = $null
foreach ($name in @('python', 'python3', 'py')) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { $py = $cmd; break }
}
if (-not $py) {
  $candidates = @(
    "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
    "$env:ProgramFiles\Python313\python.exe",
    "$env:ProgramFiles\Python312\python.exe"
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) { $py = $p; break }
  }
}

if ($py) {
  $ver = if ($py -is [string]) { & $py --version 2>&1 } else { & $py.Name --version 2>&1 }
  Write-Host "OK  Python: $ver" -ForegroundColor Green
  if ($py -isnot [string]) { Write-Host "    Ruta: $($py.Source)" -ForegroundColor Gray }
} else {
  Write-Host "FALTA  Python no esta en PATH ni en rutas tipicas." -ForegroundColor Red
  Write-Host "       Instala: winget install Python.Python.3.12 --source winget --accept-package-agreements --accept-source-agreements" -ForegroundColor Yellow
  $ok = $false
}

# MongoDB
$mongod = Get-Command mongod -ErrorAction SilentlyContinue
$mongoSvc = Get-Service -Name MongoDB* -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Running' }
$port27017 = Test-Port 27017

if ($mongod) {
  Write-Host "OK  mongod en PATH: $($mongod.Source)" -ForegroundColor Green
}
if ($mongoSvc) {
  Write-Host "OK  Servicio MongoDB en ejecucion: $($mongoSvc.Name)" -ForegroundColor Green
}
if ($port27017 -and -not $mongoSvc) {
  Write-Host "OK  Puerto 27017 abierto" -ForegroundColor Green
}
$mongoOk = $port27017 -or $mongoSvc
if (-not $mongoOk) {
  Write-Host "FALTA  MongoDB no responde en 127.0.0.1:27017 (servicio no activo o no instalado)" -ForegroundColor Red
  Write-Host "       Opcion A: winget install MongoDB.Server --source winget --accept-package-agreements --accept-source-agreements" -ForegroundColor Yellow
  Write-Host "       Opcion B: docker compose up -d (en la carpeta del proyecto)" -ForegroundColor Yellow
  $ok = $false
}

# pip backend
$backend = Join-Path $root "backend"
if (Test-Path $backend) {
  if ($py) {
    $exe = if ($py -is [string]) { $py } else { $py.Source }
    Push-Location $backend
    & $exe -m pip install -q -r requirements.txt 2>&1 | Out-Null
    $pipOk = $LASTEXITCODE -eq 0
    Pop-Location
    if ($pipOk) { Write-Host "OK  pip install -r requirements.txt (backend)" -ForegroundColor Green }
    else { Write-Host "AVISO  pip install tuvo problemas; ejecuta pip install manualmente y revisa errores" -ForegroundColor Yellow }
  }
}

$api8001 = Test-Port 8001
if ($api8001) {
  try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "OK  API backend health: $($r | ConvertTo-Json -Compress)" -ForegroundColor Green
  } catch {
    Write-Host "AVISO  Puerto 8001 abierto pero /api/health no responde como se espera" -ForegroundColor Yellow
  }
} else {
  Write-Host "INFO  Backend no esta en :8001 (arranca con: python -m uvicorn server:app --host 0.0.0.0 --port 8001)" -ForegroundColor Gray
}

# Frontend
$fe = Join-Path $root "frontend"
if (Test-Path $fe) {
  Push-Location $fe
  npx tsc --noEmit 2>&1 | Out-Null
  $tf = $LASTEXITCODE -eq 0
  Pop-Location
  if ($tf) { Write-Host "OK  frontend: npx tsc --noEmit" -ForegroundColor Green }
  else { Write-Host "ERROR  TypeScript en frontend tiene errores" -ForegroundColor Red; $ok = $false }
}

Write-Host ""
if ($ok -and $mongoOk) {
  Write-Host "Resumen: entorno listo para desarrollo (Python + MongoDB)." -ForegroundColor Green
} elseif ($ok) {
  Write-Host "Resumen: Python OK; falta MongoDB o el servicio no esta en marcha." -ForegroundColor Yellow
} else {
  Write-Host "Resumen: instala lo faltante y vuelve a ejecutar este script." -ForegroundColor Yellow
}
Write-Host ""
