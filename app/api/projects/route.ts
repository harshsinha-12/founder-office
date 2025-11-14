import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/projects - Get all projects for user's workspace
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

    const projects = await prisma.project.findMany({
      where: { workspaceId: workspaceUser.workspaceId },
      include: {
        tasks: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
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
    const { name, description, color, status } = body

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        status: status || "active",
        workspaceId: workspaceUser.workspaceId,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
