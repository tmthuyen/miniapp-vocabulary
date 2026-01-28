import type { UserProfile } from "@/core/domain/entities/UserProfile"

export interface UpdateUserProfileInput {
  full_name?: string | null
  avatar_url?: string | null
  target_band?: number | null
}

export interface IUserProfileRepository {
  getByUserId(userId: string): Promise<UserProfile>
  upsertForUser(userId: string, input: UpdateUserProfileInput): Promise<UserProfile>
}


