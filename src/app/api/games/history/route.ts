import { requireUser } from "@/infrastructure/api/next/requireUser"
import type { GameMode } from "@/core/domain/entities/GameSession"

export async function GET(req: Request) {
  const auth = await requireUser()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const mode = new URL(req.url).searchParams.get("mode") as GameMode | null
  const history = await auth.di.game.history.execute(auth.userId, mode ?? undefined)
  return Response.json(history)
}
