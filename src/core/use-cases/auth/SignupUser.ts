import type { AuthUser, IAuthService, SignupInput } from "@/core/interfaces/services/IAuthService"

export class SignupUser {
  constructor(private readonly auth: IAuthService) {}

  async execute(input: SignupInput): Promise<AuthUser> {
    if (!input.email?.trim()) throw new Error("email is required")
    if (!input.password) throw new Error("password is required")
    return this.auth.signup({ email: input.email.trim(), password: input.password })
  }
}


