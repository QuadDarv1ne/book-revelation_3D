import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePrefersColorScheme } from '../hooks/use-prefers-color-scheme';

describe('usePrefersColorScheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен возвращать "dark" когда система предпочитает тёмную тему', async () => {
    // Mock matchMedia для тёмной темы
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: true, // prefers-color-scheme: dark
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => usePrefersColorScheme());

    await waitFor(() => {
      expect(result.current).toBe('dark');
    });
  });

  it('должен возвращать "light" когда система предпочитает светлую тему', async () => {
    // Mock matchMedia для светлой темы
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // prefers-color-scheme: light
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => usePrefersColorScheme());

    await waitFor(() => {
      expect(result.current).toBe('light');
    });
  });

  it('должен подписываться на изменения matchMedia', () => {
    const addEventListenerMock = vi.fn();
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderHook(() => usePrefersColorScheme());

    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
