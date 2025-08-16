"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import type { Column } from "./kanban-board"

interface TaskStatisticsProps {
  columns: Column[]
}

export function TaskStatistics({ columns }: TaskStatisticsProps) {
  const allTasks = columns.flatMap((column) => column.tasks)
  const totalTasks = allTasks.length

  const todoTasks = columns.find((col) => col.id === "todo")?.tasks.length || 0
  const inProgressTasks = columns.find((col) => col.id === "in-progress")?.tasks.length || 0
  const doneTasks = columns.find((col) => col.id === "done")?.tasks.length || 0

  const highPriorityTasks = allTasks.filter((task) => task.priority === "high").length
  const overdueTasks = allTasks.filter((task) => {
    if (!task.deadline) return false
    return new Date(task.deadline) < new Date()
  }).length

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Completed",
      value: doneTasks,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "High Priority",
      value: highPriorityTasks,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {todoTasks} To Do
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {inProgressTasks} In Progress
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {doneTasks} Done
            </Badge>
            {overdueTasks > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueTasks} Overdue
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
