import type { IGameRepository } from "@/domain/repositories/IGameRepository"

export class SubmitGameAnswer {
  constructor(private readonly repo: IGameRepository) {}

  async execute(userId: string, input: { sessionId: string; prompt: string; expected: string; submitted: string }) {
    if (!userId) throw new Error("userId is required")
    if (!input.sessionId) throw new Error("sessionId is required")
    return this.repo.submitAnswer(userId, input)
  }
}
