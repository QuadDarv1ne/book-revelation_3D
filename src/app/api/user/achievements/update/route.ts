import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { achievementId, progress, unlocked } = await req.json()
  if (!achievementId) {
    return NextResponse.json({ error: "achievementId is required" }, { status: 400 })
  }

  const achievement = await prisma.userAchievement.upsert({
    where: {
      userId_achievementId: {
        userId: session.user.id,
        achievementId,
      },
    },
    update: {
      progress,
      unlocked: unlocked || false,
      unlockedAt: unlocked ? new Date() : undefined,
    },
    create: {
      userId: session.user.id,
      achievementId,
      progress: progress || 0,
      unlocked: unlocked || false,
      unlockedAt: unlocked ? new Date() : null,
    },
  })

  return NextResponse.json(achievement)
}
