"use client";

import type { Quote } from "@/types/quote";
import { sanitizeText } from "@/lib/security";

interface QuoteCardProps {
  quote: Quote;
  index: number;
  isVisible: boolean;
  isActive: boolean;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onCopy?: (text: string) => void;
  onShare?: (quote: Quote) => void;
}

export function QuoteCard({ quote, index, isVisible, isActive, isFavorite, onClick, onToggleFavorite, onCopy, onShare }: QuoteCardProps) {
  // Санитизация данных для защиты от XSS
  const safeText = sanitizeText(quote.text);
  const safeAuthor = sanitizeText(quote.author);
  const safeEra = sanitizeText(quote.era);

  // Haptic feedback
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHaptic(10);
      onClick();
    }
  };

  const handleCopyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHaptic(5);
      onCopy?.(`"${quote.text}" — ${quote.author}`);
    }
  };

  const handleFavoriteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHaptic(isFavorite ? [5, 10, 5] : 10);
      onToggleFavorite(e);
    }
  };

  const handleShareKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHaptic(10);
      onShare?.(quote);
    }
  };

  return (
    <div
      onClick={() => {
        triggerHaptic(10);
        onClick();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Цитата ${index + 1}: ${quote.text.substring(0, 50)}${quote.text.length > 50 ? '...' : ''}. ${isActive ? '(активна)' : ''}. Автор: ${quote.author}`}
      aria-pressed={isActive}
      className={`
        transition-all duration-700 ease-out cursor-pointer
        transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[rgba(25,25,40,0.95)] dark:focus:ring-offset-[rgba(25,25,40,0.95)] light:focus:ring-offset-[rgba(255,255,255,0.92)] relax:focus:ring-offset-[rgba(255,255,255,0.9)] focus-visible:ring-4
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
            ? 'bg-gradient-to-r from-amber-900/55 via-amber-900/30 to-transparent dark:from-amber-900/55 dark:via-amber-900/30 dark:to-transparent light:from-amber-200/60 light:via-amber-100/40 light:to-transparent relax:from-amber-100/50 relax:via-amber-50/30 relax:to-transparent border-l-[3px] border-amber-400'
            : 'bg-white/[0.08] dark:bg-white/[0.08] light:bg-amber-50/[0.06] relax:bg-amber-50/[0.05] border-l-[3px] border-transparent hover:bg-white/[0.12] dark:hover:bg-white/[0.12] light:hover:bg-amber-100/[0.1] relax:hover:bg-amber-50/[0.08] hover:border-amber-600/30'
          }
        `}
      >
        {/* Action buttons */}
        <div className="absolute top-2 right-2 z-20 flex gap-1">
          {/* Copy button */}
          {onCopy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(5);
                onCopy(`"${quote.text}" — ${quote.author}`);
              }}
              onKeyDown={handleCopyKeyDown}
              tabIndex={0}
              className="p-1.5 rounded-full hover:bg-amber-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus-visible:ring-4"
              aria-label={`Копировать цитату: "${quote.text.substring(0, 30)}${quote.text.length > 30 ? '...' : ''}"`}
              type="button"
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          {/* Share button */}
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(10);
                onShare(quote);
              }}
              onKeyDown={handleShareKeyDown}
              tabIndex={0}
              className="p-1.5 rounded-full hover:bg-amber-500/20 dark:hover:bg-amber-500/20 light:hover:bg-amber-500/15 relax:hover:bg-amber-500/15 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus-visible:ring-4"
              aria-label={`Поделиться цитатой: "${quote.text.substring(0, 30)}${quote.text.length > 30 ? '...' : ''}"`}
              type="button"
            >
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-400 light:text-gray-600 relax:text-gray-600 hover:text-amber-300 light:hover:text-amber-600 relax:hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          )}
          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(isFavorite ? [5, 10, 5] : 10);
              onToggleFavorite(e);
            }}
            onKeyDown={handleFavoriteKeyDown}
            tabIndex={0}
            className="p-1.5 rounded-full hover:bg-amber-500/20 dark:hover:bg-amber-500/20 light:hover:bg-amber-500/15 relax:hover:bg-amber-500/15 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus-visible:ring-4"
            aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
            aria-pressed={isFavorite}
            type="button"
          >
            <svg
              className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400 dark:text-gray-400 light:text-gray-600 relax:text-gray-600 hover:text-amber-300 light:hover:text-amber-600 relax:hover:text-amber-600'}`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <p className={`
          text-sm md:text-[15px] leading-relaxed mb-2 pr-8 relative z-10
          ${isActive ? 'text-amber-50 dark:text-amber-50 light:text-amber-950 relax:text-amber-950' : 'text-gray-200 dark:text-gray-200 light:text-gray-700 relax:text-gray-700'}
          transition-colors duration-400
        `}>
          &ldquo;{safeText}&rdquo;
        </p>
        <div className="flex items-center gap-2 relative z-10">
          <p className={`
            text-xs md:text-sm
            ${isActive ? 'text-amber-300 dark:text-amber-300 light:text-amber-800 relax:text-amber-800' : 'text-gray-400 dark:text-gray-400 light:text-gray-500 relax:text-gray-500'}
            transition-colors duration-400 font-light tracking-wide
          `}>
            — {safeAuthor}
          </p>
          <span className={`
            text-[10px] px-1.5 py-0.5 rounded
            ${isActive ? 'bg-amber-600/30 dark:bg-amber-600/30 light:bg-amber-300/40 relax:bg-amber-200/30 text-amber-200 dark:text-amber-200 light:text-amber-900 relax:text-amber-900' : 'bg-white/5 dark:bg-white/5 light:bg-amber-100/30 relax:bg-amber-50/20 text-gray-500 dark:text-gray-500 light:text-gray-600 relax:text-gray-600'}
            transition-colors duration-400
          `}>
            {safeEra}
          </span>
        </div>
      </div>
    </div>
  );
}
