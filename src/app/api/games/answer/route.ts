import { requireUser } from "@/infrastructure/api/next/requireUser"

export async function POST(req: Request) {
  const auth = await requireUser()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const body = (await req.json()) as {
    sessionId?: string
    prompt?: string
    expected?: string
    submitted?: string
  }

  const result = await auth.di.game.submitAnswer.execute(auth.userId, {
    sessionId: body.sessionId ?? "",
    prompt: body.prompt ?? "",
    expected: body.expected ?? "",
    submitted: body.submitted ?? "",
  })

  return Response.json(result)
}
