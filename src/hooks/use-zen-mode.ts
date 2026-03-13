'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'stoic-book-zen-mode';

export interface UseZenModeOptions {
  autoSave?: boolean;
}

export function useZenMode(options: UseZenModeOptions = {}) {
  const { autoSave = true } = options;
  const [isZenMode, setIsZenMode] = useState(false);

  useEffect(() => {
    if (!autoSave) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setIsZenMode(!!parsed.isZenMode);
      }
    } catch {
      // Ignore parse errors
    }
  }, [autoSave]);

  useEffect(() => {
    if (!autoSave) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isZenMode }));
    } catch {
      // Ignore storage errors
    }
  }, [isZenMode, autoSave]);

  const toggleZenMode = useCallback(() => {
    setIsZenMode(prev => !prev);
  }, []);

  const enableZenMode = useCallback(() => setIsZenMode(true), []);
  const disableZenMode = useCallback(() => setIsZenMode(false), []);

  return { isZenMode, toggleZenMode, enableZenMode, disableZenMode };
}
