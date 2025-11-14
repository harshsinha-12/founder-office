import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TaskStatus } from "@prisma/client"

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true } },
        workspace: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Verify user has access
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: task.workspaceId,
      },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Verify user has access
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: task.workspaceId,
      },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
    } = body

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && {
          status,
          ...(status === TaskStatus.DONE && { completedAt: new Date() }),
        }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(projectId !== undefined && { projectId }),
        ...(ownerId !== undefined && { ownerId }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, color: true } },
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Verify user has access
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: task.workspaceId,
      },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
