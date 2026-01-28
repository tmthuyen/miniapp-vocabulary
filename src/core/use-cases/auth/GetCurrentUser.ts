import type { AuthUser, IAuthService } from "@/core/interfaces/services/IAuthService"

export class GetCurrentUser {
  constructor(private readonly auth: IAuthService) {}

  async execute(): Promise<AuthUser | null> {
    return this.auth.getCurrentUser()
  }
}


