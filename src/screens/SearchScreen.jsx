import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Responsive helper functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchResults, setSearchResults] = useState({
    modules: [],
    docs: [],
    podcasts: [],
    quizzes: [],
  });

  // Available content database
  const contentDatabase = {
    modules: [
      {
        id: 1,
        title: 'Advanced Data Security',
        category: 'Security',
        duration: '3.5 hours',
        status: 'complete',
        icon: '🛡️',
        color: '#dbeafe',
      },
      {
        id: 2,
        title: 'Data Analytics Fundamentals',
        category: 'Analytics',
        duration: '4.2 hours',
        status: 'inProgress',
        icon: '📈',
        color: '#e9d5ff',
      },
      {
        id: 3,
        title: 'Database Management',
        category: 'Technical',
        duration: '2.8 hours',
        status: 'notStarted',
        icon: '🗄️',
        color: '#dcfce7',
      },
      {
        id: 4,
        title: 'Plywood Manufacturing',
        category: 'Product Training',
        duration: '3.0 hours',
        status: 'inProgress',
        icon: '🪵',
        color: '#fef3c7',
      },
      {
        id: 5,
        title: 'Sales Fundamentals',
        category: 'Sales Training',
        duration: '2.5 hours',
        status: 'complete',
        icon: '💼',
        color: '#dbeafe',
      },
      {
        id: 6,
        title: 'Communication Skills',
        category: 'General Training',
        duration: '2.0 hours',
        status: 'complete',
        icon: '💬',
        color: '#fed7aa',
      },
      {
        id: 7,
        title: 'Leadership Essentials',
        category: 'Leadership',
        duration: '3.5 hours',
        status: 'notStarted',
        icon: '👔',
        color: '#e9d5ff',
      },
      {
        id: 8,
        title: 'Project Management Basics',
        category: 'Management',
        duration: '4.0 hours',
        status: 'inProgress',
        icon: '📊',
        color: '#dbeafe',
      },
    ],
    docs: [
      {
        id: 1,
        title: 'Data Privacy Guidelines',
        category: 'Compliance',
        type: 'PDF',
        status: 'read',
        icon: '📄',
        color: '#fed7aa',
      },
      {
        id: 2,
        title: 'Security Best Practices',
        category: 'Security',
        type: 'Document',
        status: 'unread',
        icon: '📋',
        color: '#dbeafe',
      },
    ],
    podcasts: [
      {
        id: 1,
        title: 'Data Security in 2024',
        duration: '45 min',
        status: 'listening',
        icon: '🎙️',
        color: '#dcfce7',
      },
      {
        id: 2,
        title: 'Mann Ki Baat Duro Ke Sath',
        duration: '30 min',
        status: 'notStarted',
        icon: '🎙️',
        color: '#dcfce7',
      },
    ],
    quizzes: [
      {
        id: 1,
        title: 'Data Protection Quiz',
        questions: '10 questions',
        status: 'passed',
        icon: '❓',
        color: '#e9d5ff',
      },
    ],
  };

  const popularTags = ['#leadership', '#cybersecurity', '#agile', '#analytics', '#teamwork'];

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      } else {
        setRecentSearches(['data security', 'project management', 'communication']);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query) => {
    try {
      const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const removeRecentSearch = async (query) => {
    try {
      const updatedSearches = recentSearches.filter(s => s !== query);
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setShowSuggestions(true);
      setSearchResults({ modules: [], docs: [], podcasts: [], quizzes: [] });
      return;
    }

    setShowSuggestions(false);
    setLoading(true);

    // Simulate search delay
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      
      const results = {
        modules: contentDatabase.modules.filter(
          item => 
            item.title.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery)
        ),
        docs: contentDatabase.docs.filter(
          item => 
            item.title.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery)
        ),
        podcasts: contentDatabase.podcasts.filter(
          item => item.title.toLowerCase().includes(lowerQuery)
        ),
        quizzes: contentDatabase.quizzes.filter(
          item => item.title.toLowerCase().includes(lowerQuery)
        ),
      };

      setSearchResults(results);
      setLoading(false);

      if (query.trim().length > 0) {
        saveRecentSearch(query.trim());
      }
    }, 300);
  };

  const handleTagPress = (tag) => {
    const query = tag.replace('#', '');
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleModulePress = (module) => {
    // Navigate to module details
    navigation.navigate('Home', {
      screen: 'ModuleDetails',
      params: { moduleName: module.title, categoryName: module.category }
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'complete':
        return { color: '#10b981', label: 'Complete' };
      case 'inProgress':
        return { color: '#f59e0b', label: 'In Progress' };
      case 'passed':
        return { color: '#10b981', label: 'Passed' };
      case 'listening':
        return { color: '#f59e0b', label: 'Listening' };
      case 'read':
        return { color: '#10b981', label: 'Read' };
      case 'unread':
        return { color: '#9ca3af', label: 'Unread' };
      default:
        return { color: '#9ca3af', label: 'Not Started' };
    }
  };

  const hasResults = 
    searchResults.modules.length > 0 ||
    searchResults.docs.length > 0 ||
    searchResults.podcasts.length > 0 ||
    searchResults.quizzes.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Search</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search modules, docs, podcasts..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => handleSearch('')}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Keyboard Shortcuts Hint */}
        <View style={styles.keyboardHints}>
          <View style={styles.keyboardHint}>
            <View style={styles.kbd}>
              <Text style={styles.kbdText}>⌘</Text>
            </View>
            <View style={styles.kbd}>
              <Text style={styles.kbdText}>K</Text>
            </View>
            <Text style={styles.hintText}>Quick search</Text>
          </View>
          <View style={styles.keyboardHint}>
            <View style={styles.kbd}>
              <Text style={styles.kbdText}>↵</Text>
            </View>
            <Text style={styles.hintText}>Search</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Suggestions */}
        {showSuggestions && (
          <View style={styles.suggestionsSection}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.suggestionBlock}>
                <Text style={styles.suggestionTitle}>Recent Searches</Text>
                <View style={styles.tagContainer}>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentTag}
                      onPress={() => {
                        setSearchQuery(search);
                        handleSearch(search);
                      }}
                    >
                      <Text style={styles.recentTagText}>{search}</Text>
                      <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                        <Text style={styles.removeIcon}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Tags */}
            <View style={styles.suggestionBlock}>
              <Text style={styles.suggestionTitle}>Popular Tags</Text>
              <View style={styles.tagContainer}>
                {popularTags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.popularTag}
                    onPress={() => handleTagPress(tag)}
                  >
                    <Text style={styles.popularTagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Search Results */}
        {!showSuggestions && !loading && hasResults && (
          <View style={styles.resultsContainer}>
            {/* Modules */}
            {searchResults.modules.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>📖</Text>
                  <Text style={styles.resultTitle}>Modules</Text>
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>{searchResults.modules.length}</Text>
                  </View>
                </View>
                <View style={styles.resultList}>
                  {searchResults.modules.map((module) => {
                    const statusInfo = getStatusInfo(module.status);
                    return (
                      <TouchableOpacity
                        key={module.id}
                        style={styles.resultItem}
                        onPress={() => handleModulePress(module)}
                      >
                        <View style={[styles.resultItemIcon, { backgroundColor: module.color }]}>
                          <Text style={styles.resultItemIconText}>{module.icon}</Text>
                        </View>
                        <View style={styles.resultItemInfo}>
                          <Text style={styles.resultItemTitle}>{module.title}</Text>
                          <Text style={styles.resultItemSubtitle}>
                            {module.category} • {module.duration}
                          </Text>
                        </View>
                        <View style={styles.resultItemStatus}>
                          <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                          <Text style={styles.statusText}>{statusInfo.label}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Docs */}
            {searchResults.docs.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>📄</Text>
                  <Text style={styles.resultTitle}>Documentation</Text>
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>{searchResults.docs.length}</Text>
                  </View>
                </View>
                <View style={styles.resultList}>
                  {searchResults.docs.map((doc) => {
                    const statusInfo = getStatusInfo(doc.status);
                    return (
                      <TouchableOpacity key={doc.id} style={styles.resultItem}>
                        <View style={[styles.resultItemIcon, { backgroundColor: doc.color }]}>
                          <Text style={styles.resultItemIconText}>{doc.icon}</Text>
                        </View>
                        <View style={styles.resultItemInfo}>
                          <Text style={styles.resultItemTitle}>{doc.title}</Text>
                          <Text style={styles.resultItemSubtitle}>
                            {doc.type} • {doc.category}
                          </Text>
                        </View>
                        <View style={styles.resultItemStatus}>
                          <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                          <Text style={styles.statusText}>{statusInfo.label}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Podcasts */}
            {searchResults.podcasts.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>🎙️</Text>
                  <Text style={styles.resultTitle}>Podcasts</Text>
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>{searchResults.podcasts.length}</Text>
                  </View>
                </View>
                <View style={styles.resultList}>
                  {searchResults.podcasts.map((podcast) => {
                    const statusInfo = getStatusInfo(podcast.status);
                    return (
                      <TouchableOpacity key={podcast.id} style={styles.resultItem}>
                        <View style={[styles.resultItemIcon, { backgroundColor: podcast.color }]}>
                          <Text style={styles.resultItemIconText}>{podcast.icon}</Text>
                        </View>
                        <View style={styles.resultItemInfo}>
                          <Text style={styles.resultItemTitle}>{podcast.title}</Text>
                          <Text style={styles.resultItemSubtitle}>Podcast • {podcast.duration}</Text>
                        </View>
                        <View style={styles.resultItemStatus}>
                          <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                          <Text style={styles.statusText}>{statusInfo.label}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Quizzes */}
            {searchResults.quizzes.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>❓</Text>
                  <Text style={styles.resultTitle}>Quizzes</Text>
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>{searchResults.quizzes.length}</Text>
                  </View>
                </View>
                <View style={styles.resultList}>
                  {searchResults.quizzes.map((quiz) => {
                    const statusInfo = getStatusInfo(quiz.status);
                    return (
                      <TouchableOpacity key={quiz.id} style={styles.resultItem}>
                        <View style={[styles.resultItemIcon, { backgroundColor: quiz.color }]}>
                          <Text style={styles.resultItemIconText}>{quiz.icon}</Text>
                        </View>
                        <View style={styles.resultItemInfo}>
                          <Text style={styles.resultItemTitle}>{quiz.title}</Text>
                          <Text style={styles.resultItemSubtitle}>Quiz • {quiz.questions}</Text>
                        </View>
                        <View style={styles.resultItemStatus}>
                          <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                          <Text style={styles.statusText}>{statusInfo.label}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Empty State */}
        {!showSuggestions && !loading && !hasResults && searchQuery.trim().length > 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>🔍</Text>
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try removing some filters or search for something else
            </Text>
            <TouchableOpacity style={styles.clearFiltersButton} onPress={() => handleSearch('')}>
              <Text style={styles.clearFiltersText}>Clear search</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Padding for Tab Navigation */}
        <View style={{ height: moderateScale(80) }} />
      </ScrollView>
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
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  searchSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    height: moderateScale(44),
  },
  searchIcon: {
    fontSize: moderateScale(16),
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#111827',
    padding: 0,
  },
  clearButton: {
    padding: moderateScale(4),
  },
  clearIcon: {
    fontSize: moderateScale(16),
    color: '#9ca3af',
  },
  keyboardHints: {
    flexDirection: 'row',
    marginTop: verticalScale(8),
    gap: scale(16),
  },
  keyboardHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  kbd: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  kbdText: {
    fontSize: moderateScale(12),
    color: '#374151',
  },
  hintText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  suggestionsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionBlock: {
    marginBottom: verticalScale(16),
  },
  suggestionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  recentTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  recentTagText: {
    fontSize: moderateScale(14),
    color: '#374151',
  },
  removeIcon: {
    fontSize: moderateScale(12),
    color: '#9ca3af',
  },
  popularTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(16),
  },
  popularTagText: {
    fontSize: moderateScale(14),
    color: '#6366f1',
  },
  loadingContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: '#6b7280',
  },
  resultsContainer: {
    paddingBottom: verticalScale(16),
  },
  resultSection: {
    backgroundColor: '#ffffff',
    marginBottom: verticalScale(8),
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: scale(8),
  },
  resultIcon: {
    fontSize: moderateScale(16),
  },
  resultTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
  },
  resultBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(12),
  },
  resultBadgeText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  resultList: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    gap: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultItemIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultItemIconText: {
    fontSize: moderateScale(20),
  },
  resultItemInfo: {
    flex: 1,
  },
  resultItemTitle: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  resultItemSubtitle: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  resultItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  statusText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  emptyState: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(48),
    alignItems: 'center',
  },
  emptyIcon: {
    width: moderateScale(64),
    height: moderateScale(64),
    backgroundColor: '#f3f4f6',
    borderRadius: moderateScale(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  emptyIconText: {
    fontSize: moderateScale(32),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  clearFiltersButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
  },
  clearFiltersText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#6366f1',
  },
});

export default SearchScreen;