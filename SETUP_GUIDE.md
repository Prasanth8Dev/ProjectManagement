# ProjectHub — Setup & Troubleshooting Guide

## Quick Reference

| Service | URL (localhost) | URL (LAN access) |
|---------|----------------|------------------|
| Frontend | http://localhost:3000 | http://192.168.10.25:3000 |
| Backend API | http://localhost:3001/api/v1 | http://192.168.10.25:3001/api/v1 |
| Swagger Docs | http://localhost:3001/api/docs | http://192.168.10.25:3001/api/docs |
| Prisma Studio | http://localhost:5555 | — |

---

## 1. Prerequisites

Install these before anything else:

```bash
# Node.js (v20+)
node --version        # must be v20 or higher

# PostgreSQL 16
brew install postgresql@16        # macOS
sudo apt install postgresql-16    # Ubuntu/Debian

# Start PostgreSQL
brew services start postgresql@16
```

---

## 2. First-Time Setup

### 2.1 Database

```bash
# Create the database (only needed once)
createdb project_management

# Verify you can connect
psql project_management -c "SELECT 1;"
```

### 2.2 Backend

```bash
cd "Project Mangement/backend"

# Install dependencies
npm install

# Copy and edit environment file
cp .env.example .env         # if .env doesn't exist yet, create it manually

# .env should contain:
# DATABASE_URL=postgresql://<your-mac-username>@localhost:5432/project_management
# PORT=3001
# UPLOAD_DIR=./uploads
# MAX_FILE_SIZE=10485760

# Run migrations (creates tables)
npx prisma migrate dev

# Seed the database (demo data: 5 users, 2 teams, 3 projects, 30 tasks)
npx prisma db seed

# Start backend
npm run start:dev
```

Backend is ready when you see:
```
Application is running on: http://localhost:3001/api/v1
```

### 2.3 Frontend

Open a **new terminal window**:

```bash
cd "Project Mangement/frontend"

# Install dependencies
npm install

# Check .env.local — set your LAN IP if accessing from other devices
cat .env.local
# Should show: NEXT_PUBLIC_API_URL=http://192.168.10.25:3001/api/v1

# Start frontend
npm run dev
```

Frontend is ready when you see:
```
▲ Next.js ready on http://localhost:3000
```

---

## 3. Daily Start (after first-time setup)

Open two terminals:

**Terminal 1 — Backend:**
```bash
brew services start postgresql@16    # if not already running
cd "Project Mangement/backend"
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd "Project Mangement/frontend"
npm run dev
```

---

## 4. Accessing from Other Devices on Your Network

The app is already configured to work over LAN (192.168.x.x).

From any phone, tablet, or computer on the same Wi-Fi:
```
http://192.168.10.25:3000
```

**If your server IP changes**, update `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://<new-ip>:3001/api/v1
```
Then restart the frontend (`Ctrl+C` then `npm run dev`).

To find your current IP:
```bash
ipconfig getifaddr en0      # macOS (Wi-Fi)
ipconfig getifaddr en1      # macOS (Ethernet)
hostname -I                 # Linux
```

---

## 5. Common Errors & Fixes

### ❌ "Network Error" / "Failed to load" on any page

**Cause:** Backend is not running, or frontend is using the wrong API URL.

**Fix:**
```bash
# 1. Check if backend is running
curl http://localhost:3001/api/v1/users

# 2. If not running, start it
cd "Project Mangement/backend"
npm run start:dev

# 3. If accessing via LAN IP, make sure .env.local points to the right host
cat "Project Mangement/frontend/.env.local"
# Should be: NEXT_PUBLIC_API_URL=http://192.168.10.25:3001/api/v1
```

---

### ❌ `P1001: Can't reach database server`

**Cause:** PostgreSQL is not running.

**Fix:**
```bash
brew services start postgresql@16

# Check it's running
brew services list | grep postgresql
```

---

### ❌ `P1003: Database does not exist`

**Cause:** Database was never created.

**Fix:**
```bash
createdb project_management
```

---

### ❌ `DATABASE_URL` connection refused or auth error

**Cause:** Username or password in `.env` is wrong.

**Fix:**
```bash
# Find your macOS username
whoami

# Update backend/.env
DATABASE_URL=postgresql://<your-username>@localhost:5432/project_management
# Note: Homebrew installs PostgreSQL with no password by default
```

---

### ❌ `npm install` fails with peer dependency error

**Fix:**
```bash
npm install --legacy-peer-deps
```

---

### ❌ TypeScript compilation errors on start

**Fix:**
```bash
cd "Project Mangement/backend"
npx tsc --noEmit          # see all errors
npm run start:dev          # NestJS will still try to compile & run
```

---

### ❌ Pages compile but show no data (0 tasks, 0 teams, etc.)

**Cause:** Database was not seeded.

**Fix:**
```bash
cd "Project Mangement/backend"
npx prisma db seed
```

This creates:
- 5 users (admin@company.com, manager1@..., manager2@..., dev1@..., dev2@...)
- 2 teams, 3 projects, 30 tasks, 5 milestones, 8 labels, 5 daily updates

---

### ❌ Port already in use

```bash
# Kill whatever is on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill whatever is on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

---

### ❌ Prisma client out of date after schema change

```bash
cd "Project Mangement/backend"
npx prisma generate          # regenerate client
npm run start:dev
```

---

## 6. Reset Everything (clean slate)

```bash
# Drop and recreate the database
dropdb project_management
createdb project_management

# Re-run migrations and seed
cd "Project Mangement/backend"
npx prisma migrate dev
npx prisma db seed
```

---

## 7. Useful Commands

### Backend

| Command | What it does |
|---------|-------------|
| `npm run start:dev` | Start with hot-reload |
| `npm run build` | Compile to `dist/` |
| `npm run start` | Run compiled build (production) |
| `npx prisma studio` | Open visual DB browser at :5555 |
| `npx prisma migrate dev` | Apply schema changes |
| `npx prisma db seed` | (Re-)seed demo data |
| `npx prisma migrate reset` | Drop all tables and re-migrate |
| `npx tsc --noEmit` | Check TypeScript errors without building |

### Frontend

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## 8. Project Structure at a Glance

```
Project Mangement/
├── backend/                  NestJS API (port 3001)
│   ├── prisma/
│   │   ├── schema.prisma     Database schema (18 models)
│   │   └── seed.ts           Demo data seeder
│   ├── src/
│   │   ├── modules/          Feature modules (tasks, teams, projects…)
│   │   ├── common/           Shared interceptors, filters, DTOs
│   │   └── main.ts           App entry point (CORS, Swagger, pipes)
│   └── .env                  Database URL, port, upload settings
│
├── frontend/                 Next.js 15 App Router (port 3000)
│   ├── src/
│   │   ├── app/(dashboard)/  All pages (tasks, projects, teams…)
│   │   ├── components/       UI + feature components
│   │   ├── hooks/            TanStack Query data hooks
│   │   ├── lib/api/          Axios API functions per module
│   │   └── stores/           Zustand client state
│   └── .env.local            API URL (update for LAN access)
│
├── ARCHITECTURE.md           System design & layer overview
├── DATABASE_SCHEMA.md        ER diagram & column reference
├── FOLDER_STRUCTURE.md       Full file tree with explanations
└── SETUP_GUIDE.md            ← You are here
```

---

## 9. API Quick Test

Verify the backend is working correctly:

```bash
# Health check — list all users
curl http://localhost:3001/api/v1/users | python3 -m json.tool

# List projects
curl http://localhost:3001/api/v1/projects | python3 -m json.tool

# List tasks
curl http://localhost:3001/api/v1/tasks | python3 -m json.tool

# Dashboard stats
curl http://localhost:3001/api/v1/dashboard/stats | python3 -m json.tool
```

Or open Swagger UI in your browser:
```
http://localhost:3001/api/docs
```

---

## 10. Demo Login

Phase 1 has no authentication. The app automatically uses a hardcoded demo user:

| Field | Value |
|-------|-------|
| Name | Alex Johnson |
| Role | MANAGER |
| Avatar | AJ (initials) |

All actions (create task, assign, change status) are performed as this user.
Authentication (JWT, OAuth, RBAC) is planned for Phase 2.
