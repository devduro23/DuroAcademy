import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase-client';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const ModuleDetailsScreen = ({ route, navigation }) => {
  const { moduleId, moduleName } = route.params || {};
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch module details and lessons
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch module details
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (moduleError) {
        console.error('Error fetching module:', moduleError);
      } else {
        setModule(moduleData);
      }

      // Fetch videos/lessons for this module from videos table
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('videos')
        .select('*')
        .eq('module_id', moduleId)
        .order('created_at', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching videos:', lessonsError);
      } else {
        setLessons(lessonsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    if (moduleId) {
      fetchData();
    }
  }, [fetchData, moduleId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!module) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Module Not Found</Text>
          <Text style={styles.errorSubtitle}>Unable to load module details</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{module.title || moduleName}</Text>
            <Text style={styles.headerSubtitle}>
              {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />
        }
      >
        {/* Module Description */}
        {module.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About this module</Text>
            <Text style={styles.descriptionText}>{module.description}</Text>
          </View>
        )}

        {/* Lessons List */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>Lessons ({lessons.length})</Text>
          {lessons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyTitle}>No lessons available</Text>
              <Text style={styles.emptySubtitle}>Check back later for content</Text>
            </View>
          ) : (
            <View style={styles.lessonsList}>
              {lessons.map((lesson, index) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonCard}
                  onPress={() => {
                    navigation.navigate('VideoPlayer', {
                      moduleId,
                      lessonId: lesson.id,
                      lessonTitle: lesson.title
                    });
                  }}
                >
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonContent}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDuration}>
                      {lesson.duration || 5} min
                    </Text>
                  </View>
                  <Text style={styles.lessonChevron}>▶</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: moderateScale(12),
    color: '#6B7280',
    fontSize: moderateScale(14),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(32),
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
    color: '#6B7280',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: moderateScale(8),
    marginLeft: moderateScale(-8),
    marginRight: moderateScale(8),
  },
  backIcon: {
    fontSize: moderateScale(24),
    color: '#374151',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    marginTop: moderateScale(2),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(16),
  },
  descriptionSection: {
    marginBottom: verticalScale(24),
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(12),
  },
  descriptionText: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    lineHeight: moderateScale(20),
  },
  lessonsSection: {
    marginBottom: verticalScale(20),
  },
  lessonsList: {
    marginTop: moderateScale(12),
    gap: moderateScale(12),
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lessonNumber: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(16),
  },
  lessonNumberText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1E40AF',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: '#111827',
    marginBottom: moderateScale(4),
  },
  lessonDuration: {
    fontSize: moderateScale(13),
    color: '#6B7280',
  },
  lessonChevron: {
    fontSize: moderateScale(18),
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(80),
  },
  emptyIcon: {
    fontSize: moderateScale(48),
    marginBottom: moderateScale(16),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
});

export default ModuleDetailsScreen;
