"use client";

import { useMemo } from "react";
import { useTheme } from "@/hooks/use-scene-controls";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useI18n } from "@/hooks/use-i18n";
import { useAutoTheme } from "@/hooks/use-auto-theme";
import { ThemeType } from "@/contexts/Book3DContext";

interface ThemeColor {
  id: string;
  nameKey: string;
  primary: string;
  secondary: string;
  background: string;
  accent: string;
}

const THEME_COLORS: Record<string, ThemeColor> = {
  dark: {
    id: "dark",
    nameKey: "theme.dark",
    primary: "#d4af37",
    secondary: "#1a1a1a",
    background: "#0a0a0a",
    accent: "#f5e6c8",
  },
  light: {
    id: "light",
    nameKey: "theme.light",
    primary: "#333333",
    secondary: "#f5f5f5",
    background: "#ffffff",
    accent: "#1a1a1a",
  },
  blue: {
    id: "blue",
    nameKey: "theme.blue",
    primary: "#3b82f6",
    secondary: "#1e3a5f",
    background: "#0f172a",
    accent: "#93c5fd",
  },
  purple: {
    id: "purple",
    nameKey: "theme.purple",
    primary: "#7c3aed",
    secondary: "#2e1065",
    background: "#0f0a1f",
    accent: "#c4b5fd",
  },
  ambient: {
    id: "ambient",
    nameKey: "theme.ambient",
    primary: "#059669",
    secondary: "#064e3b",
    background: "#022c22",
    accent: "#6ee7b7",
  },
  relax: {
    id: "relax",
    nameKey: "theme.relax",
    primary: "#1a3f2f",
    secondary: "#0d1f17",
    background: "#05140f",
    accent: "#6ee7b7",
  },
  auto: {
    id: "auto",
    nameKey: "theme.auto",
    primary: "#d4af37",
    secondary: "#1a1a1a",
    background: "#0a0a0a",
    accent: "#f5e6c8",
  },
  "auto-time": {
    id: "auto-time",
    nameKey: "theme.autoTime",
    primary: "#d4af37",
    secondary: "#1a1a1a",
    background: "#0a0a0a",
    accent: "#f5e6c8",
  },
};

interface ThemeSelectorProps {
  onThemeChange?: (theme: string) => void;
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const { theme, setTheme, availableThemes } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { t } = useI18n();
  const { timeTheme, themeConfig: autoThemeConfig } = useAutoTheme();

  const handleThemeSelect = (newTheme: ThemeType) => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const handleKeyDown = (event: React.KeyboardEvent, themeId: ThemeType) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleThemeSelect(themeId);
    }
  };

  const currentThemeColor = useMemo(() => {
    if (theme === "auto-time") {
      return THEME_COLORS[timeTheme] || THEME_COLORS.dark;
    }
    return THEME_COLORS[theme];
  }, [theme, timeTheme]);

  const effectiveTheme = theme === "auto-time" ? timeTheme : theme;

  return (
    <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Цветовая схема</h3>
        <span className="text-xs text-white/60">
          {theme === "auto-time" 
            ? `${t('theme.autoTime')} (${t(autoThemeConfig.label)})`
            : t(currentThemeColor?.nameKey || '')}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Выбор цветовой схемы">
        {[...availableThemes, "auto-time"].map((themeId) => {
          const themeColor = THEME_COLORS[themeId];
          const isSelected = theme === themeId;
          const displayTheme = themeId === "auto-time" ? timeTheme : themeId;
          const displayColor = THEME_COLORS[displayTheme];

          return (
            <button
              key={themeId}
              role="radio"
              aria-checked={isSelected}
              aria-label={t(themeColor.nameKey)}
              title={themeId === "auto-time" ? t(autoThemeConfig.label) : t(themeColor.nameKey)}
              onClick={() => handleThemeSelect(themeId as ThemeType)}
              onKeyDown={(e) => handleKeyDown(e, themeId as ThemeType)}
              className={`
                relative flex flex-col items-center gap-1.5 p-2 rounded-lg
                transition-all duration-200 cursor-pointer
                ${isSelected
                  ? "bg-white/10 ring-2 ring-white/30 scale-105"
                  : "hover:bg-white/5 hover:scale-102"
                }
                ${prefersReducedMotion ? "transition-none" : ""}
              `}
              style={{
                backgroundColor: themeColor.background,
                borderColor: isSelected ? themeColor.primary : undefined,
              }}
            >
              <div
                className="w-8 h-8 rounded-full shadow-inner"
                style={{
                  background: themeId === "auto-time" 
                    ? `conic-gradient(from 0deg, ${THEME_COLORS.morning.primary}, ${THEME_COLORS.day.primary}, ${THEME_COLORS.evening.primary}, ${THEME_COLORS.night.primary})`
                    : `linear-gradient(135deg, ${themeColor.primary}, ${themeColor.secondary})`,
                }}
              />
              <span className="text-[10px] text-white/70 text-center leading-tight">
                {t(themeColor.nameKey)}
              </span>

              {isSelected && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Предпросмотр текущей темы */}
      <div 
        className="mt-2 p-3 rounded-lg border border-white/10"
        style={{ 
          backgroundColor: currentThemeColor?.background,
          borderColor: currentThemeColor?.primary,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: currentThemeColor?.primary }}
          />
          <span className="text-xs text-white/80">Основной</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: currentThemeColor?.secondary }}
          />
          <span className="text-xs text-white/80">Вторичный</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: currentThemeColor?.accent }}
          />
          <span className="text-xs text-white/80">Акцент</span>
        </div>
      </div>
    </div>
  );
}
