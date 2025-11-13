import { supabase } from '../supabase-client';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

/**
 * Fetch video playback URL and details using Supabase Edge Function
 * @param {string} videoId - The UUID of the video
 * @returns {Promise<Object>} Video data including playback URL
 */
export const getVideoPlaybackUrl = async (videoId) => {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    // Call edge function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-video-playback-url`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch video');
    }

    if (result.success) {
      return {
        success: true,
        video: result.video,
      };
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error in getVideoPlaybackUrl:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Direct database query alternative (fallback method)
 * Use this if edge function is not deployed yet
 * @param {string} videoId - The UUID of the video
 * @returns {Promise<Object>} Video data
 */
export const getVideoDirectly = async (videoId) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id, title, duration, playback_url, bunny_video_id, description')
      .eq('id', videoId)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      video: {
        id: data.id,
        title: data.title,
        duration: data.duration,
        playbackUrl: data.playback_url,
        bunnyVideoId: data.bunny_video_id,
        description: data.description,
      },
    };
  } catch (error) {
    console.error('Error in getVideoDirectly:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
