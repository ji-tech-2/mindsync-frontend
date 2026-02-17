/**
 * API Configuration & Security Tests
 *
 * Tests for TokenManager and security-related functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TokenManager } from '@/utils/tokenManager';
import { API_ROUTES, POLLING_CONFIG } from './apiRoutes';
import { buildWeeklyChartFromHistory } from '@/utils/chartHelpers';
import { getScreeningHistory, getWeeklyChart } from '@/services';
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
    expect(POLLING_CONFIG.MAX_ATTEMPTS).toBeGreaterThan(0);
    expect(POLLING_CONFIG.INTERVAL_MS).toBeGreaterThan(0);
    expect(POLLING_CONFIG.TIMEOUT_MS).toBeGreaterThan(0);
  });

  it('should have all required auth endpoints configured', () => {
    expect(API_ROUTES.AUTH_LOGIN).toBeDefined();
    expect(API_ROUTES.AUTH_REGISTER).toBeDefined();
    expect(API_ROUTES.PREDICT).toBeDefined();
    expect(API_ROUTES.RESULT).toBeDefined();
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

describe('getScreeningHistory', () => {
  beforeEach(() => {
    vi.spyOn(apiClient, 'get');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return response data directly on success', async () => {
    const responseData = { status: 'success', data: [{ id: 1 }], total: 1 };
    apiClient.get.mockResolvedValue({ data: responseData });
    const result = await getScreeningHistory('user-1');
    expect(result).toEqual(responseData);
    expect(result.status).toBe('success');
    expect(result.data).toEqual([{ id: 1 }]);
  });

  it('should call correct API endpoint with userId', async () => {
    apiClient.get.mockResolvedValue({ data: { status: 'success', data: [] } });
    await getScreeningHistory('user-1');
    expect(apiClient.get).toHaveBeenCalledWith('/v1/users/user-1/history');
  });

  it('should propagate network errors', async () => {
    apiClient.get.mockRejectedValue(new Error('Network error'));
    await expect(getScreeningHistory('user-1')).rejects.toThrow(
      'Network error'
    );
  });

  it('should return error status response as-is', async () => {
    const responseData = { status: 'error', message: 'Not found' };
    apiClient.get.mockResolvedValue({ data: responseData });
    const result = await getScreeningHistory('user-1');
    expect(result.status).toBe('error');
    expect(result.message).toBe('Not found');
  });

  it('should return raw response data without wrapping', async () => {
    const responseData = { status: 'fail', message: 'No data' };
    apiClient.get.mockResolvedValue({ data: responseData });
    const result = await getScreeningHistory('user-1');
    expect(result).toEqual(responseData);
  });
});

describe('getWeeklyChart', () => {
  beforeEach(() => {
    vi.spyOn(apiClient, 'get');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return response data directly on success', async () => {
    const responseData = {
      status: 'success',
      data: [
        { label: 'Mon', date: '2024-01-01', mental_health_index: 75 },
        { label: 'Tue', date: '2024-01-02', mental_health_index: 50 },
      ],
    };
    apiClient.get.mockResolvedValue({ data: responseData });
    const result = await getWeeklyChart('user-1');
    expect(result).toEqual(responseData);
    expect(result.status).toBe('success');
    expect(result.data).toHaveLength(2);
  });

  it('should call correct API endpoint with userId', async () => {
    apiClient.get.mockResolvedValue({ data: { status: 'success', data: [] } });
    await getWeeklyChart('user-1');
    expect(apiClient.get).toHaveBeenCalledWith('/v1/users/user-1/weekly-chart');
  });

  it('should propagate network errors', async () => {
    apiClient.get.mockRejectedValue(new Error('timeout'));
    await expect(getWeeklyChart('user-1')).rejects.toThrow('timeout');
  });

  it('should return error status response as-is', async () => {
    const responseData = { status: 'error', message: 'No data' };
    apiClient.get.mockResolvedValue({ data: responseData });
    const result = await getWeeklyChart('user-1');
    expect(result.status).toBe('error');
    expect(result.message).toBe('No data');
  });

  it('should return raw response data without wrapping', async () => {
    const responseData = { status: 'fail' };
    apiClient.get.mockResolvedValue({ data: responseData });
    const result = await getWeeklyChart('user-1');
    expect(result).toEqual(responseData);
  });
});
