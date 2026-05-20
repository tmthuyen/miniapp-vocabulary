import type { UserProfile, UserRole, VipPlan } from "@/core/domain/entities/UserProfile"

export interface UpdateUserProfileInput {
  full_name?: string | null
  avatar_url?: string | null
  target_band?: number | null
  role?: UserRole
  vip_plan?: VipPlan
  vip_expired_at?: string | null
}

export interface IUserProfileRepository {
  getByUserId(userId: string): Promise<UserProfile>
  upsertForUser(userId: string, input: UpdateUserProfileInput): Promise<UserProfile>
}
