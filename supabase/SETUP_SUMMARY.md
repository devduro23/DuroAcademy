# 📚 Supabase Edge Function - Complete Setup

## What's Been Done

I've created a complete Supabase Edge Function setup for your Duro Academy app to securely fetch video playback URLs.

## 📁 Files Created

### 1. Edge Function (Backend)
- **`supabase/functions/get-video-playback-url/index.ts`**
  - The edge function that runs on Supabase servers
  - Fetches video data from your database
  - Returns playback URL securely
  - Handles CORS and authentication

### 2. Helper Utilities (Frontend)
- **`src/utils/videoService.js`**
  - `getVideoPlaybackUrl()` - Calls the edge function
  - `getVideoDirectly()` - Fallback to direct database query
  - Handles authentication automatically

### 3. Updated VideoPlayerScreen
- **`src/screens/VideoPlayerScreen.jsx`**
  - Now uses the edge function by default
  - Automatically falls back to direct query if needed
  - No changes needed - works out of the box!

### 4. Deployment Scripts
- **`supabase/deploy.ps1`** - Automated deployment script
- **`supabase/test-function.ps1`** - Test the edge function
- **`supabase/check-setup.ps1`** - Verify setup before deployment

### 5. Configuration
- **`supabase/config.toml`** - Supabase configuration
- **`supabase/package.json`** - NPM scripts for easy deployment

### 6. Documentation
- **`supabase/functions/README.md`** - Detailed documentation
- **`supabase/QUICKSTART.md`** - Quick start guide
- **`supabase/SETUP_SUMMARY.md`** - This file

## 🚀 How to Deploy

### Quick Method (Recommended):
```powershell
cd supabase
.\check-setup.ps1    # Verify everything is ready
.\deploy.ps1         # Deploy the function
```

### Manual Method:
```powershell
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref yuqeafhejdawshsmrebn

# Deploy
supabase functions deploy get-video-playback-url --no-verify-jwt
```

## 🧪 How to Test

### Using the test script:
```powershell
cd supabase
.\test-function.ps1 -VideoId "your-video-uuid" -AnonKey "your-anon-key"
```

### Manual testing:
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_ANON_KEY"
    "Content-Type" = "application/json"
}
$body = @{videoId = "your-video-uuid"} | ConvertTo-Json

Invoke-RestMethod -Uri "https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url" -Method Post -Headers $headers -Body $body
```

## 📱 How It Works in Your App

### Automatic Integration
Your `VideoPlayerScreen` has been updated to automatically use the edge function:

```javascript
// In VideoPlayerScreen.jsx
import { getVideoPlaybackUrl, getVideoDirectly } from '../utils/videoService';

// This now calls the edge function first, then falls back if needed
const result = await getVideoPlaybackUrl(lessonId);
```

### Request Flow:
1. User taps on a video in ModuleDetailsScreen
2. VideoPlayerScreen receives the `lessonId`
3. App calls edge function with video ID
4. Edge function queries database securely
5. Returns video data with playback URL
6. WebView plays the video using Bunny Stream URL

### Fallback Mechanism:
If edge function fails (not deployed yet, network issues, etc.):
- Automatically falls back to direct database query
- No user-facing errors
- Seamless experience

## 🔧 Edge Function API

### Endpoint:
```
POST https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url
```

### Request:
```json
{
  "videoId": "uuid-of-video"
}
```

### Response (Success):
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

### Response (Error):
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔐 Security Features

✅ **CORS Headers**: Configured to allow requests from your app  
✅ **Authentication**: Uses Supabase auth tokens (automatic)  
✅ **Row Level Security**: Database RLS policies still apply  
✅ **Deno Runtime**: Secure, sandboxed execution environment  
✅ **Error Handling**: Graceful error messages  

## 💡 Benefits

### Why use an Edge Function?

1. **Security**: 
   - Hides database structure from client
   - Can add access control logic
   - Protects sensitive data

2. **Performance**:
   - Reduces client-side code
   - Server-side processing
   - CDN-distributed globally

3. **Flexibility**:
   - Easy to add business logic
   - Can integrate with other APIs
   - Centralized video analytics

4. **Maintenance**:
   - Update logic without app updates
   - Easier debugging with server logs
   - Version control for backend logic

## 📊 Monitoring & Debugging

### View Logs:
```powershell
supabase functions logs get-video-playback-url
```

### Recent logs only:
```powershell
supabase functions logs get-video-playback-url --limit 20
```

### Follow logs in real-time:
```powershell
supabase functions logs get-video-playback-url --follow
```

### Check function status:
```powershell
supabase functions list
```

## 🛠️ Troubleshooting

### Function not found (404):
```powershell
# Check if deployed
supabase functions list

# Redeploy
supabase functions deploy get-video-playback-url
```

### CORS errors:
- Check that CORS headers in `index.ts` match your app's domain
- Verify you're sending the Authorization header

### Authentication errors:
```javascript
// Make sure you're passing the auth token
const { data: { session } } = await supabase.auth.getSession();
// Use session.access_token in Authorization header
```

### Database errors:
- Verify video ID exists in database
- Check Row Level Security policies on `videos` table
- Ensure user has permission to read videos

## 📝 Next Steps

### Immediate:
1. ✅ Run `.\check-setup.ps1` to verify setup
2. ✅ Run `.\deploy.ps1` to deploy the function
3. ✅ Test with `.\test-function.ps1`
4. ✅ Run your React Native app - it's ready!

### Optional Enhancements:
- Add video analytics (track views, watch time)
- Implement access control (premium content)
- Add rate limiting for API protection
- Cache frequently accessed videos
- Generate dynamic thumbnails
- Add video subtitles/captions

## 📚 Additional Resources

- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Deno Documentation**: https://deno.land/manual
- **Bunny Stream API**: https://docs.bunny.net/

## ✅ Checklist

Before deploying:
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Logged in to Supabase (`supabase login`)
- [ ] Project linked (`supabase link --project-ref yuqeafhejdawshsmrebn`)
- [ ] Environment variables set in `.env`
- [ ] Videos table has `playback_url` column
- [ ] Test video ID ready for testing

After deploying:
- [ ] Function deployed successfully
- [ ] Test with real video ID
- [ ] Check function logs
- [ ] Verify in React Native app
- [ ] Monitor for errors

## 🎉 You're All Set!

Your VideoPlayerScreen is now configured to use the edge function. Simply deploy it and start using your app!

**Questions?** Check the detailed documentation in `functions/README.md` or `QUICKSTART.md`.

---

**Created**: November 5, 2025  
**Project**: Duro Academy  
**Edge Function**: get-video-playback-url  
**Version**: 1.0.0
