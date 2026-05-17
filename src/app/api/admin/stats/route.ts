import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    activeToday,
    activeThisWeek,
    totalStats,
    topAchievements,
    popularBooks,
    newUserGrowth,
    roleDistribution,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: today } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: weekAgo } } }),
    prisma.userStatistics.aggregate({
      _sum: { quotesRead: true, timeSpent: true, totalVisits: true },
      _avg: { timeSpent: true },
    }),
    prisma.userAchievement.groupBy({
      by: ["achievementId", "unlocked"],
      where: { unlocked: true },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.userStatistics.findMany({
      select: { bookQuotesRead: true },
    }),
    prisma.user.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
  ])

  // Aggregate popular books from bookQuotesRead JSON
  const bookCounts: Record<string, number> = {}
  for (const s of popularBooks) {
    try {
      const parsed = JSON.parse(s.bookQuotesRead) as Record<string, number>
      for (const [bookId, count] of Object.entries(parsed)) {
        bookCounts[bookId] = (bookCounts[bookId] || 0) + count
      }
    } catch { /* skip */ }
  }
  const topBooks = Object.entries(bookCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([bookId, readCount]) => ({ bookId, readCount }))

  // Aggregate achievement data
  const achievementMap = new Map<string, { achievementId: string; unlockCount: number }>()
  for (const a of topAchievements) {
    const existing = achievementMap.get(a.achievementId) || { achievementId: a.achievementId, unlockCount: 0 }
    existing.unlockCount += a._count.id
    achievementMap.set(a.achievementId, existing)
  }
  const topAch = Array.from(achievementMap.values())
    .sort((a, b) => b.unlockCount - a.unlockCount)
    .slice(0, 10)
    .map(a => ({ ...a, unlockPercentage: totalUsers > 0 ? Math.round((a.unlockCount / totalUsers) * 100) : 0 }))

  // Group new users by date
  const growthMap = new Map<string, number>()
  for (const g of newUserGrowth) {
    const date = g.createdAt.toISOString().split("T")[0]
    growthMap.set(date, (growthMap.get(date) || 0) + g._count.id)
  }
  const growth = Array.from(growthMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)

  return NextResponse.json({
    totalUsers,
    activeToday,
    activeThisWeek,
    totalQuotesRead: totalStats._sum.quotesRead || 0,
    totalTimeSpent: totalStats._sum.timeSpent || 0,
    averageTimeSpent: Math.round(totalStats._avg.timeSpent || 0),
    totalVisits: totalStats._sum.totalVisits || 0,
    topAchievements: topAch,
    popularBooks: topBooks,
    newUserGrowth: growth,
    roleDistribution: Object.fromEntries(roleDistribution.map(r => [r.role, r._count.id])),
  })
}
