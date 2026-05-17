"use client"

import { useState, useEffect } from "react"

export default function ProfileAchievementsPage() {
  const [achievements, setAchievements] = useState<Array<{
    achievementId: string
    progress: number
    unlocked: boolean
    unlockedAt: string | null
  }>>([])
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/user/achievements")
      .then(r => r.json())
      .then(data => { setAchievements(data.achievements || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = achievements.filter(a => {
    if (filter === "unlocked") return a.unlocked
    if (filter === "locked") return !a.unlocked
    return true
  })

  if (loading) return <div className="text-gray-400">Загрузка...</div>

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-amber-100 mb-1">Достижения</h2>
          <p className="text-gray-400">
            Разблокировано: {unlockedCount} из {achievements.length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "unlocked", "locked"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f
                ? "bg-amber-600/20 text-amber-400"
                : "bg-gray-800 text-gray-400 hover:text-amber-300"
            }`}
          >
            {f === "all" ? "Все" : f === "unlocked" ? "Разблокированные" : "Заблокированные"}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {filtered.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">
          {filter === "unlocked" ? "Пока нет разблокированных достижений" : "Нет достижений"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ach => (
            <div
              key={ach.achievementId}
              className={`rounded-xl border p-5 transition-all ${
                ach.unlocked
                  ? "bg-amber-600/10 border-amber-500/30"
                  : "bg-gray-800/30 border-gray-700/30"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-lg font-medium ${ach.unlocked ? "text-amber-100" : "text-gray-500"}`}>
                  {ach.achievementId}
                </span>
                {ach.unlocked && <span className="text-amber-400">✓</span>}
              </div>

              {/* Progress */}
              <div className="bg-gray-700 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${ach.unlocked ? "bg-amber-500" : "bg-amber-600/30"}`}
                  style={{ width: `${Math.min(ach.progress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Прогресс</span>
                <span className="text-amber-400">{ach.progress}%</span>
              </div>

              {ach.unlockedAt && (
                <div className="text-xs text-gray-500 mt-2">
                  Разблокировано: {new Date(ach.unlockedAt).toLocaleDateString("ru-RU")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
