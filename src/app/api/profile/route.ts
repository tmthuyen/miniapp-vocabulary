import { requireUser } from "@/infrastructure/api/next/requireUser"
import type { UpdateUserProfileInput } from "@/core/interfaces/repositories/IUserProfileRepository"

export async function GET() {
  const auth = await requireUser()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const profile = await auth.di.profile.getMyProfile.execute(auth.userId)
  return Response.json(profile.toDTO())
}

export async function PUT(req: Request) {
  const body = (await req.json()) as UpdateUserProfileInput
  const auth = await requireUser()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const updated = await auth.di.profile.updateMyProfile.execute(auth.userId, body)
  return Response.json(updated.toDTO())
}


