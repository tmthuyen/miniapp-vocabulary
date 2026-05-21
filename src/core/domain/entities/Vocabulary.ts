export type VocabularyDifficulty = "Easy" | "Medium" | "Hard"

export interface VocabularyProps {
  id: string
  userId: string
  setId?: string | null
  word: string
  ipa?: string | null
  definition?: string | null
  example?: string | null
  category: string
  difficulty: VocabularyDifficulty
  createdAt: string
}

export interface VocabularyDTO {
  id: string
  set_id?: string | null
  word: string
  ipa?: string | null
  definition?: string | null
  example?: string | null
  category: string
  difficulty: VocabularyDifficulty
  created_at: string
}

export class Vocabulary {
  private readonly props: VocabularyProps

  constructor(props: VocabularyProps) {
    if (!props.id) throw new Error("Vocabulary.id is required")
    if (!props.userId) throw new Error("Vocabulary.userId is required")
    if (!props.word?.trim()) throw new Error("Vocabulary.word is required")
    if (!props.category?.trim()) throw new Error("Vocabulary.category is required")
    this.props = props
  }

  toDTO(): VocabularyDTO {
    return {
      id: this.props.id,
      set_id: this.props.setId ?? null,
      word: this.props.word,
      ipa: this.props.ipa ?? null,
      definition: this.props.definition ?? null,
      example: this.props.example ?? null,
      category: this.props.category,
      difficulty: this.props.difficulty,
      created_at: this.props.createdAt,
    }
  }
}
