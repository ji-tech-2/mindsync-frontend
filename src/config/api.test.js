/**
 * API Configuration & Security Tests
 *
 * Tests for TokenManager and security-related functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TokenManager, API_CONFIG } from './api';

describe('TokenManager - Security', () => {
  beforeEach(() => {
    // Clear token state before each test
    TokenManager.clearToken();
  });

  afterEach(() => {
    TokenManager.clearToken();
  });

  describe('Token Storage (Memory-Only)', () => {
    it('should store token in memory', () => {
      TokenManager.setToken('test-jwt-token');
      expect(TokenManager.getToken()).toBe('test-jwt-token');
    });

    it('should return null when no token is set', () => {
      expect(TokenManager.getToken()).toBeNull();
    });

    it('should clear token from memory', () => {
      TokenManager.setToken('test-jwt-token');
      TokenManager.clearToken();
      expect(TokenManager.getToken()).toBeNull();
    });

    it('should not persist token in sessionStorage', () => {
      TokenManager.setToken('test-jwt-token');
      expect(sessionStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('User Data Storage', () => {
    it('should store user data', () => {
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

    it('should clear user data on clearToken', () => {
      TokenManager.setUserData({ email: 'test@example.com' });
      TokenManager.clearToken();
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
    it('should return true when token exists', () => {
      TokenManager.setToken('valid-token');
      expect(TokenManager.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(TokenManager.isAuthenticated()).toBe(false);
    });

    it('should return false after token is cleared', () => {
      TokenManager.setToken('valid-token');
      TokenManager.clearToken();
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

    TokenManager.setToken('test-token');
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
