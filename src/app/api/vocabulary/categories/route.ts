export async function GET() {
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()
  const user = await di.auth.getCurrentUser.execute()
  if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 })

  const categories = await di.vocabulary.getCategories.execute(user.id)
  return Response.json({ categories })
}


