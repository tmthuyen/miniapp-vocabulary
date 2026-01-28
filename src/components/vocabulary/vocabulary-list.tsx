"use client"

import { useCallback, useEffect, useState } from "react"
import { VocabularyCard, type Vocabulary } from "./vocabulary-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react"
import { AddVocabularyDialog } from "./add-vocabulary-dialog"
import { Badge } from "@/components/ui/badge"

interface VocabularyListProps {
  onUpdate?: () => void
}

const ITEMS_PER_PAGE = 9

export function VocabularyList({ onUpdate }: VocabularyListProps) {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [filteredVocabularies, setFilteredVocabularies] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<string[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadVocabularies()
  }, [])

  const loadVocabularies = async () => {
    try {
      const res = await fetch("/api/vocabulary")
      if (!res.ok) throw new Error("Failed to load vocabularies")
      const data = (await res.json()) as Vocabulary[]

      setVocabularies(data || [])
      
      // Extract unique categories from database
      const uniqueCategories = Array.from(
        new Set(data?.map((v) => v.category).filter(Boolean) || [])
      ).sort()
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error loading vocabularies:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterVocabularies = useCallback(() => {
    let filtered = vocabularies

    // Filter by categories (multi-select)
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((v) => 
        selectedCategories.has(v.category)
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.word.toLowerCase().includes(query) ||
          v.definition?.toLowerCase().includes(query) ||
          v.example?.toLowerCase().includes(query)
      )
    }

    setFilteredVocabularies(filtered)
  }, [vocabularies, selectedCategories, searchQuery])

  useEffect(() => {
    filterVocabularies()
    setCurrentPage(1) // Reset to first page when filters change
  }, [filterVocabularies])

  const toggleCategory = (category: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(category)) {
      newSelected.delete(category)
    } else {
      newSelected.add(category)
    }
    setSelectedCategories(newSelected)
  }

  const clearAllFilters = () => {
    setSelectedCategories(new Set())
    setSearchQuery("")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this word?")) return

    try {
      const res = await fetch(`/api/vocabulary/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")

      await loadVocabularies()
      onUpdate?.()
    } catch (error) {
      console.error("Error deleting vocabulary:", error)
      alert("Failed to delete vocabulary")
    }
  }

  const handleEdit = (vocab: Vocabulary) => {
    setEditingVocabulary(vocab)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setEditingVocabulary(null)
    loadVocabularies()
    onUpdate?.()
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredVocabularies.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedVocabularies = filteredVocabularies.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading vocabularies...
      </div>
    )
  }

  const hasActiveFilters = selectedCategories.size > 0 || searchQuery.trim() !== ""

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words, definitions, or examples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Categories
              {selectedCategories.size > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCategories.size}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No categories available
              </div>
            ) : (
              categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.has(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Array.from(selectedCategories).map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleCategory(cat)}
            >
              {cat}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {searchQuery && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setSearchQuery("")}
            >
              Search: {searchQuery}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredVocabularies.length)} of{" "}
        {filteredVocabularies.length} word{filteredVocabularies.length !== 1 ? "s" : ""}
      </div>

      {paginatedVocabularies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {hasActiveFilters
            ? "No words found matching your filters"
            : "No words yet. Add your first word to get started!"}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedVocabularies.map((vocab) => (
              <VocabularyCard
                key={vocab.id}
                vocabulary={vocab}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>
                  }
                  return null
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {editingVocabulary && (
        <AddVocabularyDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          vocabulary={editingVocabulary}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}


