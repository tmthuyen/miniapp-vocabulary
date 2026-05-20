import { prisma } from "@/infrastructure/database/prisma/client"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { cookies } from "next/headers"

const SESSION_COOKIE = "session_token"

export async function createUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      password_hash: passwordHash,
      profile: { create: { role: "user", vip_plan: "free" } },
    },
  })
  return user
}

export async function signIn(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return null

  const token = randomBytes(48).toString("hex")
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

  await prisma.session.create({
    data: { user_id: user.id, session_token: token, expires_at: expiresAt },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })

  return user
}

export async function signOut() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) await prisma.session.deleteMany({ where: { session_token: token } })
  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({ where: { session_token: token }, include: { user: true } })
  if (!session) return null
  if (session.expires_at < new Date()) {
    await prisma.session.delete({ where: { session_token: token } })
    cookieStore.delete(SESSION_COOKIE)
    return null
  }

  return session.user
}
