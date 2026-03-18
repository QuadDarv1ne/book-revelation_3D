"use client";

import { useState, useCallback, useEffect } from 'react';
import type { Locale } from './use-i18n';

export type Theme = 'dark' | 'light' | 'blue' | 'purple' | 'ambient' | 'relax' | 'auto' | 'auto-time';

interface Quote {
  id?: string;
  text: string;
  author: string;
  era?: string;
  category?: string;
  bookId?: string;
}

interface Achievement {
  id: string;
  unlockedAt: string;
  progress: number;
}

interface CameraState {
  position: { x: number; y: number; z: number };
  zoom: number;
}

interface UserSettings {
  theme: Theme;
  locale: Locale;
  rotationSpeed: number;
  zenMode: boolean;
  favorites: Quote[];
  achievements: Achievement[];
  statistics: {
    timeSpent: number;
    quotesRead: number;
    booksViewed: string[];
    themesExplored: string[];
    rotations: number;
  };
  activeBookId: string;
  cameraState: CameraState;
}

const defaultSettings: UserSettings = {
  theme: 'relax',
  locale: 'ru',
  rotationSpeed: 0.5,
  zenMode: false,
  favorites: [],
  achievements: [],
  statistics: {
    timeSpent: 0,
    quotesRead: 0,
    booksViewed: [],
    themesExplored: [],
    rotations: 0,
  },
  activeBookId: 'marcus-aurelius-meditations',
  cameraState: {
    position: { x: 0, y: 1.25, z: 4.0 },
    zoom: 1,
  },
};

const STORAGE_KEY = 'user-settings';
const VALID_LOCALES = ['en', 'ru', 'zh', 'he', 'de', 'es', 'fr'] as const;
const VALID_THEMES = ['dark', 'light', 'blue', 'purple', 'ambient', 'relax', 'auto', 'auto-time'] as const;

function isValidLocale(value: unknown): value is Locale {
  return typeof value === 'string' && VALID_LOCALES.includes(value as Locale);
}

function isValidTheme(value: unknown): value is Theme {
  return typeof value === 'string' && VALID_THEMES.includes(value as Theme);
}

function isValidQuote(value: unknown): value is Quote {
  return (
    typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    typeof (value as Quote).text === 'string' &&
    'author' in value &&
    typeof (value as Quote).author === 'string'
  );
}

function isValidCameraState(value: unknown): value is CameraState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'position' in value &&
    typeof (value as CameraState).position === 'object' &&
    'zoom' in value &&
    typeof (value as CameraState).zoom === 'number'
  );
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Валидация и санитизация данных
        const validated: Partial<UserSettings> = {};
        
        if (isValidTheme(parsed.theme)) validated.theme = parsed.theme;
        if (isValidLocale(parsed.locale)) validated.locale = parsed.locale;
        if (typeof parsed.rotationSpeed === 'number') validated.rotationSpeed = Math.max(0.1, Math.min(2, parsed.rotationSpeed));
        if (typeof parsed.zenMode === 'boolean') validated.zenMode = parsed.zenMode;
        if (Array.isArray(parsed.favorites)) validated.favorites = parsed.favorites.filter(isValidQuote).slice(0, 1000);
        if (Array.isArray(parsed.achievements)) validated.achievements = parsed.achievements.filter((a: unknown) => typeof a === 'object' && a !== null && 'id' in a).slice(0, 100);
        if (isValidCameraState(parsed.cameraState)) validated.cameraState = parsed.cameraState;
        if (typeof parsed.activeBookId === 'string') validated.activeBookId = parsed.activeBookId;
        
        setSettings({ ...defaultSettings, ...validated });
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save user settings:', error);
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateStatistics = useCallback((updates: Partial<UserSettings['statistics']>) => {
    setSettings(prev => ({
      ...prev,
      statistics: { ...prev.statistics, ...updates },
    }));
  }, []);

  // Инкремент времени с обновлением statistics
  const incrementTimeSpent = useCallback((seconds: number) => {
    setSettings(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        timeSpent: prev.statistics.timeSpent + seconds,
      },
    }));
  }, []);

  const addFavorite = useCallback((quote: Quote) => {
    setSettings(prev => ({
      ...prev,
      favorites: [...prev.favorites, quote],
    }));
  }, []);

  const removeFavorite = useCallback((quoteText: string) => {
    setSettings(prev => ({
      ...prev,
      favorites: prev.favorites.filter(q => q.text !== quoteText),
    }));
  }, []);

  const isFavorite = useCallback((quoteText: string) => {
    return settings.favorites.some(q => q.text === quoteText);
  }, [settings.favorites]);

  const unlockAchievement = useCallback((achievement: Achievement) => {
    setSettings(prev => {
      if (prev.achievements.some(a => a.id === achievement.id)) {
        return prev;
      }
      return {
        ...prev,
        achievements: [...prev.achievements, achievement],
      };
    });
  }, []);

  const exportSettings = useCallback(() => {
    const data = {
      favorites: settings.favorites,
      achievements: settings.achievements,
      statistics: settings.statistics,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string) => {
    try {
      // Проверка размера данных (максимум 1MB)
      if (json.length > 1024 * 1024) {
        return { success: false, error: 'Превышен максимальный размер данных' };
      }

      const data = JSON.parse(json);
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Неверный формат данных' };
      }

      const validatedData: Partial<UserSettings> = {};

      if (Array.isArray(data.favorites)) {
        validatedData.favorites = data.favorites
          .filter(isValidQuote)
          .slice(0, 1000); // Максимум 1000 цитат
      }

      if (Array.isArray(data.achievements)) {
        validatedData.achievements = data.achievements
          .filter((a: unknown): a is Achievement => 
            typeof a === 'object' && a !== null && 'id' in a && typeof (a as Achievement).id === 'string'
          )
          .slice(0, 100); // Максимум 100 достижений
      }

      if (data.statistics && typeof data.statistics === 'object') {
        validatedData.statistics = {
          ...settings.statistics,
          timeSpent: typeof data.statistics.timeSpent === 'number' ? data.statistics.timeSpent : settings.statistics.timeSpent,
          quotesRead: typeof data.statistics.quotesRead === 'number' ? data.statistics.quotesRead : settings.statistics.quotesRead,
          rotations: typeof data.statistics.rotations === 'number' ? data.statistics.rotations : settings.statistics.rotations,
          booksViewed: Array.isArray(data.statistics.booksViewed) ? data.statistics.booksViewed.slice(0, 50) : settings.statistics.booksViewed,
          themesExplored: Array.isArray(data.statistics.themesExplored) ? data.statistics.themesExplored.slice(0, 50) : settings.statistics.themesExplored,
        };
      }

      setSettings(prev => ({ ...prev, ...validatedData }));
      return { success: true, count: validatedData.favorites?.length || 0 };
    } catch {
      return { success: false, error: 'Ошибка parsing JSON' };
    }
  }, [settings.statistics]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    settings,
    isLoaded,
    updateSettings,
    updateStatistics,
    incrementTimeSpent,
    addFavorite,
    removeFavorite,
    isFavorite,
    unlockAchievement,
    exportSettings,
    importSettings,
    resetSettings,
  };
}
