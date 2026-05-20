import { prisma } from "@/infrastructure/database/prisma/client"
import bcrypt from "bcrypt"

async function main() {
  const email = "admin@gmail.com"
  const passwordHash = await bcrypt.hash("123456", 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { password_hash: passwordHash },
    create: { email, password_hash: passwordHash },
  })

  await prisma.userProfile.upsert({
    where: { id: user.id },
    update: { role: "admin", vip_plan: "vip_pro", vip_expired_at: null },
    create: { id: user.id, role: "admin", vip_plan: "vip_pro", vip_expired_at: null },
  })

  console.log("Seeded admin:", email)
}

main().finally(async () => {
  await prisma.$disconnect()
})
