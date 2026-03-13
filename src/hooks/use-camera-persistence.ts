'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';

export interface CameraState {
  position: { x: number; y: number; z: number };
  zoom: number;
  target: { x: number; y: number; z: number };
}

const DEFAULT_CAMERA_STATE: CameraState = {
  position: { x: 0, y: 1.25, z: 4.0 },
  zoom: 1,
  target: { x: 0, y: 0.6, z: 0 }
};

const STORAGE_KEY = 'stoic-book-camera-state';
const SAVE_DELAY = 1000; // Сохраняем не чаще чем раз в секунду

/**
 * Хук для сохранения и восстановления позиции камеры в localStorage
 */
export function useCameraPersistence() {
  const [cameraState, setCameraState] = useState<CameraState>(DEFAULT_CAMERA_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Загрузка из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CameraState;
        // Валидация данных
        if (
          parsed.position &&
          parsed.zoom &&
          typeof parsed.position.x === 'number' &&
          typeof parsed.position.y === 'number' &&
          typeof parsed.position.z === 'number'
        ) {
          setCameraState(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load camera state from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Сохранение в localStorage с debouncing
  const saveCameraState = useCallback((state: CameraState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save camera state to localStorage:', error);
      }
    }, SAVE_DELAY);
  }, []);

  // Обновление позиции
  const updatePosition = useCallback((position: THREE.Vector3) => {
    setCameraState(prev => {
      const newState = {
        ...prev,
        position: {
          x: position.x,
          y: position.y,
          z: position.z
        }
      };
      saveCameraState(newState);
      return newState;
    });
  }, [saveCameraState]);

  // Обновление zoom
  const updateZoom = useCallback((zoom: number) => {
    setCameraState(prev => {
      const newState = { ...prev, zoom };
      saveCameraState(newState);
      return newState;
    });
  }, [saveCameraState]);

  // Обновление target
  const updateTarget = useCallback((target: THREE.Vector3) => {
    setCameraState(prev => {
      const newState = {
        ...prev,
        target: {
          x: target.x,
          y: target.y,
          z: target.z
        }
      };
      saveCameraState(newState);
      return newState;
    });
  }, [saveCameraState]);

  // Сброс к позиции по умолчанию
  const resetCamera = useCallback(() => {
    setCameraState(DEFAULT_CAMERA_STATE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CAMERA_STATE));
    } catch (error) {
      console.warn('Failed to reset camera state:', error);
    }
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    cameraState,
    isLoaded,
    updatePosition,
    updateZoom,
    updateTarget,
    resetCamera,
    setCameraState
  };
}

/**
 * Утилита для применения состояния камеры к Three.js камере
 */
export function applyCameraState(
  camera: THREE.Camera,
  state: CameraState
): void {
  camera.position.set(state.position.x, state.position.y, state.position.z);
}

/**
 * Получить текущее состояние камеры из Three.js камеры
 */
export function getCameraStateFromCamera(camera: THREE.Camera, zoom: number): CameraState {
  return {
    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    },
    zoom,
    target: { x: 0, y: 0.6, z: 0 } // Default target
  };
}
