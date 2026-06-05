import { cookies } from 'next/headers'
import { prisma } from '@/infrastructure/database/prisma/client'

const SESSION_COOKIE = 'access_token'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({ where: { session_token: token }, include: { user_profile: true } })
  if (!session) return null
  if (session.expires_at < new Date()) {
    await prisma.session.delete({ where: { session_token: token } })
    try {
      cookieStore.delete(SESSION_COOKIE)
    } catch {
      // ignore when called from server components
    }
    return null
  }

  return session.user_profile
}

export async function signOut() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) await prisma.session.deleteMany({ where: { session_token: token } })
  try {
    cookieStore.delete(SESSION_COOKIE)
  } catch {
    // ignore
  }
}
