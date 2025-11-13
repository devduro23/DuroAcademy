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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const EditProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState({
    displayName: '',
    department: '',
  });

  const departments = [
    { label: 'Select Department', value: '' },
    { label: 'Leadership', value: 'Leadership' },
    { label: 'Administration', value: 'Administration' },
    { label: 'Finance and Accounts', value: 'Finance and Accounts' },
    { label: 'Information Technology', value: 'Information Technology' },
    { label: 'Operations', value: 'Operations' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Legal & Secretarial', value: 'Legal & Secretarial' },
    { label: 'Branch Accounts', value: 'Branch Accounts' },
    { label: 'General Management', value: 'General Management' },
    { label: 'Human Resource', value: 'Human Resource' },
    { label: 'Sales & Marketing', value: 'Sales & Marketing' },
    { label: 'Managing Information systems (MIS)', value: 'Managing Information systems (MIS)' },
    { label: 'Business Excellence', value: 'Business Excellence' },
    { label: 'Warehouse & Logistics Management', value: 'Warehouse & Logistics Management' },
    { label: 'Manufacturing', value: 'Manufacturing' },
    { label: 'Purchase', value: 'Purchase' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Finishing-Commercial', value: 'Finishing-Commercial' },
  ];

  // Fetch user data from Supabase
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email, employee_id, department, phone')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setDisplayName(data.full_name || '');
        setEmail(data.email || '');
        setEmployeeId(data.employee_id || '');
        setDepartment(data.department || '');
        // Set phone with +91 prefix if it doesn't already have a country code
        const phoneValue = data.phone || '';
        if (phoneValue && !phoneValue.startsWith('+')) {
          setPhone('+91 ' + phoneValue);
        } else {
          setPhone(phoneValue);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      displayName: '',
      department: '',
    };

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
      isValid = false;
    }

    if (!department) {
      newErrors.department = 'Please select a department';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: displayName.trim(),
          department: department,
          phone: phone.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>
          </View>

          {/* Display Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.displayName && styles.inputError,
              ]}
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                if (errors.displayName) {
                  setErrors({ ...errors, displayName: '' });
                }
              }}
              placeholder="Enter your display name"
              placeholderTextColor="#9CA3AF"
            />
            {errors.displayName ? (
              <Text style={styles.errorText}>{errors.displayName}</Text>
            ) : null}
          </View>

          {/* Department Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Department</Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                errors.department && styles.inputError,
              ]}
              onPress={() => setShowDepartmentPicker(!showDepartmentPicker)}>
              <Text
                style={[
                  styles.pickerButtonText,
                  !department && styles.pickerPlaceholder,
                ]}>
                {department || 'Select Department'}
              </Text>
              <Text style={styles.chevron}>
                {showDepartmentPicker ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {errors.department ? (
              <Text style={styles.errorText}>{errors.department}</Text>
            ) : null}

            {/* Department Picker Dropdown */}
            {showDepartmentPicker && (
              <View style={styles.pickerDropdown}>
                {departments.map((dept, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerOption,
                      department === dept.value && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setDepartment(dept.value);
                      setShowDepartmentPicker(false);
                      if (errors.department) {
                        setErrors({ ...errors, department: '' });
                      }
                    }}>
                    <Text
                      style={[
                        styles.pickerOptionText,
                        department === dept.value && styles.pickerOptionTextSelected,
                      ]}>
                      {dept.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Phone Field */}
          <View style={[styles.fieldContainer, styles.noBorder]}>
            <Text style={styles.label}>
              Phone Number{' '}
              <Text style={styles.optionalLabel}>(Optional)</Text>
            </Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phone.replace('+91 ', '').replace('+91', '')}
                onChangeText={(text) => {
                  // Remove any non-numeric characters except spaces
                  const cleaned = text.replace(/[^\d\s]/g, '');
                  setPhone('+91 ' + cleaned);
                }}
                placeholder="98765 43210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>
        </View>

        {/* HR Verification Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HR VERIFICATION REQUIRED</Text>
          </View>

          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.infoContainer}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>Changes will be verified by HR</Text>
            </View>
          </View>

          {/* Employee ID Field */}
          <View style={[styles.fieldContainer, styles.noBorder]}>
            <Text style={styles.label}>Employee ID</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={employeeId}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.infoContainerWithBadge}>
              <View style={styles.infoContainer}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>Changes will be verified by HR</Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingIcon}>🕒</Text>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={isSaving}>
          {isSaving ? (
            <View style={styles.submitButtonContent}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.submitButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: scale(8),
    marginLeft: scale(-8),
  },
  backIcon: {
    fontSize: moderateScale(18),
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
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: verticalScale(1),
  },
  sectionHeader: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: moderateScale(11),
    color: '#6B7280',
    marginTop: verticalScale(4),
  },
  fieldContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  optionalLabel: {
    fontSize: moderateScale(12),
    fontWeight: '400',
    color: '#9CA3AF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  errorText: {
    fontSize: moderateScale(12),
    color: '#EF4444',
    marginTop: verticalScale(6),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    overflow: 'hidden',
  },
  countryCodeContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryCodeText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#111827',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
  },
  pickerButtonText: {
    fontSize: moderateScale(14),
    color: '#111827',
  },
  pickerPlaceholder: {
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: moderateScale(12),
    color: '#9CA3AF',
  },
  pickerDropdown: {
    marginTop: verticalScale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerOptionText: {
    fontSize: moderateScale(14),
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: verticalScale(8),
  },
  infoIcon: {
    fontSize: moderateScale(14),
    marginRight: scale(6),
    marginTop: verticalScale(1),
  },
  infoText: {
    fontSize: moderateScale(12),
    color: '#D97706',
    flex: 1,
  },
  infoContainerWithBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  pendingIcon: {
    fontSize: moderateScale(10),
    marginRight: scale(4),
  },
  pendingText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#92400E',
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
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
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
});

export default EditProfileScreen;
