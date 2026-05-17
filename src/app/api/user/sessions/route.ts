import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sessionId, startTime, durationSeconds } = await req.json()
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
  }

  const session_record = await prisma.session.upsert({
    where: { sessionId },
    update: {
      durationSeconds: durationSeconds ?? undefined,
      endTime: durationSeconds !== undefined ? new Date() : undefined,
    },
    create: {
      userId: session.user.id,
      sessionId,
      startTime: startTime ? new Date(startTime) : new Date(),
      durationSeconds: durationSeconds || 0,
    },
  })

  return NextResponse.json(session_record)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sessions = await prisma.session.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ sessions })
}
