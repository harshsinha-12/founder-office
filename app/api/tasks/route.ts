import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TaskPriority, TaskStatus } from "@prisma/client"

// GET /api/tasks - Get all tasks for user's workspace
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
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")

    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: workspaceUser.workspaceId,
        ...(projectId && { projectId }),
        ...(status && { status: status as TaskStatus }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
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
      priority,
      status,
      dueDate,
      projectId,
      ownerId,
      meetingId,
    } = body

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || TaskPriority.MEDIUM,
        status: status || TaskStatus.TODO,
        dueDate: dueDate ? new Date(dueDate) : null,
        workspaceId: workspaceUser.workspaceId,
        projectId,
        ownerId,
        createdById: session.user.id,
        meetingId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, color: true } },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
