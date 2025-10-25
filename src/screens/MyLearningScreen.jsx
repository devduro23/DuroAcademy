import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Responsive helper functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const MyLearningScreen = () => {
  const { isLoggedIn } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Fetch user learning data
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserLearningData();
    }
  }, [isLoggedIn]);

  const fetchUserLearningData = async () => {
    try {
      setLoading(true);
      
      // Try to get stored user data
      const storedData = await AsyncStorage.getItem('userLearningData');
      
      if (storedData) {
        setUserData(JSON.parse(storedData));
      } else {
        // Initialize with default data for new users
        const defaultData = {
          userName: 'Dev',
          overallProgress: 62,
          stats: {
            totalModules: 12,
            totalHours: 24.5,
            dayStreak: 7,
          },
          recentActivity: [
            {
              id: 1,
              title: 'Data Security Fundamentals',
              subtitle: 'Completed with 95% score',
              date: 'Today',
              hours: '2.5 hrs',
            },
            {
              id: 2,
              title: 'Project Management Basics',
              subtitle: 'Completed with 88% score',
              date: 'Yesterday',
              hours: '1.8 hrs',
            },
            {
              id: 3,
              title: 'Communication Skills',
              subtitle: 'Completed with 92% score',
              date: '3 days ago',
              hours: '3.2 hrs',
            },
          ],
          certificates: [
            {
              id: 1,
              title: 'Data Security Certificate',
              issued: 'Issued Dec 15, 2024',
            },
            {
              id: 2,
              title: 'Project Management Certificate',
              issued: 'Issued Dec 14, 2024',
            },
          ],
          goals: [
            { id: 1, label: 'Complete 15 modules', current: 12, target: 15 },
            { id: 2, label: '30 hours learning', current: 24.5, target: 30 },
          ],
        };
        
        await AsyncStorage.setItem('userLearningData', JSON.stringify(defaultData));
        setUserData(defaultData);
      }
    } catch (error) {
      console.error('Error fetching user learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    // TODO: Implement certificate download functionality
    console.log('Downloading certificate:', certificateId);
  };

  const handleExportData = async () => {
    // TODO: Implement data export functionality
    console.log('Exporting user data');
  };

  const handleSetNewGoal = () => {
    // TODO: Implement set new goal functionality
    console.log('Setting new goal');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to load learning data</Text>
      </View>
    );
  }

  const stats = [
    { 
      id: 1, 
      icon: '📖', 
      value: userData.stats.totalModules.toString(), 
      label: 'Modules', 
      color: '#dbeafe', 
      iconColor: '#2563eb' 
    },
    { 
      id: 2, 
      icon: '⏰', 
      value: userData.stats.totalHours.toString(), 
      label: 'Hours', 
      color: '#dcfce7', 
      iconColor: '#16a34a' 
    },
    { 
      id: 3, 
      icon: '🔥', 
      value: userData.stats.dayStreak.toString(), 
      label: 'Day Streak', 
      color: '#fed7aa', 
      iconColor: '#ea580c' 
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Learning</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>⬇</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Circle */}
        <View style={styles.progressOverview}>
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>{userData.overallProgress}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
          </View>
          <Text style={styles.progressTitle}>
            {userData.overallProgress >= 80 ? 'Outstanding Progress!' : 
             userData.overallProgress >= 50 ? 'Great Progress!' : 
             'Keep Going!'}
          </Text>
          <Text style={styles.progressSubtitle}>
            {userData.overallProgress >= 80 ? "You're almost there!" : 'Keep up the excellent work'}
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <Text style={styles.statIconText}>{stat.icon}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter and Export */}
        <View style={styles.filterSection}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>📅</Text>
            <Text style={styles.filterText}>{selectedPeriod}</Text>
            <Text style={styles.filterChevron}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
            <Text style={styles.exportIcon}>⬇</Text>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {userData.recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {userData.recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityContent}>
                  <View style={styles.activityCheckIcon}>
                    <Text style={styles.activityCheckText}>✓</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                    <View style={styles.activityMeta}>
                      <View style={styles.activityDateBadge}>
                        <Text style={styles.activityDateText}>{activity.date}</Text>
                      </View>
                      <Text style={styles.activityHours}>{activity.hours}</Text>
                    </View>
                  </View>
                </View>
              </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent activity yet</Text>
              <Text style={styles.emptyStateSubtext}>Start learning to see your progress here</Text>
            </View>
          )}
        </View>

        {/* Certificates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificates</Text>
          {userData.certificates.length > 0 ? (
            <View style={styles.certificatesList}>
              {userData.certificates.map((cert) => (
              <View key={cert.id} style={styles.certificateCard}>
                <View style={styles.certificateContent}>
                  <View style={styles.certificateIcon}>
                    <Text style={styles.certificateIconText}>🏆</Text>
                  </View>
                  <View style={styles.certificateInfo}>
                    <Text style={styles.certificateTitle}>{cert.title}</Text>
                  <Text style={styles.certificateIssued}>{cert.issued}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.certificateDownload}
                onPress={() => handleDownloadCertificate(cert.id)}
              >
                <Text style={styles.certificateDownloadIcon}>⬇</Text>
              </TouchableOpacity>
            </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No certificates yet</Text>
              <Text style={styles.emptyStateSubtext}>Complete modules to earn certificates</Text>
            </View>
          )}
        </View>        {/* Goals Panel */}
        <View style={styles.section}>
          <View style={styles.goalsPanel}>
            <View style={styles.goalsPanelHeader}>
              <Text style={styles.goalsPanelTitle}>Training Goals</Text>
              <Text style={styles.goalsPanelIcon}>🎯</Text>
            </View>
            <View style={styles.goalsList}>
              {userData.goals.map((goal) => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalLabel}>{goal.label}</Text>
                    <Text style={styles.goalValue}>
                      {goal.current}/{goal.target}
                    </Text>
                  </View>
                  <View style={styles.goalProgressBar}>
                    <View
                      style={[
                        styles.goalProgress,
                        { width: `${(goal.current / goal.target) * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.setGoalButton} onPress={handleSetNewGoal}>
              <Text style={styles.setGoalButtonText}>Set New Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom Padding for Tab Navigation */}
        <View style={{ height: moderateScale(80) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: moderateScale(16),
    fontSize: moderateScale(16),
    color: '#6b7280',
  },
  errorText: {
    fontSize: moderateScale(16),
    color: '#ef4444',
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(8),
    padding: moderateScale(24),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyStateText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(4),
  },
  emptyStateSubtext: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  headerButton: {
    padding: moderateScale(8),
  },
  headerIcon: {
    fontSize: moderateScale(20),
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  progressOverview: {
    backgroundColor: '#ffffff',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(24),
    alignItems: 'center',
  },
  progressCircleContainer: {
    marginBottom: verticalScale(16),
  },
  progressCircle: {
    width: moderateScale(128),
    height: moderateScale(128),
    borderRadius: moderateScale(64),
    borderWidth: moderateScale(8),
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  progressPercentage: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#111827',
  },
  progressLabel: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  progressTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  progressSubtitle: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: scale(16),
    marginTop: verticalScale(-8),
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  statIconText: {
    fontSize: moderateScale(20),
  },
  statValue: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: '#6b7280',
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    gap: scale(8),
  },
  filterIcon: {
    fontSize: moderateScale(14),
  },
  filterText: {
    fontSize: moderateScale(14),
    color: '#374151',
  },
  filterChevron: {
    fontSize: moderateScale(10),
    color: '#9ca3af',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    gap: scale(8),
  },
  exportIcon: {
    fontSize: moderateScale(14),
    color: '#ffffff',
  },
  exportText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#ffffff',
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
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: moderateScale(16),
  },
  activityContent: {
    flexDirection: 'row',
    gap: scale(12),
  },
  activityCheckIcon: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  activityCheckText: {
    fontSize: moderateScale(14),
    color: '#16a34a',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  activitySubtitle: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    marginBottom: verticalScale(8),
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityDateBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4),
  },
  activityDateText: {
    fontSize: moderateScale(12),
    color: '#374151',
  },
  activityHours: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  certificatesList: {
    gap: verticalScale(12),
  },
  certificateCard: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certificateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(12),
  },
  certificateIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(8),
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificateIconText: {
    fontSize: moderateScale(20),
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  certificateIssued: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  certificateDownload: {
    padding: moderateScale(8),
  },
  certificateDownloadIcon: {
    fontSize: moderateScale(20),
    color: '#6366f1',
  },
  goalsPanel: {
    backgroundColor: '#6366f1',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
  },
  goalsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  goalsPanelTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#ffffff',
  },
  goalsPanelIcon: {
    fontSize: moderateScale(20),
  },
  goalsList: {
    gap: verticalScale(12),
    marginBottom: verticalScale(16),
  },
  goalItem: {
    gap: verticalScale(4),
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(4),
  },
  goalLabel: {
    fontSize: moderateScale(14),
    color: '#ffffff',
  },
  goalValue: {
    fontSize: moderateScale(14),
    color: '#ffffff',
  },
  goalProgressBar: {
    width: '100%',
    height: moderateScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  goalProgress: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(4),
  },
  setGoalButton: {
    backgroundColor: '#ffffff',
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  setGoalButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#6366f1',
  },
});

export default MyLearningScreen;