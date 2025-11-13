import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation states
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [validationRules, setValidationRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    special: false,
  });
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isSigningOutDevices, setIsSigningOutDevices] = useState(false);

  // Password strength checker
  useEffect(() => {
    if (newPassword.length > 0) {
      const rules = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        numbers: /\d/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      };
      
      setValidationRules(rules);
      
      const score = Object.values(rules).filter(Boolean).length;
      setPasswordStrength(score);
    } else {
      setPasswordStrength(0);
      setValidationRules({
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        special: false,
      });
    }
  }, [newPassword]);

  // Password match checker
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(false);
    }
  }, [newPassword, confirmPassword]);

  const getStrengthInfo = () => {
    if (passwordStrength < 2) {
      return { text: 'Weak', color: '#DC2626', width: '25%' };
    } else if (passwordStrength < 4) {
      return { text: 'Fair', color: '#F59E0B', width: '50%' };
    } else if (passwordStrength < 5) {
      return { text: 'Good', color: '#3B82F6', width: '75%' };
    } else {
      return { text: 'Strong', color: '#10B981', width: '100%' };
    }
  };

  const isFormValid = () => {
    return (
      currentPassword.length > 0 &&
      newPassword.length > 0 &&
      confirmPassword.length > 0 &&
      passwordStrength >= 3 &&
      passwordsMatch
    );
  };

  const handleChangePassword = async () => {
    if (!isFormValid()) {
      Alert.alert('Error', 'Please fill all fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      // Import supabase
      const { supabase } = require('../config/supabaseClient');

      // Update password in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      // Show success modal
      setSuccessModalVisible(true);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOutOtherDevices = async () => {
    setIsSigningOutDevices(true);

    try {
      const { supabase } = require('../config/supabaseClient');
      
      // Sign out from all sessions except current
      await supabase.auth.refreshSession();
      
      setTimeout(() => {
        setIsSigningOutDevices(false);
        Alert.alert('Success', 'All other devices have been signed out');
      }, 1500);
      
    } catch (error) {
      console.error('Sign out devices error:', error);
      setIsSigningOutDevices(false);
      Alert.alert('Error', 'Failed to sign out other devices');
    }
  };

  const handleContinue = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  const strengthInfo = getStrengthInfo();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Security Notice</Text>
            <Text style={styles.noticeText}>
              Choose a strong password to protect your account
            </Text>
          </View>
        </View>

        {/* Current Password Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Text style={styles.eyeIcon}>
                {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}>
              <Text style={styles.eyeIcon}>
                {showNewPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthHeader}>
                <Text style={styles.strengthLabel}>Password Strength</Text>
                <Text style={[styles.strengthText, { color: strengthInfo.color }]}>
                  {strengthInfo.text}
                </Text>
              </View>
              <View style={styles.strengthBarBackground}>
                <View
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor: strengthInfo.color,
                      width: strengthInfo.width,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Confirm Password Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text style={styles.eyeIcon}>
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Password Match Indicator */}
          {confirmPassword.length > 0 && (
            <View style={styles.matchContainer}>
              <Text style={styles.matchIcon}>
                {passwordsMatch ? '✓' : '✕'}
              </Text>
              <Text
                style={[
                  styles.matchText,
                  { color: passwordsMatch ? '#10B981' : '#DC2626' },
                ]}>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          )}
        </View>

        {/* Password Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipsTitle}>Password Tips</Text>
          </View>

          <View style={styles.tipsContent}>
            <View style={styles.tipItem}>
              <Text
                style={[
                  styles.tipBullet,
                  validationRules.length && styles.tipBulletActive,
                ]}>
                {validationRules.length ? '✓' : '●'}
              </Text>
              <Text style={styles.tipText}>At least 8 characters long</Text>
            </View>

            <View style={styles.tipItem}>
              <Text
                style={[
                  styles.tipBullet,
                  validationRules.uppercase && styles.tipBulletActive,
                ]}>
                {validationRules.uppercase ? '✓' : '●'}
              </Text>
              <Text style={styles.tipText}>Contains uppercase letters</Text>
            </View>

            <View style={styles.tipItem}>
              <Text
                style={[
                  styles.tipBullet,
                  validationRules.lowercase && styles.tipBulletActive,
                ]}>
                {validationRules.lowercase ? '✓' : '●'}
              </Text>
              <Text style={styles.tipText}>Contains lowercase letters</Text>
            </View>

            <View style={styles.tipItem}>
              <Text
                style={[
                  styles.tipBullet,
                  validationRules.numbers && styles.tipBulletActive,
                ]}>
                {validationRules.numbers ? '✓' : '●'}
              </Text>
              <Text style={styles.tipText}>Contains numbers</Text>
            </View>

            <View style={styles.tipItem}>
              <Text
                style={[
                  styles.tipBullet,
                  validationRules.special && styles.tipBulletActive,
                ]}>
                {validationRules.special ? '✓' : '●'}
              </Text>
              <Text style={styles.tipText}>Contains special characters (!@#$%)</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isFormValid() && styles.submitButtonActive,
          ]}
          onPress={handleChangePassword}
          disabled={!isFormValid() || isSubmitting}>
          {isSubmitting ? (
            <View style={styles.submitButtonContent}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.submitButtonText}>Changing Password...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>

            <Text style={styles.successTitle}>Password Changed Successfully</Text>
            <Text style={styles.successMessage}>
              Your password has been updated securely
            </Text>

            {/* Security Option */}
            <View style={styles.securityOption}>
              <Text style={styles.securityOptionIcon}>🛡️</Text>
              <View style={styles.securityOptionContent}>
                <Text style={styles.securityOptionTitle}>Enhanced Security</Text>
                <Text style={styles.securityOptionText}>
                  For your protection, we recommend signing out all other devices
                </Text>
                <TouchableOpacity
                  style={[
                    styles.signOutDevicesButton,
                    isSigningOutDevices && styles.signOutDevicesButtonActive,
                  ]}
                  onPress={handleSignOutOtherDevices}
                  disabled={isSigningOutDevices}>
                  {isSigningOutDevices ? (
                    <View style={styles.signOutDevicesButtonContent}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.signOutDevicesButtonText}>
                        Signing Out...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.signOutDevicesButtonText}>
                      Sign Out Other Devices
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: scale(8),
    marginLeft: scale(-8),
  },
  closeIcon: {
    fontSize: moderateScale(20),
    color: '#374151',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: scale(32),
  },
  scrollView: {
    flex: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  noticeIcon: {
    fontSize: moderateScale(18),
    marginRight: scale(12),
    marginTop: verticalScale(2),
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: verticalScale(4),
  },
  noticeText: {
    fontSize: moderateScale(12),
    color: '#1E40AF',
    lineHeight: moderateScale(16),
  },
  fieldContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    paddingRight: scale(40),
    fontSize: moderateScale(14),
    color: '#111827',
  },
  eyeButton: {
    position: 'absolute',
    right: scale(12),
    top: '50%',
    transform: [{ translateY: -moderateScale(12) }],
  },
  eyeIcon: {
    fontSize: moderateScale(18),
  },
  strengthContainer: {
    marginTop: verticalScale(12),
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  strengthLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#374151',
  },
  strengthText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  strengthBarBackground: {
    width: '100%',
    height: verticalScale(6),
    backgroundColor: '#E5E7EB',
    borderRadius: moderateScale(3),
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: moderateScale(3),
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  matchIcon: {
    fontSize: moderateScale(14),
    marginRight: scale(6),
  },
  matchText: {
    fontSize: moderateScale(12),
  },
  tipsSection: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tipIcon: {
    fontSize: moderateScale(16),
    marginRight: scale(8),
  },
  tipsTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
  },
  tipsContent: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
  },
  tipBullet: {
    fontSize: moderateScale(12),
    color: '#D1D5DB',
    marginRight: scale(8),
    marginTop: verticalScale(2),
  },
  tipBulletActive: {
    color: '#10B981',
  },
  tipText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    flex: 1,
    lineHeight: moderateScale(16),
  },
  bottomSpace: {
    height: verticalScale(80),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  submitButton: {
    backgroundColor: '#9CA3AF',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#3B82F6',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: scale(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(32),
    width: '100%',
    maxWidth: scale(400),
  },
  successIconContainer: {
    width: scale(64),
    height: scale(64),
    backgroundColor: '#D1FAE5',
    borderRadius: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: verticalScale(16),
  },
  successIcon: {
    fontSize: moderateScale(32),
    color: '#10B981',
  },
  successTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  successMessage: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  securityOption: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: moderateScale(10),
    padding: scale(16),
    marginBottom: verticalScale(24),
  },
  securityOptionIcon: {
    fontSize: moderateScale(18),
    marginRight: scale(12),
    marginTop: verticalScale(2),
  },
  securityOptionContent: {
    flex: 1,
  },
  securityOptionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#92400E',
    marginBottom: verticalScale(4),
  },
  securityOptionText: {
    fontSize: moderateScale(12),
    color: '#B45309',
    lineHeight: moderateScale(16),
    marginBottom: verticalScale(12),
  },
  signOutDevicesButton: {
    backgroundColor: '#D97706',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(6),
    alignSelf: 'flex-start',
  },
  signOutDevicesButtonActive: {
    backgroundColor: '#10B981',
  },
  signOutDevicesButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutDevicesButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: scale(4),
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ChangePasswordScreen;
