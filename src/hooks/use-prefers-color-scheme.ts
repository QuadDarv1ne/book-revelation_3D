"use client";

import { useState, useEffect } from "react";

/**
 * Хук для отслеживания системной цветовой схемы (prefers-color-scheme)
 * Возвращает "dark" или "light" в зависимости от настроек системы
 */
export function usePrefersColorScheme(): "dark" | "light" {
  const [colorScheme, setColorScheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Проверяем prefers-color-scheme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? "dark" : "light");
    };

    // Устанавливаем начальное значение через setTimeout для избежания каскадных рендеров
    setTimeout(() => {
      setColorScheme(mediaQuery.matches ? "dark" : "light");
    }, 0);

    // Подписываемся на изменения
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return colorScheme;
}

/**
 * Хук для получения эффективной темы с учётом режима "auto"
 * @param theme Текущая выбранная тема (может быть "auto")
 * @returns Эффективная тема (всегда конкретное значение)
 */
export function useEffectiveTheme(theme: string): string {
  const systemColorScheme = usePrefersColorScheme();
  
  if (theme === "auto") {
    return systemColorScheme;
  }
  
  return theme;
}
