'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserSettings } from './use-user-settings';

export interface UseZenModeOptions {
  autoSave?: boolean;
}

export function useZenMode(options: UseZenModeOptions = {}) {
  const { autoSave = true } = options;
  const { settings, updateSettings } = useUserSettings();
  const [isZenMode, setIsZenMode] = useState(false);

  useEffect(() => {
    if (autoSave) {
      setIsZenMode(settings.zenMode);
    }
  }, [autoSave, settings.zenMode]);

  useEffect(() => {
    if (autoSave) {
      updateSettings('zenMode', isZenMode);
    }
  }, [isZenMode, autoSave, updateSettings]);

  const toggleZenMode = useCallback(() => {
    setIsZenMode(prev => !prev);
  }, []);

  const enableZenMode = useCallback(() => setIsZenMode(true), []);
  const disableZenMode = useCallback(() => setIsZenMode(false), []);

  return { isZenMode, toggleZenMode, enableZenMode, disableZenMode };
}
