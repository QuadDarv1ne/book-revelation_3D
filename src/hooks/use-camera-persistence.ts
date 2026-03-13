'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';

export interface CameraState {
  position: { x: number; y: number; z: number };
  zoom: number;
}

const DEFAULT_CAMERA_STATE: CameraState = {
  position: { x: 0, y: 1.25, z: 4.0 },
  zoom: 1
};

const STORAGE_KEY = 'stoic-book-camera-state';
const SAVE_DELAY = 1000;

export function useCameraPersistence() {
  const [cameraState, setCameraState] = useState<CameraState>(DEFAULT_CAMERA_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CameraState;
        if (parsed.position && typeof parsed.zoom === 'number') {
          setCameraState(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveCameraState = useCallback((state: CameraState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage errors
      }
    }, SAVE_DELAY);
  }, []);

  const updatePosition = useCallback((position: THREE.Vector3) => {
    setCameraState(prev => {
      const newState = { ...prev, position: { x: position.x, y: position.y, z: position.z } };
      saveCameraState(newState);
      return newState;
    });
  }, [saveCameraState]);

  const updateZoom = useCallback((zoom: number) => {
    setCameraState(prev => {
      const newState = { ...prev, zoom };
      saveCameraState(newState);
      return newState;
    });
  }, [saveCameraState]);

  const resetCamera = useCallback(() => {
    setCameraState(DEFAULT_CAMERA_STATE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CAMERA_STATE));
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { cameraState, isLoaded, updatePosition, updateZoom, resetCamera };
}
