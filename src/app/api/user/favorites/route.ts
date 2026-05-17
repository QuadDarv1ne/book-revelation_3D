import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const skip = (page - 1) * limit

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.favorite.count({ where: { userId: session.user.id } }),
  ])

  return NextResponse.json({ favorites, total, page, limit })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { text, author, era, category, bookId } = await req.json()
  if (!text || !author) {
    return NextResponse.json({ error: "text and author are required" }, { status: 400 })
  }

  try {
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        quoteText: text,
        quoteAuthor: author,
        quoteEra: era || null,
        quoteCategory: category || null,
        quoteBookId: bookId || null,
      },
    })
    return NextResponse.json(favorite, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Favorite already exists" }, { status: 409 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { quoteText } = await req.json()
  if (!quoteText) {
    return NextResponse.json({ error: "quoteText is required" }, { status: 400 })
  }

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, quoteText },
  })

  return NextResponse.json({ success: true })
}
