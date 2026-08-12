import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { SubtasksModule } from './modules/subtasks/subtasks.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { DailyUpdatesModule } from './modules/daily-updates/daily-updates.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { LabelsModule } from './modules/labels/labels.module';
import { KanbanModule } from './modules/kanban/kanban.module';
import { SearchModule } from './modules/search/search.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ActivityModule } from './modules/activity/activity.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { BugsModule } from './modules/bugs/bugs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    TeamsModule,
    ProjectsModule,
    TasksModule,
    SubtasksModule,
    ChecklistsModule,
    CommentsModule,
    AttachmentsModule,
    DailyUpdatesModule,
    MilestonesModule,
    LabelsModule,
    KanbanModule,
    SearchModule,
    ReportsModule,
    ActivityModule,
    DashboardModule,
    AuthModule,
    BugsModule,
  ],
})
export class AppModule {}
