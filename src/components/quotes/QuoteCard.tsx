"use client";

import type { Quote } from "@/types/quote";

interface QuoteCardProps {
  quote: Quote;
  index: number;
  isVisible: boolean;
  isActive: boolean;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export function QuoteCard({ quote, index, isVisible, isActive, isFavorite, onClick, onToggleFavorite }: QuoteCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const handleFavoriteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleFavorite(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Цитата ${index + 1}: ${quote.text.substring(0, 50)}...`}
      aria-pressed={isActive}
      className={`
        transition-all duration-700 ease-out cursor-pointer
        transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
        focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-transparent
      `}
      style={{
        transitionDelay: `${index * 50}ms`
      }}
    >
      <div
        className={`
          relative p-3.5 md:p-4 rounded-xl overflow-hidden
          transition-all duration-400
          ${isActive
            ? 'bg-gradient-to-r from-amber-900/55 via-amber-900/30 to-transparent border-l-[3px] border-amber-400'
            : 'bg-white/[0.04] border-l-[3px] border-transparent hover:bg-white/[0.08] hover:border-amber-600/30'
          }
        `}
      >
        {/* Active glow effect */}
        {isActive && (
          <>
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'radial-gradient(ellipse at left, rgba(212, 175, 55, 0.28), transparent 65%)',
              }}
            />
            <div
              className="absolute -inset-0.5 rounded-xl opacity-30"
              style={{
                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.5), transparent)',
                filter: 'blur(10px)'
              }}
            />
          </>
        )}

        {/* Favorite button */}
        <button
          onClick={onToggleFavorite}
          onKeyDown={handleFavoriteKeyDown}
          tabIndex={0}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-full hover:bg-amber-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
          aria-pressed={isFavorite}
        >
          <svg
            className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        <p className={`
          text-sm md:text-[15px] leading-relaxed mb-2 pr-8 relative z-10
          ${isActive ? 'text-amber-50' : 'text-gray-300'}
          transition-colors duration-400
        `}>
          &ldquo;{quote.text}&rdquo;
        </p>
        <div className="flex items-center gap-2 relative z-10">
          <p className={`
            text-xs md:text-sm
            ${isActive ? 'text-amber-300' : 'text-gray-500'}
            transition-colors duration-400 font-light tracking-wide
          `}>
            — {quote.author}
          </p>
          <span className={`
            text-[10px] px-1.5 py-0.5 rounded
            ${isActive ? 'bg-amber-600/30 text-amber-200' : 'bg-white/5 text-gray-600'}
            transition-colors duration-400
          `}>
            {quote.era}
          </span>
        </div>
      </div>
    </div>
  );
}
