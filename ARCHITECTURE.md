# Team & Project Management — Software Architecture
## Phase 1 — Complete System Design

---

## 1. System Overview

A multi-tenant Team & Project Management SaaS platform enabling organizations to create
projects, assign work, track progress, and collect daily work updates. Architecturally
equivalent to a simplified Jira/Linear with a built-in daily standup reporting layer.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                            │
│   Next.js 15 (App Router) · React 19 · TanStack Query          │
│   Zustand · ShadCN UI · Tailwind CSS · Framer Motion           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST (Axios)
┌────────────────────────▼────────────────────────────────────────┐
│                          API TIER                               │
│   NestJS 11 · TypeScript · Class-Validator · Class-Transformer  │
│   Swagger/OpenAPI · Pipes · Guards (Phase 2) · Interceptors    │
└────────────────────────┬────────────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────────────────┐
│                        DATA TIER                                │
│              PostgreSQL 16 · Prisma ORM                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Architectural Patterns

### 3.1 Backend — Clean Architecture (Layered)

```
Request → Controller → Service → Repository → Prisma → PostgreSQL
             ↑             ↑           ↑
            DTO         Domain      Interface
         Validation     Logic       Contract
```

**Layers:**

| Layer        | Responsibility                                      | Files                        |
|-------------|-----------------------------------------------------|------------------------------|
| Controller  | Route handling, request parsing, response shaping   | `*.controller.ts`            |
| Service     | Business logic, orchestration, validation rules     | `*.service.ts`               |
| Repository  | Data access abstraction, Prisma queries             | `*.repository.ts`            |
| DTO         | Input validation, type contracts, transformations   | `dto/*.dto.ts`               |
| Entities    | Domain model interfaces (TypeScript types)          | `entities/*.entity.ts`       |

### 3.2 Frontend — Feature-Based Architecture

```
Page (Route)
  └── Feature Module (e.g., /projects/[id])
        ├── page.tsx          → Route Entry, server layout
        ├── components/       → Feature-specific UI components
        ├── hooks/            → Custom React hooks (TanStack Query wrappers)
        ├── stores/           → Zustand slice for this feature
        └── types/            → TypeScript types for this feature
```

### 3.3 Repository Pattern

Every NestJS module exposes a repository class that:
- Abstracts all Prisma queries
- Accepts clean domain objects
- Returns typed entities
- Handles pagination, filtering, sorting internally

This decouples business logic from the ORM, making the codebase testable and swappable.

### 3.4 SOLID Application

| Principle | Application |
|-----------|-------------|
| **S** — Single Responsibility | Controllers only route; Services only orchestrate; Repositories only query |
| **O** — Open/Closed | Services extend behavior via composition, not modification |
| **L** — Liskov Substitution | Repository interfaces allow mock implementations in tests |
| **I** — Interface Segregation | DTOs scoped per operation (Create, Update, Filter separately) |
| **D** — Dependency Inversion | All modules depend on abstractions (interfaces/tokens), not concrete classes |

---

## 4. Module Breakdown

### Backend Modules (NestJS)

| Module          | Description                                            |
|-----------------|--------------------------------------------------------|
| `users`         | User profile management                               |
| `teams`         | Team CRUD, membership, roles                          |
| `projects`      | Project lifecycle, members, milestones, labels        |
| `tasks`         | Full task management, assignment, status              |
| `subtasks`      | Nested task management                                |
| `checklists`    | Per-task checklist items                              |
| `comments`      | Task comments, replies, mentions                      |
| `attachments`   | File upload/download, task file linking               |
| `daily-updates` | Daily work update submission and reporting            |
| `kanban`        | Board state, column management, drag-drop ordering    |
| `search`        | Cross-entity full-text search                         |
| `reports`       | Report generation (daily, weekly, project, employee)  |
| `activity`      | Activity log aggregation                              |
| `dashboard`     | Aggregated stats and charts data                      |
| `milestones`    | Project milestone tracking                            |
| `labels`        | Label/tag management                                  |
| `prisma`        | Shared PrismaService                                  |
| `common`        | Shared pipes, interceptors, decorators, guards        |

### Frontend Pages (Next.js App Router)

| Route                              | Description                        |
|------------------------------------|------------------------------------|
| `/`                                | Dashboard / Home                   |
| `/dashboard`                       | Main analytics dashboard           |
| `/projects`                        | Project list                       |
| `/projects/new`                    | Create project                     |
| `/projects/[id]`                   | Project overview                   |
| `/projects/[id]/board`             | Kanban board                       |
| `/projects/[id]/tasks`             | Task list view                     |
| `/projects/[id]/timeline`          | Gantt/timeline view                |
| `/projects/[id]/milestones`        | Milestone tracker                  |
| `/projects/[id]/members`           | Project members                    |
| `/projects/[id]/settings`          | Project settings                   |
| `/tasks`                           | All tasks view                     |
| `/tasks/[id]`                      | Task detail                        |
| `/teams`                           | Team list                          |
| `/teams/new`                       | Create team                        |
| `/teams/[id]`                      | Team detail                        |
| `/teams/[id]/members`              | Team members management            |
| `/updates`                         | Daily work updates list            |
| `/updates/new`                     | Submit daily update                |
| `/updates/[id]`                    | Update detail                      |
| `/reports`                         | Reports hub                        |
| `/reports/daily`                   | Daily report                       |
| `/reports/weekly`                  | Weekly report                      |
| `/reports/project/[id]`            | Project report                     |
| `/reports/employee/[id]`           | Employee report                    |
| `/search`                          | Global search                      |
| `/profile`                         | User profile                       |
| `/members`                         | All members                        |
| `/members/[id]`                    | Member profile                     |

---

## 5. API Design Conventions

### REST Conventions

```
GET    /api/v1/{resource}           → List (paginated)
GET    /api/v1/{resource}/:id       → Single record
POST   /api/v1/{resource}           → Create
PATCH  /api/v1/{resource}/:id       → Partial update
DELETE /api/v1/{resource}/:id       → Delete
```

### Standard Response Envelope

```typescript
// Success (list)
{
  success: true,
  data: T[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}

// Success (single)
{
  success: true,
  data: T,
  message?: string
}

// Error
{
  success: false,
  error: string,
  message: string,
  statusCode: number,
  details?: Record<string, string[]>   // Validation errors
}
```

### Pagination, Filtering & Sorting Query Params

```
GET /api/v1/tasks?page=1&limit=20&status=IN_PROGRESS&priority=HIGH&sortBy=dueDate&sortOrder=asc&search=bug
```

---

## 6. Data Flow

### Task Creation Flow

```
User fills TaskForm (React Hook Form + Zod)
  → Axios POST /api/v1/tasks
    → CreateTaskDto (class-validator validation)
      → TaskController.create()
        → TaskService.create()
          → TaskRepository.create()  (Prisma)
            → PostgreSQL
          ← returns Task entity
        ← returns TaskResponseDto
      ← returns 201 JSON
  ← TanStack Query invalidates ['tasks'] cache
← UI re-renders with new task
```

### Daily Update Submission Flow

```
User fills DailyUpdateForm
  → POST /api/v1/daily-updates
    → DailyUpdateService validates one-per-day-per-user rule
      → Creates update linking tasks worked/completed/blocked
        → ActivityLog entry created
    → Returns update record
  ← TanStack Query updates cache
← Updates feed refreshes
```

---

## 7. State Management Strategy

| Concern              | Tool              | Rationale                                        |
|----------------------|-------------------|--------------------------------------------------|
| Server state         | TanStack Query    | Cache, background refetch, optimistic updates    |
| Global UI state      | Zustand           | Theme, sidebar, modal visibility, active filters |
| Form state           | React Hook Form   | Uncontrolled, performant, Zod integration        |
| URL/filter state     | Next.js useSearchParams | Shareable filtered views                  |

### Zustand Stores

| Store              | Manages                                              |
|--------------------|------------------------------------------------------|
| `uiStore`          | Sidebar open/collapsed, theme, active modal          |
| `filterStore`      | Task filters, project filters, search query          |
| `kanbanStore`      | Board column order, drag state, optimistic card move |
| `notificationStore`| Toast queue (Phase 2 extends to push)                |

---

## 8. Frontend Component Architecture

```
components/
├── ui/                   # ShadCN primitives (Button, Card, Dialog…)
├── layout/               # AppShell, Sidebar, Topbar, Breadcrumbs
├── shared/               # DataTable, FileUpload, UserAvatar, EmptyState
└── features/             # Domain-specific compound components
    ├── tasks/            # TaskCard, TaskDetailPanel, TaskForm
    ├── projects/         # ProjectCard, ProjectForm, ProjectStats
    ├── kanban/           # KanbanBoard, KanbanColumn, KanbanCard
    ├── updates/          # UpdateCard, UpdateForm
    ├── reports/          # ReportFilter, ReportTable, ChartBlock
    └── comments/         # CommentThread, CommentInput, ReplyList
```

---

## 9. Error Handling Strategy

### Backend
- Global `HttpExceptionFilter` catches all exceptions, wraps in error envelope
- `ValidationPipe` (class-validator) transforms 400 errors into structured `details` map
- Service-layer business errors throw typed NestJS `HttpException` subclasses
- Prisma errors caught and mapped to 404/409/500

### Frontend
- Axios response interceptor normalizes error shape
- TanStack Query `onError` callbacks feed the toast notification system
- React Error Boundaries wrap major page sections
- Empty states for every list that can be empty
- Skeleton loaders for every async section

---

## 10. Performance Considerations (Phase 1)

| Area              | Strategy                                                    |
|-------------------|-------------------------------------------------------------|
| API pagination    | Cursor or offset pagination on all list endpoints           |
| DB indexes        | Composite indexes on foreign keys and filter columns        |
| Image/file        | Files served via presigned URLs (S3-ready abstraction)     |
| Frontend bundles  | Next.js code splitting by route (automatic)                 |
| Query dedup       | TanStack Query deduplicate concurrent identical requests    |
| Optimistic UI     | Kanban card moves update UI before server confirms          |

---

## 11. Security Posture (Phase 1 Scaffold — Phase 2 Implementation)

Phase 1 scaffolds the security layer without enforcing it:
- `AuthGuard` exists but is `@Public()` by default
- `RolesGuard` exists with `MANAGER` / `DEVELOPER` roles defined
- Endpoints are annotated with `@Roles()` decorators (not yet enforced)
- All inputs sanitized via `ValidationPipe` (active in Phase 1)
- SQL injection impossible via Prisma parameterized queries

---

## 12. Scalability Path

```
Phase 1  → Monolith NestJS + Next.js (this build)
Phase 2  → Auth (JWT + Refresh + RBAC) + File Storage (S3) + Redis Cache
Phase 3  → WebSocket real-time (task updates, comments)
Phase 4  → Notifications (email, push)
Phase 5  → Microservices extraction (Reports, Files as separate services)
```
