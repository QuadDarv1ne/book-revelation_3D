"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

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
  { quote: "Тот, кто не знает, куда направляется, очень удивится, попав не туда.", author: "Сенека" },
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

  // Проверяем, лайкнул ли пользователь эту цитату ранее
  let likedQuotes: string[] = [];
  if (typeof window !== "undefined") {
    likedQuotes = JSON.parse(localStorage.getItem("stoic_quotes_liked") || "[]");
  }

  return {
    ...quote,
    date: new Date().toISOString().split("T")[0],
    liked: likedQuotes.includes(quote.quote),
  };
}

function loadProgress(): UserProgress {
  if (typeof window === "undefined") {
    return {
      totalVisits: 0,
      totalRotations: 0,
      themesExplored: [],
      booksViewed: [],
      achievementsUnlocked: [],
      quotesLiked: [],
      quotesRead: 0,
      streakDays: 0,
      lastVisitDate: "",
      totalTimeSeconds: 0,
      firstVisitDate: "",
    };
  }

  const saved = localStorage.getItem("stoic_user_progress");
  if (saved) {
    return JSON.parse(saved);
  }

  return {
    totalVisits: 0,
    totalRotations: 0,
    themesExplored: [],
    booksViewed: [],
    achievementsUnlocked: [],
    quotesLiked: [],
    quotesRead: 0,
    streakDays: 0,
    lastVisitDate: "",
    totalTimeSeconds: 0,
    firstVisitDate: "",
  };
}

function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("stoic_user_progress", JSON.stringify(progress));
}

/**
 * Хук для управления геймификацией
 */
export function useGamification() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
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
          // Сохраняем в прогресс
          setProgress(p => {
            const newProgress = {
              ...p,
              achievementsUnlocked: [...p.achievementsUnlocked, achievementId],
            };
            saveProgress(newProgress);
            return newProgress;
          });
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

  // Разблокировка достижения
  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => {
      const achievement = prev.find(a => a.id === achievementId);
      if (!achievement || achievement.unlocked) return prev;

      const updated = prev.map(ach =>
        ach.id === achievementId
          ? { ...ach, unlocked: true, unlockedAt: new Date(), progress: ach.maxProgress }
          : ach
      );

      setTimeout(() => setShowAchievement(achievement), 500);

      // Сохраняем в прогресс
      setProgress(p => {
        const newProgress = {
          ...p,
          achievementsUnlocked: [...p.achievementsUnlocked, achievementId],
        };
        saveProgress(newProgress);
        return newProgress;
      });

      return updated;
    });
  }, []);

  // Обновление прогресса при посещении - используем ref для избежания setState в effect
  const hasInitializedVisitRef = useRef(false);
  useEffect(() => {
    if (hasInitializedVisitRef.current) return;

    const today = new Date().toISOString().split("T")[0];

    const currentProgress = loadProgress();
    if (currentProgress.lastVisitDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const newStreak = currentProgress.lastVisitDate === yesterdayStr
        ? currentProgress.streakDays + 1
        : currentProgress.streakDays > 0 ? 1 : 0;

      const newProgress = {
        ...currentProgress,
        totalVisits: currentProgress.totalVisits + 1,
        streakDays: newStreak,
        lastVisitDate: today,
        firstVisitDate: currentProgress.firstVisitDate || today,
      };

      saveProgress(newProgress);
      checkAchievement("week_streak", newStreak);

      if (currentProgress.totalVisits === 0) {
        unlockAchievement("first_visit");
      }

      setProgress(newProgress);
      hasInitializedVisitRef.current = true;
    }
  }, [checkAchievement, unlockAchievement]);

  // Обновление прогресса вращения
  const incrementRotations = useCallback(() => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        totalRotations: prev.totalRotations + 1,
      };
      saveProgress(newProgress);

      // Проверяем достижения
      if (newProgress.totalRotations >= 10) {
        checkAchievement("rotation_master", 1);
      }
      if (newProgress.totalRotations >= 50) {
        checkAchievement("rotation_expert", 1);
      }

      return newProgress;
    });
  }, [checkAchievement]);

  // Обновление исследованных тем
  const addThemeExplored = useCallback((theme: string) => {
    setProgress(prev => {
      if (prev.themesExplored.includes(theme)) return prev;

      const newProgress = {
        ...prev,
        themesExplored: [...prev.themesExplored, theme],
      };
      saveProgress(newProgress);

      checkAchievement("theme_explorer", newProgress.themesExplored.length);
      checkAchievement("theme_master", newProgress.themesExplored.length);

      return newProgress;
    });
  }, [checkAchievement]);

  // Добавление просмотренной книги
  const addBookViewed = useCallback((bookId: string) => {
    setProgress(prev => {
      if (prev.booksViewed.includes(bookId)) return prev;

      const newProgress = {
        ...prev,
        booksViewed: [...prev.booksViewed, bookId],
      };
      saveProgress(newProgress);

      checkAchievement("book_collector", newProgress.booksViewed.length);

      return newProgress;
    });
  }, [checkAchievement]);

  // Инкремент прочитанных цитат
  const incrementQuotesRead = useCallback(() => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        quotesRead: prev.quotesRead + 1,
      };
      saveProgress(newProgress);

      // Проверяем достижения
      if (newProgress.quotesRead >= 5) {
        checkAchievement("stoic_scholar", 1);
      }
      if (newProgress.quotesRead >= 25) {
        checkAchievement("stoic_philosopher", 1);
      }

      return newProgress;
    });
  }, [checkAchievement]);

  // Лайк цитаты с проверкой достижения
  const toggleQuoteLike = useCallback((quoteText: string) => {
    if (typeof window === "undefined") return;

    setQuoteOfDay(prev => {
      const newLiked = !prev.liked;

      // Сохраняем в localStorage
      const likedQuotes = JSON.parse(localStorage.getItem("stoic_quotes_liked") || "[]");
      if (newLiked) {
        likedQuotes.push(quoteText);
      } else {
        const index = likedQuotes.indexOf(quoteText);
        if (index > -1) likedQuotes.splice(index, 1);
      }
      localStorage.setItem("stoic_quotes_liked", JSON.stringify(likedQuotes));

      // Проверяем достижение
      checkAchievement("favorites_curator", likedQuotes.length);

      return { ...prev, liked: newLiked };
    });
  }, [checkAchievement]);

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
    totalVisits: progress.totalVisits,
    totalRotations: progress.totalRotations,
    quotesRead: progress.quotesRead,
    quotesLiked: progress.quotesLiked.length,
    booksViewed: progress.booksViewed.length,
    themesExplored: progress.themesExplored.length,
    streakDays: progress.streakDays,
    totalTimeSeconds: progress.totalTimeSeconds,
    firstVisitDate: progress.firstVisitDate,
    lastVisitDate: progress.lastVisitDate,
  }), [achievements, progress, totalUnlocked, completionPercentage]);

  // Отслеживание времени в приложении
  const trackTime = useCallback((seconds: number) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        totalTimeSeconds: prev.totalTimeSeconds + seconds,
      };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  return {
    progress,
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
