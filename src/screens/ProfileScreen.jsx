import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data from Supabase
  const fetchUserData = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } else {
        setUserData(data);
        console.log('User data loaded:', data);
      }
    } catch (error) {
      console.error('Exception fetching user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setLogoutModalVisible(false);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userData?.full_name) {
      const names = userData.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return userData.full_name[0].toUpperCase();
    }
    if (userData?.email) {
      return userData.email[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    return userData?.full_name || userData?.email?.split('@')[0] || user?.email?.split('@')[0] || 'User Name';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]} edges={['top']}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>⤴</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#DC2626']}
            tintColor="#DC2626"
          />
        }>
        
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userData?.avatar_url ? (
              <Image 
                source={{ uri: userData.avatar_url }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getUserInitials()}
                </Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {getDisplayName()}
          </Text>
          <Text style={styles.employeeId}>
            {userData?.employee_id || 'EMP-2024-001'}
          </Text>
          <Text style={styles.department}>
            {userData?.department || 'Not Assigned'}
          </Text>
          <Text style={styles.userEmail}>
            {userData?.email || user?.email || 'user@company.com'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.buttonIconLarge}>✏️</Text>
            <Text style={styles.primaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryButtons}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.buttonIconSecondary}>📈</Text>
              <Text style={styles.secondaryButtonText}>My Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.buttonIconSecondary}>⚙️</Text>
              <Text style={styles.secondaryButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionHeaderTitle}>Quick Links</Text>
          <View style={styles.linksContainer}>
            <TouchableOpacity style={styles.linkCard}>
              <View style={styles.linkLeft}>
                <View style={[styles.linkIcon, { backgroundColor: '#E9D5FF' }]}>
                  <Text style={styles.linkEmojiLarge}>🔖</Text>
                </View>
                <View style={styles.linkText}>
                  <Text style={styles.linkTitle}>My Bookmarks</Text>
                  <Text style={styles.linkSubtitle}>8 saved items</Text>
                </View>
              </View>
              <Text style={styles.chevronLarge}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkCard}>
              <View style={styles.linkLeft}>
                <View style={[styles.linkIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.linkEmojiLarge}>💾</Text>
                </View>
                <View style={styles.linkText}>
                  <Text style={styles.linkTitle}>Downloaded Content</Text>
                  <Text style={styles.linkSubtitle}>5 modules offline</Text>
                </View>
              </View>
              <Text style={styles.chevronLarge}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={() => setLogoutModalVisible(true)}>
            <Text style={styles.signOutIconLarge}>🚪</Text>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmButton, { backgroundColor: '#EF4444' }]}
                onPress={handleLogout}>
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerButton: {
    padding: scale(8),
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(24),
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: verticalScale(16),
  },
  avatar: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarImage: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedIcon: {
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerIcon: {
    fontSize: moderateScale(24),
    color: '#1F2937',
    fontWeight: 'bold',
  },
  buttonIconLarge: {
    fontSize: moderateScale(20),
    marginRight: scale(10),
  },
  buttonIconSecondary: {
    fontSize: moderateScale(22),
    marginBottom: verticalScale(4),
  },
  statEmojiLarge: {
    fontSize: moderateScale(32),
  },
  linkEmojiLarge: {
    fontSize: moderateScale(28),
  },
  chevronLarge: {
    fontSize: moderateScale(28),
    color: '#9CA3AF',
    fontWeight: '300',
  },
  signOutIconLarge: {
    fontSize: moderateScale(20),
    marginRight: scale(10),
  },
  userName: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  employeeId: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginBottom: verticalScale(4),
  },
  department: {
    fontSize: moderateScale(14),
    color: '#9CA3AF',
    marginBottom: verticalScale(8),
  },
  userEmail: {
    fontSize: moderateScale(14),
    color: '#DC2626',
  },
  actionSection: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    marginTop: verticalScale(8),
  },
  primaryButton: {
    backgroundColor: '#DC2626',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginLeft: scale(8),
  },
  statsSection: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
  },
  sectionHeaderTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  statValue: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: moderateScale(14),
  },
  linksSection: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
  },
  linksContainer: {
    gap: verticalScale(12),
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: moderateScale(12),
    padding: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  linkText: {
    flex: 1,
  },
  linkTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  linkSubtitle: {
    fontSize: moderateScale(13),
    color: '#9CA3AF',
  },
  signOutSection: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(24),
  },
  signOutButton: {
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },
  bottomSpace: {
    height: verticalScale(20),
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(16),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: scale(24),
    width: '100%',
    maxWidth: scale(400),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  modalMessage: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginBottom: verticalScale(24),
    lineHeight: moderateScale(20),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#374151',
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
});

export default ProfileScreen;
