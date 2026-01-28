import type { AuthUser, IAuthService, LoginInput } from "@/core/interfaces/services/IAuthService"

export class LoginUser {
  constructor(private readonly auth: IAuthService) {}

  async execute(input: LoginInput): Promise<AuthUser> {
    if (!input.email?.trim()) throw new Error("email is required")
    if (!input.password) throw new Error("password is required")
    return this.auth.login({ email: input.email.trim(), password: input.password })
  }
}


