"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name || "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<string>("")
  const [hasLocalData, setHasLocalData] = useState(false)

  useEffect(() => {
    // Check if localStorage has data to migrate
    const settings = localStorage.getItem("user-settings")
    setHasLocalData(!!settings)
  }, [])

  const handleSaveName = useCallback(async () => {
    setSaving(true)
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      await update({ name })
      setMessage("Имя сохранено")
      setTimeout(() => setMessage(""), 3000)
    } catch {
      setMessage("Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }, [name, update])

  const handleMigrate = useCallback(async () => {
    setMigrating(true)
    setMigrationResult("")

    const keys = [
      "user-settings",
      "session_tracking",
      "analytics_events",
      "quote-of-day",
      "theme-of-day",
    ]

    // Collect category keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("category_")) keys.push(key)
    }

    const data: Record<string, unknown> = {}
    for (const key of keys) {
      const val = localStorage.getItem(key)
      if (val) {
        try {
          data[key] = JSON.parse(val)
        } catch {
          data[key] = val
        }
      }
    }

    try {
      const res = await fetch("/api/user/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localStorageData: data }),
      })
      const result = await res.json()

      if (result.success) {
        setMigrationResult(
          `Миграция завершена! Статистика: ${result.migrated.statistics}, ` +
          `Достижения: ${result.migrated.achievements}, ` +
          `Избранное: ${result.migrated.favorites}, ` +
          `Сессии: ${result.migrated.sessions}`
        )
        setHasLocalData(false)
      } else {
        setMigrationResult("Ошибка: " + (result.error || "Неизвестная ошибка"))
      }
    } catch {
      setMigrationResult("Ошибка сети")
    } finally {
      setMigrating(false)
    }
  }, [])

  const handleExportData = useCallback(async () => {
    const [profile, stats, favs] = await Promise.all([
      fetch("/api/user/profile").then(r => r.json()),
      fetch("/api/user/statistics").then(r => r.json()),
      fetch("/api/user/favorites?limit=1000").then(r => r.json()),
    ])

    const data = { profile, statistics: stats, favorites: favs.favorites || [] }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "my-data.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-light text-amber-100 mb-1">Настройки</h2>
        <p className="text-gray-400">Управление аккаунтом и данными</p>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          {message}
        </div>
      )}

      {/* Profile Info */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-medium text-amber-100 mb-4">Профиль</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <div className="text-gray-200">{session?.user?.email}</div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Имя</label>
            <div className="flex gap-2">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50 text-sm"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Роль</label>
            <div className="text-gray-200">
              <span className={`px-2 py-0.5 rounded text-sm ${
                session?.user?.role === "ADMIN"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
              }`}>
                {session?.user?.role === "ADMIN" ? "Администратор" : "Студент"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Migration */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-medium text-amber-100 mb-2">Миграция данных</h3>
        <p className="text-sm text-gray-400 mb-4">
          {hasLocalData
            ? "Обнаружены локальные данные. Перенесите свой прогресс в аккаунт."
            : "Локальных данных не найдено"}
        </p>
        <button
          onClick={handleMigrate}
          disabled={migrating || !hasLocalData}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {migrating ? "Миграция..." : "Перенести данные из браузера"}
        </button>
        {migrationResult && (
          <p className="mt-3 text-sm text-amber-400">{migrationResult}</p>
        )}
      </div>

      {/* Data Export */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-medium text-amber-100 mb-2">Экспорт данных</h3>
        <p className="text-sm text-gray-400 mb-4">Скачайте все свои данные в формате JSON</p>
        <button
          onClick={handleExportData}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors text-sm"
        >
          Скачать мои данные
        </button>
      </div>

      {/* Sign Out */}
      <div className="bg-gray-800/50 rounded-xl border border-red-500/20 p-6">
        <h3 className="text-lg font-medium text-red-400 mb-2">Выход</h3>
        <p className="text-sm text-gray-400 mb-4">Выйти из аккаунта</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors text-sm"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
