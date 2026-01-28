export async function POST() {
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()

  try {
    await di.auth.logout.execute()
    return Response.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to logout"
    return Response.json({ message }, { status: 400 })
  }
}


