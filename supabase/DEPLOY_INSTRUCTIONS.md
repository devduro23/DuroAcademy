# Edge Function Deployment - Step by Step

## Prerequisites

You need a Supabase Access Token to deploy edge functions.

## Step 1: Get Your Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Give it a name (e.g., "CLI Deployment")
4. Copy the token (it will look like: `sbp_xxx...`)

## Step 2: Set Environment Variable

In PowerShell, run:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "your-token-here"
```

Or add it to your `.env` file:
```
SUPABASE_ACCESS_TOKEN=your-token-here
```

## Step 3: Deploy the Function

```powershell
cd D:\Learning\Duro-Academy\DuroAcademy\supabase
npx supabase functions deploy get-video-playback-url --project-ref yuqeafhejdawshsmrebn
```

## Alternative: Deploy via Supabase Dashboard

If CLI doesn't work, you can deploy directly through the dashboard:

### Option A: Using Dashboard UI

1. Go to: https://supabase.com/dashboard/project/yuqeafhejdawshsmrebn/functions
2. Click "Create a new function"
3. Name it: `get-video-playback-url`
4. Copy the code from: `functions/get-video-playback-url/index.ts`
5. Paste it in the editor
6. Click "Deploy"

### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to: https://supabase.com/dashboard/project/yuqeafhejdawshsmrebn/functions
3. Connect GitHub repository
4. Enable auto-deployment from `main` branch
5. Push changes trigger automatic deployment

## Quick Deploy Command (After Token Setup)

```powershell
# Set token once
$env:SUPABASE_ACCESS_TOKEN = "sbp_your_token_here"

# Deploy
cd D:\Learning\Duro-Academy\DuroAcademy\supabase
npx supabase functions deploy get-video-playback-url --project-ref yuqeafhejdawshsmrebn
```

## Verify Deployment

After deployment, test the function:

```powershell
# Get a video ID from your database first
$videoId = "your-video-uuid"
$anonKey = "your-anon-key"

# Test the function
$headers = @{
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
}
$body = @{videoId = $videoId} | ConvertTo-Json

Invoke-RestMethod -Uri "https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url" -Method Post -Headers $headers -Body $body
```

## Troubleshooting

### Error: "Access token not provided"
- Make sure you've set `SUPABASE_ACCESS_TOKEN` environment variable
- Get token from: https://supabase.com/dashboard/account/tokens

### Error: "Failed to scan line"
- This is a known issue with interactive login
- Use the token method instead

### Error: "Function not found" after deployment
- Wait 30 seconds for propagation
- Check dashboard: https://supabase.com/dashboard/project/yuqeafhejdawshsmrebn/functions

### Still having issues?
Deploy via dashboard instead (see Option A above)

## Your Function Details

- **Project Ref**: yuqeafhejdawshsmrebn
- **Function Name**: get-video-playback-url
- **Function Path**: `functions/get-video-playback-url/index.ts`
- **Function URL**: `https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url`

## What Happens After Deployment?

✅ Your VideoPlayerScreen will automatically use the edge function
✅ If edge function is unavailable, it falls back to direct database query
✅ No app changes needed - it's already configured!

## Need the Function Code?

The complete function code is in:
```
D:\Learning\Duro-Academy\DuroAcademy\supabase\functions\get-video-playback-url\index.ts
```

You can copy/paste this directly into the Supabase dashboard if needed.
