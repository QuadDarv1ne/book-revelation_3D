"use client";

import { useState, useCallback } from "react";
import { useGamification } from "@/hooks/use-gamification";

interface QuoteOfDayCardProps {
  onLike?: (liked: boolean) => void;
}

export function QuoteOfDayCard({ onLike }: QuoteOfDayCardProps) {
  const { quoteOfDay, toggleQuoteLike } = useGamification();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = useCallback(() => {
    toggleQuoteLike();
    onLike?.(!quoteOfDay.liked);
  }, [quoteOfDay.liked, toggleQuoteLike, onLike]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLike();
    }
  }, [handleLike]);

  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl 
        bg-gradient-to-br from-amber-500/10 to-orange-500/10
        border border-amber-500/20
        transition-all duration-300
        ${isExpanded ? "scale-105 shadow-lg shadow-amber-500/10" : ""}
      `}
    >
      {/* Декоративный элемент */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
      
      <div className="relative p-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h3 className="text-sm font-semibold text-amber-400">Цитата дня</h3>
          </div>
          <span className="text-xs text-white/40">
            {new Date(quoteOfDay.date).toLocaleDateString("ru-RU", { 
              day: "numeric", 
              month: "long" 
            })}
          </span>
        </div>

        {/* Цитата */}
        <blockquote className={`
          transition-all duration-300
          ${isExpanded ? "text-base" : "text-sm"}
        `}>
          <p className="text-white/90 leading-relaxed mb-2">
            {isExpanded || quoteOfDay.quote.length < 100 
              ? quoteOfDay.quote 
              : quoteOfDay.quote.slice(0, 100) + "..."
            }
          </p>
          {quoteOfDay.quote.length >= 100 && (
            <button
              onClick={handleExpand}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              {isExpanded ? "Свернуть" : "Читать далее"}
            </button>
          )}
        </blockquote>

        {/* Автор */}
        <footer className="mt-3 flex items-center justify-between">
          <cite className="text-sm text-amber-300/80 not-italic">
            — {quoteOfDay.author}
          </cite>

          {/* Кнопка лайка */}
          <button
            onClick={handleLike}
            onKeyDown={handleKeyDown}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full
              transition-all duration-200
              ${quoteOfDay.liked 
                ? "bg-amber-500/20 text-amber-400" 
                : "bg-white/5 text-white/60 hover:bg-white/10"
              }
            `}
            aria-pressed={quoteOfDay.liked}
            aria-label={quoteOfDay.liked ? "Убрать лайк" : "Лайкнуть цитату"}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${quoteOfDay.liked ? "scale-110" : ""}`}
              fill={quoteOfDay.liked ? "currentColor" : "none"} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <span className="text-xs">
              {quoteOfDay.liked ? "Нравится" : "Лайк"}
            </span>
          </button>
        </footer>

        {/* Прогресс изучения цитат */}
        <div className="mt-3 pt-3 border-t border-amber-500/10">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>Прогресс изучения</span>
            <span>День {getDayOfYear()}</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${(getDayOfYear() / 365) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
