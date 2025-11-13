# Supabase Edge Function Setup Checker
# Verifies that everything is ready for deployment

Write-Host "Checking Supabase Edge Function Setup..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Supabase CLI
Write-Host "1. Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $version = supabase --version 2>&1
    Write-Host "   [OK] Installed: $version" -ForegroundColor Green
} catch {
    Write-Host "   [X] Not installed" -ForegroundColor Red
    Write-Host "   -> Install with: npm install -g supabase" -ForegroundColor White
    $allGood = $false
}
Write-Host ""

# Check 2: Function file exists
Write-Host "2. Checking edge function file..." -ForegroundColor Yellow
$functionPath = "functions\get-video-playback-url\index.ts"
if (Test-Path $functionPath) {
    Write-Host "   [OK] Found: $functionPath" -ForegroundColor Green
} else {
    Write-Host "   [X] Not found: $functionPath" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Check 3: Config file exists
Write-Host "3. Checking config file..." -ForegroundColor Yellow
$configPath = "config.toml"
if (Test-Path $configPath) {
    Write-Host "   [OK] Found: $configPath" -ForegroundColor Green
} else {
    Write-Host "   [!] Not found: $configPath (optional)" -ForegroundColor Yellow
}
Write-Host ""

# Check 4: Video service helper
Write-Host "4. Checking video service helper..." -ForegroundColor Yellow
$servicePath = "..\src\utils\videoService.js"
if (Test-Path $servicePath) {
    Write-Host "   [OK] Found: $servicePath" -ForegroundColor Green
} else {
    Write-Host "   [X] Not found: $servicePath" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Check 5: Environment variables
Write-Host "5. Checking environment setup..." -ForegroundColor Yellow
$envPath = "..\.env"
if (Test-Path $envPath) {
    Write-Host "   [OK] Found: .env file" -ForegroundColor Green
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "SUPABASE_URL") {
        Write-Host "   [OK] SUPABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "   [X] SUPABASE_URL not found in .env" -ForegroundColor Red
        $allGood = $false
    }
    if ($envContent -match "SUPABASE_ANON_KEY") {
        Write-Host "   [OK] SUPABASE_ANON_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "   [X] SUPABASE_ANON_KEY not found in .env" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   [X] .env file not found" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Summary
Write-Host "===============================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "[OK] All checks passed! Ready to deploy" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\deploy.ps1" -ForegroundColor White
    Write-Host "  2. Test the function with .\test-function.ps1" -ForegroundColor White
    Write-Host "  3. Use in your React Native app (already configured!)" -ForegroundColor White
} else {
    Write-Host "[X] Some issues found. Please fix them before deploying." -ForegroundColor Red
    Write-Host ""
    Write-Host "See QUICKSTART.md for detailed setup instructions." -ForegroundColor Yellow
}
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
