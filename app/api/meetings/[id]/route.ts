import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/meetings/[id] - Get a specific meeting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        followUpTasks: {
          include: {
            owner: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
        },
        workspace: true,
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Verify user has access
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: meeting.workspaceId,
      },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(meeting)
  } catch (error) {
    console.error("Error fetching meeting:", error)
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    )
  }
}

// PATCH /api/meetings/[id] - Update a meeting
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Verify user has access
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: meeting.workspaceId,
      },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      startTime,
      endTime,
      notes,
    } = body

    const updatedMeeting = await prisma.meeting.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && {
          endTime: endTime ? new Date(endTime) : null,
        }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        followUpTasks: true,
      },
    })

    return NextResponse.json(updatedMeeting)
  } catch (error) {
    console.error("Error updating meeting:", error)
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    )
  }
}

// DELETE /api/meetings/[id] - Delete a meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Verify user has access
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: meeting.workspaceId,
      },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.meeting.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting meeting:", error)
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    )
  }
}
