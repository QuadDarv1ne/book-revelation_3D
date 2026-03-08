"use client";

import { useCallback, useEffect } from "react";

interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
}

export function useAnalytics() {
  // Track custom events
  const trackEvent = useCallback((category: string, action: string, label?: string, value?: number) => {
    const event: AnalyticsEvent = {
      event: action,
      category,
      label,
      value,
      timestamp: Date.now(),
    };

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.warn("[Analytics]", event);
    }

    // Send to Vercel Analytics
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).va) {
      (window as unknown as Record<string, (type: string, data: unknown) => void>).va("event", {
        category,
        action,
        label,
        value,
      });
    }

    // Store locally for debugging
    if (typeof window !== "undefined") {
      const events = JSON.parse(localStorage.getItem("analytics_events") || "[]");
      events.push(event);
      // Keep only last 100 events
      if (events.length > 100) events.shift();
      localStorage.setItem("analytics_events", JSON.stringify(events));
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (typeof window !== "undefined") {
      trackEvent("navigation", "page_view", window.location.pathname);
    }
  }, [trackEvent]);

  return {
    trackEvent,
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
