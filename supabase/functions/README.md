# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Duro Academy app.

## Functions

### get-video-playback-url

Fetches video playback URL and details from the database securely.

**Endpoint:** `https://yuqeafhejdawshsmrebn.supabase.co/functions/v1/get-video-playback-url`

**Request:**
```json
{
  "videoId": "uuid-of-video"
}
```

**Response:**
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

## Setup & Deployment

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref yuqeafhejdawshsmrebn
```

### Deploy Function

Deploy the edge function to Supabase:

```bash
supabase functions deploy get-video-playback-url
```

Or deploy all functions:

```bash
supabase functions deploy
```

### Test Locally

Start the local development server:

```bash
supabase functions serve get-video-playback-url
```

Test with curl:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/get-video-playback-url' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"videoId":"your-video-id"}'
```

### Environment Variables

Edge functions automatically have access to:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)

## Usage in React Native App

Update your VideoPlayerScreen to use the edge function:

```javascript
const fetchVideo = async () => {
  try {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-video-playback-url`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: lessonId }),
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      setVideo(result.video);
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Error fetching video:', error);
  } finally {
    setLoading(false);
  }
};
```

## Security

- Edge functions run in a secure Deno runtime
- CORS headers are configured to allow requests from your app
- User authentication is passed through the Authorization header
- Row Level Security (RLS) policies on the videos table still apply

## Troubleshooting

### Function not found
Make sure the function is deployed:
```bash
supabase functions list
```

### CORS errors
Ensure the CORS headers match your app's domain

### Authentication errors
Check that you're passing the Authorization header correctly

### View logs
```bash
supabase functions logs get-video-playback-url
```
