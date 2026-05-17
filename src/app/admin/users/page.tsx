"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  lastLoginAt: string | null
  stats: {
    quotesRead: number
    timeSpent: number
    totalVisits: number
    lastVisitDate: string
  } | null
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}ч ${mins}м`
  return `${mins}м`
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "50" })
    if (search) params.set("search", search)

    fetch(`/api/admin/users?${params}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-amber-100 mb-1">Студенты</h2>
          <p className="text-gray-400">Всего: {total}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Поиск по email или имени..."
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-gray-400 py-8 text-center">Загрузка...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">Студенты не найдены</div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Имя</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Роль</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Цитаты</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Время</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Последний вход</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{user.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      user.role === "ADMIN"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}>
                      {user.role === "ADMIN" ? "Админ" : "Студент"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{user.stats?.quotesRead || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{formatTime(user.stats?.timeSpent || 0)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("ru-RU") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
                    >
                      Подробнее →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Назад
          </button>
          <span className="text-gray-400 text-sm px-4">
            Страница {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  )
}
