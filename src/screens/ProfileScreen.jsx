import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Responsive helper functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const ProfileScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const storedProfile = await AsyncStorage.getItem('userProfile');
      
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // Initialize with default profile data
        const defaultProfile = {
          name: 'Dev Dixit',
          employeeId: 'EMP-2024-001',
          department: 'Marketing Department',
          email: 'dev.dixit@duro.com',
          isVerified: true,
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
          achievements: [
            { id: 1, name: 'Top Learner', icon: '🏆', color: '#fef3c7', iconColor: '#f59e0b' },
            { id: 2, name: 'Quick Start', icon: '🥇', color: '#dbeafe', iconColor: '#3b82f6' },
            { id: 3, name: 'Consistent', icon: '⭐', color: '#dcfce7', iconColor: '#10b981' },
            { id: 4, name: 'Certified', icon: '📜', color: '#e9d5ff', iconColor: '#a855f7' },
          ],
          stats: {
            modulesCompleted: 12,
            hoursWatched: 24.5,
            quizzesTaken: 28,
          },
          quickLinks: [
            { id: 1, title: 'My Bookmarks', subtitle: '8 saved items', icon: '🔖', color: '#e9d5ff', iconColor: '#a855f7' },
            { id: 2, title: 'Downloaded Content', subtitle: '5 modules offline', icon: '⬇️', color: '#dcfce7', iconColor: '#10b981' },
          ],
        };
        
        await AsyncStorage.setItem('userProfile', JSON.stringify(defaultProfile));
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLogoutModalVisible(false);
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleEditProfile = () => {
    setEditModalVisible(false);
    // TODO: Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
  };

  const handleMyProgress = () => {
    // Navigate to My Learning tab
    navigation.navigate('MyLearning');
  };

  const handleSettings = () => {
    // TODO: Navigate to settings screen
    Alert.alert('Settings', 'Settings functionality coming soon!');
  };

  const handleBookmarks = () => {
    // TODO: Navigate to bookmarks screen
    Alert.alert('My Bookmarks', 'Bookmarks functionality coming soon!');
  };

  const handleDownloads = () => {
    // TODO: Navigate to downloads screen
    Alert.alert('Downloaded Content', 'Downloads functionality coming soon!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to load profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>↗️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.name.split(' ')[0].charAt(0).toUpperCase()}
              </Text>
            </View>
            {userProfile.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.employeeId}>{userProfile.employeeId}</Text>
          <Text style={styles.department}>{userProfile.department}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>
        </View>

        {/* Achievement Badges */}
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>Recent Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsList}>
            {userProfile.achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                  <Text style={styles.achievementIconText}>{achievement.icon}</Text>
                </View>
                <Text style={styles.achievementName}>{achievement.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.editIcon}>✏️</Text>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <View style={styles.gridButtons}>
            <TouchableOpacity style={styles.gridButton} onPress={handleMyProgress}>
              <Text style={styles.gridButtonIcon}>📈</Text>
              <Text style={styles.gridButtonText}>My Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridButton} onPress={handleSettings}>
              <Text style={styles.gridButtonIcon}>⚙️</Text>
              <Text style={styles.gridButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                <Text style={styles.statIconText}>📖</Text>
              </View>
              <Text style={styles.statValue}>{userProfile.stats.modulesCompleted}</Text>
              <Text style={styles.statLabel}>Modules Completed</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                <Text style={styles.statIconText}>⏰</Text>
              </View>
              <Text style={styles.statValue}>{userProfile.stats.hoursWatched}</Text>
              <Text style={styles.statLabel}>Hours Watched</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#fed7aa' }]}>
                <Text style={styles.statIconText}>❓</Text>
              </View>
              <Text style={styles.statValue}>{userProfile.stats.quizzesTaken}</Text>
              <Text style={styles.statLabel}>Quizzes Taken</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinks}>
            <TouchableOpacity style={styles.quickLinkItem} onPress={handleBookmarks}>
              <View style={styles.quickLinkLeft}>
                <View style={[styles.quickLinkIcon, { backgroundColor: '#e9d5ff' }]}>
                  <Text style={styles.quickLinkIconText}>🔖</Text>
                </View>
                <View style={styles.quickLinkInfo}>
                  <Text style={styles.quickLinkTitle}>My Bookmarks</Text>
                  <Text style={styles.quickLinkSubtitle}>8 saved items</Text>
                </View>
              </View>
              <Text style={styles.quickLinkChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickLinkItem} onPress={handleDownloads}>
              <View style={styles.quickLinkLeft}>
                <View style={[styles.quickLinkIcon, { backgroundColor: '#dcfce7' }]}>
                  <Text style={styles.quickLinkIconText}>⬇️</Text>
                </View>
                <View style={styles.quickLinkInfo}>
                  <Text style={styles.quickLinkTitle}>Downloaded Content</Text>
                  <Text style={styles.quickLinkSubtitle}>5 modules offline</Text>
                </View>
              </View>
              <Text style={styles.quickLinkChevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={() => setLogoutModalVisible(true)}
          >
            <Text style={styles.signOutIcon}>🚪</Text>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding for Tab Navigation */}
        <View style={{ height: moderateScale(80) }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to edit your profile information?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleEditProfile}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalLogoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.modalLogoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  profileSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(24),
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: verticalScale(16),
  },
  avatar: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: moderateScale(40),
    fontWeight: '700',
    color: '#ffffff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: moderateScale(-4),
    right: moderateScale(-4),
    width: moderateScale(32),
    height: moderateScale(32),
    backgroundColor: '#10b981',
    borderRadius: moderateScale(16),
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: moderateScale(14),
    color: '#ffffff',
  },
  userName: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  employeeId: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    marginBottom: verticalScale(4),
  },
  department: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    marginBottom: verticalScale(8),
  },
  email: {
    fontSize: moderateScale(14),
    color: '#6366f1',
  },
  achievementsSection: {
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
  achievementsTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  achievementsList: {
    flexDirection: 'row',
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: scale(12),
  },
  achievementIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  achievementIconText: {
    fontSize: moderateScale(24),
  },
  achievementName: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    textAlign: 'center',
  },
  actionButtons: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    gap: verticalScale(12),
  },
  editButton: {
    backgroundColor: '#6366f1',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
  },
  editIcon: {
    fontSize: moderateScale(16),
    color: '#ffffff',
  },
  editButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#ffffff',
  },
  gridButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  gridButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
  },
  gridButtonIcon: {
    fontSize: moderateScale(16),
  },
  gridButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#374151',
  },
  section: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: moderateScale(16),
    flexDirection: 'row',
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
    textAlign: 'center',
  },
  quickLinks: {
    gap: verticalScale(12),
  },
  quickLinkItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(12),
  },
  quickLinkIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkIconText: {
    fontSize: moderateScale(20),
  },
  quickLinkInfo: {
    flex: 1,
  },
  quickLinkTitle: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  quickLinkSubtitle: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  quickLinkChevron: {
    fontSize: moderateScale(24),
    color: '#9ca3af',
  },
  signOutSection: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(24),
  },
  signOutButton: {
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
    backgroundColor: '#ffffff',
  },
  signOutIcon: {
    fontSize: moderateScale(16),
  },
  signOutText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#ef4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(16),
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(8),
    width: '100%',
    maxWidth: scale(350),
    padding: moderateScale(24),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  modalMessage: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    marginBottom: verticalScale(24),
    lineHeight: moderateScale(20),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(8),
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#374151',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(8),
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#ffffff',
  },
  modalLogoutButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(8),
    alignItems: 'center',
  },
  modalLogoutText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default ProfileScreen;