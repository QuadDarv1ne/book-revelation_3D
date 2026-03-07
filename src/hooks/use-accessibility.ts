"use client";

import { useEffect, useCallback, useRef, useState } from "react";
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
  const announcementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const motionPreference: "reduced" | "normal" = prefersReducedMotion ? "reduced" : "normal";

  // Обработка клавиатурных событий для доступности
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + K - переключение клавиатурной навигации
      if (e.altKey && e.key === "k") {
        e.preventDefault();
        setKeyboardNavEnabled(prev => {
          const newValue = !prev;
          setScreenReaderAnnouncement(
            newValue
              ? "Клавиатурная навигация включена"
              : "Клавиатурная навигация отключена"
          );
          return newValue;
        });
      }

      // Escape - сброс фокуса
      if (e.key === "Escape") {
        setFocusTrapActive(false);
        setScreenReaderAnnouncement("Ловушка фокуса отключена");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Очистка объявления для screen reader через 3 секунды
  useEffect(() => {
    if (!screenReaderAnnouncement) return;

    announcementTimerRef.current = setTimeout(() => {
      setScreenReaderAnnouncement("");
    }, 3000);

    return () => {
      if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
    };
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
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

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
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstFocusableRef.current = firstElement || null;
    lastFocusableRef.current = lastElement || null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const currentFocus = document.activeElement as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (currentFocus === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (currentFocus === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  const focusFirst = useCallback(() => {
    firstFocusableRef.current?.focus();
  }, []);

  return { firstFocusable: firstFocusableRef.current, lastFocusable: lastFocusableRef.current, focusFirst };
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
