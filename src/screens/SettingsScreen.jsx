import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  
  // State for toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [marketingUpdates, setMarketingUpdates] = useState(true);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [captionsDefault, setCaptionsDefault] = useState(false);
  
  // Modal states
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await signOut();
  };

  const SettingItem = ({ icon, iconBg, title, subtitle, onPress, rightComponent, noBorder }) => (
    <TouchableOpacity
      style={[styles.settingItem, noBorder && styles.noBorder]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {rightComponent || (
        onPress && <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, isDanger }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, isDanger && styles.dangerText]}>
        {title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.headerIcon}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <SectionHeader title="ACCOUNT" />
          
          <View style={styles.sectionContent}>
            <SettingItem
              icon="🔑"
              iconBg="#DBEAFE"
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => navigation.navigate('ChangePassword')}
            />
            
            <SettingItem
              icon="📱"
              iconBg="#D1FAE5"
              title="Manage Devices"
              subtitle="View and remove connected devices"
              onPress={() => {/* Navigate to manage devices */}}
              noBorder
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <SectionHeader title="NOTIFICATIONS" />
          
          <View style={styles.sectionContent}>
            <SettingItem
              icon="🔔"
              iconBg="#E9D5FF"
              title="Push Notifications"
              subtitle="Receive app notifications"
              rightComponent={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            
            <SettingItem
              icon="✉️"
              iconBg="#FED7AA"
              title="Email Notifications"
              subtitle="Receive email updates"
              rightComponent={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            
            <SettingItem
              icon="📢"
              iconBg="#FBCFE8"
              title="Marketing Updates"
              subtitle="Promotional content and offers"
              rightComponent={
                <Switch
                  value={marketingUpdates}
                  onValueChange={setMarketingUpdates}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              }
              noBorder
            />
          </View>
        </View>

        {/* Playback Section */}
        <View style={styles.section}>
          <SectionHeader title="PLAYBACK" />
          
          <View style={styles.sectionContent}>
            <SettingItem
              icon="▶️"
              iconBg="#E0E7FF"
              title="Autoplay Next"
              subtitle="Automatically play next episode"
              rightComponent={
                <Switch
                  value={autoplayNext}
                  onValueChange={setAutoplayNext}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            
            <SettingItem
              icon="⚡"
              iconBg="#CCFBF1"
              title="Default Speed"
              subtitle="Set preferred playback speed"
              onPress={() => {/* Navigate to speed settings */}}
              rightComponent={
                <View style={styles.rightValue}>
                  <Text style={styles.rightValueText}>1.0x</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              }
              noBorder
            />
          </View>
        </View>

        {/* Downloads Section */}
        <View style={styles.section}>
          <SectionHeader title="DOWNLOADS" />
          
          <View style={styles.sectionContent}>
            <SettingItem
              icon="💾"
              iconBg="#CFFAFE"
              title="Manage Offline Files"
              subtitle="View and delete downloaded content"
              onPress={() => {/* Navigate to downloads */}}
              rightComponent={
                <View style={styles.rightValue}>
                  <Text style={styles.rightValueText}>2.1 GB</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              }
              noBorder
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={[styles.section, styles.dangerSection]}>
          <View style={styles.sectionContent}>
            <View style={[styles.dangerItem, styles.noBorder]}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setLogoutModalVisible(true)}>
                <Text style={styles.logoutButtonText}>🚪  Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIcon, { backgroundColor: '#F3F4F6' }]}>
              <Text style={styles.modalIconText}>🚪</Text>
            </View>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: '#3B82F6' }]}
                onPress={handleLogout}>
                <Text style={styles.modalConfirmText}>Logout</Text>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    padding: scale(8),
  },
  headerIcon: {
    fontSize: moderateScale(22),
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: scale(40),
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dangerSection: {
    marginTop: verticalScale(16),
  },
  sectionHeader: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  sectionHeaderText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0.5,
  },
  dangerText: {
    color: '#DC2626',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  iconText: {
    fontSize: moderateScale(18),
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  settingSubtitle: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  chevron: {
    fontSize: moderateScale(20),
    color: '#9CA3AF',
    marginLeft: scale(8),
  },
  rightValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightValueText: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginRight: scale(4),
  },
  dangerItem: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  logoutButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
  },
  bottomSpace: {
    height: verticalScale(32),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(16),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: scale(24),
    width: '100%',
    maxWidth: scale(340),
    alignItems: 'center',
  },
  modalIcon: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  modalIconText: {
    fontSize: moderateScale(32),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: verticalScale(24),
    lineHeight: moderateScale(20),
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(12),
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SettingsScreen;
