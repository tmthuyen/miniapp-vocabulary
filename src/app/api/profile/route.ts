import type { UpdateUserProfileInput } from "@/core/interfaces/repositories/IUserProfileRepository"

export async function GET() {
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()
  const user = await di.auth.getCurrentUser.execute()
  if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 })

  const profile = await di.profile.getMyProfile.execute(user.id)
  return Response.json(profile.toDTO())
}

export async function PUT(req: Request) {
  const body = (await req.json()) as UpdateUserProfileInput
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()
  const user = await di.auth.getCurrentUser.execute()
  if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 })

  const updated = await di.profile.updateMyProfile.execute(user.id, body)
  return Response.json(updated.toDTO())
}


