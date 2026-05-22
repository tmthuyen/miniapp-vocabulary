export interface GameAnswerProps {
  id: string
  sessionId: string
  prompt: string
  expected: string
  submitted: string
  is_correct: boolean
  created_at: string
}

export interface GameAnswerDTO {
  id: string
  session_id: string
  prompt: string
  expected: string
  submitted: string
  is_correct: boolean
  created_at: string
}

export class GameAnswer {
  constructor(private readonly props: GameAnswerProps) {
    if (!props.id) throw new Error("GameAnswer.id is required")
    if (!props.sessionId) throw new Error("GameAnswer.sessionId is required")
    if (!props.prompt?.trim()) throw new Error("GameAnswer.prompt is required")
    if (!props.expected?.trim()) throw new Error("GameAnswer.expected is required")
    if (!props.submitted?.trim()) throw new Error("GameAnswer.submitted is required")
    if (!props.created_at) throw new Error("GameAnswer.created_at is required")
  }

  isCorrect() {
    return this.props.is_correct
  }

  toDTO(): GameAnswerDTO {
    return {
      id: this.props.id,
      session_id: this.props.sessionId,
      prompt: this.props.prompt,
      expected: this.props.expected,
      submitted: this.props.submitted,
      is_correct: this.props.is_correct,
      created_at: this.props.created_at,
    }
  }
}