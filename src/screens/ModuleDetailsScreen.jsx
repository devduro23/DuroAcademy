import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';

const ModuleDetailsScreen = ({ route, navigation }) => {
  const { moduleName = 'Module Details', categoryName = '' } = route.params || {};
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLessonsCollapsed, setIsLessonsCollapsed] = useState(false);

  const lessons = [
    {
      id: 1,
      title: 'Overview of Plywood Types',
      duration: '5 min',
      completed: true,
      current: false,
    },
    {
      id: 2,
      title: 'Manufacturing Process',
      duration: '8 min',
      completed: false,
      current: true,
    },
    {
      id: 3,
      title: 'Quality Control Standards',
      duration: '6 min',
      completed: false,
      current: false,
    },
    {
      id: 4,
      title: 'Safety Protocols',
      duration: '4 min',
      completed: false,
      current: false,
    },
    {
      id: 5,
      title: 'Final Assessment',
      duration: '2 min',
      completed: false,
      current: false,
    },
  ];

  const relatedModules = [
    {
      id: 1,
      title: 'Veneer Processing',
      duration: '15 min',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/4413f78079-9ad9224a39b87ad3c441.png',
    },
    {
      id: 2,
      title: 'Quality Testing',
      duration: '20 min',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/4e070859f4-820b844d533058acaf0c.png',
    },
    {
      id: 3,
      title: 'Adhesive Systems',
      duration: '18 min',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/6643466454-2906aba450fbae632e25.png',
    },
  ];

  const shortDescription = 'Learn the fundamentals of plywood manufacturing processes, quality control measures, and industry standards. This comprehensive module covers...';
  const fullDescription = 'Learn the fundamentals of plywood manufacturing processes, quality control measures, and industry standards. This comprehensive module covers the complete production cycle from raw material selection to finished product quality assessment. You\'ll understand different plywood grades, adhesive systems, pressing techniques, and environmental considerations in modern manufacturing facilities.';

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '45%' }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Module Details</Text>
        </View>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => setIsBookmarked(!isBookmarked)}
        >
          <Text style={styles.bookmarkIcon}>{isBookmarked ? '🔖' : '📑'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Module Header */}
          <View style={styles.moduleHeader}>
            <Text style={styles.moduleTitle}>
              Introduction to {moduleName} Manufacturing
            </Text>
            <View style={styles.badges}>
              <View style={styles.badgeVideo}>
                <Text style={styles.badgeVideoText}>Video</Text>
              </View>
              <View style={styles.badgeLevel}>
                <Text style={styles.badgeLevelText}>Intermediate</Text>
              </View>
            </View>
            <Text style={styles.duration}>Duration: 25 minutes</Text>
          </View>

          {/* Video Thumbnail */}
          <TouchableOpacity 
            style={styles.videoContainer}
            onPress={() => {
              const videoUrl = categoryName === 'Podcast' 
                ? 'https://player.vimeo.com/progressive_redirect/playback/1128132947/rendition/1080p/file.mp4?loc=external&signature=8c02c98c2f9b1d5b3c4f5d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5'
                : null;
              
              navigation.navigate('VideoPlayer', { 
                moduleName: moduleName,
                categoryName: categoryName,
                videoUrl: videoUrl
              });
            }}
          >
            <Image
              source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/66be844b5a-e7a45026311a916a5370.png' }}
              style={styles.videoThumbnail}
            />
            <View style={styles.videoOverlay}>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>
              {isDescriptionExpanded ? fullDescription : shortDescription}
            </Text>
            <TouchableOpacity
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <Text style={styles.readMoreButton}>
                {isDescriptionExpanded ? 'Read less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lessons Section */}
          <View style={styles.lessonsSection}>
            <View style={styles.lessonsSectionHeader}>
              <Text style={styles.lessonsSectionTitle}>Lessons (5)</Text>
              <TouchableOpacity
                onPress={() => setIsLessonsCollapsed(!isLessonsCollapsed)}
              >
                <Text style={styles.collapseIcon}>
                  {isLessonsCollapsed ? '▼' : '▲'}
                </Text>
              </TouchableOpacity>
            </View>
            {!isLessonsCollapsed && (
              <View style={styles.lessonsList}>
                {lessons.map((lesson) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.lessonItem,
                      lesson.completed && styles.lessonItemCompleted,
                      lesson.current && styles.lessonItemCurrent,
                    ]}
                  >
                    <View
                      style={[
                        styles.lessonIcon,
                        lesson.completed && styles.lessonIconCompleted,
                        lesson.current && styles.lessonIconCurrent,
                      ]}
                    >
                      <Text style={styles.lessonIconText}>
                        {lesson.completed ? '✓' : '▶'}
                      </Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                    </View>
                    {lesson.current && <View style={styles.currentDot} />}
                    {!lesson.current && !lesson.completed && (
                      <Text style={styles.lessonPlayIcon}>▶</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Uploaded by</Text>
              <Text style={styles.metadataValue}>Dr. Sarah Johnson</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Last updated</Text>
              <Text style={styles.metadataValue}>Dec 15, 2024</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Tags</Text>
              <View style={styles.tags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{moduleName}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Manufacturing</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Related Modules */}
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Modules</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.relatedScroll}
            >
              {relatedModules.map((module) => (
                <TouchableOpacity key={module.id} style={styles.relatedCard}>
                  <Image
                    source={{ uri: module.image }}
                    style={styles.relatedImage}
                  />
                  <Text style={styles.relatedCardTitle}>{module.title}</Text>
                  <Text style={styles.relatedCardDuration}>{module.duration}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.resumeButton}>
          <Text style={styles.resumeButtonText}>Resume Learning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadIcon}>⬇</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  backIcon: {
    fontSize: 24,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  bookmarkButton: {
    padding: 8,
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  moduleHeader: {
    marginBottom: 24,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badgeVideo: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeVideoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e40af',
  },
  badgeLevel: {
    backgroundColor: '#fed7aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLevelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#c2410c',
  },
  duration: {
    fontSize: 14,
    color: '#6b7280',
  },
  videoContainer: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: 192,
    borderRadius: 12,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: '#dc2626',
    marginLeft: 4,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
  },
  readMoreButton: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 8,
  },
  lessonsSection: {
    marginBottom: 24,
  },
  lessonsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lessonsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  collapseIcon: {
    fontSize: 14,
    color: '#6b7280',
  },
  lessonsList: {
    gap: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  lessonItemCompleted: {
    backgroundColor: '#f0fdf4',
  },
  lessonItemCurrent: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonIconCompleted: {
    backgroundColor: '#dcfce7',
  },
  lessonIconCurrent: {
    backgroundColor: '#3b82f6',
  },
  lessonIconText: {
    fontSize: 12,
    color: '#6b7280',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  lessonPlayIcon: {
    fontSize: 12,
    color: '#9ca3af',
  },
  metadataSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  relatedSection: {
    marginBottom: 24,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  relatedScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  relatedCard: {
    width: 160,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginRight: 12,
  },
  relatedImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  relatedCardDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  downloadButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadIcon: {
    fontSize: 20,
  },
});

export default ModuleDetailsScreen;