export async function GET() {
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()
  const user = await di.auth.getCurrentUser.execute()
  return Response.json({ user })
}


