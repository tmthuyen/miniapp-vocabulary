export type UserRole = "admin" | "user"
export type VipPlan = "free" | "vip_basic" | "vip_pro"

export interface UserProfileDTO {
  id: string
  full_name: string | null
  avatar_url: string | null
  target_band: number | null
  role: UserRole
  vip_plan: VipPlan
  vip_expired_at: string | null
  created_at: string
  updated_at: string
}

export class UserProfile {
  constructor(private readonly dto: UserProfileDTO) {
    if (!dto.id) throw new Error("UserProfile.id is required")
  }

  isAdmin() {
    return this.dto.role === "admin"
  }

  toDTO(): UserProfileDTO {
    return this.dto
  }
}
