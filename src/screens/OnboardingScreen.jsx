import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';

// Get initial dimensions
const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

let { width, height } = getScreenDimensions();

const OnboardingScreen = ({ onComplete, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenData, setScreenData] = useState(getScreenDimensions());
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(null);
  
  // Animation references for floating effect
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  
  // Animation references for slide content
  const slideInAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const slides = [
    {
      id: 1,
      title: 'Learn anytime, anywhere',
      description: 'Video lessons, podcasts and docs for every role.',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/d012e15a35-ebd065a48f41898e5bb4.png',
      alt: 'Smartphone with educational content',
    },
    {
      id: 2,
      title: 'Role-based pathways',
      description: 'Courses curated for Sales, Product, and Operations.',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/f446471789-87a17fd75f5eb10d334a.png',
      alt: 'Connected learning pathways',
    },
    {
      id: 3,
      title: 'Track your progress',
      description: 'Certifications & completion history at a glance.',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/82c00e3650-2fe3d67cfb2fc426da83.png',
      alt: 'Progress tracking dashboard',
    },
  ];

  useEffect(() => {
    // Handle orientation changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      width = window.width;
      height = window.height;
      setScreenData(window);
    });

    // Start smooth floating animations with easing
    const createFloatAnimation = (animValue, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: -12,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createFloatAnimation(floatAnim1, 0).start();
    createFloatAnimation(floatAnim2, 600).start();
    createFloatAnimation(floatAnim3, 1200).start();

    // Smooth initial entrance animation
    Animated.parallel([
      Animated.spring(slideInAnim, {
        toValue: 1,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    return () => subscription?.remove();
  }, []);

  const getFloatAnimation = (index) => {
    switch (index) {
      case 0: return floatAnim1;
      case 1: return floatAnim2;
      case 2: return floatAnim3;
      default: return floatAnim1;
    }
  };

  const goToSlide = (slideIndex) => {
    // Smooth slide transition with easing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(slideInAnim, {
        toValue: 0.95,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animations after slide change
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideInAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });

    setCurrentSlide(slideIndex);
    slideRef.current?.scrollTo({
      x: slideIndex * screenData.width,
      animated: true,
    });
  };

  const handleNext = () => {
    // Smooth button press animation with spring physics
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        friction: 8,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentSlide < slides.length - 1) {
      // Add slight delay for smoother transition
      setTimeout(() => {
        goToSlide(currentSlide + 1);
      }, 50);
    } else {
      // Smooth exit animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const slide = Math.round(event.nativeEvent.contentOffset.x / screenData.width);
        if (slide !== currentSlide) {
          setCurrentSlide(slide);
          // Smooth content animation on slide change
          Animated.parallel([
            Animated.spring(slideInAnim, {
              toValue: 1,
              friction: 7,
              tension: 120,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }
  );

  const renderSlide = (item, index) => {
    const inputRange = [
      (index - 1) * screenData.width,
      index * screenData.width,
      (index + 1) * screenData.width,
    ];

    return (
      <View key={item.id} style={[styles.slide, { width: screenData.width }]}>
        <View style={styles.slideContent}>
          <View style={styles.topSection}>
            <Animated.View
              style={[
                styles.imageContainer,
                {
                  transform: [
                    { translateY: getFloatAnimation(index) },
                    {
                      scale: scrollX.interpolate({
                        inputRange,
                        outputRange: [0.85, 1.02, 0.85],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      rotateY: scrollX.interpolate({
                        inputRange,
                        outputRange: ['15deg', '0deg', '-15deg'],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                  opacity: scrollX.interpolate({
                    inputRange,
                    outputRange: [0.4, 1, 0.4],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              <Image
                source={{ uri: item.image }}
                style={[styles.slideImage, { 
                  width: 240, // Slightly smaller width to fit better
                  height: 180, // Reduced height to make room for text
                }]}
                resizeMode="contain"
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.textContainer,
                {
                  opacity: scrollX.interpolate({
                    inputRange,
                    outputRange: [0, 1, 0],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      translateY: scrollX.interpolate({
                        inputRange,
                        outputRange: [40, 0, 40],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      scale: scrollX.interpolate({
                        inputRange,
                        outputRange: [0.92, 1.01, 0.92],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      rotateX: scrollX.interpolate({
                        inputRange,
                        outputRange: ['5deg', '0deg', '-5deg'],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.Text 
                style={[
                  styles.slideTitle, 
                  { 
                    fontSize: Math.min(screenData.width * 0.07, 28),
                    opacity: fadeAnim,
                  }
                ]}
              >
                {item.title}
              </Animated.Text>
              <Animated.Text 
                style={[
                  styles.slideDescription,
                  { 
                    fontSize: Math.min(screenData.width * 0.04, 16),
                    opacity: fadeAnim,
                  }
                ]}
              >
                {item.description}
              </Animated.Text>
            </Animated.View>
          </View>
        </View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * screenData.width,
            index * screenData.width,
            (index + 1) * screenData.width,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.4, 1],
            extrapolate: 'clamp',
          });

          const dotScale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 2.5, 1],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              style={styles.dotTouchable}
            >
              <Animated.View
                style={[
                  styles.dot,
                  index === currentSlide ? styles.activeDot : styles.inactiveDot,
                  {
                    opacity,
                    transform: [
                      { scale },
                      { scaleX: dotScale }
                    ],
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <Animated.View 
        style={[
          styles.backgroundGradient,
          {
            opacity: scrollX.interpolate({
              inputRange: [0, screenData.width, screenData.width * 2],
              outputRange: [0.05, 0.1, 0.15],
              extrapolate: 'clamp',
            }),
          }
        ]} 
      />
      
      {/* Skip Button - Top Right */}
      <Animated.View style={[styles.skipButtonTop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Slides */}
      <ScrollView
        ref={slideRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        style={styles.scrollView}
        decelerationRate="fast"
        snapToInterval={screenData.width}
        snapToAlignment="center"
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ flexGrow: 1 }}
        directionalLockEnabled={true}
        alwaysBounceHorizontal={false}
        showsVerticalScrollIndicator={false}
      >
        {slides.map((item, index) => renderSlide(item, index))}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {renderDots()}
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              currentSlide === slides.length - 1 ? styles.getStartedButton : styles.nextButtonDefault,
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.nextButtonText,
                currentSlide === slides.length - 1 ? styles.getStartedButtonText : styles.nextButtonTextDefault,
              ]}
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.microcopy}>
          By continuing you agree to company learning policy
        </Text>

        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>� Swipe to navigate</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#dc2626',
    opacity: 0.05,
  },
  skipButtonTop: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 1000,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skipText: {
    color: '#6b7280',
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Math.max(width * 0.08, 24),
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 120, // Increased bottom padding to avoid overlap with bottom controls
    height: height - 160, // Fixed height for consistency
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: 20,
    paddingBottom: 40, // Add space between content and bottom controls
  },
  imageContainer: {
    width: Math.min(width * 0.75, 300),
    height: 220, // Reduced height to create more space for text
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Add space between image and text
  },
  slideImage: {
    flex: 1,
    aspectRatio: 1,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    maxWidth: Math.min(width * 0.9, 350),
    marginTop: 10, // Add space above text
    marginBottom: 40, // Add space below text to prevent overlap with bottom controls
  },
  slideTitle: {
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: Math.max(height * 0.02, 16),
    lineHeight: Math.min(width * 0.08, 34),
  },
  slideDescription: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.06, 24),
    maxWidth: Math.min(width * 0.8, 300),
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Math.max(width * 0.08, 24),
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 20,
    backgroundColor: '#ffffff',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Math.max(height * 0.04, 24),
    minHeight: 30,
  },
  dotTouchable: {
    padding: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#dc2626',
  },
  inactiveDot: {
    backgroundColor: '#d1d5db',
  },
  nextButton: {
    width: '100%',
    paddingVertical: Math.max(height * 0.02, 16),
    paddingHorizontal: 24,
    borderRadius: Math.min(width * 0.03, 12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 56,
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDefault: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  getStartedButton: {
    backgroundColor: '#dc2626',
    borderWidth: 0,
  },
  nextButtonText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 100,
  },
  nextButtonTextDefault: {
    color: '#dc2626',
  },
  getStartedButtonText: {
    color: '#ffffff',
  },
  microcopy: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  swipeHint: {
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default OnboardingScreen;