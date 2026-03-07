"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import type { Quote } from "@/types/quote";
import { QuoteCard } from "./QuoteCard";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/hooks/use-i18n";

interface QuotesPanelProps {
  quotes: Quote[];
  activeQuote: number;
  setActiveQuote: (n: number | ((prev: number) => number)) => void;
  bookTitle: string;
}

export function QuotesPanel({ quotes, activeQuote, setActiveQuote, bookTitle }: QuotesPanelProps) {
  const [visibleQuotes, setVisibleQuotes] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, isLoaded, toggleFavorite, isFavorite, exportFavorites, importFavorites } = useFavorites();
  const { showToast } = useToast();
  const { t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Touch handling for swipe gestures
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndX.current = 0;
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveQuote(prev => (prev + 1) % quotes.length);
    } else if (isRightSwipe) {
      setActiveQuote(prev => (prev - 1 + quotes.length) % quotes.length);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [quotes.length, setActiveQuote]);

  useEffect(() => {
    const showQuote = (index: number) => {
      if (index < quotes.length) {
        const timer = setTimeout(() => {
          setVisibleQuotes(prev => [...prev, index]);
          showQuote(index + 1);
        }, 50);
        return timer;
      }
      return undefined;
    };

    const initialTimer = setTimeout(() => showQuote(0), 300);
    return () => clearTimeout(initialTimer);
  }, [quotes.length]);

  // Фильтруем с сохранением оригинального индекса
  const filteredQuotesWithIndex = useMemo(() => {
    let result = quotes.map((q, i) => ({ quote: q, originalIndex: i }));

    if (filter === 'favorites') {
      result = result.filter(({ originalIndex }) => favorites.includes(originalIndex));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(({ quote }) =>
        quote.text.toLowerCase().includes(query) ||
        quote.author.toLowerCase().includes(query)
      );
    }

    return result;
  }, [quotes, filter, favorites, searchQuery]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent | React.KeyboardEvent, index: number) => {
    e.stopPropagation();
    toggleFavorite(index);
  }, [toggleFavorite]);

  // Функция копирования цитаты
  const handleCopyQuote = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Цитата скопирована!", "success");
    }).catch(err => {
      showToast("Не удалось скопировать", "error");
      console.warn('Failed to copy:', err);
    });
  }, [showToast]);

  // Перемешать цитаты случайным образом
  const shuffleQuotes = useCallback(() => {
    const shuffled = [...quotes].sort(() => Math.random() - 0.5);
    const firstQuote = shuffled[0];
    const newIndex = quotes.findIndex(q => q.text === firstQuote.text);
    setActiveQuote(newIndex);
  }, [quotes, setActiveQuote]);

  // Экспорт избранных цитат
  const handleExportFavorites = useCallback(() => {
    const exported = exportFavorites();
    if (!exported) {
      showToast(t('toast.noFavoritesToExport'), "error");
      return;
    }

    const blob = new Blob([exported], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stoic-favorites-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('toast.favoritesExported'), "success");
  }, [exportFavorites, showToast, t]);

  // Импорт избранных цитат
  const handleImportFavorites = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const importResult = importFavorites(result);
      if (importResult?.success) {
        showToast(t('toast.favoritesImported').replace('{count}', String(importResult.count)), "success");
      } else {
        showToast(`${t('toast.importError')}: ${importResult?.error}`, "error");
      }
    };
    reader.onerror = () => {
      showToast(t('toast.readFileError'), "error");
    };
    reader.readAsText(file);
    event.target.value = "";
  }, [importFavorites, showToast, t]);

  // Поделиться цитатой (генерация изображения)
  const handleShareQuote = useCallback(async (quote: import('@/types/quote').Quote) => {
    const shareText = `"${quote.text}" — ${quote.author}`;
    
    // Пробуем Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Цитата',
          text: shareText,
          url: window.location.href
        });
        showToast("Цитата partagée!", "success");
        return;
      } catch {
        // Игнорируем AbortError
      }
    }
    
    // Fallback: копирование в буфер
    try {
      await navigator.clipboard.writeText(shareText);
      showToast("Цитата скопирована в буфер обмена", "success");
    } catch {
      showToast("Не удалось скопировать", "error");
    }
  }, [showToast]);

  // Клавиатурная навигация по цитатам
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveQuote(prev => (prev + 1) % quotes.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveQuote(prev => (prev - 1 + quotes.length) % quotes.length);
        break;
      case 'Home':
        e.preventDefault();
        setActiveQuote(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveQuote(quotes.length - 1);
        break;
    }
  }, [quotes.length, setActiveQuote]);

  const quoteCards = useMemo(() => {
    if (!isLoaded) return null;
    if (filteredQuotesWithIndex.length === 0) {
      return (
        <p className="text-gray-500 text-sm">
          {filter === 'favorites'
            ? t('quotes.noFavorites')
            : t('quotes.loading').replace('{book}', bookTitle)}
        </p>
      );
    }
    return filteredQuotesWithIndex.map(({ quote, originalIndex }) => (
      <QuoteCard
        key={originalIndex}
        quote={quote}
        index={originalIndex}
        isVisible={visibleQuotes.includes(originalIndex)}
        isActive={activeQuote === originalIndex}
        isFavorite={isFavorite(originalIndex)}
        onClick={() => setActiveQuote(originalIndex)}
        onToggleFavorite={(e) => handleToggleFavorite(e, originalIndex)}
        onCopy={handleCopyQuote}
        onShare={handleShareQuote}
      />
    ));
  }, [isLoaded, filteredQuotesWithIndex, visibleQuotes, activeQuote, isFavorite, handleToggleFavorite, handleCopyQuote, handleShareQuote, setActiveQuote, filter, bookTitle, t]);

  return (
    <div
      ref={panelRef}
      className="h-full flex flex-col justify-center p-4 sm:p-5 md:p-7 lg:p-8"
      onKeyDown={handlePanelKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Панель цитат. Используйте стрелки вверх/вниз для навигации или свайпы на сенсорных экранах."
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Индикаторы свайпов для мобильных */}
      <div className="sm:hidden flex justify-center gap-2 mb-3 text-amber-500/40" aria-hidden="true">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-[10px] tracking-wider">СВАЙП</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Header */}
      <div className="mb-3 sm:mb-4 md:mb-5">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-amber-100 mb-1.5 tracking-wide">
          {bookTitle}
        </h2>
        <p className="text-[10px] sm:text-xs md:text-sm text-amber-500/65 tracking-[0.18em] uppercase font-light">
          Стоическая мудрость
        </p>

        {/* Search input - увеличен для мобильных */}
        <div className="mt-3 sm:mt-4 relative">
          <label htmlFor="quote-search" className="sr-only">Поиск цитат</label>
          <input
            id="quote-search"
            type="text"
            placeholder="Поиск цитат..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white/5 border border-amber-500/20 rounded-lg text-amber-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/40 transition-colors focus:ring-2 focus:ring-amber-400 min-h-[44px]"
            aria-label="Поиск по цитатам"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-full p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Очистить поиск"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter tabs - увеличенные кнопки для мобильных */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-3 flex-wrap" role="group" aria-label={t('quotes.filters')}>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] ${
              filter === 'all'
                ? 'bg-amber-600/30 text-amber-200 font-medium'
                : 'text-gray-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
            aria-pressed={filter === 'all'}
            type="button"
          >
            {t('quotes.all')} ({quotes.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-3 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] ${
              filter === 'favorites'
                ? 'bg-amber-600/30 text-amber-200 font-medium'
                : 'text-gray-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
            aria-pressed={filter === 'favorites'}
            type="button"
          >
            {t('quotes.favorites')} ({favorites.length})
          </button>
          <button
            onClick={shuffleQuotes}
            className="px-3 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t('quotes.shuffle')}
            aria-label={t('quotes.shuffle')}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={handleExportFavorites}
            className="px-3 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t('quotes.export')}
            aria-label={t('quotes.export')}
            type="button"
            disabled={favorites.length === 0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t('quotes.import')}
            aria-label={t('quotes.import')}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFavorites}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-px bg-gradient-to-r from-amber-400/55 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/45" />
        </div>
      </div>

      {/* Quotes List - оптимизировано для мобильных */}
      <div
        className="space-y-2 sm:space-y-2.5 flex-1 overflow-y-auto pr-1.5 custom-scrollbar"
        role="list"
        aria-label="Список цитат"
      >
        {quoteCards}
      </div>

      {/* Footer decoration */}
      <div className="mt-3 sm:mt-4 md:mt-5 flex items-center gap-2 text-amber-600/35">
        <div className="w-2.5 h-px bg-amber-500/25" />
        <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase">Stoic Wisdom</span>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-500/25 to-transparent" />
      </div>
    </div>
  );
}
