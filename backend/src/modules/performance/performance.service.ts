import { Injectable, NotFoundException } from '@nestjs/common';
import { PerformanceRepository } from './performance.repository';
import { InterventionsRepository } from '../interventions/interventions.repository';
import { detectTaskRework, detectBugRework, ReworkEvent } from './rework.util';

type TaskRow = Awaited<ReturnType<PerformanceRepository['getTasksForUsers']>>[number];
type BugRow = Awaited<ReturnType<PerformanceRepository['getBugsForUsers']>>[number];

function isTaskEtaBreached(task: TaskRow): boolean {
  if (!task.dueDate) return false;
  if (task.completedAt) return task.completedAt.getTime() > task.dueDate.getTime();
  if (task.status === 'CANCELLED' || task.status === 'DONE') return false;
  return Date.now() > task.dueDate.getTime();
}

@Injectable()
export class PerformanceService {
  constructor(
    private readonly performanceRepository: PerformanceRepository,
    private readonly interventionsRepository: InterventionsRepository,
  ) {}

  private buildEmployeeMetrics(params: {
    userId: string;
    tasks: TaskRow[];
    bugs: BugRow[];
    reworkEvents: ReworkEvent[];
    interventionsCount: number;
  }) {
    const { userId, tasks, bugs, reworkEvents, interventionsCount } = params;

    const tasksAssigned = tasks.length;
    const tasksCompleted = tasks.filter((t) => t.status === 'DONE').length;
    const completionRate = tasksAssigned ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;
    const etaBreachedTasks = tasks.filter(isTaskEtaBreached);

    const bugsAssigned = bugs.length;
    const bugsOpen = bugs.filter((b) => !['RESOLVED', 'CLOSED', 'WONT_FIX'].includes(b.status)).length;

    return {
      userId,
      tasksAssigned,
      tasksCompleted,
      completionRate,
      etaBreaches: etaBreachedTasks.length,
      etaBreachedTasks,
      mistakesCount: bugsAssigned,
      bugsOpen,
      bugs,
      tasks,
      reworkCount: reworkEvents.length,
      reworkEvents,
      interventionsCount,
    };
  }

  private async computeForEmployees(userIds: string[]) {
    if (!userIds.length) {
      return new Map<string, ReturnType<PerformanceService['buildEmployeeMetrics']>>();
    }

    const [tasks, bugs, interventionCounts] = await Promise.all([
      this.performanceRepository.getTasksForUsers(userIds),
      this.performanceRepository.getBugsForUsers(userIds),
      this.interventionsRepository.countByEmployeeIds(userIds),
    ]);

    const taskIds = tasks.map((t) => t.id);
    const bugIds = bugs.map((b) => b.id);
    const [taskHistory, bugHistory] = await Promise.all([
      this.performanceRepository.getTaskStatusHistory(taskIds),
      this.performanceRepository.getBugStatusHistory(bugIds),
    ]);

    const taskTitleById = Object.fromEntries(tasks.map((t) => [t.id, t.title]));
    const bugTitleById = Object.fromEntries(bugs.map((b) => [b.id, b.title]));
    const taskAssigneeById = Object.fromEntries(tasks.map((t) => [t.id, t.assigneeId]));
    const bugAssigneeById = Object.fromEntries(bugs.map((b) => [b.id, b.assigneeId]));

    const allTaskRework = detectTaskRework(taskHistory as any, taskTitleById);
    const allBugRework = detectBugRework(bugHistory as any, bugTitleById);

    const result = new Map<string, ReturnType<PerformanceService['buildEmployeeMetrics']>>();
    for (const userId of userIds) {
      const userTasks = tasks.filter((t) => t.assigneeId === userId);
      const userBugs = bugs.filter((b) => b.assigneeId === userId);
      // Attribute rework to whoever the task/bug is assigned to (the employee
      // whose work needed redoing), not to whoever recorded the status change.
      const userReworkEvents = [
        ...allTaskRework.filter((e) => taskAssigneeById[e.id] === userId),
        ...allBugRework.filter((e) => bugAssigneeById[e.id] === userId),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      result.set(
        userId,
        this.buildEmployeeMetrics({
          userId,
          tasks: userTasks,
          bugs: userBugs,
          reworkEvents: userReworkEvents,
          interventionsCount: interventionCounts[userId] ?? 0,
        }),
      );
    }
    return result;
  }

  async getSummary() {
    const users = await this.performanceRepository.getActiveUsers();
    const metrics = await this.computeForEmployees(users.map((u) => u.id));

    return users.map((user) => {
      const m = metrics.get(user.id)!;
      return {
        user,
        tasksAssigned: m.tasksAssigned,
        tasksCompleted: m.tasksCompleted,
        completionRate: m.completionRate,
        etaBreaches: m.etaBreaches,
        mistakesCount: m.mistakesCount,
        bugsOpen: m.bugsOpen,
        reworkCount: m.reworkCount,
        interventionsCount: m.interventionsCount,
      };
    });
  }

  async getDetail(userId: string) {
    const user = await this.performanceRepository.getUserById(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const metrics = await this.computeForEmployees([userId]);
    const m = metrics.get(userId)!;
    const interventions = await this.interventionsRepository.findByEmployeeId(userId);

    return {
      user,
      stats: {
        tasksAssigned: m.tasksAssigned,
        tasksCompleted: m.tasksCompleted,
        completionRate: m.completionRate,
        etaBreaches: m.etaBreaches,
        mistakesCount: m.mistakesCount,
        bugsOpen: m.bugsOpen,
        reworkCount: m.reworkCount,
        interventionsCount: m.interventionsCount,
      },
      tasks: m.tasks,
      bugs: m.bugs,
      etaBreachedTasks: m.etaBreachedTasks,
      reworkEvents: m.reworkEvents,
      interventions,
    };
  }
}
