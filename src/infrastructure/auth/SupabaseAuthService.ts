import type { SupabaseClient } from "@supabase/supabase-js"
import type { AuthUser, IAuthService, LoginInput, SignupInput } from "@/core/interfaces/services/IAuthService"

export class SupabaseAuthService implements IAuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getCurrentUser(): Promise<AuthUser | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser()

    if (error) return null
    if (!user) return null
    return { id: user.id, email: user.email ?? null }
  }

  async login(input: LoginInput): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })
    if (error) throw error
    const user = data.user
    if (!user) throw new Error("Login failed")
    return { id: user.id, email: user.email ?? null }
  }

  async signup(input: SignupInput): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
    })
    if (error) throw error
    const user = data.user
    if (!user) throw new Error("Signup failed")
    return { id: user.id, email: user.email ?? null }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }
}


