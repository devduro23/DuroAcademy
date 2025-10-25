import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onAnimationComplete }) => {
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const titleScaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for the three pulse dots
  const pulse1 = useRef(new Animated.Value(0.3)).current;
  const pulse2 = useRef(new Animated.Value(0.3)).current;
  const pulse3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo animation - fade in and scale
    const logoAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoScaleAnim, {
          toValue: 1.05,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    // Title animation - slight delay after logo
    const titleAnimation = Animated.parallel([
      Animated.timing(titleOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(titleScaleAnim, {
          toValue: 1.05,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(titleScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Pulse animations for dots
    const createPulseAnimation = (animValue, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start animations
    setTimeout(() => {
      logoAnimation.start();
    }, 100);

    setTimeout(() => {
      titleAnimation.start();
    }, 400);

    // Start pulse animations with delays
    setTimeout(() => {
      createPulseAnimation(pulse1, 0).start();
      createPulseAnimation(pulse2, 200).start();
      createPulseAnimation(pulse3, 400).start();
    }, 800);

    // Auto transition after 2.5 seconds
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Geometric background shape */}
      <View style={styles.geometricShape} />
      
      {/* Main content */}
      <View style={styles.content}>
        {/* Logo container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacityAnim,
              transform: [{ scale: logoScaleAnim }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Image
              source={{
                uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/d65e360272-fbbcc81dbcf4296cf556.png',
              }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Title and subtitle */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacityAnim,
              transform: [{ scale: titleScaleAnim }],
            },
          ]}
        >
          <Text style={styles.title}>DuroAcademy</Text>
          <Text style={styles.subtitle}>Learning for every Duro employee</Text>
        </Animated.View>
      </View>

      {/* Loading dots */}
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: pulse1,
              transform: [
                {
                  scale: pulse1.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: pulse2,
              transform: [
                {
                  scale: pulse2.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: pulse3,
              transform: [
                {
                  scale: pulse3.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  geometricShape: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.6,
    height: height * 0.4,
    backgroundColor: '#ffeeef',
    opacity: 0.8,
    // Creating a clipped polygon effect with border radius
    borderBottomLeftRadius: width * 0.3,
    transform: [{ rotate: '15deg' }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
    fontFamily: 'System', // Using system font as fallback for Inter
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
    fontFamily: 'System',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
    marginHorizontal: 4,
  },
});

export default SplashScreen;