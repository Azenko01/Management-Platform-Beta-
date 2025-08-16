"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Edit3, Save, X, Trash2, ArrowRight, User, MessageSquare, Activity } from "lucide-react"
import type { Task, Column } from "./kanban-board"

interface TaskDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  columns: Column[]
  onUpdateTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  onDeleteTask: (taskId: string) => void
  onMoveTask: (taskId: string, newColumnId: string) => void
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function TaskDetailsModal({
  open,
  onOpenChange,
  task,
  columns,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}: TaskDetailsModalProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [deadline, setDeadline] = useState("")
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<Array<{ id: string; text: string; timestamp: string }>>([])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setPriority(task.priority)
      setDeadline(task.deadline || "")
      // Initialize with some sample comments for demo
      setComments([
        {
          id: "1",
          text: "Task created and assigned",
          timestamp: task.createdAt,
        },
      ])
    }
  }, [task])

  if (!task) return null

  const currentColumn = columns.find((col) => col.id === task.columnId)

  const handleSaveTitle = () => {
    if (title.trim()) {
      onUpdateTask({
        title: title.trim(),
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        columnId: task.columnId,
      })
      setIsEditingTitle(false)
    }
  }

  const handleSaveDescription = () => {
    onUpdateTask({
      title: task.title,
      description: description.trim(),
      priority: task.priority,
      deadline: task.deadline,
      columnId: task.columnId,
    })
    setIsEditingDescription(false)
  }

  const handlePriorityChange = (newPriority: "low" | "medium" | "high") => {
    setPriority(newPriority)
    onUpdateTask({
      title: task.title,
      description: task.description,
      priority: newPriority,
      deadline: task.deadline,
      columnId: task.columnId,
    })
  }

  const handleDeadlineChange = (newDeadline: string) => {
    setDeadline(newDeadline)
    onUpdateTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: newDeadline || undefined,
      columnId: task.columnId,
    })
  }

  const handleColumnChange = (newColumnId: string) => {
    if (newColumnId !== task.columnId) {
      onMoveTask(task.id, newColumnId)
    }
  }

  const handleAddComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now().toString(),
        text: comment.trim(),
        timestamp: new Date().toISOString(),
      }
      setComments((prev) => [...prev, newComment])
      setComment("")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return formatDate(dateString)
  }

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return deadlineDate < now
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-semibold"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle()
                      if (e.key === "Escape") {
                        setTitle(task.title)
                        setIsEditingTitle(false)
                      }
                    }}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveTitle}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTitle(task.title)
                      setIsEditingTitle(false)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-lg font-semibold text-foreground">{task.title}</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${priorityColors[task.priority]}`}>
                {task.priority} priority
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDeleteTask(task.id)
                  onOpenChange(false)
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            in <span className="font-medium">{currentColumn?.title}</span> • ID: {task.id}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Description</Label>
                {!isEditingDescription && (
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingDescription(true)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Add a description..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveDescription}>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDescription(task.description)
                        setIsEditingDescription(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[100px] p-3 border border-border rounded-md bg-muted/30">
                  {task.description ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No description provided</p>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4" />
                <Label className="text-sm font-medium">Comments</Label>
              </div>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-md">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">You</span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm text-foreground">{comment.text}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleAddComment()
                      }
                    }}
                  />
                  <Button onClick={handleAddComment} disabled={!comment.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Actions</Label>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Move to</Label>
                  <Select value={task.columnId} onValueChange={handleColumnChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" />
                            {column.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Priority</Label>
                  <Select value={priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Deadline</Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => handleDeadlineChange(e.target.value)}
                    className={deadline && isOverdue(deadline) ? "border-destructive" : ""}
                  />
                  {deadline && isOverdue(deadline) && (
                    <p className="text-xs text-destructive mt-1">This task is overdue</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Task Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4" />
                <Label className="text-sm font-medium">Task Information</Label>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Created</div>
                    <div className="font-medium">{formatDate(task.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Last updated</div>
                    <div className="font-medium">{formatDate(task.updatedAt)}</div>
                  </div>
                </div>

                {deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Deadline</div>
                      <div className={`font-medium ${isOverdue(deadline) ? "text-destructive" : ""}`}>
                        {formatDate(deadline)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
