/**
 * Bunny Stream Service
 * Handles fetching video playback URLs from Bunny.net Stream API
 */

const BUNNY_LIBRARY_ID = '531853';
const BUNNY_API_KEY = 'YOUR_BUNNY_API_KEY'; // Get this from Bunny.net dashboard

/**
 * Fetch video information from Bunny Stream API
 * @param {string} videoId - The Bunny video GUID
 * @returns {Promise<Object>} Video information including playback URL
 */
export const getBunnyVideoInfo = async (videoId) => {
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Bunny API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      video: data,
      // Construct the playback URLs
      mp4Url: `https://vz-f88d1928-106.b-cdn.net/${videoId}/play_720p.mp4`,
      hlsUrl: `https://vz-f88d1928-106.b-cdn.net/${videoId}/playlist.m3u8`,
    };
  } catch (error) {
    console.error('Error fetching Bunny video info:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate a simple playback URL for Bunny Stream videos
 * This works when token authentication is disabled
 * @param {string} videoId - The Bunny video GUID
 * @param {string} quality - Video quality (e.g., '720p', '1080p', '480p')
 * @returns {string} Direct MP4 URL
 */
export const getBunnyDirectPlayUrl = (videoId, quality = '720p') => {
  return `https://vz-f88d1928-106.b-cdn.net/${videoId}/play_${quality}.mp4`;
};

/**
 * Get HLS playlist URL for Bunny Stream videos
 * @param {string} videoId - The Bunny video GUID
 * @returns {string} HLS playlist URL
 */
export const getBunnyHlsUrl = (videoId) => {
  return `https://vz-f88d1928-106.b-cdn.net/${videoId}/playlist.m3u8`;
};
