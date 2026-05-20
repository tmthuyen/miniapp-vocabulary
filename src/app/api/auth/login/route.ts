import { signIn } from "@/infrastructure/auth/prismaAuth"

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string }
  const email = body.email?.trim().toLowerCase() ?? ""
  const password = body.password ?? ""

  const user = await signIn(email, password)
  if (!user) return Response.json({ message: "Invalid credentials" }, { status: 401 })
  return Response.json({ ok: true })
}
