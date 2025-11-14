import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/meetings - Get all meetings for user's workspace
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: { userId: session.user.id },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming")

    const whereClause: any = { workspaceId: workspaceUser.workspaceId }

    if (upcoming === "true") {
      whereClause.startTime = { gte: new Date() }
    } else if (upcoming === "false") {
      whereClause.startTime = { lt: new Date() }
    }

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        followUpTasks: {
          include: {
            owner: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startTime: "desc" },
    })

    return NextResponse.json(meetings)
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    )
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: { userId: session.user.id },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      startTime,
      endTime,
      notes,
      participantIds,
    } = body

    if (!title || !startTime) {
      return NextResponse.json(
        { error: "Title and start time are required" },
        { status: 400 }
      )
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        notes,
        workspaceId: workspaceUser.workspaceId,
        participants: {
          create: participantIds?.map((userId: string) => ({
            userId,
            role: userId === session.user.id ? "organizer" : "attendee",
          })) || [
            {
              userId: session.user.id,
              role: "organizer",
            },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    })

    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    console.error("Error creating meeting:", error)
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    )
  }
}
