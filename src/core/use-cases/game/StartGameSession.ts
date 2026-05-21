import type { IGameRepository } from "@/core/interfaces/repositories/IGameRepository"
import type { GameMode } from "@/core/domain/entities/GameSession"

export class StartGameSession {
  constructor(private readonly repo: IGameRepository) {}

  async execute(userId: string, mode: GameMode, totalQuestions: number) {
    if (!userId) throw new Error("userId is required")
    if (totalQuestions <= 0) throw new Error("totalQuestions must be > 0")
    return this.repo.createSession(userId, { mode, totalQuestions })
  }
}
