import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // State
  const [featuredModule, setFeaturedModule] = useState(null); // legacy, kept if needed elsewhere
  const [banners, setBanners] = useState([]);
  const [continueWatching, setContinueWatching] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef(null);

  // Get user name
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (!categoriesError && categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch active banners (ordered)
      const { data: bannersData, error: bannersError } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!bannersError && Array.isArray(bannersData)) {
        setBanners(bannersData);
      } else {
        setBanners([]);
      }

      // Fetch recent notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!notificationsError && notificationsData) {
        setNotifications(notificationsData);
      }

      // Fetch last incomplete video (continue watching)
      const { data: incompleteVideos, error: progressError } = await supabase
        .from('user_video_progress')
        .select(`
          *,
          videos (
            id,
            title,
            thumbnail_url,
            duration,
            module_id,
            modules (
              name
            )
          )
        `)
        .eq('user_id', user?.id)
        .eq('completed', false)
        .gt('watched_duration', 0)
        .order('last_watched_at', { ascending: false })
        .limit(1);

      if (!progressError && incompleteVideos && incompleteVideos.length > 0) {
        const lastVideo = incompleteVideos[0];
        const progressPercent = lastVideo.videos?.duration 
          ? Math.round((lastVideo.watched_duration / lastVideo.videos.duration) * 100)
          : 0;

        setContinueWatching({
          videoId: lastVideo.videos?.id,
          moduleId: lastVideo.videos?.module_id,
          category: lastVideo.videos?.modules?.name || 'General',
          title: lastVideo.videos?.title || 'Video',
          progress: progressPercent,
          image: lastVideo.videos?.thumbnail_url || 'https://via.placeholder.com/400x200',
          watchedDuration: lastVideo.watched_duration,
        });
      } else {
        setContinueWatching(null);
      }

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-rotate banners
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => {
        const next = (prev + 1) % banners.length;
        try {
          bannerScrollRef.current?.scrollTo?.({ x: next * width, animated: true });
        } catch (_) {}
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [banners?.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  // Category icons
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'General': '📚',
      'Podcast': '🎙️',
      'Product': '📦',
      'Sales': '📈',
      'Sales Training': '📈',
    };
    return icons[categoryName] || '📁';
  };

  // Category icons with red theme
  const getCategoryColor = (index) => {
    const colors = [
      { bg: '#FEE2E2', text: '#DC2626' }, // Red
      { bg: '#FCE7F3', text: '#DB2777' }, // Pink
      { bg: '#FEF3C7', text: '#D97706' }, // Amber
      { bg: '#DBEAFE', text: '#2563EB' }, // Blue
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}> 
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Duro<Text style={styles.headerTitleAccent}>Academy</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Welcome back, {userName}!</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}           colors={['#DC2626']} />
        }
      >
        {/* Banners (from Supabase) */}
        {banners.length > 0 && (
          <View style={styles.section}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentBannerIndex(index);
              }}
            >
              {banners.map((banner, i) => (
                <View key={banner.id} style={{ width }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.bannerCard, { marginHorizontal: moderateScale(20) }]}
                    onPress={() => {
                      const type = (banner.redirect_type || '').toLowerCase();
                      const id = banner.redirect_id;
                      if (!id) return;
                      if (type === 'module') {
                        navigation.navigate('ModuleDetails', { moduleId: id });
                      } else if (type === 'video') {
                        navigation.navigate('VideoPlayer', { lessonId: id });
                      } else if (type === 'category') {
                        navigation.navigate('CategoryDetails', { categoryId: id });
                      }
                    }}
                  >
                    <ImageBackground
                      source={{ uri: banner.image_url || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/1b74cb2dc5-fe83ed35ff1b3caf6250.png' }}
                      style={styles.bannerImage}
                      imageStyle={styles.bannerImageStyle}
                    >
                      <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerTitle}>{banner.title}</Text>
                        <View style={styles.bannerButton}>
                          <Text style={styles.bannerButtonText}>View →</Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            {/* Pagination Dots */}
            {banners.length > 1 && (
              <View style={styles.dotsContainer}>
                {banners.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentBannerIndex ? styles.dotActive : null,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Continue Watching */}
        {continueWatching && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Watching</Text>
            <TouchableOpacity style={styles.continueCard}>
              <Image 
                source={{ uri: continueWatching.image }} 
                style={styles.continueImage} 
              />
              <View style={styles.continueContent}>
                <Text style={styles.continueCategory}>{continueWatching.category}</Text>
                <Text style={styles.continueTitle}>{continueWatching.title}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${continueWatching.progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{continueWatching.progress}% complete</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('CategoryDetails', { 
                  categoryId: category.id,
                  categoryName: category.name 
                })}
              >
                <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(index).bg }]}>
                  <Text style={[styles.categoryIconText, { color: getCategoryColor(index).text }]}>
                    {getCategoryIcon(category.name)}
                  </Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        {notifications.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.notificationsList}>
              {notifications.map((notification) => (
                <View key={notification.id} style={styles.notificationCard}>
                  <View style={[
                    styles.notificationIcon,
                    { backgroundColor: notification.type === 'success' ? '#10B98120' : '#EAB30820' }
                  ]}>
                    <Text style={styles.notificationIconText}>
                      {notification.type === 'success' ? '✓' : '★'}
                    </Text>
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111827',
  },
  headerTitleAccent: {
    color: '#DC2626',
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    marginTop: moderateScale(2),
  },
  notificationButton: {
    position: 'relative',
  },
  bellIcon: {
    fontSize: moderateScale(24),
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: moderateScale(20),
    marginTop: verticalScale(24),
  },
  lastSection: {
    marginBottom: verticalScale(32),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  bannerCard: {
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerImage: {
    width: '100%',
    height: verticalScale(192),
  },
  bannerImageStyle: {
    borderRadius: moderateScale(16),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(8),
    gap: moderateScale(6),
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: '#DC2626',
    width: moderateScale(16),
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: moderateScale(16),
  },
  bannerTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: moderateScale(4),
  },
  bannerDescription: {
    fontSize: moderateScale(14),
    color: '#F3F4F6',
    marginBottom: moderateScale(12),
  },
  bannerButton: {
    backgroundColor: '#DC2626',
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  bannerButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  continueImage: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(8),
  },
  continueContent: {
    flex: 1,
    marginLeft: moderateScale(16),
  },
  continueCategory: {
    fontSize: moderateScale(12),
    color: '#DC2626',
    fontWeight: '500',
    marginBottom: moderateScale(4),
  },
  continueTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(8),
  },
  progressContainer: {
    marginTop: moderateScale(4),
  },
  progressBar: {
    height: moderateScale(6),
    backgroundColor: '#E5E7EB',
    borderRadius: moderateScale(3),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: moderateScale(3),
  },
  progressText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    marginTop: moderateScale(4),
  },
  playButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: moderateScale(12),
  },
  playIcon: {
    fontSize: moderateScale(16),
    color: '#DC2626',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: moderateScale(-6),
  },
  categoryCard: {
    width: (width - moderateScale(52)) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    margin: moderateScale(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  categoryIconText: {
    fontSize: moderateScale(20),
  },
  categoryName: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  notificationsList: {
    gap: moderateScale(12),
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationIcon: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  notificationIconText: {
    fontSize: moderateScale(16),
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#111827',
    marginBottom: moderateScale(4),
  },
  notificationTime: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
});

export default HomeScreen;
