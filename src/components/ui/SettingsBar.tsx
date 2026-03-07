"use client";

import { useState, useCallback, useMemo } from "react";
import { useToast } from "./Toast";
import { useFavorites } from "@/hooks/use-favorites";
import { useI18n } from "@/hooks/use-i18n";

interface IconProps {
  className?: string;
}

function Settings({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function User({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
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

function ChevronUp({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6"/>
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

function Palette({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  );
}

interface SettingsBarProps {
  theme: string;
  onThemeChange: (theme: "dark" | "light" | "blue" | "purple" | "ambient" | "relax") => void;
}

export function SettingsBar({ theme, onThemeChange }: SettingsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();
  const { exportFavorites, importFavorites } = useFavorites();
  const { t } = useI18n();
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  const THEMES = useMemo(() => [
    { value: "dark" as const, label: t('theme.dark'), icon: Moon, preview: "bg-[#1a1a1a]" },
    { value: "light" as const, label: t('theme.light'), icon: Sun, preview: "bg-[#f5f5f5]" },
    { value: "blue" as const, label: t('theme.blue'), icon: Palette, preview: "bg-[#1e3a5f]" },
    { value: "purple" as const, label: t('theme.purple'), icon: Palette, preview: "bg-[#3f2a5f]" },
    { value: "ambient" as const, label: t('theme.ambient'), icon: Palette, preview: "bg-[#1a3f2f]" },
    { value: "relax" as const, label: t('theme.relax'), icon: Palette, preview: "bg-[#d4dcc4]" },
  ], [t]);

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.value === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    onThemeChange(THEMES[nextIndex].value as "dark" | "light" | "blue" | "purple" | "ambient" | "relax");
  };

  const currentTheme = THEMES.find(t => t.value === theme) || THEMES[0];
  const CurrentIcon = currentTheme.icon;

  // Обработчик экспорта избранных цитат
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
    } catch (error) {
      showToast(t('toast.exportError'), "error");
      console.error("Export error:", error);
    }
  }, [exportFavorites, showToast, t]);

  // Обработчик импорта избранных цитат
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

      reader.onerror = () => {
        showToast(t('toast.readFileError'), "error");
      };

      reader.readAsText(file);
    };
    
    input.click();
  }, [importFavorites, showToast, t]);

  // Обработчик изменения скорости вращения
  const handleRotationSpeedChange = useCallback((speed: number) => {
    setRotationSpeed(speed);
    // Здесь можно отправить событие в родительский компонент
    // или сохранить в localStorage
    localStorage.setItem('rotationSpeed', speed.toString());
    showToast(`Скорость вращения: ${speed}`, "success");
  }, [showToast]);

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div
          className={`mx-auto mb-3 w-fit rounded-2xl backdrop-blur-xl border border-[rgba(212,175,55,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(212,175,55,0.1)] transition-all duration-300 ${
            isExpanded ? "bg-[rgba(15,15,25,0.95)]" : "bg-[rgba(15,15,25,0.75)]"
          }`}
        >
          <div className="flex items-center gap-1 p-2" role="toolbar" aria-label="Панель настроек">
            <button
              onClick={cycleTheme}
              className="group relative flex items-center justify-center w-12 h-12 sm:w-11 sm:h-11 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[rgba(15,15,25,0.85)] min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px]"
              title={`Сменить тему (${currentTheme.label})`}
              aria-label={`Сменить тему (текущая: ${currentTheme.label})`}
              type="button"
            >
              <CurrentIcon className="w-5 h-5 sm:w-5 sm:h-5" aria-hidden="true" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] text-amber-100 bg-[rgba(15,15,25,0.9)] border border-[rgba(212,175,55,0.2)] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {currentTheme.label}
              </span>
            </button>

            <div className="flex gap-0.5 sm:gap-1 ml-0.5 sm:ml-1" role="group" aria-label="Выбор темы оформления">
              {THEMES.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => onThemeChange(t.value as "dark" | "light" | "blue" | "purple" | "ambient" | "relax")}
                    className={`group relative flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[rgba(15,15,25,0.85)] min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] ${
                      isActive
                        ? "bg-[rgba(212,175,55,0.25)] text-amber-300 ring-1 ring-amber-500/50"
                        : "text-amber-400/60 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)]"
                    }`}
                    title={t.label}
                    aria-label={`Тема: ${t.label}${isActive ? ' (активна)' : ''}`}
                    aria-pressed={isActive}
                    type="button"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] text-amber-100 bg-[rgba(15,15,25,0.9)] border border-[rgba(212,175,55,0.2)] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="w-px h-6 bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.2)] to-transparent mx-1" />

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex items-center justify-center w-12 h-12 sm:w-11 sm:h-11 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[rgba(15,15,25,0.85)] min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px]"
              title="Настройки"
              aria-label="Открыть настройки"
              aria-expanded={isExpanded}
              aria-controls="settings-panel"
              type="button"
            >
              <Settings className={`w-5 h-5 sm:w-5 sm:h-5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} aria-hidden="true" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-9 h-11 sm:w-8 sm:h-11 text-amber-500/50 hover:text-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded min-w-[44px] min-h-[44px]"
              aria-label={isExpanded ? "Свернуть настройки" : "Развернуть настройки"}
              type="button"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {isExpanded && (
            <div id="settings-panel" className="px-3 pb-3 pt-1 border-t border-[rgba(212,175,55,0.1)]" role="region" aria-label="Настройки приложения">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label="Общие настройки"
                  type="button"
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  <span>Общие</span>
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label="Настройки аккаунта"
                  type="button"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span>Аккаунт</span>
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label="Настройки внешнего вида"
                  type="button"
                >
                  <Moon className="w-4 h-4" aria-hidden="true" />
                  <span>Внешний вид</span>
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label="Настройки уведомлений"
                  type="button"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-[10px]" aria-hidden="true">🔔</span>
                  <span>Уведомления</span>
                </button>
              </div>

              {/* Секция для управления избранным */}
              <div className="mt-3 pt-3 border-t border-[rgba(212,175,55,0.1)]">
                <h3 className="text-xs uppercase tracking-[0.15em] text-amber-500/70 mb-2">{t('menu.favorites')}</h3>
                <div className="flex flex-col gap-2">
                  <button
                    id="export-favorites"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    aria-label={t('quotes.export')}
                    onClick={handleExportFavorites}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{t('quotes.export')}</span>
                  </button>
                  <button
                    id="import-favorites"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    aria-label={t('quotes.import')}
                    onClick={handleImportFavorites}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                    <span>{t('quotes.import')}</span>
                  </button>
                </div>
              </div>

              {/* Секция для настройки вращения книги */}
              <div className="mt-3 pt-3 border-t border-[rgba(212,175,55,0.1)]">
                <h3 className="text-xs uppercase tracking-[0.15em] text-amber-500/70 mb-2">{t('settings.rotation')}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400/60 text-sm" id="rotation-speed-label">{t('settings.speed')}:</span>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={rotationSpeed}
                      onChange={(e) => handleRotationSpeedChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-amber-400"
                      aria-label={t('settings.rotationSpeed')}
                      aria-labelledby="rotation-speed-label"
                    />
                  </div>
                  <span className="text-amber-400/60 text-sm w-8 text-right" aria-live="polite">{rotationSpeed}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
