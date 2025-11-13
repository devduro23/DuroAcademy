# Test Supabase Edge Function
# This script tests the get-video-playback-url edge function

param(
    [Parameter(Mandatory=$true)]
    [string]$VideoId,
    
    [Parameter(Mandatory=$false)]
    [string]$AnonKey = ""
)

Write-Host "🧪 Testing Edge Function..." -ForegroundColor Cyan
Write-Host ""

if ($AnonKey -eq "") {
    Write-Host "Please provide your Supabase Anon Key:" -ForegroundColor Yellow
    $AnonKey = Read-Host "Anon Key"
}

$url = "https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url"
$headers = @{
    "Authorization" = "Bearer $AnonKey"
    "Content-Type" = "application/json"
}
$body = @{
    videoId = $VideoId
} | ConvertTo-Json

Write-Host "Calling: $url" -ForegroundColor Yellow
Write-Host "Video ID: $VideoId" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ErrorAction Stop
    
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host ""
    
} catch {
    Write-Host "✗ Error!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}
