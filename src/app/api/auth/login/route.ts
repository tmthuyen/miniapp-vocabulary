export async function POST(req: Request) {
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()

  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string }
    const user = await di.auth.login.execute({ email: email ?? "", password: password ?? "" })
    return Response.json({ ok: true, user })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Invalid credentials"
    return Response.json({ message }, { status: 401 })
  }
}


