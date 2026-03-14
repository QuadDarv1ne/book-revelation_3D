"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUserSettings } from "./use-user-settings";

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

const INITIAL_ACHIEVEMENTS: Achievement[] = [
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
    id: "book_collector",
    title: "Коллекционер книг",
    description: "Посмотрите все 5 книг",
    icon: "📖",
    unlocked: false,
    progress: 0,
    maxProgress: 5,
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
];

const STOIC_QUOTES = [
  { quote: "Счастье вашей жизни зависит от качества ваших мыслей.", author: "Марк Аврелий" },
  { quote: "Лучший способ отомстить врагу — не уподобляться ему.", author: "Эпиктет" },
  { quote: "Кто не знает, куда направляется, очень удивится, попав не туда.", author: "Сенека" },
  { quote: "Мы страдаем чаще в воображении, чем в действительности.", author: "Сенека" },
  { quote: "Сначала убедись, что ты независим; иначе твоя свобода будет зависеть от других.", author: "Эпиктет" },
  { quote: "Наша жизнь — это то, что о ней думают наши боги.", author: "Марк Аврелий" },
  { quote: "Власть над собой — высшая власть.", author: "Сенека" },
  { quote: "Человек боящийся смерти, никогда не сделает ничего достойного живого.", author: "Сенека" },
  { quote: "У тебя есть власть над своим умом — не снаружи. Осознай это, и ты обретешь силу.", author: "Марк Аврелий" },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getQuoteForToday(): QuoteOfDay {
  const dayIndex = getDayOfYear() % STOIC_QUOTES.length;
  const quote = STOIC_QUOTES[dayIndex];

  return {
    ...quote,
    date: new Date().toISOString().split("T")[0],
    liked: false,
  };
}

/**
 * Хук для управления геймификацией
 */
export function useGamification() {
  const { settings, updateStatistics } = useUserSettings();
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [quoteOfDay, setQuoteOfDay] = useState<QuoteOfDay>(getQuoteForToday);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  // Проверка достижения
  const checkAchievement = useCallback((achievementId: string, progressValue: number) => {
    setAchievements(prev => prev.map(ach => {
      if (ach.id === achievementId) {
        const newProgress = Math.min(progressValue, ach.maxProgress);
        const shouldUnlock = newProgress >= ach.maxProgress && !ach.unlocked;

        if (shouldUnlock) {
          setTimeout(() => setShowAchievement({ ...ach, unlocked: true }), 500);
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
  }, []);

  // Обновление прогресса при посещении - используем ref для избежания setState в effect
  const hasInitializedVisitRef = useRef(false);
  useEffect(() => {
    if (hasInitializedVisitRef.current) return;
    hasInitializedVisitRef.current = true;
  }, []);

  // Обновление прогресса вращения
  const incrementRotations = useCallback(() => {
    updateStatistics({ rotations: settings.statistics.rotations + 1 });

    if (settings.statistics.rotations + 1 >= 10) {
      checkAchievement("rotation_master", 1);
    }
    if (settings.statistics.rotations + 1 >= 50) {
      checkAchievement("rotation_expert", 1);
    }
  }, [checkAchievement, settings.statistics.rotations, updateStatistics]);

  // Обновление исследованных тем
  const addThemeExplored = useCallback((theme: string) => {
    if (!settings.statistics.themesExplored.includes(theme)) {
      const newThemes = [...settings.statistics.themesExplored, theme];
      updateStatistics({ themesExplored: newThemes });

      checkAchievement("theme_explorer", newThemes.length);
      checkAchievement("theme_master", newThemes.length);
    }
  }, [checkAchievement, settings.statistics.themesExplored, updateStatistics]);

  // Добавление просмотренной книги
  const addBookViewed = useCallback((bookId: string) => {
    if (!settings.statistics.booksViewed.includes(bookId)) {
      const newBooks = [...settings.statistics.booksViewed, bookId];
      updateStatistics({ booksViewed: newBooks });
      checkAchievement("book_collector", newBooks.length);
    }
  }, [checkAchievement, settings.statistics.booksViewed, updateStatistics]);

  // Инкремент прочитанных цитат
  const incrementQuotesRead = useCallback(() => {
    const newCount = settings.statistics.quotesRead + 1;
    updateStatistics({ quotesRead: newCount });

    if (newCount >= 5) {
      checkAchievement("stoic_scholar", 1);
    }
    if (newCount >= 25) {
      checkAchievement("stoic_philosopher", 1);
    }
  }, [checkAchievement, settings.statistics.quotesRead, updateStatistics]);

  // Лайк цитаты с проверкой достижения
  const toggleQuoteLike = useCallback(() => {
    setQuoteOfDay(prev => ({ ...prev, liked: !prev.liked }));
  }, []);

  // Разблокировка достижения за загрузку обложки
  const unlockCustomCoverAchievement = useCallback(() => {
    // Достижение удалено из списка
  }, []);

  const dismissAchievement = useCallback(() => {
    setShowAchievement(null);
  }, []);

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
    totalVisits: 0,
    totalRotations: settings.statistics.rotations,
    quotesRead: settings.statistics.quotesRead,
    quotesLiked: settings.favorites.length,
    booksViewed: settings.statistics.booksViewed.length,
    themesExplored: settings.statistics.themesExplored.length,
    streakDays: 0,
    totalTimeSeconds: 0,
    firstVisitDate: "",
    lastVisitDate: "",
  }), [achievements, totalUnlocked, completionPercentage, settings]);

  // Отслеживание времени в приложении
  const trackTime = useCallback((_seconds: number) => {
    // Упрощено для централизации
  }, []);

  return {
    achievements,
    quoteOfDay,
    showAchievement,
    stats,
    incrementRotations,
    addThemeExplored,
    addBookViewed,
    toggleQuoteLike,
    incrementQuotesRead,
    unlockCustomCoverAchievement,
    trackTime,
    dismissAchievement,
    totalUnlocked,
    completionPercentage,
  };
}
