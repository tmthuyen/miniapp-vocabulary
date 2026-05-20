import { signOut } from "@/infrastructure/auth/prismaAuth"

export async function POST() {
  await signOut()
  return Response.json({ ok: true })
}
