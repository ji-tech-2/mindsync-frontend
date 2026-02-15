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
  const categories = ['healthy', 'average', 'not healthy', 'dangerous'];
  return categories[Math.floor(Math.random() * categories.length)];
};

const generateMockUserId = () =>
  'mock-user-' + Math.random().toString(36).substr(2, 9);

// Mock user data store (in-memory)
let mockUser = {
  userId: 'mock-user-12345',
  email: 'demo@mindsync.my',
  name: 'Demo User',
  gender: 'Male',
  occupation: 'Professional',
  workRmt: 'Hybrid',
  dateOfBirth: '1995-05-15',
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
 * Change password (mock)
 */
export async function changePassword(email, otp, newPassword) {
  await delay(700);

  console.log(
    '🎭 [MOCK] Change password:',
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
      wellness_analysis: [
        'Your mental wellness score indicates ' +
          screening.health_level +
          ' level.',
        'Consider maintaining a balanced lifestyle with regular exercise and adequate sleep.',
        'Social connections play a crucial role in mental well-being.',
      ],
      advice: {
        factors: {
          'Sleep Quality': {
            advices: [
              'Try to maintain a consistent sleep schedule.',
              'Create a relaxing bedtime routine.',
            ],
            references: ['Sleep Foundation', 'NIH Sleep Studies'],
          },
          'Stress Level': {
            advices: [
              'Practice mindfulness or meditation daily.',
              'Take regular breaks during work.',
            ],
            references: ['APA Stress Management', 'Mayo Clinic'],
          },
        },
      },
    },
    created_at: screening.created_at,
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
export async function getScreeningHistory(userId) {
  await delay(600);

  console.log('🎭 [MOCK] Get screening history:', userId);

  // Generate mock history if empty
  if (mockScreenings.length === 0) {
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      mockScreenings.push({
        prediction_id: 'mock-pred-' + i,
        user_id: userId,
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
export async function getWeeklyChart(userId) {
  await delay(500);

  console.log('🎭 [MOCK] Get weekly chart:', userId);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    data.push({
      label: dayLabels[date.getDay()],
      date: date.toISOString().split('T')[0],
      mental_health_index: randomScore(),
    });
  }

  return {
    status: 'success',
    data: data,
    days: 7,
  };
}

/**
 * Get streak data (mock)
 */
export async function getStreak(userId) {
  await delay(400);

  console.log('🎭 [MOCK] Get streak:', userId);

  // Calculate completed days for current week
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  const diff = (currentDay === 0 ? -6 : 1) - currentDay;
  startOfWeek.setDate(today.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Generate 2-4 random completed days this week
  const completedDays = [];
  const numCompletedDays = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < numCompletedDays; i++) {
    const dayOffset = Math.floor(Math.random() * 7);
    const completedDate = new Date(startOfWeek);
    completedDate.setDate(startOfWeek.getDate() + dayOffset);
    const dateStr = completedDate.toISOString().split('T')[0];
    if (!completedDays.includes(dateStr)) {
      completedDays.push(dateStr);
    }
  }

  return {
    status: 'success',
    data: {
      daily: {
        current: Math.floor(Math.random() * 30) + 1,
        longest: Math.floor(Math.random() * 60) + 10,
      },
      weekly: {
        current: Math.floor(Math.random() * 15) + 1,
        longest: Math.floor(Math.random() * 30) + 5,
      },
      completed_days_this_week: completedDays,
      total_screenings: Math.floor(Math.random() * 100) + 20,
      last_screening_date: new Date().toISOString(),
    },
  };
}

/**
 * Get weekly critical factors (mock)
 */
export async function getWeeklyCriticalFactors(userId) {
  await delay(700);

  console.log('🎭 [MOCK] Get weekly critical factors:', userId);

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
export async function getDailySuggestion(userId) {
  await delay(450);

  console.log('🎭 [MOCK] Get daily suggestion:', userId);

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
