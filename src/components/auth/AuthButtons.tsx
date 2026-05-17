"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export function AuthButtons() {
  const { data: session, status } = useSession()

  if (status === "loading") return null

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition-colors text-sm"
        >
          Личный кабинет
        </Link>
        {session.user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors text-sm"
          >
            Админ-панель
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm"
        >
          Выйти
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm"
      >
        Войти
      </Link>
      <Link
        href="/register"
        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors text-sm"
      >
        Регистрация
      </Link>
    </div>
  )
}
