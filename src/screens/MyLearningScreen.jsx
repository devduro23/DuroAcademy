import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const MyLearningScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [stats, setStats] = useState({
    totalModules: 0,
    completedModules: 0,
    totalHours: 0,
    dayStreak: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [goals, setGoals] = useState({
    modulesTarget: 15,
    modulesCompleted: 0,
    hoursTarget: 30,
    hoursCompleted: 0,
  });

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch user progress statistics
      await Promise.all([
        fetchOverallProgress(),
        fetchStats(),
        fetchRecentActivity(),
        fetchCertificates(),
        fetchGoals(),
      ]);

    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOverallProgress = async () => {
    try {
      // Get all user module progress to calculate overall completion
      const { data: moduleProgress } = await supabase
        .from('user_module_progress')
        .select('videos_completed, total_videos')
        .eq('user_id', user.id);

      if (moduleProgress && moduleProgress.length > 0) {
        // Calculate overall progress from all modules
        const totalVideosCompleted = moduleProgress.reduce((sum, m) => sum + (m.videos_completed || 0), 0);
        const totalVideosOverall = moduleProgress.reduce((sum, m) => sum + (m.total_videos || 0), 0);
        
        const progress = totalVideosOverall > 0 
          ? Math.round((totalVideosCompleted / totalVideosOverall) * 100) 
          : 0;
        
        setOverallProgress(progress);
      } else {
        // Fallback to direct video count if no module progress exists
        const { count: totalVideos } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true });

        const { count: completedVideos } = await supabase
          .from('user_video_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);

        const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
        setOverallProgress(progress);
      }
    } catch (error) {
      console.error('Error fetching overall progress:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total modules count
      const { count: totalModules } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true });

      // Get completed modules from user_module_progress (more efficient)
      const { data: moduleProgress } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', user.id);

      // Count modules where progress_percent is 100 or videos_completed == total_videos
      const completedModules = moduleProgress?.filter(m => 
        m.progress_percent >= 100 || 
        (m.total_videos > 0 && m.videos_completed >= m.total_videos)
      ).length || 0;

      // Calculate total hours from watched duration
      const { data: progressData } = await supabase
        .from('user_video_progress')
        .select('watched_duration')
        .eq('user_id', user.id);

      const totalSeconds = progressData?.reduce((sum, p) => sum + (p.watched_duration || 0), 0) || 0;
      const totalHours = (totalSeconds / 3600).toFixed(1);

      // Calculate day streak based on last_accessed dates
      const dayStreak = await calculateDayStreak(moduleProgress);

      setStats({
        totalModules: totalModules || 0,
        completedModules,
        totalHours: parseFloat(totalHours),
        dayStreak,
      });

      setGoals(prev => ({
        ...prev,
        modulesCompleted: completedModules,
        hoursCompleted: parseFloat(totalHours),
      }));

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Calculate day streak from module progress
  const calculateDayStreak = async (moduleProgress) => {
    try {
      if (!moduleProgress || moduleProgress.length === 0) return 0;

      // Get all unique dates when user accessed modules
      const accessDates = moduleProgress
        .map(m => m.last_accessed)
        .filter(date => date)
        .map(date => new Date(date).toDateString())
        .sort((a, b) => new Date(b) - new Date(a)); // Sort descending

      if (accessDates.length === 0) return 0;

      const uniqueDates = [...new Set(accessDates)];
      const today = new Date().toDateString();
      
      // Check if user accessed today or yesterday
      if (uniqueDates[0] !== today && 
          uniqueDates[0] !== new Date(Date.now() - 86400000).toDateString()) {
        return 0; // Streak broken
      }

      // Count consecutive days
      let streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i - 1]);
        const prevDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((currentDate - prevDate) / 86400000);
        
        if (diffDays === 1) {
          streak++;
        } else {
          break; // Streak broken
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating day streak:', error);
      return 0;
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data } = await supabase
        .from('user_video_progress')
        .select(`
          *,
          videos (
            id,
            title,
            duration,
            module_id,
            modules (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('last_watched_at', { ascending: false })
        .limit(5);

      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchCertificates = async () => {
    // Placeholder - implement when you have certificates table
    setCertificates([
      // { id: 1, name: 'Data Security Certificate', issuedDate: '2024-12-15' },
      // { id: 2, name: 'Project Management Certificate', issuedDate: '2024-12-14' },
    ]);
  };

  const fetchGoals = async () => {
    // Placeholder - you can store goals in a user_goals table
    // For now using default values set in state
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return 'Today';
    if (diffInHours < 48) return 'Yesterday';
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const formatDuration = (seconds) => {
    const hours = (seconds / 3600).toFixed(1);
    return `${hours} hrs`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProgressData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonIcon}>⬇️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* Overall Progress Circle */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircleContainer}>
            {/* Circular Progress using View */}
            <View style={styles.circleContainer}>
              <View style={styles.circleBackground}>
                <View style={[styles.circleProgress, { 
                  transform: [{ rotate: `${(overallProgress * 3.6)}deg` }] 
                }]} />
              </View>
              <View style={styles.innerCircle}>
                <Text style={styles.progressPercentage}>{overallProgress}%</Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
          </View>
          <Text style={styles.progressTitle}>Great Progress!</Text>
          <Text style={styles.progressSubtitle}>Keep up the excellent work</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.statEmoji}>📚</Text>
              </View>
              <Text style={styles.statValue}>{stats.completedModules}</Text>
              <Text style={styles.statLabel}>Modules</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.statEmoji}>🕐</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalHours}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#FED7AA' }]}>
                <Text style={styles.statEmoji}>🔥</Text>
              </View>
              <Text style={styles.statValue}>{stats.dayStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Filter and Export */}
        <View style={styles.filterSection}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>📅</Text>
            <Text style={styles.filterText}>Last 30 days</Text>
            <Text style={styles.filterChevron}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportIcon}>⬇️</Text>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivity.map((item, index) => (
                <View key={index} style={styles.activityCard}>
                  <View style={styles.activityIconContainer}>
                    <Text style={styles.activityIcon}>✓</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {item.videos?.title || 'Video'}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      Completed • {item.videos?.modules?.name || 'Module'}
                    </Text>
                    <View style={styles.activityFooter}>
                      <View style={styles.activityBadge}>
                        <Text style={styles.activityBadgeText}>
                          {getTimeAgo(item.last_watched_at)}
                        </Text>
                      </View>
                      <Text style={styles.activityDuration}>
                        {formatDuration(item.watched_duration)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent activity yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start learning to see your progress here
              </Text>
            </View>
          )}
        </View>

        {/* Certificates */}
        {certificates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificates</Text>
            <View style={styles.certificatesList}>
              {certificates.map((cert) => (
                <View key={cert.id} style={styles.certificateCard}>
                  <View style={styles.certificateLeft}>
                    <View style={styles.certificateIcon}>
                      <Text style={styles.certificateEmoji}>🏆</Text>
                    </View>
                    <View>
                      <Text style={styles.certificateTitle}>{cert.name}</Text>
                      <Text style={styles.certificateDate}>
                        Issued {cert.issuedDate}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.downloadIcon}>⬇️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Training Goals */}
        <View style={styles.section}>
          <View style={styles.goalsCard}>
            <View style={styles.goalsHeader}>
              <Text style={styles.goalsTitle}>Training Goals</Text>
              <Text style={styles.goalsIcon}>🎯</Text>
            </View>
            
            <View style={styles.goalsList}>
              <View style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalText}>Complete {goals.modulesTarget} modules</Text>
                  <Text style={styles.goalValue}>
                    {goals.modulesCompleted}/{goals.modulesTarget}
                  </Text>
                </View>
                <View style={styles.goalProgressBar}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      {
                        width: `${(goals.modulesCompleted / goals.modulesTarget) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalText}>{goals.hoursTarget} hours learning</Text>
                  <Text style={styles.goalValue}>
                    {goals.hoursCompleted}/{goals.hoursTarget}
                  </Text>
                </View>
                <View style={styles.goalProgressBar}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      {
                        width: `${Math.min((goals.hoursCompleted / goals.hoursTarget) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.setGoalButton}>
              <Text style={styles.setGoalButtonText}>Set New Goal</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpace} />
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
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: scale(8),
    marginLeft: scale(-8),
  },
  backIcon: {
    fontSize: moderateScale(18),
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginLeft: scale(12),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: scale(8),
  },
  headerButtonIcon: {
    fontSize: moderateScale(18),
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(24),
    alignItems: 'center',
  },
  progressCircleContainer: {
    position: 'relative',
    marginBottom: verticalScale(16),
  },
  circleContainer: {
    width: scale(128),
    height: scale(128),
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBackground: {
    position: 'absolute',
    width: scale(128),
    height: scale(128),
    borderRadius: scale(64),
    borderWidth: 8,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  circleProgress: {
    position: 'absolute',
    width: scale(128),
    height: scale(128),
    borderRadius: scale(64),
    borderWidth: 8,
    borderColor: '#6366F1',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  innerCircle: {
    width: scale(112),
    height: scale(112),
    borderRadius: scale(56),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#111827',
  },
  progressLabel: {
    fontSize: moderateScale(11),
    color: '#6B7280',
  },
  progressTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  progressSubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: scale(16),
    marginTop: verticalScale(-8),
    borderRadius: moderateScale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  statEmoji: {
    fontSize: moderateScale(20),
  },
  statValue: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: '#6B7280',
    marginTop: verticalScale(2),
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
  },
  filterIcon: {
    fontSize: moderateScale(14),
    marginRight: scale(8),
  },
  filterText: {
    fontSize: moderateScale(14),
    color: '#374151',
    marginRight: scale(8),
  },
  filterChevron: {
    fontSize: moderateScale(10),
    color: '#9CA3AF',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
  },
  exportIcon: {
    fontSize: moderateScale(14),
    marginRight: scale(8),
  },
  exportText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  activityList: {
    gap: verticalScale(16),
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: scale(16),
  },
  activityIconContainer: {
    width: scale(32),
    height: scale(32),
    backgroundColor: '#D1FAE5',
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    marginTop: verticalScale(4),
  },
  activityIcon: {
    fontSize: moderateScale(14),
    color: '#10B981',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  activitySubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginBottom: verticalScale(8),
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4),
  },
  activityBadgeText: {
    fontSize: moderateScale(11),
    color: '#374151',
  },
  activityDuration: {
    fontSize: moderateScale(11),
    color: '#6B7280',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: scale(32),
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  emptyStateSubtext: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
  },
  certificatesList: {
    gap: verticalScale(12),
  },
  certificateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: scale(16),
  },
  certificateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  certificateIcon: {
    width: scale(40),
    height: scale(40),
    backgroundColor: '#FEF3C7',
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  certificateEmoji: {
    fontSize: moderateScale(20),
  },
  certificateTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#111827',
  },
  certificateDate: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginTop: verticalScale(2),
  },
  downloadIcon: {
    fontSize: moderateScale(18),
    color: '#6366F1',
  },
  goalsCard: {
    backgroundColor: '#6366F1',
    borderRadius: moderateScale(12),
    padding: scale(16),
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  goalsTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalsIcon: {
    fontSize: moderateScale(20),
  },
  goalsList: {
    gap: verticalScale(12),
    marginBottom: verticalScale(16),
  },
  goalItem: {
    gap: verticalScale(6),
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  goalValue: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  goalProgressBar: {
    width: '100%',
    height: verticalScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(4),
  },
  setGoalButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  setGoalButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#6366F1',
  },
  bottomSpace: {
    height: verticalScale(20),
  },
});

export default MyLearningScreen;
