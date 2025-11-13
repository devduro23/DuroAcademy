import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase-client';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const ModuleDetailsScreen = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params || {};
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('popular'); // popular, recent, progress
  const [selectedModule, setSelectedModule] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Fetch modules for the category
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching modules:', error);
      } else {
        setModules(data || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      fetchModules();
    }
  }, [fetchModules, categoryId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchModules();
    setRefreshing(false);
  }, [fetchModules]);

  // Get module icon and color based on index
  const getModuleStyle = (index) => {
    const styles = [
      { icon: '📚', bg: '#DBEAFE', color: '#2563EB' },
      { icon: '🎯', bg: '#FFEDD5', color: '#EA580C' },
      { icon: '🚪', bg: '#E9D5FF', color: '#9333EA' },
      { icon: '🎨', bg: '#FEE2E2', color: '#DC2626' },
      { icon: '⚙️', bg: '#D1FAE5', color: '#10B981' },
    ];
    return styles[index % styles.length];
  };

  // Calculate module progress (mock for now)
  const getModuleProgress = (module) => {
    // This should come from user_progress table in real implementation
    const progressValues = [65, 25, 0, 40, 80];
    return progressValues[modules.indexOf(module) % progressValues.length];
  };

  // Get progress color
  const getProgressColor = (progress) => {
    if (progress === 0) return '#D1D5DB';
    if (progress < 50) return '#3B82F6';
    return '#10B981';
  };

  // Handle long press on module card
  const handleLongPress = (module) => {
    setSelectedModule(module);
    setShowQuickActions(true);
  };

  // Handle module press
  const handleModulePress = (module) => {
    navigation.navigate('ModuleLessons', { 
      moduleId: module.id,
      moduleName: module.title 
    });
  };

  if (loading && modules.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading modules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{categoryName || 'Modules'}</Text>
            <Text style={styles.headerSubtitle}>
              {modules.length} {modules.length === 1 ? 'module' : 'modules'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Home</Text>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbTextActive}>{categoryName}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={[styles.viewButtonText, viewMode === 'grid' && styles.viewButtonTextActive]}>
              ▦ Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.viewButtonText, viewMode === 'list' && styles.viewButtonTextActive]}>
              ☰ List
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort Dropdown */}
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>Popular</Text>
          <Text style={styles.sortButtonIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Modules List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />
        }
      >
        {modules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No modules found</Text>
            <Text style={styles.emptySubtitle}>Check back later for new content</Text>
          </View>
        ) : (
          modules.map((module, index) => {
            const moduleStyle = getModuleStyle(index);
            const progress = getModuleProgress(module);
            const progressColor = getProgressColor(progress);
            const isNew = index === modules.length - 1; // Mark last module as new

            return (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => handleModulePress(module)}
                onLongPress={() => handleLongPress(module)}
              >
                <View style={styles.moduleCardContent}>
                  {/* Icon */}
                  <View style={[styles.moduleIcon, { backgroundColor: moduleStyle.bg }]}>
                    <Text style={styles.moduleIconText}>{moduleStyle.icon}</Text>
                  </View>

                  {/* Content */}
                  <View style={styles.moduleTextContainer}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleSubtitle}>
                      {module.lesson_count || 6} lessons
                    </Text>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBg}>
                        <View 
                          style={[
                            styles.progressBarFill, 
                            { width: `${progress}%`, backgroundColor: progressColor }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.progressText, { color: progressColor }]}>
                        {progress === 0 ? 'Not started' : `${progress}% complete`}
                      </Text>
                    </View>
                  </View>

                  {/* Right Section */}
                  <View style={styles.moduleRight}>
                    {isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>New</Text>
                      </View>
                    )}
                    <Text style={styles.chevronIcon}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Quick Actions Modal */}
      <Modal
        visible={showQuickActions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQuickActions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQuickActions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {selectedModule?.title} - Quick Actions
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalAction}>
                <Text style={styles.actionIcon}>✓</Text>
                <Text style={styles.actionText}>Mark all as read</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAction}>
                <Text style={styles.actionIcon}>↗</Text>
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAction}
                onPress={() => setShowQuickActions(false)}
              >
                <Text style={styles.actionIcon}>✕</Text>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginTop: moderateScale(12),
    color: '#6B7280',
    fontSize: moderateScale(14),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: moderateScale(8),
    marginLeft: moderateScale(-8),
    marginRight: moderateScale(8),
  },
  backIcon: {
    fontSize: moderateScale(24),
    color: '#374151',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    marginTop: moderateScale(2),
  },
  filterButton: {
    padding: moderateScale(8),
  },
  filterIcon: {
    fontSize: moderateScale(20),
    color: '#6B7280',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breadcrumbText: {
    fontSize: moderateScale(13),
    color: '#6B7280',
  },
  breadcrumbSeparator: {
    fontSize: moderateScale(14),
    color: '#9CA3AF',
    marginHorizontal: moderateScale(8),
  },
  breadcrumbTextActive: {
    fontSize: moderateScale(13),
    color: '#DC2626',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(8),
    padding: moderateScale(4),
  },
  viewButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(6),
  },
  viewButtonActive: {
    backgroundColor: '#DC2626',
  },
  viewButtonText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#6B7280',
  },
  viewButtonTextActive: {
    color: '#FFFFFF',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(6),
  },
  sortButtonText: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    marginRight: moderateScale(4),
  },
  sortButtonIcon: {
    fontSize: moderateScale(10),
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(16),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(80),
  },
  emptyIcon: {
    fontSize: moderateScale(48),
    marginBottom: moderateScale(16),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  moduleCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  moduleIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(16),
  },
  moduleIconText: {
    fontSize: moderateScale(24),
  },
  moduleTextContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(4),
  },
  moduleSubtitle: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    marginBottom: moderateScale(8),
  },
  progressBarContainer: {
    marginTop: moderateScale(4),
  },
  progressBarBg: {
    width: '100%',
    height: moderateScale(8),
    backgroundColor: '#E5E7EB',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: moderateScale(4),
  },
  progressText: {
    fontSize: moderateScale(12),
    marginTop: moderateScale(4),
  },
  moduleRight: {
    alignItems: 'flex-end',
    marginLeft: moderateScale(12),
  },
  newBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(4),
  },
  newBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#DC2626',
  },
  chevronIcon: {
    fontSize: moderateScale(24),
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    padding: moderateScale(16),
  },
  modalHandle: {
    width: moderateScale(48),
    height: moderateScale(4),
    backgroundColor: '#D1D5DB',
    borderRadius: moderateScale(2),
    alignSelf: 'center',
    marginBottom: moderateScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(16),
  },
  modalActions: {
    gap: moderateScale(12),
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    backgroundColor: '#F9FAFB',
  },
  actionIcon: {
    fontSize: moderateScale(18),
    marginRight: moderateScale(12),
  },
  actionText: {
    fontSize: moderateScale(15),
    color: '#111827',
  },
});

export default ModuleDetailsScreen;
