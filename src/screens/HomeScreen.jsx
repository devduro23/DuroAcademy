import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const featuredModules = [
    {
      id: 1,
      title: 'Advanced Product Training',
      subtitle: 'Master our latest product features',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/be0da6fc62-657f0c42edf63e6544c5.png',
      badge: 'New',
      badgeColor: '#10b981',
    },
    {
      id: 2,
      title: 'Sales Excellence Program',
      subtitle: 'Boost your sales performance',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/8e4dabfd2f-4f3a4c51b29b8a9b6721.png',
      badge: 'Popular',
      badgeColor: '#3b82f6',
    },
  ];

  const continueLearning = [
    {
      id: 1,
      title: 'Customer Service Excellence',
      subtitle: '3 of 4 lessons completed',
      progress: 75,
    },
    {
      id: 2,
      title: 'Digital Marketing Basics',
      subtitle: '2 of 5 lessons completed',
      progress: 45,
    },
  ];

  const recommended = [
    {
      id: 1,
      title: 'Leadership Fundamentals',
      subtitle: 'Build essential leadership skills',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/0a178268f1-9fe62a99a1e9b65dd1aa.png',
      rating: 4.8,
      duration: '2h 30m',
      stars: 5,
    },
    {
      id: 2,
      title: 'Time Management Mastery',
      subtitle: 'Maximize your productivity',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/9301531c27-daf31a1993f1d1155956.png',
      rating: 4.6,
      duration: '1h 45m',
      stars: 4,
    },
    {
      id: 3,
      title: 'Effective Communication',
      subtitle: 'Improve your communication skills',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/c4456d8d02-7e77d66d7ffe5681e87a.png',
      rating: 4.9,
      duration: '3h 15m',
      stars: 5,
    },
  ];

  const categories = [
    { id: 1, name: 'Product Training' },
    { id: 2, name: 'Sales Training' },
    { id: 3, name: 'General Training' },
    { id: 4, name: 'Podcast' },
  ];

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.id);
    navigation.navigate('CategoryDetails', { categoryName: category.name });
  };

  const renderStars = (count) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => (
          <Text key={index} style={styles.star}>
            {index < count ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hi, Dev 👋</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Modules</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {featuredModules.map((module) => (
              <TouchableOpacity
                key={module.id}
                style={styles.featuredCard}
                activeOpacity={0.9}
              >
                <View style={styles.featuredImageContainer}>
                  <Image
                    source={{ uri: module.image }}
                    style={styles.featuredImage}
                  />
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: module.badgeColor },
                    ]}
                  >
                    <Text style={styles.badgeText}>{module.badge}</Text>
                  </View>
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>{module.title}</Text>
                  <Text style={styles.featuredSubtitle}>{module.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive,
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Continue Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {continueLearning.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.continueCard}
                activeOpacity={0.9}
              >
                <View style={styles.continueContent}>
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressText}>{course.progress}%</Text>
                  </View>
                  <View style={styles.continueInfo}>
                    <Text style={styles.continueTitle}>{course.title}</Text>
                    <Text style={styles.continueSubtitle}>
                      {course.subtitle}
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${course.progress}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <View style={styles.recommendedContainer}>
            {recommended.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recommendedCard}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.recommendedImage}
                />
                <View style={styles.recommendedContent}>
                  <Text style={styles.recommendedTitle}>{item.title}</Text>
                  <Text style={styles.recommendedSubtitle}>
                    {item.subtitle}
                  </Text>
                  <View style={styles.recommendedMeta}>
                    <Text style={styles.rating}>{item.rating}</Text>
                    {renderStars(item.stars)}
                    <Text style={styles.duration}>• {item.duration}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>⚡</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  bellIcon: {
    fontSize: 20,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#dc2626',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  lastSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: 320,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 176,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  continueCard: {
    width: 288,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#dc2626',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  continueSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  recommendedContainer: {
    gap: 12,
  },
  recommendedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendedImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  recommendedContent: {
    flex: 1,
  },
  recommendedTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  recommendedSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  recommendedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: '#6b7280',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 10,
    color: '#fbbf24',
  },
  duration: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  chevron: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
  },
});

export default HomeScreen;