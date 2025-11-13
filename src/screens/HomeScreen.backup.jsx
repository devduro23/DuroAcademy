import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

const { width, height } = Dimensions.get('window');

// Enhanced responsive helper functions
const scale = (size) => {
  const guidelineBaseWidth = 375;
  return (width / guidelineBaseWidth) * size;
};

const verticalScale = (size) => {
  const guidelineBaseHeight = 812;
  return (height / guidelineBaseHeight) * size;
};

const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Enhanced device type detection
const isTablet = width >= 768;
const isLargeTablet = width >= 1024;
const isSmallScreen = width < 360;
const isLandscape = width > height;

// Screen size breakpoints
const getScreenSize = () => {
  if (width < 400) return 'small';
  if (width < 768) return 'medium';
  if (width < 1024) return 'large';
  return 'xlarge';
};

const HomeScreen = ({ navigation }) => {
  const { signOut, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dynamic data states
  const [categories, setCategories] = useState([]);
  const [featuredModules, setFeaturedModules] = useState([]);
  const [continueStudying, setContinueStudying] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Loading states
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [continueLoading, setContinueLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);

  // Error states
  const [categoriesError, setCategoriesError] = useState(null);
  const [featuredError, setFeaturedError] = useState(null);

  // Screen size responsive values
  const screenSize = getScreenSize();
  const cardWidth = useMemo(() => {
    switch (screenSize) {
      case 'small': return scale(280);
      case 'medium': return scale(320);
      case 'large': return scale(360);
      case 'xlarge': return scale(400);
      default: return scale(320);
    }
  }, [screenSize]);

  const continueCardWidth = useMemo(() => {
    switch (screenSize) {
      case 'small': return scale(260);
      case 'medium': return scale(288);
      case 'large': return scale(320);
      case 'xlarge': return scale(360);
      default: return scale(288);
    }
  }, [screenSize]);

  // Fetch categories from Supabase
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
      
      // Set first category as selected if none selected
      if (!selectedCategory && data && data.length > 0) {
        setSelectedCategory(data[0].name);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError(error.message);
      // Fallback to default categories
      const fallbackCategories = [
        { id: 1, name: 'Product Training' },
        { id: 2, name: 'Sales Training' },
        { id: 3, name: 'Other Training' },
        { id: 4, name: 'Podcast' }
      ];
      setCategories(fallbackCategories);
      if (!selectedCategory) {
        setSelectedCategory(fallbackCategories[0].name);
      }
    } finally {
      setCategoriesLoading(false);
    }
  }, [selectedCategory]);

  // Fetch featured modules
  const fetchFeaturedModules = useCallback(async () => {
    try {
      setFeaturedLoading(true);
      setFeaturedError(null);

      // For now, using static data but can be replaced with Supabase call
      const staticFeaturedModules = [
        {
          id: 1,
          title: 'Advanced Product Training',
          description: 'Master our latest product features',
          image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/be0da6fc62-657f0c42edf63e6544c5.png',
          badge: { text: 'New', color: '#10b981' }
        },
        {
          id: 2,
          title: 'Sales Excellence Program',
          description: 'Boost your sales performance',
          image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/8e4dabfd2f-4f3a4c51b29b8a9b6721.png',
          badge: { text: 'Popular', color: '#3b82f6' }
        }
      ];

      setFeaturedModules(staticFeaturedModules);
    } catch (error) {
      console.error('Error fetching featured modules:', error);
      setFeaturedError(error.message);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  // Fetch continue studying data
  const fetchContinueStudying = useCallback(async () => {
    try {
      setContinueLoading(true);

      // Static data for now - can be replaced with user progress from Supabase
      const staticContinueStudying = [
        {
          id: 1,
          title: 'Customer Service Excellence',
          progress: 75,
          completedLessons: 3,
          totalLessons: 4
        },
        {
          id: 2,
          title: 'Digital Marketing Basics',
          progress: 45,
          completedLessons: 2,
          totalLessons: 5
        }
      ];

      setContinueStudying(staticContinueStudying);
    } catch (error) {
      console.error('Error fetching continue studying:', error);
    } finally {
      setContinueLoading(false);
    }
  }, []);

  // Fetch recommended courses
  const fetchRecommendedCourses = useCallback(async () => {
    try {
      setRecommendedLoading(true);

      // Static data for now - can be replaced with recommendation algorithm from Supabase
      const staticRecommendedCourses = [
        {
          id: 1,
          title: 'Leadership Fundamentals',
          description: 'Build essential leadership skills',
          image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/0a178268f1-9fe62a99a1e9b65dd1aa.png',
          rating: 4.8,
          duration: '2h 30m'
        },
        {
          id: 2,
          title: 'Time Management Mastery',
          description: 'Maximize your productivity',
          image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/9301531c27-daf31a1993f1d1155956.png',
          rating: 4.6,
          duration: '1h 45m'
        },
        {
          id: 3,
          title: 'Effective Communication',
          description: 'Improve your communication skills',
          image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/c4456d8d02-7e77d66d7ffe5681e87a.png',
          rating: 4.9,
          duration: '3h 15m'
        }
      ];

      setRecommendedCourses(staticRecommendedCourses);
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
    } finally {
      setRecommendedLoading(false);
    }
  }, []);

  // Load all data on component mount
  useEffect(() => {
    fetchCategories();
    fetchFeaturedModules();
    fetchContinueStudying();
    fetchRecommendedCourses();
  }, [fetchCategories, fetchFeaturedModules, fetchContinueStudying, fetchRecommendedCourses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchCategories(),
      fetchFeaturedModules(),
      fetchContinueStudying(),
      fetchRecommendedCourses()
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [fetchCategories, fetchFeaturedModules, fetchContinueStudying, fetchRecommendedCourses]);

  const handleCoursePress = useCallback((course) => {
    navigation.navigate('CourseDetails', { course });
  }, [navigation]);

  // Logout function using AuthContext
  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              console.log('HomeScreen - Logged out using AuthContext');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  }, [signOut]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.welcomeText}>Hi, {user?.email?.split('@')[0] || 'Dev'} 👋</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.notificationDot} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Image
            source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeaturedModules = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Featured Modules</Text>
      {featuredLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading featured modules...</Text>
        </View>
      ) : featuredError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load featured modules</Text>
          <TouchableOpacity onPress={fetchFeaturedModules} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
          {featuredModules.map((module) => (
            <TouchableOpacity 
              key={module.id} 
              style={[styles.featuredCard, { width: cardWidth }]} 
              onPress={() => handleCoursePress(module)}
            >
              <View style={styles.featuredImageContainer}>
                <Image source={{ uri: module.image }} style={styles.featuredImage} />
                {module.badge && (
                  <View style={[styles.badge, { backgroundColor: module.badge.color }]}>
                    <Text style={styles.badgeText}>{module.badge.text}</Text>
                  </View>
                )}
              </View>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>{module.title}</Text>
                <Text style={styles.featuredDescription}>{module.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Categories</Text>
      {categoriesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#dc2626" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : categoriesError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load categories</Text>
          <TouchableOpacity onPress={fetchCategories} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id || category}
              style={[
                styles.categoryButton,
                selectedCategory === (category.name || category) && styles.categoryButtonActive
              ]}
              onPress={() => {
                // Navigate to category details
                navigation.navigate('CategoryDetails', { category });
              }}
              onLongPress={() => {
                // Select category for filtering (if needed)
                setSelectedCategory(category.name || category);
              }}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === (category.name || category) && styles.categoryTextActive
              ]}>
                {category.name || category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderProgressRing = (progress) => (
    <View style={styles.progressRingContainer}>
      <View style={styles.progressRingBackground} />
      <View style={[styles.progressRingFill, { 
        transform: [{ rotate: `${(progress / 100) * 360 - 90}deg` }] 
      }]} />
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );

  const renderContinueLearning = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Continue Learning</Text>
      {continueLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#dc2626" />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
          {continueStudying.map((course) => (
            <TouchableOpacity 
              key={course.id} 
              style={[styles.continueCard, { width: continueCardWidth }]} 
              onPress={() => handleCoursePress(course)}
            >
              <View style={styles.continueCardContent}>
                {renderProgressRing(course.progress)}
                <View style={styles.continueTextContainer}>
                  <Text style={styles.continueTitle}>{course.title}</Text>
                  <Text style={styles.continueSubtitle}>
                    {course.completedLessons} of {course.totalLessons} lessons completed
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressBarFill, { width: `${course.progress}%` }]} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => (
          <Text key={index} style={styles.star}>
            {index < fullStars ? '⭐' : index === fullStars && hasHalfStar ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  const renderRecommended = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recommended for you</Text>
      {recommendedLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#dc2626" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      ) : (
        <View style={styles.recommendedContainer}>
          {recommendedCourses.map((course) => (
            <TouchableOpacity key={course.id} style={styles.recommendedCard} onPress={() => handleCoursePress(course)}>
              <Image source={{ uri: course.image }} style={styles.recommendedImage} />
              <View style={styles.recommendedContent}>
                <Text style={styles.recommendedTitle}>{course.title}</Text>
                <Text style={styles.recommendedDescription}>{course.description}</Text>
                <View style={styles.recommendedMeta}>
                  <Text style={styles.ratingText}>{course.rating}</Text>
                  {renderStars(course.rating)}
                  <Text style={styles.durationText}>• {course.duration}</Text>
                </View>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderFeaturedModules()}
        {renderCategories()}
        {renderContinueLearning()}
        {renderRecommended()}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Quick Quiz FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('Quick Quiz', 'Feature coming soon!')}>
        <Text style={styles.fabIcon}>⚡</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  notificationButton: {
    position: 'relative',
    padding: scale(8),
  },
  bellIcon: {
    fontSize: moderateScale(18),
  },
  notificationDot: {
    position: 'absolute',
    top: scale(6),
    right: scale(6),
    width: scale(12),
    height: scale(12),
    backgroundColor: '#dc2626',
    borderRadius: scale(6),
  },
  profileImage: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  horizontalScrollView: {
    marginHorizontal: scale(-16),
    paddingHorizontal: scale(16),
  },
  featuredCard: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(12),
    marginRight: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: verticalScale(176),
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: scale(12),
    left: scale(12),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: moderateScale(12),
  },
  badgeText: {
    color: '#ffffff',
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  featuredContent: {
    padding: scale(16),
  },
  featuredTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  featuredDescription: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  categoryButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: scale(12),
  },
  categoryButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  categoryText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  continueCard: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginRight: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  continueCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
  },
  progressRingContainer: {
    width: scale(48),
    height: scale(48),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingBackground: {
    position: 'absolute',
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  progressRingFill: {
    position: 'absolute',
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    borderWidth: 3,
    borderColor: '#dc2626',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#dc2626',
  },
  continueTextContainer: {
    flex: 1,
  },
  continueTitle: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  continueSubtitle: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    marginBottom: verticalScale(8),
  },
  progressBar: {
    width: '100%',
    height: verticalScale(4),
    backgroundColor: '#e5e7eb',
    borderRadius: moderateScale(2),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: moderateScale(2),
  },
  recommendedContainer: {
    gap: verticalScale(12),
  },
  recommendedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    gap: scale(12),
  },
  recommendedImage: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(8),
  },
  recommendedContent: {
    flex: 1,
  },
  recommendedTitle: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  recommendedDescription: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    marginBottom: verticalScale(4),
  },
  recommendedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: scale(2),
  },
  star: {
    fontSize: moderateScale(12),
  },
  durationText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  chevronIcon: {
    fontSize: moderateScale(18),
    color: '#9ca3af',
  },
  fab: {
    position: 'absolute',
    bottom: verticalScale(96),
    right: scale(16),
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: moderateScale(24),
  },
  bottomPadding: {
    height: verticalScale(100),
  },
  // Loading and error states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(20),
    gap: scale(8),
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    gap: verticalScale(8),
  },
  errorText: {
    fontSize: moderateScale(14),
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(6),
  },
  retryText: {
    color: '#ffffff',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
});

export default HomeScreen;