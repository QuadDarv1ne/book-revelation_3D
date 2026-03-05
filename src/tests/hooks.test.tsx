import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRotationControl } from '@/hooks/use-rotation';

describe('useRotationControl', () => {
  it('should return initial state with isRotating=true', () => {
    const { result } = renderHook(() => useRotationControl());

    expect(result.current.isRotating).toBe(true);
    expect(typeof result.current.toggleRotation).toBe('function');
  });

  it('should toggle rotation state', () => {
    const { result } = renderHook(() => useRotationControl());

    expect(result.current.isRotating).toBe(true);

    act(() => {
      result.current.toggleRotation();
    });
    expect(result.current.isRotating).toBe(false);

    act(() => {
      result.current.toggleRotation();
    });
    expect(result.current.isRotating).toBe(true);
  });
});
