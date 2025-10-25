import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';

const CategoryDetailsScreen = ({ route, navigation }) => {
  const { categoryName = 'Product Training' } = route.params || {};
  
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Popular');
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Define modules for different categories
  const categoryModules = {
    'Product Training': [
      {
        id: 1,
        name: 'Plywood',
        moduleCount: 6,
        progress: 65,
        icon: '📚',
        iconBg: '#dbeafe',
        iconColor: '#2563eb',
        progressColor: '#10b981',
        progressText: 'text-green-600',
      },
      {
        id: 2,
        name: 'Blockboard',
        moduleCount: 4,
        progress: 25,
        icon: '📦',
        iconBg: '#fed7aa',
        iconColor: '#ea580c',
        progressColor: '#3b82f6',
        progressText: 'text-blue-600',
      },
      {
        id: 3,
        name: 'Doors & Veneers',
        moduleCount: 8,
        progress: 0,
        icon: '🚪',
        iconBg: '#e9d5ff',
        iconColor: '#9333ea',
        progressColor: '#d1d5db',
        progressText: 'text-gray-500',
        badge: 'New',
      },
    ],
    'Sales Training': [
      {
        id: 1,
        name: 'Sales Fundamentals',
        moduleCount: 5,
        progress: 80,
        icon: '💼',
        iconBg: '#dbeafe',
        iconColor: '#2563eb',
        progressColor: '#10b981',
        progressText: 'text-green-600',
      },
      {
        id: 2,
        name: 'Customer Relations',
        moduleCount: 4,
        progress: 50,
        icon: '🤝',
        iconBg: '#fef3c7',
        iconColor: '#d97706',
        progressColor: '#3b82f6',
        progressText: 'text-blue-600',
      },
    ],
    'General Training': [
      {
        id: 1,
        name: 'Workplace Safety',
        moduleCount: 3,
        progress: 100,
        icon: '🦺',
        iconBg: '#dcfce7',
        iconColor: '#16a34a',
        progressColor: '#10b981',
        progressText: 'text-green-600',
      },
      {
        id: 2,
        name: 'Company Policies',
        moduleCount: 2,
        progress: 0,
        icon: '📋',
        iconBg: '#e0e7ff',
        iconColor: '#4f46e5',
        progressColor: '#d1d5db',
        progressText: 'text-gray-500',
      },
    ],
    'Podcast': [
      {
        id: 1,
        name: 'Mann Ki Baat Duro Ke Sath',
        moduleCount: 10,
        progress: 30,
        icon: '🎙️',
        iconBg: '#fce7f3',
        iconColor: '#db2777',
        progressColor: '#3b82f6',
        progressText: 'text-blue-600',
      },
    ],
  };

  const modules = categoryModules[categoryName] || [];

  const handleLongPress = (module) => {
    setSelectedCard(module);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerTitle}>{categoryName}</Text>
            <Text style={styles.headerSubtitle}>
              {categoryName === 'Podcast' 
                ? 'Listen and learn' 
                : 'Learn about our offerings'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Home</Text>
        <Text style={styles.breadcrumbChevron}>›</Text>
        <Text style={styles.breadcrumbActive}>{categoryName}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'grid' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === 'grid' && styles.toggleTextActive,
              ]}
            >
              ⊞ Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('list')}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === 'list' && styles.toggleTextActive,
              ]}
            >
              ☰ List
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>{sortBy}</Text>
          <Text style={styles.sortChevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContent}>
          {modules.length > 0 ? (
            modules.map((module) => (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ModuleDetails', { 
                  moduleName: module.name,
                  categoryName: categoryName 
                })}
                onLongPress={() => handleLongPress(module)}
              >
                <View style={styles.cardContent}>
                  <View
                    style={[styles.iconContainer, { backgroundColor: module.iconBg }]}
                  >
                    <Text style={styles.icon}>{module.icon}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.moduleName}>{module.name}</Text>
                    <Text style={styles.moduleCount}>
                      {module.moduleCount} {categoryName === 'Podcast' ? 'episodes' : 'modules'}
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${module.progress}%`,
                            backgroundColor: module.progressColor,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.progressText,
                        { color: module.progressColor },
                      ]}
                    >
                      {module.progress === 0
                        ? 'Not started'
                        : `${module.progress}% complete`}
                    </Text>
                  </View>
                  <View style={styles.cardRight}>
                    {module.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{module.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No modules available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Quick Actions Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {selectedCard?.name} - Quick Actions
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
              <TouchableOpacity style={styles.modalAction} onPress={closeModal}>
                <Text style={styles.actionIcon}>✕</Text>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  backIcon: {
    fontSize: 24,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  filterButton: {
    padding: 8,
  },
  filterIcon: {
    fontSize: 18,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#6b7280',
  },
  breadcrumbChevron: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 8,
  },
  breadcrumbActive: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#3b82f6',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sortText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  sortChevron: {
    fontSize: 10,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  moduleCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardRight: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: '#9ca3af',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  modalActions: {
    gap: 12,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#111827',
  },
});

export default CategoryDetailsScreen;