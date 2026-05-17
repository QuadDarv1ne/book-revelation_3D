import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { localStorageData } = await req.json()
  if (!localStorageData) {
    return NextResponse.json({ error: "localStorageData is required" }, { status: 400 })
  }

  const userId = session.user.id
  let migrated = { statistics: false, achievements: 0, favorites: 0, sessions: 0, analyticsEvents: 0 }

  try {
    // Migrate user settings -> statistics
    const settings = localStorageData["user-settings"]
    if (settings?.statistics) {
      const s = settings.statistics
      const stats = await prisma.userStatistics.upsert({
        where: { userId },
        update: {
          timeSpent: Math.max(s.timeSpent || 0, 0),
          quotesRead: Math.max(s.quotesRead || 0, 0),
          rotations: Math.max(s.rotations || 0, 0),
          totalVisits: Math.max(s.totalVisits || 0, 0),
          lastVisitDate: s.lastVisitDate || "",
          firstVisitDate: s.firstVisitDate || "",
          visitHistory: Array.isArray(s.visitHistory) ? s.visitHistory : [],
          booksViewed: Array.isArray(s.booksViewed) ? s.booksViewed : [],
          themesExplored: Array.isArray(s.themesExplored) ? s.themesExplored : [],
          bookQuotesRead: JSON.stringify(s.bookQuotesRead || {}),
          categoryReads: JSON.stringify(settings.categoryReads || {}),
        },
        create: {
          userId,
          timeSpent: Math.max(s.timeSpent || 0, 0),
          quotesRead: Math.max(s.quotesRead || 0, 0),
          rotations: Math.max(s.rotations || 0, 0),
          totalVisits: Math.max(s.totalVisits || 0, 0),
          lastVisitDate: s.lastVisitDate || "",
          firstVisitDate: s.firstVisitDate || "",
          visitHistory: Array.isArray(s.visitHistory) ? s.visitHistory : [],
          booksViewed: Array.isArray(s.booksViewed) ? s.booksViewed : [],
          themesExplored: Array.isArray(s.themesExplored) ? s.themesExplored : [],
          bookQuotesRead: JSON.stringify(s.bookQuotesRead || {}),
          categoryReads: JSON.stringify(settings.categoryReads || {}),
        },
      })
      migrated.statistics = !!stats
    }

    // Migrate achievements
    if (Array.isArray(settings?.achievements)) {
      for (const a of settings.achievements) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: a.id } },
          update: { progress: a.progress || 0, unlocked: !!a.unlockedAt, unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : null },
          create: { userId, achievementId: a.id, progress: a.progress || 0, unlocked: !!a.unlockedAt, unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : null },
        })
        migrated.achievements++
      }
    }

    // Migrate favorites
    if (Array.isArray(settings?.favorites)) {
      for (const f of settings.favorites) {
        await prisma.favorite.upsert({
          where: { userId_quoteText: { userId, quoteText: f.text } },
          update: {},
          create: {
            userId,
            quoteText: f.text,
            quoteAuthor: f.author,
            quoteEra: f.era || null,
            quoteCategory: f.category || null,
            quoteBookId: f.bookId || null,
          },
        })
        migrated.favorites++
      }
    }

    // Migrate session
    const sessionData = localStorageData["session_tracking"]
    if (sessionData?.sessionId) {
      await prisma.session.upsert({
        where: { sessionId: sessionData.sessionId },
        update: { durationSeconds: sessionData.totalTime || 0, endTime: new Date() },
        create: {
          userId,
          sessionId: sessionData.sessionId,
          startTime: new Date(sessionData.startTime || Date.now()),
          durationSeconds: sessionData.totalTime || 0,
          endTime: new Date(),
        },
      })
      migrated.sessions++
    }

    // Migrate analytics events
    const analyticsEvents = localStorageData["analytics_events"]
    if (Array.isArray(analyticsEvents) && analyticsEvents.length > 0) {
      const records = analyticsEvents.slice(0, 500).map((e: Record<string, unknown>) => ({
        userId,
        sessionId: (e.sessionId as string) || null,
        event: (e.event as string) || "unknown",
        category: (e.category as string) || "general",
        label: (e.label as string) || null,
        value: (e.value as number) || null,
        timestamp: e.timestamp ? new Date(e.timestamp as number) : new Date(),
      }))
      await prisma.analyticsEvent.createMany({ data: records })
      migrated.analyticsEvents = records.length
    }

    // Migrate category_* keys
    const categoryKeys = Object.keys(localStorageData).filter(k => k.startsWith("category_"))
    if (categoryKeys.length > 0) {
      const categoryReads: Record<string, number> = {}
      for (const key of categoryKeys) {
        const cat = key.replace("category_", "")
        categoryReads[cat] = parseInt(localStorageData[key]) || 0
      }
      await prisma.userStatistics.update({
        where: { userId },
        data: { categoryReads: JSON.stringify(categoryReads) },
      })
    }

    return NextResponse.json({ success: true, migrated })
  } catch (error) {
    console.error("[MIGRATE]", error)
    return NextResponse.json({ error: "Migration failed", migrated }, { status: 500 })
  }
}
