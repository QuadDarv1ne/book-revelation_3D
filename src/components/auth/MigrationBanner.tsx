"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/Toast"

export function MigrationBanner() {
  const { data: session, status } = useSession()
  const { showToast } = useToast()
  const [show, setShow] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && !dismissed) {
      const settings = localStorage.getItem("user-settings")
      if (settings) {
        setShow(true)
      }
    }
  }, [status, dismissed])

  const handleMigrate = useCallback(async () => {
    setMigrating(true)

    const keys = ["user-settings", "session_tracking", "analytics_events", "quote-of-day", "theme-of-day"]
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("category_")) keys.push(key)
    }

    const data: Record<string, unknown> = {}
    for (const key of keys) {
      const val = localStorage.getItem(key)
      if (val) {
        try { data[key] = JSON.parse(val) } catch { data[key] = val }
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
        showToast(
          `Данные перенесены! Достижения: ${result.migrated.achievements}, Избранное: ${result.migrated.favorites}`,
          "success"
        )
        setShow(false)
      } else {
        showToast("Ошибка миграции: " + (result.error || ""), "error")
      }
    } catch {
      showToast("Ошибка сети", "error")
    } finally {
      setMigrating(false)
    }
  }, [showToast])

  const handleDismiss = useCallback(() => {
    setShow(false)
    setDismissed(true)
  }, [])

  if (!show || status !== "authenticated") return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-gray-800 border border-amber-500/30 rounded-xl shadow-2xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">📦</span>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-100">Найден локальный прогресс</h4>
          <p className="text-xs text-gray-400 mt-1">
            У вас есть данные в этом браузере. Перенесите их в свой аккаунт, чтобы не потерять прогресс.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs transition-colors disabled:opacity-50"
            >
              {migrating ? "Перенос..." : "Перенести"}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs transition-colors"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
