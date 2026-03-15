"use client";

import { useReportWebVitals } from "next/web-vitals";

const STORAGE_KEY = 'web-vitals-metrics';
const REPORT_THRESHOLD = 0.1; // Сообщать только об изменениях >10%

interface StoredMetrics {
  [key: string]: { value: number; timestamp: number };
}

function getStoredMetrics(): StoredMetrics {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveMetric(name: string, value: number): void {
  try {
    const metrics = getStoredMetrics();
    metrics[name] = { value, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  } catch {
    // Игнорируем ошибки localStorage
  }
}

function shouldReport(name: string, value: number): boolean {
  const metrics = getStoredMetrics();
  const stored = metrics[name];
  
  if (!stored) return true;
  
  // Сообщаем если прошло больше 5 минут или изменение значительное
  const timeDiff = Date.now() - stored.timestamp;
  const percentChange = Math.abs((value - stored.value) / stored.value);
  
  return timeDiff > 5 * 60 * 1000 || percentChange > REPORT_THRESHOLD;
}

function getNavigationType(): string {
  if (typeof performance !== 'undefined' && 'getEntriesByType' in performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation) {
      return navigation.type;
    }
  }
  return 'navigate';
}

export function WebVitalsMonitor() {
  useReportWebVitals((metric) => {
    const { name, value, id, navigationType } = metric;
    
    // Не отправляем если изменение незначительное
    if (!shouldReport(name, value)) {
      return;
    }
    
    // Сохраняем локально
    saveMetric(name, value);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn(`[WebVitals] ${name}:`, value, `(id: ${id}, nav: ${navigationType})`);
    }

    // Отправляем только в production
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const body = {
      dsn: process.env.NEXT_PUBLIC_WEB_VITALS_DSN,
      id,
      name,
      value,
      path: window.location.pathname,
      userAgent: navigator.userAgent,
      navigationType: navigationType || getNavigationType(),
      timestamp: Date.now(),
    };

    // Отправка с приоритетом background
    if (process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT) {
      // Используем sendBeacon для надёжной доставки
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon(process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT, blob);
      } else {
        // Fallback для старых браузеров
        fetch(process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
        }).catch(() => {
          // Игнорируем ошибки отправки
        });
      }
    }
  });

  return null;
}
