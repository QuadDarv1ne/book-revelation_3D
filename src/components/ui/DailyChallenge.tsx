"use client";

import { useMemo, useState, useCallback } from "react";
import { useGamification } from "@/hooks/use-gamification";
import { useToast } from "./Toast";

interface IconProps {
  className?: string;
}

function Sun({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  );
}

function Heart({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}

function Share({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>
    </svg>
  );
}

function Copy({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  );
}

export function DailyChallenge() {
  const { quoteOfDay, toggleQuoteLike, themeOfDay, completeThemeChallenge } = useGamification();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(quoteOfDay.liked);

  const handleLike = useCallback(() => {
    setIsLiked(prev => !prev);
    toggleQuoteLike();
    showToast(isLiked ? "Удалено из избранного" : "Добавлено в избранное", isLiked ? "info" : "success");
  }, [isLiked, toggleQuoteLike, showToast]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "Цитата дня — Book Revelation 3D",
      text: `"${quoteOfDay.quote}" — ${quoteOfDay.author}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast("Поделено!", "success");
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        showToast("Скопировано в буфер", "success");
      }
    } catch {
      showToast("Не удалось поделиться", "error");
    }
  }, [quoteOfDay, showToast]);

  const formatDate = useMemo(() => {
    return new Date(quoteOfDay.date).toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, [quoteOfDay.date]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/20 via-yellow-600/10 to-orange-600/20 border border-amber-500/30 p-5 md:p-6">
      {/* Фоновый декоративный элемент */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
          <Sun className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-100">Цитата дня</h3>
          <p className="text-xs text-amber-400/60">{formatDate}</p>
        </div>
      </div>

      {/* Цитата */}
      <blockquote className="relative mb-4">
        <p className="text-base md:text-lg text-amber-50 leading-relaxed">
          {quoteOfDay.quote}
        </p>
        <footer className="mt-3 text-sm text-amber-400/80">
          — {quoteOfDay.author}
        </footer>
      </blockquote>

      {/* Theme of the Day Challenge */}
      <div className="relative mb-4 p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎨</span>
          <span className="text-xs font-semibold text-amber-100">Испытание: Тема дня</span>
        </div>
        <div className="text-xs text-amber-100/80 mb-1">
          <strong>{themeOfDay.themeName}</strong> — {themeOfDay.description}
        </div>
        {themeOfDay.completed ? (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Выполнено!</span>
          </div>
        ) : (
          <button
            onClick={() => {
              completeThemeChallenge();
              showToast(`Тема "${themeOfDay.themeName}" активирована! Испытание выполнено.`, "success");
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
            type="button"
          >
            Активировать тему
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="relative flex items-center gap-2 pt-4 border-t border-amber-500/20">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            isLiked
              ? "bg-amber-500/20 text-amber-300"
              : "bg-white/5 text-gray-400 hover:text-amber-300 hover:bg-white/10"
          }`}
          aria-label={isLiked ? "Удалить из избранного" : "Добавить в избранное"}
          type="button"
        >
          <Heart className="w-4 h-4" filled={isLiked} />
          <span className="text-xs">{isLiked ? "В избранном" : "В избранное"}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-amber-300 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label="Поделиться"
          type="button"
        >
          <Share className="w-4 h-4" />
          <span className="text-xs">Поделиться</span>
        </button>

        <button
          onClick={async () => {
            await navigator.clipboard.writeText(quoteOfDay.quote);
            showToast("Скопировано", "success");
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-amber-300 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label="Копировать цитату"
          type="button"
        >
          <Copy className="w-4 h-4" />
          <span className="text-xs">Копия</span>
        </button>
      </div>
    </div>
  );
}
