"use client";

import { useState } from "react";
import { Settings, User, Moon, Sun, ChevronUp, ChevronDown } from "lucide-react";

interface SettingsBarProps {
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
}

export function SettingsBar({ theme, onThemeChange }: SettingsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTheme = () => {
    onThemeChange(theme === "dark" ? "light" : "dark");
  };

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
              onClick={toggleTheme}
              className="group relative flex items-center justify-center w-11 h-11 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200"
              title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] text-amber-100 bg-[rgba(15,15,25,0.9)] border border-[rgba(212,175,55,0.2)] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {theme === "dark" ? "Светлая" : "Тёмная"}
              </span>
            </button>

            <button
              className="group relative flex items-center justify-center w-11 h-11 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200"
              title="Профиль"
            >
              <User className="w-5 h-5" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] text-amber-100 bg-[rgba(15,15,25,0.9)] border border-[rgba(212,175,55,0.2)] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Профиль
              </span>
            </button>

            <div className="w-px h-6 bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.2)] to-transparent mx-1" />

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex items-center justify-center w-11 h-11 rounded-xl text-amber-400/80 hover:text-amber-300 hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200"
              title="Настройки"
            >
              <Settings className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
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
            <div className="px-3 pb-3 pt-1 border-t border-[rgba(212,175,55,0.1)]">
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
