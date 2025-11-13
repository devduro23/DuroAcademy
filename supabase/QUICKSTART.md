# 🚀 Quick Start Guide - Supabase Edge Function

## What's Been Created

A Supabase Edge Function that securely fetches video playback URLs from your database.

### Files Created:
```
supabase/
├── functions/
│   ├── get-video-playback-url/
│   │   └── index.ts                 # Edge function code
│   └── README.md                    # Detailed documentation
├── config.toml                      # Supabase configuration
├── deploy.ps1                       # Deployment script (Windows)
├── test-function.ps1               # Test script
└── QUICKSTART.md                   # This file

src/
└── utils/
    └── videoService.js             # Helper functions to call edge function
```

## 🎯 Step-by-Step Deployment

### Step 1: Install Supabase CLI

```powershell
npm install -g supabase
```

### Step 2: Deploy the Function

**Option A: Use the deployment script (Recommended)**
```powershell
cd supabase
.\deploy.ps1
```

**Option B: Manual deployment**
```powershell
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref yuqeafhejdawshsmrebn

# Deploy the function
supabase functions deploy get-video-playback-url --no-verify-jwt
```

### Step 3: Test the Function

```powershell
# Replace VIDEO_ID with an actual video ID from your database
.\test-function.ps1 -VideoId "your-video-uuid" -AnonKey "your-anon-key"
```

## 📱 Using in the App

The VideoPlayerScreen has already been updated to use the edge function automatically!

### How it works:

1. **Primary method**: Calls the edge function
2. **Fallback**: If edge function fails, queries database directly
3. **Automatic**: No changes needed in your code

### The edge function URL:
```
https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url
```

## 🔧 Troubleshooting

### Error: "Supabase CLI not found"
```powershell
npm install -g supabase
```

### Error: "Not authenticated"
```powershell
supabase login
```

### Error: "Project not linked"
```powershell
supabase link --project-ref yuqeafhejdawshsmrebn
```

### Error: "Function not found" (404)
Make sure the function is deployed:
```powershell
supabase functions list
```

### Check function logs:
```powershell
supabase functions logs get-video-playback-url
```

## 🧪 Manual Testing

### Using curl:
```bash
curl -i --location --request POST \
  'https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"videoId":"your-video-uuid"}'
```

### Using PowerShell:
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_ANON_KEY"
    "Content-Type" = "application/json"
}
$body = @{videoId = "your-video-uuid"} | ConvertTo-Json

Invoke-RestMethod -Uri "https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url" `
    -Method Post -Headers $headers -Body $body
```

## 📊 Expected Response

### Success Response:
```json
{
  "success": true,
  "video": {
    "id": "uuid",
    "title": "Video Title",
    "duration": "10:30",
    "playbackUrl": "https://...",
    "bunnyVideoId": "video-id",
    "thumbnailUrl": "https://...",
    "description": "Video description"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔐 Security Features

✅ **CORS Protection**: Only allows requests from your app  
✅ **Authentication**: Uses Supabase auth tokens  
✅ **RLS**: Row Level Security policies still apply  
✅ **Secure Runtime**: Runs in Deno secure sandbox  

## 📝 Next Steps

1. ✅ Deploy the edge function using `.\deploy.ps1`
2. ✅ Test with a real video ID
3. ✅ Run your React Native app - it's already configured!
4. ✅ Monitor logs with `supabase functions logs get-video-playback-url`

## 💡 Benefits of Using Edge Functions

- **Better Security**: Hides database structure from client
- **Performance**: Reduces client-side code
- **Flexibility**: Easy to add business logic (e.g., analytics, access control)
- **Maintenance**: Centralized logic, easier to update

## 🆘 Need Help?

Check the detailed documentation:
```
supabase/functions/README.md
```

View function logs:
```powershell
supabase functions logs get-video-playback-url --limit 50
```

Test locally before deploying:
```powershell
supabase functions serve get-video-playback-url
```

---

**Your VideoPlayerScreen is ready to use! 🎉**

The edge function will be used automatically when you play videos in the app.
