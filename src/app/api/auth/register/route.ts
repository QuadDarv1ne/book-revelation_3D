import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prismadb"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const passwordHash = await hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        statistics: { create: {} },
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    return NextResponse.json({ user, message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("[REGISTER]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
