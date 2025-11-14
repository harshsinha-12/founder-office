import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardCard } from "@/components/dashboard-card"
import { TaskList } from "@/components/task-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Clock, Calendar, TrendingUp } from "lucide-react"
import { startOfToday, endOfToday, startOfWeek, endOfWeek, startOfDay, addDays } from "date-fns"
import { TaskStatus } from "@prisma/client"

async function getDashboardData(userId: string) {
  // Get user's workspace
  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: { userId },
    include: { workspace: true },
  })

  if (!workspaceUser) {
    return null
  }

  const workspaceId = workspaceUser.workspaceId

  // Get today's tasks
  const todayStart = startOfToday()
  const todayEnd = endOfToday()

  const todayTasks = await prisma.task.findMany({
    where: {
      workspaceId,
      OR: [
        {
          dueDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        {
          status: TaskStatus.IN_PROGRESS,
        },
      ],
    },
    include: {
      owner: { select: { name: true } },
      project: { select: { name: true, color: true } },
    },
    orderBy: [
      { priority: "desc" },
      { dueDate: "asc" },
    ],
    take: 10,
  })

  // Get upcoming tasks
  const tomorrow = addDays(todayStart, 1)
  const upcomingTasks = await prisma.task.findMany({
    where: {
      workspaceId,
      status: { not: TaskStatus.DONE },
      dueDate: {
        gte: tomorrow,
      },
    },
    include: {
      owner: { select: { name: true } },
      project: { select: { name: true, color: true } },
    },
    orderBy: [
      { priority: "desc" },
      { dueDate: "asc" },
    ],
    take: 10,
  })

  // Get this week's meetings
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())

  const meetings = await prisma.meeting.findMany({
    where: {
      workspaceId,
      startTime: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    orderBy: { startTime: "asc" },
    take: 5,
  })

  // Get statistics
  const totalTasks = await prisma.task.count({
    where: { workspaceId },
  })

  const completedTasks = await prisma.task.count({
    where: {
      workspaceId,
      status: TaskStatus.DONE,
    },
  })

  const inProgressTasks = await prisma.task.count({
    where: {
      workspaceId,
      status: TaskStatus.IN_PROGRESS,
    },
  })

  const overdueTasks = await prisma.task.count({
    where: {
      workspaceId,
      status: { not: TaskStatus.DONE },
      dueDate: {
        lt: todayStart,
      },
    },
  })

  // Get latest weekly summary
  const latestSummary = await prisma.weeklySummary.findFirst({
    where: { workspaceId },
    orderBy: { generatedAt: "desc" },
  })

  return {
    workspace: workspaceUser.workspace,
    todayTasks,
    upcomingTasks,
    meetings,
    stats: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
    },
    latestSummary,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>Please sign in</div>
  }

  const data = await getDashboardData(session.user.id)

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Welcome to Founder Copilot!</h2>
        <p className="text-muted-foreground mb-8">Let's create your first workspace to get started.</p>
      </div>
    )
  }

  const completionRate = data.stats.totalTasks > 0
    ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Tasks"
          value={data.stats.totalTasks}
          icon={Clock}
          description="Across all projects"
        />
        <DashboardCard
          title="In Progress"
          value={data.stats.inProgressTasks}
          icon={TrendingUp}
          description="Active tasks"
        />
        <DashboardCard
          title="Completed"
          value={data.stats.completedTasks}
          icon={CheckCircle2}
          description={`${completionRate}% completion rate`}
        />
        <DashboardCard
          title="Overdue"
          value={data.stats.overdueTasks}
          icon={Calendar}
          description="Need attention"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>Focus on what matters today</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today">
                <TabsList className="mb-4">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="space-y-4">
                  <TaskList tasks={data.todayTasks} />
                </TabsContent>
                <TabsContent value="upcoming" className="space-y-4">
                  <TaskList tasks={data.upcomingTasks} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* This Week's Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>This Week's Meetings</CardTitle>
              <CardDescription>{data.meetings.length} scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              {data.meetings.length > 0 ? (
                <div className="space-y-3">
                  {data.meetings.map((meeting) => (
                    <div key={meeting.id} className="border-l-2 border-primary pl-3">
                      <h4 className="font-medium">{meeting.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meeting.startTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No meetings scheduled</p>
              )}
            </CardContent>
          </Card>

          {/* Weekly Summary */}
          {data.latestSummary && (
            <Card>
              <CardHeader>
                <CardTitle>This Week's Summary</CardTitle>
                <CardDescription>
                  Week of {new Date(data.latestSummary.weekStartDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{data.latestSummary.summary}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{data.latestSummary.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Meetings</p>
                    <p className="text-2xl font-bold">{data.latestSummary.meetingsHeld}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
