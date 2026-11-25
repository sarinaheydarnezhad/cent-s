param([ValidateSet('Backend', 'Frontend')][string]$Service = 'Backend', [switch]$NoBuild)
$ErrorActionPreference = 'Stop'
$itatestRoot = Split-Path $PSScriptRoot -Parent
$settings = Join-Path $itatestRoot '.env.local'
if (!(Test-Path -LiteralPath $settings)) { throw 'Missing local .env.local; follow phase-5/LOCAL_ACCESS.md.' }
# Parse assignments as data, never execute a settings file as PowerShell.
foreach ($line in Get-Content -LiteralPath $settings) {
    if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
        [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
    }
}
if ($Service -eq 'Backend') {
    $preview = Join-Path (Split-Path $itatestRoot -Parent) 'Backend/backend/Cent.Preview'
    Set-Location $preview
    if ($NoBuild) { dotnet run --no-build --no-launch-profile --no-restore --project Cent.Preview.csproj }
    else { dotnet run --no-launch-profile --no-restore --project Cent.Preview.csproj }
} else {
    Set-Location $itatestRoot
    npm.cmd run dev -- --host 127.0.0.1 --strictPort
}
