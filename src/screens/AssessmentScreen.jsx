import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase-client';
import { useAuth } from '../context/AuthContext';

// Responsive helper functions
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const verticalScale = (size) => (height / 812) * size;

const AssessmentScreen = ({ route, navigation }) => {
  const { assessmentId } = route.params || {};
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerInterval = useRef(null);
  const saveIndicatorTimeout = useRef(null);

  useEffect(() => {
    if (assessmentId) {
      fetchQuizAndQuestions();
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      if (saveIndicatorTimeout.current) {
        clearTimeout(saveIndicatorTimeout.current);
      }
    };
  }, [assessmentId]);

  // Start timer if quiz has duration
  useEffect(() => {
    if (quiz && quiz.duration_minutes) {
      setTimeRemaining(quiz.duration_minutes * 60);
      startTimer();
    }
  }, [quiz]);

  const fetchQuizAndQuestions = async () => {
    try {
      setIsLoading(true);

      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      // Fetch questions for this quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', assessmentId);

      if (questionsError) throw questionsError;
      
      // Log first question to see structure
      if (questionsData && questionsData.length > 0) {
        console.log('Sample question structure:', questionsData[0]);
        console.log('Question keys:', Object.keys(questionsData[0]));
      }
      
      // Randomize questions order
      const shuffledQuestions = (questionsData || []).sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    timerInterval.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer,
    });

    // Show save indicator
    setShowSaveIndicator(true);
    if (saveIndicatorTimeout.current) {
      clearTimeout(saveIndicatorTimeout.current);
    }
    saveIndicatorTimeout.current = setTimeout(() => {
      setShowSaveIndicator(false);
    }, 2000);
  };

  const toggleBookmark = () => {
    const currentQuestionId = questions[currentQuestionIndex]?.id;
    const newBookmarks = new Set(bookmarkedQuestions);
    
    if (newBookmarks.has(currentQuestionId)) {
      newBookmarks.delete(currentQuestionId);
    } else {
      newBookmarks.add(currentQuestionId);
    }
    
    setBookmarkedQuestions(newBookmarks);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAutoSubmit = () => {
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = async () => {
    setShowSubmitModal(false);
    setShowLoadingModal(true);

    try {
      // Calculate score
      let correctCount = 0;
      questions.forEach((question) => {
        const userAnswer = selectedAnswers[question.id];
        // Try both column names (correct_answer or correct_option)
        const correctAnswer = question.correct_option || question.correct_answer;
        
        // Debug logging
        console.log('=== Question Validation ===');
        console.log('Question:', question.question_text);
        console.log('User Answer:', userAnswer);
        console.log('Correct Answer from DB:', correctAnswer);
        
        // Check if user answered
        if (!userAnswer) {
          console.log('Result: Not answered');
          console.log('---');
          return;
        }
        
        // Normalize both to uppercase and trim
        const normalizedUserAnswer = String(userAnswer).trim().toUpperCase();
        const normalizedCorrectAnswer = String(correctAnswer).trim().toUpperCase();
        
        // Check if correct_answer is stored as letter (A, B, C, D)
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
          console.log('Result: CORRECT (letter match)');
          correctCount++;
        } else {
          // If correct_answer is stored as the option text, check by option value
          const userAnswerLetter = normalizedUserAnswer; // e.g., "A"
          
          // Get the option text for the user's selected letter
          let userOptionText = '';
          if (question.options && Array.isArray(question.options)) {
            const index = userAnswerLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
            userOptionText = question.options[index] || '';
          } else {
            const optionKey = `option_${userAnswerLetter.toLowerCase()}`;
            userOptionText = question[optionKey] || '';
          }
          
          const normalizedUserOptionText = String(userOptionText).trim().toUpperCase();
          
          console.log('User selected option text:', userOptionText);
          console.log('Comparing option text with correct answer...');
          
          if (normalizedUserOptionText === normalizedCorrectAnswer) {
            console.log('Result: CORRECT (text match)');
            correctCount++;
          } else {
            console.log('Result: INCORRECT');
          }
        }
        console.log('---');
      });

      console.log('Total Correct:', correctCount, 'out of', questions.length);
      const scorePercent = Math.round((correctCount / questions.length) * 100);

      // Calculate time taken (if timer was used)
      let timeTaken = null;
      if (quiz && quiz.duration_minutes && timeRemaining !== null) {
        timeTaken = (quiz.duration_minutes * 60) - timeRemaining; // Time taken in seconds
      }

      // Save quiz result to database
      const { error } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: user?.id,
          quiz_id: assessmentId,
          score: scorePercent,
          time_taken: timeTaken,
          completed_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving quiz result:', error);
        setShowLoadingModal(false);
        setShowErrorModal(true);
        return;
      }

      // Stop timer
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }

      // Navigate to results
      setTimeout(() => {
        setShowLoadingModal(false);
        navigation.replace('AssessmentResults', {
          quizId: assessmentId,
          score: scorePercent,
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          timeTaken: timeTaken,
          questions: questions,
          selectedAnswers: selectedAnswers,
        });
      }, 1000);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setShowLoadingModal(false);
      setShowErrorModal(true);
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    handleSubmitConfirm();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading assessment...</Text>
      </SafeAreaView>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📦</Text>
        <Text style={styles.errorText}>Assessment not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isBookmarked = bookmarkedQuestions.has(currentQuestion?.id);
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          {timeRemaining !== null && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerIcon}>🕐</Text>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            </View>
          )}
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Save Indicator */}
      {showSaveIndicator && (
        <View style={styles.saveIndicator}>
          <Text style={styles.saveIcon}>✓</Text>
          <Text style={styles.saveText}>Answer saved automatically</Text>
        </View>
      )}

      {/* Question Area */}
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionArea}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>
              {currentQuestion.question_text}
            </Text>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={toggleBookmark}
            >
              <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkIconActive]}>
                {isBookmarked ? '🔖' : '🏷️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Answer Options */}
          <View style={styles.answerOptions}>
            {currentQuestion.options && Array.isArray(currentQuestion.options) ? (
              // If options is an array
              currentQuestion.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedAnswers[currentQuestion.id] === letter;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => handleAnswerSelect(currentQuestion.id, letter)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{letter}.</Text>
                      <Text style={styles.optionTextContent}>{option}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              // If options are separate columns
              ['a', 'b', 'c', 'd'].map((letter) => {
                const optionKey = `option_${letter}`;
                const optionValue = currentQuestion[optionKey];
                
                if (!optionValue) return null;
                
                const letterUpper = letter.toUpperCase();
                const isSelected = selectedAnswers[currentQuestion.id] === letterUpper;

                return (
                  <TouchableOpacity
                    key={letter}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => handleAnswerSelect(currentQuestion.id, letterUpper)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{letterUpper}.</Text>
                      <Text style={styles.optionTextContent}>{optionValue}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }).filter(Boolean)
            )}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Controls */}
      <View style={styles.navigationControls}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.previousButton,
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.chevronLeft}>‹</Text>
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? 'Submit' : 'Next'}
          </Text>
          <Text style={styles.chevronRight}>
            {isLastQuestion ? '✓' : '›'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submit Modal */}
      <Modal
        visible={showSubmitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>⚠️</Text>
            </View>
            <Text style={styles.modalTitle}>Submit Quiz</Text>
            <Text style={styles.modalMessage}>
              You won't be able to change your answers after submission. Are you sure you want to continue?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSubmitConfirm}
              >
                <Text style={styles.confirmButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Modal */}
      <Modal
        visible={showLoadingModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.modalTitle}>Submitting Quiz</Text>
            <Text style={styles.modalMessage}>
              Please wait while we process your answers...
            </Text>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, styles.errorIconContainer]}>
              <Text style={styles.modalIcon}>❌</Text>
            </View>
            <Text style={styles.modalTitle}>Submission Failed</Text>
            <Text style={styles.modalMessage}>
              Unable to submit your quiz. Please check your internet connection and try again.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRetry}
              >
                <Text style={styles.confirmButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: moderateScale(16),
    fontSize: moderateScale(16),
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: moderateScale(20),
  },
  errorIcon: {
    fontSize: moderateScale(64),
    marginBottom: moderateScale(16),
  },
  errorText: {
    fontSize: moderateScale(18),
    color: '#111827',
    marginBottom: moderateScale(24),
  },
  backButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(8),
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
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
  menuIcon: {
    fontSize: moderateScale(24),
    color: '#374151',
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  progressText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#111827',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerIcon: {
    fontSize: moderateScale(14),
    marginRight: moderateScale(4),
  },
  timerText: {
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  progressBarContainer: {
    width: '100%',
    height: moderateScale(8),
    backgroundColor: '#E5E7EB',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: moderateScale(4),
  },
  saveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  saveIcon: {
    fontSize: moderateScale(14),
    marginRight: moderateScale(8),
  },
  saveText: {
    fontSize: moderateScale(13),
    color: '#047857',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: moderateScale(100),
  },
  questionArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(24),
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: moderateScale(16),
  },
  questionText: {
    flex: 1,
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    lineHeight: moderateScale(26),
    paddingRight: moderateScale(8),
  },
  bookmarkButton: {
    padding: moderateScale(8),
  },
  bookmarkIcon: {
    fontSize: moderateScale(20),
  },
  bookmarkIconActive: {
    fontSize: moderateScale(20),
  },
  answerOptions: {
    marginTop: moderateScale(8),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(12),
  },
  optionCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366f1',
    borderWidth: 2,
  },
  radio: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
    marginTop: moderateScale(2),
  },
  radioSelected: {
    borderColor: '#6366f1',
  },
  radioDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#6366f1',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
  },
  optionLabel: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#111827',
    marginRight: moderateScale(8),
  },
  optionTextContent: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#111827',
    lineHeight: moderateScale(22),
  },
  navigationControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(8),
  },
  previousButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#6366f1',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: '#374151',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
  chevronLeft: {
    fontSize: moderateScale(18),
    color: '#374151',
    marginRight: moderateScale(8),
  },
  chevronRight: {
    fontSize: moderateScale(18),
    color: '#FFFFFF',
    marginLeft: moderateScale(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    width: '100%',
    maxWidth: moderateScale(400),
    alignItems: 'center',
  },
  modalIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  errorIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  modalIcon: {
    fontSize: moderateScale(24),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: moderateScale(24),
    lineHeight: moderateScale(20),
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: moderateScale(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmButton: {
    backgroundColor: '#6366f1',
  },
  cancelButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: '#374151',
  },
  confirmButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AssessmentScreen;
