import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import AuthContext from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Please enter your employee ID or email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
    setShowError(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLogin = async () => {
    if (isLoading) return;
    
    clearErrors();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      setTimeout(async () => {
        if (formData.employeeId && formData.password) {
          await login();
        } else {
          setShowError(true);
        }
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      setShowError(true);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Main Content */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginCard}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>DA</Text>
              </View>
              <Text style={styles.logoSubtext}>DuroAcademy</Text>
            </View>

            <View style={styles.welcomeSection}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your employee account</Text>
            </View>

            {/* Employee ID Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Employee ID or Email</Text>
              <View style={[
                styles.inputContainer,
                errors.employeeId && styles.inputError
              ]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="demo@duro.com or EMP1234"
                  placeholderTextColor="#9ca3af"
                  value={formData.employeeId}
                  onChangeText={(value) => handleInputChange('employeeId', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
                <Text style={styles.inputIcon}>👤</Text>
              </View>
              {errors.employeeId && (
                <Text style={styles.errorText}>{errors.employeeId}</Text>
              )}
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[
                styles.inputContainer,
                errors.password && styles.inputError
              ]}>
                <TextInput
                  style={[styles.textInput, { paddingRight: 50 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.inputIcon}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Form Options */}
            <View style={styles.formOptions}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[
                  styles.toggleSwitch,
                  rememberMe && styles.toggleSwitchActive
                ]}>
                  <View style={[
                    styles.toggleKnob,
                    rememberMe && styles.toggleKnobActive
                  ]} />
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot?</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {showError && (
              <View style={styles.errorMessageContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorMessage}>
                  Invalid credentials. Please try again.
                </Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Math.max(width * 0.06, 24),
    paddingVertical: Math.max(height * 0.04, 32),
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: Math.min(width * 0.04, 16),
    padding: Math.max(width * 0.04, 24),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Math.max(height * 0.03, 24),
  },
  logoCircle: {
    width: Math.min(width * 0.2, 80),
    height: Math.min(width * 0.2, 80),
    borderRadius: Math.min(width * 0.1, 40),
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Math.max(height * 0.015, 12),
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  logoText: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  logoSubtext: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '600',
    color: '#111827',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: Math.max(height * 0.03, 24),
  },
  title: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: '700',
    color: '#111827',
    marginBottom: Math.max(height * 0.01, 8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6b7280',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Math.max(height * 0.025, 20),
  },
  label: {
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '500',
    color: '#374151',
    marginBottom: Math.max(height * 0.01, 8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: Math.min(width * 0.02, 8),
    backgroundColor: '#ffffff',
    paddingHorizontal: Math.max(width * 0.04, 16),
    paddingVertical: Math.max(height * 0.015, 12),
  },
  inputError: {
    borderColor: '#dc2626',
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(width * 0.04, 16),
    color: '#111827',
    padding: 0,
  },
  inputIcon: {
    fontSize: Math.min(width * 0.04, 16),
    marginLeft: 8,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  errorText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#dc2626',
    marginTop: Math.max(height * 0.01, 8),
  },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Math.max(height * 0.025, 20),
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#dc2626',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  rememberMeText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#374151',
  },
  forgotPassword: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#dc2626',
    fontWeight: '500',
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: Math.min(width * 0.02, 8),
    padding: Math.max(height * 0.015, 12),
    marginBottom: Math.max(height * 0.025, 20),
    gap: 8,
  },
  errorIcon: {
    fontSize: Math.min(width * 0.035, 14),
  },
  errorMessage: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#dc2626',
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#dc2626',
    borderRadius: Math.min(width * 0.02, 8),
    paddingVertical: Math.max(height * 0.02, 16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(height * 0.02, 16),
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: Math.max(height * 0.025, 24),
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#6b7280',
    textAlign: 'center',
  },
  signupLink: {
    color: '#dc2626',
    fontWeight: '500',
  },
});

export default LoginScreen;