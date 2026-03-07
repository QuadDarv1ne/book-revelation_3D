"use client";

import { useEffect, useState } from "react";

/**
 * Хук для отслеживания системной настройки prefers-reduced-motion
 * Возвращает true, если пользователь предпочитает уменьшенное движение
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Хук для получения текущей настройки движения
 * Возвращает 'reduced' если включено prefers-reduced-motion, иначе 'normal'
 */
export function useMotionPreference(): "reduced" | "normal" {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? "reduced" : "normal";
}
