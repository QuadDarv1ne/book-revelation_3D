"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { quotes } from "@/data/quotes";
import { QuoteCard } from "./QuoteCard";
import { useFavorites } from "@/hooks/use-favorites";

interface QuotesPanelProps {
  activeQuote: number;
  setActiveQuote: (n: number) => void;
}

export function QuotesPanel({ activeQuote, setActiveQuote }: QuotesPanelProps) {
  const [visibleQuotes, setVisibleQuotes] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, isLoaded, toggleFavorite, isFavorite } = useFavorites();

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
  }, []);

  const filteredQuotes = useMemo(() => {
    let result = quotes;

    if (filter === 'favorites') {
      const favSet = new Set(favorites);
      result = result.filter((_, index) => favSet.has(index));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(quote =>
        quote.text.toLowerCase().includes(query) ||
        quote.author.toLowerCase().includes(query)
      );
    }

    return result;
  }, [filter, favorites, searchQuery]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    toggleFavorite(index);
  }, [toggleFavorite]);

  const quoteCards = useMemo(() => {
    if (!isLoaded) return null;
    if (filteredQuotes.length === 0) {
      return (
        <p className="text-gray-500 text-sm">
          {filter === 'favorites'
            ? 'Нет избранных цитат. Нажмите на сердце, чтобы добавить цитату в избранное.'
            : 'Цитаты загружаются...'}
        </p>
      );
    }
    return filteredQuotes.map((quote, index) => {
      const originalIndex = quotes.findIndex(q => q.text === quote.text);
      return (
        <QuoteCard
          key={originalIndex}
          quote={quote}
          index={originalIndex}
          isVisible={visibleQuotes.includes(originalIndex)}
          isActive={activeQuote === originalIndex}
          isFavorite={isFavorite(originalIndex)}
          onClick={() => setActiveQuote(originalIndex)}
          onToggleFavorite={(e) => handleToggleFavorite(e, originalIndex)}
        />
      );
    });
  }, [isLoaded, filteredQuotes, visibleQuotes, activeQuote, isFavorite, handleToggleFavorite, setActiveQuote]);

  return (
    <div className="h-full flex flex-col justify-center p-5 md:p-7 lg:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-5">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-amber-100 mb-1.5 tracking-wide">
          В чём наше благо?
        </h2>
        <p className="text-xs md:text-sm text-amber-500/65 tracking-[0.18em] uppercase font-light">
          Стоическая мудрость
        </p>
        
        {/* Search input */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Поиск цитат..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white/5 border border-amber-500/20 rounded-lg text-amber-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-amber-600/30 text-amber-200'
                : 'text-gray-500 hover:text-amber-400'
            }`}
          >
            Все ({quotes.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === 'favorites'
                ? 'bg-amber-600/30 text-amber-200'
                : 'text-gray-500 hover:text-amber-400'
            }`}
          >
            Избранные ({favorites.length})
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-px bg-gradient-to-r from-amber-400/55 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/45" />
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-2 md:space-y-2.5 max-h-[50vh] md:max-h-[420px] overflow-y-auto pr-1.5 custom-scrollbar">
        {quoteCards}
      </div>

      {/* Footer decoration */}
      <div className="mt-4 md:mt-5 flex items-center gap-2 text-amber-600/35">
        <div className="w-2.5 h-px bg-amber-500/25" />
        <span className="text-[9px] md:text-[10px] tracking-[0.25em] uppercase">Stoic Wisdom</span>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-500/25 to-transparent" />
      </div>
    </div>
  );
}
