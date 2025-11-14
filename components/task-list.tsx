"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { TaskPriority, TaskStatus } from "@prisma/client"

interface Task {
  id: string
  title: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: Date | null
  owner?: {
    name: string | null
  } | null
  project?: {
    name: string
    color: string | null
  } | null
}

interface TaskListProps {
  tasks: Task[]
  showProject?: boolean
}

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export function TaskList({ tasks, showProject = true }: TaskListProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const handleToggleComplete = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">No tasks found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-4">
            <Checkbox
              checked={completedTasks.has(task.id) || task.status === TaskStatus.DONE}
              onCheckedChange={() => handleToggleComplete(task.id)}
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${completedTasks.has(task.id) || task.status === TaskStatus.DONE ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h4>
                <Badge className={priorityColors[task.priority]} variant="outline">
                  {task.priority}
                </Badge>
                {showProject && task.project && (
                  <Badge
                    style={{ backgroundColor: task.project.color || undefined }}
                    className="text-white"
                  >
                    {task.project.name}
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                {task.owner && <span>{task.owner.name}</span>}
                {task.dueDate && (
                  <span className={task.dueDate < new Date() && task.status !== TaskStatus.DONE ? 'text-red-600' : ''}>
                    Due {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
