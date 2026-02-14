import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Mock localStorage & sessionStorage for Node.js v22+
// Node.js v22+ ships a native localStorage that requires --localstorage-file.
// That native global shadows jsdom's polyfill, causing SecurityError in tests.
// We replace it with a simple in-memory implementation before any test runs.
// ---------------------------------------------------------------------------
function createStorageMock() {
  let store = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key(index) {
      return Object.keys(store)[index] ?? null;
    },
  };
}

Object.defineProperty(globalThis, 'localStorage', {
  value: createStorageMock(),
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: createStorageMock(),
  writable: true,
  configurable: true,
});

// ---------------------------------------------------------------------------
// Mock ResizeObserver for tests
// ResizeObserver is used by StageContainer for smooth height transitions
// Provide a simple spy-able mock that doesn't error
// ---------------------------------------------------------------------------
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    // Mock observe - doesn't actually observe
  }

  unobserve() {
    // Mock unobserve
  }

  disconnect() {
    // Mock disconnect
  }
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  value: ResizeObserverMock,
  writable: true,
  configurable: true,
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
