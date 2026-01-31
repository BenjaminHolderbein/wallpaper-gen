# AI Wallpaper Generator - One-Command Setup & Run
# Usage: .\start.ps1
#   -SkipInstall    Skip dependency installation
#   -BackendOnly    Only run the backend
#   -FrontendOnly   Only run the frontend

param(
    [switch]$SkipInstall,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "`n=== AI Wallpaper Generator ===" -ForegroundColor Cyan

# --- Prerequisite checks ---
function Test-Command($cmd) {
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Invoke-Uv {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$UvArgs
    )
    if (Test-Command "uv") {
        & uv @UvArgs
        return $LASTEXITCODE
    }

    & python -m uv @UvArgs
    return $LASTEXITCODE
}

function Test-UvAvailable {
    if (Test-Command "uv") { return $true }
    try {
        & python -m uv --version | Out-Null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

$missing = @()
if (-not (Test-Command "python"))  { $missing += "Python (python)" }
if (-not (Test-UvAvailable))       { $missing += "uv (uv) or python -m uv" }
if (-not (Test-Command "node"))    { $missing += "Node.js (node)" }
if (-not (Test-Command "npm"))     { $missing += "npm" }

if ($missing.Count -gt 0) {
    Write-Host "`nMissing prerequisites:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "See SETUP.md for installation instructions.`n" -ForegroundColor Yellow
    exit 1
}

# --- Install dependencies ---
if (-not $SkipInstall) {
    $venvPath = Join-Path $ProjectRoot ".venv"
    $venvPython = Join-Path $venvPath "Scripts\\python.exe"

    Write-Host "`n[1/5] Creating uv virtualenv..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    Invoke-Uv venv --allow-existing
    if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
    Pop-Location

    Write-Host "[2/5] Installing Python dependencies..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    Invoke-Uv pip install --python "$venvPython" -r requirements.txt
    if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
    Pop-Location

    # --- Ensure CUDA torch (installed via pip, outside base deps) ---
    Write-Host "[3/5] Checking PyTorch CUDA build..." -ForegroundColor Yellow
    if (Test-Path $venvPython) {
        $cudaCheck = & $venvPython -c "import torch; print(torch.version.cuda or '')" 2>$null
        if (-not $cudaCheck) {
            Write-Host "  Installing PyTorch CUDA 12.4..." -ForegroundColor Yellow
            Invoke-Uv pip install --python "$venvPython" torch==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cu124
            if ($LASTEXITCODE -ne 0) { Write-Host "  Warning: CUDA torch install failed. Falling back to CPU." -ForegroundColor DarkYellow }
            else { Write-Host "  CUDA PyTorch installed." -ForegroundColor Green }
        } else {
            Write-Host "  CUDA $cudaCheck already available." -ForegroundColor Green
        }
    } else {
        Write-Host "  Warning: venv python not found at $venvPython" -ForegroundColor DarkYellow
    }

    # --- Auto-patch basicsr ---
    Write-Host "[4/5] Checking basicsr patch..." -ForegroundColor Yellow
    if (Test-Path $venvPath) {
        $degradationsFiles = Get-ChildItem -Path $venvPath -Recurse -Filter "degradations.py" -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -like "*basicsr*data*" }
        foreach ($file in $degradationsFiles) {
            $content = Get-Content $file.FullName -Raw
            if ($content -match "functional_tensor") {
                $patched = $content -replace "from torchvision\.transforms\.functional_tensor import rgb_to_grayscale", `
                    "from torchvision.transforms.functional import rgb_to_grayscale"
                Set-Content -Path $file.FullName -Value $patched -NoNewline
                Write-Host "  Patched: $($file.FullName)" -ForegroundColor Green
            } else {
                Write-Host "  Already patched." -ForegroundColor Green
            }
        }
    }

    Write-Host "[5/5] Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location "$ProjectRoot\frontend"
    npm install
    if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
    Pop-Location
} else {
    Write-Host "Skipping dependency installation." -ForegroundColor DarkGray
}

# --- Launch servers ---
Write-Host "`nStarting servers..." -ForegroundColor Cyan

$backendJob = $null
$frontendJob = $null

try {
    if (-not $FrontendOnly) {
        $backendJob = Start-Job -ScriptBlock {
            Set-Location $using:ProjectRoot
            $uvicorn = Join-Path $using:ProjectRoot ".venv\\Scripts\\uvicorn.exe"
            & $uvicorn api.main:app --reload --port 8000 2>&1
        }
        Write-Host "  Backend  -> http://localhost:8000" -ForegroundColor Green
    }

    if (-not $BackendOnly) {
        $frontendJob = Start-Job -ScriptBlock {
            Set-Location "$using:ProjectRoot\frontend"
            npm run dev 2>&1
        }
        Write-Host "  Frontend -> http://localhost:5173" -ForegroundColor Green
    }

    Write-Host "`nPress Ctrl+C to stop all servers.`n" -ForegroundColor Yellow

    # Stream output from both jobs
    while ($true) {
        $jobs = @($backendJob, $frontendJob) | Where-Object { $_ -ne $null }
        foreach ($job in $jobs) {
            $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
            if ($output) {
                $prefix = if ($job -eq $backendJob) { "[API]" } else { "[WEB]" }
                $color = if ($job -eq $backendJob) { "DarkCyan" } else { "DarkMagenta" }
                $output | ForEach-Object { Write-Host "$prefix $_" -ForegroundColor $color }
            }
        }
        Start-Sleep -Milliseconds 200
    }
} finally {
    Write-Host "`nShutting down..." -ForegroundColor Yellow
    if ($backendJob)  { Stop-Job $backendJob  -ErrorAction SilentlyContinue; Remove-Job $backendJob  -Force -ErrorAction SilentlyContinue }
    if ($frontendJob) { Stop-Job $frontendJob -ErrorAction SilentlyContinue; Remove-Job $frontendJob -Force -ErrorAction SilentlyContinue }
    Write-Host "Done." -ForegroundColor Green
}
