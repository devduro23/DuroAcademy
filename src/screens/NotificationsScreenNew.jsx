import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase-client';
import { useAuth } from '../context/AuthContext';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const NotificationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, announcements
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'announcements') {
        query = query.eq('type', 'announcement');
      }

      // Filter by user if user_id exists
      if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: user?.id ? `user_id=eq.${user.id}` : undefined,
        },
        (payload) => {
          console.log('Notification change:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchNotifications, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (!error) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

              if (!error) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };

  // Toggle expanded notification
  const toggleExpanded = (notificationId) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  // Get notification icon and color
  const getNotificationStyle = (type) => {
    const styles = {
      module: { icon: '📚', bg: '#DBEAFE', color: '#2563EB' },
      podcast: { icon: '🎙️', bg: '#D1FAE5', color: '#10B981' },
      quiz: { icon: '❓', bg: '#FED7AA', color: '#EA580C' },
      announcement: { icon: '📢', bg: '#E9D5FF', color: '#9333EA' },
      achievement: { icon: '🏆', bg: '#FEF3C7', color: '#D97706' },
      reminder: { icon: '⏰', bg: '#DBEAFE', color: '#2563EB' },
      certificate: { icon: '🎓', bg: '#D1FAE5', color: '#10B981' },
      default: { icon: '🔔', bg: '#F3F4F6', color: '#6B7280' },
    };
    return styles[type] || styles.default;
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
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
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Critical Banner - Only show if there are critical notifications */}
      {notifications.some(n => n.is_critical && !n.is_read) && (
        <TouchableOpacity style={styles.criticalBanner}>
          <View style={styles.criticalIcon}>
            <Text style={styles.criticalIconText}>!</Text>
          </View>
          <View style={styles.criticalContent}>
            <Text style={styles.criticalTitle}>Mandatory Training Required</Text>
            <Text style={styles.criticalSubtitle}>
              {notifications.find(n => n.is_critical && !n.is_read)?.title || 'Action needed'}
            </Text>
          </View>
          <Text style={styles.criticalChevron}>›</Text>
        </TouchableOpacity>
      )}

      {/* Filter Toggles */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterButtonText, filter === 'unread' && styles.filterButtonTextActive]}>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'announcements' && styles.filterButtonActive]}
            onPress={() => setFilter('announcements')}
          >
            <Text style={[styles.filterButtonText, filter === 'announcements' && styles.filterButtonTextActive]}>
              Announcements
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const notifStyle = getNotificationStyle(notification.type);
            const isExpanded = expandedNotifications.has(notification.id);
            
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.is_read && styles.notificationCardUnread,
                ]}
                onPress={() => {
                  markAsRead(notification.id);
                  if (notification.type === 'announcement') {
                    toggleExpanded(notification.id);
                  }
                }}
                onLongPress={() => deleteNotification(notification.id)}
              >
                <View style={styles.notificationContent}>
                  <View style={[styles.notificationIcon, { backgroundColor: notifStyle.bg }]}>
                    <Text style={styles.notificationIconText}>{notifStyle.icon}</Text>
                  </View>
                  <View style={styles.notificationTextContainer}>
                    <View style={styles.notificationTitleRow}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      {!notification.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    
                    {/* Expandable content for announcements */}
                    {notification.type === 'announcement' && notification.details && (
                      <View>
                        {isExpanded && (
                          <View style={styles.expandedContent}>
                            <Text style={styles.expandedText}>{notification.details}</Text>
                          </View>
                        )}
                        <TouchableOpacity onPress={() => toggleExpanded(notification.id)}>
                          <Text style={styles.showMoreText}>
                            {isExpanded ? 'Show less' : 'Show more'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    <Text style={styles.notificationTime}>
                      {formatTimeAgo(notification.created_at)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
  },
  backButton: {
    padding: moderateScale(8),
    marginLeft: moderateScale(-8),
  },
  backIcon: {
    fontSize: moderateScale(24),
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginLeft: moderateScale(8),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
  },
  manageButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#DC2626',
  },
  criticalBanner: {
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  criticalIcon: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  criticalIconText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#DC2626',
  },
  criticalContent: {
    flex: 1,
  },
  criticalTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: moderateScale(2),
  },
  criticalSubtitle: {
    fontSize: moderateScale(12),
    color: '#B91C1C',
  },
  criticalChevron: {
    fontSize: moderateScale(20),
    color: '#DC2626',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    marginRight: moderateScale(8),
  },
  filterButtonActive: {
    backgroundColor: '#DC2626',
  },
  filterButtonText: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
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
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationCardUnread: {
    backgroundColor: '#FFFBEB',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: moderateScale(16),
  },
  notificationIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  notificationIconText: {
    fontSize: moderateScale(20),
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: moderateScale(4),
  },
  notificationTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  unreadDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#DC2626',
    marginLeft: moderateScale(8),
    marginTop: moderateScale(4),
  },
  notificationMessage: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(8),
  },
  expandedContent: {
    backgroundColor: '#F9FAFB',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(8),
    marginBottom: moderateScale(8),
  },
  expandedText: {
    fontSize: moderateScale(13),
    color: '#374151',
    lineHeight: moderateScale(18),
  },
  showMoreText: {
    fontSize: moderateScale(14),
    color: '#DC2626',
    fontWeight: '500',
    marginTop: moderateScale(4),
  },
  notificationTime: {
    fontSize: moderateScale(12),
    color: '#9CA3AF',
    marginTop: moderateScale(4),
  },
});

export default NotificationsScreen;
