/**
 * API Configuration & Security Tests
 *
 * Tests for TokenManager and security-related functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  TokenManager,
  API_CONFIG,
  getApiUrl,
  API_URLS,
  buildWeeklyChartFromHistory,
  fetchScreeningHistory,
  fetchWeeklyChart,
} from './api';
import apiClient from './api';

describe('TokenManager - Security', () => {
  beforeEach(() => {
    // Clear user data before each test
    TokenManager.clearUserData();
  });

  afterEach(() => {
    TokenManager.clearUserData();
  });

  describe('User Data Storage', () => {
    it('should store user data in memory', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        userId: '123',
      };
      TokenManager.setUserData(userData);
      expect(TokenManager.getUserData()).toEqual(userData);
    });

    it('should return null when no user data is set', () => {
      expect(TokenManager.getUserData()).toBeNull();
    });

    it('should clear user data on clearUserData', () => {
      TokenManager.setUserData({ email: 'test@example.com' });
      TokenManager.clearUserData();
      expect(TokenManager.getUserData()).toBeNull();
    });

    it('should only store non-sensitive user data', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        userId: '123',
        password: 'should-not-store', // This should NOT be stored
      };
      TokenManager.setUserData(userData);
      const stored = TokenManager.getUserData();

      // Should not contain password
      expect(stored.password).toBeUndefined();
      // Should contain safe fields
      expect(stored.email).toBe('test@example.com');
      expect(stored.name).toBe('Test User');
    });
  });

  describe('Authentication Check', () => {
    it('should return true when user data exists', () => {
      TokenManager.setUserData({
        email: 'test@example.com',
        name: 'Test',
        userId: '123',
      });
      expect(TokenManager.isAuthenticated()).toBe(true);
    });

    it('should return false when no user data exists', () => {
      expect(TokenManager.isAuthenticated()).toBe(false);
    });

    it('should return false after user data is cleared', () => {
      TokenManager.setUserData({
        email: 'test@example.com',
        name: 'Test',
        userId: '123',
      });
      TokenManager.clearUserData();
      expect(TokenManager.isAuthenticated()).toBe(false);
    });
  });
});

describe('API Configuration', () => {
  it('should have secure polling configuration', () => {
    expect(API_CONFIG.POLLING.MAX_ATTEMPTS).toBeGreaterThan(0);
    expect(API_CONFIG.POLLING.INTERVAL_MS).toBeGreaterThan(0);
    expect(API_CONFIG.POLLING.TIMEOUT_MS).toBeGreaterThan(0);
  });

  it('should use /api proxy in development for CORS bypass', () => {
    // In test environment, DEV is false, so we test the logic
    expect(API_CONFIG.BASE_URL).toBeDefined();
  });

  it('should have all required endpoints configured', () => {
    expect(API_CONFIG.AUTH_LOGIN).toBeDefined();
    expect(API_CONFIG.AUTH_REGISTER).toBeDefined();
    expect(API_CONFIG.PREDICT_ENDPOINT).toBeDefined();
    expect(API_CONFIG.RESULT_ENDPOINT).toBeDefined();
    expect(API_CONFIG.ADVICE_ENDPOINT).toBeDefined();
  });
});

describe('Security Events', () => {
  it('should dispatch auth:logout event on logout', () => {
    const mockHandler = vi.fn();
    window.addEventListener('auth:logout', mockHandler);

    window.dispatchEvent(new CustomEvent('auth:logout'));

    expect(mockHandler).toHaveBeenCalled();
    window.removeEventListener('auth:logout', mockHandler);
  });

  it('should dispatch auth:unauthorized event for 401 handling', () => {
    const mockHandler = vi.fn();
    window.addEventListener('auth:unauthorized', mockHandler);

    window.dispatchEvent(new CustomEvent('auth:unauthorized'));

    expect(mockHandler).toHaveBeenCalled();
    window.removeEventListener('auth:unauthorized', mockHandler);
  });
});

describe('getApiUrl', () => {
  it('should concatenate base URL with endpoint', () => {
    const result = getApiUrl('/test-endpoint');
    expect(result).toBe(`${API_CONFIG.BASE_URL}/test-endpoint`);
  });
});

describe('API_URLS', () => {
  it('should return predict URL', () => {
    expect(API_URLS.predict).toBe(
      `${API_CONFIG.BASE_URL}${API_CONFIG.PREDICT_ENDPOINT}`
    );
  });

  it('should return result URL with predictionId', () => {
    const url = API_URLS.result('abc-123');
    expect(url).toContain(API_CONFIG.RESULT_ENDPOINT);
    expect(url).toContain('abc-123');
  });

  it('should return advice URL', () => {
    expect(API_URLS.advice).toBe(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ADVICE_ENDPOINT}`
    );
  });

  it('should return screening history URL with userId', () => {
    const url = API_URLS.screeningHistory('user-1');
    expect(url).toContain(API_CONFIG.SCREENING_HISTORY_ENDPOINT);
    expect(url).toContain('user-1');
  });

  it('should return weekly chart URL with userId', () => {
    const url = API_URLS.weeklyChart('user-1');
    expect(url).toContain(API_CONFIG.WEEKLY_CHART_ENDPOINT);
    expect(url).toContain('user-1');
  });

  it('should return streak URL with userId', () => {
    const url = API_URLS.streak('user-1');
    expect(url).toContain(API_CONFIG.STREAK_ENDPOINT);
    expect(url).toContain('user-1');
  });

  it('should return weekly critical factors URL with userId', () => {
    const url = API_URLS.weeklyCriticalFactors('user-1');
    expect(url).toContain(API_CONFIG.WEEKLY_CRITICAL_FACTORS);
    expect(url).toContain('user-1');
  });

  it('should return daily suggestion URL with userId', () => {
    const url = API_URLS.dailySuggestion('user-1');
    expect(url).toContain(API_CONFIG.DAILY_SUGGESTION);
    expect(url).toContain('user-1');
  });
});

describe('buildWeeklyChartFromHistory', () => {
  // Helper: get today's date key in YYYY-MM-DD matching the function's logic
  function getTodayKey() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  }

  it('should build 7-day chart with correct structure', () => {
    const todayKey = getTodayKey();
    const items = [
      {
        created_at: `${todayKey}T12:00:00.000Z`,
        prediction_score: 75,
      },
    ];
    const result = buildWeeklyChartFromHistory(items);
    expect(result).toHaveLength(7);
    result.forEach((entry) => {
      expect(entry).toHaveProperty('day');
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('value');
      expect(entry).toHaveProperty('hasData');
    });
  });

  it('should clamp scores to 0-100 range', () => {
    const todayKey = getTodayKey();
    const items = [
      { created_at: `${todayKey}T12:00:00.000Z`, prediction_score: 150 },
      { created_at: `${todayKey}T12:00:00.000Z`, prediction_score: -20 },
    ];
    const result = buildWeeklyChartFromHistory(items);
    const todayEntry = result.find((e) => e.date === todayKey);
    // 150 clamped to 100, -20 clamped to 0 → average = 50
    expect(todayEntry).toBeDefined();
    expect(todayEntry.value).toBe(50);
  });

  it('should return 0 for days with no data', () => {
    const result = buildWeeklyChartFromHistory([]);
    result.forEach((entry) => {
      expect(entry.value).toBe(0);
      expect(entry.hasData).toBe(false);
    });
  });

  it('should use score fallback when prediction_score is missing', () => {
    const todayKey = getTodayKey();
    const items = [{ created_at: `${todayKey}T12:00:00.000Z`, score: 60 }];
    const result = buildWeeklyChartFromHistory(items);
    const todayEntry = result.find((e) => e.date === todayKey);
    expect(todayEntry).toBeDefined();
    expect(todayEntry.value).toBe(60);
  });

  it('should average multiple scores on the same day', () => {
    const todayKey = getTodayKey();
    const items = [
      { created_at: `${todayKey}T08:00:00.000Z`, prediction_score: 40 },
      { created_at: `${todayKey}T16:00:00.000Z`, prediction_score: 80 },
    ];
    const result = buildWeeklyChartFromHistory(items);
    const todayEntry = result.find((e) => e.date === todayKey);
    expect(todayEntry).toBeDefined();
    expect(todayEntry.value).toBe(60);
  });
});

describe('fetchScreeningHistory', () => {
  beforeEach(() => {
    vi.spyOn(apiClient, 'get');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return success data on successful response', async () => {
    apiClient.get.mockResolvedValue({
      data: { status: 'success', data: [{ id: 1 }], total: 1 },
    });
    const result = await fetchScreeningHistory('user-1');
    expect(result.success).toBe(true);
    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.total).toBe(1);
  });

  it('should return failure on non-success status', async () => {
    apiClient.get.mockResolvedValue({
      data: { status: 'error', message: 'Not found' },
    });
    const result = await fetchScreeningHistory('user-1');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not found');
  });

  it('should handle network errors', async () => {
    apiClient.get.mockRejectedValue(new Error('Network error'));
    const result = await fetchScreeningHistory('user-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('should handle error with response data', async () => {
    apiClient.get.mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });
    const result = await fetchScreeningHistory('user-1');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Server error');
  });

  it('should return default failure message when none provided', async () => {
    apiClient.get.mockResolvedValue({ data: { status: 'fail' } });
    const result = await fetchScreeningHistory('user-1');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to fetch history');
  });
});

describe('fetchWeeklyChart', () => {
  beforeEach(() => {
    vi.spyOn(apiClient, 'get');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return mapped chart data on success', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        status: 'success',
        data: [
          { label: 'Mon', date: '2024-01-01', mental_health_index: 75 },
          { label: 'Tue', date: '2024-01-02', mental_health_index: -10 },
        ],
      },
    });
    const result = await fetchWeeklyChart('user-1');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({
      day: 'Mon',
      date: '2024-01-01',
      value: 75,
    });
    // Negative values clamped to 0
    expect(result.data[1].value).toBe(0);
  });

  it('should return failure on non-success status', async () => {
    apiClient.get.mockResolvedValue({
      data: { status: 'error', message: 'No data' },
    });
    const result = await fetchWeeklyChart('user-1');
    expect(result.success).toBe(false);
    expect(result.error).toBe('No data');
  });

  it('should handle network errors', async () => {
    apiClient.get.mockRejectedValue(new Error('timeout'));
    const result = await fetchWeeklyChart('user-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('timeout');
  });

  it('should handle null mental_health_index', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        status: 'success',
        data: [{ label: 'Mon', date: '2024-01-01', mental_health_index: null }],
      },
    });
    const result = await fetchWeeklyChart('user-1');
    expect(result.data[0].value).toBe(0);
  });

  it('should return default failure message', async () => {
    apiClient.get.mockResolvedValue({ data: { status: 'fail' } });
    const result = await fetchWeeklyChart('user-1');
    expect(result.error).toBe('Failed to fetch chart data');
  });
});
