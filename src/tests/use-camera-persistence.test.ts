import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCameraPersistence } from '@/hooks/use-camera-persistence';
import * as THREE from 'three';

describe('useCameraPersistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('должен использовать состояние по умолчанию', () => {
    const { result } = renderHook(() => useCameraPersistence());

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.cameraState.zoom).toBe(1);
    expect(result.current.cameraState.position.z).toBe(4.0);
  });

  it('должен обновлять позицию', () => {
    const { result } = renderHook(() => useCameraPersistence());

    const newPosition = new THREE.Vector3(2, 3, 4);

    act(() => {
      result.current.updatePosition(newPosition);
    });

    expect(result.current.cameraState.position.x).toBe(2);
    expect(result.current.cameraState.position.y).toBe(3);
    expect(result.current.cameraState.position.z).toBe(4);
  });

  it('должен обновлять zoom', () => {
    const { result } = renderHook(() => useCameraPersistence());

    act(() => {
      result.current.updateZoom(1.8);
    });

    expect(result.current.cameraState.zoom).toBe(1.8);
  });

  it('должен сбрасывать камеру к состоянию по умолчанию', () => {
    const { result } = renderHook(() => useCameraPersistence());

    act(() => {
      result.current.updateZoom(2);
      result.current.updatePosition(new THREE.Vector3(5, 5, 5));
    });

    act(() => {
      result.current.resetCamera();
    });

    expect(result.current.cameraState.zoom).toBe(1);
    expect(result.current.cameraState.position.z).toBe(4.0);
  });

  it('должен очищать таймер при размонтировании', () => {
    const { unmount } = renderHook(() => useCameraPersistence());
    expect(() => unmount()).not.toThrow();
  });
});
