import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 320) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 568) * size;

// Device detection
const isTablet = width > 768;
const isSmallScreen = width < 400;

const ForgotPasswordScreen = ({ navigation }) => {
  const { resetPassword } = useAuth();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  // Screen data for responsive calculations
  const [screenData, setScreenData] = useState({
    width,
    height,
    isTablet,
    isSmallScreen,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData({
        width: window.width,
        height: window.height,
        isTablet: window.width > 768,
        isSmallScreen: window.width < 400,
      });
    });

    return () => subscription?.remove();
  }, []);

  // Calculate responsive card width
  const cardWidth = useMemo(() => {
    if (screenData.isTablet) {
      return Math.min(screenData.width * 0.5, 400);
    }
    return screenData.width - scale(32);
  }, [screenData]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (currentStep === 2 && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, timeRemaining]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Email validation
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const employeeIdRegex = /^[A-Z]{2,}\d{3,}$/i;
    return emailRegex.test(email) || employeeIdRegex.test(email);
  }, []);

  // Password strength calculation
  const getPasswordStrength = useCallback((password) => {
    let strength = 0;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    };

    Object.values(requirements).forEach((met) => {
      if (met) strength++;
    });

    return { strength, requirements };
  }, []);

  // Password strength info
  const passwordStrengthInfo = useMemo(() => {
    const { strength, requirements } = getPasswordStrength(newPassword);
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const widths = [25, 50, 75, 100];

    return {
      color: colors[strength] || colors[0],
      label: labels[strength] || labels[0],
      width: widths[strength] || widths[0],
      requirements,
    };
  }, [newPassword, getPasswordStrength]);

  // Navigation handlers
  const handleBackToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  // Step 1: Send reset link
  const handleSendResetLink = useCallback(async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email or employee ID');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email or employee ID');
      return;
    }

    setEmailError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Animate transition
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(2);
        setTimeRemaining(120);
        setCanResend(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail, fadeAnim]);

  // Step 2: Verify OTP
  const handleVerifyOTP = useCallback(async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    setOtpError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Animate transition
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(3);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      setOtpError('Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [otp, fadeAnim]);

  // Step 3: Reset password
  const handleResetPassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const { requirements } = getPasswordStrength(newPassword);
    if (!requirements.length || !requirements.uppercase || !requirements.number) {
      setPasswordError('Password does not meet requirements');
      return;
    }

    setPasswordError('');
    setIsLoading(true);

    try {
      const result = await resetPassword(email, newPassword);
      
      if (result.success) {
        Alert.alert(
          'Success!',
          'Your password has been reset successfully. You can now login with your new password.',
          [
            {
              text: 'Back to Login',
              onPress: handleBackToLogin,
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [newPassword, confirmPassword, getPasswordStrength, handleBackToLogin, email, resetPassword]);

  // Resend OTP
  const handleResendOTP = useCallback(() => {
    setTimeRemaining(120);
    setCanResend(false);
    setOtpError('');
    Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
  }, []);

  // OTP input handler
  const handleOTPChange = useCallback((value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
  }, [otp]);

  // Render Step 1: Email Input
  const renderStep1 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={[styles.header, { marginBottom: verticalScale(32) }]}>
        <View style={[
          styles.iconContainer,
          {
            width: scale(64),
            height: scale(64),
            borderRadius: scale(32),
            marginBottom: verticalScale(16),
          }
        ]}>
          <Text style={[styles.icon, { fontSize: moderateScale(24) }]}>🔒</Text>
        </View>
        <Text style={[styles.title, { fontSize: moderateScale(24) }]}>Forgot Password?</Text>
        <Text style={[styles.subtitle, { fontSize: moderateScale(14) }]}>
          Enter your email or employee ID to reset your password
        </Text>
      </View>

      <View style={[styles.form, { gap: verticalScale(24) }]}>
        <View>
          <Text style={[styles.label, { fontSize: moderateScale(14) }]}>
            Email or Employee ID
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                paddingHorizontal: scale(16),
                paddingVertical: verticalScale(12),
                fontSize: moderateScale(16),
                borderRadius: scale(12),
              },
              emailError && styles.inputError
            ]}
            placeholder="Enter your email or employee ID"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError ? (
            <Text style={[styles.errorText, { fontSize: moderateScale(12) }]}>
              ⚠️ {emailError}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              paddingVertical: verticalScale(12),
              borderRadius: scale(12),
            },
            isLoading && styles.disabledButton
          ]}
          onPress={handleSendResetLink}
          disabled={isLoading}
        >
          <Text style={[styles.primaryButtonText, { fontSize: moderateScale(16) }]}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.backButton, { marginTop: verticalScale(24) }]}
        onPress={handleBackToLogin}
      >
        <Text style={[styles.backButtonText, { fontSize: moderateScale(14) }]}>
          ← Back to Login
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render Step 2: OTP Verification
  const renderStep2 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={[styles.header, { marginBottom: verticalScale(32) }]}>
        <View style={[
          styles.iconContainer,
          {
            width: scale(64),
            height: scale(64),
            borderRadius: scale(32),
            marginBottom: verticalScale(16),
          }
        ]}>
          <Text style={[styles.icon, { fontSize: moderateScale(24) }]}>🛡️</Text>
        </View>
        <Text style={[styles.title, { fontSize: moderateScale(24) }]}>Enter Verification Code</Text>
        <Text style={[styles.subtitle, { fontSize: moderateScale(14) }]}>
          Enter the 6-digit code sent to your email
        </Text>
      </View>

      <View style={styles.otpContainer}>
        <View style={[styles.otpInputs, { gap: scale(12) }]}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={[
                styles.otpInput,
                {
                  width: scale(48),
                  height: scale(48),
                  fontSize: moderateScale(20),
                  borderRadius: scale(8),
                }
              ]}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {otpError ? (
          <View style={[styles.errorContainer, { padding: scale(12), borderRadius: scale(8) }]}>
            <Text style={[styles.errorText, { fontSize: moderateScale(12) }]}>
              ⚠️ {otpError}
            </Text>
          </View>
        ) : null}

        <View style={[styles.timerSection, { marginVertical: verticalScale(24) }]}>
          <Text style={[styles.timerLabel, { fontSize: moderateScale(12) }]}>
            Code expires in
          </Text>
          <Text style={[styles.timerText, { fontSize: moderateScale(24) }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            canResend ? styles.primaryButton : styles.disabledButton,
            {
              paddingVertical: verticalScale(12),
              borderRadius: scale(12),
              marginBottom: verticalScale(16),
            }
          ]}
          onPress={handleResendOTP}
          disabled={!canResend}
        >
          <Text style={[
            canResend ? styles.primaryButtonText : styles.disabledButtonText,
            { fontSize: moderateScale(16) }
          ]}>
            Resend Code
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              paddingVertical: verticalScale(12),
              borderRadius: scale(12),
            },
            isLoading && styles.disabledButton
          ]}
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          <Text style={[styles.primaryButtonText, { fontSize: moderateScale(16) }]}>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Render Step 3: New Password
  const renderStep3 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={[styles.header, { marginBottom: verticalScale(32) }]}>
        <View style={[
          styles.iconContainer,
          {
            width: scale(64),
            height: scale(64),
            borderRadius: scale(32),
            marginBottom: verticalScale(16),
          }
        ]}>
          <Text style={[styles.icon, { fontSize: moderateScale(24) }]}>🔑</Text>
        </View>
        <Text style={[styles.title, { fontSize: moderateScale(24) }]}>Create New Password</Text>
        <Text style={[styles.subtitle, { fontSize: moderateScale(14) }]}>
          Your new password must be different from previous passwords
        </Text>
      </View>

      <View style={[styles.form, { gap: verticalScale(20) }]}>
        <View>
          <Text style={[styles.label, { fontSize: moderateScale(14) }]}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                {
                  paddingHorizontal: scale(16),
                  paddingVertical: verticalScale(12),
                  fontSize: moderateScale(16),
                  borderRadius: scale(12),
                }
              ]}
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              style={[styles.eyeButton, { padding: scale(8) }]}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Text style={[styles.eyeIcon, { fontSize: moderateScale(16) }]}>
                {showNewPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Password Strength Indicator */}
          <View style={[styles.strengthContainer, { marginTop: verticalScale(12) }]}>
            <View style={styles.strengthHeader}>
              <Text style={[styles.strengthLabel, { fontSize: moderateScale(12) }]}>
                Password strength
              </Text>
              <Text style={[
                styles.strengthText,
                { 
                  fontSize: moderateScale(12),
                  color: passwordStrengthInfo.color 
                }
              ]}>
                {passwordStrengthInfo.label}
              </Text>
            </View>
            <View style={[styles.strengthBar, { height: scale(4), borderRadius: scale(2) }]}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: `${passwordStrengthInfo.width}%`,
                    backgroundColor: passwordStrengthInfo.color,
                    height: scale(4),
                    borderRadius: scale(2),
                  }
                ]}
              />
            </View>
            <View style={[styles.requirements, { marginTop: verticalScale(8) }]}>
              {Object.entries(passwordStrengthInfo.requirements).map(([key, met]) => (
                <Text
                  key={key}
                  style={[
                    styles.requirement,
                    {
                      fontSize: moderateScale(11),
                      color: met ? '#22c55e' : '#6b7280'
                    }
                  ]}
                >
                  {met ? '✅' : '⭕'} {
                    key === 'length' ? 'At least 8 characters' :
                    key === 'uppercase' ? 'One uppercase letter' :
                    'One number'
                  }
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View>
          <Text style={[styles.label, { fontSize: moderateScale(14) }]}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                {
                  paddingHorizontal: scale(16),
                  paddingVertical: verticalScale(12),
                  fontSize: moderateScale(16),
                  borderRadius: scale(12),
                },
                passwordError && styles.inputError
              ]}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setPasswordError('');
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={[styles.eyeButton, { padding: scale(8) }]}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={[styles.eyeIcon, { fontSize: moderateScale(16) }]}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={[styles.errorText, { fontSize: moderateScale(12) }]}>
              ⚠️ {passwordError}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              paddingVertical: verticalScale(12),
              borderRadius: scale(12),
            },
            isLoading && styles.disabledButton
          ]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text style={[styles.primaryButtonText, { fontSize: moderateScale(16) }]}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[
            styles.card,
            {
              width: cardWidth,
              padding: scale(32),
              borderRadius: scale(16),
            }
          ]}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  stepContainer: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: '#2563eb',
  },
  title: {
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  label: {
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    color: '#111827',
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  eyeIcon: {
    color: '#6b7280',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButtonText: {
    color: '#9ca3af',
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    marginTop: 16,
  },
  otpContainer: {
    alignItems: 'center',
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    fontWeight: 'bold',
    color: '#111827',
  },
  timerSection: {
    alignItems: 'center',
  },
  timerLabel: {
    color: '#6b7280',
    marginBottom: 8,
  },
  timerText: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  strengthContainer: {
    width: '100%',
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    color: '#6b7280',
  },
  strengthText: {
    fontWeight: '500',
  },
  strengthBar: {
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  strengthFill: {
    borderRadius: 2,
  },
  requirements: {
    gap: 4,
  },
  requirement: {
    lineHeight: 16,
  },
});

export default ForgotPasswordScreen;