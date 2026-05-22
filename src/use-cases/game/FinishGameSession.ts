import type { IGameRepository } from "@/domain/repositories/IGameRepository"

export class FinishGameSession {
  constructor(private readonly repo: IGameRepository) {}

  async execute(userId: string, sessionId: string) {
    if (!userId) throw new Error("userId is required")
    if (!sessionId) throw new Error("sessionId is required")
    return this.repo.finishSession(userId, sessionId)
  }
}
