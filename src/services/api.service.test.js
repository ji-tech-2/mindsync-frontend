import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signIn,
  register,
  logout,
  requestOTP,
  requestSignupOTP,
  verifyOTP,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  submitScreening,
  getPredictionResult,
  getScreeningHistory,
  getWeeklyChart,
  getStreak,
  getWeeklyCriticalFactors,
  getDailySuggestion,
} from './api.service';

// Mock apiClient
vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import apiClient from '@/config/api';

describe('api.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== Authentication =====
  describe('signIn', () => {
    it('calls POST /v1/auth/login with credentials', async () => {
      apiClient.post.mockResolvedValue({
        data: { success: true, token: 'abc' },
      });
      const result = await signIn('user@test.com', 'pass123');
      expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/login', {
        email: 'user@test.com',
        password: 'pass123',
      });
      expect(result).toEqual({ success: true, token: 'abc' });
    });
  });

  describe('register', () => {
    it('calls POST /v1/auth/register with user data', async () => {
      const userData = { email: 'new@test.com', password: 'Pass123' };
      apiClient.post.mockResolvedValue({ data: { success: true } });
      const result = await register(userData);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/auth/register',
        userData
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('logout', () => {
    it('calls POST /v1/auth/logout', async () => {
      apiClient.post.mockResolvedValue({ data: { success: true } });
      const result = await logout();
      expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/logout');
      expect(result).toEqual({ success: true });
    });
  });

  describe('requestOTP', () => {
    it('calls POST /v1/auth/request-otp with email', async () => {
      apiClient.post.mockResolvedValue({ data: { success: true } });
      const result = await requestOTP('user@test.com');
      expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/request-otp', {
        email: 'user@test.com',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('requestSignupOTP', () => {
    it('calls POST /v1/auth/request-signup-otp with email', async () => {
      apiClient.post.mockResolvedValue({ data: { success: true } });
      const result = await requestSignupOTP('user@test.com');
      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/auth/request-signup-otp',
        {
          email: 'user@test.com',
        }
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('verifyOTP', () => {
    it('calls POST /v1/auth/verify-otp with email and otp', async () => {
      apiClient.post.mockResolvedValue({ data: { success: true } });
      const result = await verifyOTP('user@test.com', '123456');
      expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/verify-otp', {
        email: 'user@test.com',
        otp: '123456',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('resetPassword', () => {
    it('calls POST /v1/auth/reset-password with email, otp, newPassword', async () => {
      apiClient.post.mockResolvedValue({ data: { success: true } });
      const result = await resetPassword('user@test.com', '123456', 'NewPass1');
      expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/reset-password', {
        email: 'user@test.com',
        otp: '123456',
        newPassword: 'NewPass1',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('changePassword', () => {
    it('calls POST /v1/users/me/change-password with old and new passwords', async () => {
      apiClient.post.mockResolvedValue({ data: { success: true } });
      const result = await changePassword('OldPass1', 'NewPass1');
      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/users/me/change-password',
        {
          oldPassword: 'OldPass1',
          newPassword: 'NewPass1',
        }
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ===== Profile =====
  describe('getProfile', () => {
    it('calls GET /v1/users/me/profile', async () => {
      apiClient.get.mockResolvedValue({
        data: { success: true, data: { name: 'Test' } },
      });
      const result = await getProfile();
      expect(apiClient.get).toHaveBeenCalledWith('/v1/users/me/profile');
      expect(result).toEqual({ success: true, data: { name: 'Test' } });
    });
  });

  describe('updateProfile', () => {
    it('calls PUT /v1/users/me/profile with update data', async () => {
      const updateData = { name: 'Updated Name' };
      apiClient.put.mockResolvedValue({ data: { success: true } });
      const result = await updateProfile(updateData);
      expect(apiClient.put).toHaveBeenCalledWith(
        '/v1/users/me/profile',
        updateData
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ===== Screening =====
  describe('submitScreening', () => {
    it('calls POST /v1/predictions/create with screening data', async () => {
      const screeningData = { age: 25, sleepHours: 7 };
      apiClient.post.mockResolvedValue({ data: { predictionId: 'pred-123' } });
      const result = await submitScreening(screeningData);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/predictions/create',
        screeningData
      );
      expect(result).toEqual({ predictionId: 'pred-123' });
    });
  });

  describe('getPredictionResult', () => {
    it('calls GET /v1/predictions/{id}/result', async () => {
      apiClient.get.mockResolvedValue({
        data: { status: 'ready', result: {} },
      });
      const result = await getPredictionResult('pred-123');
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v1/predictions/pred-123/result'
      );
      expect(result).toEqual({ status: 'ready', result: {} });
    });
  });

  // ===== History =====
  describe('getScreeningHistory', () => {
    it('calls GET /v1/users/me/history', async () => {
      apiClient.get.mockResolvedValue({ data: { success: true, data: [] } });
      const result = await getScreeningHistory();
      expect(apiClient.get).toHaveBeenCalledWith('/v1/users/me/history');
      expect(result).toEqual({ success: true, data: [] });
    });
  });

  // ===== Dashboard =====
  describe('getWeeklyChart', () => {
    it('calls GET /v1/users/me/weekly-chart', async () => {
      apiClient.get.mockResolvedValue({ data: { success: true, data: [] } });
      const result = await getWeeklyChart();
      expect(apiClient.get).toHaveBeenCalledWith('/v1/users/me/weekly-chart');
      expect(result).toEqual({ success: true, data: [] });
    });
  });

  describe('getStreak', () => {
    it('calls GET /v1/users/me/streaks', async () => {
      apiClient.get.mockResolvedValue({ data: { success: true, streak: 5 } });
      const result = await getStreak();
      expect(apiClient.get).toHaveBeenCalledWith('/v1/users/me/streaks');
      expect(result).toEqual({ success: true, streak: 5 });
    });
  });

  describe('getWeeklyCriticalFactors', () => {
    it('calls GET /v1/users/me/weekly-factors', async () => {
      apiClient.get.mockResolvedValue({ data: { success: true, factors: [] } });
      const result = await getWeeklyCriticalFactors();
      expect(apiClient.get).toHaveBeenCalledWith('/v1/users/me/weekly-factors');
      expect(result).toEqual({ success: true, factors: [] });
    });
  });

  describe('getDailySuggestion', () => {
    it('calls GET /v1/users/me/daily-suggestions', async () => {
      apiClient.get.mockResolvedValue({
        data: { success: true, suggestion: 'Get rest' },
      });
      const result = await getDailySuggestion();
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v1/users/me/daily-suggestions'
      );
      expect(result).toEqual({ success: true, suggestion: 'Get rest' });
    });
  });
});
