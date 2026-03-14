'use client';

import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useUserSettings } from './use-user-settings';
import { useDebounce } from './use-debounce';

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

  const [cameraState, setCameraState] = useState<CameraState>(DEFAULT_CAMERA_STATE);

  const saveCameraState = useCallback((state: CameraState) => {
    updateSettings('cameraState', state);
  }, [updateSettings]);

  const debouncedSaveCameraState = useDebounce(saveCameraState, 1000);

  useEffect(() => {
    if (settings.cameraState) {
      setCameraState(settings.cameraState);
    }
    setIsLoaded(true);
  }, [settings.cameraState]);

  const updatePosition = useCallback((position: THREE.Vector3) => {
    setCameraState(prev => {
      const newState = { ...prev, position: { x: position.x, y: position.y, z: position.z } };
      debouncedSaveCameraState(newState);
      return newState;
    });
  }, [debouncedSaveCameraState]);

  const updateZoom = useCallback((zoom: number) => {
    setCameraState(prev => {
      const newState = { ...prev, zoom };
      debouncedSaveCameraState(newState);
      return newState;
    });
  }, [debouncedSaveCameraState]);

  const resetCamera = useCallback(() => {
    setCameraState(DEFAULT_CAMERA_STATE);
    updateSettings('cameraState', DEFAULT_CAMERA_STATE);
  }, [updateSettings]);

  return { cameraState, isLoaded, updatePosition, updateZoom, resetCamera };
}
