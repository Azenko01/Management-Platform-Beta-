"use client"

import { useState, useEffect } from "react"
import { KanbanBoard } from "@/components/kanban-board"
import { AuthPage } from "@/components/auth/auth-page"
import { Header } from "@/components/header"
import { BoardSelector } from "@/components/board-selector"
import { TaskStatistics } from "@/components/task-statistics"
import { useAuth } from "@/contexts/auth-context"
import { dataStore, type Board } from "@/lib/data-store"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [columns, setColumns] = useState([])

  useEffect(() => {
    if (isAuthenticated && !currentBoard) {
      const boards = dataStore.getBoards()
      if (boards.length > 0) {
        setCurrentBoard(boards[0])
      }
    }
  }, [isAuthenticated, currentBoard])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault()
            // Focus search input
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
            if (searchInput) searchInput.focus()
            break
          case "s":
            e.preventDefault()
            setShowStats(!showStats)
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showStats])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleStats={() => setShowStats(!showStats)} showingStats={showStats} />
      <main>
        <div className="container mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Project Management</h1>
                  <p className="text-muted-foreground">Organize your tasks and boost productivity</p>
                </div>
                <BoardSelector currentBoard={currentBoard} onBoardChange={setCurrentBoard} />
              </div>

              <KanbanBoard key={currentBoard.id} boardId={currentBoard.id} onColumnsChange={setColumns} />
            </div>

            {showStats && (
              <div className="lg:w-80 space-y-4">
                <h2 className="text-lg font-semibold">Statistics</h2>
                <TaskStatistics columns={columns} />
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border rounded-lg p-2 hidden lg:block">
        <div>⌘K Search • ⌘S Stats</div>
      </div>
    </div>
  )
}
