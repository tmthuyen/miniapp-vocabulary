import type { GameMode, GameSession } from "@/core/domain/entities/GameSession"

export interface StartGameInput {
  mode: GameMode
  totalQuestions: number
}

export interface SubmitGameAnswerInput {
  sessionId: string
  prompt: string
  expected: string
  submitted: string
}

export interface GameHistoryItem {
  id: string
  mode: GameMode
  score: number
  total_questions: number
  correct_answers: number
  started_at: string
  finished_at: string | null
}

export interface IGameRepository {
  createSession(userId: string, input: StartGameInput): Promise<GameSession>
  submitAnswer(userId: string, input: SubmitGameAnswerInput): Promise<{ isCorrect: boolean; score: number; correctAnswers: number }>
  finishSession(userId: string, sessionId: string): Promise<GameSession>
  getHistory(userId: string, mode?: GameMode): Promise<GameHistoryItem[]>
}
