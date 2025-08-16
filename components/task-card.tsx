"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trash2, Edit3, Clock, GripVertical } from "lucide-react"
import type { Task } from "./kanban-board"

interface TaskCardProps {
  task: Task
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
  onDragStart: (e: React.DragEvent, task: Task) => void
  onDragEnd: (e: React.DragEvent) => void
  isDragging: boolean
  onOpenDetails: (task: Task) => void // Added callback for opening task details
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200",
}

export function TaskCard({ task, onDelete, onEdit, onDragStart, onDragEnd, isDragging, onOpenDetails }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

  const isDeadlineApproaching = (deadline?: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffInDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays <= 3 && diffInDays >= 0
  }

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return deadlineDate < now
  }

  return (
    <Card
      className={`bg-background border-border hover:shadow-md transition-all duration-200 cursor-move group ${
        isDragging ? "opacity-50 rotate-2 scale-105" : ""
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onOpenDetails(task)} // Added click handler to open task details
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 flex-1">
            <GripVertical
              className="w-4 h-4 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()} // Prevent opening details when clicking drag handle
            />
            <h4 className="font-medium text-foreground text-sm leading-tight flex-1 cursor-pointer">{task.title}</h4>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {task.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2 ml-6">{task.description}</p>}

        <div className="flex items-center justify-between mb-2 ml-6">
          <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>

          {task.deadline && (
            <div
              className={`flex items-center text-xs ${
                isOverdue(task.deadline)
                  ? "text-destructive"
                  : isDeadlineApproaching(task.deadline)
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-muted-foreground"
              }`}
            >
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(task.deadline)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border ml-6">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Updated {formatRelativeTime(task.updatedAt)}
          </div>
          <div className="text-xs">ID: {task.id.slice(-4)}</div>
        </div>
      </div>
    </Card>
  )
}
