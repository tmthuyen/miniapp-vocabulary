export interface SessionProps {
  id: string
  userId: string
  session_token: string
  expires_at: string
  created_at: string
}

export interface SessionDTO {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}

export class Session {
  constructor(private readonly props: SessionProps) {
    if (!props.id) throw new Error("Session.id is required")
    if (!props.userId) throw new Error("Session.userId is required")
    if (!props.session_token?.trim()) throw new Error("Session.session_token is required")
    if (!props.expires_at) throw new Error("Session.expires_at is required")
    if (!props.created_at) throw new Error("Session.created_at is required")
  }

  isExpired(now: Date = new Date()) {
    return new Date(this.props.expires_at) <= now
  }

  toDTO(): SessionDTO {
    return {
      id: this.props.id,
      user_id: this.props.userId,
      session_token: this.props.session_token,
      expires_at: this.props.expires_at,
      created_at: this.props.created_at,
    }
  }
}