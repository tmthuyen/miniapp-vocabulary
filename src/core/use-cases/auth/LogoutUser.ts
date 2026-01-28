import type { IAuthService } from "@/core/interfaces/services/IAuthService"

export class LogoutUser {
  constructor(private readonly auth: IAuthService) {}

  async execute(): Promise<void> {
    return this.auth.logout()
  }
}


