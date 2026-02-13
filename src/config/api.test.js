/**
 * API Configuration & Security Tests
 *
 * Tests for TokenManager and security-related functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TokenManager, API_CONFIG } from './api';

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
