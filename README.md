# Founder Copilot 🚀

A modern SaaS workspace that centralizes tasks, priorities, and updates for startup founders. Built with Next.js 14, TypeScript, and Prisma.

![Founder Copilot](https://via.placeholder.com/1200x600/3b82f6/ffffff?text=Founder+Copilot)

## Features

### 📊 Unified Dashboard
- See all your priorities, tasks, and meetings in one place
- Today view with upcoming tasks and deadlines
- Real-time statistics and progress tracking

### 📋 Project Management
- Organize work into projects with Kanban boards
- Track tasks with priorities, statuses, and due dates
- Visual progress tracking for each project

### 📅 Meeting Management
- Track all your meetings in one place
- Add notes and create follow-up tasks
- Separate upcoming and past meeting views

### 📈 Weekly Summaries
- Auto-generated progress reports
- Track completed tasks and meetings
- Monitor top priorities week over week

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React Server Components, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Email + Google OAuth)
- **Icons**: lucide-react

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- (Optional) Google OAuth credentials for social login

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd founder-office
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:

   ```env
   # Database - Update with your PostgreSQL connection string
   DATABASE_URL="postgresql://user:password@localhost:5432/founder_copilot?schema=public"

   # NextAuth - Generate a secret with: openssl rand -base64 32
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Google OAuth (Optional - for Google sign-in)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Email (Optional - for magic link sign-in)
   EMAIL_SERVER="smtp://user:password@smtp.example.com:587"
   EMAIL_FROM="noreply@example.com"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with demo data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

### Demo Credentials

After seeding, you can sign in with:
- **Email**: `founder@example.com`
- Use magic link authentication (if configured) or Google OAuth

## Project Structure

```
founder-office/
├── app/                      # Next.js 14 App Router
│   ├── (dashboard)/         # Authenticated dashboard routes
│   │   ├── dashboard/       # Main dashboard page
│   │   ├── projects/        # Projects & Kanban boards
│   │   ├── meetings/        # Meetings management
│   │   └── layout.tsx       # Dashboard layout with sidebar
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── projects/       # Projects CRUD
│   │   ├── tasks/          # Tasks CRUD
│   │   └── meetings/       # Meetings CRUD
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── sidebar.tsx         # Navigation sidebar
│   ├── header.tsx          # Dashboard header
│   ├── dashboard-card.tsx  # Stat cards
│   ├── task-list.tsx       # Task list component
│   └── kanban-board.tsx    # Kanban board component
├── lib/                     # Utility functions
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Helper functions
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
└── types/                   # TypeScript types
```

## Database Schema

### Core Models

- **User**: Authentication and user profiles
- **Workspace**: Multi-tenant workspaces
- **WorkspaceUser**: User-workspace relationships
- **Project**: Project management (e.g., "Fundraise", "Product Launch")
- **Task**: Tasks with priority, status, due dates, and owners
- **Meeting**: Meeting tracking with participants and notes
- **WeeklySummary**: Auto-generated weekly progress reports

### Relationships

- Each workspace can have multiple projects, tasks, and meetings
- Tasks can belong to projects and meetings (as follow-ups)
- Users can own and be assigned to tasks
- Meetings can have multiple participants and follow-up tasks

## API Routes

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update a project
- `DELETE /api/projects/[id]` - Delete a project

### Tasks
- `GET /api/tasks` - List all tasks (with filters)
- `POST /api/tasks` - Create a task
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

### Meetings
- `GET /api/meetings` - List all meetings
- `POST /api/meetings` - Create a meeting
- `GET /api/meetings/[id]` - Get meeting details
- `PATCH /api/meetings/[id]` - Update a meeting
- `DELETE /api/meetings/[id]` - Delete a meeting

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with demo data

## Development Tips

### Using Prisma Studio

Prisma Studio provides a visual interface to view and edit your database:

```bash
npm run db:studio
```

### Database Migrations

For production, use migrations instead of `db:push`:

```bash
npx prisma migrate dev --name your_migration_name
```

### Adding New shadcn/ui Components

This project uses shadcn/ui. To add new components:

1. Copy component code from [ui.shadcn.com](https://ui.shadcn.com)
2. Place in `components/ui/` directory
3. Import and use in your pages

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform
- Any Node.js hosting platform

**Important**: Make sure to:
1. Set up a production PostgreSQL database
2. Configure all environment variables
3. Run database migrations: `npx prisma migrate deploy`

## Customization

### Changing Colors

Update the theme in `app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Change primary color */
  /* ... other variables */
}
```

### Adding Features

The codebase is designed to be extended:
- Add new models in `prisma/schema.prisma`
- Create API routes in `app/api/`
- Build new pages in `app/(dashboard)/`
- Add components in `components/`

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this for your own projects!

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments

## Roadmap

Future enhancements:
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Slack integration
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] AI-powered weekly summaries
- [ ] Custom fields and workflows

---

Built with ❤️ for founders who ship fast.
