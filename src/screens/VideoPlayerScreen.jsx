import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
// Optional Android navigation bar control for fullscreen experience
let SystemNavigationBar; // dynamic import to avoid issues on iOS or if lib missing
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SystemNavigationBar = require('react-native-system-navigation-bar').default;
} catch (_) {
  SystemNavigationBar = null;
}
import { getVideoPlaybackUrl, getVideoDirectly } from '../utils/videoService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const VideoPlayerScreen = ({ route, navigation }) => {
  const { lessonId, lessonTitle, moduleId } = route.params || {};
  const { user } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [moduleVideos, setModuleVideos] = useState([]);
  const [prevVideo, setPrevVideo] = useState(null);
  const [nextVideo, setNextVideo] = useState(null);
  const videoRef = useRef(null);
  const lastUpdateTime = useRef(0);

  // Lock to portrait on mount, allow rotation on fullscreen
  useEffect(() => {
    Orientation.lockToPortrait();
    
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  // Handle Android back button in fullscreen mode
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullscreen) {
        // If native fullscreen is active, dismiss it via the player API
        try {
          videoRef.current?.dismissFullscreenPlayer?.();
        } catch (_) {}
        // Also ensure we exit our manual fullscreen container
        try { Orientation.lockToPortrait(); } catch (_) {}
        setIsFullscreen(false);
        return true; // Prevent default back action
      }
      // Not in fullscreen: prefer navigating back if possible, else exit app to avoid GO_BACK warning
      if (navigation?.canGoBack?.()) {
        navigation.goBack();
        return true;
      }
      const parent = navigation?.getParent?.();
      if (parent?.canGoBack?.()) {
        parent.goBack();
        return true;
      }
      // At root – exit the app on Android
      BackHandler.exitApp();
      return true;
    });

    return () => backHandler.remove();
  }, [isFullscreen]);

  // Sync fullscreen UI with device orientation to ensure true edge-to-edge on Android
  useEffect(() => {
    const onDeviceOrientation = (orientation) => {
      const isLand = orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT';
      setIsFullscreen(isLand);
    };
    try {
      Orientation.addDeviceOrientationListener(onDeviceOrientation);
    } catch (_) {}
    return () => {
      try { Orientation.removeDeviceOrientationListener(onDeviceOrientation); } catch (_) {}
    };
  }, []);

  // Effect: when fullscreen state changes, manage system UI consistently
  useEffect(() => {
    if (isFullscreen) {
      try { StatusBar.setHidden(true, 'fade'); } catch (_) {}
      try {
        if (SystemNavigationBar?.setNavigationBarVisibility) {
          SystemNavigationBar.setNavigationBarVisibility(false);
        }
        if (SystemNavigationBar?.setNavigationBarColor) {
          SystemNavigationBar.setNavigationBarColor('#000000', true);
        }
      } catch (_) {}
    } else {
      try { StatusBar.setHidden(false, 'fade'); } catch (_) {}
      try {
        if (SystemNavigationBar?.setNavigationBarVisibility) {
          SystemNavigationBar.setNavigationBarVisibility(true);
        }
        if (SystemNavigationBar?.setNavigationBarColor) {
          SystemNavigationBar.setNavigationBarColor('#FFFFFF', false);
        }
      } catch (_) {}
    }
  }, [isFullscreen]);

  // Hide Tab Bar when in fullscreen (React Navigation parent TabNavigator)
  useEffect(() => {
    const parent = navigation?.getParent?.();
    if (!parent) return;

    if (isFullscreen) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      // Restore default by unsetting style so theme/options apply
      parent.setOptions({ tabBarStyle: undefined });
    }

    return () => {
      try {
        parent.setOptions({ tabBarStyle: undefined });
      } catch (_) {}
    };
  }, [isFullscreen, navigation]);

  // Fetch video details using Edge Function
  const fetchVideo = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to use edge function first
      const result = await getVideoPlaybackUrl(lessonId);
      
      if (result.success && result.video) {
        // Map response to expected format
        setVideo({
          id: result.video.id,
          title: result.video.title,
          duration: result.video.duration,
          playback_url: result.video.playbackUrl,
          bunny_video_id: result.video.bunnyVideoId,
          thumbnail_url: result.video.thumbnailUrl,
          description: result.video.description,
        });
      } else {
        console.error('Error fetching video from edge function:', result.error);
        
        // Fallback to direct database query
        console.log('Falling back to direct database query...');
        const fallbackResult = await getVideoDirectly(lessonId);
        
        if (fallbackResult.success && fallbackResult.video) {
          setVideo({
            id: fallbackResult.video.id,
            title: fallbackResult.video.title,
            duration: fallbackResult.video.duration,
            playback_url: fallbackResult.video.playbackUrl,
            bunny_video_id: fallbackResult.video.bunnyVideoId,
            thumbnail_url: fallbackResult.video.thumbnailUrl,
            description: fallbackResult.video.description,
          });
        } else {
          console.error('Fallback also failed:', fallbackResult.error);
        }
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) {
      fetchVideo();
      fetchUserProgress(); // Fetch progress to resume video
      updateModuleAccess(); // Update last_accessed time
      fetchQuiz(); // Fetch quiz associated with this video
    }
  }, [fetchVideo, lessonId]);

  // Fetch ordered videos for this module to compute previous/next
  const fetchModuleVideos = useCallback(async () => {
    try {
      if (!moduleId) return;
      const { data: vids, error } = await supabase
        .from('videos')
        .select('id,title,video_order')
        .eq('module_id', moduleId)
        .order('video_order', { ascending: true });
      if (error) {
        console.error('Error fetching module videos:', error);
        setModuleVideos([]);
        setPrevVideo(null);
        setNextVideo(null);
        return;
      }
      setModuleVideos(vids || []);
      // Determine current index and neighbors
      const idx = (vids || []).findIndex(v => v.id === lessonId);
      setPrevVideo(idx > 0 ? vids[idx - 1] : null);
      setNextVideo(idx >= 0 && idx < (vids || []).length - 1 ? vids[idx + 1] : null);
    } catch (e) {
      console.error('Error in fetchModuleVideos:', e);
    }
  }, [moduleId, lessonId]);

  useEffect(() => {
    fetchModuleVideos();
  }, [fetchModuleVideos]);

  const handleGoToVideo = (target) => {
    if (!target?.id) return;
    // Reset some local state so UI updates immediately
    setIsCompleted(false);
    setPaused(false);
    setCurrentTime(0);
    // Replace to avoid stacking lots of VideoPlayer screens
    navigation.replace('VideoPlayer', {
      lessonId: target.id,
      lessonTitle: target.title,
      moduleId: moduleId,
    });
  };

  // Fetch quiz/assessment associated with this video
  const fetchQuiz = useCallback(async () => {
    try {
      const { data: quizData, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('video_id', lessonId)
        .single();

      if (error) {
        console.log('No quiz found for this video');
        setQuiz(null);
      } else {
        setQuiz(quizData);
        console.log('Quiz found:', quizData);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setQuiz(null);
    }
  }, [lessonId]);

  // Update module's last_accessed timestamp when video is opened
  const updateModuleAccess = async () => {
    try {
      if (!user?.id || !moduleId) return;

      // Get current module progress or initialize
      const { data: existingProgress } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      if (existingProgress) {
        // Update last_accessed
        await supabase
          .from('user_module_progress')
          .update({ last_accessed: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('module_id', moduleId);
      } else {
        // Initialize module progress if it doesn't exist
        const { count: totalVideos } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', moduleId);

        await supabase
          .from('user_module_progress')
          .insert({
            user_id: user.id,
            module_id: moduleId,
            videos_completed: 0,
            total_videos: totalVideos || 0,
            progress_percent: 0,
            last_accessed: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error updating module access:', error);
    }
  };

  // Fetch user's progress for this video
  const fetchUserProgress = async () => {
    try {
      if (!user?.id || !lessonId) return;

      const { data, error } = await supabase
        .from('user_video_progress')
        .select('watched_duration, completed')
        .eq('user_id', user.id)
        .eq('video_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user progress:', error);
        return;
      }

      if (data) {
        setIsCompleted(data.completed);
        // Resume from last position if video was watched before
        if (data.watched_duration > 0 && videoRef.current) {
          setTimeout(() => {
            videoRef.current?.seek(data.watched_duration);
          }, 500); // Small delay to ensure video is loaded
        }
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  // Get Bunny Stream video URL for react-native-video
  const getVideoUrl = () => {
    if (!video) return null;
    
    // If playback_url is already a direct video URL (MP4, HLS, etc.), use it directly
    if (video.playback_url) {
      const url = video.playback_url.toLowerCase();
      // Check if it's a direct video URL
      if (url.includes('.mp4') || url.includes('.m3u8') || url.includes('.mpd') || 
          url.includes('b-cdn.net') || url.includes('stream')) {
        console.log('Using direct playback URL:', video.playback_url);
        return video.playback_url;
      }
    }
    
    // Fallback: Try to construct URL from bunny_video_id if available
    const VIDEO_LIBRARY_ID = '531853';
    const BUNNY_CDN_HOSTNAME = 'vz-f88d1928-106.b-cdn.net';
    
    let videoId = video.bunny_video_id;
    if (!videoId && video.playback_url) {
      const iframeMatch = video.playback_url.match(/\/([a-f0-9-]{36})/i);
      if (iframeMatch) {
        videoId = iframeMatch[1];
      }
    }
    
    if (videoId) {
      const hlsUrl = `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
      console.log('Using constructed HLS URL:', hlsUrl);
      return hlsUrl;
    }
    
    console.log('No valid video URL found');
    return null;
  };

  // Navigate to assessment/quiz screen
  const handleTakeAssessment = () => {
    if (quiz?.id) {
      navigation.navigate('Assessment', { assessmentId: quiz.id });
    }
  };

  const handleMarkComplete = async () => {
    try {
      if (!user?.id || !lessonId) {
        console.log('Cannot mark complete: missing user or lessonId');
        return;
      }

      setIsCompleted(true);

      // Check if record exists
      const { data: existing } = await supabase
        .from('user_video_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('video_id', lessonId)
        .single();

      let error;
      if (existing) {
        // Update existing
        const result = await supabase
          .from('user_video_progress')
          .update({
            watched_duration: Math.floor(duration),
            completed: true,
            last_watched_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('video_id', lessonId);
        error = result.error;
      } else {
        // Insert new
        const result = await supabase
          .from('user_video_progress')
          .insert({
            user_id: user.id,
            video_id: lessonId,
            watched_duration: Math.floor(duration),
            completed: true,
            last_watched_at: new Date().toISOString(),
          });
        error = result.error;
      }

      if (error) {
        console.error('Error marking video as complete:', error);
      } else {
        console.log('Video marked as complete successfully');
        
        // Update module progress as well
        if (moduleId) {
          await updateModuleProgress();
        }
      }
    } catch (error) {
      console.error('Error in handleMarkComplete:', error);
    }
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const onProgress = async (data) => {
    setCurrentTime(data.currentTime);

    // Track progress in database every 10 seconds
    const currentSecond = Math.floor(data.currentTime);
    if (currentSecond - lastUpdateTime.current >= 10) {
      lastUpdateTime.current = currentSecond;
      await updateVideoProgress(data.currentTime, data.playableDuration || duration);
    }
  };

  // Update video progress in database
  const updateVideoProgress = async (currentTime, totalDuration) => {
    try {
      if (!user?.id || !lessonId) return;

  const watchedDuration = Math.floor(currentTime);
  const shouldComplete = totalDuration > 0 ? currentTime >= totalDuration * 0.9 : false; // 90% watched = completed

      // First, check if record exists
      const { data: existing } = await supabase
        .from('user_video_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('video_id', lessonId)
        .single();

      let error;
      if (existing) {
        // Update existing record
        const result = await supabase
          .from('user_video_progress')
          .update({
            watched_duration: watchedDuration,
            completed: shouldComplete,
            last_watched_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('video_id', lessonId);
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('user_video_progress')
          .insert({
            user_id: user.id,
            video_id: lessonId,
            watched_duration: watchedDuration,
            completed: shouldComplete,
            last_watched_at: new Date().toISOString(),
          });
        error = result.error;
      }

      if (error) {
        console.error('Error updating video progress:', error);
      } else {
        // Update local completed state and module progress if newly completed
        if (shouldComplete && !isCompleted) {
          setIsCompleted(true);
        }
        if (shouldComplete && moduleId) {
          await updateModuleProgress();
        }
      }
    } catch (error) {
      console.error('Error in updateVideoProgress:', error);
    }
  };

  // Update module progress based on completed videos
  const updateModuleProgress = async () => {
    try {
      if (!user?.id || !moduleId) return;

      // Get total videos in this module
      const { count: totalVideos } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', moduleId);

      // Get completed videos in this module by this user
      const { data: moduleVideos } = await supabase
        .from('videos')
        .select('id')
        .eq('module_id', moduleId);

      const videoIds = moduleVideos?.map(v => v.id) || [];

      const { count: completedVideos } = await supabase
        .from('user_video_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('video_id', videoIds)
        .eq('completed', true);

      // Calculate progress percentage
      const progressPercent = totalVideos > 0 
        ? Math.round((completedVideos / totalVideos) * 100) 
        : 0;

      // Update module progress - check if exists first
      const { data: existingModule } = await supabase
        .from('user_module_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      let error;
      if (existingModule) {
        // Update existing record
        const result = await supabase
          .from('user_module_progress')
          .update({
            videos_completed: completedVideos || 0,
            total_videos: totalVideos || 0,
            progress_percent: progressPercent,
            last_accessed: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('module_id', moduleId);
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('user_module_progress')
          .insert({
            user_id: user.id,
            module_id: moduleId,
            videos_completed: completedVideos || 0,
            total_videos: totalVideos || 0,
            progress_percent: progressPercent,
            last_accessed: new Date().toISOString(),
          });
        error = result.error;
      }

      if (error) {
        console.error('Error updating module progress:', error);
      } else {
        console.log('Module progress updated:', {
          module_id: moduleId,
          videos_completed: completedVideos,
          total_videos: totalVideos,
          progress_percent: progressPercent,
        });
      }
    } catch (error) {
      console.error('Error in updateModuleProgress:', error);
    }
  };

  // Handle video end
  const handleVideoEnd = async () => {
    setIsCompleted(true);
    
    // Save completion to database
    if (user?.id && lessonId) {
      // Check if progress record exists first
      const { data: existingProgress } = await supabase
        .from('user_video_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('video_id', lessonId)
        .single();

      if (existingProgress) {
        // Update existing record
        await supabase
          .from('user_video_progress')
          .update({
            watched_duration: Math.floor(duration),
            completed: true,
            last_watched_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('video_id', lessonId);
      } else {
        // Insert new record
        await supabase
          .from('user_video_progress')
          .insert({
            user_id: user.id,
            video_id: lessonId,
            watched_duration: Math.floor(duration),
            completed: true,
            last_watched_at: new Date().toISOString(),
          });
      }
      
      // Update module progress as well
      if (moduleId) {
        await updateModuleProgress();
      }
    }
  };

  const onLoad = (data) => {
    setDuration(data.duration);
    console.log('Video loaded, duration:', data.duration);
  };

  const onError = (error) => {
    const videoUrl = getVideoUrl();
    console.error('Video Error:', error);
    console.error('Attempted URL:', videoUrl);
    console.error('Video data:', video);
    alert(`Video playback error.\n\nPlease check:\n1. Bunny Stream "Enable Direct Play" is ON\n2. Token authentication is OFF\n3. URL: ${videoUrl}`);
  };

  // Using native fullscreen events instead of custom toggle

  const onFullscreenPlayerWillPresent = () => {
    // Enter native fullscreen (triggered by player controls)
    setIsFullscreen(true);
    Orientation.unlockAllOrientations();
    Orientation.lockToLandscape();
    StatusBar.setHidden(true, 'fade');
    // Hide Android navigation bar if available
    try {
      if (SystemNavigationBar?.setNavigationBarVisibility) {
        SystemNavigationBar.setNavigationBarVisibility(false);
      }
      if (SystemNavigationBar?.setNavigationBarColor) {
        SystemNavigationBar.setNavigationBarColor('#000000', true);
      }
    } catch (_) {}
  };

  const onFullscreenPlayerWillDismiss = () => {
    // Exit native fullscreen
    setIsFullscreen(false);
    Orientation.lockToPortrait();
    StatusBar.setHidden(false, 'fade');
    // Restore Android navigation bar if available
    try {
      if (SystemNavigationBar?.setNavigationBarVisibility) {
        SystemNavigationBar.setNavigationBarVisibility(true);
      }
    } catch (_) {}
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Video Not Found</Text>
          <Text style={styles.errorSubtitle}>Unable to load video content</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const videoUrl = getVideoUrl();

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isFullscreen ? "light-content" : "dark-content"} 
        backgroundColor={isFullscreen ? "#000000" : "#FFFFFF"}
        hidden={isFullscreen}
      />
      
      {/* Video Header - Hide in fullscreen */}
      {!isFullscreen && (
        <SafeAreaView style={styles.headerContainer}>
          <View style={styles.videoHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                // If in fullscreen, dismiss the player's fullscreen
                if (isFullscreen) {
                  try { videoRef.current?.dismissFullscreenPlayer?.(); } catch (_) {}
                  return;
                }
                if (navigation?.canGoBack?.()) {
                  navigation.goBack();
                  return;
                }
                const parent = navigation?.getParent?.();
                if (parent?.canGoBack?.()) {
                  parent.goBack();
                  return;
                }
                // Nothing to go back to: exit to avoid GO_BACK console warning
                BackHandler.exitApp();
              }}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.videoTitle} numberOfLines={1}>
              {video.title || lessonTitle}
            </Text>
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuIcon}>⋮</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* Video Player */}
      <View style={isFullscreen ? styles.videoContainerFullscreen : styles.videoContainer}>
        {videoUrl ? (
          <>
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={isFullscreen ? styles.videoPlayerFullscreen : styles.videoPlayer}
              controls={true}
              resizeMode={isFullscreen ? 'cover' : 'contain'}
              paused={paused}
              rate={playbackSpeed}
              onProgress={onProgress}
              onLoad={onLoad}
              onError={onError}
              onEnd={handleVideoEnd}
              onFullscreenPlayerWillPresent={onFullscreenPlayerWillPresent}
              onFullscreenPlayerWillDismiss={onFullscreenPlayerWillDismiss}
              playInBackground={false}
              playWhenInactive={false}
            />
          </>
        ) : (
          <View style={styles.noVideoContainer}>
            <Text style={styles.noVideoIcon}>🎥</Text>
            <Text style={styles.noVideoText}>No video URL available</Text>
          </View>
        )}
      </View>

      {/* Content Section - Hide in fullscreen */}
      {!isFullscreen && (
        <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
        <View style={styles.contentCard}>
          {/* Video Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>About this lesson</Text>
            <Text style={styles.descriptionText}>
              {video?.description || 'No description available for this video.'}
            </Text>
          </View>

          {/* Lesson Navigation */}
          <View style={styles.navigationSection}>
            <TouchableOpacity
              style={[styles.completeButton, isCompleted && styles.completeButtonCompleted]}
              onPress={handleMarkComplete}
              disabled={isCompleted}
            >
              <Text style={styles.completeButtonText}>
                {isCompleted ? '✓ Completed' : 'Mark as Completed'}
              </Text>
            </TouchableOpacity>

            {/* Assessment Button - Show when video is completed and quiz exists */}
            {isCompleted && quiz && (
              <TouchableOpacity
                style={styles.assessmentButton}
                onPress={handleTakeAssessment}
              >
                <View style={styles.assessmentButtonContent}>
                  <Text style={styles.assessmentIcon}>📝</Text>
                  <View style={styles.assessmentTextContainer}>
                    <Text style={styles.assessmentButtonTitle}>Take Assessment Test</Text>
                    <Text style={styles.assessmentButtonSubtitle}>
                      Test your knowledge on this lesson
                    </Text>
                  </View>
                  <Text style={styles.assessmentChevron}>›</Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.lessonNavButtons}>
              <TouchableOpacity
                style={[styles.navButton, !prevVideo && { opacity: 0.5 }]}
                disabled={!prevVideo}
                onPress={() => handleGoToVideo(prevVideo)}
              >
                <Text style={styles.navIcon}>←</Text>
                <View style={styles.navTextContainer}>
                  <Text style={styles.navLabel}>Previous</Text>
                  <Text style={styles.navTitle} numberOfLines={1}>
                    {prevVideo?.title || '—'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, !nextVideo && { opacity: 0.5 }]}
                disabled={!nextVideo}
                onPress={() => handleGoToVideo(nextVideo)}
              >
                <View style={[styles.navTextContainer, styles.navTextRight]}>
                  <Text style={styles.navLabel}>Next</Text>
                  <Text style={styles.navTitle} numberOfLines={1}>
                    {nextVideo?.title || '—'}
                  </Text>
                </View>
                <Text style={styles.navIcon}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: moderateScale(12),
    color: '#111827',
    fontSize: moderateScale(14),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(32),
    backgroundColor: '#FFFFFF',
  },
  errorIcon: {
    fontSize: moderateScale(64),
    marginBottom: moderateScale(16),
  },
  errorTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: moderateScale(14),
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: moderateScale(24),
  },
  goBackButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: moderateScale(32),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(8),
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: moderateScale(8),
  },
  backIcon: {
    fontSize: moderateScale(24),
    color: '#111827',
  },
  videoTitle: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    paddingHorizontal: moderateScale(8),
  },
  menuButton: {
    padding: moderateScale(8),
  },
  menuIcon: {
    fontSize: moderateScale(24),
    color: '#111827',
  },
  videoContainer: {
    width: width,
    height: width * 9 / 16, // 16:9 aspect ratio
    backgroundColor: '#000000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  noVideoIcon: {
    fontSize: moderateScale(48),
    marginBottom: moderateScale(12),
  },
  noVideoText: {
    fontSize: moderateScale(14),
    color: '#9CA3AF',
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentCard: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(32),
  },
  descriptionSection: {
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: moderateScale(20),
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(12),
  },
  descriptionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(12),
  },
  descriptionText: {
    fontSize: moderateScale(14),
    color: '#4B5563',
    lineHeight: moderateScale(22),
    textAlign: 'left',
  },
  navigationSection: {
    paddingTop: moderateScale(20),
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginBottom: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonCompleted: {
    backgroundColor: '#9CA3AF',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  assessmentButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#DC2626',
    padding: moderateScale(16),
    marginBottom: moderateScale(20),
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  assessmentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assessmentIcon: {
    fontSize: moderateScale(32),
    marginRight: moderateScale(12),
  },
  assessmentTextContainer: {
    flex: 1,
  },
  assessmentButtonTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: moderateScale(4),
  },
  assessmentButtonSubtitle: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  assessmentChevron: {
    fontSize: moderateScale(24),
    color: '#DC2626',
    fontWeight: 'bold',
  },
  lessonNavButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(12),
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: moderateScale(12),
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navIcon: {
    fontSize: moderateScale(20),
    color: '#DC2626',
    fontWeight: 'bold',
  },
  navTextContainer: {
    marginLeft: moderateScale(12),
    flex: 1,
  },
  navTextRight: {
    marginLeft: 0,
    marginRight: moderateScale(12),
    alignItems: 'flex-end',
  },
  navLabel: {
    fontSize: moderateScale(11),
    color: '#9CA3AF',
    marginBottom: moderateScale(2),
  },
  navTitle: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#111827',
  },
  videoContainerFullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    zIndex: 9999,
    elevation: 9999,
  },
  videoPlayerFullscreen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
});

export default VideoPlayerScreen;
