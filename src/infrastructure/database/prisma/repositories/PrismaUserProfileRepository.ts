import { UserProfile } from "@/core/domain/entities/UserProfile"
import type { IUserProfileRepository, UpdateUserProfileInput } from "@/core/interfaces/repositories/IUserProfileRepository"
import { prisma } from "@/infrastructure/database/prisma/client"

function toEntity(row: { id: string; full_name: string | null; avatar_url: string | null; target_band: number | null; role: "admin" | "user"; vip_plan: "free" | "vip_basic" | "vip_pro"; vip_expired_at: Date | null; created_at: Date; updated_at: Date }) {
  return new UserProfile({
    id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    target_band: row.target_band,
    role: row.role,
    vip_plan: row.vip_plan,
    vip_expired_at: row.vip_expired_at ? row.vip_expired_at.toISOString() : null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  })
}

export class PrismaUserProfileRepository implements IUserProfileRepository {
  async getByUserId(userId: string) {
    const row = await prisma.userProfile.findUnique({ where: { id: userId } })
    if (!row) throw new Error("Profile not found")
    return toEntity(row)
  }

  async upsertForUser(userId: string, input: UpdateUserProfileInput) {
    const row = await prisma.userProfile.upsert({
      where: { id: userId },
      create: {
        id: userId,
        full_name: input.full_name ?? null,
        avatar_url: input.avatar_url ?? null,
        target_band: input.target_band ?? null,
        role: input.role ?? "user",
        vip_plan: input.vip_plan ?? "free",
        vip_expired_at: input.vip_expired_at ? new Date(input.vip_expired_at) : null,
      },
      update: {
        ...(input.full_name !== undefined ? { full_name: input.full_name } : {}),
        ...(input.avatar_url !== undefined ? { avatar_url: input.avatar_url } : {}),
        ...(input.target_band !== undefined ? { target_band: input.target_band } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.vip_plan !== undefined ? { vip_plan: input.vip_plan } : {}),
        ...(input.vip_expired_at !== undefined ? { vip_expired_at: input.vip_expired_at ? new Date(input.vip_expired_at) : null } : {}),
      },
    })
    return toEntity(row)
  }

  async listUsersForAdmin() {
    const rows = await prisma.user.findMany({ include: { profile: true }, orderBy: { created_at: "desc" } })
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      full_name: r.profile?.full_name ?? null,
      avatar_url: r.profile?.avatar_url ?? null,
      target_band: r.profile?.target_band ?? null,
      role: r.profile?.role ?? "user",
      vip_plan: r.profile?.vip_plan ?? "free",
      vip_expired_at: r.profile?.vip_expired_at ? r.profile.vip_expired_at.toISOString() : null,
      created_at: r.created_at.toISOString(),
      updated_at: r.profile?.updated_at ? r.profile.updated_at.toISOString() : r.updated_at.toISOString(),
    }))
  }

  async updateUserForAdmin(userId: string, input: { role?: "admin" | "user"; vip_plan?: "free" | "vip_basic" | "vip_pro"; vip_expired_at?: string | null; full_name?: string | null }) {
    await prisma.userProfile.upsert({
      where: { id: userId },
      create: { id: userId, role: input.role ?? "user", vip_plan: input.vip_plan ?? "free", vip_expired_at: input.vip_expired_at ? new Date(input.vip_expired_at) : null, full_name: input.full_name ?? null },
      update: {
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.vip_plan !== undefined ? { vip_plan: input.vip_plan } : {}),
        ...(input.vip_expired_at !== undefined ? { vip_expired_at: input.vip_expired_at ? new Date(input.vip_expired_at) : null } : {}),
        ...(input.full_name !== undefined ? { full_name: input.full_name } : {}),
      },
    })

    const row = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } })
    if (!row) throw new Error("User not found")

    return {
      id: row.id,
      email: row.email,
      full_name: row.profile?.full_name ?? null,
      avatar_url: row.profile?.avatar_url ?? null,
      target_band: row.profile?.target_band ?? null,
      role: row.profile?.role ?? "user",
      vip_plan: row.profile?.vip_plan ?? "free",
      vip_expired_at: row.profile?.vip_expired_at ? row.profile.vip_expired_at.toISOString() : null,
      created_at: row.created_at.toISOString(),
      updated_at: row.profile?.updated_at ? row.profile.updated_at.toISOString() : row.updated_at.toISOString(),
    }
  }
}
