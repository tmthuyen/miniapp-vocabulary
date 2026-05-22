import type { IGameRepository } from "@/domain/repositories/IGameRepository"
import type { GameMode } from "@/core/domain/entities/GameSession"

export class GetMyGameHistory {
  constructor(private readonly repo: IGameRepository) {}

  async execute(userId: string, mode?: GameMode) {
    if (!userId) throw new Error("userId is required")
    return this.repo.getHistory(userId, mode)
  }
}
