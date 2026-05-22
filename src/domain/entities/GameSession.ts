import { GameAnswer, type GameAnswerDTO, type GameAnswerProps } from "@/domain/entities/GameAnswer"

export type GameMode = "matching" | "flashcard" | "quiz" | "fill"

export interface GameSessionProps {
  id: string
  userId: string
  mode: GameMode
  status: string
  started_at: string
  finished_at: string | null
  total_questions: number
  correct_answers: number
  score: number
  answers?: GameAnswerProps[]
}

export interface GameSessionDTO {
  id: string
  user_id: string
  mode: GameMode
  status: string
  started_at: string
  finished_at: string | null
  total_questions: number
  correct_answers: number
  score: number
  answers?: GameAnswerDTO[]
}

export class GameSession {
  constructor(private readonly props: GameSessionProps) {
    if (!props.id) throw new Error("GameSession.id is required")
    if (!props.userId) throw new Error("GameSession.userId is required")
    if (!props.mode) throw new Error("GameSession.mode is required")
    if (!props.status?.trim()) throw new Error("GameSession.status is required")
    if (!props.started_at) throw new Error("GameSession.started_at is required")
    if (props.total_questions < 0) throw new Error("GameSession.total_questions must be >= 0")
    if (props.correct_answers < 0) throw new Error("GameSession.correct_answers must be >= 0")
    if (props.score < 0) throw new Error("GameSession.score must be >= 0")
  }

  isActive() {
    return this.props.status === "active"
  }

  isFinished() {
    return this.props.status === "finished"
  }

  addAnswer(answer: GameAnswerProps) {
    const answers = this.props.answers ?? []
    return new GameSession({
      ...this.props,
      answers: [...answers, answer],
    })
  }

  toDTO(): GameSessionDTO {
    return {
      id: this.props.id,
      user_id: this.props.userId,
      mode: this.props.mode,
      status: this.props.status,
      started_at: this.props.started_at,
      finished_at: this.props.finished_at,
      total_questions: this.props.total_questions,
      correct_answers: this.props.correct_answers,
      score: this.props.score,
      answers: this.props.answers?.map((answer) => new GameAnswer(answer).toDTO()),
    }
  }
}