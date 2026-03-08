"use client";

import { useEffect, useCallback, useState } from "react";
import type { Quote } from "@/types/quote";

const QUOTES_CACHE_KEY = "stoic-quotes-cache";
const QUOTES_CACHE_VERSION = "v1";

interface CachedQuotes {
  version: string;
  timestamp: number;
  data: Record<string, Quote[]>;
}

export function useOfflineQuotes() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasCachedQuotes, setHasCachedQuotes] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(navigator.onLine);

    // Check if we have cached quotes
    const cached = localStorage.getItem(QUOTES_CACHE_KEY);
    setHasCachedQuotes(!!cached);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const cacheQuotes = useCallback((quotesByBook: Record<string, Quote[]>) => {
    if (typeof window === "undefined") return;

    const cacheData: CachedQuotes = {
      version: QUOTES_CACHE_VERSION,
      timestamp: Date.now(),
      data: quotesByBook
    };

    try {
      localStorage.setItem(QUOTES_CACHE_KEY, JSON.stringify(cacheData));
      setHasCachedQuotes(true);
    } catch (error) {
      console.warn("Failed to cache quotes:", error);
    }
  }, []);

  const getCachedQuotes = useCallback((): Record<string, Quote[]> | null => {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(QUOTES_CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedQuotes = JSON.parse(cached);
      
      // Check if cache is still valid (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > maxAge) {
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn("Failed to get cached quotes:", error);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(QUOTES_CACHE_KEY);
      setHasCachedQuotes(false);
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }, []);

  return {
    isOnline,
    hasCachedQuotes,
    cacheQuotes,
    getCachedQuotes,
    clearCache
  };
}
