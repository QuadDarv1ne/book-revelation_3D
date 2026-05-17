import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const stats = await prisma.userStatistics.findUnique({
    where: { userId: session.user.id },
  })

  if (!stats) {
    return NextResponse.json({ error: "Statistics not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...stats,
    bookQuotesRead: JSON.parse(stats.bookQuotesRead),
    categoryReads: JSON.parse(stats.categoryReads),
  })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await req.json()
  const { bookQuotesRead, categoryReads, ...rest } = data

  const updateData: Record<string, unknown> = { ...rest }
  if (bookQuotesRead) updateData.bookQuotesRead = JSON.stringify(bookQuotesRead)
  if (categoryReads) updateData.categoryReads = JSON.stringify(categoryReads)

  const stats = await prisma.userStatistics.update({
    where: { userId: session.user.id },
    data: updateData,
  })

  return NextResponse.json({
    ...stats,
    bookQuotesRead: JSON.parse(stats.bookQuotesRead),
    categoryReads: JSON.parse(stats.categoryReads),
  })
}
