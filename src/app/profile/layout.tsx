"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-amber-400 text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!session) {
    router.push("/login")
    return null
  }

  const navItems = [
    { href: "/profile", label: "Обзор", icon: "🏠" },
    { href: "/profile/statistics", label: "Статистика", icon: "📊" },
    { href: "/profile/achievements", label: "Достижения", icon: "🏆" },
    { href: "/profile/favorites", label: "Избранное", icon: "❤️" },
    { href: "/profile/settings", label: "Настройки", icon: "⚙️" },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-light text-amber-100">
                Личный кабинет
              </h1>
              <nav className="hidden sm:flex gap-1 ml-4">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-amber-600/20 text-amber-400"
                        : "text-gray-400 hover:text-amber-300 hover:bg-gray-800"
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden border-b border-gray-800 bg-gray-900/50">
        <div className="flex overflow-x-auto px-2 py-2 gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-amber-600/20 text-amber-400"
                  : "text-gray-400 hover:text-amber-300"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
