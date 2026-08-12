import { Module } from '@nestjs/common';
import { ChecklistsController } from './checklists.controller';
import { ChecklistsService } from './checklists.service';
import { ChecklistsRepository } from './checklists.repository';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [ChecklistsController],
  providers: [ChecklistsService, ChecklistsRepository],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}
