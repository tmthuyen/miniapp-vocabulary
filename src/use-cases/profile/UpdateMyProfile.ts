import type { IUserProfileRepository, UpdateUserProfileInput } from "@/domain/repositories/IUserProfileRepository"
import type { UserProfile } from "@/domain/entities/UserProfile"

export class UpdateMyProfile {
  constructor(private readonly repo: IUserProfileRepository) {}

  async execute(userId: string, input: UpdateUserProfileInput): Promise<UserProfile> {
    if (!userId) throw new Error("userId is required")
    if (input.full_name !== undefined && input.full_name !== null) {
      input.full_name = input.full_name.trim()
    }
    return this.repo.upsertForUser(userId, input)
  }
}


