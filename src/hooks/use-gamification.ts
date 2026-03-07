"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

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
  streakDays: number;
  lastVisitDate: string;
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
    id: "custom_cover",
    title: "Библиотекарь",
    description: "Загрузите свою обложку книги",
    icon: "📖",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
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
  const likedQuotes = JSON.parse(localStorage.getItem("stoic_quotes_liked") || "[]");
  
  return {
    ...quote,
    date: new Date().toISOString().split("T")[0],
    liked: likedQuotes.includes(quote.quote),
  };
}

function loadProgress(): UserProgress {
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
    streakDays: 0,
    lastVisitDate: "",
  };
}

function saveProgress(progress: UserProgress): void {
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

  // Обновление прогресса при посещении
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    
    if (progress.lastVisitDate !== today) {
      // Новый день — обновляем серию
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      const newStreak = progress.lastVisitDate === yesterdayStr 
        ? progress.streakDays + 1 
        : progress.streakDays > 0 ? 1 : 0;
      
      const newProgress = {
        ...progress,
        totalVisits: progress.totalVisits + 1,
        streakDays: newStreak,
        lastVisitDate: today,
      };
      
      setProgress(newProgress);
      saveProgress(newProgress);
      
      // Проверяем достижение за серию
      checkAchievement("week_streak", newStreak);
    }
    
    // Проверяем достижение за первое посещение
    if (progress.totalVisits === 0) {
      unlockAchievement("first_visit");
    }
  }, []);

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
          progress: newProgress,
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

  // Обновление прогресса вращения
  const incrementRotations = useCallback(() => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        totalRotations: prev.totalRotations + 1,
      };
      saveProgress(newProgress);
      
      // Проверяем достижение
      checkAchievement("rotation_master", Math.floor(newProgress.totalRotations / 10));
      
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
      
      return newProgress;
    });
  }, [checkAchievement]);

  // Лайк цитаты
  const toggleQuoteLike = useCallback((quoteText: string) => {
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
      
      return { ...prev, liked: newLiked };
    });
  }, []);

  // Инкремент прочитанных цитат
  const incrementQuotesRead = useCallback(() => {
    checkAchievement("stoic_scholar", Math.floor(progress.totalVisits / 5));
  }, [checkAchievement, progress.totalVisits]);

  // Разблокировка достижения за загрузку обложки
  const unlockCustomCoverAchievement = useCallback(() => {
    unlockAchievement("custom_cover");
  }, [unlockAchievement]);

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

  return {
    progress,
    achievements,
    quoteOfDay,
    showAchievement,
    incrementRotations,
    addThemeExplored,
    toggleQuoteLike,
    incrementQuotesRead,
    unlockCustomCoverAchievement,
    dismissAchievement,
    totalUnlocked,
    completionPercentage,
  };
}
