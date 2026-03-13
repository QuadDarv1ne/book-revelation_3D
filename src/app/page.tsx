"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { QuotesPanel } from "@/components/quotes";
import { ControlButton, WebGLError, useWebGLSupport, SettingsBar, PWAInstall, ToastProvider, BookSelector, MainMenu } from "@/components/ui";
import { useBookRotation } from "@/hooks/use-scene-controls";
import { useMounted } from "@/hooks/use-mounted";
import { LoadingFallback } from "@/components/ui/LoadingFallback";
import { getBookById, getDefaultBook, books } from "@/data/books";
import { textureManager } from "@/lib/textures/texture-manager";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/components/ui/Toast";
import { usePrefersColorScheme } from "@/hooks/use-prefers-color-scheme";
import { useOfflineQuotes } from "@/hooks/use-offline-quotes";
import { useAnalytics, trackBookChange, trackThemeChange } from "@/hooks/use-analytics";
import { useAutoTheme } from "@/hooks/use-auto-theme";
import { useGamification } from "@/hooks/use-gamification";
import { useZenMode } from "@/hooks/use-zen-mode";
import { KeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcutsHelp";
import type { Quote } from "@/types/quote";

const Scene = dynamic(() => import("@/components/book").then(mod => ({ default: mod.Scene })), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

const BACKGROUND_GRADIENT = 'radial-gradient(ellipse_75%_45%_at_28%_38%,rgba(212,175,55,0.08)_0%,transparent_50%),radial-gradient(ellipse_55%_35%_at_72%_68%,rgba(212,175,55,0.06)_0%,transparent_45%),radial-gradient(ellipse_100%_75%_at_50%_100%,rgba(30,30,50,0.7)_0%,transparent_50%)';
const GRID_PATTERN = 'linear-gradient(rgba(212,175,55,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.5)_1px,transparent_1px)';
const QUOTE_ROTATION_INTERVAL = 5000;
const DEFAULT_BOOK_ID = "marcus-aurelius-meditations"; // Книга по умолчанию

function getInitialBook(): string {
  if (typeof window === "undefined") return DEFAULT_BOOK_ID;
  const saved = localStorage.getItem("activeBook");
  if (saved && getBookById(saved)) return saved;
  return DEFAULT_BOOK_ID;
}

function getInitialRotationSpeed(): number {
  if (typeof window === "undefined") return 0.5;
  const saved = localStorage.getItem("rotationSpeed");
  if (saved) {
    const speed = parseFloat(saved);
    if (!isNaN(speed) && speed >= 0.1 && speed <= 2) return speed;
  }
  return 0.5;
}

const THEMES = ["dark", "light", "blue", "purple", "ambient", "relax", "auto", "auto-time"] as const;
type Theme = (typeof THEMES)[number];

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("theme");
  if (saved && THEMES.includes(saved as Theme)) return saved as Theme;
  return "dark";
}

export default function Home() {
  const mounted = useMounted();
  const hasWebGL = useWebGLSupport();
  const { isRotating, toggleRotation } = useBookRotation();
  const { trackEvent } = useAnalytics();
  const { themeConfig: autoThemeConfig } = useAutoTheme();
  const { addThemeExplored, addBookViewed, trackTime } = useGamification();
  const { isZenMode, toggleZenMode } = useZenMode({ autoSave: true });
  const [activeQuote, setActiveQuote] = useState(0);
  const [webGLError, setWebGLError] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [activeBookId, setActiveBookId] = useState<string>(getInitialBook);
  const [sceneError, setSceneError] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const rotationSpeed = getInitialRotationSpeed();
  
  // Получаем системную цветовую схему для режима "auto"
  const systemColorScheme = usePrefersColorScheme();
  
  // Определяем эффективную тему (с учётом "auto")
  const effectiveTheme = useMemo(() => {
    if (theme === "auto") {
      return systemColorScheme;
    }
    return theme;
  }, [theme, systemColorScheme]);

  // Получаем активную книгу - оптимизировано с useMemo
  const activeBook = useMemo(() => getBookById(activeBookId) || getDefaultBook(), [activeBookId]);

  // Сохраняем выбор книги в localStorage
  useEffect(() => {
    localStorage.setItem("activeBook", activeBookId);
  }, [activeBookId]);

  // Предзагрузка текстур активной книги при монтировании
  useEffect(() => {
    textureManager.preloadBookTextures(
      activeBook.coverImage,
      activeBook.spineImage,
      activeBook.backCoverImage
    ).catch(() => {
      // Игнорируем ошибки предзагрузки
    });
  }, [activeBook.coverImage, activeBook.spineImage, activeBook.backCoverImage]);

  // Обработчик ошибок сцены
  const handleSceneError = useCallback(() => {
    setSceneError(true);
    setWebGLError(true);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TOGGLE_ROTATION') {
        toggleRotation();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toggleRotation]);

  // Zen-режим и горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          toggleZenMode();
        }
      }
      if (e.key === 'Escape' && isZenMode) {
        toggleZenMode();
      }
      if (e.key === 'h' || e.key === 'H') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          setShowShortcutsHelp(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, toggleZenMode]);

  // Смена темы оформления - оптимизировано
  useEffect(() => {
    // Анимация при смене теме
    document.body.classList.add('theme-transitioning');

    // Применяем тему с учётом auto-time
    const bodyTheme = theme === "auto-time" ? autoThemeConfig.colorClass : `${effectiveTheme}-theme`;
    document.body.className = bodyTheme;
    localStorage.setItem("theme", theme);

    // Track theme change
    trackThemeChange(theme);
    trackEvent("settings", "theme_change", theme);
    addThemeExplored(theme);

    const timer = setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);

    return () => clearTimeout(timer);
  }, [effectiveTheme, theme, trackEvent, autoThemeConfig, addThemeExplored]);

  // Отслеживание времени в приложении
  useEffect(() => {
    const interval = setInterval(() => {
      trackTime(10); // Каждые 10 секунд добавляем время
    }, 10000);
    return () => clearInterval(interval);
  }, [trackTime]);

  // Автоматическое переключение цитат
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % activeBook.quotes.length);
    }, QUOTE_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [activeBook.quotes.length]);

  const handleBookChange = useCallback((bookId: string) => {
    trackBookChange(activeBookId, bookId);
    trackEvent("navigation", "book_change", bookId);
    addBookViewed(bookId);
    
    // Предзагрузка текстур новой книги
    const newBook = getBookById(bookId);
    if (newBook) {
      textureManager.preloadBookTextures(
        newBook.coverImage,
        newBook.spineImage,
        newBook.backCoverImage
      ).catch(() => {
        // Игнорируем ошибки предзагрузки
      });
    }
    
    setActiveBookId(bookId);
    setActiveQuote(0); // Сбрасываем на первую цитату новой книги
  }, [activeBookId, trackEvent, addBookViewed]);

  const handleRetry = useCallback(() => {
    setWebGLError(false);
    window.location.reload();
  }, []);

  // Экспорт/импорт избранных цитат
  const { exportFavorites, importFavorites } = useFavorites();
  const { showToast } = useToast();
  const { cacheQuotes } = useOfflineQuotes();

  // Кэширование цитат для offline режима
  useEffect(() => {
    const quotesByBook: Record<string, Quote[]> = {};
    books.forEach(book => {
      quotesByBook[book.id] = book.quotes;
    });
    cacheQuotes(quotesByBook);
  }, [cacheQuotes]);

  const handleExportFavorites = useCallback(() => {
    const exportData = exportFavorites();

    if (!exportData) {
      showToast("Нет избранных цитат для экспорта", "info");
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

      showToast("Избранные цитаты экспортированы", "success");
    } catch {
      showToast("Ошибка при экспорте", "error");
    }
  }, [exportFavorites, showToast]);

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
          showToast(`Успешно импортировано ${result.count} цитат`, "success");
        } else {
          showToast(`Ошибка импорта: ${result.error}`, "error");
        }
      };

      reader.onerror = () => {
        showToast("Ошибка чтения файла", "error");
      };

      reader.readAsText(file);
    };

    input.click();
  }, [importFavorites, showToast]);

  if (hasWebGL === false || webGLError) {
    return <WebGLError onRetry={handleRetry} />;
  }

  const backgroundGradient = BACKGROUND_GRADIENT;
  const gridPattern = GRID_PATTERN;

  return (
    <ToastProvider>
      <main
        className="relative w-full h-screen overflow-hidden select-none bg-[#07070d]"
        role="main"
        style={{
          paddingTop: 'var(--safe-area-inset-top)',
          paddingBottom: 'var(--safe-area-inset-bottom)',
          paddingLeft: 'var(--safe-area-inset-left)',
          paddingRight: 'var(--safe-area-inset-right)'
        }}
      >
        <a href="#quotes" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-600 focus:text-white focus:rounded-lg">
          Перейти к цитатам
        </a>
        <a href="#controls" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-600 focus:text-white focus:rounded-lg focus:mt-14">
          Управление
        </a>
        <div className="absolute inset-0 pointer-events-none" style={{ background: backgroundGradient }} />

        <div className="absolute inset-0 pointer-events-none opacity-[0.012]" style={{ background: gridPattern, backgroundSize: '45px 45px' }} />

        <div className="relative z-10 h-full flex flex-col lg:flex-row">
          <div className="w-full lg:w-[58%] h-[50%] lg:h-full relative" role="region" aria-label="3D сцена с книгой">
            {mounted && !sceneError && (
              <Scene
                isRotating={isRotating}
                onError={handleSceneError}
                coverImage={activeBook.coverImage}
                spineImage={activeBook.spineImage}
                backCoverImage={activeBook.backCoverImage}
                theme={effectiveTheme}
                onKeyboardRotate={toggleRotation}
                rotationSpeed={rotationSpeed}
              />
            )}
            
            {/* Debug информация */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-2 left-2 text-[10px] text-amber-500/30 bg-black/50 p-2 rounded">
                <div>mounted: {mounted ? 'yes' : 'no'}</div>
                <div>hasWebGL: {hasWebGL === true ? 'yes' : hasWebGL === false ? 'no' : 'checking'}</div>
                <div>sceneError: {sceneError ? 'yes' : 'no'}</div>
                <div>activeBook: {activeBook.id}</div>
              </div>
            )}

          <div id="controls">
            {!isZenMode && <ControlButton isRotating={isRotating} onClick={toggleRotation} />}
          </div>

          {/* Переключатель книг - вверху справа */}
          {!isZenMode && (
            <div className="absolute top-3 right-3 z-40">
              <BookSelector activeBookId={activeBookId} onBookChange={handleBookChange} />
            </div>
          )}

          {!isZenMode && (
            <div className="absolute bottom-3 md:bottom-6 left-0 right-0 text-center pointer-events-none px-4">
              <div className="inline-block px-5 md:px-8 py-3 md:py-4 rounded-2xl backdrop-blur-lg bg-[rgba(8,8,16,0.72)] border border-[rgba(212,175,55,0.18)] shadow-[0_10px_35px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(212,175,55,0.12)]">
                <h1 className="text-base md:text-lg lg:text-xl text-amber-100 font-light tracking-wider">{activeBook.title}</h1>
                <p className="text-[9px] md:text-[11px] text-amber-400/55 mt-1 tracking-[0.12em] uppercase">{activeBook.author}</p>
              </div>
            </div>
          )}
          </div>

          <div id="quotes" className="w-full lg:w-[42%] h-[50%] lg:h-full relative bg-gradient-to-b from-[rgba(25,25,40,0.95)] to-[rgba(20,20,35,0.97)] border-l border-[rgba(212,175,55,0.12)]" role="region" aria-label="Цитаты стоических философов">
            <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-b from-[rgba(10,10,18,1)] to-transparent" />
            {/* Live region для объявления о смене цитаты */}
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {`Цитата ${activeQuote + 1} из ${activeBook.quotes.length}: ${activeBook.quotes[activeQuote]?.text.substring(0, 100)}${activeBook.quotes[activeQuote]?.text.length > 100 ? '...' : ''}. Автор: ${activeBook.quotes[activeQuote]?.author}`}
            </div>
            <QuotesPanel quotes={activeBook.quotes} activeQuote={activeQuote} setActiveQuote={setActiveQuote} bookTitle={activeBook.title} />
            <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-t from-[rgba(5,5,10,1)] to-transparent" />
          </div>
        </div>

        {!isZenMode ? (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
              <div className="w-6 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
              <div className="w-1 h-1 rounded-full bg-amber-500/12" />
            </div>

            <div className="absolute bottom-3 left-3 pointer-events-none">
              <p className="text-amber-600/15 text-[9px] tracking-[0.2em] uppercase font-light">Stoic Philosophy</p>
            </div>

            {/* Кнопка меню настроек - внизу слева */}
            <div className="absolute bottom-20 left-3 z-40">
              <MainMenu
                theme={theme}
                onThemeChange={(t: string) => setTheme(t as Theme)}
                isRotating={isRotating}
                onToggleRotation={toggleRotation}
                zenMode={isZenMode}
                onToggleZenMode={toggleZenMode}
                onExportFavorites={handleExportFavorites}
                onImportFavorites={handleImportFavorites}
              />
            </div>
          </>
        ) : (
          <div className="absolute top-3 left-3 z-50 flex items-center gap-2">
            <p className="text-amber-500/40 text-[10px] tracking-[0.2em] uppercase hidden sm:block">Zen Mode — нажми Z или Esc для выхода</p>
            <button
              onClick={toggleZenMode}
              className="sm:hidden px-3 py-1.5 text-xs rounded-lg backdrop-blur-md bg-[rgba(10,10,20,0.85)] border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center gap-1.5"
              aria-label="Выйти из Zen-режима"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Выход</span>
            </button>
          </div>
        )}

        {!isZenMode && <SettingsBar theme={theme} onThemeChange={setTheme} />}

        {!isZenMode && <PWAInstall />}

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Book Revelation 3D",
              "alternateName": ["Откровение Книги 3D", "Stoic Book 3D"],
              "url": "https://book-revelation-3d.vercel.app",
              "description": "Интерактивный 3D модуль с вращающейся книгой философии и цитатами великих мыслителей",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Any",
              "browserRequirements": "Requires JavaScript",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Book Revelation 3D Team"
              },
              "keywords": "стоицизм, 3D книга, Марк Аврелий, Эпиктет, Стивен Хокинг, философия, цитаты",
              "inLanguage": ["ru", "en", "he", "zh"]
            })
          }}
        />

        <KeyboardShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 2.5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.015); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.35); }
        `}</style>
      </main>
    </ToastProvider>
  );
}
