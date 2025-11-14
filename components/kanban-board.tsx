"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { TaskPriority, TaskStatus } from "@prisma/client"

interface Task {
  id: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  dueDate: Date | null
  owner?: {
    name: string | null
  } | null
}

interface KanbanBoardProps {
  tasks: Task[]
}

const columns = [
  { status: TaskStatus.BACKLOG, title: "Backlog", color: "border-gray-300" },
  { status: TaskStatus.TODO, title: "To Do", color: "border-blue-300" },
  { status: TaskStatus.IN_PROGRESS, title: "In Progress", color: "border-yellow-300" },
  { status: TaskStatus.DONE, title: "Done", color: "border-green-300" },
]

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status)
        return (
          <div key={column.status} className="flex flex-col">
            <div className={`mb-4 rounded-lg border-2 ${column.color} bg-card p-4`}>
              <h3 className="font-semibold">{column.title}</h3>
              <p className="text-sm text-muted-foreground">{columnTasks.length} tasks</p>
            </div>

            <div className="space-y-3">
              {columnTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <Badge className={priorityColors[task.priority]} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>

                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due {formatDate(task.dueDate)}
                      </p>
                    )}

                    {task.owner && (
                      <p className="text-xs text-muted-foreground">
                        Assigned to {task.owner.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {columnTasks.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
