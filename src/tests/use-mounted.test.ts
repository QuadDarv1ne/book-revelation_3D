import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMounted } from '@/hooks/use-mounted';

describe('useMounted', () => {
  it('should return true after mount', () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current).toBe(true);
  });

  it('should be boolean type', () => {
    const { result } = renderHook(() => useMounted());
    expect(typeof result.current).toBe('boolean');
  });
});
