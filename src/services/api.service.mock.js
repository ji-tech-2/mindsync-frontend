/**
 * Mock API Service Implementation
 *
 * This service provides mock data for local development without a backend.
 * Returns hardcoded/random values to simulate real API responses.
 */

// ====================================
// HELPER FUNCTIONS
// ====================================

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// LocalStorage keys for mock session
const MOCK_SESSION_KEY = 'mock_isLoggedIn';

// Helper functions for localStorage
const getMockSession = () => {
  try {
    return localStorage.getItem(MOCK_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

const setMockSession = (value) => {
  try {
    if (value) {
      localStorage.setItem(MOCK_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(MOCK_SESSION_KEY);
    }
  } catch (e) {
    console.warn('Failed to update mock session in localStorage:', e);
  }
};

const randomScore = () => Math.floor(Math.random() * 100);

const randomCategory = () => {
  const categories = [
    'healthy',
    'above average',
    'average',
    'not healthy',
    'dangerous',
  ];
  return categories[Math.floor(Math.random() * categories.length)];
};

// Derive health_level from a numeric score (mirrors backend categorization)
const scoreToHealthLevel = (score) => {
  if (score > 80) return 'healthy';
  if (score > 61.4) return 'above average';
  if (score > 28.6) return 'average';
  if (score > 12) return 'not healthy';
  return 'dangerous';
};

const generateMockUserId = () =>
  'mock-user-' + Math.random().toString(36).substr(2, 9);

// Mock user data store (in-memory)
let mockUser = {
  userId: 'mock-user-12345',
  email: 'demo@mindsync.my',
  name: 'Demo User',
  gender: 'Male',
  occupation: 'Employed',
  workRmt: 'Hybrid',
  dob: '1995-05-15',
};

// Track if user is "logged in" (simulates session)
// Initialize from localStorage to persist across page refreshes
let isLoggedIn = getMockSession();

// Mock screenings store
let mockScreenings = [];

// ====================================
// AUTHENTICATION SERVICES
// ====================================

/**
 * Sign in user (mock)
 */
export async function signIn(email, password) {
  await delay(800);

  console.log('🎭 [MOCK] Sign in:', email);

  // Simulate validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (password === 'wrongpassword') {
    throw new Error('Invalid email or password');
  }

  isLoggedIn = true; // Mark user as logged in
  setMockSession(true); // Persist to localStorage

  return {
    success: true,
    user: {
      ...mockUser,
      email: email,
    },
    message: 'Sign in successful',
  };
}

/**
 * Register new user (mock)
 */
export async function register(userData) {
  await delay(1000);

  console.log('🎭 [MOCK] Register:', userData);

  // Simulate validation
  if (!userData.email || !userData.password) {
    throw new Error('Email and password are required');
  }

  if (userData.email === 'taken@example.com') {
    throw new Error('Email already registered');
  }

  // Update mock user
  mockUser = {
    ...mockUser,
    ...userData,
    userId: generateMockUserId(),
  };

  return {
    success: true,
    message: 'Registration successful',
    userId: mockUser.userId,
  };
}

/**
 * Request OTP (mock)
 */
export async function requestOTP(email) {
  await delay(600);

  console.log('🎭 [MOCK] Request OTP:', email);

  return {
    success: true,
    message: 'OTP sent successfully (mock: 123456)',
  };
}

/**
 * Request OTP for signup email verification (mock)
 */
export async function requestSignupOTP(email) {
  await delay(600);

  console.log('🎭 [MOCK] Request Signup OTP:', email);

  return {
    success: true,
    message: 'OTP sent to your email for verification (mock: 123456)',
  };
}

/**
 * Verify OTP (mock)
 */
export async function verifyOTP(email, otp) {
  await delay(500);

  console.log('🎭 [MOCK] Verify OTP:', email, 'OTP:', otp);

  // Simulate OTP validation
  if (otp !== '123456' && otp !== '000000') {
    return {
      success: false,
      message: 'Invalid OTP',
    };
  }

  return {
    success: true,
    message: 'OTP verified successfully',
  };
}

/**
 * Reset password with OTP (mock - forgot password flow)
 */
export async function resetPassword(email, otp, newPassword) {
  await delay(700);

  console.log(
    '🎭 [MOCK] Reset password:',
    email,
    'New password length:',
    newPassword?.length
  );

  // Simulate OTP validation
  if (otp !== '123456' && otp !== '000000') {
    throw new Error('Invalid OTP');
  }

  return {
    success: true,
    message: 'Password reset successfully',
  };
}

/**
 * Change password (mock - authenticated user)
 */
export async function changePassword(oldPassword, newPassword) {
  await delay(700);

  console.log(
    '🎭 [MOCK] Change password:',
    'Old password length:',
    oldPassword?.length,
    'New password length:',
    newPassword?.length
  );

  // Simulate old password validation
  if (oldPassword !== 'test123') {
    throw new Error('Invalid old password');
  }

  return {
    success: true,
    message: 'Password changed successfully',
  };
}

/**
 * Logout user (mock)
 * Note: Logout is primarily handled client-side by clearing tokens/storage,
 * but this function simulates any server-side session cleanup
 */
export async function logout() {
  await delay(300);

  console.log('🎭 [MOCK] Logout');

  isLoggedIn = false; // Clear mock session
  setMockSession(false); // Remove from localStorage

  return {
    success: true,
    message: 'Logged out successfully',
  };
}

// ====================================
// PROFILE SERVICES
// ====================================

/**
 * Get user profile (mock)
 * Also used for session validation
 */
export async function getProfile() {
  await delay(400);

  // Sync with localStorage in case it was cleared externally
  isLoggedIn = getMockSession();

  console.log('🎭 [MOCK] Get profile (logged in:', isLoggedIn, ')');

  // Simulate session validation - throw 401 if not logged in
  if (!isLoggedIn) {
    const error = new Error('Unauthorized');
    error.response = { status: 401 };
    throw error;
  }

  return {
    success: true,
    data: mockUser,
  };
}

/**
 * Update user profile (mock)
 */
export async function updateProfile(updateData) {
  await delay(500);

  console.log('🎭 [MOCK] Update profile:', updateData);

  // Update mock user
  mockUser = {
    ...mockUser,
    ...updateData,
  };

  return {
    success: true,
    data: mockUser,
    message: 'Profile updated successfully',
  };
}

// ====================================
// SCREENING/PREDICTION SERVICES
// ====================================

/**
 * Submit screening (mock)
 */
export async function submitScreening(screeningData) {
  await delay(1200);

  console.log('🎭 [MOCK] Submit screening:', screeningData);

  const predictionId = 'mock-pred-' + Date.now();

  // Create mock screening result
  const mockScreening = {
    prediction_id: predictionId,
    user_id: mockUser.userId,
    prediction_score: randomScore(),
    health_level: randomCategory(),
    created_at: new Date().toISOString(),
    ...screeningData,
  };

  mockScreenings.unshift(mockScreening);

  return {
    success: true,
    prediction_id: predictionId,
    message: 'Prediction submitted successfully',
  };
}

/**
 * Get prediction result (mock)
 */
export async function getPredictionResult(predictionId) {
  await delay(300);

  console.log('🎭 [MOCK] Get prediction result:', predictionId);

  // Find in mock screenings
  const screening = mockScreenings.find(
    (s) => s.prediction_id === predictionId
  );

  if (!screening) {
    return {
      status: 'not_found',
      message: 'Prediction not found',
    };
  }

  // Simulate processing delay
  const elapsedTime = Date.now() - new Date(screening.created_at).getTime();

  if (elapsedTime < 2000) {
    return {
      status: 'processing',
      message: 'Prediction is being processed',
    };
  }

  if (elapsedTime < 4000) {
    return {
      status: 'partial',
      result: {
        prediction_score: screening.prediction_score,
        health_level: screening.health_level,
      },
      created_at: screening.created_at,
    };
  }

  // Full result with advice
  return {
    status: 'ready',
    result: {
      prediction_score: screening.prediction_score,
      health_level: screening.health_level,
      wellness_analysis: {
        areas_for_improvement: [
          {
            coefficient: -7.708023045106089,
            feature: 'num__stress_level_0_10',
            gap: -13.476303537230262,
            healthy_value: 1.261078271424113,
            impact_score: 103.87565822781556,
            user_value: 14.737381808654375,
          },
          {
            coefficient: 1.3923502241791008,
            feature: 'num__exercise_minutes_per_week',
            gap: 21.59400647241156,
            healthy_value: 0.0705779658016611,
            impact_score: 30.06641975278719,
            user_value: -21.5234285066099,
          },
          {
            coefficient: -0.6968952607036991,
            feature: 'num__age sleep_hours',
            gap: -14.72104484465572,
            healthy_value: 0.4084028258779459,
            impact_score: 10.259026384847195,
            user_value: 15.129447670533667,
          },
        ],
        strengths: [
          {
            coefficient: 0.6065220827316351,
            feature: 'num__work_screen_hours leisure_screen_hours',
            gap: -12.879865517309193,
            healthy_value: 1.47691134538777,
            impact_score: -7.811922858861741,
            user_value: 14.356776862696963,
          },
          {
            coefficient: -3.662036609502586,
            feature: 'num__stress_level_0_10 productivity_0_100',
            gap: 1.5366830521824395,
            healthy_value: 0.1910586846886553,
            impact_score: -5.627389594294266,
            user_value: -1.3456243674937842,
          },
        ],
      },
      advice: {
        description:
          "It's wonderful to see your strong foundation for well-being. Even with a solid base, it's completely normal to experience fluctuations and face challenges in areas like managing stress, maintaining consistent physical activity, and optimizing sleep patterns. Acknowledging these aspects is a significant step towards nurturing your overall health, and we're here to support you in refining these vital areas.",
        factors: {
          'num__age sleep_hours': {
            advices: [
              'Establish a consistent sleep schedule, going to bed and waking up at roughly the same time each day, even on weekends.',
              "Create a relaxing bedtime routine, such as reading, taking a warm bath, or listening to calming music, to signal to your body it's time to wind down.",
              'Optimize your sleep environment by ensuring your bedroom is dark, quiet, cool, and free from electronic devices.',
            ],
            references: [
              {
                title: '5 Ways to Get Better Sleep',
                url: 'https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/5-ways-to-get-better-sleep',
              },
              {
                title: 'Sleep Hygiene',
                url: 'https://www.sleepfoundation.org/sleep-hygiene',
              },
              {
                title: 'About Sleep',
                url: 'https://www.cdc.gov/sleep/about/index.html',
              },
            ],
          },
          num__exercise_minutes_per_week: {
            advices: [
              'Start with short, manageable bursts of activity (e.g., 10-minute walks) and gradually increase duration or intensity as you feel comfortable.',
              "Find an activity you genuinely enjoy, whether it's dancing, gardening, cycling, or team sports, to make consistency easier.",
              'Incorporate movement into your daily routine by taking stairs, parking further away, or doing quick stretches during breaks.',
            ],
            references: [
              {
                title: 'Physical Activity Fact Sheet',
                url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
              },
              {
                title: 'Boost Your Health with Activity Snacks',
                url: 'https://newsnetwork.mayoclinic.org/discussion/mayo-clinic-minute-boost-your-health-and-productivity-with-activity-snacks/',
              },
            ],
          },
          num__stress_level_0_10: {
            advices: [
              'Practice mindfulness or deep breathing exercises for 5-10 minutes daily to calm your nervous system.',
              'Identify your main stressors and explore practical strategies to mitigate or manage them, such as time management or setting boundaries.',
              'Engage in hobbies or activities you enjoy to create a mental break and foster a sense of accomplishment and joy.',
            ],
            references: [
              {
                title: 'Tips for Managing Stress',
                url: 'https://www.apa.org/topics/stress/tips',
              },
              {
                title: 'Caring for Your Mental Health',
                url: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health',
              },
            ],
          },
        },
      },
    },
    created_at: screening.created_at,
    completed_at: new Date().toISOString(),
    numeric_completed_at: new Date(Date.now() - 2000).toISOString(),
    advisory_completed_at: new Date().toISOString(),
  };
}

/**
 * Poll prediction result (mock)
 */
export async function pollPredictionResult(
  predictionId,
  maxAttempts = 120,
  intervalMs = 1000
) {
  let attempts = 0;

  const poll = async () => {
    attempts++;
    console.log(`🎭 [MOCK] Polling attempt ${attempts}/${maxAttempts}`);

    const data = await getPredictionResult(predictionId);

    if (data.status === 'ready') {
      return {
        success: true,
        status: 'ready',
        data: data.result,
        metadata: {
          created_at: data.created_at,
          numeric_completed_at: data.numeric_completed_at,
          advisory_completed_at: data.advisory_completed_at,
        },
      };
    }

    if (data.status === 'partial') {
      return {
        success: true,
        status: 'partial',
        data: data.result,
        metadata: {
          created_at: data.created_at,
        },
      };
    }

    if (data.status === 'processing') {
      if (attempts >= maxAttempts) {
        throw new Error('Timeout: Prediction took too long to process');
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      return poll();
    }

    if (data.status === 'not_found') {
      throw new Error('Prediction ID not found');
    }

    throw new Error(`Unknown status: ${data.status}`);
  };

  return poll();
}

// ====================================
// HISTORY SERVICES
// ====================================

/**
 * Get screening history (mock)
 */
export async function getScreeningHistory() {
  await delay(600);

  console.log('🎭 [MOCK] Get screening history');

  // Generate mock history if empty
  if (mockScreenings.length === 0) {
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      mockScreenings.push({
        prediction_id: 'mock-pred-' + i,
        user_id: mockUser.userId,
        prediction_score: randomScore(),
        health_level: randomCategory(),
        created_at: date.toISOString(),
        wellness_analysis: ['Mock wellness analysis for screening ' + i],
      });
    }
  }

  return {
    status: 'success',
    data: mockScreenings,
    total: mockScreenings.length,
  };
}

// ====================================
// DASHBOARD SERVICES
// ====================================

/**
 * Get weekly chart (mock)
 */
export async function getWeeklyChart() {
  await delay(500);

  console.log('🎭 [MOCK] Get weekly chart');

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const hasData = Math.random() > 0.2; // 80% chance of having data

    const mentalHealthIndex = hasData ? randomScore() : 0;
    data.push({
      label: dayLabels[date.getDay()],
      date: date.toISOString().split('T')[0],
      has_data: hasData,
      mental_health_index: mentalHealthIndex,
      health_level: hasData ? scoreToHealthLevel(mentalHealthIndex) : null,
      work_screen: hasData ? Math.random() * 12 : 0,
      leisure_screen: hasData ? Math.random() * 8 : 0,
      sleep_duration: hasData ? 6 + Math.random() * 3 : 0,
      sleep_quality: hasData ? 1 + Math.random() * 4 : 0,
      stress_level: hasData ? Math.random() * 10 : 0,
      productivity: hasData ? 50 + Math.random() * 50 : 0,
      exercise_duration: hasData ? Math.random() * 200 : 0,
      social_activity: hasData ? Math.random() * 8 : 0,
    });
  }

  return {
    status: 'success',
    data: data,
  };
}

/**
 * Get streak data (mock)
 */
export async function getStreak() {
  await delay(400);

  console.log('🎭 [MOCK] Get streak');

  // Calculate current week dates
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  const diff = (currentDay === 0 ? -6 : 1) - currentDay;
  startOfWeek.setDate(today.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Generate daily data for current week (Mon-Sun)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyData = dayLabels.map((label, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];
    // Randomly mark some days as completed
    const hasScreening = Math.random() > 0.4;
    return {
      date: dateStr,
      label,
      has_screening: hasScreening,
    };
  });

  // Generate weekly data for last 7 weeks
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const weekStart = new Date(startOfWeek);
    weekStart.setDate(startOfWeek.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Format label
    const startMonth = weekStart.toLocaleString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endMonth = weekEnd.toLocaleString('en-US', { month: 'short' });
    const endDay = weekEnd.getDate();
    const label =
      startMonth === endMonth
        ? `${startMonth} ${startDay}-${endDay}`
        : `${startMonth} ${startDay} - ${endMonth} ${endDay}`;

    weeklyData.push({
      week_start: weekStartStr,
      week_end: weekEndStr,
      label,
      has_screening: Math.random() > 0.3,
    });
  }

  // Calculate streak counts
  const dailyStreak = Math.floor(Math.random() * 10) + 1;
  const weeklyStreak = Math.floor(Math.random() * 5) + 1;

  return {
    status: 'success',
    data: {
      user_id: mockUser.userId,
      current_streak: {
        daily: dailyStreak,
        daily_last_date: today.toISOString().split('T')[0],
        weekly: weeklyStreak,
        weekly_last_date: startOfWeek.toISOString().split('T')[0],
      },
      daily: dailyData,
      weekly: weeklyData,
    },
  };
}

/**
 * Get weekly critical factors (mock)
 */
export async function getWeeklyCriticalFactors() {
  await delay(700);

  console.log('🎭 [MOCK] Get weekly critical factors');

  return {
    status: 'success',
    top_critical_factors: [
      {
        factor_name: 'num__sleep_quality_1_5^2',
        count: 5,
        avg_impact_score: 8.5,
      },
      {
        factor_name: 'num__stress_level_0_10^2',
        count: 4,
        avg_impact_score: 7.2,
      },
      {
        factor_name: 'num__productivity_0_100',
        count: 3,
        avg_impact_score: 6.8,
      },
    ],
    advice: {
      factors: {
        'num__sleep_quality_1_5^2': {
          advices: [
            'Maintain a consistent sleep schedule.',
            'Create a relaxing bedtime routine.',
            'Avoid screens before bed.',
          ],
          references: ['Sleep Foundation', 'NIH Studies'],
        },
        'num__stress_level_0_10^2': {
          advices: [
            'Practice daily meditation or mindfulness.',
            'Take regular breaks during work.',
            'Engage in physical activity.',
          ],
          references: ['APA Guidelines', 'Mayo Clinic'],
        },
        num__productivity_0_100: {
          advices: [
            'Use time management techniques.',
            'Prioritize tasks effectively.',
            'Take regular breaks to maintain focus.',
          ],
          references: ['Productivity Research', 'Work Psychology Studies'],
        },
      },
    },
  };
}

/**
 * Get daily suggestion (mock)
 */
export async function getDailySuggestion() {
  await delay(450);

  console.log('🎭 [MOCK] Get daily suggestion');

  const suggestions = [
    'Take a 10-minute walk outside to refresh your mind.',
    'Practice deep breathing exercises for 5 minutes.',
    'Connect with a friend or family member today.',
    'Set aside 15 minutes for a hobby you enjoy.',
    'Ensure you get 7-8 hours of quality sleep tonight.',
    'Drink plenty of water throughout the day.',
    'Take regular breaks from screen time.',
    "Practice gratitude by writing down 3 things you're thankful for.",
  ];

  return {
    status: 'success',
    suggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
  };
}
