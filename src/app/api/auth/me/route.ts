import { getCurrentUser } from "@/infrastructure/auth/prismaAuth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ user: null }, { status: 200 })
  return Response.json({ user: { id: user.id, email: user.email } })
}
