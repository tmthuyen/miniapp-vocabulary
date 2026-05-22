import { GameSession } from "@/core/domain/entities/GameSession"
import type { GameMode } from "@/core/domain/entities/GameSession"
import type { IGameRepository, StartGameInput, SubmitGameAnswerInput } from "@/domain/repositories/IGameRepository"
import { prisma } from "@/infrastructure/database/prisma/client"

function toEntity(row: any) {
  return new GameSession({
    id: row.id,
    userId: row.user_id,
    mode: row.mode as GameMode,
    status: row.status,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    score: row.score,
    startedAt: row.started_at.toISOString(),
    finishedAt: row.finished_at ? row.finished_at.toISOString() : null,
  })
}

export class PrismaGameRepository implements IGameRepository {
  async createSession(userId: string, input: StartGameInput) {
    const row = await prisma.gameSession.create({
      data: {
        user_id: userId,
        mode: input.mode,
        total_questions: input.totalQuestions,
      },
    })
    return toEntity(row)
  }

  async submitAnswer(userId: string, input: SubmitGameAnswerInput) {
    const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId } })
    if (!session || session.user_id !== userId) throw new Error("Session not found")
    if (session.status !== "active") throw new Error("Session is finished")

    const normalize = (v: string) => v.trim().toLowerCase()
    const isCorrect = normalize(input.expected) === normalize(input.submitted)

    await prisma.gameAnswer.create({
      data: {
        session_id: input.sessionId,
        prompt: input.prompt,
        expected: input.expected,
        submitted: input.submitted,
        is_correct: isCorrect,
      },
    })

    const updated = await prisma.gameSession.update({
      where: { id: input.sessionId },
      data: {
        correct_answers: { increment: isCorrect ? 1 : 0 },
        score: { increment: isCorrect ? 10 : 0 },
      },
    })

    return {
      isCorrect,
      score: updated.score,
      correctAnswers: updated.correct_answers,
    }
  }

  async finishSession(userId: string, sessionId: string) {
    const row = await prisma.gameSession.updateMany({
      where: { id: sessionId, user_id: userId, status: "active" },
      data: { status: "finished", finished_at: new Date() },
    })
    if (row.count === 0) throw new Error("Session not found or already finished")

    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session) throw new Error("Session not found")
    return toEntity(session)
  }

  async getHistory(userId: string, mode?: GameMode) {
    const rows = await prisma.gameSession.findMany({
      where: { user_id: userId, ...(mode ? { mode } : {}) },
      orderBy: { started_at: "desc" },
      take: 50,
    })

    return rows.map((r) => ({
      id: r.id,
      mode: r.mode as GameMode,
      score: r.score,
      total_questions: r.total_questions,
      correct_answers: r.correct_answers,
      started_at: r.started_at.toISOString(),
      finished_at: r.finished_at ? r.finished_at.toISOString() : null,
    }))
  }
}
