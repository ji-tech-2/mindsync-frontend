import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveToSession,
  getFromSession,
  removeFromSession,
} from './sessionHelper';

describe('sessionHelper', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveToSession', () => {
    it('should save data to sessionStorage with timestamp and session_id', () => {
      const data = { username: 'testuser', email: 'test@example.com' };
      const result = saveToSession('user', data);

      expect(result).toBe(true);
      const stored = sessionStorage.getItem('user');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored);
      expect(parsed.username).toBe('testuser');
      expect(parsed.email).toBe('test@example.com');
      expect(parsed.timestamp).toBeTruthy();
      expect(parsed.session_id).toMatch(/^sess_/);
    });

    it('should preserve existing session_id if provided', () => {
      const data = {
        username: 'testuser',
        session_id: 'existing_session_123',
      };
      saveToSession('user', data);

      const stored = JSON.parse(sessionStorage.getItem('user'));
      expect(stored.session_id).toBe('existing_session_123');
    });

    it('should handle errors gracefully when storage fails', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const setItemSpy = vi
        .spyOn(sessionStorage, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });

      const result = saveToSession('user', { data: 'test' });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error saving to session'),
        expect.any(Error)
      );

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should generate unique session_ids for different saves', () => {
      saveToSession('user1', { name: 'User 1' });
      saveToSession('user2', { name: 'User 2' });

      const user1 = JSON.parse(sessionStorage.getItem('user1'));
      const user2 = JSON.parse(sessionStorage.getItem('user2'));

      expect(user1.session_id).not.toBe(user2.session_id);
    });
  });

  describe('getFromSession', () => {
    it('should retrieve data from sessionStorage', () => {
      const data = { username: 'testuser', email: 'test@example.com' };
      sessionStorage.setItem('user', JSON.stringify(data));

      const result = getFromSession('user');

      expect(result).toEqual(data);
    });

    it('should return null if key does not exist', () => {
      const result = getFromSession('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      sessionStorage.setItem('invalid', 'invalid json{');

      const result = getFromSession('invalid');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error retrieving from session'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle storage access errors', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const getItemSpy = vi
        .spyOn(sessionStorage, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage access denied');
        });

      const result = getFromSession('user');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      getItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('removeFromSession', () => {
    it('should remove data from sessionStorage', () => {
      sessionStorage.setItem('user', JSON.stringify({ name: 'test' }));
      expect(sessionStorage.getItem('user')).toBeTruthy();

      removeFromSession('user');

      expect(sessionStorage.getItem('user')).toBeNull();
    });

    it('should not throw error if key does not exist', () => {
      expect(() => removeFromSession('nonexistent')).not.toThrow();
    });

    it('should handle storage errors gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const removeItemSpy = vi
        .spyOn(sessionStorage, 'removeItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      expect(() => removeFromSession('user')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error removing session'),
        expect.any(Error)
      );

      removeItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Integration tests', () => {
    it('should handle complete save-retrieve-remove workflow', () => {
      const userData = {
        id: 1,
        name: 'John Doe',
        role: 'admin',
      };

      // Save
      const saveResult = saveToSession('currentUser', userData);
      expect(saveResult).toBe(true);

      // Retrieve
      const retrieved = getFromSession('currentUser');
      expect(retrieved.name).toBe('John Doe');
      expect(retrieved.role).toBe('admin');
      expect(retrieved.timestamp).toBeTruthy();
      expect(retrieved.session_id).toBeTruthy();

      // Remove
      removeFromSession('currentUser');
      const afterRemove = getFromSession('currentUser');
      expect(afterRemove).toBeNull();
    });

    it('should handle multiple keys independently', () => {
      saveToSession('key1', { data: 'value1' });
      saveToSession('key2', { data: 'value2' });
      saveToSession('key3', { data: 'value3' });

      expect(getFromSession('key1').data).toBe('value1');
      expect(getFromSession('key2').data).toBe('value2');
      expect(getFromSession('key3').data).toBe('value3');

      removeFromSession('key2');

      expect(getFromSession('key1').data).toBe('value1');
      expect(getFromSession('key2')).toBeNull();
      expect(getFromSession('key3').data).toBe('value3');
    });
  });
});
