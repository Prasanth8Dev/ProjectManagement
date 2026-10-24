import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repository';
import { TasksModule } from '../tasks/tasks.module';
import { BugsModule } from '../bugs/bugs.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TasksModule, BugsModule, MeetingsModule, NotificationsModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsService],
})
export class CommentsModule {}
