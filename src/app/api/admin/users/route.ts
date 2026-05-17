import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"
import { Prisma } from "@prisma/client"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const skip = (page - 1) * limit

  const where: Prisma.UserWhereInput = search ? {
    OR: [
      { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
    ],
  } : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        statistics: {
          select: { quotesRead: true, timeSpent: true, totalVisits: true, lastVisitDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users: users.map(u => ({
      ...u,
      stats: u.statistics || null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
