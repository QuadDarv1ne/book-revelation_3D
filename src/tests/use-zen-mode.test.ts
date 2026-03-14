import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useZenMode } from '@/hooks/use-zen-mode';

describe('useZenMode', () => {
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
});
