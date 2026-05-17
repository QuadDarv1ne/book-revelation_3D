"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface AdminStats {
  totalUsers: number
  activeToday: number
  activeThisWeek: number
  totalQuotesRead: number
  totalTimeSpent: number
  averageTimeSpent: number
  totalVisits: number
  topAchievements: Array<{ achievementId: string; unlockCount: number; unlockPercentage: number }>
  popularBooks: Array<{ bookId: string; readCount: number }>
  newUserGrowth: Array<{ date: string; count: number }>
  roleDistribution: Record<string, number>
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}ч ${mins}м`
  return `${mins}м`
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-400">Загрузка статистики...</div>
  }

  if (!stats) {
    return <div className="text-red-400">Не удалось загрузить статистику</div>
  }

  const statCards = [
    { label: "Всего студентов", value: stats.totalUsers, icon: "👥" },
    { label: "Активны сегодня", value: stats.activeToday, icon: "🟢" },
    { label: "Активны за неделю", value: stats.activeThisWeek, icon: "📅" },
    { label: "Прочитано цитат", value: stats.totalQuotesRead.toLocaleString(), icon: "📖" },
    { label: "Время в приложении", value: formatTime(stats.totalTimeSpent), icon: "⏱" },
    { label: "Среднее время", value: formatTime(stats.averageTimeSpent), icon: "⏰" },
    { label: "Всего посещений", value: stats.totalVisits.toLocaleString(), icon: "🔁" },
    { label: "Администраторы", value: stats.roleDistribution.ADMIN || 0, icon: "🛡" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-light text-amber-100 mb-2">Дашборд</h2>
        <p className="text-gray-400">Общая статистика платформы</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="text-2xl font-semibold text-amber-100">{card.value}</div>
            <div className="text-sm text-gray-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Books */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-medium text-amber-100 mb-4">Популярные книги</h3>
          {stats.popularBooks.length === 0 ? (
            <p className="text-gray-500">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {stats.popularBooks.map((book, i) => (
                <div key={book.bookId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-mono w-6">#{i + 1}</span>
                    <span className="text-gray-300">{book.bookId}</span>
                  </div>
                  <span className="text-amber-400 font-medium">{book.readCount} прочтений</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Achievements */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-medium text-amber-100 mb-4">Топ достижения</h3>
          {stats.topAchievements.length === 0 ? (
            <p className="text-gray-500">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {stats.topAchievements.slice(0, 8).map(ach => (
                <div key={ach.achievementId} className="flex items-center justify-between">
                  <span className="text-gray-300">{ach.achievementId}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{ach.unlockCount} разблокировок</span>
                    <span className="text-amber-400 font-medium">{ach.unlockPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New User Growth */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-medium text-amber-100 mb-4">Рост пользователей (30 дней)</h3>
        {stats.newUserGrowth.length === 0 ? (
          <p className="text-gray-500">Нет данных</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {stats.newUserGrowth.map((day, i) => {
              const maxCount = Math.max(...stats.newUserGrowth.map(d => d.count), 1)
              const height = Math.max((day.count / maxCount) * 100, 4)
              return (
                <div
                  key={day.date}
                  className="flex-1 bg-amber-600/40 hover:bg-amber-500/60 transition-colors rounded-t-sm relative group"
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.count} пользователей`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 rounded text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {day.date}: {day.count}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
