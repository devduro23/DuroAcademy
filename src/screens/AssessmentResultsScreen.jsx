import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const AssessmentResultsScreen = ({ route, navigation }) => {
  const {
    score = 0,
    totalQuestions = 0,
    correctAnswers = 0,
    quizId,
    questions = [],
    selectedAnswers = {},
  } = route.params || {};

  const isPassed = score >= 70;
  const percentage = Math.round(score);
  const incorrectAnswers = totalQuestions - correctAnswers;

  const handleRetake = () => {
    navigation.replace('Assessment', { assessmentId: quizId });
  };

  const handleFinish = () => {
    navigation.navigate('Home');
  };

  const getResultMessage = () => {
    if (score >= 90) return { title: 'Outstanding!', subtitle: 'Excellent performance!', emoji: '🏆' };
    if (score >= 70) return { title: 'Well Done!', subtitle: 'You passed the assessment!', emoji: '🎉' };
    if (score >= 50) return { title: 'Almost There!', subtitle: 'Keep practicing to improve!', emoji: '💪' };
    return { title: 'Keep Learning!', subtitle: 'You need 70% to pass. Try again!', emoji: '📚' };
  };

  const resultMessage = getResultMessage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleFinish}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment Results</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Result Card */}
        <View style={styles.resultCard}>
          {/* Result Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.resultEmoji}>{resultMessage.emoji}</Text>
          </View>

          {/* Result Message */}
          <Text style={styles.resultTitle}>{resultMessage.title}</Text>
          <Text style={styles.resultSubtitle}>{resultMessage.subtitle}</Text>

          {/* Score Circle */}
          <View style={styles.scoreContainer}>
            <View style={[
              styles.scoreCircle,
              { borderColor: isPassed ? '#10B981' : '#EF4444' }
            ]}>
              <Text style={[
                styles.scorePercentage,
                { color: isPassed ? '#10B981' : '#EF4444' }
              ]}>
                {percentage}%
              </Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#DCFCE7' }]}>
                <Text style={styles.statIcon}>✓</Text>
              </View>
              <Text style={styles.statValue}>{correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.statIcon}>✕</Text>
              </View>
              <Text style={styles.statValue}>{incorrectAnswers}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.statIcon}>📝</Text>
              </View>
              <Text style={styles.statValue}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Performance Badge */}
          <View style={[
            styles.performanceBadge,
            { backgroundColor: isPassed ? '#DCFCE7' : '#FEF3C7' }
          ]}>
            <Text style={[
              styles.performanceText,
              { color: isPassed ? '#16A34A' : '#CA8A04' }
            ]}>
              {isPassed ? '✓ Passed' : '⚠ Did Not Pass'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!isPassed && (
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
            >
              <Text style={styles.retakeIcon}>🔄</Text>
              <Text style={styles.retakeButtonText}>Retake Assessment</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishIcon}>🏠</Text>
            <Text style={styles.finishButtonText}>
              {isPassed ? 'Continue Learning' : 'Back to Home'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerButton: {
    padding: moderateScale(8),
    width: moderateScale(40),
  },
  closeIcon: {
    fontSize: moderateScale(24),
    color: '#374151',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(16),
    paddingBottom: moderateScale(32),
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: moderateScale(24),
  },
  iconContainer: {
    marginBottom: moderateScale(16),
  },
  resultEmoji: {
    fontSize: moderateScale(80),
  },
  resultTitle: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: '#111827',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: moderateScale(16),
    color: '#6B7280',
    marginBottom: moderateScale(32),
    textAlign: 'center',
  },
  scoreContainer: {
    marginBottom: moderateScale(32),
    alignItems: 'center',
  },
  scoreCircle: {
    width: moderateScale(160),
    height: moderateScale(160),
    borderRadius: moderateScale(80),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: moderateScale(8),
    backgroundColor: '#FFFFFF',
  },
  scorePercentage: {
    fontSize: moderateScale(48),
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginTop: moderateScale(4),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: moderateScale(24),
    gap: moderateScale(12),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(8),
  },
  statIcon: {
    fontSize: moderateScale(20),
  },
  statValue: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#111827',
    marginBottom: moderateScale(4),
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  performanceBadge: {
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(24),
    marginTop: moderateScale(8),
  },
  performanceText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: moderateScale(12),
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  retakeIcon: {
    fontSize: moderateScale(20),
    marginRight: moderateScale(8),
  },
  retakeButtonText: {
    color: '#6366f1',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(12),
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  finishIcon: {
    fontSize: moderateScale(20),
    marginRight: moderateScale(8),
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});

export default AssessmentResultsScreen;
