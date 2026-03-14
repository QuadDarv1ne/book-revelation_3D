'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { useUserSettings } from './use-user-settings';

export interface CameraState {
  position: { x: number; y: number; z: number };
  zoom: number;
}

const DEFAULT_CAMERA_STATE: CameraState = {
  position: { x: 0, y: 1.25, z: 4.0 },
  zoom: 1
};

export function useCameraPersistence() {
  const { settings, updateSettings } = useUserSettings();
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>(DEFAULT_CAMERA_STATE);

  useEffect(() => {
    if (settings.cameraState) {
      setCameraState(settings.cameraState);
    }
    setIsLoaded(true);
  }, [settings.cameraState]);

  const saveCameraState = useCallback((state: CameraState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      updateSettings('cameraState', state);
    }, 1000);
  }, [updateSettings]);

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
    updateSettings('cameraState', DEFAULT_CAMERA_STATE);
  }, [updateSettings]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { cameraState, isLoaded, updatePosition, updateZoom, resetCamera };
}
