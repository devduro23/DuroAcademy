# 🎬 Video Playback Architecture

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Native App                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │          VideoPlayerScreen.jsx                         │    │
│  │                                                        │    │
│  │  User taps video → Receives lessonId                  │    │
│  └───────────────┬────────────────────────────────────────┘    │
│                  │                                              │
│                  ▼                                              │
│  ┌───────────────────────────────────────────────────────┐    │
│  │          videoService.js                               │    │
│  │                                                        │    │
│  │  getVideoPlaybackUrl(lessonId)                        │    │
│  │    ├─ Primary: Call Edge Function                     │    │
│  │    └─ Fallback: Direct Database Query                 │    │
│  └───────────────┬────────────────────────────────────────┘    │
│                  │                                              │
└──────────────────┼──────────────────────────────────────────────┘
                   │
                   │ HTTP POST Request
                   │ + Authorization Header
                   │ + Video ID
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Cloud                               │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │     Edge Function (Deno Runtime)                      │    │
│  │     get-video-playback-url                            │    │
│  │                                                        │    │
│  │  1. Receive request with videoId                      │    │
│  │  2. Validate authentication                           │    │
│  │  3. Query videos table                                │    │
│  │  4. Apply Row Level Security                          │    │
│  │  5. Return video data + playback URL                  │    │
│  └───────────────┬────────────────────────────────────────┘    │
│                  │                                              │
│                  ▼                                              │
│  ┌───────────────────────────────────────────────────────┐    │
│  │          PostgreSQL Database                           │    │
│  │                                                        │    │
│  │  videos table:                                         │    │
│  │  ├─ id (uuid)                                          │    │
│  │  ├─ title (text)                                       │    │
│  │  ├─ duration (text)                                    │    │
│  │  ├─ playback_url (text) ◄── Bunny Stream URL         │    │
│  │  ├─ bunny_video_id (text)                             │    │
│  │  ├─ thumbnail_url (text)                              │    │
│  │  └─ module_id (uuid)                                   │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                   │
                   │ Response with playback URL
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                React Native App                                 │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │          WebView Component                             │    │
│  │                                                        │    │
│  │  Bunny Stream Iframe:                                 │    │
│  │  https://iframe.mediadelivery.net/embed/...          │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────┐        │    │
│  │  │                                          │        │    │
│  │  │         🎬 Video Player                  │        │    │
│  │  │                                          │        │    │
│  │  │         [Play/Pause] [Skip] [Speed]     │        │    │
│  │  │                                          │        │    │
│  │  └──────────────────────────────────────────┘        │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                   │
                   │ Streams video from
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Bunny Stream CDN                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         Video Storage (Podcast Collection)             │    │
│  │                                                        │    │
│  │  - Global CDN distribution                            │    │
│  │  - Adaptive bitrate streaming                         │    │
│  │  - DRM protection (optional)                          │    │
│  │  - Analytics & monitoring                             │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Interaction
```
User taps on lesson card
    ↓
ModuleDetailsScreen navigates to VideoPlayerScreen
    ↓
Passes: { lessonId, lessonTitle, moduleId }
```

### 2. Video Data Fetch (Primary Path)
```
VideoPlayerScreen calls getVideoPlaybackUrl(lessonId)
    ↓
videoService.js makes POST request to edge function
    ↓
Edge function authenticates user
    ↓
Queries database for video data
    ↓
Returns: {success: true, video: {...}}
```

### 3. Video Data Fetch (Fallback Path)
```
If edge function fails
    ↓
videoService.js calls getVideoDirectly(lessonId)
    ↓
Direct Supabase client query
    ↓
Returns video data from database
```

### 4. Video Playback
```
VideoPlayerScreen receives video data
    ↓
Extracts playback_url
    ↓
Constructs Bunny Stream embed URL
    ↓
WebView loads iframe
    ↓
Video streams from Bunny CDN
    ↓
User watches video
```

## Request/Response Examples

### Edge Function Request
```http
POST /functions/v1/get-video-playback-url
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "videoId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### Edge Function Response
```json
{
  "success": true,
  "video": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Introduction to Plywood Manufacturing",
    "duration": "15:30",
    "playbackUrl": "https://iframe.mediadelivery.net/embed/12345/video-guid",
    "bunnyVideoId": "video-guid-123",
    "thumbnailUrl": "https://thumbnail-url.jpg",
    "description": "Learn the basics of plywood production"
  }
}
```

### Database Query (Fallback)
```sql
SELECT 
  id, 
  title, 
  duration, 
  playback_url, 
  bunny_video_id, 
  thumbnail_url, 
  description
FROM videos
WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
```

## Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: CORS Headers                  │
│  - Validates origin                     │
│  - Restricts cross-origin requests      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Layer 2: Authentication                │
│  - JWT token validation                 │
│  - User session verification            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Layer 3: Row Level Security (RLS)      │
│  - Database-level permissions           │
│  - User can only see authorized videos  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Layer 4: Edge Function Logic           │
│  - Additional business rules            │
│  - Access control checks                │
└─────────────────────────────────────────┘
```

## Performance Optimization

```
Request → Edge Function (CDN-distributed)
              ↓
          Database Query (Cached)
              ↓
          Response (<100ms typically)
              ↓
          WebView loads iframe
              ↓
          Bunny CDN (Global, < 50ms)
              ↓
          Video streaming begins
```

### Benefits:
- ✅ Edge functions run close to users (global CDN)
- ✅ Database queries are optimized and indexed
- ✅ Video streaming from nearest CDN node
- ✅ Adaptive bitrate for smooth playback

## Error Handling Flow

```
Try Edge Function
    │
    ├─ Success? → Play video
    │
    └─ Failed?
        │
        └─ Try Direct Database Query
            │
            ├─ Success? → Play video
            │
            └─ Failed? → Show error message
```

## Monitoring Points

```
1. Edge Function Logs
   └─ View with: supabase functions logs get-video-playback-url

2. Database Performance
   └─ Check query execution time
   └─ Monitor RLS policy impact

3. App-side Metrics
   └─ Video load time
   └─ Playback errors
   └─ Fallback usage rate

4. Bunny Stream Analytics
   └─ Total views
   └─ Bandwidth usage
   └─ Playback quality
```

## Future Enhancements

```
Current:
  User → Edge Function → Database → Video URL

Possible Additions:

1. Analytics
   User → Edge Function → Database → Video URL
                ↓
           Log view event

2. Access Control
   User → Edge Function → Check subscription → Database → Video URL

3. Caching
   User → Edge Function → Check cache → Database → Video URL
                              ↓
                          Store in cache

4. DRM/Encryption
   User → Edge Function → Generate token → Secure video URL
```

---

This architecture provides a secure, scalable, and performant solution for video playback in your Duro Academy app! 🚀
