"use client";

import { useState } from "react";

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

interface ThemeOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  preview: string;
}

const THEMES: ThemeOption[] = [
  { value: "dark" as const, label: "Тёмная", icon: Moon, preview: "bg-[#1a1a1a]" },
  { value: "light" as const, label: "Светлая", icon: Sun, preview: "bg-[#f5f5f5]" },
  { value: "blue" as const, label: "Синяя", icon: Palette, preview: "bg-[#1e3a5f]" },
  { value: "purple" as const, label: "Фиолетовая", icon: Palette, preview: "bg-[#3f2a5f]" },
  { value: "ambient" as const, label: "Атмосферная", icon: Palette, preview: "bg-[#1a3f2f]" },
  { value: "relax" as const, label: "Расслабляющая", icon: Palette, preview: "bg-[#d4dcc4]" },
];

interface SettingsBarProps {
  theme: string;
  onThemeChange: (theme: "dark" | "light" | "blue" | "purple" | "ambient" | "relax") => void;
}

export function SettingsBar({ theme, onThemeChange }: SettingsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.value === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    onThemeChange(THEMES[nextIndex].value as "dark" | "light" | "blue" | "purple" | "ambient" | "relax");
  };

  const currentTheme = THEMES.find(t => t.value === theme) || THEMES[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div
          className={`mx-auto mb-3 w-fit rounded-2xl backdrop-blur-xl border border-[rgba(212,175,55,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(212,175,55,0.1)] transition-all duration-300 ${
            isExpanded ? "bg-[rgba(15,15,25,0.95)]" : "bg-[rgba(15,15,25,0.75)]"
          }`}
        >
          <div className="flex items-center gap-1 p-2">
            <button
              onClick={cycleTheme}
              className="group relative flex items-center justify-center w-11 h-11 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200"
              title={`Сменить тему (${currentTheme.label})`}
            >
              <CurrentIcon className="w-5 h-5" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] text-amber-100 bg-[rgba(15,15,25,0.9)] border border-[rgba(212,175,55,0.2)] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {currentTheme.label}
              </span>
            </button>

            <div className="flex gap-1 ml-1" role="group" aria-label="Выбор темы оформления">
              {THEMES.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => onThemeChange(t.value as "dark" | "light" | "blue" | "purple" | "ambient" | "relax")}
                    className={`group relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[rgba(212,175,55,0.25)] text-amber-300 ring-1 ring-amber-500/50"
                        : "text-amber-400/60 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)]"
                    }`}
                    title={t.label}
                    aria-label={`Тема: ${t.label}${isActive ? ' (активна)' : ''}`}
                    aria-pressed={isActive}
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
              className="group flex items-center justify-center w-11 h-11 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200"
              title="Настройки"
              aria-label="Открыть настройки"
              aria-expanded={isExpanded}
              aria-controls="settings-panel"
            >
              <Settings className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} aria-hidden="true" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-8 h-11 text-amber-500/50 hover:text-amber-400 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          {isExpanded && (
            <div id="settings-panel" className="px-3 pb-3 pt-1 border-t border-[rgba(212,175,55,0.1)]" role="region" aria-label="Настройки приложения">
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm">
                  <Settings className="w-4 h-4" />
                  <span>Общие</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm">
                  <User className="w-4 h-4" />
                  <span>Аккаунт</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm">
                  <Moon className="w-4 h-4" />
                  <span>Внешний вид</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-sm">
                  <span className="w-4 h-4 flex items-center justify-center text-[10px]">🔔</span>
                  <span>Уведомления</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
