"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { QuotesPanel } from "@/components/quotes";
import { ControlButton, WebGLError, useWebGLSupport, SettingsBar, PWAInstall, ToastProvider, BookSelector, MainMenu } from "@/components/ui";
import { useRotationControl } from "@/hooks/use-rotation";
import { useMounted } from "@/hooks/use-mounted";
import { LoadingFallback } from "@/components/ui/LoadingFallback";
import { getBookById, getDefaultBook, books } from "@/data/books";
import { textureManager } from "@/lib/textures/texture-manager";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/components/ui/Toast";
import { usePrefersColorScheme } from "@/hooks/use-prefers-color-scheme";
import { useOfflineQuotes } from "@/hooks/use-offline-quotes";
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

const THEMES = ["dark", "light", "blue", "purple", "ambient", "relax", "auto"] as const;
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
  const { isRotating, toggleRotation } = useRotationControl();
  const [activeQuote, setActiveQuote] = useState(0);
  const [webGLError, setWebGLError] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [zenMode, setZenMode] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string>(getInitialBook);
  const [sceneError, setSceneError] = useState(false);
  
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

  // Обработчик ошибок сцены
  const handleSceneError = useCallback(() => {
    console.error('3D Scene error occurred');
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

  // Zen-режим - скрытие UI при нажатии Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          setZenMode(prev => !prev);
        }
      }
      if (e.key === 'Escape' && zenMode) {
        setZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zenMode]);

  // Смена темы оформления - оптимизировано
  useEffect(() => {
    // Анимация при смене темы
    document.body.classList.add('theme-transitioning');
    document.body.className = `${effectiveTheme}-theme`;
    localStorage.setItem("theme", theme);

    const timer = setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);

    return () => clearTimeout(timer);
  }, [effectiveTheme, theme]);

  // Автоматическое переключение цитат
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % activeBook.quotes.length);
    }, QUOTE_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [activeBook.quotes.length]);

  const handleBookChange = useCallback((bookId: string) => {
    setActiveBookId(bookId);
    setActiveQuote(0); // Сбрасываем на первую цитату новой книги
  }, []);

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
    } catch (error) {
      showToast("Ошибка при экспорте", "error");
      console.error("Export error:", error);
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

  // Компонент статистики текстур (для отладки)
  const TextureStats = () => {
    const [stats, setStats] = useState(textureManager.getStats());
    
    useEffect(() => {
      const interval = setInterval(() => {
        setStats(textureManager.getStats());
      }, 1000);
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="space-y-0.5">
        <div>hits: {stats.hits}</div>
        <div>misses: {stats.misses}</div>
        <div>loads: {stats.loads}</div>
        <div>cache: {stats.cacheSize}</div>
      </div>
    );
  };

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
              />
            )}
            
            {/* Debug информация */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-2 left-2 text-[10px] text-amber-500/30 bg-black/50 p-2 rounded">
                <div>mounted: {mounted ? 'yes' : 'no'}</div>
                <div>hasWebGL: {hasWebGL === true ? 'yes' : hasWebGL === false ? 'no' : 'checking'}</div>
                <div>sceneError: {sceneError ? 'yes' : 'no'}</div>
                <div>activeBook: {activeBook.id}</div>
                <div className="mt-1 text-amber-400/50">--- Texture Stats ---</div>
                <TextureStats />
              </div>
            )}

          <div id="controls">
            {!zenMode && <ControlButton isRotating={isRotating} onClick={toggleRotation} />}
          </div>

          {/* Переключатель книг - вверху справа */}
          {!zenMode && (
            <div className="absolute top-3 right-3 z-40">
              <BookSelector activeBookId={activeBookId} onBookChange={handleBookChange} />
            </div>
          )}

          {!zenMode && (
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

        {!zenMode ? (
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
                zenMode={zenMode}
                onToggleZenMode={() => setZenMode(!zenMode)}
                onExportFavorites={handleExportFavorites}
                onImportFavorites={handleImportFavorites}
              />
            </div>
          </>
        ) : (
          <div className="absolute top-3 left-3 z-50 flex items-center gap-2">
            <p className="text-amber-500/40 text-[10px] tracking-[0.2em] uppercase hidden sm:block">Zen Mode — нажми Z или Esc для выхода</p>
            <button
              onClick={() => setZenMode(false)}
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

        {!zenMode && <SettingsBar theme={theme} onThemeChange={setTheme} />}

        {!zenMode && <PWAInstall />}

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
