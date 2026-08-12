# Database Schema — Team & Project Management

## PostgreSQL via Prisma ORM

---

## Entity Relationship Overview

```
User ──────────────────────────────────────────────────────────────────
 │ (many) TeamMember                  belongs to many Teams
 │ (many) ProjectMember               belongs to many Projects
 │ (many) Task [assignee / reporter]  assigned/created many Tasks
 │ (many) Comment                     wrote many Comments
 │ (many) Attachment                  uploaded many Attachments
 │ (many) DailyWorkUpdate             submitted many daily updates
 │ (many) ActivityLog                 triggered many activities
 └ (many) TaskHistory                 made many task changes

Team ──────────────────────────────────────────────────────────────────
 │ (many) TeamMember → User           has many User members
 └ (many) ProjectTeam → Project       assigned to many Projects

Project ───────────────────────────────────────────────────────────────
 │ (many) ProjectMember → User        has many User members
 │ (many) ProjectTeam → Team          assigned to many Teams
 │ (many) Task                        contains many Tasks
 │ (many) Milestone                   has many Milestones
 │ (many) Label                       has many Labels
 │ (many) Attachment                  has many Attachments
 └ (many) ActivityLog                 has many Activity logs

Task ──────────────────────────────────────────────────────────────────
 │ belongs to Project
 │ optionally belongs to Milestone
 │ optionally assigned to User
 │ optionally reported by User
 │ (many) Task [subtasks]             self-referential subtask tree
 │ (many) ChecklistItem               has many checklist items
 │ (many) Comment                     has many Comments
 │ (many) Attachment                  has many Attachments
 │ (many) TaskLabel → Label           tagged with many Labels
 │ (many) TaskHistory                 change history
 └ (many) ActivityLog                 activity feed

DailyWorkUpdate ───────────────────────────────────────────────────────
 │ belongs to User (one per day per user — enforced by @@unique)
 │ (many) DailyWorkUpdateTask → Task     tasks worked today
 └ (many) DailyWorkUpdateProject → Project  projects worked today
```

---

## Models

### User
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | String UNIQUE | Login identifier |
| name | String | Display name |
| avatar | String? | URL |
| role | Enum UserRole | ADMIN / MANAGER / DEVELOPER / VIEWER |
| status | Enum UserStatus | ACTIVE / INACTIVE / INVITED |
| jobTitle | String? | |
| department | String? | |
| phone | String? | |
| timezone | String | Default UTC |
| bio | String? | |

### Team
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | String | |
| slug | String UNIQUE | URL-safe identifier |
| description | String? | |
| avatar | String? | |
| color | String | Hex color for UI |

### TeamMember (join)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| teamId | FK → Team | CASCADE delete |
| userId | FK → User | CASCADE delete |
| role | Enum TeamMemberRole | LEAD / MEMBER |
| **UNIQUE** | (teamId, userId) | One membership per user per team |

### Project
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | String | |
| slug | String UNIQUE | |
| description | String? | |
| status | Enum ProjectStatus | PLANNING / ACTIVE / ON_HOLD / COMPLETED / ARCHIVED / CANCELLED |
| priority | Enum ProjectPriority | LOW / MEDIUM / HIGH / CRITICAL |
| color | String | Hex |
| icon | String? | Emoji or icon name |
| startDate | DateTime? | |
| endDate | DateTime? | |
| isArchived | Boolean | Soft archive flag |
| archivedAt | DateTime? | |

### ProjectMember (join)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| projectId | FK → Project | CASCADE |
| userId | FK → User | CASCADE |
| role | Enum ProjectMemberRole | OWNER / MANAGER / DEVELOPER / VIEWER |
| **UNIQUE** | (projectId, userId) | |

### ProjectTeam (join)
Links a Team to a Project (many-to-many).

### Milestone
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| projectId | FK → Project | CASCADE |
| name | String | |
| description | String? | |
| status | Enum MilestoneStatus | PENDING / IN_PROGRESS / COMPLETED / MISSED |
| dueDate | DateTime | |
| completedAt | DateTime? | |

### Label
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| projectId | FK → Project | Scoped to project |
| name | String | |
| color | String | Hex |
| **UNIQUE** | (projectId, name) | |

### TaskLabel (join)
Composite PK (taskId, labelId).

### Task
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| projectId | FK → Project | CASCADE |
| milestoneId | FK → Milestone? | SET NULL |
| assigneeId | FK → User? | SET NULL |
| reporterId | FK → User? | SET NULL |
| parentTaskId | FK → Task? | Self-ref for subtasks; CASCADE |
| title | String | |
| description | String? | Rich text |
| status | Enum TaskStatus | BACKLOG / TODO / IN_PROGRESS / IN_REVIEW / TESTING / DONE / CANCELLED |
| priority | Enum TaskPriority | LOW / MEDIUM / HIGH / URGENT |
| startDate | DateTime? | |
| dueDate | DateTime? | |
| completedAt | DateTime? | |
| estimatedHours | Float? | |
| actualHours | Float? | |
| position | Int | Kanban column sort order |
| isArchived | Boolean | Soft archive |

### ChecklistItem
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| taskId | FK → Task | CASCADE |
| title | String | |
| isCompleted | Boolean | |
| position | Int | Sort order |
| completedAt | DateTime? | |

### Comment
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| taskId | FK → Task | CASCADE |
| authorId | FK → User | CASCADE |
| parentId | FK → Comment? | Self-ref for replies |
| content | String | |
| mentions | String[] | Array of user IDs |
| isEdited | Boolean | |
| editedAt | DateTime? | |

### Attachment
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| uploadedBy | FK → User | CASCADE |
| projectId | FK → Project? | SET NULL |
| taskId | FK → Task? | SET NULL |
| fileName | String | Original filename |
| fileKey | String UNIQUE | Storage path/S3 key |
| fileUrl | String | Presigned or local URL |
| mimeType | String | |
| fileSize | Int | Bytes |
| entityType | Enum AttachmentEntityType | TASK / PROJECT / COMMENT / DAILY_UPDATE |

### TaskHistory
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| taskId | FK → Task | CASCADE |
| userId | FK → User | CASCADE |
| field | String | Field that changed |
| oldValue | String? | Serialized old value |
| newValue | String? | Serialized new value |

### ActivityLog
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | FK → User | Who did it |
| projectId | FK → Project? | SET NULL |
| taskId | FK → Task? | SET NULL |
| action | Enum ActivityAction | CREATED / UPDATED / STATUS_CHANGED / etc. |
| entityType | String | "Task" / "Project" / "Comment" / etc. |
| entityId | String | ID of the affected entity |
| entityTitle | String? | Title snapshot |
| metadata | Json? | Arbitrary context payload |

### DailyWorkUpdate
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | FK → User | CASCADE |
| date | Date | Work date (no time) |
| summary | String | Narrative of work |
| hoursWorked | Float | |
| tomorrowPlan | String? | |
| blockers | String? | |
| mood | Int? | 1–5 optional morale score |
| **UNIQUE** | (userId, date) | One update per day per user |

### DailyWorkUpdateTask (join)
| Column | Type | Notes |
|--------|------|-------|
| updateId | FK → DailyWorkUpdate | CASCADE |
| taskId | FK → Task | CASCADE |
| isCompleted | Boolean | Completed today? |
| isBlocked | Boolean | Currently blocked? |
| hoursSpent | Float? | Time on this task |
| notes | String? | Per-task note |

### DailyWorkUpdateProject (join)
Links a DailyWorkUpdate to Projects worked on that day.

---

## Enum Reference

### UserRole
`ADMIN` — Full system access  
`MANAGER` — Create/assign/report on projects and tasks  
`DEVELOPER` — Work on tasks, submit updates  
`VIEWER` — Read-only access  

### TaskStatus (Kanban Columns)
`BACKLOG` → `TODO` → `IN_PROGRESS` → `IN_REVIEW` → `TESTING` → `DONE` / `CANCELLED`

### TaskPriority
`LOW` · `MEDIUM` · `HIGH` · `URGENT`

### ProjectStatus
`PLANNING` → `ACTIVE` → `ON_HOLD` / `COMPLETED` / `ARCHIVED` / `CANCELLED`

### ActivityAction
Covers all system events: CREATED, UPDATED, DELETED, ASSIGNED, REASSIGNED, COMMENTED,
STATUS_CHANGED, PRIORITY_CHANGED, DUE_DATE_CHANGED, MEMBER_ADDED, MEMBER_REMOVED,
ATTACHMENT_ADDED, ATTACHMENT_REMOVED, CHECKLIST_CHECKED, CHECKLIST_UNCHECKED,
SUBTASK_COMPLETED, MILESTONE_REACHED, ARCHIVED, UNARCHIVED

---

## Key Design Decisions

**Subtasks via self-referential Task** — `parentTaskId` on `Task` allows infinite nesting,
though the UI enforces max 1 level for simplicity. CASCADE delete removes all subtasks
when a parent task is deleted.

**DailyWorkUpdate uniqueness** — The `@@unique([userId, date])` constraint enforces the
business rule that each person submits exactly one update per calendar day. Updates
can be edited until end of day.

**Kanban ordering** — `position` (Int) on Task controls card order within each status
column. On drag-drop, the service recalculates positions for affected cards only.

**Soft archive** — Projects and Tasks use `isArchived` boolean rather than hard delete,
preserving history and allowing unarchive operations.

**ActivityLog.metadata: Json** — Stores arbitrary before/after snapshots for any field
change, enabling a rich, human-readable activity feed without separate history tables
per entity.

**Attachment.fileKey UNIQUE** — Prevents duplicate file storage entries; the fileKey
maps directly to S3 object key (Phase 2) or local filesystem path (Phase 1).
