import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCameraPersistence } from '@/hooks/use-camera-persistence';
import * as THREE from 'three';

describe('useCameraPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('должен загружать состояние из localStorage', () => {
    const savedState = {
      position: { x: 1, y: 2, z: 3 },
      zoom: 1.5
    };
    localStorage.setItem('stoic-book-camera-state', JSON.stringify(savedState));

    const { result } = renderHook(() => useCameraPersistence());

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.cameraState).toEqual(savedState);
  });

  it('должен использовать состояние по умолчанию если localStorage пуст', () => {
    const { result } = renderHook(() => useCameraPersistence());

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.cameraState.zoom).toBe(1);
    expect(result.current.cameraState.position.z).toBe(4.0);
  });

  it('должен сохранять состояние в localStorage с задержкой', () => {
    const { result } = renderHook(() => useCameraPersistence());

    act(() => {
      result.current.updateZoom(1.8);
    });

    expect(localStorage.getItem('stoic-book-camera-state')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const saved = JSON.parse(localStorage.getItem('stoic-book-camera-state') || '{}');
    expect(saved.zoom).toBe(1.8);
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

  it('должен сбрасывать камеру к состоянию по умолчанию', () => {
    localStorage.setItem('stoic-book-camera-state', JSON.stringify({
      position: { x: 10, y: 10, z: 10 },
      zoom: 2
    }));

    const { result } = renderHook(() => useCameraPersistence());

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

  it('должен обрабатывать невалидные данные из localStorage', () => {
    localStorage.setItem('stoic-book-camera-state', 'invalid json');

    const { result } = renderHook(() => useCameraPersistence());

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.cameraState.zoom).toBe(1);
  });
});
