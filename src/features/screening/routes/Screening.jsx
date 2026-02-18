import { useState, useEffect, useMemo, useRef } from 'react';
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
import logoPrimaryAlt from '@/assets/logo-primary-alt.svg';
import styles from './Screening.module.css';
import VANTA from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';

// ============= HELPER FUNCTIONS =============

/**
 * Calculate age from date of birth (YYYY-MM-DD format)
 */
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// ============= TRANSFORM & SUBMIT FUNCTIONS =============

function transformToJSON(screeningData, userId = null, user = null) {
  // Use user data for demographic fields if user is authenticated
  const age =
    user && user.dob ? calculateAge(user.dob) : parseInt(screeningData.age);

  const gender =
    user && user.gender
      ? toApiGender(user.gender)
      : toApiGender(screeningData.gender);

  const occupation =
    user && user.occupation
      ? toApiOccupation(user.occupation)
      : toApiOccupation(screeningData.occupation);

  // Handle work_mode and work_screen_hours for Unemployed/Retired
  const isUnemployedOrRetired =
    occupation === 'unemployed' ||
    occupation === 'retired' ||
    (user &&
      (user.occupation === 'Unemployed' || user.occupation === 'Retired')) ||
    screeningData.occupation === 'Unemployed' ||
    screeningData.occupation === 'Retired';

  const workMode = isUnemployedOrRetired
    ? toApiWorkMode('Unemployed')
    : user && user.workRmt
      ? toApiWorkMode(user.workRmt)
      : toApiWorkMode(screeningData.work_mode);

  const workScreenHours = isUnemployedOrRetired
    ? 0
    : parseFloat(screeningData.work_screen_hours);

  const payload = {
    age: age,
    gender: gender,
    occupation: occupation,
    work_mode: workMode,
    work_screen_hours: workScreenHours,
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
    question: 'How many hours of screen time for work today?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 6',
    min: 0,
    max: 24,
  },
  {
    key: 'leisure_screen_hours',
    question: 'How many hours of screen time for leisure today?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 2',
    min: 0,
    max: 24,
  },
  {
    key: 'sleep_hours',
    question: 'How many hours of sleep did you get last night?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 7',
    min: 0,
    max: 24,
  },
  {
    key: 'sleep_quality_1_5',
    question: 'How was your sleep quality?',
    type: QUESTION_TYPES.SLIDER,
    min: 1,
    max: 5,
    step: 1,
    minLabel: 'Poor',
    maxLabel: 'Excellent',
  },
  {
    key: 'stress_level_0_10',
    question: 'How stressed do you feel?',
    type: QUESTION_TYPES.SLIDER,
    min: 0,
    max: 10,
    step: 1,
    minLabel: 'No stress',
    maxLabel: 'Very stressed',
  },
  {
    key: 'productivity_0_100',
    question: 'How productive do you feel?',
    type: QUESTION_TYPES.SLIDER,
    min: 0,
    max: 100,
    step: 5,
    minLabel: '0%',
    maxLabel: '100%',
  },
  {
    key: 'exercise_minutes_per_week',
    question: 'How many minutes did you exercise within the last 7 days?',
    type: QUESTION_TYPES.NUMBER,
    placeholder: 'e.g. 150',
    min: 0,
    max: 10080,
  },
  {
    key: 'social_hours_per_week',
    question: 'How many hours did you socialize within the last 7 days?',
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

  // Track if we've initialized answers from user data
  const hasInitialized = useRef(false);

  // Ref for Vanta background
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Filter questions based on user authentication and occupation
  // For authenticated users, exclude demographic questions entirely
  const activeQuestions = useMemo(() => {
    return questions.filter((question) => {
      // Exclude demographic questions for authenticated users
      if (user) {
        if (
          question.key === 'age' ||
          question.key === 'gender' ||
          question.key === 'occupation' ||
          question.key === 'work_mode'
        ) {
          return false;
        }
      }

      // Exclude work_mode and work_screen_hours if occupation is Unemployed or Retired
      const occupation = user?.occupation || answers.occupation;
      if (
        (question.key === 'work_mode' ||
          question.key === 'work_screen_hours') &&
        (occupation === 'Unemployed' || occupation === 'Retired')
      ) {
        return false;
      }

      return true;
    });
  }, [user, answers.occupation]);

  // Initialize answers with user data for authenticated users (only once)
  useEffect(() => {
    if (user && !hasInitialized.current) {
      hasInitialized.current = true;

      const initialAnswers = {};

      // Pre-fill demographic data from user profile
      if (user.dob) {
        initialAnswers.age = calculateAge(user.dob)?.toString() || '';
      }
      if (user.gender) {
        initialAnswers.gender = user.gender;
      }
      if (user.occupation) {
        initialAnswers.occupation = user.occupation;
      }

      // Auto-set work_mode and work_screen_hours for Unemployed or Retired
      if (user.occupation === 'Unemployed' || user.occupation === 'Retired') {
        initialAnswers.work_mode = 'Unemployed';
        initialAnswers.work_screen_hours = '0';
      } else if (user.workRmt) {
        initialAnswers.work_mode = user.workRmt;
      }

      // Use queueMicrotask to defer setState to avoid synchronous state update warning
      queueMicrotask(() => {
        setAnswers(initialAnswers);
      });
    }
  }, [user]);

  // Initialize Vanta fog effect
  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = VANTA({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0xfffbea,
        midtoneColor: 0xfffbea,
        lowlightColor: 0xfffbea,
        baseColor: 0x869959,
        blurFactor: 0.3,
        speed: 0.15,
        zoom: 0.1,
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const currentQ = activeQuestions[currentIndex];
  const isLastQuestion = currentIndex === activeQuestions.length - 1;

  // Calculate progress based on active questions only
  const totalQuestions = activeQuestions.length;
  const answeredQuestions = currentIndex + 1;
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
      setCurrentIndex(currentIndex + 1);
      setErrorMsg('');
    }
  };

  // Handle back
  const handleBack = () => {
    setErrorMsg('');
    setIsGoingBack(true);
    setCurrentIndex(currentIndex - 1);
  };

  // Submit screening
  const submitScreening = async (finalAnswers) => {
    setIsLoading(true);

    try {
      const uid = user?.userId || user?.id || user?.user_id;
      const transformedData = transformToJSON(finalAnswers, uid, user);

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
  const stages = activeQuestions.map((question, index) => (
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
          theme="light"
          href={user ? '/dashboard' : '/'}
          icon={<FontAwesomeIcon icon={faChevronLeft} />}
          className={styles.exitButton}
        >
          Back to Home
        </Button>
        <img src={logoPrimaryAlt} alt="MindSync" className={styles.logo} />
      </div>

      <div ref={vantaRef} className={styles.wrapper}>
        <Card
          padded
          clipOverflow={false}
          elevation="lg"
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
                  className={styles.backButton}
                  fullWidth
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
              fullWidth
            >
              {isLoading ? 'Submitting...' : isLastQuestion ? 'Finish' : 'Next'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
