export type GameMode = "matching" | "flashcard" | "quiz" | "fill"

export interface GameSessionProps {
  id: string
  userId: string
  mode: GameMode
  status: "active" | "finished"
  totalQuestions: number
  correctAnswers: number
  score: number
  startedAt: string
  finishedAt?: string | null
}

export class GameSession {
  constructor(private readonly props: GameSessionProps) {
    if (!props.id) throw new Error("GameSession.id is required")
    if (!props.userId) throw new Error("GameSession.userId is required")
  }

  toDTO() {
    return {
      id: this.props.id,
      user_id: this.props.userId,
      mode: this.props.mode,
      status: this.props.status,
      total_questions: this.props.totalQuestions,
      correct_answers: this.props.correctAnswers,
      score: this.props.score,
      started_at: this.props.startedAt,
      finished_at: this.props.finishedAt ?? null,
    }
  }
}
