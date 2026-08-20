import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BugsController } from './bugs.controller';
import { BugsService } from './bugs.service';
import { BugsRepository } from './bugs.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [PrismaModule, NotificationsModule, TasksModule],
  controllers: [BugsController],
  providers: [BugsService, BugsRepository],
  exports: [BugsService],
})
export class BugsModule {}
