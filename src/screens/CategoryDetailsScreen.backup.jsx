import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { supabase } from '../supabase-client';

const { width, height } = Dimensions.get('window');

// Responsive helper functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Device type detection
const isTablet = width >= 768;

const CategoryDetailsScreen = ({ route, navigation }) => {
  const { category } = route.params || {};
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch modules for the selected category
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('modules')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('category_id', category?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setModules(data || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err.message);
      Alert.alert('Error', 'Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [category?.id]);

  useEffect(() => {
    if (category?.id) {
      fetchModules();
    } else {
      console.log('CategoryDetailsScreen: No category provided or category missing id:', category);
    }
  }, [fetchModules]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchModules().finally(() => {
      setRefreshing(false);
    });
  }, [fetchModules]);

  const handleModulePress = useCallback((module) => {
    // Navigate to module details or course details
    navigation.navigate('CourseDetails', { module });
  }, [navigation]);

  const renderModuleCard = (module) => (
    <TouchableOpacity
      key={module.id}
      style={styles.moduleCard}
      onPress={() => handleModulePress(module)}
    >
      {module.image_url && (
        <Image source={{ uri: module.image_url }} style={styles.moduleImage} />
      )}
      <View style={styles.moduleContent}>
        <Text style={styles.moduleTitle}>{module.title}</Text>
        {module.description && (
          <Text style={styles.moduleDescription} numberOfLines={2}>
            {module.description}
          </Text>
        )}
        <View style={styles.moduleMetaContainer}>
          {module.duration && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaText}>{module.duration}</Text>
            </View>
          )}
          {module.difficulty_level && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📊</Text>
              <Text style={styles.metaText}>{module.difficulty_level}</Text>
            </View>
          )}
          {module.is_free !== undefined && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>{module.is_free ? '🆓' : '💎'}</Text>
              <Text style={styles.metaText}>{module.is_free ? 'Free' : 'Premium'}</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.chevronIcon}>›</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{category?.name || 'Category'}</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? 'Loading...' : `${modules.length} modules available`}
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (!category) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>No Category Selected</Text>
          <Text style={styles.errorText}>
            Please select a category from the home screen to view its modules.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading modules...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchModules}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (modules.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No modules found</Text>
          <Text style={styles.emptyText}>
            There are no modules available in this category yet.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.modulesContainer}>
        {modules.map(renderModuleCard)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: scale(8),
    marginRight: scale(12),
  },
  backIcon: {
    fontSize: moderateScale(24),
    color: '#374151',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  headerSubtitle: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: verticalScale(16),
  },
  modulesContainer: {
    paddingHorizontal: scale(16),
    gap: verticalScale(12),
  },
  moduleCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  moduleImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(8),
    marginRight: scale(12),
    backgroundColor: '#f3f4f6',
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  moduleDescription: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(20),
  },
  moduleMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  metaIcon: {
    fontSize: moderateScale(12),
  },
  metaText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    fontWeight: '500',
  },
  chevronIcon: {
    fontSize: moderateScale(18),
    color: '#9ca3af',
    marginLeft: scale(8),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: '#6b7280',
    marginTop: verticalScale(16),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(60),
  },
  errorIcon: {
    fontSize: moderateScale(48),
    marginBottom: verticalScale(16),
  },
  errorTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  errorText: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: verticalScale(24),
    lineHeight: moderateScale(20),
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  retryText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(60),
  },
  emptyIcon: {
    fontSize: moderateScale(48),
    marginBottom: verticalScale(16),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});

export default CategoryDetailsScreen;
