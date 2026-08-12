# User Management — Complete Walkthrough Guide

## Overview

ProjectHub has four roles, each with a different level of access:

| Role | Who it's for | What they can do |
|------|-------------|------------------|
| **ADMIN** | System owner, CTO | Everything — manage users, teams, all projects, all reports |
| **MANAGER** | Team leads, PMs | Create/manage projects & tasks, add members to projects |
| **DEVELOPER** | Engineers, designers | Create & update tasks, submit daily updates, comment |
| **VIEWER** | Clients, stakeholders | Read-only — view projects & tasks, cannot edit |

---

## Part 1 — Adding a New User

### Step 1 · Go to Members

Click **Members** in the left sidebar.

You will see all current users as cards. The demo data includes 5 seeded users:
- Alice Johnson — ADMIN
- Bob Martinez — MANAGER
- Charlie Kim — MANAGER
- Diana Patel — DEVELOPER
- Evan Chen — DEVELOPER

### Step 2 · Open the Add Member form

Click the **"Add Member"** button in the top-right of the page header.

A slide-over panel opens on the right side.

### Step 3 · Fill in the user details

| Field | Required | Notes |
|-------|----------|-------|
| Full Name | ✅ Yes | First and last name |
| Email Address | ✅ Yes | Must be unique — no duplicates allowed |
| Role | ✅ Yes | See role table above. Defaults to Developer |
| Job Title | No | e.g. "Frontend Developer" |
| Department | No | e.g. "Engineering" |
| Phone | No | Any format |
| Bio | No | Short description |

### Step 4 · Click "Create Member"

The user is created immediately and appears in the Members grid.

> **Phase 1 note:** There is no email invitation or login flow yet. Users are created directly in the database. Authentication (JWT, email invites, OAuth) is planned for Phase 2.

---

## Part 2 — Changing a User's Role

### Step 1 · Open the member's profile

From the Members page, click any member card to open their profile.

### Step 2 · Click "Edit Role"

Click the **"Edit Role"** button in the top-right of the profile card.

### Step 3 · Select the new role

A slide-over panel opens showing:
- A role dropdown (Admin / Manager / Developer / Viewer)
- A real-time **permissions preview** showing exactly what the selected role can do
- A status dropdown (Active / Inactive)

### Step 4 · Save

Click **"Save Changes"**. The role badge on the profile updates immediately.

---

## Part 3 — Deactivating a User

You can deactivate a user without deleting them. Their tasks, comments, and history are preserved.

1. Open the member's profile
2. Click **"Edit Role"**
3. Change **Account Status** from `Active` → `Inactive`
4. Click **Save Changes**

Inactive users:
- Are hidden from assignee dropdowns when creating/editing tasks
- Still appear in the Members list (filterable)
- Keep all their historical data

To reactivate: repeat the steps and change status back to `Active`.

---

## Part 4 — Filtering & Finding Users

On the Members page, use the filter bar to narrow down the list:

| Filter | How to use |
|--------|-----------|
| **Search** | Type a name, email, job title, or department |
| **All Roles** | Filter by Admin / Manager / Developer / Viewer |
| **All Teams** | Filter by team membership |

---

## Part 5 — Adding a User to a Project

Creating a user does not automatically add them to any project. You must do this from the project.

1. Go to **Projects** → click a project
2. Go to the **Members** tab inside the project
3. Click **"Add Member"**
4. Search for the user and select their role within the project (Owner / Manager / Member / Viewer)

---

## Part 6 — Adding a User to a Team

1. Go to **Teams** → click a team
2. Click **"Add Member"** on the team page
3. Search and select the user, choose their team role

---

## Part 7 — Seeded Demo Users (Quick Reference)

These users are created when you run `npx prisma db seed`:

| Name | Email | Role | Job Title |
|------|-------|------|-----------|
| Alice Johnson | alice@projectmanager.dev | **ADMIN** | CTO |
| Bob Martinez | bob@projectmanager.dev | MANAGER | Frontend Lead |
| Charlie Kim | charlie@projectmanager.dev | MANAGER | Backend Lead |
| Diana Patel | diana@projectmanager.dev | DEVELOPER | Frontend Developer |
| Evan Chen | evan@projectmanager.dev | DEVELOPER | Backend Developer |

To re-seed at any time:
```bash
cd "Project Mangement/backend"
npx prisma db seed
```

---

## Part 8 — API Reference (for Admins / Developers)

All user management endpoints. Test them at `http://localhost:3001/api/docs`.

### Create a user
```bash
curl -X POST http://localhost:3001/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@company.com",
    "role": "DEVELOPER",
    "jobTitle": "Frontend Developer",
    "department": "Engineering"
  }'
```

### List all users
```bash
curl "http://localhost:3001/api/v1/users?page=1&limit=20"
```

### Filter by role
```bash
curl "http://localhost:3001/api/v1/users?role=ADMIN"
curl "http://localhost:3001/api/v1/users?role=MANAGER"
```

### Search by name or email
```bash
curl "http://localhost:3001/api/v1/users?search=jane"
```

### Update a user's role
```bash
curl -X PATCH http://localhost:3001/api/v1/users/<user-id> \
  -H "Content-Type: application/json" \
  -d '{ "role": "MANAGER" }'
```

### Deactivate a user
```bash
curl -X PATCH http://localhost:3001/api/v1/users/<user-id> \
  -H "Content-Type: application/json" \
  -d '{ "status": "INACTIVE" }'
```

---

## Common Errors

### "A user with this email already exists"
Each email must be unique. Check the Members list or use the search filter to find the existing user.

### New user not showing in Members list
Hard-refresh the page (Cmd+Shift+R / Ctrl+Shift+R). The list auto-refreshes after creation, but a manual refresh always works.

### Role change not reflected immediately
TanStack Query caches data for 60 seconds. Force a refresh or wait for the cache to expire.

---

## What's Coming in Phase 2

- Email invitations with accept/decline links
- Login with email + password (JWT)
- OAuth (Google, GitHub)
- Role-based access control enforced on the backend
- Permission guards on all API endpoints
- Two-factor authentication (2FA)
