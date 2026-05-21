import type { UserRole, VipPlan } from "@/core/domain/entities/UserProfile"
import type { IUserProfileRepository } from "@/core/interfaces/repositories/IUserProfileRepository"
import { AppError } from "@/shared/errors/AppError"

type UpdateInput = {
  role?: UserRole
  vip_plan?: VipPlan
  vip_expired_at?: string | null
  full_name?: string | null
}

const roleValues: UserRole[] = ["admin", "user"]
const vipValues: VipPlan[] = ["free", "vip_basic", "vip_pro"]

export class UpdateUserAccessForAdmin {
  constructor(private readonly repo: IUserProfileRepository) {}

  async execute(userId: string, input: UpdateInput) {
    if (!userId) throw new AppError("userId is required", "VALIDATION_ERROR", 400)
    if (!input || Object.keys(input).length === 0) throw new AppError("No update fields provided", "VALIDATION_ERROR", 400)

    if (input.role !== undefined && !roleValues.includes(input.role)) {
      throw new AppError("Invalid role value", "VALIDATION_ERROR", 400)
    }

    if (input.vip_plan !== undefined && !vipValues.includes(input.vip_plan)) {
      throw new AppError("Invalid vip_plan value", "VALIDATION_ERROR", 400)
    }

    if (input.full_name !== undefined) {
      if (input.full_name === null || input.full_name.trim() === "") input.full_name = null
      else if (input.full_name.trim().length > 100) {
        throw new AppError("full_name must be <= 100 characters", "VALIDATION_ERROR", 400)
      } else {
        input.full_name = input.full_name.trim()
      }
    }

    if (input.vip_expired_at !== undefined && input.vip_expired_at !== null) {
      const parsed = new Date(input.vip_expired_at)
      if (Number.isNaN(parsed.getTime())) throw new AppError("vip_expired_at must be a valid ISO date", "VALIDATION_ERROR", 400)
    }

    if (input.vip_plan === "free") input.vip_expired_at = null
    if ((input.vip_plan === "vip_basic" || input.vip_plan === "vip_pro") && input.vip_expired_at === undefined) {
      throw new AppError("vip_expired_at is required when vip plan is not free", "VALIDATION_ERROR", 400)
    }

    return this.repo.updateUserForAdmin(userId, input)
  }
}
