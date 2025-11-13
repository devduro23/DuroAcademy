import React, { useState, useEffect, useCallback } from 'react';
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
  const [featuredModule, setFeaturedModule] = useState(null);
  const [continueWatching, setContinueWatching] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch featured module (first module)
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .limit(1)
        .single();

      if (!modulesError && modulesData) {
        setFeaturedModule(modulesData);
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

      // Mock continue watching data
      setContinueWatching({
        category: 'General',
        title: 'Effective Communication',
        progress: 45,
        image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/0bc7ad218e-f8b8c81a94b528a34f30.png',
      });

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const getCategoryColor = (index) => {
    const colors = [
      { bg: '#3B82F620', text: '#3B82F6' },
      { bg: '#7C3AED20', text: '#7C3AED' },
      { bg: '#10B98120', text: '#10B981' },
      { bg: '#F9731620', text: '#F97316' },
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
    <SafeAreaView style={styles.container}>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
        }
      >
        {/* Featured Module Banner */}
        {featuredModule && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.bannerCard}
              onPress={() => navigation.navigate('ModuleDetails', { moduleId: featuredModule.id })}
            >
              <ImageBackground
                source={{ uri: featuredModule.image_url || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/1b74cb2dc5-fe83ed35ff1b3caf6250.png' }}
                style={styles.bannerImage}
                imageStyle={styles.bannerImageStyle}
              >
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{featuredModule.title}</Text>
                  <Text style={styles.bannerDescription}>{featuredModule.description}</Text>
                  <View style={styles.bannerButton}>
                    <Text style={styles.bannerButtonText}>Start Learning →</Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
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
                onPress={() => navigation.navigate('CategoryDetails', { categoryId: category.id })}
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
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: moderateScale(12),
    color: '#9CA3AF',
    fontSize: moderateScale(14),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: '#111827',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitleAccent: {
    color: '#4F46E5',
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: '#9CA3AF',
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
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#111827',
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
    color: '#FFFFFF',
    marginBottom: verticalScale(12),
  },
  bannerCard: {
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    color: '#D1D5DB',
    marginBottom: moderateScale(12),
  },
  bannerButton: {
    backgroundColor: '#4F46E5',
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
    backgroundColor: '#1F2937',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#9CA3AF',
    marginBottom: moderateScale(4),
  },
  continueTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: moderateScale(8),
  },
  progressContainer: {
    marginTop: moderateScale(4),
  },
  progressBar: {
    height: moderateScale(6),
    backgroundColor: '#374151',
    borderRadius: moderateScale(3),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: moderateScale(3),
  },
  progressText: {
    fontSize: moderateScale(12),
    color: '#9CA3AF',
    marginTop: moderateScale(4),
  },
  playButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#4F46E520',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: moderateScale(12),
  },
  playIcon: {
    fontSize: moderateScale(16),
    color: '#4F46E5',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: moderateScale(-6),
  },
  categoryCard: {
    width: (width - moderateScale(52)) / 2,
    backgroundColor: '#1F2937',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    margin: moderateScale(6),
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
    color: '#FFFFFF',
    flex: 1,
  },
  notificationsList: {
    gap: moderateScale(12),
  },
  notificationCard: {
    backgroundColor: '#1F2937',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    color: '#FFFFFF',
    marginBottom: moderateScale(4),
  },
  notificationTime: {
    fontSize: moderateScale(12),
    color: '#9CA3AF',
  },
});

export default HomeScreen;
