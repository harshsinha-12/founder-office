import { PrismaClient, TaskPriority, TaskStatus } from '@prisma/client'
import { startOfWeek, endOfWeek, addDays, subDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'founder@example.com' },
    update: {},
    create: {
      email: 'founder@example.com',
      name: 'Alex Founder',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created demo user:', user.email)

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'alex-startup' },
    update: {},
    create: {
      name: "Alex's Startup",
      slug: 'alex-startup',
    },
  })
  console.log('✅ Created workspace:', workspace.name)

  // Link user to workspace
  const workspaceUser = await prisma.workspaceUser.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'owner',
    },
  })
  console.log('✅ Linked user to workspace')

  // Create projects
  const fundraiseProject = await prisma.project.create({
    data: {
      name: 'Fundraise Series A',
      description: 'Raise $5M Series A to scale product and team',
      status: 'active',
      color: '#3b82f6',
      workspaceId: workspace.id,
    },
  })

  const productProject = await prisma.project.create({
    data: {
      name: 'Product Launch v2.0',
      description: 'Ship major product update with new features',
      status: 'active',
      color: '#10b981',
      workspaceId: workspace.id,
    },
  })

  const hiringProject = await prisma.project.create({
    data: {
      name: 'Q1 Hiring',
      description: 'Hire 3 engineers and 1 designer',
      status: 'active',
      color: '#f59e0b',
      workspaceId: workspace.id,
    },
  })

  console.log('✅ Created 3 projects')

  // Create tasks for Fundraise project
  const fundraiseTasks = [
    {
      title: 'Update pitch deck',
      description: 'Refresh slides with latest metrics and traction',
      priority: TaskPriority.URGENT,
      status: TaskStatus.IN_PROGRESS,
      dueDate: addDays(new Date(), 2),
    },
    {
      title: 'Reach out to 10 VCs',
      description: 'Send personalized intro emails to target investors',
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      dueDate: addDays(new Date(), 5),
    },
    {
      title: 'Prepare financial model',
      description: '3-year projections with unit economics',
      priority: TaskPriority.HIGH,
      status: TaskStatus.BACKLOG,
      dueDate: addDays(new Date(), 7),
    },
    {
      title: 'Schedule partner meetings',
      description: 'Book meetings with interested VCs',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: addDays(new Date(), 10),
    },
  ]

  for (const task of fundraiseTasks) {
    await prisma.task.create({
      data: {
        ...task,
        workspaceId: workspace.id,
        projectId: fundraiseProject.id,
        ownerId: user.id,
        createdById: user.id,
      },
    })
  }
  console.log('✅ Created fundraise tasks')

  // Create tasks for Product project
  const productTasks = [
    {
      title: 'Design new dashboard UI',
      description: 'Redesign main dashboard with better UX',
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      dueDate: addDays(new Date(), 3),
    },
    {
      title: 'Implement real-time notifications',
      description: 'Add WebSocket support for live updates',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: addDays(new Date(), 14),
    },
    {
      title: 'User testing round 2',
      description: 'Run usability tests with 10 beta users',
      priority: TaskPriority.HIGH,
      status: TaskStatus.BACKLOG,
      dueDate: addDays(new Date(), 21),
    },
    {
      title: 'Fix critical bugs',
      description: 'Address top 5 bugs from user feedback',
      priority: TaskPriority.URGENT,
      status: TaskStatus.DONE,
      dueDate: subDays(new Date(), 2),
      completedAt: subDays(new Date(), 1),
    },
  ]

  for (const task of productTasks) {
    await prisma.task.create({
      data: {
        ...task,
        workspaceId: workspace.id,
        projectId: productProject.id,
        ownerId: user.id,
        createdById: user.id,
      },
    })
  }
  console.log('✅ Created product tasks')

  // Create tasks for Hiring project
  const hiringTasks = [
    {
      title: 'Post job listings',
      description: 'Publish roles on LinkedIn, AngelList, and HN',
      priority: TaskPriority.HIGH,
      status: TaskStatus.DONE,
      dueDate: subDays(new Date(), 5),
      completedAt: subDays(new Date(), 4),
    },
    {
      title: 'Screen candidates',
      description: 'Review applications and shortlist top 20',
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      dueDate: addDays(new Date(), 1),
    },
    {
      title: 'Schedule interviews',
      description: 'Book technical interviews with shortlisted candidates',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: addDays(new Date(), 7),
    },
  ]

  for (const task of hiringTasks) {
    await prisma.task.create({
      data: {
        ...task,
        workspaceId: workspace.id,
        projectId: hiringProject.id,
        ownerId: user.id,
        createdById: user.id,
      },
    })
  }
  console.log('✅ Created hiring tasks')

  // Create meetings
  const meeting1 = await prisma.meeting.create({
    data: {
      title: 'Investor Call - Acme Ventures',
      description: 'Initial pitch call with partner',
      startTime: addDays(new Date(), 3),
      endTime: addDays(new Date(), 3),
      workspaceId: workspace.id,
      participants: {
        create: [
          {
            userId: user.id,
            role: 'organizer',
          },
        ],
      },
    },
  })

  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'Product Roadmap Planning',
      description: 'Q1 feature prioritization session',
      startTime: addDays(new Date(), 1),
      endTime: addDays(new Date(), 1),
      notes: 'Discussed top priorities for Q1. Focus on: 1) Dashboard redesign, 2) Real-time features, 3) Mobile app.',
      workspaceId: workspace.id,
      participants: {
        create: [
          {
            userId: user.id,
            role: 'organizer',
          },
        ],
      },
    },
  })

  // Create follow-up task from meeting
  await prisma.task.create({
    data: {
      title: 'Document Q1 roadmap',
      description: 'Write up roadmap doc based on planning meeting',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: addDays(new Date(), 2),
      workspaceId: workspace.id,
      ownerId: user.id,
      createdById: user.id,
      meetingId: meeting2.id,
    },
  })

  const meeting3 = await prisma.meeting.create({
    data: {
      title: 'Team Standup',
      description: 'Weekly team sync',
      startTime: subDays(new Date(), 2),
      endTime: subDays(new Date(), 2),
      notes: 'Discussed progress on v2.0 launch. All on track. Sarah finishing dashboard designs by EOW.',
      workspaceId: workspace.id,
      participants: {
        create: [
          {
            userId: user.id,
            role: 'organizer',
          },
        ],
      },
    },
  })

  console.log('✅ Created meetings')

  // Create weekly summary
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())

  await prisma.weeklySummary.create({
    data: {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      summary: 'Great progress this week! Completed 3 critical tasks, held 2 productive meetings, and made significant headway on fundraising prep. Focus next week: finalize pitch deck and schedule VC meetings.',
      tasksCompleted: 3,
      tasksCreated: 8,
      meetingsHeld: 2,
      topPriorities: [
        'Complete Series A pitch deck',
        'Ship dashboard redesign',
        'Screen hiring candidates',
      ],
      workspaceId: workspace.id,
    },
  })

  console.log('✅ Created weekly summary')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Demo credentials:')
  console.log('   Email: founder@example.com')
  console.log('   (Use magic link or Google OAuth to sign in)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
