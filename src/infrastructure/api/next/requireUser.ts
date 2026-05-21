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

export async function requireVip(plan: "vip_basic" | "vip_pro") {
  const auth = await requireUser()
  if (!auth.ok) return auth
  const p = auth.profile.toDTO()
  const now = new Date()
  const expired = p.vip_expired_at ? new Date(p.vip_expired_at) < now : false
  if (expired) return { ok: false as const, status: 403, message: "VIP expired" }
  if (plan === "vip_basic" && (p.vip_plan === "vip_basic" || p.vip_plan === "vip_pro")) return auth
  if (plan === "vip_pro" && p.vip_plan === "vip_pro") return auth
  return { ok: false as const, status: 403, message: "Upgrade VIP to access" }
}
