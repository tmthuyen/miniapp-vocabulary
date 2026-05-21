import { requireAdmin } from "@/infrastructure/api/next/requireUser"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })
  const rows = await auth.di.vocabulary.repo.listSetsByUserId(auth.userId)
  return Response.json(rows)
}

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const body = await req.json()
  if (body?.action === "publish") {
    const row = await auth.di.vocabulary.repo.publishSetForUser(auth.userId, body.set_id, Boolean(body.is_published))
    return Response.json(row)
  }

  const row = await auth.di.vocabulary.repo.createSetForUser(auth.userId, {
    name: `${body?.name ?? ""}`.trim(),
    description: body?.description ?? null,
  })
  return Response.json(row)
}
