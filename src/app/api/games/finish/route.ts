import { requireUser } from "@/infrastructure/api/next/requireUser"

export async function POST(req: Request) {
  const auth = await requireUser()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const body = (await req.json()) as { sessionId?: string }
  const session = await auth.di.game.finishSession.execute(auth.userId, body.sessionId ?? "")
  return Response.json(session.toDTO())
}
