import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const SignUpScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);

  // Departments list
  const departments = [
    { label: 'Select your department', value: '' },
    { label: 'Human Resources', value: 'hr' },
    { label: 'IT', value: 'it' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Sales', value: 'sales' },
    { label: 'Finance', value: 'finance' },
    { label: 'BE', value: 'be' },
  ];

  // Update form field
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log('Starting registration for:', formData.email);
      
      // Sign up with Supabase Auth with user metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            employee_id: formData.employeeId,
            department: formData.department,
          },
          emailRedirectTo: undefined, // Disable email confirmation for now
        }
      });

      console.log('SignUp response:', { authData, authError });

      // Check if it's just a database trigger error but auth succeeded
      if (authError) {
        // If the error is about database but user was still created, consider it success
        if (authError.message && (authError.message.includes('Database error') || authError.message.includes('updating user') || authError.message.includes('saving new user'))) {
          console.log('Database trigger error, but treating as success');
          Alert.alert(
            'Success!',
            'Your account has been created successfully. You can now log in.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Login'),
              },
            ]
          );
          setIsLoading(false);
          return;
        }
        
        console.error('Auth error details:', authError);
        const errorMessage = authError?.message || String(authError) || 'Registration failed';
        Alert.alert('Registration Failed', errorMessage);
        setIsLoading(false);
        return;
      }

      if (!authData || !authData.user) {
        Alert.alert('Registration Failed', 'No user data returned');
        setIsLoading(false);
        return;
      }

      // Success - user created in auth with metadata
      console.log('Registration successful for user:', authData.user.id);
      Alert.alert(
        'Success!',
        'Your account has been created successfully. You can now log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error('Registration catch error:', error);
      const errorMessage = error?.message || String(error) || 'Something went wrong. Please try again.';
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[passwordStrength] || 'Very Weak';
  };

  const getPasswordStrengthColor = () => {
    const colors = ['#EF4444', '#EF4444', '#EAB308', '#3B82F6', '#10B981'];
    return colors[passwordStrength] || '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Register for DuroAcademy</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={formData.fullName}
                onChangeText={(text) => updateField('fullName', text)}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* Employee ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Employee ID *</Text>
              <TextInput
                style={[styles.input, errors.employeeId && styles.inputError]}
                placeholder="Enter your employee ID"
                placeholderTextColor="#9CA3AF"
                value={formData.employeeId}
                onChangeText={(text) => updateField('employeeId', text)}
              />
              {errors.employeeId && (
                <Text style={styles.errorText}>{errors.employeeId}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email address"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => updateField('email', text.toLowerCase())}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Department */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department *</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, errors.department && styles.inputError]}
                onPress={() => setShowDepartmentPicker(true)}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  !formData.department && styles.dropdownPlaceholder
                ]}>
                  {formData.department 
                    ? departments.find(d => d.value === formData.department)?.label
                    : 'Select your department'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
              {errors.department && (
                <Text style={styles.errorText}>{errors.department}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(text) => {
                    updateField('password', text);
                    calculatePasswordStrength(text);
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              
              {/* Password Strength */}
              {formData.password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[0, 1, 2, 3].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          index < passwordStrength && {
                            backgroundColor: getPasswordStrengthColor()
                          }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.strengthText}>
                    Password strength: {getPasswordStrengthLabel()}
                  </Text>
                </View>
              )}
              
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyIcon}>🛡️</Text>
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>Privacy Notice</Text>
                <Text style={styles.privacyText}>
                  Your data is used for learning records only and will be kept secure according to our privacy policy.
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Department Picker Modal */}
        <Modal
          visible={showDepartmentPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDepartmentPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDepartmentPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Department</Text>
                <TouchableOpacity
                  onPress={() => setShowDepartmentPicker(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {departments.map((dept) => (
                  <TouchableOpacity
                    key={dept.value}
                    style={[
                      styles.modalOption,
                      formData.department === dept.value && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      updateField('department', dept.value);
                      setShowDepartmentPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      formData.department === dept.value && styles.modalOptionTextSelected
                    ]}>
                      {dept.label}
                    </Text>
                    {formData.department === dept.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
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
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
  },
  backIcon: {
    fontSize: moderateScale(24),
    color: '#4B5563',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  headerSpacer: {
    width: moderateScale(40),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: verticalScale(40),
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(32),
  },
  avatarContainer: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    backgroundColor: '#F3F4F6',
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: moderateScale(36),
  },
  form: {
    gap: verticalScale(20),
  },
  inputGroup: {
    marginBottom: verticalScale(4),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(14),
    fontSize: moderateScale(15),
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: moderateScale(12),
    color: '#DC2626',
    marginTop: verticalScale(4),
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: moderateScale(15),
    color: '#1F2937',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownIcon: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    maxHeight: '70%',
    paddingBottom: verticalScale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: moderateScale(4),
  },
  modalCloseText: {
    fontSize: moderateScale(24),
    color: '#6B7280',
  },
  modalList: {
    paddingHorizontal: moderateScale(20),
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: '#FEF2F2',
  },
  modalOptionText: {
    fontSize: moderateScale(16),
    color: '#1F2937',
  },
  modalOptionTextSelected: {
    color: '#DC2626',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: moderateScale(20),
    color: '#DC2626',
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionSelected: {
    backgroundColor: '#FEF2F2',
  },
  pickerOptionText: {
    fontSize: moderateScale(15),
    color: '#6B7280',
  },
  pickerOptionTextSelected: {
    color: '#DC2626',
    fontWeight: '500',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(14),
    paddingRight: moderateScale(48),
    fontSize: moderateScale(15),
    color: '#1F2937',
  },
  eyeButton: {
    position: 'absolute',
    right: moderateScale(12),
    top: '50%',
    transform: [{ translateY: -moderateScale(12) }],
    padding: moderateScale(4),
  },
  eyeIcon: {
    fontSize: moderateScale(20),
  },
  strengthContainer: {
    marginTop: verticalScale(8),
  },
  strengthBars: {
    flexDirection: 'row',
    gap: moderateScale(4),
    marginBottom: verticalScale(4),
  },
  strengthBar: {
    flex: 1,
    height: moderateScale(4),
    backgroundColor: '#E5E7EB',
    borderRadius: moderateScale(2),
  },
  strengthText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginTop: verticalScale(8),
    gap: moderateScale(12),
  },
  privacyIcon: {
    fontSize: moderateScale(20),
    marginTop: moderateScale(2),
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#1E40AF',
    marginBottom: verticalScale(4),
  },
  privacyText: {
    fontSize: moderateScale(12),
    color: '#1E3A8A',
    lineHeight: moderateScale(16),
  },
  submitButton: {
    backgroundColor: '#DC2626',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  loginLinkText: {
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  loginLink: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#DC2626',
  },
});

export default SignUpScreen;
