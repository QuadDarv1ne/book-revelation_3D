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
};

const STORAGE_KEY = 'user-settings';

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
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
      const data = JSON.parse(json);
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Неверный формат данных' };
      }

      const validatedData: Partial<UserSettings> = {};

      if (Array.isArray(data.favorites)) {
        validatedData.favorites = data.favorites.filter(
          (q: Quote) => typeof q.text === 'string' && typeof q.author === 'string'
        );
      }

      if (Array.isArray(data.achievements)) {
        validatedData.achievements = data.achievements.filter(
          (a: Achievement) => typeof a.id === 'string' && typeof a.unlockedAt === 'string'
        );
      }

      if (data.statistics && typeof data.statistics === 'object') {
        validatedData.statistics = {
          ...settings.statistics,
          ...data.statistics,
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
    addFavorite,
    removeFavorite,
    isFavorite,
    unlockAchievement,
    exportSettings,
    importSettings,
    resetSettings,
  };
}
