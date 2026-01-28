export interface UserProfileDTO {
  id: string
  full_name: string | null
  avatar_url: string | null
  target_band: number | null
  created_at: string
  updated_at: string
}

export class UserProfile {
  constructor(private readonly dto: UserProfileDTO) {
    if (!dto.id) throw new Error("UserProfile.id is required")
  }

  toDTO(): UserProfileDTO {
    return this.dto
  }
}


