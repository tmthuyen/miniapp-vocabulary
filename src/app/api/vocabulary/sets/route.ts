import { requireUser } from "@/infrastructure/api/next/requireUser"

export async function GET() {
  const auth = await requireUser()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const userSets = await auth.di.vocabulary.repo.listSetsByUserId(auth.userId)
  const published = await auth.di.vocabulary.repo.listPublishedSets()

  const map = new Map<string, any>()
  for (const s of published) map.set(s.id, s)
  for (const s of userSets) map.set(s.id, s)

  return Response.json(Array.from(map.values()))
}
