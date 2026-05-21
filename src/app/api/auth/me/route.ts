import { getCurrentUser } from "@/infrastructure/auth/prismaAuth"
import { createRequestContainer } from "@/infrastructure/di/container"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ user: null }, { status: 200 })
  const di = createRequestContainer()
  const profile = await di.profile.getMyProfile.execute(user.id)
  return Response.json({ user: { id: user.id, email: user.email }, profile: profile.toDTO() })
}
