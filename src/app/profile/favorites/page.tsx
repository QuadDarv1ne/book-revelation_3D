"use client"

import { useState, useEffect, useCallback } from "react"

interface Favorite {
  id: string
  quoteText: string
  quoteAuthor: string
  quoteEra: string | null
  quoteCategory: string | null
  quoteBookId: string | null
  createdAt: string
}

export default function ProfileFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchFavorites = useCallback(() => {
    setLoading(true)
    fetch(`/api/user/favorites?page=${page}&limit=20`)
      .then(r => r.json())
      .then(data => {
        setFavorites(data.favorites || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page])

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  const handleDelete = useCallback(async (quoteText: string) => {
    await fetch("/api/user/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteText }),
    })
    fetchFavorites()
  }, [fetchFavorites])

  const handleExport = useCallback(() => {
    const data = JSON.stringify(favorites, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "favorites.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [favorites])

  const filtered = search
    ? favorites.filter(f =>
        f.quoteText.toLowerCase().includes(search.toLowerCase()) ||
        f.quoteAuthor.toLowerCase().includes(search.toLowerCase())
      )
    : favorites

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-amber-100 mb-1">Избранное</h2>
          <p className="text-gray-400">Всего: {total} цитат</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition-colors text-sm"
        >
          Экспорт
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по тексту или автору..."
        className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />

      {/* Favorites List */}
      {loading ? (
        <div className="text-gray-400 py-8 text-center">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">
          {search ? "Ничего не найдено" : "У вас пока нет избранных цитат"}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <div key={f.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-200 italic leading-relaxed">&ldquo;{f.quoteText}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                    <span>{f.quoteAuthor}</span>
                    {f.quoteCategory && <span className="px-2 py-0.5 bg-amber-600/10 text-amber-400 rounded text-xs">{f.quoteCategory}</span>}
                    {f.quoteBookId && <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded text-xs">{f.quoteBookId}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(f.quoteText)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                  title="Удалить"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          >
            ← Назад
          </button>
          <span className="text-gray-400 text-sm px-4">
            Страница {page} из {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage(p => Math.min(Math.ceil(total / 20), p + 1))}
            disabled={page >= Math.ceil(total / 20)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  )
}
