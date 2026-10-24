import { Injectable, BadRequestException } from '@nestjs/common';
import { InterventionsRepository } from './interventions.repository';
import { TasksService } from '../tasks/tasks.service';
import { BugsService } from '../bugs/bugs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateInterventionDto } from './dto/intervention.dto';

@Injectable()
export class InterventionsService {
  constructor(
    private readonly interventionsRepository: InterventionsRepository,
    private readonly tasksService: TasksService,
    private readonly bugsService: BugsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createForTask(taskId: string, dto: CreateInterventionDto, actorUserId?: string) {
    const task = await this.tasksService.findById(taskId);
    const managerId = actorUserId;
    if (!managerId) {
      throw new BadRequestException('actorUserId is required to log an intervention.');
    }

    const intervention = await this.interventionsRepository.createForTask({
      taskId,
      employeeId: dto.employeeId,
      managerId,
      note: dto.note,
    });

    if (dto.employeeId !== managerId) {
      await this.notificationsService.notify({
        userId: dto.employeeId,
        actorId: managerId,
        type: 'INTERVENTION_LOGGED',
        title: `A note was logged about your work on "${task.title}"`,
        link: `/tasks/${taskId}`,
        taskId,
      });
    }

    return intervention;
  }

  async createForBug(bugId: string, dto: CreateInterventionDto, actorUserId?: string) {
    const bug = await this.bugsService.findById(bugId);
    const managerId = actorUserId;
    if (!managerId) {
      throw new BadRequestException('actorUserId is required to log an intervention.');
    }

    const intervention = await this.interventionsRepository.createForBug({
      bugId,
      employeeId: dto.employeeId,
      managerId,
      note: dto.note,
    });

    if (dto.employeeId !== managerId) {
      await this.notificationsService.notify({
        userId: dto.employeeId,
        actorId: managerId,
        type: 'INTERVENTION_LOGGED',
        title: `A note was logged about your work on bug "${bug.title}"`,
        link: `/bugs/${bugId}`,
        bugId,
      });
    }

    return intervention;
  }

  async findByTaskId(taskId: string) {
    await this.tasksService.findById(taskId);
    return this.interventionsRepository.findByTaskId(taskId);
  }

  async findByBugId(bugId: string) {
    await this.bugsService.findById(bugId);
    return this.interventionsRepository.findByBugId(bugId);
  }

  async findByEmployeeId(employeeId: string) {
    return this.interventionsRepository.findByEmployeeId(employeeId);
  }
}
