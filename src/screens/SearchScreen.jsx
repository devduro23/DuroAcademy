import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const SearchScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [modules, setModules] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Popular tags
  const popularTags = ['#leadership', '#cybersecurity', '#agile', '#analytics', '#teamwork'];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchContent();
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadRecentSearches();
  }, [user?.id]);

  const RECENTS_KEY = useCallback(() => `recent_searches_${user?.id || 'guest'}`, [user?.id]);

  const loadRecentSearches = useCallback(async () => {
    try {
      if (user?.id) {
        const { data, error } = await supabase
          .from('search_history')
          .select('query, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (!error && data) {
          // unique, most recent first
          const unique = [];
          for (const row of data) {
            if (row.query && !unique.includes(row.query)) unique.push(row.query);
          }
          setRecentSearches(unique);
          await AsyncStorage.setItem(RECENTS_KEY(), JSON.stringify(unique));
          return;
        }
      }
    } catch (_) {}
    // Fallback to AsyncStorage
    try {
      const raw = await AsyncStorage.getItem(RECENTS_KEY());
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch (_) {}
  }, [user?.id, RECENTS_KEY]);

  const searchContent = async () => {
    setLoading(true);
    setShowResults(true);
    try {
      // Search modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .limit(10);

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Search videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .limit(10);

      if (videosError) throw videosError;
      setVideos(videosData || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModulePress = (module) => {
    navigation.navigate('ModuleDetails', { 
      moduleId: module.id,
      moduleName: module.title 
    });
  };

  const handleVideoPress = (video) => {
    navigation.navigate('VideoPlayer', { 
      lessonId: video.id,
      lessonTitle: video.title,
      moduleId: video.module_id 
    });
  };

  const removeRecentSearch = async (search) => {
    try {
      setRecentSearches(prev => prev.filter(s => s !== search));
      if (user?.id) {
        await supabase
          .from('search_history')
          .delete()
          .eq('user_id', user.id)
          .eq('query', search);
      }
    } catch (_) {}
    try {
      const updated = recentSearches.filter(s => s !== search);
      await AsyncStorage.setItem(RECENTS_KEY(), JSON.stringify(updated));
    } catch (_) {}
  };

  const addRecentSearch = async (search) => {
    const q = search.trim();
    if (!q) return;
    // Update local state: move to front, de-dupe, cap 10
    setRecentSearches(prev => {
      const next = [q, ...prev.filter(s => s !== q)].slice(0, 10);
      AsyncStorage.setItem(RECENTS_KEY(), JSON.stringify(next)).catch(() => {});
      return next;
    });
    // Persist to Supabase if available
    try {
      if (user?.id) {
        // Optional: delete duplicates then insert
        await supabase
          .from('search_history')
          .delete()
          .eq('user_id', user.id)
          .eq('query', q);
        await supabase
          .from('search_history')
          .insert({ user_id: user.id, query: q });
      }
    } catch (_) {}
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      searchContent();
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      security: '🛡️',
      analytics: '📊',
      leadership: '👑',
      technical: '💻',
      compliance: '✅',
    };
    return icons[category?.toLowerCase()] || '📖';
  };

  const getCategoryColor = (category) => {
    const colors = {
      security: { bg: '#DBEAFE', text: '#3B82F6' },
      analytics: { bg: '#E9D5FF', text: '#A855F7' },
      leadership: { bg: '#FED7AA', text: '#F97316' },
      technical: { bg: '#D1FAE5', text: '#10B981' },
      compliance: { bg: '#DBEAFE', text: '#3B82F6' },
    };
    return colors[category?.toLowerCase()] || { bg: '#DBEAFE', text: '#3B82F6' };
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setFilterVisible(true)}>
            <Text style={styles.headerIcon}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search modules, videos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Keyboard Shortcuts Hint */}
        <View style={styles.shortcutHint}>
          <View style={styles.shortcutItem}>
            <View style={styles.kbd}>
              <Text style={styles.kbdText}>⏎</Text>
            </View>
            <Text style={styles.shortcutText}>Search</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!showResults ? (
          <>
            {/* Recent Searches & Popular Tags */}
            <View style={styles.suggestionsSection}>
              {recentSearches.length > 0 && (
                <View style={styles.suggestionBlock}>
                  <Text style={styles.suggestionTitle}>Recent Searches</Text>
                  <View style={styles.tagsContainer}>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.recentTag}
                        onPress={() => setSearchQuery(search)}>
                        <Text style={styles.recentTagText}>{search}</Text>
                        <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                          <Text style={styles.removeTagIcon}>✕</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.suggestionBlock}>
                <Text style={styles.suggestionTitle}>Popular Tags</Text>
                <View style={styles.tagsContainer}>
                  {popularTags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.popularTag}
                      onPress={() => setSearchQuery(tag.replace('#', ''))}>
                      <Text style={styles.popularTagText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Search Results */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : (
              <>
                {modules.length === 0 && videos.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <Text style={styles.emptyIconText}>🔍</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No results found</Text>
                    <Text style={styles.emptySubtitle}>
                      Try searching for something else
                    </Text>
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Text style={styles.clearSearchText}>Clear search</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {/* Modules Results */}
                    {modules.length > 0 && (
                      <View style={styles.resultsSection}>
                        <View style={styles.resultsSectionHeader}>
                          <View style={styles.resultsTitleRow}>
                            <Text style={styles.resultsIcon}>📖</Text>
                            <Text style={styles.resultsTitle}>Modules</Text>
                            <View style={styles.resultsBadge}>
                              <Text style={styles.resultsBadgeText}>{modules.length}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.resultsContent}>
                          {modules.map((module) => (
                            <TouchableOpacity
                              key={module.id}
                              style={styles.resultItem}
                              onPress={() => handleModulePress(module)}>
                              <View style={[
                                styles.resultItemIcon,
                                { backgroundColor: getCategoryColor(module.category).bg }
                              ]}>
                                <Text style={styles.resultItemIconText}>
                                  {getCategoryIcon(module.category)}
                                </Text>
                              </View>
                              <View style={styles.resultItemContent}>
                                <Text style={styles.resultItemTitle} numberOfLines={1}>
                                  {module.title}
                                </Text>
                                <Text style={styles.resultItemSubtitle} numberOfLines={1}>
                                  {module.category || 'Module'} • {module.lessons_count || 0} lessons
                                </Text>
                              </View>
                              <View style={styles.resultItemStatus}>
                                <View style={[
                                  styles.statusDot,
                                  { backgroundColor: module.completed ? '#10B981' : '#9CA3AF' }
                                ]} />
                                <Text style={styles.statusText}>
                                  {module.completed ? 'Complete' : 'Available'}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Videos Results */}
                    {videos.length > 0 && (
                      <View style={styles.resultsSection}>
                        <View style={styles.resultsSectionHeader}>
                          <View style={styles.resultsTitleRow}>
                            <Text style={styles.resultsIcon}>🎥</Text>
                            <Text style={styles.resultsTitle}>Videos</Text>
                            <View style={styles.resultsBadge}>
                              <Text style={styles.resultsBadgeText}>{videos.length}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.resultsContent}>
                          {videos.map((video) => (
                            <TouchableOpacity
                              key={video.id}
                              style={styles.resultItem}
                              onPress={() => handleVideoPress(video)}>
                              <View style={[
                                styles.resultItemIcon,
                                { backgroundColor: '#E9D5FF' }
                              ]}>
                                <Text style={styles.resultItemIconText}>▶️</Text>
                              </View>
                              <View style={styles.resultItemContent}>
                                <Text style={styles.resultItemTitle} numberOfLines={1}>
                                  {video.title}
                                </Text>
                                <Text style={styles.resultItemSubtitle} numberOfLines={1}>
                                  Video • {formatDuration(video.duration)}
                                </Text>
                              </View>
                              <View style={styles.resultItemStatus}>
                                <View style={[
                                  styles.statusDot,
                                  { backgroundColor: video.completed ? '#10B981' : '#9CA3AF' }
                                ]} />
                                <Text style={styles.statusText}>
                                  {video.completed ? 'Watched' : 'New'}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFilterVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterVisible(false)}>
          <View style={styles.filterPanel}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Text style={styles.closeFilterIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                {['Security', 'Analytics', 'Leadership', 'Technical'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.filterOption}
                    onPress={() => {
                      if (selectedCategories.includes(category)) {
                        setSelectedCategories(selectedCategories.filter(c => c !== category));
                      } else {
                        setSelectedCategories([...selectedCategories, category]);
                      }
                    }}>
                    <View style={[
                      styles.checkbox,
                      selectedCategories.includes(category) && styles.checkboxChecked
                    ]}>
                      {selectedCategories.includes(category) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.filterOptionText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Content Type Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Content Type</Text>
                {['Videos', 'Modules', 'Documents', 'Quizzes'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.filterOption}
                    onPress={() => {
                      if (selectedTypes.includes(type)) {
                        setSelectedTypes(selectedTypes.filter(t => t !== type));
                      } else {
                        setSelectedTypes([...selectedTypes, type]);
                      }
                    }}>
                    <View style={[
                      styles.checkbox,
                      selectedTypes.includes(type) && styles.checkboxChecked
                    ]}>
                      {selectedTypes.includes(type) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.filterOptionText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.filterFooter}>
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => {
                  setSelectedCategories([]);
                  setSelectedTypes([]);
                }}>
                <Text style={styles.clearFilterButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setFilterVisible(false);
                  searchContent();
                }}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  headerButton: {
    padding: scale(8),
  },
  headerIcon: {
    fontSize: moderateScale(22),
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginLeft: scale(12),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
  },
  searchIcon: {
    fontSize: moderateScale(18),
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#111827',
    padding: 0,
  },
  clearIcon: {
    fontSize: moderateScale(16),
    color: '#9CA3AF',
    padding: scale(4),
  },
  shortcutHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  shortcutItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kbd: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
    marginRight: scale(4),
  },
  kbdText: {
    fontSize: moderateScale(11),
    color: '#6B7280',
    fontWeight: '500',
  },
  shortcutText: {
    fontSize: moderateScale(11),
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  suggestionsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionBlock: {
    marginBottom: verticalScale(16),
  },
  suggestionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  recentTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentTagText: {
    fontSize: moderateScale(13),
    color: '#374151',
    marginRight: scale(6),
  },
  removeTagIcon: {
    fontSize: moderateScale(10),
    color: '#9CA3AF',
  },
  popularTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(16),
  },
  popularTagText: {
    fontSize: moderateScale(13),
    color: '#6366F1',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: verticalScale(60),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: verticalScale(60),
    paddingHorizontal: scale(16),
    alignItems: 'center',
  },
  emptyIcon: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  emptyIconText: {
    fontSize: moderateScale(28),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  clearSearchText: {
    color: '#6366F1',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  resultsSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: verticalScale(8),
  },
  resultsSectionHeader: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsIcon: {
    fontSize: moderateScale(16),
    marginRight: scale(8),
  },
  resultsTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
  },
  resultsBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(12),
    marginLeft: scale(8),
  },
  resultsBadgeText: {
    fontSize: moderateScale(11),
    color: '#6B7280',
    fontWeight: '500',
  },
  resultsContent: {
    paddingVertical: verticalScale(4),
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  resultItemIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  resultItemIconText: {
    fontSize: moderateScale(20),
  },
  resultItemContent: {
    flex: 1,
  },
  resultItemTitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  resultItemSubtitle: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  resultItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    marginRight: scale(4),
  },
  statusText: {
    fontSize: moderateScale(11),
    color: '#6B7280',
  },
  bottomSpace: {
    height: verticalScale(20),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  closeFilterIcon: {
    fontSize: moderateScale(24),
    color: '#6B7280',
    padding: scale(4),
  },
  filterContent: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  filterSection: {
    marginBottom: verticalScale(24),
  },
  filterSectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderRadius: moderateScale(4),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  filterOptionText: {
    fontSize: moderateScale(14),
    color: '#374151',
  },
  filterFooter: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: scale(12),
  },
  clearFilterButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  clearFilterButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#374151',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SearchScreen;
