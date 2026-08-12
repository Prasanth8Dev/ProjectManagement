import { Module } from '@nestjs/common';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';
import { SubtasksRepository } from './subtasks.repository';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [SubtasksController],
  providers: [SubtasksService, SubtasksRepository],
  exports: [SubtasksService],
})
export class SubtasksModule {}
