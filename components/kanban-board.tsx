"use client"

import type React from "react"
import { useEffect, useState, useReducer } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter } from "lucide-react"
import { TaskCard } from "./task-card"
import { AddTaskDialog } from "./add-task-dialog"
import { EditTaskDialog } from "./edit-task-dialog"
import { TaskDetailsModal } from "./task-details-modal" // Added import for task details modal
import { dataStore } from "@/lib/data-store"

export interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  deadline?: string
  columnId: string
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
}

type TaskAction =
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "MOVE_TASK"; payload: { taskId: string; newColumnId: string } }
  | { type: "SET_TASKS"; payload: Column[] }

function taskReducer(state: Column[], action: TaskAction): Column[] {
  switch (action.type) {
    case "ADD_TASK":
      return state.map((column) =>
        column.id === action.payload.columnId ? { ...column, tasks: [...column.tasks, action.payload] } : column,
      )
    case "UPDATE_TASK":
      return state.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)),
      }))
    case "DELETE_TASK":
      return state.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== action.payload),
      }))
    case "MOVE_TASK":
      const { taskId, newColumnId } = action.payload
      let taskToMove: Task | null = null

      // Remove task from current column
      const withoutTask = state.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => {
          if (task.id === taskId) {
            taskToMove = { ...task, columnId: newColumnId, updatedAt: new Date().toISOString() }
            return false
          }
          return true
        }),
      }))

      // Add task to new column
      if (taskToMove) {
        return withoutTask.map((column) =>
          column.id === newColumnId ? { ...column, tasks: [...column.tasks, taskToMove] } : column,
        )
      }
      return withoutTask
    case "SET_TASKS":
      return action.payload
    default:
      return state
  }
}

interface KanbanBoardProps {
  boardId?: string
  onColumnsChange?: (columns: Column[]) => void
}

export function KanbanBoard({ boardId = "default-board", onColumnsChange }: KanbanBoardProps) {
  const [columns, dispatch] = useReducer(taskReducer, [], () => {
    const tasks = dataStore.getTasks(boardId)
    const initialColumns: Column[] = [
      {
        id: "todo",
        title: "To Do",
        tasks: tasks.filter((task) => task.status === "todo"),
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: tasks.filter((task) => task.status === "in-progress"),
      },
      {
        id: "done",
        title: "Done",
        tasks: tasks.filter((task) => task.status === "done"),
      },
    ]
    return initialColumns
  })

  useEffect(() => {
    if (onColumnsChange) {
      onColumnsChange(columns)
    }
  }, [columns, onColumnsChange])

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false) // Added state for task details modal
  const [selectedColumnId, setSelectedColumnId] = useState<string>("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailsTask, setDetailsTask] = useState<Task | null>(null) // Added state for task details
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId)
    setIsAddTaskOpen(true)
  }

  const handleCreateTask = (taskData: Omit<Task, "id" | "columnId" | "createdAt" | "updatedAt">) => {
    const newTask = dataStore.createTask(
      {
        ...taskData,
        status: selectedColumnId as "todo" | "in-progress" | "done",
      },
      boardId,
    )

    dispatch({ type: "ADD_TASK", payload: { ...newTask, columnId: selectedColumnId } })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditTaskOpen(true)
  }

  const handleUpdateTask = (taskData: Omit<Task, "id" | "columnId" | "createdAt" | "updatedAt">) => {
    if (!editingTask) return

    const updatedTask = dataStore.updateTask(editingTask.id, taskData, boardId)
    dispatch({ type: "UPDATE_TASK", payload: { ...updatedTask, columnId: editingTask.columnId } })
  }

  const handleDeleteTask = (taskId: string) => {
    dataStore.deleteTask(taskId, boardId)
    dispatch({ type: "DELETE_TASK", payload: taskId })
  }

  const handleMoveTask = (taskId: string, newColumnId: string) => {
    const statusMap = {
      todo: "todo" as const,
      "in-progress": "in-progress" as const,
      done: "done" as const,
    }

    dataStore.updateTask(taskId, { status: statusMap[newColumnId] }, boardId)
    dispatch({
      type: "MOVE_TASK",
      payload: { taskId, newColumnId },
    })
  }

  const filterTasks = (tasks: Task[]) => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      return matchesSearch && matchesPriority
    })
  }

  const getFilteredTaskCount = (tasks: Task[]) => {
    return filterTasks(tasks).length
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", task.id)

    // Add visual feedback to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5"
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null)
    setDragOverColumn(null)

    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (draggedTask && draggedTask.columnId !== columnId) {
      dispatch({
        type: "MOVE_TASK",
        payload: { taskId: draggedTask.id, newColumnId: columnId },
      })
    }
    setDraggedTask(null)
  }

  const handleOpenTaskDetails = (task: Task) => {
    // Added handler for opening task details
    setDetailsTask(task)
    setIsTaskDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as "all" | "low" | "medium" | "high")}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => {
          const filteredTasks = filterTasks(column.tasks)
          const isDragOver = dragOverColumn === column.id
          const canDrop = draggedTask && draggedTask.columnId !== column.id

          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <Card
                className={`bg-card border-border transition-all duration-200 ${
                  isDragOver && canDrop ? "border-primary border-2 bg-primary/5" : ""
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-card-foreground">{column.title}</h3>
                    <div className="flex items-center gap-2">
                      {searchQuery || priorityFilter !== "all" ? (
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {filteredTasks.length}/{column.tasks.length}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {column.tasks.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 space-y-3 min-h-[400px] transition-colors duration-200 ${
                    isDragOver && canDrop ? "bg-muted/30" : ""
                  }`}
                >
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedTask?.id === task.id}
                      onOpenDetails={handleOpenTaskDetails} // Added callback for opening task details
                    />
                  ))}

                  {filteredTasks.length === 0 && column.tasks.length > 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No tasks match your search criteria
                    </div>
                  )}

                  {isDragOver && canDrop && filteredTasks.length === 0 && (
                    <div className="text-center py-12 text-primary text-sm font-medium border-2 border-dashed border-primary rounded-lg bg-primary/5">
                      Drop task here
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => handleAddTask(column.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add a task
                  </Button>
                </div>
              </Card>
            </div>
          )
        })}
      </div>

      {draggedTask && (
        <div className="fixed top-4 left-4 z-50 bg-background border border-border rounded-lg p-2 shadow-lg pointer-events-none">
          <div className="text-sm font-medium text-foreground">Moving: {draggedTask.title}</div>
          <div className="text-xs text-muted-foreground">Drop in a different column</div>
        </div>
      )}

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} onCreateTask={handleCreateTask} />

      <EditTaskDialog
        open={isEditTaskOpen}
        onOpenChange={setIsEditTaskOpen}
        task={editingTask}
        onUpdateTask={handleUpdateTask}
      />

      <TaskDetailsModal // Added task details modal
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        task={detailsTask}
        columns={columns}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onMoveTask={handleMoveTask}
      />
    </div>
  )
}
