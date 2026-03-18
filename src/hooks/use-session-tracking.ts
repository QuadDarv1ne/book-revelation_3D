"use client";

import { useCallback, useEffect, useRef } from "react";

interface SessionData {
  sessionId: string;
  startTime: number;
  lastSaveTime: number;
  totalTime: number;
}

const SESSION_STORAGE_KEY = 'session_tracking';
const SAVE_INTERVAL = 10000; // 10 секунд

// Генерация уникального ID сессии
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Хук для трекинга сессий пользователя
 * Отслеживает время в приложении и автосохраняет прогресс
 */
export function useSessionTracking() {
  const sessionRef = useRef<SessionData | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Сохранение текущей сессии в localStorage
  const saveSession = useCallback(() => {
    if (!sessionRef.current) return;

    const elapsed = Math.floor((Date.now() - sessionRef.current.startTime) / 1000);
    sessionRef.current.totalTime = elapsed;
    sessionRef.current.lastSaveTime = Date.now();

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionRef.current));
    } catch {
      // Игнорируем ошибки localStorage
    }
  }, []);

  // Загрузка последней сессии
  const loadSession = useCallback(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Если сессия была менее 24 часов назад
        if (Date.now() - parsed.lastSaveTime < 24 * 60 * 60 * 1000) {
          return parsed as SessionData;
        }
      }
    } catch {
      // Игнорируем ошибки
    }
    return null;
  }, []);

  // Инициализация сессии
  useEffect(() => {
    const existingSession = loadSession();
    
    sessionRef.current = {
      sessionId: generateSessionId(),
      startTime: Date.now(),
      lastSaveTime: Date.now(),
      totalTime: existingSession?.totalTime || 0,
    };

    // Автосохранение каждые 10 секунд
    saveIntervalRef.current = setInterval(saveSession, SAVE_INTERVAL);

    // Сохранение при закрытии/уходе со страницы
    const handleBeforeUnload = () => {
      saveSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      saveSession();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadSession, saveSession]);

  // Получение текущего времени сессии в секундах
  const getSessionTime = useCallback((): number => {
    if (!sessionRef.current) return 0;
    return Math.floor((Date.now() - sessionRef.current.startTime) / 1000);
  }, []);

  // Получение общего накопленного времени
  const getTotalTime = useCallback((): number => {
    if (!sessionRef.current) return 0;
    return sessionRef.current.totalTime + getSessionTime();
  }, [getSessionTime]);

  // Сброс сессии (для явного завершения)
  const resetSession = useCallback(() => {
    saveSession();
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Игнорируем ошибки
    }
  }, [saveSession]);

  return {
    getSessionTime,
    getTotalTime,
    resetSession,
  };
}
