import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function POST(req: Request) {
  const session = await auth()
  let userId: string | null = session?.user?.id || null

  const body = await req.json()
  const events = body.events || (body.event ? [body] : [])

  if (events.length === 0) {
    return NextResponse.json({ received: 0 })
  }

  const records = events.map((e: Record<string, unknown>) => ({
    userId,
    sessionId: (e.sessionId as string) || null,
    event: (e.event as string) || "unknown",
    category: (e.category as string) || "general",
    label: (e.label as string) || null,
    value: (e.value as number) || null,
    timestamp: e.timestamp ? new Date(e.timestamp as number) : new Date(),
  }))

  await prisma.analyticsEvent.createMany({ data: records })

  return new NextResponse(null, { status: 204 })
}
