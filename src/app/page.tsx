"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { QuotesPanel } from "@/components/quotes";
import { WebGLError, useWebGLSupport, SettingsBar, PWAInstall, ToastProvider, BookSelector, MainMenu } from "@/components/ui";
import { SceneContainer } from "@/components/book/SceneContainer";
import { generateBookJsonLd } from "@/lib/seo/book-metadata";
import { usePrefersColorScheme } from "@/hooks/use-prefers-color-scheme";
import { useOfflineQuotes } from "@/hooks/use-offline-quotes";
import { useAnalytics, trackBookChange, trackThemeChange } from "@/hooks/use-analytics";
import { useAutoTheme } from "@/hooks/use-auto-theme";
import { useGamification } from "@/hooks/use-gamification";
import { useZenMode } from "@/hooks/use-zen-mode";
import { useUserSettings, type Theme } from "@/hooks/use-user-settings";
import { useFPSMonitor } from "@/hooks/use-fps-monitor";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { KeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcutsHelp";
import { useFavorites } from "@/hooks/use-favorites";
import { getBookById, getDefaultBook, books } from "@/data/books";
import { textureManager } from "@/lib/textures/texture-manager";
import { useToast } from "@/components/ui/Toast";
import type { Quote } from "@/types/quote";

const QUOTE_ROTATION_INTERVAL = 5000;

export default function Home() {
  const hasWebGL = useWebGLSupport();
  const { trackEvent } = useAnalytics();
  const { themeConfig: autoThemeConfig } = useAutoTheme();
  const { addThemeExplored, addBookViewed, trackTime, incrementCategoryRead, themeOfDay, completeThemeChallenge } = useGamification();
  const { isZenMode, toggleZenMode } = useZenMode({ autoSave: true });
  const {
    settings,
    isLoaded: settingsLoaded,
    updateSettings,
    incrementTimeSpent,
    incrementBookQuoteRead,
    exportSettings,
  } = useUserSettings();
  const { captureException, captureMessage } = useErrorHandler({ enabled: true });
  const fpsStats = useFPSMonitor(!isZenMode);
  const { showToast } = useToast();
  const { exportFavoritesToFile, importFavoritesFromFile } = useFavorites();

  const [activeQuote, setActiveQuote] = useState(0);
  const [webGLError, setWebGLError] = useState(false);
  const [sceneError, setSceneError] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [menuIsRotating, setMenuIsRotating] = useState(false);

  const systemColorScheme = usePrefersColorScheme();

  const effectiveTheme = useMemo(() => {
    if (settings.theme === "auto") {
      return systemColorScheme;
    }
    if (settings.theme === "auto-time") {
      return autoThemeConfig.colorClass.replace('-theme', '') as typeof systemColorScheme;
    }
    return settings.theme;
  }, [settings.theme, systemColorScheme, autoThemeConfig]);

  const activeBook = useMemo(() => getBookById(settings.activeBookId) || getDefaultBook(), [settings.activeBookId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TOGGLE_ROTATION') {
        toggleZenMode();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toggleZenMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем комбинации с модификаторами
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'z':
          toggleZenMode();
          break;
        case 'escape':
          if (isZenMode) toggleZenMode();
          if (showShortcutsHelp) setShowShortcutsHelp(false);
          break;
        case 'h':
          setShowShortcutsHelp(prev => !prev);
          break;
        case 'p':
          // Открыть прогресс книг (эмуляция клика)
          const progressButton = document.querySelector('[aria-label="Прогресс чтения книг"]') as HTMLButtonElement;
          progressButton?.click();
          break;
        case 'q':
          // Следующая цитата
          setActiveQuote(prev => (prev + 1) % activeBook.quotes.length);
          break;
        case 'a':
          // Предыдущая цитата
          setActiveQuote(prev => (prev - 1 + activeBook.quotes.length) % activeBook.quotes.length);
          break;
        case 't':
          // Циклическая смена темы
          const themes: Theme[] = ['dark', 'light', 'blue', 'purple', 'ambient', 'relax'];
          const currentIndex = themes.indexOf(settings.theme as Theme);
          const nextTheme = themes[(currentIndex + 1) % themes.length];
          updateSettings('theme', nextTheme);
          break;
        case 's':
          // Открыть настройки
          const settingsButton = document.querySelector('[aria-label="Панель настроек"]') as HTMLButtonElement;
          settingsButton?.click();
          break;
        case 'g':
          // Открыть достижения
          const achievementButton = document.querySelector('[aria-label="Достижения"]') as HTMLButtonElement;
          achievementButton?.click();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          // Быстрая смена книги (1-6)
          const bookIndex = parseInt(e.key) - 1;
          if (bookIndex < books.length) {
            const newBook = books[bookIndex];
            updateSettings('activeBookId', newBook.id);
            addBookViewed(newBook.id);
            showToast(`Выбрана книга: ${newBook.title}`, 'info');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, toggleZenMode, showShortcutsHelp, settings.theme, activeBook.quotes.length, updateSettings, addBookViewed, showToast]);

  useEffect(() => {
    if (!settingsLoaded) return;

    document.body.classList.add('theme-transitioning');

    const bodyTheme = settings.theme === "auto-time" ? autoThemeConfig.colorClass : `${effectiveTheme}-theme`;
    document.body.className = bodyTheme;

    trackThemeChange(settings.theme);
    trackEvent("settings", "theme_change", settings.theme);
    addThemeExplored(settings.theme);

    const timer = setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);

    return () => clearTimeout(timer);
  }, [effectiveTheme, settings.theme, settingsLoaded, trackEvent, autoThemeConfig, addThemeExplored]);

  // Трекинг времени с обновлением statistics
  useEffect(() => {
    const interval = setInterval(() => {
      trackTime(10);
      incrementTimeSpent(10);
    }, 10000);
    return () => clearInterval(interval);
  }, [trackTime, incrementTimeSpent]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => {
        const next = (prev + 1) % activeBook.quotes.length;
        const quote = activeBook.quotes[next];
        if (quote?.category) {
          incrementCategoryRead(quote.category);
        }
        // Трекинг прочитанной цитаты по книге
        incrementBookQuoteRead(activeBook.id);
        return next;
      });
    }, QUOTE_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [activeBook.quotes.length, activeBook.quotes, activeBook.id, incrementCategoryRead, incrementBookQuoteRead]);

  // Автоматическое завершение theme challenge при смене темы
  useEffect(() => {
    if (!themeOfDay.completed && settings.theme === themeOfDay.theme) {
      completeThemeChallenge();
    }
  }, [settings.theme, themeOfDay, completeThemeChallenge]);

  const handleBookChange = useCallback((bookId: string) => {
    trackBookChange(settings.activeBookId, bookId);
    trackEvent("navigation", "book_change", bookId);
    addBookViewed(bookId);
    updateSettings('activeBookId', bookId);

    const newBook = getBookById(bookId);
    if (newBook) {
      textureManager.preloadBookTextures(
        newBook.coverImage,
        newBook.spineImage,
        newBook.backCoverImage
      ).catch(() => {
        captureException(new Error(`Failed to preload textures for ${bookId}`));
      });
    }

    setActiveQuote(0);
  }, [settings.activeBookId, trackEvent, addBookViewed, updateSettings, captureException]);

  const handleRetry = useCallback(() => {
    setWebGLError(false);
    window.location.reload();
  }, []);

  const handleSceneError = useCallback(() => {
    setSceneError(true);
    setWebGLError(true);
  }, []);

  const { cacheQuotes } = useOfflineQuotes();

  useEffect(() => {
    const quotesByBook: Record<string, Quote[]> = {};
    books.forEach(book => {
      quotesByBook[book.id] = book.quotes;
    });
    cacheQuotes(quotesByBook);
  }, [cacheQuotes]);

  const handleExportFavorites = useCallback(() => {
    const exportData = exportSettings();

    if (!exportData) {
      showToast("Нет избранных цитат для экспорта", "info");
      return;
    }

    try {
      exportFavoritesToFile(exportData, showToast, captureMessage);
    } catch (error) {
      captureException(error as Error);
    }
  }, [exportSettings, showToast, captureMessage, exportFavoritesToFile, captureException]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportFavorites = useCallback(() => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readEvent) => {
      const content = readEvent.target?.result as string;
      importFavoritesFromFile(content, showToast, captureMessage, captureException);
    };

    reader.onerror = () => {
      showToast("Ошибка чтения файла", "error");
    };

    reader.readAsText(file);

    // Сброс input для повторного выбора того же файла
    e.target.value = '';
  }, [showToast, captureMessage, captureException, importFavoritesFromFile]);

  // Вычисляем useMemo до условного return
  const backgroundGradient = useMemo(() => settings.theme === "light" || settings.theme === "relax"
    ? 'radial-gradient(ellipse_75%_45%_at_28%_38%,rgba(180,160,80,0.12)_0%,transparent_50%),radial-gradient(ellipse_55%_35%_at_72%_68%,rgba(160,140,70,0.08)_0%,transparent_45%),radial-gradient(ellipse_100%_75%_at_50%_100%,rgba(255,255,255,0.9)_0%,transparent_50%)'
    : 'radial-gradient(ellipse_75%_45%_at_28%_38%,rgba(212,175,55,0.08)_0%,transparent_50%),radial-gradient(ellipse_55%_35%_at_72%_68%,rgba(212,175,55,0.06)_0%,transparent_45%),radial-gradient(ellipse_100%_75%_at_50%_100%,rgba(30,30,50,0.7)_0%,transparent_50%)',
    [settings.theme]);

  const gridPattern = useMemo(() => 'linear-gradient(rgba(212,175,55,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.5)_1px,transparent_1px)', []);

  const jsonLd = useMemo(() => {
    const baseSchema = {
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
      "inLanguage": ["ru", "en", "zh", "he", "es", "fr", "de"]
    };

    const bookSchema = JSON.parse(generateBookJsonLd(activeBook));

    return JSON.stringify({
      ...baseSchema,
      "@graph": [baseSchema, bookSchema]
    });
  }, [activeBook]);

  if (hasWebGL === false || webGLError) {
    return <WebGLError onRetry={handleRetry} />;
  }

  return (
    <ToastProvider>
      <main
        className="relative w-full h-screen overflow-hidden select-none bg-[#f5f5f0] dark:bg-[#07070d] light:bg-[#f5f5f0] relax:bg-[#f0f0eb]"
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
            {!sceneError && (
              <SceneContainer
                book={activeBook}
                rotationSpeed={settings.rotationSpeed}
                onError={handleSceneError}
              />
            )}

            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-2 left-2 text-[10px] text-amber-500/30 bg-black/50 p-2 rounded">
                <div>hasWebGL: {hasWebGL === true ? 'yes' : hasWebGL === false ? 'no' : 'checking'}</div>
                <div>sceneError: {sceneError ? 'yes' : 'no'}</div>
                <div>activeBook: {activeBook.id}</div>
                <div>FPS: {fpsStats.fps} (min: {fpsStats.min}, max: {fpsStats.max})</div>
                <div>theme: {settings.theme}</div>
              </div>
            )}

            <div id="controls">
              {!isZenMode && (
                <div className="absolute top-3 left-0 right-0 flex justify-center z-40">
                  <BookSelector activeBookId={settings.activeBookId} onBookChange={handleBookChange} />
                </div>
              )}
            </div>

            {!isZenMode && (
              <div className="absolute bottom-3 md:bottom-6 left-0 right-0 text-center pointer-events-none px-4">
                <div className="inline-block px-5 md:px-8 py-3 md:py-4 rounded-2xl backdrop-blur-lg bg-[rgba(8,8,16,0.72)] border border-[rgba(212,175,55,0.18)] shadow-[0_10px_35px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(212,175,55,0.12)]">
                  <h1 className="text-base md:text-lg lg:text-xl text-amber-100 font-light tracking-wider">{activeBook.title}</h1>
                  <p className="text-[9px] md:text-[11px] text-amber-400/55 mt-1 tracking-[0.12em] uppercase">{activeBook.author}</p>
                </div>
              </div>
            )}
          </div>

          <div id="quotes" className="w-full lg:w-[42%] h-[50%] lg:h-full relative bg-gradient-to-b from-[rgba(25,25,40,0.95)] to-[rgba(20,20,35,0.97)] dark:from-[rgba(25,25,40,0.95)] dark:to-[rgba(20,20,35,0.97)] light:from-[rgba(255,255,255,0.92)] light:to-[rgba(250,250,245,0.94)] relax:from-[rgba(255,255,255,0.9)] relax:to-[rgba(248,248,243,0.92)] border-l border-[rgba(212,175,55,0.12)] light:border-[rgba(180,160,80,0.2)] relax:border-[rgba(160,140,70,0.18)]" role="region" aria-label="Цитаты стоических философов">
            <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-b from-[rgba(10,10,18,1)] to-transparent dark:from-[rgba(10,10,18,1)] light:from-[rgba(255,255,255,0)] relax:from-[rgba(255,255,255,0)]" />
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {`Цитата ${activeQuote + 1} из ${activeBook.quotes.length}: ${activeBook.quotes[activeQuote]?.text.substring(0, 100)}${activeBook.quotes[activeQuote]?.text.length > 100 ? '...' : ''}. Автор: ${activeBook.quotes[activeQuote]?.author}`}
            </div>
            <QuotesPanel quotes={activeBook.quotes} activeQuote={activeQuote} setActiveQuote={setActiveQuote} bookTitle={activeBook.title} />
            <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-t from-[rgba(5,5,10,1)] to-transparent dark:from-[rgba(5,5,10,1)] light:from-[rgba(255,255,255,0)] relax:from-[rgba(255,255,255,0)]" />
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

            <div className="absolute bottom-3 left-0 right-0 flex justify-center z-40">
              <MainMenu
                theme={settings.theme}
                onThemeChange={(t: string) => updateSettings('theme', t as typeof settings.theme)}
                isRotating={menuIsRotating}
                onToggleRotation={() => setMenuIsRotating(!menuIsRotating)}
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

        {!isZenMode && <SettingsBar theme={settings.theme} onThemeChange={(t) => updateSettings('theme', t as typeof settings.theme)} />}

        {!isZenMode && <PWAInstall />}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
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
