"use client";

import { useState, useCallback, useMemo, useRef, useEffect, type ComponentType } from "react";
import { useToast } from "./Toast";
import { useFavorites } from "@/hooks/use-favorites";
import { useI18n } from "@/hooks/use-i18n";
import { useUserSettings } from "@/hooks/use-user-settings";

interface IconProps {
  className?: string;
}

function Moon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}

function Sun({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  );
}

function Palette({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  );
}

function Clock({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function Monitor({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
    </svg>
  );
}

function ChevronDown({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

function Speed({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function Check({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

interface ThemeOption {
  value: "dark" | "light" | "blue" | "purple" | "ambient" | "relax" | "auto" | "auto-time";
  label: string;
  icon: ComponentType<IconProps>;
  preview: string;
}

const THEMES_DATA: readonly { value: ThemeOption["value"]; labelKey: string; preview: string }[] = [
  { value: "dark", labelKey: "theme.dark", preview: "bg-[#1a1a1a]" },
  { value: "light", labelKey: "theme.light", preview: "bg-[#f5f5f5]" },
  { value: "blue", labelKey: "theme.blue", preview: "bg-[#1e3a5f]" },
  { value: "purple", labelKey: "theme.purple", preview: "bg-[#3f2a5f]" },
  { value: "ambient", labelKey: "theme.ambient", preview: "bg-[#1a3f2f]" },
  { value: "relax", labelKey: "theme.relax", preview: "bg-[#d4dcc4]" },
  { value: "auto", labelKey: "theme.auto", preview: "bg-gradient-to-br from-[#1a1a1a] to-[#f5f5f5]" },
  { value: "auto-time", labelKey: "theme.autoTime", preview: "bg-gradient-to-br from-[#1a1a2e] to-[#f5f5dc]" },
];

const THEME_ICONS: Record<ThemeOption["value"], ComponentType<IconProps>> = {
  dark: Moon,
  light: Sun,
  blue: Palette,
  purple: Palette,
  ambient: Palette,
  relax: Palette,
  auto: Monitor,
  "auto-time": Clock,
};

interface SettingsBarProps {
  theme: string;
  onThemeChange: (theme: ThemeOption["value"]) => void;
}

export function SettingsBar({ theme, onThemeChange }: SettingsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [showSpeedPresets, setShowSpeedPresets] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { exportFavorites, importFavorites } = useFavorites();
  const { t } = useI18n();
  const { settings, updateSettings } = useUserSettings();

  const THEMES: ThemeOption[] = useMemo(() => THEMES_DATA.map(themeData => ({
    value: themeData.value,
    label: t(themeData.labelKey),
    icon: THEME_ICONS[themeData.value],
    preview: themeData.preview
  })), [t]);

  const currentTheme = useMemo(() => THEMES.find(t => t.value === theme) || THEMES[0], [theme, THEMES]);
  const CurrentIcon = currentTheme.icon;

  const SPEED_PRESETS = useMemo(() => [
    { value: 0, label: '⏸️' },
    { value: 0.25, label: '🐢' },
    { value: 0.5, label: '🚶' },
    { value: 1, label: '🏃' },
    { value: 1.5, label: '🚀' },
    { value: 2, label: '⚡' },
  ], []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false);
      }
      if (speedRef.current && !speedRef.current.contains(event.target as Node)) {
        setShowSpeedPresets(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setRotationSpeed(settings.rotationSpeed);
  }, [settings.rotationSpeed]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setRotationSpeed(newSpeed);
    updateSettings('rotationSpeed', newSpeed);
    showToast(`Скорость: ${newSpeed.toFixed(2)}x`, "info");
  }, [updateSettings, showToast]);

  const handleResetSettings = useCallback(() => {
    updateSettings('rotationSpeed', 0.5);
    updateSettings('theme', 'relax');
    setRotationSpeed(0.5);
    onThemeChange('relax');
    showToast("Настройки сброшены", "success");
  }, [updateSettings, onThemeChange, showToast]);

  const handleExportFavorites = useCallback(() => {
    const exportData = exportFavorites();
    if (!exportData) {
      showToast(t('toast.noFavoritesToExport'), "info");
      return;
    }
    try {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stoic-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(t('toast.favoritesExported'), "success");
    } catch {
      showToast(t('toast.exportError'), "error");
    }
  }, [exportFavorites, showToast, t]);

  const handleImportFavorites = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = importFavorites(content);
        if (result.success) {
          showToast(t('toast.favoritesImported').replace('{count}', String(result.count)), "success");
        } else {
          showToast(`${t('toast.importError')}: ${result.error}`, "error");
        }
      };
      reader.onerror = () => showToast(t('toast.readFileError'), "error");
      reader.readAsText(file);
    };
    input.click();
  }, [importFavorites, showToast, t]);

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div
          className={`mx-auto mb-3 w-fit rounded-2xl backdrop-blur-xl border border-[rgba(212,175,55,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(212,175,55,0.1)] transition-all duration-300 ${
            isExpanded ? "bg-[rgba(15,15,25,0.95)]" : "bg-[rgba(15,15,25,0.75)]"
          }`}
        >
          <div className="flex items-center gap-1 p-2" role="toolbar" aria-label="Панель настроек">
            {/* Компактный селектор тем */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="group flex items-center gap-2 px-3 py-2 rounded-xl text-amber-100 hover:bg-[rgba(212,175,55,0.1)] transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px]"
                aria-label={t('settings.theme')}
                aria-expanded={showThemeDropdown}
                type="button"
              >
                <CurrentIcon className="w-5 h-5 text-amber-400" aria-hidden="true" />
                <span className="text-sm text-amber-100 hidden sm:block">{currentTheme.label}</span>
                <ChevronDown className={`w-4 h-4 text-amber-400/60 transition-transform ${showThemeDropdown ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              {showThemeDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl overflow-hidden backdrop-blur-xl bg-[rgba(15,15,25,0.98)] border border-[rgba(212,175,55,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-2 space-y-1">
                    {THEMES.map((t) => {
                      const Icon = t.icon;
                      const isActive = theme === t.value;
                      return (
                        <button
                          key={t.value}
                          onClick={() => {
                            onThemeChange(t.value);
                            setShowThemeDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? "bg-[rgba(212,175,55,0.2)] text-amber-100"
                              : "text-amber-100/70 hover:bg-[rgba(212,175,55,0.1)] hover:text-amber-100"
                          }`}
                          type="button"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? "bg-[rgba(212,175,55,0.3)]" : "bg-[rgba(255,255,255,0.05)]"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-left text-sm">{t.label}</span>
                          {isActive && <Check className="w-4 h-4 text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.2)] to-transparent mx-1" />

            {/* Скорость вращения с пресетами */}
            <div className="relative flex items-center gap-2 px-2" ref={speedRef}>
              <button
                onClick={() => setShowSpeedPresets(!showSpeedPresets)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(212,175,55,0.1)] hover:bg-[rgba(212,175,55,0.15)] transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px]"
                aria-label={t('settings.rotationSpeed')}
                aria-expanded={showSpeedPresets}
                type="button"
              >
                <Speed className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="text-sm text-amber-100">{SPEED_PRESETS.find(p => Math.abs(p.value - rotationSpeed) < 0.01)?.label || `${rotationSpeed.toFixed(1)}x`}</span>
                <ChevronDown className={`w-3 h-3 text-amber-400/60 transition-transform ${showSpeedPresets ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              {showSpeedPresets && (
                <div className="absolute bottom-full left-0 mb-2 w-40 rounded-xl overflow-hidden backdrop-blur-xl bg-[rgba(15,15,25,0.98)] border border-[rgba(212,175,55,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-2 space-y-1">
                    {SPEED_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => {
                          handleSpeedChange(preset.value);
                          setShowSpeedPresets(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                          Math.abs(preset.value - rotationSpeed) < 0.01
                            ? "bg-[rgba(212,175,55,0.2)] text-amber-100"
                            : "text-amber-100/70 hover:bg-[rgba(212,175,55,0.1)] hover:text-amber-100"
                        }`}
                        type="button"
                      >
                        <span className="text-lg">{preset.label}</span>
                        <span className="text-xs text-amber-400/60">{preset.value === 0 ? 'Пауза' : `${preset.value.toFixed(2)}x`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.2)] to-transparent mx-1" />

            {/* Кнопка расширения */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex items-center justify-center w-11 h-11 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)] transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-[44px] min-h-[44px]"
              aria-label={isExpanded ? t('settings.collapse') : t('settings.expand')}
              aria-expanded={isExpanded}
              type="button"
            >
              <svg className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {isExpanded && (
            <div className="px-3 pb-3 pt-1 border-t border-[rgba(212,175,55,0.1)]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportFavorites}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>{t('quotes.export')}</span>
                </button>
                <button
                  onClick={handleImportFavorites}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                  <span>{t('quotes.import')}</span>
                </button>
              </div>
              
              <div className="mt-3 pt-3 border-t border-[rgba(212,175,55,0.1)]">
                <button
                  onClick={handleResetSettings}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-red-400/70 hover:text-red-300 hover:bg-[rgba(239,68,68,0.08)] transition-all text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Сброс настроек</span>
                </button>
              </div>
              
              <div className="mt-3 pt-3 border-t border-[rgba(212,175,55,0.1)]">
                <p className="text-[10px] text-amber-500/40 text-center">
                  Book Revelation 3D v0.2.1
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
