import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase-client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Initialize auth state
  useEffect(() => {
    console.log('AuthContext - Initializing...');
    
    // Check onboarding status
    const checkOnboarding = async () => {
      try {
        const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(onboardingStatus === 'true');
      } catch (error) {
        console.log('Error checking onboarding status:', error);
      }
    };

    checkOnboarding();
    checkAuthStatus();
    setupAuthListener();
  }, []);

  // Set up auth state listener
  const setupAuthListener = async () => {
    try {
      if (!supabase || !supabase.auth) {
        console.error('Supabase client not initialized properly');
        setIsLoading(false);
        return;
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log('AuthContext - Auth state changed:', event);
          
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsLoggedIn(true);
            await AsyncStorage.setItem('isLoggedIn', 'true');
          } else {
            setSession(null);
            setUser(null);
            setIsLoggedIn(false);
            await AsyncStorage.removeItem('isLoggedIn');
          }
          setIsLoading(false);
        }
      );

      return () => {
        if (authListener && authListener.subscription) {
          authListener.subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      if (!supabase || !supabase.auth) {
        console.error('Supabase client not initialized properly');
        setIsLoading(false);
        return;
      }

      // Check Supabase session
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }

      if (data && data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsLoggedIn(true);
        await AsyncStorage.setItem('isLoggedIn', 'true');
      } else {
        setIsLoggedIn(false);
        await AsyncStorage.removeItem('isLoggedIn');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error };
      }
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { error };
      }
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error };
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) {
        return { error };
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error };
    }
  };

  // Legacy methods for backward compatibility
  const login = async () => {
    console.warn('login() is deprecated. Use signIn(email, password) instead.');
    setIsLoggedIn(true);
    await AsyncStorage.setItem('isLoggedIn', 'true');
  };

  const logout = async () => {
    await signOut();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.log('Error completing onboarding:', error);
    }
  };

  const skipOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.log('Error skipping onboarding:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenOnboarding');
      setHasSeenOnboarding(false);
    } catch (error) {
      console.log('Error resetting onboarding:', error);
    }
  };

  const value = {
    user,
    session,
    isLoggedIn,
    isLoading,
    hasSeenOnboarding,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    // Legacy methods
    login,
    logout,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
