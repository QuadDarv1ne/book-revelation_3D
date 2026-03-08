"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useToast } from "./Toast";
import { useI18n } from "@/hooks/use-i18n";
import { BottomSheet } from "./BottomSheet";

interface MainMenuProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  isRotating: boolean;
  onToggleRotation: () => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  onExportFavorites: () => void;
  onImportFavorites: () => void;
}

type MenuSection = "settings" | "about" | null;

export function MainMenu({
  theme,
  onThemeChange,
  isRotating,
  onToggleRotation,
  zenMode,
  onToggleZenMode,
  onExportFavorites,
  onImportFavorites,
}: MainMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { t } = useI18n();

  const THEMES = useMemo(() => [
    { value: "dark", label: t('theme.dark'), color: "bg-[#1a1a1a]" },
    { value: "light", label: t('theme.light'), color: "bg-[#f5f5f5]" },
    { value: "blue", label: t('theme.blue'), color: "bg-[#1e3a5f]" },
    { value: "purple", label: t('theme.purple'), color: "bg-[#3f2a5f]" },
    { value: "ambient", label: t('theme.ambient'), color: "bg-[#1a3f2f]" },
    { value: "relax", label: t('theme.relax'), color: "bg-[#d4dcc4]" },
  ], [t]);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(prev => {
          if (prev) {
            setActiveSection(null);
            return false;
          }
          return prev;
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setActiveSection(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleThemeSelect = useCallback((themeValue: string) => {
    onThemeChange(themeValue);
    showToast(`Тема: ${themeValue}`, "success");
  }, [onThemeChange, showToast]);

  const handleRotationSpeedChange = useCallback((speed: number) => {
    setRotationSpeed(speed);
    localStorage.setItem('rotationSpeed', speed.toString());
    showToast(`Скорость: ${speed}`, "info");
  }, [showToast]);

  const toggleSection = (section: MenuSection) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Контент меню (переиспользуется для desktop и mobile)
  const menuContent = (
    <>
      {/* Заголовок */}
      <div className="px-5 py-4 border-b border-[rgba(212,175,55,0.15)] bg-gradient-to-r from-amber-900/20 to-transparent">
        <h2 className="text-lg font-light text-amber-100 tracking-wide">Book Revelation</h2>
        <p className="text-xs text-amber-500/60 mt-0.5 tracking-[0.12em] uppercase">{t('stoicPhilosophy')}</p>
      </div>

      {/* Разделы меню */}
      <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">

          {/* Настройки */}
          <div className="border-b border-[rgba(212,175,55,0.1)]">
            <button
              onClick={() => toggleSection("settings")}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-[rgba(212,175,55,0.08)] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400"
              aria-expanded={activeSection === "settings"}
              type="button"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-amber-100 font-medium">{t('settings.theme')}</span>
              </div>
              <svg
                className={`w-4 h-4 text-amber-400/60 transition-transform duration-200 ${activeSection === "settings" ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Панель настроек */}
            {activeSection === "settings" && (
              <div className="px-5 pb-4 space-y-4">
                {/* Тема оформления */}
                <div>
                  <h4 className="text-xs uppercase tracking-[0.12em] text-amber-500/70 mb-2">Тема оформления</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => handleThemeSelect(t.value)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                          theme === t.value
                            ? "bg-[rgba(212,175,55,0.25)] ring-1 ring-amber-500/50"
                            : "hover:bg-[rgba(212,175,55,0.1)]"
                        }`}
                        type="button"
                      >
                        <div className={`w-8 h-8 rounded-full ${t.color} border-2 ${theme === t.value ? "border-amber-400" : "border-white/20"}`} />
                        <span className={`text-[10px] ${theme === t.value ? "text-amber-100" : "text-gray-400"}`}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Вращение книги */}
                <div>
                  <h4 className="text-xs uppercase tracking-[0.12em] text-amber-500/70 mb-2">{t('menu.rotation')}</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={onToggleRotation}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        isRotating
                          ? "bg-amber-600/30 text-amber-100"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                      type="button"
                    >
                      {isRotating ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs">{t('menu.pause')}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs">{t('control.rotation')}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={onToggleZenMode}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        zenMode
                          ? "bg-amber-600/30 text-amber-100"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      <span className="text-xs">{t('menu.zenMode')}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-400/60">{t('settings.speed')}:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={rotationSpeed}
                      onChange={(e) => handleRotationSpeedChange(parseFloat(e.target.value))}
                      className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                      aria-label={t('settings.rotationSpeed')}
                    />
                    <span className="text-xs text-amber-400/60 w-8 text-right">{rotationSpeed}</span>
                  </div>
                </div>

                {/* Избранное */}
                <div>
                  <h4 className="text-xs uppercase tracking-[0.12em] text-amber-500/70 mb-2">{t('menu.favorites')}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={onExportFavorites}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>{t('quotes.export')}</span>
                    </button>
                    <button
                      onClick={onImportFavorites}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-amber-100 hover:bg-[rgba(212,175,55,0.08)] transition-all text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                      <span>Импорт</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* О проекте */}
          <div>
            <button
              onClick={() => toggleSection("about")}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-[rgba(212,175,55,0.08)] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400"
              aria-expanded={activeSection === "about"}
              type="button"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-amber-100 font-medium">{t('menu.about')}</span>
              </div>
              <svg
                className={`w-4 h-4 text-amber-400/60 transition-transform duration-200 ${activeSection === "about" ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Информация о проекте */}
            {activeSection === "about" && (
              <div className="px-5 pb-4 space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {t('menu.aboutText')}
                </p>
                <div className="pt-3 border-t border-[rgba(212,175,55,0.1)]">
                  <h4 className="text-xs uppercase tracking-[0.12em] text-amber-500/70 mb-2">{t('menu.controls')}</h4>
                  <ul className="space-y-1.5 text-xs text-gray-400">
                    <li className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-amber-400/80">Z</kbd>
                      <span>{t('menu.zenMode')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-amber-400/80">{t('control.space')}</kbd>
                      <span>{t('menu.pauseRotation')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-amber-400/80">↑↓</kbd>
                      <span>{t('menu.quoteNav')}</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-[rgba(212,175,55,0.1)]">
                  <p className="text-[10px] text-gray-500 text-center">
                    v0.2.0 • MIT License
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
    </>
  );

  return (
    <div ref={menuRef} className="relative">
      {/* Кнопка открытия меню (видима только на desktop) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-xl bg-[rgba(15,15,25,0.9)] border border-[rgba(212,175,55,0.25)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-amber-100 hover:text-amber-50 hover:bg-[rgba(15,15,25,0.95)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[rgba(15,15,25,0.9)]"
        aria-label="Открыть меню настроек"
        aria-expanded={isOpen}
        type="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm font-medium">Настройки</span>
      </button>

      {/* Мобильная кнопка (видима только на mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden flex items-center justify-center p-3 rounded-xl backdrop-blur-xl bg-[rgba(15,15,25,0.9)] border border-[rgba(212,175,55,0.25)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-amber-100 hover:text-amber-50 hover:bg-[rgba(15,15,25,0.95)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[48px] min-w-[48px]"
        aria-label="Открыть меню настроек"
        aria-expanded={isOpen}
        type="button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Desktop dropdown меню */}
      <div
        className={`hidden sm:block absolute top-full right-0 mt-2 w-80 md:w-96 rounded-2xl overflow-hidden backdrop-blur-xl bg-[rgba(15,15,25,0.98)] border border-[rgba(212,175,55,0.3)] shadow-[0_16px_48px_rgba(0,0,0,0.6)] transition-all duration-300 transform origin-top-right ${
          isOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"
        }`}
        role="menu"
        aria-label={t('menu.main')}
      >
        {menuContent}
      </div>

      {/* Mobile Bottom Sheet */}
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Настройки">
        {menuContent}
      </BottomSheet>
    </div>
  );
}
