import { Module } from '@nestjs/common';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';
import { KanbanRepository } from './kanban.repository';
import { ActivityModule } from '../activity/activity.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ActivityModule, ProjectsModule],
  controllers: [KanbanController],
  providers: [KanbanService, KanbanRepository],
  exports: [KanbanService],
})
export class KanbanModule {}
