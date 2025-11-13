// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface ReqPayload {
  videoId: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.info('get-video-playback-url function started');

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get video ID from request
    const { videoId }: ReqPayload = await req.json();

    if (!videoId) {
      throw new Error('Video ID is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Fetch video details from database
    const { data: video, error } = await supabaseClient
      .from('videos')
      .select('id, title, duration, playback_url, bunny_video_id, thumbnail_url, description')
      .eq('id', videoId)
      .single();

    if (error) {
      throw error;
    }

    if (!video) {
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' },
          status: 404 
        }
      );
    }

    // Return video data with playback URL
    return new Response(
      JSON.stringify({
        success: true,
        video: {
          id: video.id,
          title: video.title,
          duration: video.duration,
          playbackUrl: video.playback_url,
          bunnyVideoId: video.bunny_video_id,
          thumbnailUrl: video.thumbnail_url,
          description: video.description,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' },
        status: 400 
      }
    );
  }
});
