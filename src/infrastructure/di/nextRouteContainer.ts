import { createSupabaseServerClient } from "@/infrastructure/database/supabase/serverClient"
import { SupabaseAuthService } from "@/infrastructure/auth/SupabaseAuthService"
import { createRequestContainer } from "@/infrastructure/di/container"
import { GetCurrentUser } from "@/core/use-cases/auth/GetCurrentUser"
import { LoginUser } from "@/core/use-cases/auth/LoginUser"
import { SignupUser } from "@/core/use-cases/auth/SignupUser"
import { LogoutUser } from "@/core/use-cases/auth/LogoutUser"

export async function createNextRouteContainer() {
  const supabase = await createSupabaseServerClient()

  const authService = new SupabaseAuthService(supabase)
  const app = createRequestContainer(supabase)

  return {
    ...app,
    auth: {
      getCurrentUser: new GetCurrentUser(authService),
      login: new LoginUser(authService),
      signup: new SignupUser(authService),
      logout: new LogoutUser(authService),
    },
  }
}


