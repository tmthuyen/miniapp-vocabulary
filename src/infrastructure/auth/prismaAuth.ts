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

export async function createUserByAdmin(input: { email: string; password: string; full_name?: string | null; role?: "admin" | "user"; vip_plan?: "free" | "vip_basic" | "vip_pro"; vip_expired_at?: string | null }) {
  const passwordHash = await bcrypt.hash(input.password, 10)
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password_hash: passwordHash,
      profile: {
        create: {
          full_name: input.full_name ?? null,
          role: input.role ?? "user",
          vip_plan: input.vip_plan ?? "free",
          vip_expired_at: input.vip_expired_at ? new Date(input.vip_expired_at) : null,
        },
      },
    },
    include: { profile: true },
  })

  return {
    id: user.id,
    email: user.email,
    full_name: user.profile?.full_name ?? null,
    role: user.profile?.role ?? "user",
    vip_plan: user.profile?.vip_plan ?? "free",
    vip_expired_at: user.profile?.vip_expired_at ? user.profile.vip_expired_at.toISOString() : null,
    created_at: user.created_at.toISOString(),
  }
}

export async function banUserByAdmin(userId: string) {
  const lockedPasswordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10)
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { password_hash: lockedPasswordHash } }),
    prisma.session.deleteMany({ where: { user_id: userId } }),
  ])
}

export async function deleteUserByAdmin(userId: string) {
  await prisma.user.delete({ where: { id: userId } })
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
