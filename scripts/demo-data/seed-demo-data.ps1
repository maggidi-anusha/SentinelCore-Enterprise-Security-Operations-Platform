<#
.SYNOPSIS
    Seed (or reset) SentinelCore demo data.

.DESCRIPTION
    Default target is the local database (localhost:5432 / sentinelcore_db) using
    the same DB_USERNAME and DB_PASSWORD as the Spring Boot app.

    -Target neon seeds the Neon database used by the Render deployment. It reads
    the Neon connection string from NEON_DATABASE_URL (asks for it if not set)
    and refuses any host that is not *.neon.tech.

    Seeding is idempotent: running it again does nothing if the demo data exists.

.EXAMPLE
    .\scripts\demo-data\seed-demo-data.ps1                # add demo data locally
    .\scripts\demo-data\seed-demo-data.ps1 -Reset         # remove demo data, then add it again with fresh dates
    .\scripts\demo-data\seed-demo-data.ps1 -Remove        # remove demo data only
    .\scripts\demo-data\seed-demo-data.ps1 -Target neon   # same, against Neon
#>
param(
    [switch]$Reset,
    [switch]$Remove,
    [ValidateSet("local", "neon")]
    [string]$Target = "local"
)

$ErrorActionPreference = "Stop"

$psql = (Get-Command psql -ErrorAction SilentlyContinue).Source
if (-not $psql) {
    $psql = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $psql) { throw "psql.exe not found. Install PostgreSQL client tools or add psql to PATH." }

if ($Target -eq "neon") {
    $url = $env:NEON_DATABASE_URL
    if (-not $url) { $url = Read-Host "Neon connection string (postgresql://...)" }

    if ($url -notmatch '^postgres(ql)?://[^@]+@([^/:?]+)') { throw "That does not look like a Neon connection string." }
    $dbHost = $Matches[2]
    if ($dbHost -notlike "*.neon.tech") { throw "Refusing to run against $dbHost - expected a *.neon.tech host." }

    $connArgs = @($url)
    $dbLabel = $dbHost
    # lets the SQL scripts accept a non-local server
    $setTarget = @("-c", "SET sentinelcore.seed_target = 'neon'")
}
else {
    if (-not $env:DB_USERNAME -or -not $env:DB_PASSWORD) {
        throw "Set DB_USERNAME and DB_PASSWORD (the same values the backend uses) before running."
    }
    $env:PGPASSWORD = $env:DB_PASSWORD

    $connArgs = @("-h", "localhost", "-p", "5432", "-U", $env:DB_USERNAME, "-d", "sentinelcore_db")
    $dbLabel = "localhost/sentinelcore_db"
    $setTarget = @()
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Invoke-Sql([string]$file) {
    Write-Host "`n> $([IO.Path]::GetFileName($file)) on $dbLabel" -ForegroundColor Cyan
    # psql prints NOTICEs on stderr; judge success by exit code, not stderr.
    $ErrorActionPreference = "Continue"
    & $psql @connArgs -v ON_ERROR_STOP=1 -q @setTarget -f $file
    if ($LASTEXITCODE -ne 0) { throw "psql failed on $file (exit $LASTEXITCODE)" }
}

try {
    if ($Reset -or $Remove) { Invoke-Sql (Join-Path $scriptDir "demo-reset.sql") }
    if (-not $Remove)       { Invoke-Sql (Join-Path $scriptDir "demo-seed.sql") }

    Write-Host "`nCurrent row counts:" -ForegroundColor Cyan
    & $psql @connArgs -c @"
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
