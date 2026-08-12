# ProjectHub — Team & Project Management

A full-stack, production-ready project management application built with **Next.js 15**, **NestJS**, **PostgreSQL**, and **Prisma**. Manage teams, projects, tasks, kanban boards, and daily work updates.

---

## Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | v20+ | https://nodejs.org |
| npm | v10+ | Included with Node |
| PostgreSQL | v15+ | https://postgresql.org/download |

---

### Step 1 — Create the database

```bash
psql -U postgres
```
```sql
CREATE DATABASE project_management;
\q
```

---

### Step 2 — Backend setup

```bash
cd backend
npm install
```

Copy and configure environment:
```bash
cp .env.example .env
```

Open `.env` and set your database credentials:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_management
PORT=3001
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

Run database migrations and seed demo data:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Start the backend server:
```bash
npm run start:dev
```

Backend runs at → **http://localhost:3001**
Swagger API docs → **http://localhost:3001/api/docs**

---

### Step 3 — Frontend setup

Open a new terminal:
```bash
cd frontend
npm install
```

Copy environment file:
```bash
cp .env.example .env.local
```

`.env.local` contents:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at → **http://localhost:3000**

---

## What you get after seeding

The seed creates realistic demo data:

| Entity | Count |
|--------|-------|
| Users | 5 (1 admin, 2 managers, 2 developers) |
| Teams | 2 (Frontend Team, Backend Team) |
| Projects | 3 (E-commerce Platform, Mobile App, API Gateway) |
| Tasks | 30 (10 per project, mixed statuses) |
| Milestones | 5 |
| Labels | 8 |
| Daily Updates | 5 |
| Comments | 4 |

---

## Features

### Dashboard
- Real-time stats (total projects, tasks, members, overdue count)
- Task status donut chart
- Weekly progress bar chart
- Project completion progress bars
- Recent activity feed
- Today's tasks and upcoming deadlines

### Projects
- Create / edit / archive projects
- Status: Planning → Active → On Hold → Completed
- Priority: Low / Medium / High / Critical
- Project members with roles (Owner, Manager, Developer, Viewer)
- Milestone tracking
- Label management per project

### Kanban Board
- Drag-and-drop task cards across columns
- Columns: Backlog → Todo → In Progress → In Review → Testing → Done
- Optimistic UI updates (instant visual feedback)
- Quick-add tasks from any column

### Task Management
- Full task detail: description, checklist, subtasks, comments, attachments
- Assign tasks, set priority, due dates, estimated hours
- Complete change history with who changed what
- Label tagging

### Daily Work Updates
- One update per team member per day (enforced)
- Link tasks worked on with completion/blocked status
- Hours worked tracking
- Manager view of all team updates
- Daily and weekly reports with filterable tables

### Teams
- Create teams with custom colors
- Assign team lead
- Add/remove members

### Reports
- Daily report by date
- Weekly productivity summary
- Per-project health report
- Per-employee report with charts

### Search
- Cross-entity search: tasks, projects, members
- Filter by type

---

## Project Structure

```
project-management/
├── backend/          # NestJS API (port 3001)
│   ├── prisma/       # Schema + migrations + seed
│   └── src/
│       ├── modules/  # 16 feature modules
│       └── common/   # Shared pipes, filters, interceptors
│
├── frontend/         # Next.js 15 (port 3000)
│   └── src/
│       ├── app/      # App Router pages (30 routes)
│       ├── components/
│       ├── hooks/    # TanStack Query hooks
│       ├── stores/   # Zustand state
│       ├── lib/api/  # Axios API layer
│       └── types/    # TypeScript interfaces
│
├── ARCHITECTURE.md         # System design document
├── FOLDER_STRUCTURE.md     # Full directory reference
└── DATABASE_SCHEMA.md      # Schema documentation
```

---

## API Overview

Base URL: `http://localhost:3001/api/v1`

| Resource | Endpoints |
|----------|-----------|
| Users | `GET /users` `GET /users/:id` `PATCH /users/:id` |
| Teams | `GET /teams` `POST /teams` `GET /teams/:id` `PATCH /teams/:id` `DELETE /teams/:id` `POST /teams/:id/members` |
| Projects | `GET /projects` `POST /projects` `GET /projects/:id` `PATCH /projects/:id` `DELETE /projects/:id` `PATCH /projects/:id/archive` |
| Tasks | `GET /tasks` `POST /tasks` `GET /tasks/:id` `PATCH /tasks/:id` `DELETE /tasks/:id` `PATCH /tasks/:id/assign` `PATCH /tasks/:id/status` |
| Kanban | `GET /kanban/:projectId` `PATCH /kanban/move` |
| Daily Updates | `GET /daily-updates` `POST /daily-updates` `GET /daily-updates/report/daily` `GET /daily-updates/report/weekly` |
| Dashboard | `GET /dashboard/stats` `GET /dashboard/charts` `GET /dashboard/today-tasks` |
| Search | `GET /search?q=term&type=all` |
| Reports | `GET /reports/tasks` `GET /reports/overdue` `GET /reports/employee/:id` `GET /reports/project/:id` |

Full interactive docs: **http://localhost:3001/api/docs**

---

## Tech Stack

**Frontend**
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + ShadCN UI
- TanStack Query v5 (server state)
- Zustand v5 (client state)
- React Hook Form + Zod (forms + validation)
- Axios (HTTP client)
- Framer Motion (animations)
- Recharts (charts)
- @dnd-kit (drag-and-drop)

**Backend**
- NestJS 11 + TypeScript
- Prisma ORM + PostgreSQL
- class-validator + class-transformer
- Swagger/OpenAPI
- Multer (file uploads)

---

## Development Scripts

**Backend:**
```bash
npm run start:dev      # Development with hot reload
npm run build          # Production build
npx prisma studio      # Visual database browser
npx prisma migrate dev # Apply schema changes
```

**Frontend:**
```bash
npm run dev            # Development server
npm run build          # Production build
npm run lint           # ESLint
```

---

## Phase 2 Roadmap

This is Phase 1. Planned for Phase 2:
- JWT authentication (login, refresh tokens, RBAC)
- OAuth (Google, GitHub)
- Real-time updates via WebSockets
- Email notifications
- File storage via AWS S3
- Redis caching
- Docker + CI/CD pipeline
