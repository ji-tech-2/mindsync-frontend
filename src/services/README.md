# API Service Layer

This directory contains the abstracted API service layer for MindSync Frontend.

## Overview

The API service layer provides a clean abstraction between components and API calls. Components should never directly make HTTP requests or know about API URLs - instead, they import and use service functions.

## Architecture

```
src/services/
├── index.js              # Environment-based switcher (exports appropriate implementation)
├── api.service.js        # Real API implementation (production/backend calls)
└── api.service.mock.js   # Mock API implementation (for local development without backend)
```

## Usage

### Importing Services

```javascript
import {
  signIn,
  register,
  getProfile,
  submitScreening,
  getScreeningHistory,
} from '@/services';
```

### Example: Authentication

```javascript
// Sign in
try {
  const data = await signIn(email, password);
  if (data.success) {
    console.log('User:', data.user);
  }
} catch (error) {
  console.error('Sign in failed:', error.message);
}

// Register
try {
  const data = await register({
    email,
    password,
    name,
    gender,
    occupation,
    workRmt,
  });
  if (data.success) {
    console.log('Registration successful');
  }
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

### Example: Profile Management

```javascript
// Get profile
const data = await getProfile();
console.log('User data:', data.data);

// Update profile
const result = await updateProfile({
  name: 'New Name',
  occupation: 'Student',
});
```

### Example: Screening

```javascript
// Submit screening
const result = await submitScreening({
  age: 25,
  gender: 'M',
  occupation: 'professional',
  work_mode: 'hybrid',
  sleep_hours: 7,
  stress_level_0_10: 5,
  // ... other fields
});

// Get prediction result
const predictionData = await getPredictionResult(predictionId);

// Poll for complete result
const completeResult = await pollPredictionResult(predictionId, 120, 1000);
```

### Example: Dashboard Data

```javascript
// Get screening history
const history = await getScreeningHistory(userId);

// Get weekly chart
const chart = await getWeeklyChart(userId);

// Get streak data
const streak = await getStreak(userId);

// Get critical factors
const factors = await getWeeklyCriticalFactors(userId);

// Get daily suggestion
const suggestion = await getDailySuggestion(userId);
```

## Mock Mode

For local development without a backend server, you can enable mock mode:

### Enable Mock Mode

1. Create `.env.local` file in project root:

   ```bash
   VITE_USE_MOCK_API=true
   ```

2. Or run with environment variable:
   ```bash
   VITE_USE_MOCK_API=true npm run dev
   ```

### Mock Data Behavior

- **Authentication**: Always succeeds (unless you use demo credentials)
- **Predictions**: Returns random scores and categories with simulated delays
- **History**: Generates 10 random screenings
- **Dashboard**: Returns randomized chart data, streaks, and suggestions
- **Profile**: Uses in-memory storage for profile updates

### Mock User Credentials

Default mock user:

- Email: `demo@mindsync.my`
- Password: Any password (except 'wrongpassword')
- User ID: `mock-user-12345`

## Available Service Functions

### Authentication

- `signIn(email, password)` - Sign in user
- `register(userData)` - Register new user
- `requestOTP(email)` - Request OTP for password reset
- `changePassword(email, otp, newPassword)` - Change password with OTP

### Profile

- `getProfile()` - Get user profile
- `updateProfile(updateData)` - Update user profile

### Screening/Prediction

- `submitScreening(screeningData)` - Submit screening
- `getPredictionResult(predictionId)` - Get prediction result
- `pollPredictionResult(predictionId, maxAttempts, intervalMs)` - Poll until ready

### History

- `getScreeningHistory(userId)` - Get user's screening history

### Dashboard

- `getWeeklyChart(userId)` - Get weekly chart data
- `getStreak(userId)` - Get user's streak data
- `getWeeklyCriticalFactors(userId)` - Get critical factors
- `getDailySuggestion(userId)` - Get daily suggestion

## Migration Guide

If you have existing code that calls APIs directly:

### Before

```javascript
import apiClient, { API_CONFIG } from '@/config/api';

const response = await apiClient.post(API_CONFIG.AUTH_LOGIN, {
  email,
  password,
});
const data = response.data;
```

### After

```javascript
import { signIn } from '@/services';

const data = await signIn(email, password);
```

### Before

```javascript
const url = API_URLS.streak(userId);
const response = await fetch(url);
const data = await response.json();
```

### After

```javascript
import { getStreak } from '@/services';

const data = await getStreak(userId);
```

## Benefits

1. **Abstraction**: Components don't know about URLs or HTTP implementation
2. **Testability**: Easy to mock services in tests
3. **Flexibility**: Switch between real and mock implementations
4. **Consistency**: All API calls follow the same pattern
5. **Maintainability**: API changes only require updating service files

## Environment Variables

- `VITE_USE_MOCK_API`: Set to `'true'` to enable mock mode (default: `false`)

## Notes

- Mock mode is only available in **development** (`npm run dev`)
- Production builds always use real API endpoints
- The service layer handles all HTTP errors and returns standardized responses
- All service functions are async and return Promises
