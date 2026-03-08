"use client";

import { useEffect, useState } from "react";

type TimeBasedTheme = "morning" | "day" | "evening" | "night";

interface TimeThemeConfig {
  theme: TimeBasedTheme;
  label: string;
  colorClass: string;
}

/**
 * Автоматическое определение темы на основе времени суток
 * 5:00-11:00 — morning (светлая с тёплыми тонами)
 * 11:00-17:00 — day (светлая стандартная)
 * 17:00-22:00 — evening (тёмная с тёплыми тонами)
 * 22:00-5:00 — night (тёмная с приглушёнными цветами)
 */
export function useAutoTheme() {
  const [timeTheme, setTimeTheme] = useState<TimeBasedTheme>("night");

  useEffect(() => {
    const getTimeBasedTheme = (): TimeBasedTheme => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 11) return "morning";
      if (hour >= 11 && hour < 17) return "day";
      if (hour >= 17 && hour < 22) return "evening";
      return "night";
    };

    const updateTheme = () => {
      const theme = getTimeBasedTheme();
      setTimeTheme(theme);
      
      // Сохраняем в localStorage для persistence
      localStorage.setItem("autoTheme", theme);
      localStorage.setItem("autoThemeTime", new Date().toISOString());
    };

    // Обновляем при монтировании
    updateTheme();

    // Проверяем каждый час
    const interval = setInterval(updateTheme, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getThemeConfig = (): TimeThemeConfig => {
    switch (timeTheme) {
      case "morning":
        return {
          theme: "morning",
          label: "Утро (5:00-11:00)",
          colorClass: "morning-theme"
        };
      case "day":
        return {
          theme: "day",
          label: "День (11:00-17:00)",
          colorClass: "day-theme"
        };
      case "evening":
        return {
          theme: "evening",
          label: "Вечер (17:00-22:00)",
          colorClass: "evening-theme"
        };
      case "night":
      default:
        return {
          theme: "night",
          label: "Ночь (22:00-5:00)",
          colorClass: "night-theme"
        };
    }
  };

  return {
    timeTheme,
    themeConfig: getThemeConfig(),
    isAutoTime: true
  };
}
