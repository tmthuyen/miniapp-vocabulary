import type { IUserProfileRepository } from "@/domain/repositories/IUserProfileRepository"
import type { UserProfile } from "@/domain/entities/UserProfile"

export class GetMyProfileUC {
  constructor(private readonly repo: IUserProfileRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    if (!userId) throw new Error("userId is required")
    const user = await this.repo.getByUserId(userId)
    if (!user) throw new Error("User not found")
    return user
  }
}


