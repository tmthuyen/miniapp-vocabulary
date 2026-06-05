import type { IUserProfileRepository } from "@/domain/repositories/IUserProfileRepository"
import type { UserProfile } from "@/domain/entities/UserProfile"
import { UserProfileWithRolesProjection } from "@/domain/repositories/projections/user-projections"
import AppError from "@/shared/errors/AppError"

export class GetMyProfileUC {
  constructor(private readonly repo: IUserProfileRepository) {}

  async execute(userId: string): Promise<UserProfile | UserProfileWithRolesProjection> {
    if (!userId) throw AppError.builder()
        .withMessage("User ID is required")
        .withCode("USER_ID_REQUIRED")
        .withStatus(400)
        
    // const user = await this.repo.getByUserId(userId)
    const user = await this.repo.getByUserIdWithRoles(userId)
    if (!user) throw AppError.builder()
        .withMessage("User not found")
        .withCode("USER_NOT_FOUND")
        .withStatus(404)
    
    
    return user
  }
}


