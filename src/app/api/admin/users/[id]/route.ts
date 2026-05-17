import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, name: true, role: true, createdAt: true, lastLoginAt: true,
      theme: true, locale: true, activeBookId: true,
    },
  })
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const [statistics, achievements, favoritesCount, recentSessions, analyticsSummary] = await Promise.all([
    prisma.userStatistics.findUnique({ where: { userId: id } }),
    prisma.userAchievement.findMany({ where: { userId: id }, orderBy: { updatedAt: "desc" } }),
    prisma.favorite.count({ where: { userId: id } }),
    prisma.session.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.analyticsEvent.groupBy({
      by: ["category"],
      where: { userId: id },
      _count: { id: true },
    }),
  ])

  return NextResponse.json({
    user: target,
    statistics: statistics ? {
      ...statistics,
      bookQuotesRead: JSON.parse(statistics.bookQuotesRead),
      categoryReads: JSON.parse(statistics.categoryReads),
    } : null,
    achievements,
    favoritesCount,
    recentSessions,
    analyticsSummary: Object.fromEntries(analyticsSummary.map(a => [a.category, a._count.id])),
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (currentUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const data = await req.json()

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.role ? { role: data.role } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.email ? { email: data.email } : {}),
    },
    select: { id: true, email: true, name: true, role: true },
  })

  return NextResponse.json({ user: updated })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (currentUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
