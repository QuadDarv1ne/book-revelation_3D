import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, email: true, name: true, role: true,
      theme: true, locale: true, rotationSpeed: true, zenMode: true,
      activeBookId: true, cameraPositionX: true, cameraPositionY: true,
      cameraPositionZ: true, cameraZoom: true, graphicsQuality: true,
      createdAt: true, updatedAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...user,
    cameraState: {
      x: user.cameraPositionX,
      y: user.cameraPositionY,
      z: user.cameraPositionZ,
      zoom: user.cameraZoom,
    },
  })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await req.json()
  const { cameraState, ...rest } = data

  const updateData: Record<string, unknown> = { ...rest }
  if (cameraState) {
    updateData.cameraPositionX = cameraState.x
    updateData.cameraPositionY = cameraState.y
    updateData.cameraPositionZ = cameraState.z
    updateData.cameraZoom = cameraState.zoom
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, theme: true, locale: true },
  })

  return NextResponse.json({ user })
}
