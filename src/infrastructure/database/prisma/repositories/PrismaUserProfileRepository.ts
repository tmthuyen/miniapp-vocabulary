import { UserProfile } from "@/core/domain/entities/UserProfile"
import type { IUserProfileRepository, UpdateUserProfileInput } from "@/core/interfaces/repositories/IUserProfileRepository"
import { prisma } from "@/infrastructure/database/prisma/client"

function toEntity(row: any) {
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
        ...(input.vip_expired_at !== undefined
          ? { vip_expired_at: input.vip_expired_at ? new Date(input.vip_expired_at) : null }
          : {}),
      },
    })
    return toEntity(row)
  }
}
