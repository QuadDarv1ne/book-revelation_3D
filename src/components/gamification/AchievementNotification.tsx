"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useGamification } from "@/hooks/use-gamification";

export function AchievementNotification() {
  const { showAchievement, dismissAchievement } = useGamification();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!showAchievement || hasShownRef.current) return;
    
    hasShownRef.current = true;
    setIsVisible(true);

    timerRef.current = setTimeout(() => {
      setIsLeaving(true);
      leaveTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsLeaving(false);
        hasShownRef.current = false;
        dismissAchievement();
      }, 300);
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, [dismissAchievement, showAchievement]);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    leaveTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      dismissAchievement();
    }, 300);
  }, [dismissAchievement]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClose();
    }
  }, [handleClose]);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  if (!isVisible || !showAchievement) return null;

  return (
    <div 
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        transition-all duration-300
        ${isLeaving ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}
      `}
      role="alert"
      aria-live="polite"
    >
      <div 
        className={`
          flex items-center gap-3 px-4 py-3
          bg-gradient-to-r from-amber-500/90 to-orange-500/90
          backdrop-blur-sm rounded-xl
          border border-amber-400/30
          shadow-2xl shadow-amber-500/30
          min-w-[300px] max-w-md
        `}
      >
        {/* Иконка достижения */}
        <div className="text-3xl animate-bounce">
          {showAchievement.icon}
        </div>

        {/* Текст */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-amber-100 uppercase tracking-wider">
            Достижение разблокировано!
          </p>
          <h4 className="text-sm font-semibold text-white truncate">
            {showAchievement.title}
          </h4>
          <p className="text-xs text-amber-100/80 truncate">
            {showAchievement.description}
          </p>
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          className="flex-shrink-0 p-1 text-amber-100/60 hover:text-white transition-colors"
          aria-label="Закрыть уведомление"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Прогресс-бар времени */}
      <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
        <div 
          className={`
            h-full bg-white/80 rounded-full
            ${isLeaving ? "w-0" : "w-full"}
            transition-all duration-[4000ms] ease-linear
          `}
        />
      </div>
    </div>
  );
}
