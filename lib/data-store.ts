export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  dueDate?: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

export interface Comment {
  id: string
  text: string
  createdAt: string
  author: string
}

export interface Board {
  id: string
  name: string
  description?: string
  createdAt: string
  tasks: Task[]
}

class DataStore {
  private storageKey = "project-management-data"

  private getData(): { boards: Board[] } {
    if (typeof window === "undefined") return { boards: [] }

    const stored = localStorage.getItem(this.storageKey)
    if (!stored) {
      const defaultData = { boards: [this.createDefaultBoard()] }
      this.saveData(defaultData)
      return defaultData
    }
    return JSON.parse(stored)
  }

  private saveData(data: { boards: Board[] }): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }

  private createDefaultBoard(): Board {
    return {
      id: "default-board",
      name: "My Project Board",
      description: "Default project management board",
      createdAt: new Date().toISOString(),
      tasks: [
        {
          id: "1",
          title: "Welcome to your project board!",
          description: "This is a sample task. Click to edit or drag to move between columns.",
          status: "todo",
          priority: "medium",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
        },
      ],
    }
  }

  // Board operations
  getBoards(): Board[] {
    return this.getData().boards
  }

  getBoard(boardId: string): Board | undefined {
    return this.getData().boards.find((board) => board.id === boardId)
  }

  createBoard(name: string, description?: string): Board {
    const data = this.getData()
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      tasks: [],
    }
    data.boards.push(newBoard)
    this.saveData(data)
    return newBoard
  }

  // Task operations
  getTasks(boardId = "default-board"): Task[] {
    const board = this.getBoard(boardId)
    return board?.tasks || []
  }

  getTask(taskId: string, boardId = "default-board"): Task | undefined {
    const tasks = this.getTasks(boardId)
    return tasks.find((task) => task.id === taskId)
  }

  createTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">, boardId = "default-board"): Task {
    const data = this.getData()
    const board = data.boards.find((b) => b.id === boardId)
    if (!board) throw new Error("Board not found")

    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    }

    board.tasks.push(newTask)
    this.saveData(data)
    return newTask
  }

  updateTask(
    taskId: string,
    updates: Partial<Omit<Task, "id" | "createdAt" | "comments">>,
    boardId = "default-board",
  ): Task {
    const data = this.getData()
    const board = data.boards.find((b) => b.id === boardId)
    if (!board) throw new Error("Board not found")

    const taskIndex = board.tasks.findIndex((task) => task.id === taskId)
    if (taskIndex === -1) throw new Error("Task not found")

    board.tasks[taskIndex] = {
      ...board.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.saveData(data)
    return board.tasks[taskIndex]
  }

  deleteTask(taskId: string, boardId = "default-board"): void {
    const data = this.getData()
    const board = data.boards.find((b) => b.id === boardId)
    if (!board) throw new Error("Board not found")

    board.tasks = board.tasks.filter((task) => task.id !== taskId)
    this.saveData(data)
  }

  // Comment operations
  addComment(taskId: string, text: string, author = "User", boardId = "default-board"): Comment {
    const data = this.getData()
    const board = data.boards.find((b) => b.id === boardId)
    if (!board) throw new Error("Board not found")

    const task = board.tasks.find((t) => t.id === taskId)
    if (!task) throw new Error("Task not found")

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text,
      author,
      createdAt: new Date().toISOString(),
    }

    task.comments.push(newComment)
    task.updatedAt = new Date().toISOString()
    this.saveData(data)
    return newComment
  }

  // Search and filter
  searchTasks(query: string, boardId = "default-board"): Task[] {
    const tasks = this.getTasks(boardId)
    const lowercaseQuery = query.toLowerCase()

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowercaseQuery) || task.description.toLowerCase().includes(lowercaseQuery),
    )
  }

  getTasksByStatus(status: Task["status"], boardId = "default-board"): Task[] {
    const tasks = this.getTasks(boardId)
    return tasks.filter((task) => task.status === status)
  }

  getTasksByPriority(priority: Task["priority"], boardId = "default-board"): Task[] {
    const tasks = this.getTasks(boardId)
    return tasks.filter((task) => task.priority === priority)
  }
}

export const dataStore = new DataStore()
