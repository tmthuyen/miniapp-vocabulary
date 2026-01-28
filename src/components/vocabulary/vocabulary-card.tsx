"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Volume2, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/shared/utils/cn"

export interface Vocabulary {
  id: string
  word: string
  ipa?: string
  definition?: string
  example?: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  created_at: string
}

interface VocabularyCardProps {
  vocabulary: Vocabulary
  onEdit: (vocab: Vocabulary) => void
  onDelete: (id: string) => void
}

export function VocabularyCard({ vocabulary, onEdit, onDelete }: VocabularyCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speakWord = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser")
      return
    }

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(vocabulary.word)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const getDifficultyColor = (difficulty: string) => {
    // Sử dụng theme colors thay vì hardcoded colors
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20"
      case "Hard":
        return "bg-destructive/10 text-destructive dark:text-destructive border border-destructive/20"
      default:
        return "bg-muted text-muted-foreground border border-border"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">{vocabulary.word}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={speakWord}
                disabled={isSpeaking}
              >
                <Volume2 className={cn("h-4 w-4", isSpeaking && "animate-pulse")} />
              </Button>
            </div>
            {vocabulary.ipa && (
              <p className="text-sm text-muted-foreground font-mono">
                /{vocabulary.ipa}/
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {vocabulary.category}
          </Badge>
          <Badge className={cn("text-xs", getDifficultyColor(vocabulary.difficulty))}>
            {vocabulary.difficulty}
          </Badge>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-3">
          {vocabulary.definition && (
            <div>
              <p className="text-sm font-medium mb-1">Definition:</p>
              <p className="text-sm text-muted-foreground">{vocabulary.definition}</p>
            </div>
          )}
          {vocabulary.example && (
            <div>
              <p className="text-sm font-medium mb-1">Example:</p>
              <p className="text-sm text-muted-foreground italic">
                `\&quot;{vocabulary.example}\&quot;`
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(vocabulary)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(vocabulary.id)}
              className="flex-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}


