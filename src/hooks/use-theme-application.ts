"use client";

import { useEffect, useMemo } from "react";
import { useAnalytics, trackThemeChange } from "@/hooks/use-analytics";
import type { Theme } from "@/hooks/use-user-settings";

interface UseThemeApplicationOptions {
  theme: Theme;
  isLoaded: boolean;
  autoThemeConfig: { colorClass: string; theme: string };
  effectiveTheme: string;
  addThemeExplored: (theme: string) => void;
}

export function useThemeApplication({
  theme,
  isLoaded,
  autoThemeConfig,
  effectiveTheme,
  addThemeExplored,
}: UseThemeApplicationOptions) {
  const { trackEvent } = useAnalytics();

  const themeConfig = useMemo(() => {
    let themeClass: string;
    let shouldAddDarkClass = false;

    if (theme === "auto-time") {
      themeClass = autoThemeConfig.colorClass;
      shouldAddDarkClass = autoThemeConfig.theme === "evening" || autoThemeConfig.theme === "night";
    } else if (theme === "auto") {
      themeClass = `${effectiveTheme}-theme`;
      shouldAddDarkClass = effectiveTheme === "dark";
    } else if (theme === "dark") {
      themeClass = "dark-theme";
      shouldAddDarkClass = true;
    } else if (theme === "light") {
      themeClass = "light-theme";
      shouldAddDarkClass = false;
    } else {
      themeClass = `${theme}-theme`;
      shouldAddDarkClass = false;
    }

    return { themeClass, shouldAddDarkClass };
  }, [theme, effectiveTheme, autoThemeConfig]);

  useEffect(() => {
    if (!isLoaded) return;

    document.body.classList.add('theme-transitioning');

    const themeClasses = [
      'dark-theme', 'light-theme', 'blue-theme', 'purple-theme',
      'ambient-theme', 'relax-theme', 'morning-theme', 'day-theme',
      'evening-theme', 'night-theme',
    ];
    document.body.classList.remove(...themeClasses);
    document.body.classList.add(themeConfig.themeClass);

    if (themeConfig.shouldAddDarkClass) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    trackThemeChange(theme);
    trackEvent("settings", "theme_change", theme);
    addThemeExplored(theme);

    const timer = setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoaded, themeConfig, theme, trackEvent, addThemeExplored]);
}
