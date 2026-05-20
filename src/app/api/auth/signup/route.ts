import { createUser, signIn } from "@/infrastructure/auth/prismaAuth"

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string }
  const email = body.email?.trim().toLowerCase() ?? ""
  const password = body.password ?? ""

  if (!email || !password || password.length < 6) {
    return Response.json({ message: "Invalid signup data" }, { status: 400 })
  }

  try {
    await createUser(email, password)
    await signIn(email, password)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ message: "Email already exists" }, { status: 409 })
  }
}
