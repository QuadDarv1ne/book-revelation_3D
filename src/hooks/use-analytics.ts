"use client";

import { useCallback, useEffect, useRef } from "react";

interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId?: string;
}

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 секунд
const MAX_STORED_EVENTS = 500;

// Генерация уникального ID сессии
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useAnalytics() {
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const sessionIdRef = useRef<string>(generateSessionId());
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Отправка событий через sendBeacon
  const sendBeacon = useCallback((events: AnalyticsEvent[]) => {
    if (!navigator.sendBeacon) return false;

    const payload = JSON.stringify({
      events,
      sessionId: sessionIdRef.current,
      timestamp: Date.now(),
    });

    try {
      // Попытка отправки через sendBeacon (неблокирующая)
      const sent = navigator.sendBeacon('/api/analytics', payload);
      return sent;
    } catch {
      return false;
    }
  }, []);

  // Сохранение событий локально
  const storeEventsLocally = useCallback((events: AnalyticsEvent[]) => {
    try {
      const stored = JSON.parse(localStorage.getItem("analytics_events") || "[]");
      stored.push(...events);
      // Храним только последние MAX_STORED_EVENTS
      if (stored.length > MAX_STORED_EVENTS) {
        stored.splice(0, stored.length - MAX_STORED_EVENTS);
      }
      localStorage.setItem("analytics_events", JSON.stringify(stored));
    } catch {
      // Игнорируем ошибки localStorage
    }
  }, []);

  // Очистка очереди событий
  const flushEvents = useCallback(() => {
    if (eventQueueRef.current.length === 0) return;

    const eventsToSend = [...eventQueueRef.current];
    eventQueueRef.current = [];

    // Отправка через sendBeacon
    const sent = sendBeacon(eventsToSend);

    // Если не удалось отправить, сохраняем локально
    if (!sent) {
      storeEventsLocally(eventsToSend);
    }
  }, [sendBeacon, storeEventsLocally]);

  // Периодическая отправка накопленных событий
  useEffect(() => {
    flushTimeoutRef.current = setInterval(flushEvents, FLUSH_INTERVAL);

    // Отправка при закрытии страницы
    const handleBeforeUnload = () => {
      flushEvents();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (flushTimeoutRef.current) {
        clearInterval(flushTimeoutRef.current);
      }
      flushEvents();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushEvents]);

  // Track custom events
  const trackEvent = useCallback((category: string, action: string, label?: string, value?: number) => {
    const event: AnalyticsEvent = {
      event: action,
      category,
      label,
      value,
      timestamp: Date.now(),
      sessionId: sessionIdRef.current,
    };

    // Отправка в Vercel Analytics (если доступно)
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).va) {
      (window as unknown as Record<string, (type: string, data: unknown) => void>).va("event", {
        category,
        action,
        label,
        value,
      });
    }

    // Добавление в очередь
    eventQueueRef.current.push(event);

    // Немедленная отправка при достижении BATCH_SIZE
    if (eventQueueRef.current.length >= BATCH_SIZE) {
      flushEvents();
    }

    // Локальное хранение для отладки
    storeEventsLocally([event]);
  }, [flushEvents, storeEventsLocally]);

  // Track page views
  useEffect(() => {
    if (typeof window !== "undefined") {
      trackEvent("navigation", "page_view", window.location.pathname);
    }
  }, [trackEvent]);

  return {
    trackEvent,
    sessionId: sessionIdRef.current,
  };
}

// Pre-defined event trackers
export const trackQuoteInteraction = (action: string, quoteIndex: number, bookId: string) => {
  if (typeof window === "undefined") return;
  
  const event: AnalyticsEvent = {
    event: action,
    category: "quote",
    label: `${bookId}:${quoteIndex}`,
    value: quoteIndex,
    timestamp: Date.now(),
  };

  localStorage.setItem("last_quote_event", JSON.stringify(event));
};

export const trackBookChange = (fromBook: string, toBook: string) => {
  if (typeof window === "undefined") return;
  
  const event: AnalyticsEvent = {
    event: "book_change",
    category: "navigation",
    label: `${fromBook}->${toBook}`,
    timestamp: Date.now(),
  };

  localStorage.setItem("last_book_change", JSON.stringify(event));
};

export const trackThemeChange = (theme: string) => {
  if (typeof window === "undefined") return;
  
  const event: AnalyticsEvent = {
    event: "theme_change",
    category: "settings",
    label: theme,
    timestamp: Date.now(),
  };

  localStorage.setItem("last_theme_change", JSON.stringify(event));
};
