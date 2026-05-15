"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUserSettings, type Achievement as PersistedAchievement } from "./use-user-settings";
import { STOIC_QUOTES } from "@/data/stoic-quotes";

/**
 * Структура достижения
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: "exploration" | "interaction" | "knowledge" | "special";
}

/**
 * Структура цитаты дня
 */
export interface QuoteOfDay {
  quote: string;
  author: string;
  date: string;
  liked: boolean;
}

/**
 * Структура прогресса пользователя
 */
export interface UserProgress {
  totalVisits: number;
  totalRotations: number;
  themesExplored: string[];
  booksViewed: string[];
  achievementsUnlocked: string[];
  quotesLiked: string[];
  quotesRead: number;
  streakDays: number;
  lastVisitDate: string;
  totalTimeSeconds: number;
  firstVisitDate: string;
}

const INITIAL_ACHIEVEMENTS_DATA = [
  {
    id: "first_visit",
    title: "Первое знакомство",
    description: "Посетите приложение впервые",
    icon: "👋",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: "exploration",
  },
  {
    id: "rotation_master",
    title: "Мастер вращения",
    description: "Включите/выключите вращение 10 раз",
    icon: "🔄",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: "interaction",
  },
  {
    id: "rotation_expert",
    title: "Виртуоз вращения",
    description: "Включите/выключите вращение 50 раз",
    icon: "⚡",
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    category: "interaction",
  },
  {
    id: "rotation_legend",
    title: "Легенда вращения",
    description: "Включите/выключите вращение 100 раз",
    icon: "👑",
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    category: "interaction",
  },
  {
    id: "theme_explorer",
    title: "Исследователь тем",
    description: "Попробуйте 3 различные цветовые схемы",
    icon: "🎨",
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    category: "exploration",
  },
  {
    id: "theme_master",
    title: "Мастер тем",
    description: "Попробуйте все 8 цветовых схем",
    icon: "🌈",
    unlocked: false,
    progress: 0,
    maxProgress: 8,
    category: "exploration",
  },
  {
    id: "stoic_scholar",
    title: "Стоический учёный",
    description: "Прочитайте 5 цитат",
    icon: "📚",
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    category: "knowledge",
  },
  {
    id: "stoic_philosopher",
    title: "Стоический философ",
    description: "Прочитайте 25 цитат",
    icon: "🏛️",
    unlocked: false,
    progress: 0,
    maxProgress: 25,
    category: "knowledge",
  },
  {
    id: "stoic_sage",
    title: "Стоический мудрец",
    description: "Прочитайте 100 цитат",
    icon: "🧙",
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    category: "knowledge",
  },
  {
    id: "week_streak",
    title: "Недельная серия",
    description: "Посещайте приложение 7 дней подряд",
    icon: "🔥",
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    category: "special",
  },
  {
    id: "month_streak",
    title: "Месячная серия",
    description: "Посещайте приложение 30 дней подряд",
    icon: "🏆",
    unlocked: false,
    progress: 0,
    maxProgress: 30,
    category: "special",
  },
  {
    id: "year_streak",
    title: "Годовая серия",
    description: "Посещайте приложение 365 дней подряд",
    icon: "💎",
    unlocked: false,
    progress: 0,
    maxProgress: 365,
    category: "special",
  },
  {
    id: "book_collector",
    title: "Коллекционер книг",
    description: "Посмотрите все 6 книг",
    icon: "📖",
    unlocked: false,
    progress: 0,
    maxProgress: 6,
    category: "exploration",
  },
  {
    id: "book_library",
    title: "Библиотекарь",
    description: "Посмотрите все 6 книг",
    icon: "📚",
    unlocked: false,
    progress: 0,
    maxProgress: 6,
    category: "exploration",
  },
  {
    id: "favorites_curator",
    title: "Куратор избранного",
    description: "Добавьте 10 цитат в избранное",
    icon: "💛",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: "interaction",
  },
  {
    id: "favorites_master",
    title: "Хранитель мудрости",
    description: "Добавьте 50 цитат в избранное",
    icon: "💫",
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    category: "interaction",
  },
  {
    id: "daily_visitor",
    title: "Ежедневный гость",
    description: "Посетите приложение 3 дня подряд",
    icon: "🌅",
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    category: "special",
  },
  {
    id: "quote_sharer",
    title: "Делитель мудрости",
    description: "Поделитесь 5 цитатами",
    icon: "📤",
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    category: "interaction",
  },
  {
    id: "category_explorer",
    title: "Исследователь категорий",
    description: "Прочитайте цитаты из 10 категорий",
    icon: "🗂️",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: "knowledge",
  },
  {
    id: "night_owl",
    title: "Ночная сова",
    description: "Посетите приложение ночью (00:00-05:00)",
    icon: "🦉",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: "special",
  },
  {
    id: "early_bird",
    title: "Ранняя пташка",
    description: "Посетите приложение рано утром (05:00-08:00)",
    icon: "🐦",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: "special",
  },
  {
    id: "zen_master",
    title: "Дзен мастер",
    description: "Проведите в приложении более 30 минут за сессию",
    icon: "🧘",
    unlocked: false,
    progress: 0,
    maxProgress: 1800,
    category: "special",
  },
  // Новые достижения по категориям (v0.3.0)
  {
    id: "wisdom_seeker",
    title: "Искатель мудрости",
    description: "Прочитайте 10 цитат категории 'Мудрость'",
    icon: "🎓",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: "knowledge",
  },
  {
    id: "wisdom_master",
    title: "Мастер мудрости",
    description: "Прочитайте 25 цитат категории 'Мудрость'",
    icon: "🏆",
    unlocked: false,
    progress: 0,
    maxProgress: 25,
    category: "knowledge",
  },
  {
    id: "stoic_warrior",
    title: "Стоический воин",
    description: "Прочитайте 15 цитат категории 'Стойкость'",
    icon: "⚔️",
    unlocked: false,
    progress: 0,
    maxProgress: 15,
    category: "knowledge",
  },
  {
    id: "peaceful_soul",
    title: "Спокойная душа",
    description: "Прочитайте 15 цитат категории 'Спокойствие'",
    icon: "🕊️",
    unlocked: false,
    progress: 0,
    maxProgress: 15,
    category: "knowledge",
  },
  {
    id: "action_hero",
    title: "Герой действий",
    description: "Прочитайте 10 цитат категории 'Действие'",
    icon: "🚀",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: "knowledge",
  },
  {
    id: "life_philosopher",
    title: "Философ жизни",
    description: "Прочитайте 20 цитат категории 'Жизнь'",
    icon: "🌱",
    unlocked: false,
    progress: 0,
    maxProgress: 20,
    category: "knowledge",
  },
  {
    id: "knowledge_hunter",
    title: "Охотник за знаниями",
    description: "Прочитайте 20 цитат категории 'Знание'",
    icon: "🔍",
    unlocked: false,
    progress: 0,
    maxProgress: 20,
    category: "knowledge",
  },
  {
    id: "freedom_lover",
    title: "Любитель свободы",
    description: "Прочитайте 10 цитат категории 'Свобода'",
    icon: "🦅",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: "knowledge",
  },
  {
    id: "strategy_master",
    title: "Мастер стратегии",
    description: "Прочитайте 10 цитат категории 'Стратегия'",
    icon: "♟️",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: "knowledge",
  },
  {
    id: "inspiration_seeker",
    title: "Искатель вдохновения",
    description: "Прочитайте 15 цитат категории 'Вдохновение'",
    icon: "✨",
    unlocked: false,
    progress: 0,
    maxProgress: 15,
    category: "knowledge",
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = INITIAL_ACHIEVEMENTS_DATA as Achievement[];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
}

function calculateStreakDays(visitHistory: string[]): number {
  if (visitHistory.length === 0) return 0;

  // Get unique dates sorted descending (newest first)
  const uniqueDates = [...new Set(visitHistory)].sort((a, b) => b.localeCompare(a));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Streak only counts if user visited today or yesterday
  const mostRecentDate = uniqueDates[0];
  if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
    return 0; // Streak broken
  }

  // Count consecutive days backwards from the most recent visit
  let streak = 1;
  let currentDate = new Date(mostRecentDate + 'T00:00:00');

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i] + 'T00:00:00');
    const expectedPrev = new Date(currentDate);
    expectedPrev.setDate(expectedPrev.getDate() - 1);

    if (prevDate.getTime() === expectedPrev.getTime()) {
      streak++;
      currentDate = prevDate;
    } else {
      break; // Gap found, streak ends
    }
  }

  return Math.min(streak, 365); // Cap at 365
}

function getQuoteForToday(): QuoteOfDay {
  const dayIndex = getDayOfYear() % STOIC_QUOTES.length;
  const quote = STOIC_QUOTES[dayIndex];
  const today = new Date().toISOString().split("T")[0];

  // Проверяем сохранённый статус лайка для сегодня
  try {
    const saved = localStorage.getItem('quote-of-day');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        return {
          ...quote,
          date: today,
          liked: parsed.liked || false,
        };
      }
    }
  } catch {
    // Игнорируем ошибки localStorage
  }

  return {
    ...quote,
    date: today,
    liked: false,
  };
}

/**
 * Тема дня для daily theme challenge
 */
export interface ThemeOfDay {
  theme: string;
  themeName: string;
  description: string;
  date: string;
  completed: boolean;
}

const THEMES_ROTATION = [
  { theme: 'dark', name: 'Тёмная', description: 'Классическая тёмная тема для комфортного чтения' },
  { theme: 'light', name: 'Светлая', description: 'Светлая тема для дневного использования' },
  { theme: 'blue', name: 'Синяя', description: 'Спокойная синяя тема для концентрации' },
  { theme: 'purple', name: 'Фиолетовая', description: 'Творческая фиолетовая тема' },
  { theme: 'ambient', name: 'Амбиент', description: 'Природная зелёная тема для релаксации' },
  { theme: 'relax', name: 'Релакс', description: 'Мягкая расслабляющая тема' },
];

function getThemeOfDay(): ThemeOfDay {
  const dayIndex = getDayOfYear() % THEMES_ROTATION.length;
  const themeData = THEMES_ROTATION[dayIndex];
  const today = new Date().toISOString().split("T")[0];

  try {
    const saved = localStorage.getItem('theme-of-day');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        return {
          theme: themeData.theme,
          themeName: themeData.name,
          description: themeData.description,
          date: today,
          completed: parsed.completed || false,
        };
      }
    }
  } catch {
    // Игнорируем ошибки localStorage
  }

  return {
    theme: themeData.theme,
    themeName: themeData.name,
    description: themeData.description,
    date: today,
    completed: false,
  };
}

/**
 * Хук для управления геймификацией
 */
export function useGamification() {
  const { settings, updateStatistics, unlockAchievement, updateAchievement, addFavorite, removeFavorite } = useUserSettings();
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    // Read persisted settings synchronously from localStorage
    let persistedAchievements: PersistedAchievement[] = [];
    let persistedStats = { rotations: 0, quotesRead: 0, timeSpent: 0, booksViewed: [], themesExplored: [] };
    let persistedFavorites: unknown[] = [];
    try {
      const saved = localStorage.getItem('user-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        persistedAchievements = parsed.achievements || [];
        persistedStats = parsed.statistics || persistedStats;
        persistedFavorites = parsed.favorites || [];
      }
    } catch { /* ignore parse errors */ }

    // Build lookup map from persisted achievements
    const persistedMap = new Map<string, PersistedAchievement>();
    for (const pa of persistedAchievements) {
      persistedMap.set(pa.id, pa);
    }

    // Merge persisted state with definitions
    return INITIAL_ACHIEVEMENTS.map(def => {
      const persisted = persistedMap.get(def.id);
      if (!persisted) return { ...def };

      const isUnlocked = !!persisted.unlockedAt;
      let progress = persisted.progress ?? def.progress;

      // Restore progress from statistics for achievements without explicit progress
      if (!persisted.progress) {
        switch (def.id) {
          case 'rotation_master':
          case 'rotation_expert':
          case 'rotation_legend':
            progress = persistedStats.rotations;
            break;
          case 'theme_explorer':
          case 'theme_master':
            progress = persistedStats.themesExplored.length;
            break;
          case 'book_collector':
          case 'book_library':
            progress = persistedStats.booksViewed.length;
            break;
          case 'stoic_scholar':
          case 'stoic_philosopher':
          case 'stoic_sage':
            progress = persistedStats.quotesRead;
            break;
          case 'favorites_curator':
          case 'favorites_master':
            progress = persistedFavorites.length;
            break;
          case 'zen_master':
            progress = persistedStats.timeSpent;
            break;
        }
      }

      progress = Math.min(progress, def.maxProgress);

      return {
        ...def,
        unlocked: isUnlocked || progress >= def.maxProgress,
        unlockedAt: persisted.unlockedAt ? new Date(persisted.unlockedAt) : undefined,
        progress,
      };
    });
  });
  const [quoteOfDay, setQuoteOfDay] = useState<QuoteOfDay>(getQuoteForToday);
  const [themeOfDay, setThemeOfDay] = useState<ThemeOfDay>(getThemeOfDay);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  // Use a ref to avoid stale closures in callbacks
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Проверка достижения
  const checkAchievement = useCallback((achievementId: string, progressValue: number) => {
    setAchievements(prev => prev.map(ach => {
      if (ach.id === achievementId) {
        const newProgress = Math.min(progressValue, ach.maxProgress);
        const shouldUnlock = newProgress >= ach.maxProgress && !ach.unlocked;

        if (shouldUnlock) {
          const unlockTime = new Date();
          unlockAchievement({
            id: ach.id,
            unlockedAt: unlockTime.toISOString(),
            progress: ach.maxProgress,
          });
          setTimeout(() => setShowAchievement({ ...ach, unlocked: true, unlockedAt: unlockTime }), 500);
        } else if (newProgress > ach.progress) {
          updateAchievement(ach.id, { progress: newProgress });
        }

        return {
          ...ach,
          progress: ach.unlocked ? ach.maxProgress : newProgress,
          unlocked: ach.unlocked || shouldUnlock,
          unlockedAt: shouldUnlock ? new Date() : ach.unlockedAt,
        };
      }
      return ach;
    }));
  }, [unlockAchievement, updateAchievement]);

  // Трекинг посещений при первой загрузке
  const hasInitializedVisitRef = useRef(false);
  useEffect(() => {
    if (hasInitializedVisitRef.current) return;
    hasInitializedVisitRef.current = true;

    const today = new Date().toISOString().split('T')[0];
    const { totalVisits, firstVisitDate, visitHistory } = settingsRef.current.statistics;

    // Add today to visit history if not already recorded
    const updatedHistory = visitHistory.includes(today) ? visitHistory : [...visitHistory, today];

    updateStatistics({
      totalVisits: totalVisits + 1,
      lastVisitDate: today,
      firstVisitDate: firstVisitDate || today,
      visitHistory: updatedHistory,
    });

    // Check time-based achievements (night owl, early bird)
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) {
      checkAchievement("night_owl", 1);
    }
    if (hour >= 5 && hour < 8) {
      checkAchievement("early_bird", 1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run only once on mount

  // Обновление прогресса вращения
  const incrementRotations = useCallback(() => {
    const rotations = settingsRef.current.statistics.rotations;
    const newCount = rotations + 1;
    updateStatistics({ rotations: newCount });

    if (newCount >= 10) {
      checkAchievement("rotation_master", newCount);
    }
    if (newCount >= 50) {
      checkAchievement("rotation_expert", newCount);
    }
    if (newCount >= 100) {
      checkAchievement("rotation_legend", newCount);
    }
  }, [checkAchievement, updateStatistics]);

  // Обновление исследованных тем
  const addThemeExplored = useCallback((theme: string) => {
    const themes = settingsRef.current.statistics.themesExplored;
    if (!themes.includes(theme)) {
      const newThemes = [...themes, theme];
      updateStatistics({ themesExplored: newThemes });

      checkAchievement("theme_explorer", newThemes.length);
      checkAchievement("theme_master", newThemes.length);
    }
  }, [checkAchievement, updateStatistics]);

  // Добавление просмотренной книги
  const addBookViewed = useCallback((bookId: string) => {
    const books = settingsRef.current.statistics.booksViewed;
    if (!books.includes(bookId)) {
      const newBooks = [...books, bookId];
      updateStatistics({ booksViewed: newBooks });
      checkAchievement("book_collector", newBooks.length);
      checkAchievement("book_library", newBooks.length);
    }
  }, [checkAchievement, updateStatistics]);

  // Инкремент прочитанных цитат
  const incrementQuotesRead = useCallback(() => {
    const quotesRead = settingsRef.current.statistics.quotesRead;
    const newCount = quotesRead + 1;
    updateStatistics({ quotesRead: newCount });

    if (newCount >= 5) {
      checkAchievement("stoic_scholar", newCount);
    }
    if (newCount >= 25) {
      checkAchievement("stoic_philosopher", newCount);
    }
    if (newCount >= 100) {
      checkAchievement("stoic_sage", newCount);
    }
  }, [checkAchievement, updateStatistics]);

  // Инкремент прочитанных цитат по категориям
  const incrementCategoryRead = useCallback((category: string) => {
    const categoryAchievements: Record<string, { id: string; thresholds: number[] }> = {
      'мудрость': { id: 'wisdom_seeker', thresholds: [10, 25] },
      'стойкость': { id: 'stoic_warrior', thresholds: [15] },
      'спокойствие': { id: 'peaceful_soul', thresholds: [15] },
      'действие': { id: 'action_hero', thresholds: [10] },
      'жизнь': { id: 'life_philosopher', thresholds: [20] },
      'знание': { id: 'knowledge_hunter', thresholds: [20] },
      'свобода': { id: 'freedom_lover', thresholds: [10] },
      'стратегия': { id: 'strategy_master', thresholds: [10] },
      'вдохновение': { id: 'inspiration_seeker', thresholds: [15] },
    };

    const achievement = categoryAchievements[category.toLowerCase()];
    if (achievement) {
      // Проверяем прогресс через localStorage (упрощённо)
      const key = `category_${category}`;
      try {
        const saved = localStorage.getItem(key);
        const currentCount = saved ? parseInt(saved, 10) : 0;
        const newCount = currentCount + 1;
        localStorage.setItem(key, newCount.toString());

        for (const threshold of achievement.thresholds) {
          if (newCount >= threshold) {
            checkAchievement(achievement.id, newCount);
          }
        }
      } catch {
        // Игнорируем ошибки localStorage
      }
    }
  }, [checkAchievement]);

  // Лайк цитаты с добавлением/удалением из избранного
  const toggleQuoteLike = useCallback(() => {
    setQuoteOfDay(prev => {
      const newLiked = !prev.liked;
      // Сохраняем в localStorage
      try {
        localStorage.setItem('quote-of-day', JSON.stringify({
          date: prev.date,
          liked: newLiked,
        }));
      } catch {
        // Игнорируем ошибки localStorage
      }

      // Добавляем или удаляем из реального списка избранного
      const quote: { text: string; author: string } = { text: prev.quote, author: prev.author };
      if (newLiked) {
        addFavorite(quote);
      } else {
        removeFavorite(quote.text);
      }

      return { ...prev, liked: newLiked };
    });
  }, [addFavorite, removeFavorite]);

  // Автоматическая проверка достижений при изменении избранного
  useEffect(() => {
    const favoritesCount = settings.favorites.length;
    if (favoritesCount >= 10) {
      checkAchievement("favorites_curator", favoritesCount);
    }
    if (favoritesCount >= 50) {
      checkAchievement("favorites_master", favoritesCount);
    }
  }, [settings.favorites.length, checkAchievement]);

  // Шаринг цитаты с проверкой достижения
  const incrementQuoteShares = useCallback((shareCount: number) => {
    if (shareCount >= 5) {
      checkAchievement("quote_sharer", shareCount);
    }
  }, [checkAchievement]);

  const dismissAchievement = useCallback(() => {
    setShowAchievement(null);
  }, []);

  // No-op: achievement was removed but kept for API compatibility
  const unlockCustomCoverAchievement = useCallback(() => {}, []);

  const totalUnlocked = useMemo(() =>
    achievements.filter(a => a.unlocked).length,
    [achievements]
  );

  const completionPercentage = useMemo(() =>
    Math.round((totalUnlocked / achievements.length) * 100),
    [totalUnlocked, achievements.length]
  );

  // Статистика для dashboard
  const stats = useMemo(() => ({
    totalAchievements: achievements.length,
    totalUnlocked,
    completionPercentage,
    totalVisits: settings.statistics.totalVisits,
    totalRotations: settings.statistics.rotations,
    quotesRead: settings.statistics.quotesRead,
    quotesLiked: settings.favorites.length,
    booksViewed: settings.statistics.booksViewed.length,
    themesExplored: settings.statistics.themesExplored.length,
    streakDays: calculateStreakDays(settings.statistics.visitHistory),
    totalTimeSeconds: settings.statistics.timeSpent,
    firstVisitDate: settings.statistics.firstVisitDate,
    lastVisitDate: settings.statistics.lastVisitDate,
  }), [achievements, totalUnlocked, completionPercentage, settings]);

  // Отслеживание времени в приложении с проверкой достижения zen_master
  const trackTime = useCallback((seconds: number) => {
    const totalTime = settingsRef.current.statistics.timeSpent + seconds;

    // Проверка достижения zen_master (30 минут = 1800 секунд)
    const zenAchievement = INITIAL_ACHIEVEMENTS.find(a => a.id === 'zen_master');
    if (totalTime >= 1800 && zenAchievement) {
      checkAchievement('zen_master', totalTime);
    }
  }, [checkAchievement]);

  /**
   * Экспорт прогресса пользователя в JSON
   */
  const exportProgress = useCallback(() => {
    const progressData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      statistics: {
        timeSpent: settings.statistics.timeSpent,
        quotesRead: settings.statistics.quotesRead,
        rotations: settings.statistics.rotations,
        booksViewed: settings.statistics.booksViewed,
        themesExplored: settings.statistics.themesExplored,
        visitHistory: settings.statistics.visitHistory,
      },
      achievements: achievements
        .filter(a => a.unlocked)
        .map(a => ({
          id: a.id,
          title: a.title,
          unlockedAt: a.unlockedAt?.toISOString(),
        })),
      favorites: {
        count: settings.favorites.length,
        quotes: settings.favorites.map(q => ({
          text: q.text,
          author: q.author,
        })),
      },
      summary: {
        totalAchievements: achievements.length,
        unlockedAchievements: totalUnlocked,
        completionPercentage: completionPercentage,
      },
    };

    return JSON.stringify(progressData, null, 2);
  }, [settings, achievements, totalUnlocked, completionPercentage]);

  /**
   * Завершение испытания темы дня
   */
  const completeThemeChallenge = useCallback(() => {
    setThemeOfDay(prev => {
      const updated = { ...prev, completed: true };
      try {
        localStorage.setItem('theme-of-day', JSON.stringify(updated));
      } catch {
        // Игнорируем ошибки localStorage
      }
      return updated;
    });
  }, []);

  return {
    achievements,
    quoteOfDay,
    themeOfDay,
    showAchievement,
    stats,
    incrementRotations,
    addThemeExplored,
    addBookViewed,
    toggleQuoteLike,
    incrementQuotesRead,
    incrementCategoryRead,
    incrementQuoteShares,
    unlockCustomCoverAchievement,
    trackTime,
    dismissAchievement,
    totalUnlocked,
    completionPercentage,
    exportProgress,
    completeThemeChallenge,
  };
}
