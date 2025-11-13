# Supabase Edge Function Deployment Script
# This script deploys the get-video-playback-url edge function to Supabase

Write-Host "Deploying Supabase Edge Function..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI installation..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "[OK] Supabase CLI is installed: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "[X] Supabase CLI is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Supabase CLI:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Check if user is logged in
Write-Host "Checking Supabase authentication..." -ForegroundColor Yellow
$loginCheck = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Not logged in to Supabase" -ForegroundColor Red
    Write-Host ""
    Write-Host "Logging in to Supabase..." -ForegroundColor Yellow
    supabase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Login failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] Authenticated with Supabase" -ForegroundColor Green
Write-Host ""

# Link project if not already linked
Write-Host "Linking to Supabase project..." -ForegroundColor Yellow
$linkResult = supabase link --project-ref yuqeafhejdawshsmrebn 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Project linked successfully" -ForegroundColor Green
} else {
    Write-Host "[!] Project may already be linked" -ForegroundColor Yellow
}
Write-Host ""

# Deploy the edge function
Write-Host "Deploying get-video-playback-url function..." -ForegroundColor Yellow
Write-Host ""

$deployResult = supabase functions deploy get-video-playback-url --no-verify-jwt

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Edge function deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Function URL:" -ForegroundColor Cyan
    Write-Host "  https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url" -ForegroundColor White
    Write-Host ""
    Write-Host "Test with curl:" -ForegroundColor Cyan
    Write-Host '  curl -i --location --request POST "https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url" \' -ForegroundColor White
    Write-Host '    --header "Authorization: Bearer YOUR_ANON_KEY" \' -ForegroundColor White
    Write-Host '    --header "Content-Type: application/json" \' -ForegroundColor White
    Write-Host '    --data "{\"videoId\":\"your-video-id\"}"' -ForegroundColor White
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Cyan
    Write-Host "  supabase functions logs get-video-playback-url" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[X] Deployment failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check if you have the correct project permissions" -ForegroundColor White
    Write-Host "  2. Verify your project reference ID is correct" -ForegroundColor White
    Write-Host "  3. Check the function code for syntax errors" -ForegroundColor White
    Write-Host ""
    exit 1
}
