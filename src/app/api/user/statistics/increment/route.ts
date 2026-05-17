import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { field, amount = 1 } = await req.json()
  const validFields = ["timeSpent", "quotesRead", "rotations", "totalVisits"] as const
  if (!validFields.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 })
  }

  const stats = await prisma.userStatistics.update({
    where: { userId: session.user.id },
    data: { [field]: { increment: amount } },
  })

  return NextResponse.json({ field, newValue: stats[field as keyof typeof stats] })
}
