import '@testing-library/jest-dom/vitest';

// Mock localStorage for jsdom environment
const localStorageMock = {
  store: {} as Record<string, string>,
  clear: () => {
    localStorageMock.store = {};
  },
  getItem: (key: string) => localStorageMock.store[key] || null,
  setItem: (key: string, value: string) => {
    localStorageMock.store[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageMock.store[key];
  },
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
