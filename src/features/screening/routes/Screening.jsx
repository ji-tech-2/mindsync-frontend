import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { submitScreening as submitScreeningService } from '@/services';
import {
  toApiGender,
  toApiOccupation,
  toApiWorkMode,
} from '@/utils/fieldMappings';
import {
  Card,
  Button,
  TextField,
  StageContainer,
  FormSection,
  Message,
} from '@/components';
import MultipleChoice from '../components/MultipleChoice';
import Slider from '../components/Slider';
import QuestionLayout from '../components/QuestionLayout';
import ProgressBar from '../components/ProgressBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import logoSubmark from '@/assets/logo-submark.svg';
import styles from './Screening.module.css';

// ============= TRANSFORM & SUBMIT FUNCTIONS =============

function transformToJSON(screeningData, userId = null) {
  const payload = {
    age: parseInt(screeningData.age),
    gender: toApiGender(screeningData.gender),
    occupation: toApiOccupation(screeningData.occupation),
    work_mode: toApiWorkMode(screeningData.work_mode),
    work_screen_hours: parseFloat(screeningData.work_screen_hours),
    leisure_screen_hours: parseFloat(screeningData.leisure_screen_hours),
    sleep_hours: parseFloat(screeningData.sleep_hours),
    sleep_quality_1_5: parseInt(screeningData.sleep_quality_1_5),
    stress_level_0_10: parseFloat(screeningData.stress_level_0_10),
    productivity_0_100: parseFloat(screeningData.productivity_0_100),
    exercise_minutes_per_week: parseInt(
      screeningData.exercise_minutes_per_week
    ),
    social_hours_per_week: parseFloat(screeningData.social_hours_per_week),
    mental_wellness_index_0_100: null,
  };

  if (userId) {
    payload.user_id = userId;
  }

  return payload;
}

// ============= QUESTION DEFINITIONS =============

const QUESTION_TYPES = {
  NUMBER: 'number',
  MULTIPLE_CHOICE: 'multipleChoice',
  SLIDER: 'slider',
};

const questions = [
  {
    key: 'age',
    question: 'How old are you?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 25',
    min: 16,
    max: 100,
  },
  {
    key: 'gender',
    question: 'What is your gender?',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: ['Male', 'Female'],
  },
  {
    key: 'occupation',
    question: 'What is your current employment status?',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: ['Employed', 'Unemployed', 'Student', 'Freelancer', 'Retired'],
  },
  {
    key: 'work_mode',
    question: 'What is your work mode?',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    options: ['Remote', 'Hybrid', 'On-site', 'Unemployed'],
  },
  {
    key: 'work_screen_hours',
    question: 'How many hours of screen time for work per day?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 6',
    min: 0,
    max: 24,
  },
  {
    key: 'leisure_screen_hours',
    question: 'How many hours of screen time for leisure per day?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 2',
    min: 0,
    max: 24,
  },
  {
    key: 'sleep_hours',
    question: 'How many hours of sleep do you get on average per day?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 7',
    min: 0,
    max: 24,
  },
  {
    key: 'sleep_quality_1_5',
    question: 'How is your sleep quality?',
    type: QUESTION_TYPES.SLIDER,
    min: 1,
    max: 5,
    step: 1,
    minLabel: 'Poor',
    maxLabel: 'Excellent',
  },
  {
    key: 'stress_level_0_10',
    question: 'How high is your stress level?',
    type: QUESTION_TYPES.SLIDER,
    min: 0,
    max: 10,
    step: 1,
    minLabel: 'No stress',
    maxLabel: 'Very stressed',
  },
  {
    key: 'productivity_0_100',
    question: 'What is your productivity level?',
    type: QUESTION_TYPES.SLIDER,
    min: 0,
    max: 100,
    step: 5,
    minLabel: '0%',
    maxLabel: '100%',
  },
  {
    key: 'exercise_minutes_per_week',
    question: 'How many minutes do you exercise per week?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 150',
    min: 0,
    max: 10080,
  },
  {
    key: 'social_hours_per_week',
    question: 'How many hours do you socialize per week?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 10',
    min: 0,
    max: 168,
  },
];

// ============= MAIN COMPONENT =============

export default function Screening() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to check if a question should be skipped
  const shouldSkipQuestion = (questionIndex, currentAnswers) => {
    const question = questions[questionIndex];

    // Skip work_mode and work_screen_hours if occupation is Unemployed or Retired
    if (
      (question.key === 'work_mode' || question.key === 'work_screen_hours') &&
      (currentAnswers.occupation === 'Unemployed' ||
        currentAnswers.occupation === 'Retired')
    ) {
      return true;
    }

    return false;
  };

  // Find next non-skipped question index
  const findNextQuestionIndex = (fromIndex, currentAnswers) => {
    let nextIndex = fromIndex + 1;
    while (
      nextIndex < questions.length &&
      shouldSkipQuestion(nextIndex, currentAnswers)
    ) {
      nextIndex++;
    }
    return nextIndex;
  };

  // Find previous non-skipped question index
  const findPreviousQuestionIndex = (fromIndex, currentAnswers) => {
    let prevIndex = fromIndex - 1;
    while (prevIndex >= 0 && shouldSkipQuestion(prevIndex, currentAnswers)) {
      prevIndex--;
    }
    return prevIndex;
  };

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Calculate progress (only for non-skipped questions)
  const totalQuestions = questions.filter(
    (_, idx) => !shouldSkipQuestion(idx, answers)
  ).length;
  const answeredQuestions = questions
    .slice(0, currentIndex + 1)
    .filter((_, idx) => !shouldSkipQuestion(idx, answers)).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  // Validation
  const validateAnswer = (question, value) => {
    if (value === '' || value === null || value === undefined) {
      return 'This field is required';
    }

    if (question.type === QUESTION_TYPES.NUMBER) {
      const num = Number(value);

      if (isNaN(num)) {
        return 'Please enter a valid number';
      }

      if (question.min !== undefined && num < question.min) {
        return `Minimum value is ${question.min}`;
      }

      if (question.max !== undefined && num > question.max) {
        return `Maximum value is ${question.max}`;
      }
    }

    return '';
  };

  // Handle answer change
  const handleAnswerChange = (value) => {
    const updatedAnswers = {
      ...answers,
      [currentQ.key]: value,
    };
    setAnswers(updatedAnswers);
    setErrors({ ...errors, [currentQ.key]: '' });
    setErrorMsg('');
  };

  // Handle next
  const handleNext = async (overrideValue, overrideAnswers) => {
    const valueToValidate = overrideValue ?? answers[currentQ.key];
    const answersToUse = overrideAnswers ?? answers;

    const error = validateAnswer(currentQ, valueToValidate);

    if (error) {
      setErrors({ ...errors, [currentQ.key]: error });
      setErrorMsg(error);
      return;
    }

    const updatedAnswers = {
      ...answersToUse,
      [currentQ.key]: valueToValidate,
    };

    // Auto-set work_mode and work_screen_hours if occupation is Unemployed or Retired
    if (
      currentQ.key === 'occupation' &&
      (valueToValidate === 'Unemployed' || valueToValidate === 'Retired')
    ) {
      updatedAnswers.work_mode = 'Unemployed';
      updatedAnswers.work_screen_hours = '0';
    }

    setAnswers(updatedAnswers);
    setIsGoingBack(false);

    if (isLastQuestion) {
      await submitScreening(updatedAnswers);
    } else {
      const nextIndex = findNextQuestionIndex(currentIndex, updatedAnswers);
      if (nextIndex < questions.length) {
        setCurrentIndex(nextIndex);
        setErrorMsg('');
      }
    }
  };

  // Handle back
  const handleBack = () => {
    setErrorMsg('');
    setIsGoingBack(true);
    const prevIndex = findPreviousQuestionIndex(currentIndex, answers);

    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
    }
  };

  // Submit screening
  const submitScreening = async (finalAnswers) => {
    setIsLoading(true);

    try {
      const transformedData = transformToJSON(finalAnswers);

      if (user) {
        const uid = user?.userId || user?.id || user?.user_id;
        if (uid) {
          transformedData.user_id = uid;
        }
      }

      const result = await submitScreeningService(transformedData);

      if (result.prediction_id) {
        navigate(`/result/${result.prediction_id}`);
      } else {
        setErrorMsg(
          'Failed to submit screening: ' +
            (result.error || result.message || 'Unknown error')
        );
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMsg('An error occurred: ' + error.message);
      setIsLoading(false);
    }
  };

  // Render input based on question type
  const renderInput = (question) => {
    const currentValue = answers[question.key];
    const hasError = !!errors[question.key];

    switch (question.type) {
      case QUESTION_TYPES.NUMBER:
        return (
          <TextField
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={isLoading}
            error={hasError}
            fullWidth
          />
        );

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return (
          <MultipleChoice
            options={question.options}
            value={currentValue}
            onChange={handleAnswerChange}
            disabled={isLoading}
            error={hasError}
          />
        );

      case QUESTION_TYPES.SLIDER:
        return (
          <Slider
            min={question.min}
            max={question.max}
            step={question.step}
            value={currentValue || question.min}
            onChange={handleAnswerChange}
            minLabel={question.minLabel}
            maxLabel={question.maxLabel}
            disabled={isLoading}
            error={hasError}
          />
        );

      default:
        return null;
    }
  };

  // Create stages for StageContainer
  const stages = questions.map((question, index) => (
    <QuestionLayout key={question.key} question={question.question}>
      <FormSection>{renderInput(question)}</FormSection>
      {currentIndex === index && errorMsg && (
        <Message type="error" className={styles.message}>
          {errorMsg}
        </Message>
      )}
    </QuestionLayout>
  ));

  return (
    <>
      <div className={styles.header}>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          icon={<FontAwesomeIcon icon={faChevronLeft} />}
          className={styles.exitButton}
        >
          Back to Home
        </Button>
        <img src={logoSubmark} alt="MindSync" className={styles.logo} />
      </div>

      <div className={styles.wrapper}>
        <Card
          padded
          clipOverflow={false}
          elevation="lg"
          variant="light"
          className={styles.card}
        >
          <ProgressBar progress={progress} className={styles.progressBar} />

          <div className={styles.contentArea}>
            <StageContainer
              stages={stages}
              currentStage={currentIndex}
              isGoingBack={isGoingBack}
              animateHeight={false}
            />
          </div>

          <div className={styles.buttonContainer}>
            <div className={styles.backButtonWrapper}>
              {currentIndex > 0 && !isLoading && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  icon={<FontAwesomeIcon icon={faChevronLeft} />}
                  aria-label="Back"
                >
                  Back
                </Button>
              )}
            </div>

            <Button
              variant="filled"
              onClick={() => handleNext()}
              disabled={isLoading || !answers[currentQ.key]}
              icon={<FontAwesomeIcon icon={faChevronRight} />}
              iconPosition="right"
              className={styles.nextButton}
            >
              {isLoading ? 'Submitting...' : isLastQuestion ? 'Finish' : 'Next'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
