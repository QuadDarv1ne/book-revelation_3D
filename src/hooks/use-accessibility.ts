"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

interface UseAccessibility {
  prefersReducedMotion: boolean;
  motionPreference: "reduced" | "normal";
  keyboardNavEnabled: boolean;
  screenReaderAnnouncement: string;
  focusTrapActive: boolean;
}

/**
 * Хук для управления настройками доступности
 */
export function useAccessibility(): UseAccessibility {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [keyboardNavEnabled, setKeyboardNavEnabled] = useState(true);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState("");
  const [focusTrapActive, setFocusTrapActive] = useState(false);

  const motionPreference: "reduced" | "normal" = prefersReducedMotion ? "reduced" : "normal";

  // Обработка клавиатурных событий для доступности
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + K - переключение клавиатурной навигации
      if (e.altKey && e.key === "k") {
        e.preventDefault();
        setKeyboardNavEnabled(prev => !prev);
        setScreenReaderAnnouncement(
          keyboardNavEnabled 
            ? "Клавиатурная навигация отключена" 
            : "Клавиатурная навигация включена"
        );
      }

      // Escape - сброс фокуса
      if (e.key === "Escape") {
        setFocusTrapActive(false);
        setScreenReaderAnnouncement("Ловушка фокуса отключена");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyboardNavEnabled]);

  // Очистка объявления для screen reader через 3 секунды
  useEffect(() => {
    if (screenReaderAnnouncement) {
      const timer = setTimeout(() => {
        setScreenReaderAnnouncement("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [screenReaderAnnouncement]);

  return {
    prefersReducedMotion,
    motionPreference,
    keyboardNavEnabled,
    screenReaderAnnouncement,
    focusTrapActive,
  };
}

/**
 * Хук для управления фокусом в модальных окнах
 */
export function useFocusTrap(isActive: boolean) {
  const [firstFocusable, setFirstFocusable] = useState<HTMLElement | null>(null);
  const [lastFocusable, setLastFocusable] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const focusableElements = document.querySelectorAll<HTMLElement>(focusableSelectors);

    if (focusableElements.length > 0) {
      // Используем setTimeout для избежания каскадных рендеров
      setTimeout(() => {
        setFirstFocusable(focusableElements[0]);
        setLastFocusable(focusableElements[focusableElements.length - 1]);
      }, 0);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const currentFocus = document.activeElement as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (currentFocus === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (currentFocus === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, firstFocusable, lastFocusable]);

  const focusFirst = useCallback(() => {
    firstFocusable?.focus();
  }, [firstFocusable]);

  return { firstFocusable, lastFocusable, focusFirst };
}

/**
 * Хук для объявления изменений screen reader
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState("");
  const [priority, setPriority] = useState<"polite" | "assertive">("polite");

  const announce = useCallback((message: string, type: "polite" | "assertive" = "polite") => {
    setPriority(type);
    setAnnouncement(message);
  }, []);

  const clear = useCallback(() => {
    setAnnouncement("");
  }, []);

  return { announcement, priority, announce, clear };
}
