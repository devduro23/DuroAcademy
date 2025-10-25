import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import TabNavigator from './src/navigation/TabNavigator';

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { 
    isLoggedIn, 
    hasSeenOnboarding, 
    isLoading, 
    login, 
    logout, 
    completeOnboarding, 
    skipOnboarding,
    resetOnboarding 
  } = useAuth();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    completeOnboarding();
  };

  const handleOnboardingSkip = () => {
    skipOnboarding();
  };

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
  };

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  // If user is logged in, show tab navigator
  if (isLoggedIn) {
    return (
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    );
  }

  // If user hasn't seen onboarding, show onboarding
  if (!hasSeenOnboarding) {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Show login screen
  return <LoginScreen />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});