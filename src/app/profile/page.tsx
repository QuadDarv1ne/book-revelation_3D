"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}ч ${mins}м`
  return `${mins}м`
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [achievements, setAchievements] = useState<Array<{ achievementId: string; progress: number; unlocked: boolean }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/user/statistics").then(r => r.json()),
      fetch("/api/user/achievements").then(r => r.json()),
    ]).then(([statsData, achData]) => {
      setStats(statsData)
      setAchievements(achData.achievements || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-400">Загрузка...</div>
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length || 31
  const completionPercent = Math.round((unlockedCount / totalAchievements) * 100)

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-light text-amber-100">
          Привет, {session?.user?.name || "Студент"}!
        </h2>
        <p className="text-gray-400 mt-1">Ваш прогресс в изучении стоической философии</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Время в приложении", value: formatTime(stats?.timeSpent as number || 0), icon: "⏱" },
          { label: "Цитат прочитано", value: stats?.quotesRead || 0, icon: "📖" },
          { label: "Посещений", value: stats?.totalVisits || 0, icon: "🔁" },
          { label: "Достижения", value: `${unlockedCount}/${totalAchievements}`, icon: "🏆" },
        ].map(item => (
          <div key={item.label} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <span className="text-2xl">{item.icon}</span>
            <div className="text-2xl font-semibold text-amber-100 mt-2">{String(item.value)}</div>
            <div className="text-sm text-gray-400 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Achievement Progress Bar */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-amber-100">Прогресс достижений</h3>
          <span className="text-amber-400 font-medium">{completionPercent}%</span>
        </div>
        <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-600 to-yellow-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Разблокировано {unlockedCount} из {totalAchievements} достижений
        </p>
      </div>

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Активность</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ротации книги</span>
                <span className="text-amber-100">{(stats.rotations as number) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Книг просмотрено</span>
                <span className="text-amber-100">{(stats.booksViewed as string[])?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Тем изучено</span>
                <span className="text-amber-100">{(stats.themesExplored as string[])?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Первый визит</span>
                <span className="text-amber-100">
                  {stats.firstVisitDate ? new Date(stats.firstVisitDate as string).toLocaleDateString("ru-RU") : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Серия посещений</h4>
            <div className="text-4xl font-bold text-amber-100">
              {(stats.visitHistory as string[])?.length || 0}
            </div>
            <p className="text-sm text-gray-400 mt-1">дней в приложении</p>
          </div>
        </div>
      )}

      {/* Book Progress */}
      {stats && (stats.bookQuotesRead as Record<string, number>) && Object.keys(stats.bookQuotesRead as Record<string, number>).length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-medium text-amber-100 mb-4">Прогресс чтения по книгам</h3>
          <div className="space-y-3">
            {Object.entries(stats.bookQuotesRead as Record<string, number>).map(([bookId, count]) => (
              <div key={bookId} className="flex items-center gap-4">
                <span className="text-sm text-gray-300 w-40 truncate">{bookId}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: `${Math.min((count / 8) * 100, 100)}%` }} />
                </div>
                <span className="text-sm text-amber-400 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
