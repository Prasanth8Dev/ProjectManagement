# Complete Folder Structure — Team & Project Management

---

## Monorepo Root

```
project-management/
├── backend/                  # NestJS API server
├── frontend/                 # Next.js 15 client
├── ARCHITECTURE.md           # System architecture document
├── FOLDER_STRUCTURE.md       # This file
└── DATABASE_SCHEMA.md        # Prisma schema documentation
```

---

## Backend — NestJS

```
backend/
│
├── prisma/
│   ├── schema.prisma          # Complete Prisma schema (all 13 models)
│   ├── seed.ts                # Database seeder (demo users, teams, projects)
│   └── migrations/            # Auto-generated Prisma migration files
│
├── src/
│   │
│   ├── main.ts                # NestJS bootstrap (port, CORS, pipes, swagger)
│   ├── app.module.ts          # Root module — imports all feature modules
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts   # Global PrismaModule (exports PrismaService)
│   │   └── prisma.service.ts  # PrismaClient wrapper with lifecycle hooks
│   │
│   ├── common/                # Shared code used across all modules
│   │   ├── decorators/
│   │   │   ├── api-paginated-response.decorator.ts  # Swagger pagination annotation
│   │   │   ├── roles.decorator.ts                   # @Roles('MANAGER') decorator
│   │   │   └── current-user.decorator.ts            # @CurrentUser() param decorator
│   │   │
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts          # page, limit query params
│   │   │   ├── pagination-response.dto.ts # meta wrapper for list responses
│   │   │   └── id-param.dto.ts            # UUID param validation
│   │   │
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts   # Global exception → error envelope
│   │   │
│   │   ├── guards/
│   │   │   └── roles.guard.ts             # Phase 2 RBAC guard (scaffolded)
│   │   │
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts    # Wraps all responses in success envelope
│   │   │   └── logging.interceptor.ts     # Request/response logging
│   │   │
│   │   ├── interfaces/
│   │   │   ├── paginated-result.interface.ts
│   │   │   └── repository.interface.ts    # Generic repository contract
│   │   │
│   │   ├── pipes/
│   │   │   └── parse-uuid.pipe.ts         # Validates UUID path params
│   │   │
│   │   └── utils/
│   │       ├── pagination.util.ts         # Prisma skip/take calculator
│   │       ├── date.util.ts               # Date range helpers
│   │       └── string.util.ts             # Slug, truncate, search helpers
│   │
│   └── modules/
│       │
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts        # GET /users, GET /users/:id, PATCH /users/:id
│       │   ├── users.service.ts
│       │   ├── users.repository.ts
│       │   ├── dto/
│       │   │   ├── create-user.dto.ts
│       │   │   ├── update-user.dto.ts
│       │   │   └── user-filter.dto.ts
│       │   └── entities/
│       │       └── user.entity.ts
│       │
│       ├── teams/
│       │   ├── teams.module.ts
│       │   ├── teams.controller.ts        # Full CRUD + /teams/:id/members
│       │   ├── teams.service.ts
│       │   ├── teams.repository.ts
│       │   ├── dto/
│       │   │   ├── create-team.dto.ts
│       │   │   ├── update-team.dto.ts
│       │   │   ├── add-member.dto.ts
│       │   │   └── team-filter.dto.ts
│       │   └── entities/
│       │       └── team.entity.ts
│       │
│       ├── projects/
│       │   ├── projects.module.ts
│       │   ├── projects.controller.ts     # CRUD + archive + /members + /stats
│       │   ├── projects.service.ts
│       │   ├── projects.repository.ts
│       │   ├── dto/
│       │   │   ├── create-project.dto.ts
│       │   │   ├── update-project.dto.ts
│       │   │   ├── add-project-member.dto.ts
│       │   │   └── project-filter.dto.ts
│       │   └── entities/
│       │       └── project.entity.ts
│       │
│       ├── tasks/
│       │   ├── tasks.module.ts
│       │   ├── tasks.controller.ts        # CRUD + assign + /history + /activity
│       │   ├── tasks.service.ts
│       │   ├── tasks.repository.ts
│       │   ├── dto/
│       │   │   ├── create-task.dto.ts
│       │   │   ├── update-task.dto.ts
│       │   │   ├── assign-task.dto.ts
│       │   │   └── task-filter.dto.ts
│       │   └── entities/
│       │       └── task.entity.ts
│       │
│       ├── subtasks/
│       │   ├── subtasks.module.ts
│       │   ├── subtasks.controller.ts
│       │   ├── subtasks.service.ts
│       │   ├── subtasks.repository.ts
│       │   ├── dto/
│       │   │   ├── create-subtask.dto.ts
│       │   │   └── update-subtask.dto.ts
│       │   └── entities/
│       │       └── subtask.entity.ts
│       │
│       ├── checklists/
│       │   ├── checklists.module.ts
│       │   ├── checklists.controller.ts
│       │   ├── checklists.service.ts
│       │   ├── checklists.repository.ts
│       │   ├── dto/
│       │   │   ├── create-checklist-item.dto.ts
│       │   │   └── update-checklist-item.dto.ts
│       │   └── entities/
│       │       └── checklist-item.entity.ts
│       │
│       ├── comments/
│       │   ├── comments.module.ts
│       │   ├── comments.controller.ts     # POST/PATCH/DELETE, nested replies
│       │   ├── comments.service.ts
│       │   ├── comments.repository.ts
│       │   ├── dto/
│       │   │   ├── create-comment.dto.ts
│       │   │   └── update-comment.dto.ts
│       │   └── entities/
│       │       └── comment.entity.ts
│       │
│       ├── attachments/
│       │   ├── attachments.module.ts
│       │   ├── attachments.controller.ts  # POST (multipart), GET, DELETE
│       │   ├── attachments.service.ts
│       │   ├── attachments.repository.ts
│       │   ├── dto/
│       │   │   └── upload-attachment.dto.ts
│       │   └── entities/
│       │       └── attachment.entity.ts
│       │
│       ├── daily-updates/
│       │   ├── daily-updates.module.ts
│       │   ├── daily-updates.controller.ts  # CRUD + /reports/daily + /reports/weekly
│       │   ├── daily-updates.service.ts
│       │   ├── daily-updates.repository.ts
│       │   ├── dto/
│       │   │   ├── create-daily-update.dto.ts
│       │   │   ├── update-daily-update.dto.ts
│       │   │   └── daily-update-filter.dto.ts
│       │   └── entities/
│       │       └── daily-update.entity.ts
│       │
│       ├── milestones/
│       │   ├── milestones.module.ts
│       │   ├── milestones.controller.ts
│       │   ├── milestones.service.ts
│       │   ├── milestones.repository.ts
│       │   ├── dto/
│       │   │   ├── create-milestone.dto.ts
│       │   │   └── update-milestone.dto.ts
│       │   └── entities/
│       │       └── milestone.entity.ts
│       │
│       ├── labels/
│       │   ├── labels.module.ts
│       │   ├── labels.controller.ts
│       │   ├── labels.service.ts
│       │   ├── labels.repository.ts
│       │   ├── dto/
│       │   │   ├── create-label.dto.ts
│       │   │   └── update-label.dto.ts
│       │   └── entities/
│       │       └── label.entity.ts
│       │
│       ├── kanban/
│       │   ├── kanban.module.ts
│       │   ├── kanban.controller.ts       # GET board, PATCH column order, PATCH card move
│       │   ├── kanban.service.ts
│       │   └── dto/
│       │       └── move-card.dto.ts
│       │
│       ├── search/
│       │   ├── search.module.ts
│       │   ├── search.controller.ts       # GET /search?q=&type=
│       │   ├── search.service.ts
│       │   └── dto/
│       │       └── search-query.dto.ts
│       │
│       ├── reports/
│       │   ├── reports.module.ts
│       │   ├── reports.controller.ts
│       │   ├── reports.service.ts
│       │   └── dto/
│       │       └── report-filter.dto.ts
│       │
│       ├── activity/
│       │   ├── activity.module.ts
│       │   ├── activity.controller.ts     # GET /activity (global feed)
│       │   ├── activity.service.ts
│       │   ├── activity.repository.ts
│       │   └── entities/
│       │       └── activity-log.entity.ts
│       │
│       └── dashboard/
│           ├── dashboard.module.ts
│           ├── dashboard.controller.ts    # GET /dashboard/stats, /dashboard/charts
│           └── dashboard.service.ts
│
├── .env                       # DATABASE_URL, PORT, UPLOAD_DIR, etc.
├── .env.example               # Template without secrets
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## Frontend — Next.js 15

```
frontend/
│
├── src/
│   │
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout (providers, theme)
│   │   ├── globals.css                   # Tailwind base + CSS variables
│   │   ├── not-found.tsx                 # Global 404 page
│   │   ├── error.tsx                     # Global error boundary page
│   │   │
│   │   └── (dashboard)/                  # Route group — shares DashboardLayout
│   │       ├── layout.tsx                # Sidebar + Topbar shell
│   │       │
│   │       ├── dashboard/
│   │       │   └── page.tsx              # Main analytics dashboard
│   │       │
│   │       ├── projects/
│   │       │   ├── page.tsx              # Project list with filters
│   │       │   ├── new/
│   │       │   │   └── page.tsx          # Create project form
│   │       │   └── [id]/
│   │       │       ├── layout.tsx        # Project sub-navigation tabs
│   │       │       ├── page.tsx          # Project overview
│   │       │       ├── board/
│   │       │       │   └── page.tsx      # Kanban board
│   │       │       ├── tasks/
│   │       │       │   └── page.tsx      # Task list (table view)
│   │       │       ├── timeline/
│   │       │       │   └── page.tsx      # Timeline / Gantt
│   │       │       ├── milestones/
│   │       │       │   └── page.tsx      # Milestone tracker
│   │       │       ├── members/
│   │       │       │   └── page.tsx      # Project member management
│   │       │       └── settings/
│   │       │           └── page.tsx      # Project settings / danger zone
│   │       │
│   │       ├── tasks/
│   │       │   ├── page.tsx              # All tasks (cross-project)
│   │       │   └── [id]/
│   │       │       └── page.tsx          # Task detail panel (full page)
│   │       │
│   │       ├── teams/
│   │       │   ├── page.tsx              # Team list
│   │       │   ├── new/
│   │       │   │   └── page.tsx          # Create team
│   │       │   └── [id]/
│   │       │       ├── page.tsx          # Team overview
│   │       │       └── members/
│   │       │           └── page.tsx      # Team member management
│   │       │
│   │       ├── updates/
│   │       │   ├── page.tsx              # Daily updates feed
│   │       │   ├── new/
│   │       │   │   └── page.tsx          # Submit update form
│   │       │   └── [id]/
│   │       │       └── page.tsx          # Update detail view
│   │       │
│   │       ├── reports/
│   │       │   ├── page.tsx              # Reports hub
│   │       │   ├── daily/
│   │       │   │   └── page.tsx          # Daily report with date filter
│   │       │   ├── weekly/
│   │       │   │   └── page.tsx          # Weekly report
│   │       │   ├── project/
│   │       │   │   └── [id]/
│   │       │   │       └── page.tsx      # Per-project report
│   │       │   └── employee/
│   │       │       └── [id]/
│   │       │           └── page.tsx      # Per-employee report
│   │       │
│   │       ├── search/
│   │       │   └── page.tsx              # Global search results
│   │       │
│   │       ├── members/
│   │       │   ├── page.tsx              # All members directory
│   │       │   └── [id]/
│   │       │       └── page.tsx          # Member profile
│   │       │
│   │       └── profile/
│   │           └── page.tsx              # Current user profile / settings
│   │
│   ├── components/
│   │   │
│   │   ├── ui/                           # ShadCN auto-generated primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...                       # All installed ShadCN components
│   │   │
│   │   ├── layout/
│   │   │   ├── app-shell.tsx             # Outer layout wrapper
│   │   │   ├── sidebar.tsx               # Collapsible sidebar with navigation
│   │   │   ├── sidebar-nav.tsx           # Sidebar nav items with active state
│   │   │   ├── topbar.tsx                # Top bar with search + user menu
│   │   │   ├── breadcrumbs.tsx           # Dynamic breadcrumb trail
│   │   │   ├── page-header.tsx           # Page title + action buttons
│   │   │   └── theme-toggle.tsx          # Dark/light mode switch
│   │   │
│   │   ├── shared/
│   │   │   ├── data-table/
│   │   │   │   ├── data-table.tsx        # Reusable TanStack Table wrapper
│   │   │   │   ├── data-table-toolbar.tsx
│   │   │   │   ├── data-table-pagination.tsx
│   │   │   │   ├── data-table-column-header.tsx
│   │   │   │   └── data-table-row-actions.tsx
│   │   │   ├── user-avatar.tsx           # Avatar with fallback initials
│   │   │   ├── user-select.tsx           # Searchable user picker
│   │   │   ├── priority-badge.tsx        # Colored priority indicator
│   │   │   ├── status-badge.tsx          # Colored status indicator
│   │   │   ├── empty-state.tsx           # Generic empty illustration + CTA
│   │   │   ├── error-state.tsx           # Error boundary fallback UI
│   │   │   ├── loading-spinner.tsx       # Centered spinner
│   │   │   ├── skeleton-card.tsx         # Card skeleton loader
│   │   │   ├── skeleton-table.tsx        # Table skeleton loader
│   │   │   ├── file-upload.tsx           # Drag-drop + click file uploader
│   │   │   ├── date-picker.tsx           # Calendar date picker
│   │   │   ├── date-range-picker.tsx     # Range picker for reports
│   │   │   ├── confirm-dialog.tsx        # Generic confirmation modal
│   │   │   ├── search-input.tsx          # Debounced search input
│   │   │   ├── filter-bar.tsx            # Horizontal filter controls
│   │   │   ├── stat-card.tsx             # Dashboard stat box
│   │   │   └── progress-bar.tsx          # Task completion progress
│   │   │
│   │   └── features/
│   │       │
│   │       ├── dashboard/
│   │       │   ├── stats-grid.tsx        # Total projects/tasks/members row
│   │       │   ├── task-status-chart.tsx # Pie/donut chart (Recharts)
│   │       │   ├── weekly-progress-chart.tsx  # Bar chart
│   │       │   ├── project-progress-list.tsx  # Project progress bars
│   │       │   ├── recent-activity-feed.tsx   # Last N activity items
│   │       │   ├── today-tasks-list.tsx        # Tasks due today
│   │       │   └── upcoming-deadlines.tsx      # Next 7 days deadlines
│   │       │
│   │       ├── tasks/
│   │       │   ├── task-card.tsx         # Kanban card / list row card
│   │       │   ├── task-form.tsx         # Create/edit task sheet form
│   │       │   ├── task-detail.tsx       # Full task detail view
│   │       │   ├── task-list.tsx         # Table view of tasks
│   │       │   ├── task-filters.tsx      # Status/priority/assignee filters
│   │       │   ├── task-comments.tsx     # Comment thread on task
│   │       │   ├── task-checklist.tsx    # Checklist section
│   │       │   ├── task-subtasks.tsx     # Subtask list
│   │       │   ├── task-attachments.tsx  # File attachment section
│   │       │   ├── task-history.tsx      # Activity timeline for task
│   │       │   └── task-assign-dialog.tsx
│   │       │
│   │       ├── projects/
│   │       │   ├── project-card.tsx      # Project grid card
│   │       │   ├── project-form.tsx      # Create/edit project form
│   │       │   ├── project-stats.tsx     # Task completion stats
│   │       │   ├── project-members.tsx   # Member list with add/remove
│   │       │   ├── project-filters.tsx
│   │       │   └── project-archive-dialog.tsx
│   │       │
│   │       ├── kanban/
│   │       │   ├── kanban-board.tsx      # Full board container (DnD context)
│   │       │   ├── kanban-column.tsx     # Droppable column
│   │       │   ├── kanban-card.tsx       # Draggable task card
│   │       │   ├── kanban-column-header.tsx
│   │       │   └── kanban-add-card.tsx   # Inline quick-add
│   │       │
│   │       ├── teams/
│   │       │   ├── team-card.tsx
│   │       │   ├── team-form.tsx
│   │       │   ├── team-member-list.tsx
│   │       │   └── team-lead-select.tsx
│   │       │
│   │       ├── updates/
│   │       │   ├── update-card.tsx       # Feed item card
│   │       │   ├── update-form.tsx       # Daily update submission form
│   │       │   ├── update-detail.tsx     # Full update detail
│   │       │   └── update-filters.tsx    # Filter by user/team/date
│   │       │
│   │       ├── reports/
│   │       │   ├── report-filter-bar.tsx
│   │       │   ├── daily-report-view.tsx
│   │       │   ├── weekly-report-view.tsx
│   │       │   ├── project-report-view.tsx
│   │       │   └── employee-report-view.tsx
│   │       │
│   │       ├── comments/
│   │       │   ├── comment-thread.tsx
│   │       │   ├── comment-item.tsx
│   │       │   ├── comment-input.tsx     # Textarea with @mention support
│   │       │   └── reply-list.tsx
│   │       │
│   │       ├── search/
│   │       │   ├── search-results.tsx
│   │       │   ├── search-result-item.tsx
│   │       │   └── search-filters.tsx
│   │       │
│   │       └── members/
│   │           ├── member-card.tsx
│   │           └── member-profile.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axios.ts                  # Axios instance + interceptors
│   │   │   ├── users.api.ts              # All user API calls
│   │   │   ├── teams.api.ts
│   │   │   ├── projects.api.ts
│   │   │   ├── tasks.api.ts
│   │   │   ├── subtasks.api.ts
│   │   │   ├── checklists.api.ts
│   │   │   ├── comments.api.ts
│   │   │   ├── attachments.api.ts
│   │   │   ├── daily-updates.api.ts
│   │   │   ├── milestones.api.ts
│   │   │   ├── labels.api.ts
│   │   │   ├── kanban.api.ts
│   │   │   ├── search.api.ts
│   │   │   ├── reports.api.ts
│   │   │   ├── activity.api.ts
│   │   │   └── dashboard.api.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                     # clsx + tailwind-merge util
│   │   │   ├── date.ts                   # date-fns wrappers
│   │   │   ├── format.ts                 # Number, string formatters
│   │   │   └── error.ts                  # API error extraction
│   │   │
│   │   └── validators/
│   │       ├── task.schema.ts            # Zod schema for task form
│   │       ├── project.schema.ts
│   │       ├── team.schema.ts
│   │       ├── update.schema.ts
│   │       ├── comment.schema.ts
│   │       └── member.schema.ts
│   │
│   ├── hooks/
│   │   ├── use-dashboard.ts              # TanStack Query hooks for dashboard
│   │   ├── use-projects.ts               # useProjects, useProject, useCreateProject…
│   │   ├── use-tasks.ts
│   │   ├── use-subtasks.ts
│   │   ├── use-checklists.ts
│   │   ├── use-teams.ts
│   │   ├── use-comments.ts
│   │   ├── use-attachments.ts
│   │   ├── use-daily-updates.ts
│   │   ├── use-milestones.ts
│   │   ├── use-labels.ts
│   │   ├── use-kanban.ts
│   │   ├── use-search.ts
│   │   ├── use-reports.ts
│   │   ├── use-activity.ts
│   │   ├── use-members.ts
│   │   ├── use-debounce.ts               # Generic debounce hook
│   │   ├── use-local-storage.ts          # Typed localStorage hook
│   │   └── use-media-query.ts            # Responsive breakpoint hook
│   │
│   ├── stores/
│   │   ├── ui.store.ts                   # Sidebar, theme, modals
│   │   ├── filter.store.ts               # Active filters per entity
│   │   ├── kanban.store.ts               # Board drag state + optimistic moves
│   │   └── notification.store.ts         # Toast queue
│   │
│   ├── types/
│   │   ├── api.types.ts                  # ApiResponse<T>, PaginatedResponse<T>
│   │   ├── user.types.ts
│   │   ├── team.types.ts
│   │   ├── project.types.ts
│   │   ├── task.types.ts
│   │   ├── comment.types.ts
│   │   ├── attachment.types.ts
│   │   ├── daily-update.types.ts
│   │   ├── milestone.types.ts
│   │   ├── label.types.ts
│   │   ├── activity.types.ts
│   │   ├── dashboard.types.ts
│   │   ├── report.types.ts
│   │   └── kanban.types.ts
│   │
│   ├── constants/
│   │   ├── query-keys.ts                 # TanStack Query key factory
│   │   ├── routes.ts                     # App route constants
│   │   ├── task-statuses.ts              # Status → label/color map
│   │   ├── priorities.ts                 # Priority → label/color map
│   │   └── nav-items.ts                  # Sidebar navigation definition
│   │
│   └── config/
│       └── env.ts                        # Typed env var access (NEXT_PUBLIC_API_URL)
│
├── public/
│   ├── icons/                            # SVG icons
│   └── images/                           # Static images
│
├── .env.local                            # NEXT_PUBLIC_API_URL
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── components.json                       # ShadCN config
├── tsconfig.json
└── package.json
```

---

## Folder Purpose Reference

| Folder | Purpose |
|--------|---------|
| `backend/prisma/` | Schema definition, seed scripts, migration history |
| `backend/src/prisma/` | NestJS PrismaService (singleton, lifecycle hooks) |
| `backend/src/common/` | Shared cross-cutting concerns — filters, decorators, DTOs, utils |
| `backend/src/modules/{name}/` | One self-contained NestJS module per domain entity |
| `backend/src/modules/{name}/dto/` | Input validation classes (class-validator decorators) |
| `backend/src/modules/{name}/entities/` | TypeScript types mirroring Prisma models |
| `frontend/src/app/(dashboard)/` | Route group with shared sidebar/topbar layout |
| `frontend/src/components/ui/` | ShadCN auto-generated primitive components |
| `frontend/src/components/layout/` | App shell, sidebar, topbar — structural UI |
| `frontend/src/components/shared/` | Reusable domain-agnostic components (tables, file upload, etc.) |
| `frontend/src/components/features/` | Domain-specific compound components |
| `frontend/src/lib/api/` | One file per backend module — all API call functions |
| `frontend/src/lib/validators/` | Zod schemas matching each form |
| `frontend/src/hooks/` | TanStack Query hooks — one file per backend module |
| `frontend/src/stores/` | Zustand slices for global UI and client-side state |
| `frontend/src/types/` | TypeScript interfaces mirroring backend response shapes |
| `frontend/src/constants/` | Query keys, route paths, status/priority maps, nav config |
