import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
          },
        },
        workspace: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verify user has access to this project's workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: project.workspaceId,
      },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verify user has access
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: project.workspaceId,
      },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, color, status } = body

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(status && { status }),
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verify user has access
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: project.workspaceId,
      },
    })

    if (!workspaceUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}
