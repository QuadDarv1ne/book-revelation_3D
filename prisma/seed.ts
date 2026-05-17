import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = "admin@bookrevelation.ru"
  const adminPassword = "Admin123!"

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) {
    console.log("Admin user already exists")
    return
  }

  const passwordHash = await hash(adminPassword, 12)

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Администратор",
      passwordHash,
      role: "ADMIN",
      statistics: { create: {} },
    },
  })

  console.log(`Admin created: ${admin.email} (password: ${adminPassword})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
