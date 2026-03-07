"use client";

import { useMemo, useState } from "react";
import { useGamification, type Achievement } from "@/hooks/use-gamification";

interface AchievementBadgeProps {
  achievement: Achievement;
  onShowDetails?: (achievement: Achievement) => void;
}

function AchievementBadge({ achievement, onShowDetails }: AchievementBadgeProps) {
  const handleClick = () => {
    onShowDetails?.(achievement);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative flex flex-col items-center p-3 rounded-lg
        transition-all duration-200 cursor-pointer
        ${achievement.unlocked 
          ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30" 
          : "bg-white/5 border border-white/10 opacity-50"
        }
        hover:scale-105 hover:shadow-lg
      `}
      aria-label={`${achievement.title}: ${achievement.description}`}
      aria-disabled={!achievement.unlocked}
    >
      {/* Иконка */}
      <div className={`
        text-3xl mb-2 transition-all duration-300
        ${achievement.unlocked ? "scale-110" : "grayscale"}
      `}>
        {achievement.icon}
      </div>

      {/* Название */}
      <span className={`
        text-xs font-medium text-center
        ${achievement.unlocked ? "text-white" : "text-white/40"}
      `}>
        {achievement.title}
      </span>

      {/* Прогресс */}
      {!achievement.unlocked && achievement.progress > 0 && (
        <div className="mt-2 w-full">
          <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
            <span>Прогресс</span>
            <span>{achievement.progress}/{achievement.maxProgress}</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500/50 transition-all duration-300"
              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Индикатор разблокировки */}
      {achievement.unlocked && (
        <div className="absolute top-1 right-1">
          <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
}

function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-title"
    >
      <div 
        className={`
          relative max-w-sm w-full p-6 rounded-2xl
          bg-gradient-to-br from-amber-500/20 to-orange-500/20
          border border-amber-500/30
          shadow-2xl shadow-amber-500/20
          animate-in fade-in zoom-in duration-300
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
          aria-label="Закрыть"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Иконка */}
        <div className="text-6xl text-center mb-4">
          {achievement.icon}
        </div>

        {/* Название */}
        <h2 id="achievement-title" className="text-xl font-bold text-center text-white mb-2">
          {achievement.title}
        </h2>

        {/* Описание */}
        <p className="text-white/70 text-center mb-4">
          {achievement.description}
        </p>

        {/* Категория */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${achievement.category === "exploration" ? "bg-blue-500/20 text-blue-400" : ""}
            ${achievement.category === "interaction" ? "bg-green-500/20 text-green-400" : ""}
            ${achievement.category === "knowledge" ? "bg-purple-500/20 text-purple-400" : ""}
            ${achievement.category === "special" ? "bg-amber-500/20 text-amber-400" : ""}
          `}>
            {achievement.category === "exploration" && "🔍 Исследование"}
            {achievement.category === "interaction" && "🎮 Взаимодействие"}
            {achievement.category === "knowledge" && "📚 Знания"}
            {achievement.category === "special" && "⭐ Особое"}
          </span>
        </div>

        {/* Статус */}
        <div className={`
          flex items-center justify-center gap-2 p-3 rounded-lg
          ${achievement.unlocked ? "bg-green-500/20" : "bg-white/5"}
        `}>
          {achievement.unlocked ? (
            <>
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-400 text-sm font-medium">Разблокировано</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-white/40 text-sm font-medium">Заблокировано</span>
            </>
          )}
        </div>

        {/* Прогресс */}
        {!achievement.unlocked && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-white/60 mb-2">
              <span>Прогресс</span>
              <span>{achievement.progress}/{achievement.maxProgress}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface AchievementsPanelProps {
  compact?: boolean;
}

export function AchievementsPanel({ compact }: AchievementsPanelProps) {
  const { achievements, totalUnlocked, completionPercentage } = useGamification();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const achievementsByCategory = useMemo(() => {
    const categories: Record<string, Achievement[]> = {
      exploration: [],
      interaction: [],
      knowledge: [],
      special: [],
    };

    achievements.forEach(ach => {
      categories[ach.category]?.push(ach);
    });

    return categories;
  }, [achievements]);

  if (compact) {
    return (
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Достижения</h3>
          <span className="text-xs text-amber-400">
            {totalUnlocked}/{achievements.length}
          </span>
        </div>
        
        {/* Прогресс */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>Общий прогресс</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Иконки достижений */}
        <div className="flex gap-2 flex-wrap">
          {achievements.slice(0, 6).map(ach => (
            <div
              key={ach.id}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${ach.unlocked 
                  ? "bg-amber-500/20 text-amber-400" 
                  : "bg-white/5 text-white/20"
                }
              `}
              title={`${ach.title}: ${ach.description}`}
            >
              {ach.icon}
            </div>
          ))}
          {achievements.length > 6 && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white/5 text-white/40">
              +{achievements.length - 6}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Достижения</h3>
        <span className="text-sm text-amber-400">
          {totalUnlocked}/{achievements.length}
        </span>
      </div>

      {/* Общий прогресс */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-white/60 mb-2">
          <span>Общий прогресс</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Категории достижений */}
      <div className="space-y-4">
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => {
          if (categoryAchievements.length === 0) return null;

          return (
            <div key={category}>
              <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                {category === "exploration" && "🔍 Исследование"}
                {category === "interaction" && "🎮 Взаимодействие"}
                {category === "knowledge" && "📚 Знания"}
                {category === "special" && "⭐ Особое"}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {categoryAchievements.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    onShowDetails={setSelectedAchievement}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно достижения */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
}
