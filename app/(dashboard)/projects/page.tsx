import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { KanbanBoard } from "@/components/kanban-board"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getProjectsData(userId: string) {
  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: { userId },
    include: { workspace: true },
  })

  if (!workspaceUser) {
    return null
  }

  const projects = await prisma.project.findMany({
    where: {
      workspaceId: workspaceUser.workspaceId,
      status: "active",
    },
    include: {
      tasks: {
        include: {
          owner: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return { projects, workspace: workspaceUser.workspace }
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>Please sign in</div>
  }

  const data = await getProjectsData(session.user.id)

  if (!data) {
    return <div>No workspace found</div>
  }

  const { projects } = data

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">No Projects Yet</h2>
        <p className="text-muted-foreground mb-8">Create your first project to get started organizing your work.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and tasks</p>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const totalTasks = project.tasks.length
          const completedTasks = project.tasks.filter(t => t.status === "DONE").length
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  {project.color && (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{completedTasks} / {totalTasks} tasks</span>
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Kanban Boards */}
      <Tabs defaultValue={projects[0]?.id || ""} className="space-y-6">
        <TabsList>
          {projects.map((project) => (
            <TabsTrigger key={project.id} value={project.id}>
              {project.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {projects.map((project) => (
          <TabsContent key={project.id} value={project.id}>
            <Card>
              <CardHeader>
                <CardTitle>{project.name} - Kanban Board</CardTitle>
                <CardDescription>
                  {project.description || "Manage tasks for this project"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KanbanBoard tasks={project.tasks} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
