"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus } from "lucide-react"
import type { Vocabulary } from "./vocabulary-card"

interface AddVocabularyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vocabulary?: Vocabulary | null
  onSuccess?: () => void
}

// Default categories as fallback
const DEFAULT_CATEGORIES = [
  "General",
  "Academic",
  "Business",
  "Technology",
  "Science",
  "Arts",
  "Travel",
  "Food",
  "Health",
  "Sports",
]

const difficulties: ("Easy" | "Medium" | "Hard")[] = ["Easy", "Medium", "Hard"]

export function AddVocabularyDialog({
  open,
  onOpenChange,
  vocabulary,
  onSuccess,
}: AddVocabularyDialogProps) {
  const [word, setWord] = useState("")
  const [ipa, setIpa] = useState("")
  const [definition, setDefinition] = useState("")
  const [example, setExample] = useState("")
  const [category, setCategory] = useState("General")
  const [customCategory, setCustomCategory] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load categories from database when dialog opens
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  useEffect(() => {
    if (vocabulary) {
      setWord(vocabulary.word)
      setIpa(vocabulary.ipa || "")
      setDefinition(vocabulary.definition || "")
      setExample(vocabulary.example || "")
      setCategory(vocabulary.category)
      setDifficulty(vocabulary.difficulty)
      setShowCustomInput(false)
      setCustomCategory("")
    } else {
      resetForm()
    }
  }, [vocabulary, open])

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/vocabulary/categories")
      if (!res.ok) throw new Error("Failed to load categories")
      const data = (await res.json()) as { categories: string[] }

      const dbCategories = (data.categories || []).sort()

      // Combine with default categories, remove duplicates, and sort
      const allCategories = Array.from(
        new Set([...DEFAULT_CATEGORIES, ...dbCategories])
      ).sort()

      setCategories(allCategories)
    } catch (error) {
      console.error("Error loading categories:", error)
      // Fallback to default categories
      setCategories(DEFAULT_CATEGORIES)
    }
  }

  const resetForm = () => {
    setWord("")
    setIpa("")
    setDefinition("")
    setExample("")
    setCategory("General")
    setDifficulty("Medium")
    setShowCustomInput(false)
    setCustomCategory("")
    setError(null)
  }

  const handleCategorySelect = (selectedCategory: string) => {
    if (selectedCategory === "__custom__") {
      setShowCustomInput(true)
      setCustomCategory("")
    } else {
      setCategory(selectedCategory)
      setShowCustomInput(false)
      setCustomCategory("")
    }
  }

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      const newCategory = customCategory.trim()
      setCategory(newCategory)
      // Add to categories list if not exists
      if (!categories.includes(newCategory)) {
        setCategories([...categories, newCategory].sort())
      }
      setShowCustomInput(false)
      setCustomCategory("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!word.trim()) {
      setError("Word is required")
      return
    }

    const finalCategory = showCustomInput && customCategory.trim() 
      ? customCategory.trim() 
      : category.trim() || "General"

    setLoading(true)

    try {
      if (vocabulary) {
        // Update existing vocabulary
        const res = await fetch(`/api/vocabulary/${vocabulary.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: word.trim(),
            ipa: ipa.trim() || null,
            definition: definition.trim() || null,
            example: example.trim() || null,
            category: finalCategory,
            difficulty,
          }),
        })
        if (!res.ok) throw new Error("Failed to update vocabulary")
      } else {
        // Create new vocabulary
        const res = await fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: word.trim(),
            ipa: ipa.trim() || null,
            definition: definition.trim() || null,
            example: example.trim() || null,
            category: finalCategory,
            difficulty,
          }),
        })
        if (!res.ok) throw new Error("Failed to create vocabulary")
      }

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to save vocabulary")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{vocabulary ? "Edit Word" : "Add New Word"}</DialogTitle>
          <DialogDescription>
            {vocabulary
              ? "Update the word details below"
              : "Add a new word to your vocabulary collection"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="word" className="text-sm font-medium">
              Word <span className="text-red-500">*</span>
            </label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g., vocabulary"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="ipa" className="text-sm font-medium">
              IPA (International Phonetic Alphabet)
            </label>
            <Input
              id="ipa"
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
              placeholder="e.g., vəˈkæbjəˌleri"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="definition" className="text-sm font-medium">
              Definition
            </label>
            <Input
              id="definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="e.g., a body of words used in a particular language"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="example" className="text-sm font-medium">
              Example Sentence
            </label>
            <Input
              id="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="e.g., I need to expand my vocabulary"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              {showCustomInput ? (
                <div className="flex gap-2">
                  <Input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter new category"
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleCustomCategorySubmit()
                      } else if (e.key === "Escape") {
                        setShowCustomInput(false)
                        setCustomCategory("")
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCustomCategorySubmit}
                    disabled={loading || !customCategory.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={loading}
                      type="button"
                    >
                      {category}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuLabel>Select Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories.map((cat) => (
                      <DropdownMenuItem
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                      >
                        {cat}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleCategorySelect("__custom__")}
                      className="text-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={loading}
                    type="button"
                  >
                    {difficulty}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {difficulties.map((diff) => (
                    <DropdownMenuItem
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                    >
                      {diff}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : vocabulary ? "Update" : "Add Word"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


