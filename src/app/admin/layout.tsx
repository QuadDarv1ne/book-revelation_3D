"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

  if (!session || session.user?.role !== "ADMIN") {
    router.push("/login")
    return null
  }

  const navItems = [
    { href: "/admin", label: "Дашборд", icon: "📊" },
    { href: "/admin/users", label: "Студенты", icon: "👥" },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-light text-amber-100">Админ-панель</h1>
              <nav className="flex gap-2 ml-8">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
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
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
              ← На сайт
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
