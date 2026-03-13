import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useZenMode } from '@/hooks/use-zen-mode';

describe('useZenMode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('должен переключать режим zen mode', () => {
    const { result } = renderHook(() => useZenMode({ autoSave: false }));

    expect(result.current.isZenMode).toBe(false);

    act(() => {
      result.current.toggleZenMode();
    });

    expect(result.current.isZenMode).toBe(true);

    act(() => {
      result.current.toggleZenMode();
    });

    expect(result.current.isZenMode).toBe(false);
  });

  it('должен загружать настройки из localStorage', () => {
    localStorage.setItem('stoic-book-zen-mode', JSON.stringify({
      isZenMode: true
    }));

    const { result } = renderHook(() => useZenMode({ autoSave: true }));

    expect(result.current.isZenMode).toBe(true);
  });

  it('должен сохранять настройки в localStorage', () => {
    const { result } = renderHook(() => useZenMode({ autoSave: true }));

    act(() => {
      result.current.toggleZenMode();
    });

    const saved = JSON.parse(localStorage.getItem('stoic-book-zen-mode') || '{}');
    expect(saved.isZenMode).toBe(true);
  });

  it('должен предоставлять методы enable/disable', () => {
    const { result } = renderHook(() => useZenMode({ autoSave: false }));

    act(() => {
      result.current.enableZenMode();
    });
    expect(result.current.isZenMode).toBe(true);

    act(() => {
      result.current.disableZenMode();
    });
    expect(result.current.isZenMode).toBe(false);
  });

  it('должен обрабатывать невалидные данные из localStorage', () => {
    localStorage.setItem('stoic-book-zen-mode', 'invalid json');

    expect(() => {
      renderHook(() => useZenMode({ autoSave: true }));
    }).not.toThrow();
  });
});
