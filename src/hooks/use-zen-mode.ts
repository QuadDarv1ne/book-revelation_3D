'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'stoic-book-zen-mode';

export interface UseZenModeOptions {
  autoSave?: boolean;
  hideUI?: boolean;
  hideParticles?: boolean;
  reduceMotion?: boolean;
}

/**
 * Хук для режима фокусировки (Zen mode)
 * Скрывает UI элементы, оставляет только книгу и цитату
 */
export function useZenMode(options: UseZenModeOptions = {}) {
  const {
    autoSave = true,
    hideUI = true,
    hideParticles = false,
    reduceMotion = false
  } = options;

  const [isZenMode, setIsZenMode] = useState(false);
  const [settings, setSettings] = useState({
    hideUI,
    hideParticles,
    reduceMotion
  });

  // Загрузка настроек из localStorage
  useEffect(() => {
    if (autoSave) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setIsZenMode(parsed.isZenMode || false);
          setSettings(parsed.settings || settings);
        }
      } catch (error) {
        console.warn('Failed to load zen mode settings:', error);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Сохранение настроек
  useEffect(() => {
    if (autoSave) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isZenMode,
          settings
        }));
      } catch (error) {
        console.warn('Failed to save zen mode settings:', error);
      }
    }
  }, [isZenMode, settings, autoSave]);

  const toggleZenMode = useCallback(() => {
    setIsZenMode(prev => !prev);
  }, []);

  const enableZenMode = useCallback(() => {
    setIsZenMode(true);
  }, []);

  const disableZenMode = useCallback(() => {
    setIsZenMode(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    isZenMode,
    settings,
    toggleZenMode,
    enableZenMode,
    disableZenMode,
    updateSettings
  };
}

/**
 * Получить классы для скрытия UI в zen mode
 */
export function getZenModeClasses(isZenMode: boolean): string {
  if (!isZenMode) return '';
  return 'zen-mode-active';
}
