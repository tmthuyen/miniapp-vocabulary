import { getCurrentUser } from "@/infrastructure/auth/prismaAuth"
import { createRequestContainer } from "@/infrastructure/di/container"

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, status: 401, message: "Unauthorized" }

  const di = createRequestContainer()
  const profile = await di.profile.getMyProfile.execute(user.id)
  return { ok: true as const, userId: user.id, user, profile, di }
}

export async function requireAdmin() {
  const auth = await requireUser()
  if (!auth.ok) return auth
  if (!auth.profile.isAdmin()) return { ok: false as const, status: 403, message: "Admin only" }
  return auth
}
