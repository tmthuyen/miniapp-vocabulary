import type { IUserProfileRepository } from "@/core/interfaces/repositories/IUserProfileRepository"
import type { UserProfile } from "@/core/domain/entities/UserProfile"

export class GetMyProfile {
  constructor(private readonly repo: IUserProfileRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    if (!userId) throw new Error("userId is required")
    return this.repo.getByUserId(userId)
  }
}


