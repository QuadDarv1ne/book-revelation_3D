"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface UserDetail {
  user: {
    id: string
    email: string
    name: string | null
    role: string
    createdAt: string
    lastLoginAt: string | null
  }
  statistics: {
    timeSpent: number
    quotesRead: number
    rotations: number
    totalVisits: number
    lastVisitDate: string
    firstVisitDate: string
    visitHistory: string[]
    booksViewed: string[]
    themesExplored: string[]
    bookQuotesRead: Record<string, number>
    categoryReads: Record<string, number>
  } | null
  achievements: Array<{
    achievementId: string
    progress: number
    unlocked: boolean
    unlockedAt: string | null
  }>
  favoritesCount: number
  recentSessions: Array<{
    id: string
    sessionId: string
    startTime: string
    endTime: string | null
    durationSeconds: number
  }>
  analyticsSummary: Record<string, number>
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}ч ${mins}м`
  return `${mins}м`
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/users/${params.id}`)
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return <div className="text-gray-400">Загрузка...</div>
  }

  if (!data) {
    return <div className="text-red-400">Пользователь не найден</div>
  }

  const { user, statistics, achievements, favoritesCount, recentSessions } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/users" className="text-gray-500 hover:text-gray-300 text-sm">← Назад</Link>
          </div>
          <h2 className="text-2xl font-light text-amber-100 mt-2">
            {user.name || user.email}
          </h2>
          <p className="text-gray-400 text-sm">
            {user.email} • Регистрация: {new Date(user.createdAt).toLocaleDateString("ru-RU")}
            {user.lastLoginAt && ` • Последний вход: ${new Date(user.lastLoginAt).toLocaleDateString("ru-RU")}`}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm ${
          user.role === "ADMIN" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
        }`}>
          {user.role === "ADMIN" ? "Администратор" : "Студент"}
        </span>
      </div>

      {/* Stats */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Время", value: formatTime(statistics.timeSpent) },
            { label: "Цитаты", value: statistics.quotesRead },
            { label: "Посещения", value: statistics.totalVisits },
            { label: "Ротации", value: statistics.rotations },
            { label: "Книги", value: statistics.booksViewed.length },
            { label: "Темы", value: statistics.themesExplored.length },
            { label: "Избранное", value: favoritesCount },
            { label: "Серия", value: statistics.visitHistory.length + " дней" },
          ].map(item => (
            <div key={item.label} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <div className="text-2xl font-semibold text-amber-100">{item.value}</div>
              <div className="text-sm text-gray-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Book Progress */}
      {statistics && Object.keys(statistics.bookQuotesRead).length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-medium text-amber-100 mb-4">Прогресс по книгам</h3>
          <div className="space-y-3">
            {Object.entries(statistics.bookQuotesRead).map(([bookId, count]) => (
              <div key={bookId} className="flex items-center gap-4">
                <span className="text-sm text-gray-300 w-48 truncate">{bookId}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: `${Math.min((count / 8) * 100, 100)}%` }} />
                </div>
                <span className="text-sm text-amber-400 w-16 text-right">{count}/8</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Progress */}
      {statistics && Object.keys(statistics.categoryReads).length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-medium text-amber-100 mb-4">Прогресс по категориям</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(statistics.categoryReads).map(([cat, count]) => (
              <div key={cat} className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-amber-100 font-medium">{cat}</div>
                <div className="text-sm text-gray-400">{count} прочтений</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-medium text-amber-100 mb-4">
            Достижения ({achievements.filter(a => a.unlocked).length}/{achievements.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map(ach => (
              <div key={ach.achievementId} className={`rounded-lg p-3 border ${
                ach.unlocked
                  ? "bg-amber-600/10 border-amber-500/30"
                  : "bg-gray-700/20 border-gray-700/30"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={ach.unlocked ? "text-amber-100" : "text-gray-500"}>
                    {ach.achievementId}
                  </span>
                  {ach.unlocked && <span className="text-amber-400 text-sm">✓</span>}
                </div>
                <div className="mt-2 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ach.unlocked ? "bg-amber-500" : "bg-amber-600/30"}`}
                    style={{ width: `${ach.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{ach.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-medium text-amber-100 mb-4">Последние сессии</h3>
          <div className="space-y-2">
            {recentSessions.slice(0, 10).map(s => (
              <div key={s.id} className="flex items-center justify-between text-sm bg-gray-700/20 rounded-lg px-4 py-2">
                <span className="text-gray-400 font-mono text-xs">{s.sessionId}</span>
                <span className="text-gray-500">{new Date(s.startTime).toLocaleDateString("ru-RU")}</span>
                <span className="text-amber-400">{formatTime(s.durationSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Summary */}
      {data.analyticsSummary && Object.keys(data.analyticsSummary).length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-medium text-amber-100 mb-4">Аналитика</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(data.analyticsSummary).map(([cat, count]) => (
              <div key={cat} className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-amber-100 font-medium">{cat}</div>
                <div className="text-sm text-gray-400">{count} событий</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
