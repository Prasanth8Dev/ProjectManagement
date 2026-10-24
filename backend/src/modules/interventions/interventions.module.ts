import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InterventionsController } from './interventions.controller';
import { InterventionsService } from './interventions.service';
import { InterventionsRepository } from './interventions.repository';
import { TasksModule } from '../tasks/tasks.module';
import { BugsModule } from '../bugs/bugs.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, TasksModule, BugsModule, NotificationsModule],
  controllers: [InterventionsController],
  providers: [InterventionsService, InterventionsRepository],
  exports: [InterventionsService, InterventionsRepository],
})
export class InterventionsModule {}
