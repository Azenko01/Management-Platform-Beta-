"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, ChevronDown, Folder, Trash2 } from "lucide-react"
import { dataStore, type Board } from "@/lib/data-store"

interface BoardSelectorProps {
  currentBoard: Board
  onBoardChange: (board: Board) => void
}

export function BoardSelector({ currentBoard, onBoardChange }: BoardSelectorProps) {
  const [boards, setBoards] = useState<Board[]>(dataStore.getBoards())
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  const [newBoardDescription, setNewBoardDescription] = useState("")

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return

    const newBoard = dataStore.createBoard(newBoardName.trim(), newBoardDescription.trim())
    setBoards(dataStore.getBoards())
    onBoardChange(newBoard)
    setNewBoardName("")
    setNewBoardDescription("")
    setIsCreateOpen(false)
  }

  const handleDeleteBoard = (boardId: string) => {
    if (boards.length <= 1) return // Don't delete the last board

    // Implementation would go here - for now just show alert
    alert("Board deletion not implemented in this demo")
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between min-w-[200px] bg-transparent">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span className="truncate">{currentBoard.name}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px]">
          {boards.map((board) => (
            <DropdownMenuItem
              key={board.id}
              onClick={() => onBoardChange(board)}
              className={`flex items-center justify-between ${board.id === currentBoard.id ? "bg-accent" : ""}`}
            >
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <div>
                  <div className="font-medium">{board.name}</div>
                  {board.description && (
                    <div className="text-xs text-muted-foreground truncate">{board.description}</div>
                  )}
                </div>
              </div>
              {boards.length > 1 && board.id !== currentBoard.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteBoard(board.id)
                  }}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="h-4 w-4 mr-2" />
                Create new board
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
                <DialogDescription>Create a new project board to organize your tasks.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="board-name">Board Name</Label>
                  <Input
                    id="board-name"
                    placeholder="Enter board name"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="board-description">Description (optional)</Label>
                  <Input
                    id="board-description"
                    placeholder="Enter board description"
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBoard} disabled={!newBoardName.trim()}>
                    Create Board
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
