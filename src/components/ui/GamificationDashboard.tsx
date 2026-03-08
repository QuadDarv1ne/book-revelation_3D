"use client";

import { useMemo } from "react";
import { useGamification } from "@/hooks/use-gamification";
import { useI18n } from "@/hooks/use-i18n";
import { DailyChallenge } from "./DailyChallenge";

interface IconProps {
  className?: string;
}

function Trophy({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}

function Clock({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function Book({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M4 22h16"/>
    </svg>
  );
}

function Heart({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}

function Flame({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}

function Star({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function Palette({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  );
}

function RotateCw({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
    </svg>
  );
}

function Eye({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

interface StatCardProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

function StatCard({ icon: Icon, label, value, subValue, color = "text-amber-400" }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors">
      <div className={`p-2 rounded-lg bg-amber-500/10 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-amber-100/60">{label}</div>
        <div className="text-lg font-semibold text-amber-100">{value}</div>
        {subValue && <div className="text-[10px] text-amber-400/50">{subValue}</div>}
      </div>
    </div>
  );
}

interface AchievementBadgeProps {
  achievement: import("@/hooks/use-gamification").Achievement;
}

function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const categoryColors = {
    exploration: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    interaction: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    knowledge: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
    special: "from-red-500/20 to-orange-500/20 border-red-500/30",
  };

  const progressPercent = Math.round((achievement.progress / achievement.maxProgress) * 100);

  return (
    <div
      className={`relative p-3 rounded-xl border bg-gradient-to-br ${categoryColors[achievement.category]} ${
        achievement.unlocked ? "opacity-100" : "opacity-60"
      } transition-all hover:opacity-100`}
      title={`${achievement.title}: ${achievement.description}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{achievement.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-amber-100 truncate">{achievement.title}</div>
          <div className="text-[10px] text-amber-400/60 truncate">{achievement.description}</div>
        </div>
      </div>
      
      {achievement.unlocked ? (
        <div className="flex items-center gap-1 text-[10px] text-green-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Разблокировано</span>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-amber-400/60 text-right">
            {achievement.progress}/{achievement.maxProgress}
          </div>
        </div>
      )}
    </div>
  );
}

interface GamificationDashboardProps {
  onClose?: () => void;
}

export function GamificationDashboard({ onClose }: GamificationDashboardProps) {
  const { achievements, stats, showAchievement, dismissAchievement } = useGamification();
  const { t } = useI18n();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  };

  const sortedAchievements = useMemo(() => {
    return [...achievements].sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return 0;
    });
  }, [achievements]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] border border-amber-500/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-gradient-to-b from-[#0f0f1a] to-transparent border-amber-500/20">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-semibold text-amber-100">Прогресс</h2>
              <p className="text-xs text-amber-400/60">
                {stats.totalUnlocked} из {stats.totalAchievements} достижений
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-amber-400/60 rounded-lg hover:text-amber-300 hover:bg-amber-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Закрыть"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notification о новом достижении */}
        {showAchievement && (
          <div className="p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{showAchievement.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-amber-100">🎉 Достижение разблокировано!</div>
                <div className="text-xs text-amber-400/80">{showAchievement.title}</div>
              </div>
              <button
                onClick={dismissAchievement}
                className="px-3 py-1.5 text-xs text-amber-100 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
                type="button"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        {/* Daily Challenge */}
        <div className="p-4 border-b border-amber-500/20">
          <DailyChallenge />
        </div>

        {/* Progress bar */}
        <div className="p-4 border-b border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-amber-100/80">Общий прогресс</span>
            <span className="text-sm font-semibold text-amber-400">{stats.completionPercentage}%</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-4">
          <h3 className="mb-3 text-sm font-medium text-amber-100/80">Статистика</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              icon={Flame}
              label="Серия дней"
              value={stats.streakDays}
              subValue="дней подряд"
              color="text-orange-400"
            />
            <StatCard
              icon={Book}
              label="Книги"
              value={stats.booksViewed}
              subValue="из 5 книг"
              color="text-blue-400"
            />
            <StatCard
              icon={Eye}
              label="Прочитано цитат"
              value={stats.quotesRead}
              color="text-green-400"
            />
            <StatCard
              icon={Heart}
              label="Избранное"
              value={stats.quotesLiked}
              color="text-pink-400"
            />
            <StatCard
              icon={RotateCw}
              label="Вращения"
              value={stats.totalRotations}
              color="text-cyan-400"
            />
            <StatCard
              icon={Palette}
              label="Темы"
              value={stats.themesExplored}
              subValue="из 8 тем"
              color="text-purple-400"
            />
            <StatCard
              icon={Clock}
              label="Время в приложении"
              value={formatTime(stats.totalTimeSeconds)}
              color="text-amber-400"
            />
            <StatCard
              icon={Star}
              label="Первый визит"
              value={formatDate(stats.firstVisitDate)}
              color="text-yellow-400"
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-4 border-t border-amber-500/20">
          <h3 className="mb-3 text-sm font-medium text-amber-100/80">Достижения</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedAchievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
