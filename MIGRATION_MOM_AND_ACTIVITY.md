# Migration Guide — Meeting MOM, Task Activity Timeline & Time Tracking

This covers the feature batch that adds:

- Meeting MOM (Minutes of Meeting) with action items and Meeting → Task conversion
- An immutable Task Activity Timeline (replaces the old `TaskHistory` model)
- Auto-calculated task time tracking (start delay, active working time, paused/blocked time, etc.)
- Redesigned Task Details page with lifecycle controls (Start/Pause/Block/Complete/Review/Close)
- Project-level productivity analytics
- Role-gated task-control and MOM actions, plus new notification types (including a daily scheduled sweep for ETA-approaching/overdue tasks and action items due soon)

Everything below assumes you're deploying the existing Render (backend) + Vercel (frontend) + Neon (database) setup.

## 1. Backend — install new dependencies

Two new packages were added to `backend/package.json`:

- `@nestjs/schedule` (runtime) — powers the daily notification sweep (ETA approaching / overdue / action items due soon)
- `jest`, `ts-jest`, `@types/jest` (dev) — test runner for the new unit tests

```bash
cd backend
npm install
```

Render will do this automatically on the next deploy since it runs `npm install` as part of the build step.

## 2. Database — run the Prisma migration

This feature batch changes the schema significantly:

- **Removed** `TaskHistory` model — replaced by `TaskActivity` (immutable event log)
- **Added** `TaskEventType`, `MeetingType`, `ActionItemStatus` enums
- **Added** `assignedAt`, `startedAt`, `isPaused`, `isBlocked`, `blockedReason` to `Task`; added `CLOSED` to `TaskStatus`
- **Added** `Meeting`, `MeetingParticipant`, `MeetingActionItem` models
- **Added** `actionItemId` to `Comment` (so comments can belong to an action item, not just a task/bug)
- **Added** new `NotificationType` values and `meetingId`/`actionItemId` to `Notification`

Generate and apply the migration:

```bash
cd backend
npx prisma migrate dev --name meeting_mom_and_activity_timeline
```

For the Neon production database, once you're happy with the migration locally, deploy it the same way you have for prior migrations in this project (via `prisma migrate deploy` in your Render build/release step, or however your current pipeline applies migrations).

**Data note:** any existing `TaskHistory` rows are not migrated forward — the old model is dropped. Historical task changes recorded before this deploy won't show up in the new Activity Timeline. Tasks that don't have a recorded `startedAt` (i.e., everything created before this deploy) will show "Historical tracking unavailable" in the time-tracking card instead of fabricated numbers — this is expected and by design.

## 3. Environment variables

No new environment variables are required. The scheduled notification sweep runs in-process via `@nestjs/schedule`'s cron support — no external scheduler/cron service needed.

**Render-specific note:** the daily sweep (`SchedulerService`, runs at 8am server time) only fires if the backend process is awake at that time. If you're on Render's free tier, the service spins down after inactivity and won't wake itself up to run the cron job — the sweep will simply run whenever the next request wakes the dyno up and the clock passes 8am, or be skipped that day. This is a known limitation of free-tier hosting, not a bug. On a paid/always-on plan it behaves normally.

## 4. Running the new backend tests

```bash
cd backend
npm test
```

This runs 50 unit tests covering:

- The time-tracking math (`task-time-tracking.util.spec.ts`) — pause/block interval summing, active-working-time calculation, the "historical tracking unavailable" fallback
- The task lifecycle state machine (`task-transitions.util.spec.ts`) — every valid/invalid Start/Pause/Resume/Block/Unblock/Complete/Review/Close transition
- Task-control role gating (`tasks.service.control.spec.ts`) — assignee/reporter/manager/admin permissions, and that permission checks and the transition guard don't interfere with each other
- Meeting/MOM/action-item role gating (`meetings.service.permissions.spec.ts`) — organizer/assignee/manager permissions

Integration tests against a real database and frontend component tests were not set up in this pass — the project didn't have test infrastructure for either before this feature batch, and adding a full test database and frontend testing harness was out of scope. The unit tests above cover the highest-risk new logic (the math and the permission rules); manual QA is recommended for the UI flows below.

## 5. What to manually test

**Meetings / MOM:**
1. Go to a project → **Meetings** tab → **Schedule Meeting**. Fill in title, type, date/time, organizer, participants, description.
2. Open the meeting, fill in the MOM editor (Summary, Discussion Points, Decisions Made, Risks/Blockers, Additional Notes), **Save Minutes**.
3. Add an action item with an assignee, priority, and due date.
4. Click **Convert to Task** on an action item — confirm a task appears in the project with the same title/assignee/priority/due date, and the action item shows "Task #... — <status>" with a link back to it.
5. Comment on an action item.

**Task lifecycle:**
1. Open a task, use **Start Task** (should require an assignee first).
2. Try Pause → Resume, Block → Unblock, Complete, Send for Review → Complete Review, Close — confirm invalid actions aren't offered (e.g. you can't Close a task that isn't Done yet).
3. Check the **Time Tracking** card updates (Active Time, Paused, Blocked, etc.) and the **Activity Timeline** logs each action with a relative timestamp.
4. As a non-assignee/non-reporter/non-manager user, confirm task-control buttons are rejected (403) — the UI will show a toast error.

**Project analytics:**
1. On a project's Overview tab, check the new **Productivity & Time Tracking** card shows in-progress/blocked/completed/overdue counts and the averages (start delay, completion time, active working time, blocked/paused totals, ETA variance).

**Notifications:**
1. Block/unblock/complete/send-for-review a task assigned to someone else and confirm they get a notification.
2. Assign a MOM action item to someone and confirm they get a notification.
3. The ETA-approaching/overdue/action-item-due-soon notifications only fire from the daily sweep — to test these without waiting a day, you can temporarily trigger `SchedulerService.runDailyNotificationSweep()` manually (e.g. via a one-off script or by lowering the cron interval in `backend/src/modules/scheduler/scheduler.service.ts` while testing locally, then reverting).

## 6. Rollback

If you need to roll back, restoring from your Neon backup/point-in-time-recovery is the safest path since `TaskHistory` was dropped as part of this migration (a `prisma migrate` rollback would need a hand-written down-migration to recreate it, which isn't included here).
