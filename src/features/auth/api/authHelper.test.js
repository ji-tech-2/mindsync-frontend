/**
 * authHelper Utility Tests
 *
 * Tests for authentication helper functions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  isAuthenticated,
  getCurrentUser,
  logout,
  requireAuth,
} from './authHelper';
import { TokenManager } from '@/config/api';

// Mock TokenManager
vi.mock('@/config/api', () => ({
  TokenManager: {
    getUserData: vi.fn(),
    setUserData: vi.fn(),
    clearUserData: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

describe('authHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isAuthenticated()', () => {
    it('should return true when user is authenticated', () => {
      TokenManager.isAuthenticated.mockReturnValue(true);
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      TokenManager.isAuthenticated.mockReturnValue(false);
      expect(isAuthenticated()).toBe(false);
    });

    it('should delegate to TokenManager.isAuthenticated', () => {
      isAuthenticated();
      expect(TokenManager.isAuthenticated).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser()', () => {
    it('should return user data when available', () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      TokenManager.getUserData.mockReturnValue(userData);

      expect(getCurrentUser()).toEqual(userData);
    });

    it('should return null when no user data', () => {
      TokenManager.getUserData.mockReturnValue(null);
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe('logout()', () => {
    it('should clear user data via TokenManager', () => {
      logout();
      expect(TokenManager.clearUserData).toHaveBeenCalled();
    });

    it('should dispatch auth:logout event', () => {
      const mockHandler = vi.fn();
      window.addEventListener('auth:logout', mockHandler);

      logout();

      expect(mockHandler).toHaveBeenCalled();
      window.removeEventListener('auth:logout', mockHandler);
    });

    it('should NOT use window.location.href (SPA compliance)', () => {
      const originalHref = window.location.href;

      logout();

      // window.location.href should not have changed
      expect(window.location.href).toBe(originalHref);
    });
  });

  describe('requireAuth()', () => {
    it('should return true when authenticated', () => {
      TokenManager.isAuthenticated.mockReturnValue(true);
      expect(requireAuth()).toBe(true);
    });

    it('should return false when not authenticated', () => {
      TokenManager.isAuthenticated.mockReturnValue(false);
      expect(requireAuth()).toBe(false);
    });

    it('should dispatch auth:unauthorized event when not authenticated', () => {
      TokenManager.isAuthenticated.mockReturnValue(false);
      const mockHandler = vi.fn();
      window.addEventListener('auth:unauthorized', mockHandler);

      requireAuth();

      expect(mockHandler).toHaveBeenCalled();
      window.removeEventListener('auth:unauthorized', mockHandler);
    });

    it('should NOT dispatch event when authenticated', () => {
      TokenManager.isAuthenticated.mockReturnValue(true);
      const mockHandler = vi.fn();
      window.addEventListener('auth:unauthorized', mockHandler);

      requireAuth();

      expect(mockHandler).not.toHaveBeenCalled();
      window.removeEventListener('auth:unauthorized', mockHandler);
    });

    it('should NOT use window.location.href (SPA compliance)', () => {
      TokenManager.isAuthenticated.mockReturnValue(false);
      const originalHref = window.location.href;

      requireAuth();

      // window.location.href should not have changed
      expect(window.location.href).toBe(originalHref);
    });
  });
});

describe('authHelper - Security Considerations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not expose sensitive data in getCurrentUser', () => {
    // Even if TokenManager returns sensitive data, helper should not modify it
    // This is a documentation/awareness test
    const userData = { email: 'test@example.com', name: 'Test' };
    TokenManager.getUserData.mockReturnValue(userData);

    const result = getCurrentUser();

    // Should match what TokenManager returns (TokenManager handles filtering)
    expect(result).toEqual(userData);
  });

  it('should use event-based navigation for SPA compatibility', () => {
    // Logout should dispatch event, not redirect directly
    const logoutEventHandler = vi.fn();
    window.addEventListener('auth:logout', logoutEventHandler);

    logout();

    expect(logoutEventHandler).toHaveBeenCalledTimes(1);
    window.removeEventListener('auth:logout', logoutEventHandler);
  });

  it('should use event-based navigation for unauthorized access', () => {
    TokenManager.isAuthenticated.mockReturnValue(false);

    const unauthorizedEventHandler = vi.fn();
    window.addEventListener('auth:unauthorized', unauthorizedEventHandler);

    requireAuth();

    expect(unauthorizedEventHandler).toHaveBeenCalledTimes(1);
    window.removeEventListener('auth:unauthorized', unauthorizedEventHandler);
  });
});
