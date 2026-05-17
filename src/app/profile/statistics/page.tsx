"use client"

import { useState, useEffect } from "react"

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}ч ${mins}м`
}

// Simple calendar heatmap component
function VisitHeatmap({ dates }: { dates: string[] }) {
  const days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (89 - i))
    return d.toISOString().split("T")[0]
  })

  const dateSet = new Set(dates)

  return (
    <div className="flex flex-wrap gap-0.5">
      {days.map(day => (
        <div
          key={day}
          className={`w-3 h-3 rounded-sm ${dateSet.has(day) ? "bg-amber-500" : "bg-gray-800"}`}
          title={`${day}: ${dateSet.has(day) ? "активен" : "—"}`}
        />
      ))}
    </div>
  )
}

export default function ProfileStatisticsPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/user/statistics")
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-400">Загрузка...</div>
  if (!stats) return <div className="text-red-400">Не удалось загрузить статистику</div>

  const bookQuotesRead = (stats.bookQuotesRead as Record<string, number>) || {}
  const categoryReads = (stats.categoryReads as Record<string, number>) || {}
  const visitHistory = (stats.visitHistory as string[]) || []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-light text-amber-100 mb-1">Статистика</h2>
        <p className="text-gray-400">Детальная аналитика вашего прогресса</p>
      </div>

      {/* Time Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
          <div className="text-sm text-gray-400">Общее время</div>
          <div className="text-3xl font-semibold text-amber-100 mt-1">{formatTime((stats.timeSpent as number) || 0)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
          <div className="text-sm text-gray-400">Цитат прочитано</div>
          <div className="text-3xl font-semibold text-amber-100 mt-1">{String(stats.quotesRead || 0)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
          <div className="text-sm text-gray-400">Всего посещений</div>
          <div className="text-3xl font-semibold text-amber-100 mt-1">{String(stats.totalVisits || 0)}</div>
        </div>
      </div>

      {/* Visit Heatmap */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-medium text-amber-100 mb-4">Календарь посещений (90 дней)</h3>
        {visitHistory.length === 0 ? (
          <p className="text-gray-500">Нет данных</p>
        ) : (
          <>
            <VisitHeatmap dates={visitHistory} />
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <div className="w-3 h-3 rounded-sm bg-gray-800" /> Нет активности
              <div className="w-3 h-3 rounded-sm bg-amber-500" /> Активен
            </div>
          </>
        )}
      </div>

      {/* Book Progress */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-medium text-amber-100 mb-4">Прогресс по книгам</h3>
        {Object.keys(bookQuotesRead).length === 0 ? (
          <p className="text-gray-500">Вы ещё не читали цитаты из книг</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(bookQuotesRead).map(([bookId, count]) => (
              <div key={bookId} className="flex items-center gap-4">
                <span className="text-sm text-gray-300 w-48 truncate">{bookId}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full transition-all" style={{ width: `${Math.min((count / 8) * 100, 100)}%` }} />
                </div>
                <span className="text-sm text-amber-400 w-16 text-right">{count}/8</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Progress */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-medium text-amber-100 mb-4">Прогресс по категориям</h3>
        {Object.keys(categoryReads).length === 0 ? (
          <p className="text-gray-500">Нет данных по категориям</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(categoryReads).map(([cat, count]) => (
              <div key={cat} className="bg-gray-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-semibold text-amber-100">{count as number}</div>
                <div className="text-sm text-gray-400 mt-1">{cat}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Взаимодействие</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Ротации</span>
              <span className="text-amber-100">{String(stats.rotations || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Книг просмотрено</span>
              <span className="text-amber-100">{(stats.booksViewed as string[])?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Тем изучено</span>
              <span className="text-amber-100">{(stats.themesExplored as string[])?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
          <h4 className="text-sm font-medium text-gray-400 mb-3">История</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Первый визит</span>
              <span className="text-amber-100">
                {stats.firstVisitDate ? new Date(stats.firstVisitDate as string).toLocaleDateString("ru-RU") : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Последний визит</span>
              <span className="text-amber-100">
                {stats.lastVisitDate ? new Date(stats.lastVisitDate as string).toLocaleDateString("ru-RU") : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Дней активности</span>
              <span className="text-amber-100">{visitHistory.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
