import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users } from "lucide-react"
import { formatDateTime, formatDate } from "@/lib/utils"

async function getMeetingsData(userId: string) {
  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: { userId },
    include: { workspace: true },
  })

  if (!workspaceUser) {
    return null
  }

  const meetings = await prisma.meeting.findMany({
    where: {
      workspaceId: workspaceUser.workspaceId,
    },
    include: {
      participants: {
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
      },
      followUpTasks: {
        include: {
          owner: { select: { name: true } },
        },
      },
    },
    orderBy: { startTime: "desc" },
    take: 50,
  })

  // Separate upcoming and past meetings
  const now = new Date()
  const upcomingMeetings = meetings.filter(m => new Date(m.startTime) >= now)
  const pastMeetings = meetings.filter(m => new Date(m.startTime) < now)

  return {
    upcomingMeetings,
    pastMeetings,
    workspace: workspaceUser.workspace,
  }
}

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>Please sign in</div>
  }

  const data = await getMeetingsData(session.user.id)

  if (!data) {
    return <div>No workspace found</div>
  }

  const { upcomingMeetings, pastMeetings } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">Track your meetings and follow-ups</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Meetings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming</h2>
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting) => (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(meeting.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(meeting.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge>Upcoming</Badge>
                  </div>
                </CardHeader>
                {meeting.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {meeting.description}
                    </p>
                    {meeting.participants.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <p className="text-muted-foreground">No upcoming meetings</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Meetings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Past Meetings</h2>
          {pastMeetings.length > 0 ? (
            pastMeetings.slice(0, 10).map((meeting) => (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(meeting.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(meeting.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Past</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {meeting.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Notes</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {meeting.notes}
                      </p>
                    </div>
                  )}

                  {meeting.followUpTasks.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Follow-up Tasks ({meeting.followUpTasks.length})
                        </h4>
                        <div className="space-y-1">
                          {meeting.followUpTasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="text-sm">
                              <span className="text-muted-foreground">• {task.title}</span>
                              {task.owner && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({task.owner.name})
                                </span>
                              )}
                            </div>
                          ))}
                          {meeting.followUpTasks.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{meeting.followUpTasks.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {meeting.participants.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <p className="text-muted-foreground">No past meetings</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
