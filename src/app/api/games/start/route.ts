import { requireUser, requireVip } from "@/infrastructure/api/next/requireUser"
import type { GameMode } from "@/core/domain/entities/GameSession"

function getRequiredPlan(mode: GameMode): "none" | "vip_basic" | "vip_pro" {
  if (mode === "matching") return "vip_pro"
  if (mode === "fill") return "vip_basic"
  return "none"
}

export async function POST(req: Request) {
  const body = (await req.json()) as { mode?: GameMode; totalQuestions?: number }
  const mode = body.mode ?? "flashcard"
  const totalQuestions = body.totalQuestions ?? 10

  const required = getRequiredPlan(mode)
  const auth = required === "none" ? await requireUser() : await requireVip(required)
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const session = await auth.di.game.startSession.execute(auth.userId, mode, totalQuestions)
  return Response.json(session.toDTO())
}
