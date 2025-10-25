import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { 
    moduleName = 'Introduction to Plywood Manufacturing', 
    lessonTitle = 'Manufacturing Process',
    videoUrl: paramVideoUrl,
    categoryName = ''
  } = route.params || {};
  
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hideControlsTimeout = useRef(null);

  // Use parameter video URL or default URL
  const videoUrl = paramVideoUrl || 'https://drive.google.com/uc?export=download&id=1xI_QKkJHkHG3PjeFyZI__RHbdh9IE9cz';

  useEffect(() => {
    // Lock to portrait on mount
    Orientation.lockToPortrait();
    
    return () => {
      // Clean up timeout
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      // Unlock orientation on unmount
      Orientation.unlockAllOrientations();
    };
  }, []);

  const togglePlayPause = () => {
    setPaused(!paused);
    if (paused) {
      hideControlsDelayed();
    } else {
      showControls();
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
  };

  const hideControlsDelayed = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (!paused) {
        setControlsVisible(false);
      }
    }, 5000);
  };

  const handleVideoPress = () => {
    showControls();
    if (!paused) {
      hideControlsDelayed();
    }
  };

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.seek(Math.max(0, currentTime - 10));
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.seek(Math.min(duration, currentTime + 10));
    }
  };

  const toggleSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    
    if (newFullscreenState) {
      // Enter fullscreen - switch to landscape and hide navigation
      Orientation.lockToLandscape();
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      // Exit fullscreen - switch back to portrait and show navigation
      Orientation.lockToPortrait();
      navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    }
    
    showControls();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackPress = () => {
    if (isFullscreen) {
      // Exit fullscreen if in fullscreen mode
      toggleFullscreen();
    } else {
      // Navigate back if not in fullscreen
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />
      
      {/* Video Player */}
      <TouchableOpacity 
        style={[styles.videoContainer, isFullscreen && styles.videoContainerFullscreen]} 
        activeOpacity={1}
        onPress={handleVideoPress}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          paused={paused}
          rate={playbackSpeed}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
          resizeMode="contain"
        />

        {/* Buffering Indicator */}
        {buffering && (
          <View style={styles.bufferingContainer}>
            <View style={styles.bufferingSpinner} />
          </View>
        )}

        {/* Top Overlay */}
        {controlsVisible && (
          <View style={styles.topOverlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.videoTitle} numberOfLines={1}>
              {moduleName}
            </Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowOverflowMenu(true)}
            >
              <Text style={styles.menuIcon}>⋮</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Center Play/Pause Button */}
        {controlsVisible && (
          <View style={styles.centerControls}>
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={togglePlayPause}
            >
              <Text style={styles.playPauseIcon}>{paused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Controls */}
        {controlsVisible && (
          <View style={styles.bottomOverlay}>
            <View style={styles.controlButtons}>
              <TouchableOpacity onPress={skipBackward} style={styles.controlButton}>
                <Text style={styles.controlButtonText}>⏮ 10s</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={skipForward} style={styles.controlButton}>
                <Text style={styles.controlButtonText}>10s ⏭</Text>
              </TouchableOpacity>
              <View style={styles.spacer} />
              <TouchableOpacity onPress={toggleSpeed} style={styles.controlButton}>
                <Text style={styles.controlButtonText}>{playbackSpeed}x</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlButtonText}>CC</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
                <Text style={styles.controlButtonText}>{isFullscreen ? '⛶' : '⛶'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${(currentTime / duration) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Content Section - Hide in fullscreen */}
      {!isFullscreen && (
        <View style={styles.contentSection}>
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {/* Lesson Navigation */}
          <View style={styles.lessonNavigation}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                isCompleted && styles.completeButtonCompleted,
              ]}
              onPress={() => setIsCompleted(true)}
              disabled={isCompleted}
            >
              <Text style={styles.completeButtonText}>
                {isCompleted ? '✓ Completed' : '✓ Mark as Completed'}
              </Text>
            </TouchableOpacity>
            <View style={styles.navigationButtons}>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navIcon}>‹</Text>
                <View>
                  <Text style={styles.navLabel}>Previous</Text>
                  <Text style={styles.navTitle}>Wood Selection</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton}>
                <View style={styles.navRightText}>
                  <Text style={styles.navLabel}>Next</Text>
                  <Text style={styles.navTitle}>Quality Testing</Text>
                </View>
                <Text style={styles.navIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
      )}

      {/* Overflow Menu Modal */}
      <Modal
        visible={showOverflowMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOverflowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOverflowMenu(false)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemIcon}>⬇</Text>
              <Text style={styles.menuItemText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemIcon}>🚩</Text>
              <Text style={styles.menuItemText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={toggleSpeed}>
              <Text style={styles.menuItemIcon}>⚡</Text>
              <Text style={styles.menuItemText}>Playback Speed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemIcon}>CC</Text>
              <Text style={styles.menuItemText}>Subtitles</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    width: width,
    height: 256,
    backgroundColor: '#1f2937',
    position: 'relative',
  },
  videoContainerFullscreen: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bufferingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bufferingSpinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderTopColor: 'transparent',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  videoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginHorizontal: 16,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  centerControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlButton: {
    marginRight: 12,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  spacer: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#ffffff',
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#6b7280',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 16,
  },
  contentScroll: {
    flex: 1,
  },
  lessonNavigation: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  completeButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  completeButtonCompleted: {
    backgroundColor: '#9ca3af',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  navLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  navRightText: {
    alignItems: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingRight: 16,
  },
  menuModal: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    minWidth: 192,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemText: {
    fontSize: 14,
    color: '#111827',
  },
});

export default VideoPlayerScreen;