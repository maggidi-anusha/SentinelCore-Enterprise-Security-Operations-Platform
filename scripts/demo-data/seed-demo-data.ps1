<#
.SYNOPSIS
    Seed (or reset) SentinelCore demo data in the LOCAL PostgreSQL database.

.DESCRIPTION
    Always connects to localhost:5432 / sentinelcore_db - the host is hard-coded
    so this can never touch AWS / RDS. Uses the same DB_USERNAME and DB_PASSWORD
    environment variables as the Spring Boot app.

    Seeding is idempotent: running it again does nothing if the demo data exists.

.EXAMPLE
    .\scripts\demo-data\seed-demo-data.ps1          # add demo data
    .\scripts\demo-data\seed-demo-data.ps1 -Reset   # remove demo data, then add it again with fresh dates
    .\scripts\demo-data\seed-demo-data.ps1 -Remove  # remove demo data only
#>
param(
    [switch]$Reset,
    [switch]$Remove
)

$ErrorActionPreference = "Stop"

$DbHost = "localhost"
$DbPort = 5432
$DbName = "sentinelcore_db"

$psql = (Get-Command psql -ErrorAction SilentlyContinue).Source
if (-not $psql) {
    $psql = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $psql) { throw "psql.exe not found. Install PostgreSQL client tools or add psql to PATH." }

if (-not $env:DB_USERNAME -or -not $env:DB_PASSWORD) {
    throw "Set DB_USERNAME and DB_PASSWORD (the same values the backend uses) before running."
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:PGPASSWORD = $env:DB_PASSWORD

function Invoke-Sql([string]$file) {
    Write-Host "`n> $([IO.Path]::GetFileName($file)) on $DbHost/$DbName" -ForegroundColor Cyan
    # psql prints NOTICEs on stderr; judge success by exit code, not stderr.
    $ErrorActionPreference = "Continue"
    & $psql -h $DbHost -p $DbPort -U $env:DB_USERNAME -d $DbName -v ON_ERROR_STOP=1 -q -f $file
    if ($LASTEXITCODE -ne 0) { throw "psql failed on $file (exit $LASTEXITCODE)" }
}

try {
    if ($Reset -or $Remove) { Invoke-Sql (Join-Path $scriptDir "demo-reset.sql") }
    if (-not $Remove)       { Invoke-Sql (Join-Path $scriptDir "demo-seed.sql") }

    Write-Host "`nCurrent row counts:" -ForegroundColor Cyan
    & $psql -h $DbHost -p $DbPort -U $env:DB_USERNAME -d $DbName -c @"
SELECT 'assets' AS table_name, count(*) FROM assets
UNION ALL SELECT 'alerts', count(*) FROM alerts
UNION ALL SELECT 'incidents', count(*) FROM incidents
UNION ALL SELECT 'vulnerabilities', count(*) FROM vulnerabilities
UNION ALL SELECT 'compliance_checks', count(*) FROM compliance_checks
UNION ALL SELECT 'audit_logs', count(*) FROM audit_logs;
"@
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
